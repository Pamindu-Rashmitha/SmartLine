package com.smartline.loan.service;

import com.smartline.loan.dto.request.DocumentVerifyRequest;
import com.smartline.loan.dto.request.VerificationDecisionRequest;
import com.smartline.loan.dto.response.ApplicationDetailResponse;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.dto.response.DocumentResponse;
import com.smartline.loan.dto.response.PageResponse;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.ApplicationStatusHistory;
import com.smartline.loan.entity.Document;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.VerificationStatus;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.ApplicationStatusHistoryRepository;
import com.smartline.loan.repository.DocumentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VerificationService {

    private final ApplicationRepository applicationRepository;
    private final DocumentRepository documentRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final ApplicationService applicationService;
    private final DocumentService documentService;

    public VerificationService(ApplicationRepository applicationRepository,
                               DocumentRepository documentRepository,
                               ApplicationStatusHistoryRepository statusHistoryRepository,
                               ApplicationService applicationService,
                               DocumentService documentService) {
        this.applicationRepository = applicationRepository;
        this.documentRepository = documentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.applicationService = applicationService;
        this.documentService = documentService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getVerificationQueue(Pageable pageable) {
        List<ApplicationStatus> statuses = Arrays.asList(ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_VERIFICATION);
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
    public ApplicationDetailResponse startVerification(Long applicationId, User loanOfficer) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (application.getStatus() != ApplicationStatus.SUBMITTED &&
            application.getStatus() != ApplicationStatus.UNDER_VERIFICATION) {
            throw new BadRequestException("Cannot start verification for application in status: " + application.getStatus());
        }

        ApplicationStatus previousStatus = application.getStatus();
        application.setStatus(ApplicationStatus.UNDER_VERIFICATION);
        application.setVerifiedBy(loanOfficer);
        Application updated = applicationRepository.save(application);

        if (previousStatus != ApplicationStatus.UNDER_VERIFICATION) {
            ApplicationStatusHistory history = new ApplicationStatusHistory(
                    updated,
                    previousStatus,
                    ApplicationStatus.UNDER_VERIFICATION,
                    loanOfficer,
                    "Verification initiated by Loan Officer: " + loanOfficer.getFullName()
            );
            statusHistoryRepository.save(history);
        }

        return applicationService.getApplicationDetail(updated.getId(), loanOfficer);
    }

    @Transactional
    public DocumentResponse verifyDocument(Long documentId, DocumentVerifyRequest request, User loanOfficer) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        document.setVerificationStatus(request.getStatus());
        document.setVerifiedBy(loanOfficer);
        document.setVerifiedAt(LocalDateTime.now());
        if (request.getStatus() == VerificationStatus.REJECTED) {
            document.setRejectionReason(request.getRemarks());
        } else {
            document.setRejectionReason(null);
        }

        Document saved = documentRepository.save(document);
        return documentService.mapToResponse(saved);
    }

    @Transactional
    public ApplicationDetailResponse completeVerification(Long applicationId, VerificationDecisionRequest request, User loanOfficer) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (application.getStatus() != ApplicationStatus.UNDER_VERIFICATION &&
            application.getStatus() != ApplicationStatus.SUBMITTED) {
            throw new BadRequestException("Verification can only be completed for applications under review");
        }

        ApplicationStatus previousStatus = application.getStatus();
        ApplicationStatus newStatus;
        String remarks;

        if (Boolean.TRUE.equals(request.getApproved())) {
            newStatus = ApplicationStatus.VERIFIED;
            remarks = request.getRemarks() != null && !request.getRemarks().isBlank() ?
                    request.getRemarks() : "Application and KYC documents successfully verified";
            application.setRejectionReason(null);
        } else {
            newStatus = ApplicationStatus.REJECTED;
            remarks = request.getRemarks() != null && !request.getRemarks().isBlank() ?
                    request.getRemarks() : "Application rejected during loan officer verification";
            application.setRejectionReason(remarks);
        }

        application.setStatus(newStatus);
        application.setVerifiedBy(loanOfficer);
        application.setVerifiedAt(LocalDateTime.now());
        Application updated = applicationRepository.save(application);

        ApplicationStatusHistory history = new ApplicationStatusHistory(
                updated,
                previousStatus,
                newStatus,
                loanOfficer,
                remarks
        );
        statusHistoryRepository.save(history);

        return applicationService.getApplicationDetail(updated.getId(), loanOfficer);
    }
}
