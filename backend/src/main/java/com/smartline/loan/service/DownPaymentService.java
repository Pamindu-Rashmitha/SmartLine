package com.smartline.loan.service;

import com.smartline.loan.dto.request.DownPaymentRecordRequest;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.dto.response.DownPaymentResponse;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.ApplicationStatusHistory;
import com.smartline.loan.entity.DownPayment;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.DownPaymentStatus;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ForbiddenException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.ApplicationStatusHistoryRepository;
import com.smartline.loan.repository.DownPaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DownPaymentService {

    private final DownPaymentRepository downPaymentRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;

    public DownPaymentService(DownPaymentRepository downPaymentRepository,
                              ApplicationRepository applicationRepository,
                              ApplicationStatusHistoryRepository statusHistoryRepository) {
        this.downPaymentRepository = downPaymentRepository;
        this.applicationRepository = applicationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getPendingDownPayments() {
        return applicationRepository.findByStatusInOrderByCreatedAtAsc(
                List.of(ApplicationStatus.PENDING_DOWN_PAYMENT)
        ).stream().map(ApplicationResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public DownPaymentResponse recordDownPayment(Long applicationId, DownPaymentRecordRequest request, User financeOfficer) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (application.getStatus() != ApplicationStatus.PENDING_DOWN_PAYMENT) {
            throw new BadRequestException("Down payment can only be recorded for applications in PENDING_DOWN_PAYMENT status. Current: " + application.getStatus());
        }

        DownPayment downPayment = downPaymentRepository.findByApplicationId(applicationId)
                .orElseGet(() -> {
                    DownPayment dp = new DownPayment();
                    dp.setApplication(application);
                    dp.setRequiredAmount(application.getRequestedAmount());
                    return dp;
                });

        downPayment.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : downPayment.getRequiredAmount());
        downPayment.setPaymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now());
        downPayment.setPaymentMethod(request.getPaymentMethod());
        downPayment.setReferenceNumber(request.getReferenceNumber());
        downPayment.setStatus(request.getStatus() != null ? request.getStatus() : DownPaymentStatus.PAID);
        downPayment.setRecordedBy(financeOfficer);
        downPayment.setRemarks(request.getRemarks());

        DownPayment saved = downPaymentRepository.save(downPayment);

        ApplicationStatus previousStatus = application.getStatus();
        application.setStatus(ApplicationStatus.PENDING_DISBURSAL);
        applicationRepository.save(application);

        String remarks = "Down-payment recorded by " + financeOfficer.getFullName() +
                ": Status=" + saved.getStatus() +
                ", Amount=LKR " + saved.getPaidAmount() +
                ", Ref=" + (saved.getReferenceNumber() != null ? saved.getReferenceNumber() : "N/A");

        statusHistoryRepository.save(new ApplicationStatusHistory(
                application,
                previousStatus,
                ApplicationStatus.PENDING_DISBURSAL,
                financeOfficer,
                remarks
        ));

        return DownPaymentResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public DownPaymentResponse getDownPayment(Long applicationId, User currentUser) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (currentUser.getRole() != null && currentUser.getRole().name().equals("APPLICANT")) {
            if (application.getApplicant() == null ||
                !application.getApplicant().getUser().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You do not have permission to view this down payment");
            }
        }

        DownPayment downPayment = downPaymentRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Down payment for application", "applicationId", applicationId));

        return DownPaymentResponse.fromEntity(downPayment);
    }
}
