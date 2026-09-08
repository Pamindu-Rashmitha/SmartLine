package com.smartline.loan.service;

import com.smartline.loan.dto.request.CreditAssessmentRequest;
import com.smartline.loan.dto.request.CreditDecisionRequest;
import com.smartline.loan.dto.response.ApplicationDetailResponse;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.dto.response.CreditAssessmentResponse;
import com.smartline.loan.dto.response.PageResponse;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.ApplicationStatusHistory;
import com.smartline.loan.entity.CreditAssessment;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.entity.enums.CreditDecision;
import com.smartline.loan.entity.enums.CreditRecommendation;
import com.smartline.loan.entity.enums.RiskLevel;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.ApplicationStatusHistoryRepository;
import com.smartline.loan.repository.CreditAssessmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CreditAssessmentService {

    public static final BigDecimal SENIOR_APPROVAL_THRESHOLD = new BigDecimal("500000.00");

    private final CreditAssessmentRepository creditAssessmentRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final ApplicationService applicationService;

    public CreditAssessmentService(CreditAssessmentRepository creditAssessmentRepository,
                                   ApplicationRepository applicationRepository,
                                   ApplicationStatusHistoryRepository statusHistoryRepository,
                                   ApplicationService applicationService) {
        this.creditAssessmentRepository = creditAssessmentRepository;
        this.applicationRepository = applicationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.applicationService = applicationService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getCreditQueue(Pageable pageable) {
        List<ApplicationStatus> statuses = Arrays.asList(
                ApplicationStatus.VERIFIED,
                ApplicationStatus.UNDER_CREDIT_ASSESSMENT,
                ApplicationStatus.FIELD_INSPECTION_COMPLETED
        );

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
    public ApplicationDetailResponse startAssessment(Long applicationId, User creditManager) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (application.getStatus() != ApplicationStatus.VERIFIED &&
            application.getStatus() != ApplicationStatus.UNDER_CREDIT_ASSESSMENT &&
            application.getStatus() != ApplicationStatus.FIELD_INSPECTION_COMPLETED) {
            throw new BadRequestException("Application cannot enter credit assessment from status: " + application.getStatus());
        }

        ApplicationStatus previousStatus = application.getStatus();
        if (previousStatus != ApplicationStatus.UNDER_CREDIT_ASSESSMENT) {
            application.setStatus(ApplicationStatus.UNDER_CREDIT_ASSESSMENT);
            Application updated = applicationRepository.save(application);

            ApplicationStatusHistory history = new ApplicationStatusHistory(
                    updated,
                    previousStatus,
                    ApplicationStatus.UNDER_CREDIT_ASSESSMENT,
                    creditManager,
                    "Credit assessment initiated by Credit Manager: " + creditManager.getFullName()
            );
            statusHistoryRepository.save(history);
        }

        return applicationService.getApplicationDetail(application.getId(), creditManager);
    }

    @Transactional
    public ApplicationDetailResponse requestFieldInspection(Long applicationId, String remarks, User creditManager) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (application.getType() != ApplicationType.VEHICLE_LEASE) {
            throw new BadRequestException("Field inspections can only be requested for Vehicle Leasing applications");
        }

        if (application.getStatus() != ApplicationStatus.UNDER_CREDIT_ASSESSMENT &&
            application.getStatus() != ApplicationStatus.VERIFIED) {
            throw new BadRequestException("Cannot request inspection for application in status: " + application.getStatus());
        }

        ApplicationStatus previousStatus = application.getStatus();
        application.setStatus(ApplicationStatus.PENDING_FIELD_INSPECTION);
        Application updated = applicationRepository.save(application);

        String note = remarks != null && !remarks.isBlank() ? remarks : "Vehicle inspection requested by Credit Manager";
        ApplicationStatusHistory history = new ApplicationStatusHistory(
                updated,
                previousStatus,
                ApplicationStatus.PENDING_FIELD_INSPECTION,
                creditManager,
                note
        );
        statusHistoryRepository.save(history);

        return applicationService.getApplicationDetail(updated.getId(), creditManager);
    }

    @Transactional
    public CreditAssessmentResponse saveAssessment(Long applicationId, CreditAssessmentRequest request, User creditManager) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        CreditAssessment assessment = creditAssessmentRepository.findByApplicationId(applicationId)
                .orElse(new CreditAssessment());

        assessment.setApplication(application);
        assessment.setAssessedBy(creditManager);
        assessment.setAssessmentDate(LocalDateTime.now());
        assessment.setIncomeVerified(Boolean.TRUE.equals(request.getIncomeVerified()));
        assessment.setIncomeRemarks(request.getIncomeRemarks());
        assessment.setEmploymentVerified(Boolean.TRUE.equals(request.getEmploymentVerified()));
        assessment.setEmploymentRemarks(request.getEmploymentRemarks());
        assessment.setDebtToIncomeNotes(request.getDebtToIncomeNotes());
        assessment.setCreditHistoryNotes(request.getCreditHistoryNotes());
        assessment.setCollateralNotes(request.getCollateralNotes());
        assessment.setOverallRiskLevel(request.getOverallRiskLevel() != null ? request.getOverallRiskLevel() : RiskLevel.MEDIUM);
        assessment.setRecommendation(request.getRecommendation() != null ? request.getRecommendation() : CreditRecommendation.APPROVE);

        CreditAssessment saved = creditAssessmentRepository.save(assessment);

        // Ensure application state is UNDER_CREDIT_ASSESSMENT if it was VERIFIED
        if (application.getStatus() == ApplicationStatus.VERIFIED) {
            application.setStatus(ApplicationStatus.UNDER_CREDIT_ASSESSMENT);
            applicationRepository.save(application);
        }

        return mapToResponse(saved);
    }

    @Transactional
    public ApplicationDetailResponse recordDecision(Long applicationId, CreditDecisionRequest request, User creditManager) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (application.getStatus() != ApplicationStatus.UNDER_CREDIT_ASSESSMENT &&
            application.getStatus() != ApplicationStatus.FIELD_INSPECTION_COMPLETED &&
            application.getStatus() != ApplicationStatus.VERIFIED) {
            throw new BadRequestException("Credit decision cannot be recorded for status: " + application.getStatus());
        }

        CreditAssessment assessment = creditAssessmentRepository.findByApplicationId(applicationId)
                .orElseGet(() -> {
                    CreditAssessment ca = new CreditAssessment();
                    ca.setApplication(application);
                    ca.setAssessedBy(creditManager);
                    ca.setAssessmentDate(LocalDateTime.now());
                    ca.setOverallRiskLevel(RiskLevel.MEDIUM);
                    ca.setRecommendation(CreditRecommendation.APPROVE);
                    return ca;
                });

        ApplicationStatus previousStatus = application.getStatus();
        ApplicationStatus newStatus;
        String historyRemarks;

        if (Boolean.FALSE.equals(request.getApproved())) {
            newStatus = ApplicationStatus.REJECTED;
            String reason = request.getRemarks() != null && !request.getRemarks().isBlank() ?
                    request.getRemarks() : "Application rejected by Credit Manager";
            application.setRejectionReason(reason);
            application.setDecidedBy(creditManager);
            application.setDecidedAt(LocalDateTime.now());

            assessment.setDecision(CreditDecision.REJECTED);
            assessment.setDecisionReason(reason);
            assessment.setDecidedBy(creditManager);
            assessment.setDecidedAt(LocalDateTime.now());
            historyRemarks = "Application rejected: " + reason;
        } else {
            // Check if approval exceeds Senior threshold or manual referral requested
            boolean isHighValue = application.getRequestedAmount() != null &&
                    application.getRequestedAmount().compareTo(SENIOR_APPROVAL_THRESHOLD) > 0;
            boolean isManualReferral = Boolean.TRUE.equals(request.getReferToSenior());

            if (isHighValue || isManualReferral) {
                newStatus = ApplicationStatus.PENDING_SENIOR_APPROVAL;
                assessment.setRecommendation(CreditRecommendation.REFER_TO_SENIOR);
                String reason = isHighValue ?
                        "Auto-routed to Senior Manager: Amount exceeds LKR " + SENIOR_APPROVAL_THRESHOLD :
                        "Manually referred to Senior Manager for executive sanction";
                if (request.getRemarks() != null && !request.getRemarks().isBlank()) {
                    reason += " | Notes: " + request.getRemarks();
                }
                historyRemarks = reason;
            } else {
                newStatus = ApplicationStatus.APPROVED;
                application.setDecidedBy(creditManager);
                application.setDecidedAt(LocalDateTime.now());
                application.setRejectionReason(null);

                assessment.setDecision(CreditDecision.APPROVED);
                assessment.setDecisionReason(request.getRemarks());
                assessment.setDecidedBy(creditManager);
                assessment.setDecidedAt(LocalDateTime.now());
                historyRemarks = "Application approved by Credit Manager: " + creditManager.getFullName();
            }
        }

        creditAssessmentRepository.save(assessment);

        application.setStatus(newStatus);
        Application updated = applicationRepository.save(application);

        ApplicationStatusHistory history = new ApplicationStatusHistory(
                updated,
                previousStatus,
                newStatus,
                creditManager,
                historyRemarks
        );
        statusHistoryRepository.save(history);

        return applicationService.getApplicationDetail(updated.getId(), creditManager);
    }

    @Transactional(readOnly = true)
    public CreditAssessmentResponse getCreditAssessment(Long applicationId) {
        CreditAssessment assessment = creditAssessmentRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("CreditAssessment", "applicationId", applicationId));
        return mapToResponse(assessment);
    }

    public CreditAssessmentResponse mapToResponse(CreditAssessment ca) {
        if (ca == null) return null;
        CreditAssessmentResponse res = new CreditAssessmentResponse();
        res.setId(ca.getId());
        res.setApplicationId(ca.getApplication().getId());
        if (ca.getAssessedBy() != null) {
            res.setAssessedById(ca.getAssessedBy().getId());
            res.setAssessedByName(ca.getAssessedBy().getFullName());
        }
        res.setAssessmentDate(ca.getAssessmentDate());
        res.setIncomeVerified(ca.getIncomeVerified());
        res.setIncomeRemarks(ca.getIncomeRemarks());
        res.setEmploymentVerified(ca.getEmploymentVerified());
        res.setEmploymentRemarks(ca.getEmploymentRemarks());
        res.setDebtToIncomeNotes(ca.getDebtToIncomeNotes());
        res.setCreditHistoryNotes(ca.getCreditHistoryNotes());
        res.setCollateralNotes(ca.getCollateralNotes());
        res.setOverallRiskLevel(ca.getOverallRiskLevel());
        res.setRecommendation(ca.getRecommendation());
        res.setDecision(ca.getDecision());
        res.setDecisionReason(ca.getDecisionReason());
        if (ca.getDecidedBy() != null) {
            res.setDecidedById(ca.getDecidedBy().getId());
            res.setDecidedByName(ca.getDecidedBy().getFullName());
        }
        res.setDecidedAt(ca.getDecidedAt());
        res.setCreatedAt(ca.getCreatedAt());
        res.setUpdatedAt(ca.getUpdatedAt());
        return res;
    }
}
