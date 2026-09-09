package com.smartline.loan.service;

import com.smartline.loan.dto.request.AuthorizationDecisionRequest;
import com.smartline.loan.dto.response.ApplicationDetailResponse;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.dto.response.PageResponse;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.ApplicationStatusHistory;
import com.smartline.loan.entity.CreditAssessment;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.CreditDecision;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.ApplicationStatusHistoryRepository;
import com.smartline.loan.repository.CreditAssessmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.enums.NotificationType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SeniorAuthorizationService {

    private final ApplicationRepository applicationRepository;
    private final CreditAssessmentRepository creditAssessmentRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final ApplicationService applicationService;
    private final NotificationService notificationService;

    public SeniorAuthorizationService(ApplicationRepository applicationRepository,
                                      CreditAssessmentRepository creditAssessmentRepository,
                                      ApplicationStatusHistoryRepository statusHistoryRepository,
                                      ApplicationService applicationService,
                                      NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.creditAssessmentRepository = creditAssessmentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.applicationService = applicationService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getAuthorizationQueue(Pageable pageable) {
        List<ApplicationStatus> statuses = Collections.singletonList(ApplicationStatus.PENDING_SENIOR_APPROVAL);
        Page<Application> page = applicationRepository.findByStatusInOrderByCreatedAtDesc(statuses, pageable);

        List<ApplicationResponse> content = page.getContent().stream()
                .map(applicationService::mapToSummaryResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Transactional
    public ApplicationDetailResponse recordDecision(Long applicationId, AuthorizationDecisionRequest request, User seniorManager) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (application.getStatus() != ApplicationStatus.PENDING_SENIOR_APPROVAL) {
            throw new BadRequestException("Application is not pending senior authorization. Current status: " + application.getStatus());
        }

        ApplicationStatus previousStatus = application.getStatus();
        ApplicationStatus newStatus;
        String historyNote;

        CreditAssessment assessment = creditAssessmentRepository.findByApplicationId(applicationId).orElse(null);

        if (Boolean.TRUE.equals(request.getApproved())) {
            newStatus = ApplicationStatus.APPROVED;
            application.setRejectionReason(null);
            application.setDecidedBy(seniorManager);
            application.setDecidedAt(LocalDateTime.now());

            if (assessment != null) {
                assessment.setDecision(CreditDecision.APPROVED);
                assessment.setDecisionReason(request.getRemarks() != null && !request.getRemarks().isBlank() ?
                        request.getRemarks() : "Executive authorization granted by Senior Manager");
                assessment.setDecidedBy(seniorManager);
                assessment.setDecidedAt(LocalDateTime.now());
                creditAssessmentRepository.save(assessment);
            }

            historyNote = "High-value facility authorized by Senior Manager: " + seniorManager.getFullName() +
                    (request.getRemarks() != null && !request.getRemarks().isBlank() ? " | Notes: " + request.getRemarks() : "");
        } else {
            newStatus = ApplicationStatus.REJECTED;
            String reason = request.getRemarks() != null && !request.getRemarks().isBlank() ?
                    request.getRemarks() : "Sanction declined by Senior Manager";
            application.setRejectionReason(reason);
            application.setDecidedBy(seniorManager);
            application.setDecidedAt(LocalDateTime.now());

            if (assessment != null) {
                assessment.setDecision(CreditDecision.REJECTED);
                assessment.setDecisionReason(reason);
                assessment.setDecidedBy(seniorManager);
                assessment.setDecidedAt(LocalDateTime.now());
                creditAssessmentRepository.save(assessment);
            }

            historyNote = "Application declined by Senior Manager: " + seniorManager.getFullName() + " | Reason: " + reason;
        }

        application.setStatus(newStatus);
        Application updated = applicationRepository.save(application);

        ApplicationStatusHistory history = new ApplicationStatusHistory(
                updated,
                previousStatus,
                newStatus,
                seniorManager,
                historyNote
        );
        statusHistoryRepository.save(history);

        if (newStatus == ApplicationStatus.APPROVED) {
            notificationService.sendToRole(Role.LEGAL_OFFICER, "Agreement Preparation Required",
                    "Application #" + updated.getApplicationNumber() + " received senior sanction. Ready for agreement preparation.",
                    NotificationType.ACTION_REQUIRED, "APPLICATION", updated.getId());
            if (updated.getApplicant() != null && updated.getApplicant().getUser() != null) {
                notificationService.sendToUser(updated.getApplicant().getUser(), "Senior Sanction Granted!",
                        "Congratulations! Executive approval granted for your application #" + updated.getApplicationNumber() + ".",
                        NotificationType.STATUS_UPDATE, "APPLICATION", updated.getId());
            }
        } else if (newStatus == ApplicationStatus.REJECTED) {
            if (updated.getApplicant() != null && updated.getApplicant().getUser() != null) {
                notificationService.sendToUser(updated.getApplicant().getUser(), "Application Declined",
                        "Your application #" + updated.getApplicationNumber() + " was not approved during executive review.",
                        NotificationType.WARNING, "APPLICATION", updated.getId());
            }
        }

        return applicationService.getApplicationDetail(updated.getId(), seniorManager);
    }
}
