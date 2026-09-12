package com.smartline.loan.controller;

import com.smartline.loan.dto.request.PaymentProofRejectRequest;
import com.smartline.loan.dto.request.PaymentProofSubmitRequest;
import com.smartline.loan.dto.request.PaymentRecordRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.PaymentProofResponse;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.PaymentMethod;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.PaymentProofService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Payment Proofs", description = "Borrower Payment Slip Upload & Officer Verification APIs")
public class PaymentProofController {

    private final PaymentProofService paymentProofService;
    private final UserRepository userRepository;

    public PaymentProofController(PaymentProofService paymentProofService, UserRepository userRepository) {
        this.paymentProofService = paymentProofService;
        this.userRepository = userRepository;
    }

    @PostMapping(value = "/installments/{installmentId}/payment-proofs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('APPLICANT', 'FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Submit payment proof slip for an installment")
    public ResponseEntity<ApiResponse<PaymentProofResponse>> submitProof(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long installmentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("amount") BigDecimal amount,
            @RequestParam(value = "paymentDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate paymentDate,
            @RequestParam(value = "paymentMethod", defaultValue = "BANK_TRANSFER") PaymentMethod paymentMethod,
            @RequestParam("referenceNumber") String referenceNumber,
            @RequestParam(value = "remarks", required = false) String remarks) {

        User currentUser = getCurrentUser(userPrincipal);
        PaymentProofSubmitRequest req = new PaymentProofSubmitRequest(
                amount,
                paymentDate != null ? paymentDate : LocalDate.now(),
                paymentMethod,
                referenceNumber,
                remarks
        );

        PaymentProofResponse response = paymentProofService.submitProof(installmentId, file, req, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment proof submitted successfully for verification", response));
    }

    @GetMapping("/payment-proofs/pending")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Get all pending payment proofs awaiting verification")
    public ResponseEntity<ApiResponse<List<PaymentProofResponse>>> getPendingProofs() {
        List<PaymentProofResponse> response = paymentProofService.getPendingProofs();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/installments/{installmentId}/payment-proofs")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all payment proofs for a specific installment")
    public ResponseEntity<ApiResponse<List<PaymentProofResponse>>> getProofsByInstallment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long installmentId) {
        User currentUser = getCurrentUser(userPrincipal);
        List<PaymentProofResponse> response = paymentProofService.getProofsByInstallment(installmentId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/payment-proofs/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get payment proof details by ID")
    public ResponseEntity<ApiResponse<PaymentProofResponse>> getProofById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        User currentUser = getCurrentUser(userPrincipal);
        PaymentProofResponse response = paymentProofService.getProofById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/payment-proofs/{id}/slip")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download or stream the uploaded payment slip")
    public ResponseEntity<Resource> downloadSlip(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        User currentUser = getCurrentUser(userPrincipal);
        PaymentProofService.SlipDownloadResult result = paymentProofService.downloadSlip(id, currentUser);

        String contentType = result.getContentType() != null ? result.getContentType() : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + result.getFilename() + "\"")
                .body(result.getResource());
    }

    @PostMapping("/payment-proofs/{id}/approve")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Approve payment proof and settle the installment")
    public ResponseEntity<ApiResponse<PaymentProofResponse>> approveProof(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestBody(required = false) PaymentRecordRequest approvalRequest) {
        User officer = getCurrentUser(userPrincipal);
        PaymentProofResponse response = paymentProofService.approveProof(id, approvalRequest, officer);
        return ResponseEntity.ok(ApiResponse.success("Payment proof approved and installment payment recorded", response));
    }

    @PostMapping("/payment-proofs/{id}/reject")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Reject payment proof with reason and revert installment status")
    public ResponseEntity<ApiResponse<PaymentProofResponse>> rejectProof(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody PaymentProofRejectRequest rejectRequest) {
        User officer = getCurrentUser(userPrincipal);
        PaymentProofResponse response = paymentProofService.rejectProof(id, rejectRequest, officer);
        return ResponseEntity.ok(ApiResponse.success("Payment proof rejected and borrower notified", response));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
