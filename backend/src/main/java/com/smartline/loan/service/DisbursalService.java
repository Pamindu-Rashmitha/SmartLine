package com.smartline.loan.service;

import com.smartline.loan.dto.request.DisbursalRequest;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.dto.response.FacilityResponse;
import com.smartline.loan.entity.*;
import com.smartline.loan.entity.enums.AgreementStatus;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.FacilityStatus;
import com.smartline.loan.entity.enums.NotificationType;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.AgreementRepository;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.ApplicationStatusHistoryRepository;
import com.smartline.loan.repository.FacilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DisbursalService {

    private final ApplicationRepository applicationRepository;
    private final AgreementRepository agreementRepository;
    private final FacilityRepository facilityRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final NotificationService notificationService;

    public DisbursalService(ApplicationRepository applicationRepository,
                            AgreementRepository agreementRepository,
                            FacilityRepository facilityRepository,
                            ApplicationStatusHistoryRepository statusHistoryRepository,
                            NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.agreementRepository = agreementRepository;
        this.facilityRepository = facilityRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getPendingDisbursals() {
        return applicationRepository.findByStatusInOrderByCreatedAtAsc(
                List.of(ApplicationStatus.PENDING_DISBURSAL)
        ).stream().map(ApplicationResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public FacilityResponse recordDisbursal(Long applicationId, DisbursalRequest request, User financeOfficer) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (application.getStatus() != ApplicationStatus.PENDING_DISBURSAL) {
            throw new BadRequestException("Disbursal can only be executed for applications in PENDING_DISBURSAL status. Current: " + application.getStatus());
        }

        Agreement agreement = agreementRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new BadRequestException("No agreement exists for this application."));

        if (agreement.getStatus() != AgreementStatus.VERIFIED && agreement.getStatus() != AgreementStatus.SIGNED) {
            throw new BadRequestException("Agreement must be VERIFIED or SIGNED before disbursal can occur.");
        }

        Facility facility = facilityRepository.findByApplicationId(applicationId)
                .orElseGet(() -> {
                    Facility fac = new Facility();
                    fac.setApplication(application);
                    fac.setFacilityNumber(generateFacilityNumber(application.getId()));
                    return fac;
                });

        LocalDate startDate = request.getDisbursementDate() != null ? request.getDisbursementDate() : LocalDate.now();
        Integer tenure = agreement.getTenureMonths() != null ? agreement.getTenureMonths() : 12;

        facility.setType(application.getType());
        facility.setPrincipalAmount(agreement.getPrincipalAmount());
        facility.setInterestRate(agreement.getInterestRate());
        facility.setTenureMonths(tenure);
        facility.setInstallmentAmount(agreement.getInstallmentAmount());
        facility.setTotalPayable(agreement.getTotalPayable());
        facility.setTotalPaid(BigDecimal.ZERO);
        facility.setOutstandingBalance(agreement.getTotalPayable());
        facility.setStartDate(startDate);
        facility.setEndDate(startDate.plusMonths(tenure));
        facility.setStatus(FacilityStatus.ACTIVE);
        facility.setDisbursedBy(financeOfficer);
        facility.setDisbursedAt(LocalDateTime.now());
        facility.setDisbursementMethod(request.getDisbursementMethod());
        facility.setDisbursementReference(request.getDisbursementReference());

        Facility savedFacility = facilityRepository.save(facility);

        ApplicationStatus previousStatus = application.getStatus();
        application.setStatus(ApplicationStatus.DISBURSED);
        applicationRepository.save(application);

        String remarks = "Disbursal executed by Finance Officer " + financeOfficer.getFullName() +
                ": Facility activated #" + savedFacility.getFacilityNumber() +
                ", Method=" + request.getDisbursementMethod() +
                ", Ref=" + (request.getDisbursementReference() != null ? request.getDisbursementReference() : "N/A") +
                ", Outstanding=LKR " + savedFacility.getOutstandingBalance();

        statusHistoryRepository.save(new ApplicationStatusHistory(
                application,
                previousStatus,
                ApplicationStatus.DISBURSED,
                financeOfficer,
                remarks
        ));

        if (application.getApplicant() != null && application.getApplicant().getUser() != null) {
            notificationService.sendToUser(application.getApplicant().getUser(), "Funds Disbursed!",
                    "Your loan facility #" + savedFacility.getFacilityNumber() + " (LKR " + savedFacility.getPrincipalAmount() +
                    ") has been disbursed. First installment is now scheduled.",
                    NotificationType.STATUS_UPDATE, "FACILITY", savedFacility.getId());
        }

        return FacilityResponse.fromEntity(savedFacility);
    }

    private String generateFacilityNumber(Long id) {
        return String.format("FAC-2026-%05d", id);
    }
}
