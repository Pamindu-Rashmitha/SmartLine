package com.smartline.loan.service;

import com.smartline.loan.dto.request.PaymentProofRejectRequest;
import com.smartline.loan.dto.request.PaymentProofSubmitRequest;
import com.smartline.loan.dto.request.PaymentRecordRequest;
import com.smartline.loan.dto.response.PaymentProofResponse;
import com.smartline.loan.dto.response.PaymentResponse;
import com.smartline.loan.entity.*;
import com.smartline.loan.entity.enums.InstallmentStatus;
import com.smartline.loan.entity.enums.NotificationType;
import com.smartline.loan.entity.enums.PaymentProofStatus;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ForbiddenException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.InstallmentRepository;
import com.smartline.loan.repository.PaymentProofRepository;
import com.smartline.loan.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentProofService {

    private static final Logger log = LoggerFactory.getLogger(PaymentProofService.class);

    private final PaymentProofRepository paymentProofRepository;
    private final InstallmentRepository installmentRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public PaymentProofService(PaymentProofRepository paymentProofRepository,
                               InstallmentRepository installmentRepository,
                               PaymentRepository paymentRepository,
                               PaymentService paymentService,
                               FileStorageService fileStorageService,
                               NotificationService notificationService) {
        this.paymentProofRepository = paymentProofRepository;
        this.installmentRepository = installmentRepository;
        this.paymentRepository = paymentRepository;
        this.paymentService = paymentService;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    @Transactional
    public PaymentProofResponse submitProof(Long installmentId, MultipartFile file, PaymentProofSubmitRequest request, User currentUser) {
        Installment installment = installmentRepository.findById(installmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Installment", "id", installmentId));

        Facility facility = installment.getFacility();
        if (facility == null) {
            throw new BadRequestException("Installment has no associated facility.");
        }

        // Validate borrower ownership if applicant
        if (currentUser.getRole() == Role.APPLICANT) {
            User applicantUser = (facility.getApplication() != null && facility.getApplication().getApplicant() != null)
                    ? facility.getApplication().getApplicant().getUser() : null;
            if (applicantUser == null || !applicantUser.getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You do not have permission to submit payment proofs for this facility.");
            }
        }

        if (installment.getStatus() == InstallmentStatus.PAID) {
            throw new BadRequestException("Installment #" + installment.getInstallmentNumber() + " is already settled.");
        }

        BigDecimal remaining = installment.getRemainingAmount();
        BigDecimal paymentAmount = request.getAmount();
        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero.");
        }
        if (paymentAmount.compareTo(remaining) > 0) {
            throw new BadRequestException(String.format("Payment amount LKR %.2f exceeds installment remaining balance LKR %.2f",
                    paymentAmount, remaining));
        }

        // Store proof file
        FileStorageService.StorageResult storageResult = fileStorageService.storePaymentSlip(facility.getId(), file);

        PaymentProof proof = new PaymentProof();
        proof.setInstallment(installment);
        proof.setFacility(facility);
        proof.setUploadedBy(currentUser);
        proof.setSlipFileName(storageResult.getOriginalFilename());
        proof.setSlipFilePath(storageResult.getFilePath());
        proof.setSlipFileType(storageResult.getContentType());
        proof.setSlipFileSize(storageResult.getFileSize());
        proof.setAmount(paymentAmount);
        proof.setPaymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now());
        proof.setPaymentMethod(request.getPaymentMethod());
        proof.setReferenceNumber(request.getReferenceNumber());
        proof.setBorrowerRemarks(request.getRemarks());
        proof.setStatus(PaymentProofStatus.PENDING_VERIFICATION);

        PaymentProof saved = paymentProofRepository.save(proof);

        // Update installment status
        installment.setStatus(InstallmentStatus.PAYMENT_SUBMITTED);
        installmentRepository.save(installment);

        // Notify Finance Officers
        try {
            notificationService.sendToRole(
                    Role.FINANCE_OFFICER,
                    "Payment Proof Submitted",
                    "Borrower " + currentUser.getFullName() + " submitted payment slip for facility " + facility.getFacilityNumber() + " (EMI #" + installment.getInstallmentNumber() + ").",
                    NotificationType.ACTION_REQUIRED,
                    "PAYMENT_PROOF",
                    saved.getId()
            );
        } catch (Exception e) {
            log.warn("Failed to dispatch notification for payment proof: {}", e.getMessage());
        }

        return PaymentProofResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentProofResponse> getPendingProofs() {
        return paymentProofRepository.findByStatusOrderByCreatedAtDesc(PaymentProofStatus.PENDING_VERIFICATION)
                .stream()
                .map(PaymentProofResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentProofResponse> getProofsByInstallment(Long installmentId, User currentUser) {
        Installment installment = installmentRepository.findById(installmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Installment", "id", installmentId));

        validateAccess(installment.getFacility(), currentUser);

        return paymentProofRepository.findByInstallmentIdOrderByCreatedAtDesc(installmentId)
                .stream()
                .map(PaymentProofResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentProofResponse getProofById(Long proofId, User currentUser) {
        PaymentProof proof = paymentProofRepository.findById(proofId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentProof", "id", proofId));

        validateAccess(proof.getFacility(), currentUser);

        return PaymentProofResponse.fromEntity(proof);
    }

    @Transactional(readOnly = true)
    public SlipDownloadResult downloadSlip(Long proofId, User currentUser) {
        PaymentProof proof = paymentProofRepository.findById(proofId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentProof", "id", proofId));

        validateAccess(proof.getFacility(), currentUser);

        Resource resource = fileStorageService.loadFileAsResource(proof.getSlipFilePath());
        return new SlipDownloadResult(resource, proof.getSlipFileType(), proof.getSlipFileName());
    }

    @Transactional
    public PaymentProofResponse approveProof(Long proofId, PaymentRecordRequest approvalOverride, User officer) {
        PaymentProof proof = paymentProofRepository.findById(proofId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentProof", "id", proofId));

        if (proof.getStatus() != PaymentProofStatus.PENDING_VERIFICATION) {
            throw new BadRequestException("Only proofs in PENDING_VERIFICATION status can be approved. Current: " + proof.getStatus());
        }

        Installment installment = proof.getInstallment();
        if (installment == null) {
            throw new BadRequestException("Proof has no associated installment.");
        }

        // Build payment record request
        PaymentRecordRequest recordReq = new PaymentRecordRequest();
        if (approvalOverride != null && approvalOverride.getAmount() != null) {
            recordReq.setAmount(approvalOverride.getAmount());
            recordReq.setPaymentDate(approvalOverride.getPaymentDate() != null ? approvalOverride.getPaymentDate() : proof.getPaymentDate());
            recordReq.setPaymentMethod(approvalOverride.getPaymentMethod() != null ? approvalOverride.getPaymentMethod() : proof.getPaymentMethod());
            recordReq.setReferenceNumber(approvalOverride.getReferenceNumber() != null ? approvalOverride.getReferenceNumber() : proof.getReferenceNumber());
            recordReq.setRemarks(approvalOverride.getRemarks() != null ? approvalOverride.getRemarks() : ("Approved slip verification #" + proof.getId()));
        } else {
            recordReq.setAmount(proof.getAmount());
            recordReq.setPaymentDate(proof.getPaymentDate());
            recordReq.setPaymentMethod(proof.getPaymentMethod());
            recordReq.setReferenceNumber(proof.getReferenceNumber());
            recordReq.setRemarks("Verified payment slip #" + proof.getId() + (proof.getBorrowerRemarks() != null ? " - " + proof.getBorrowerRemarks() : ""));
        }

        PaymentResponse paymentResponse = paymentService.recordPayment(installment.getId(), recordReq, officer);

        Payment payment = paymentRepository.findById(paymentResponse.getId()).orElse(null);
        proof.setPayment(payment);
        proof.setStatus(PaymentProofStatus.APPROVED);
        proof.setReviewedBy(officer);
        proof.setReviewedAt(LocalDateTime.now());
        proof.setRejectionReason(null);

        PaymentProof saved = paymentProofRepository.save(proof);

        // Notify borrower
        User borrower = (installment.getFacility() != null && installment.getFacility().getApplication() != null && installment.getFacility().getApplication().getApplicant() != null)
                ? installment.getFacility().getApplication().getApplicant().getUser() : null;
        if (borrower != null) {
            try {
                notificationService.sendToUser(
                        borrower,
                        "Payment Slip Verified & Approved",
                        String.format("Your payment of LKR %.2f for installment #%d (Ref: %s) has been confirmed and credited.",
                                recordReq.getAmount(), installment.getInstallmentNumber(), recordReq.getReferenceNumber()),
                        NotificationType.STATUS_UPDATE,
                        "PAYMENT",
                        paymentResponse.getId()
                );
            } catch (Exception e) {
                log.warn("Failed to notify borrower on payment approval: {}", e.getMessage());
            }
        }

        return PaymentProofResponse.fromEntity(saved);
    }

    @Transactional
    public PaymentProofResponse rejectProof(Long proofId, PaymentProofRejectRequest rejectRequest, User officer) {
        PaymentProof proof = paymentProofRepository.findById(proofId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentProof", "id", proofId));

        if (proof.getStatus() != PaymentProofStatus.PENDING_VERIFICATION) {
            throw new BadRequestException("Only proofs in PENDING_VERIFICATION status can be rejected. Current: " + proof.getStatus());
        }

        proof.setStatus(PaymentProofStatus.REJECTED);
        proof.setReviewedBy(officer);
        proof.setReviewedAt(LocalDateTime.now());
        proof.setRejectionReason(rejectRequest.getRejectionReason());

        PaymentProof saved = paymentProofRepository.save(proof);

        // Revert installment status
        Installment installment = proof.getInstallment();
        if (installment != null) {
            if (installment.getDueDate().isBefore(LocalDate.now())) {
                installment.setStatus(InstallmentStatus.OVERDUE);
            } else if (installment.getPaidAmount() != null && installment.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
                installment.setStatus(InstallmentStatus.PARTIALLY_PAID);
            } else {
                installment.setStatus(InstallmentStatus.PENDING);
            }
            installmentRepository.save(installment);

            // Notify borrower with rejection explanation
            User borrower = (installment.getFacility() != null && installment.getFacility().getApplication() != null && installment.getFacility().getApplication().getApplicant() != null)
                    ? installment.getFacility().getApplication().getApplicant().getUser() : null;
            if (borrower != null) {
                try {
                    notificationService.sendToUser(
                            borrower,
                            "Payment Proof Verification Issue",
                            String.format("Your payment proof for installment #%d was rejected: \"%s\". Please review and re-upload.",
                                    installment.getInstallmentNumber(), rejectRequest.getRejectionReason()),
                            NotificationType.WARNING,
                            "INSTALLMENT",
                            installment.getId()
                    );
                } catch (Exception e) {
                    log.warn("Failed to notify borrower on payment proof rejection: {}", e.getMessage());
                }
            }
        }

        return PaymentProofResponse.fromEntity(saved);
    }

    private void validateAccess(Facility facility, User user) {
        if (user.getRole() == Role.APPLICANT) {
            User applicantUser = (facility.getApplication() != null && facility.getApplication().getApplicant() != null)
                    ? facility.getApplication().getApplicant().getUser() : null;
            if (applicantUser == null || !applicantUser.getId().equals(user.getId())) {
                throw new ForbiddenException("Access denied to facility payment proofs.");
            }
        }
    }

    public static class SlipDownloadResult {
        private final Resource resource;
        private final String contentType;
        private final String filename;

        public SlipDownloadResult(Resource resource, String contentType, String filename) {
            this.resource = resource;
            this.contentType = contentType;
            this.filename = filename;
        }

        public Resource getResource() {
            return resource;
        }

        public String getContentType() {
            return contentType;
        }

        public String getFilename() {
            return filename;
        }
    }
}
