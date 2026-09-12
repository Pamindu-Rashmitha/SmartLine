package com.smartline.loan.service;

import com.smartline.loan.dto.request.AgreementCreateRequest;
import com.smartline.loan.dto.response.AgreementResponse;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.entity.*;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.enums.AgreementStatus;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.entity.enums.DownPaymentStatus;
import com.smartline.loan.entity.enums.NotificationType;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ForbiddenException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.AgreementRepository;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.ApplicationStatusHistoryRepository;
import com.smartline.loan.repository.DownPaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgreementService {

    private final AgreementRepository agreementRepository;
    private final ApplicationRepository applicationRepository;
    private final DownPaymentRepository downPaymentRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final NotificationService notificationService;

    public AgreementService(AgreementRepository agreementRepository,
                            ApplicationRepository applicationRepository,
                            DownPaymentRepository downPaymentRepository,
                            ApplicationStatusHistoryRepository statusHistoryRepository,
                            NotificationService notificationService) {
        this.agreementRepository = agreementRepository;
        this.applicationRepository = applicationRepository;
        this.downPaymentRepository = downPaymentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getLegalQueue() {
        return applicationRepository.findByStatusInOrderByCreatedAtAsc(
                List.of(ApplicationStatus.APPROVED, ApplicationStatus.AGREEMENT_PENDING, ApplicationStatus.AGREEMENT_VERIFIED)
        ).stream().map(ApplicationResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public AgreementResponse prepareAgreement(Long applicationId, AgreementCreateRequest request, User legalOfficer) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (application.getStatus() != ApplicationStatus.APPROVED &&
            application.getStatus() != ApplicationStatus.AGREEMENT_PENDING) {
            throw new BadRequestException("Agreement can only be prepared for APPROVED or AGREEMENT_PENDING applications. Current status: " + application.getStatus());
        }

        Agreement agreement = agreementRepository.findByApplicationId(applicationId)
                .orElseGet(() -> {
                    Agreement ag = new Agreement();
                    ag.setApplication(application);
                    ag.setAgreementNumber(generateAgreementNumber(application.getId()));
                    return ag;
                });

        agreement.setPreparedBy(legalOfficer);
        agreement.setPreparedDate(LocalDateTime.now());
        agreement.setFacilityType(application.getType());
        agreement.setPrincipalAmount(application.getRequestedAmount());

        BigDecimal interestRate = BigDecimal.valueOf(14.00);
        Integer tenureMonths = 12;
        BigDecimal installmentAmount = BigDecimal.ZERO;
        BigDecimal totalPayable = application.getRequestedAmount();
        BigDecimal downPayment = BigDecimal.ZERO;

        if (application.getType() == ApplicationType.LOAN && application.getLoanDetail() != null) {
            LoanDetail ld = application.getLoanDetail();
            interestRate = ld.getProposedInterestRate() != null ? ld.getProposedInterestRate() : interestRate;
            tenureMonths = ld.getRequestedTenure() != null ? ld.getRequestedTenure() : tenureMonths;
            installmentAmount = ld.getCalculatedEmi() != null ? ld.getCalculatedEmi() : installmentAmount;
            totalPayable = ld.getTotalRepayable() != null ? ld.getTotalRepayable() : totalPayable;
        } else if (application.getType() == ApplicationType.VEHICLE_LEASE && application.getVehicleLeaseDetail() != null) {
            VehicleLeaseDetail vld = application.getVehicleLeaseDetail();
            interestRate = vld.getProposedInterestRate() != null ? vld.getProposedInterestRate() : interestRate;
            tenureMonths = vld.getRequestedTenure() != null ? vld.getRequestedTenure() : tenureMonths;
            installmentAmount = vld.getCalculatedMonthlyInstallment() != null ? vld.getCalculatedMonthlyInstallment() : installmentAmount;
            totalPayable = vld.getTotalLeasePayable() != null ? vld.getTotalLeasePayable() : totalPayable;
            downPayment = vld.getDownPayment() != null ? vld.getDownPayment() : downPayment;
        }

        if (request != null && request.getDownPaymentRequired() != null) {
            downPayment = request.getDownPaymentRequired();
        }

        agreement.setInterestRate(interestRate);
        agreement.setTenureMonths(tenureMonths);
        agreement.setInstallmentAmount(installmentAmount);
        agreement.setTotalPayable(totalPayable);
        agreement.setDownPaymentRequired(downPayment);

        if (request != null) {
            if (request.getTermsAndConditions() != null && !request.getTermsAndConditions().isBlank()) {
                agreement.setTermsAndConditions(request.getTermsAndConditions());
            }
            if (request.getSpecialConditions() != null && !request.getSpecialConditions().isBlank()) {
                agreement.setSpecialConditions(request.getSpecialConditions());
            }
        }

        agreement.setStatus(AgreementStatus.DRAFT);
        Agreement saved = agreementRepository.save(agreement);

        // Transition application to AGREEMENT_PENDING if currently APPROVED
        if (application.getStatus() == ApplicationStatus.APPROVED) {
            ApplicationStatus prev = application.getStatus();
            application.setStatus(ApplicationStatus.AGREEMENT_PENDING);
            applicationRepository.save(application);

            statusHistoryRepository.save(new ApplicationStatusHistory(
                    application,
                    prev,
                    ApplicationStatus.AGREEMENT_PENDING,
                    legalOfficer,
                    "Draft agreement prepared: " + saved.getAgreementNumber()
            ));
        }

        return AgreementResponse.fromEntity(saved);
    }

    @Transactional
    public AgreementResponse verifyAgreement(Long applicationId, User legalOfficer) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        Agreement agreement = agreementRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new BadRequestException("No agreement found for application. Please prepare the agreement first."));

        if (application.getStatus() != ApplicationStatus.AGREEMENT_PENDING &&
            application.getStatus() != ApplicationStatus.APPROVED) {
            throw new BadRequestException("Agreement can only be verified when in AGREEMENT_PENDING status. Current status: " + application.getStatus());
        }

        agreement.setStatus(AgreementStatus.VERIFIED);
        agreement.setVerifiedBy(legalOfficer);
        agreement.setVerifiedDate(LocalDateTime.now());
        Agreement savedAgreement = agreementRepository.save(agreement);

        ApplicationStatus previousStatus = application.getStatus();
        ApplicationStatus nextStatus;
        String remarks;

        BigDecimal downPaymentReq = savedAgreement.getDownPaymentRequired() != null ?
                savedAgreement.getDownPaymentRequired() : BigDecimal.ZERO;

        DownPayment downPayment = downPaymentRepository.findByApplicationId(applicationId)
                .orElseGet(() -> {
                    DownPayment dp = new DownPayment();
                    dp.setApplication(application);
                    return dp;
                });

        downPayment.setRequiredAmount(downPaymentReq);

        if (downPaymentReq.compareTo(BigDecimal.ZERO) > 0) {
            downPayment.setStatus(DownPaymentStatus.PENDING);
            nextStatus = ApplicationStatus.PENDING_DOWN_PAYMENT;
            remarks = "Agreement verified and sealed by " + legalOfficer.getFullName() +
                    ". Awaiting required down payment: LKR " + downPaymentReq;
        } else {
            downPayment.setStatus(DownPaymentStatus.WAIVED);
            downPayment.setRemarks("Down payment not required / waived");
            nextStatus = ApplicationStatus.PENDING_DISBURSAL;
            remarks = "Agreement verified and sealed by " + legalOfficer.getFullName() +
                    ". No down payment required, routed to Disbursal Desk";
        }

        downPaymentRepository.save(downPayment);

        application.setStatus(nextStatus);
        applicationRepository.save(application);

        statusHistoryRepository.save(new ApplicationStatusHistory(
                application,
                previousStatus,
                nextStatus,
                legalOfficer,
                remarks
        ));

        if (nextStatus == ApplicationStatus.PENDING_DOWN_PAYMENT) {
            if (application.getApplicant() != null && application.getApplicant().getUser() != null) {
                notificationService.sendToUser(application.getApplicant().getUser(), "Agreement Ready — Down Payment Required",
                        "Your loan agreement has been sealed. Please submit your down payment of LKR " + downPaymentReq + " to proceed.",
                        NotificationType.ACTION_REQUIRED, "APPLICATION", application.getId());
            }
        } else if (nextStatus == ApplicationStatus.PENDING_DISBURSAL) {
            notificationService.sendToRole(Role.FINANCE_OFFICER, "Disbursal Required",
                    "Agreement sealed for application #" + application.getApplicationNumber() + ". Ready for fund disbursal.",
                    NotificationType.ACTION_REQUIRED, "APPLICATION", application.getId());
            if (application.getApplicant() != null && application.getApplicant().getUser() != null) {
                notificationService.sendToUser(application.getApplicant().getUser(), "Agreement Finalized",
                        "Your agreement #" + savedAgreement.getAgreementNumber() + " is sealed and routed for fund disbursal.",
                        NotificationType.STATUS_UPDATE, "APPLICATION", application.getId());
            }
        }

        return AgreementResponse.fromEntity(savedAgreement);
    }

    @Transactional(readOnly = true)
    public AgreementResponse getAgreementByApplicationId(Long applicationId, User currentUser) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        // Ownership check for applicants
        if (currentUser.getRole() != null && currentUser.getRole().name().equals("APPLICANT")) {
            if (application.getApplicant() == null ||
                !application.getApplicant().getUser().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You do not have permission to view this agreement");
            }
        }

        Agreement agreement = agreementRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement for application", "applicationId", applicationId));

        return AgreementResponse.fromEntity(agreement);
    }

    @Transactional(readOnly = true)
    public Agreement getAgreementById(Long agreementId, User currentUser) {
        Agreement agreement = agreementRepository.findById(agreementId)
                .orElseGet(() -> agreementRepository.findByApplicationId(agreementId)
                        .orElseThrow(() -> new ResourceNotFoundException("Agreement", "id", agreementId)));

        if (currentUser.getRole() != null && currentUser.getRole().name().equals("APPLICANT")) {
            if (agreement.getApplication().getApplicant() == null ||
                !agreement.getApplication().getApplicant().getUser().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You do not have permission to view this agreement");
            }
        }

        return agreement;
    }

    private String generateAgreementNumber(Long id) {
        return String.format("AGR-2026-%05d", id);
    }
}
