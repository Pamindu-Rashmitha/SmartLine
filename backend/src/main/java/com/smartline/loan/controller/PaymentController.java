package com.smartline.loan.controller;

import com.smartline.loan.dto.request.PaymentCancelRequest;
import com.smartline.loan.dto.request.PaymentRecordRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.PaymentResponse;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Payment Management", description = "Installment Payment Recording & Administration APIs (EP04 - US17, US20)")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    public PaymentController(PaymentService paymentService, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    @PostMapping("/installments/{installmentId}/payments")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Record installment payment (US17)")
    public ResponseEntity<ApiResponse<PaymentResponse>> recordPayment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long installmentId,
            @Valid @RequestBody PaymentRecordRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        PaymentResponse response = paymentService.recordPayment(installmentId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Payment recorded successfully", response));
    }

    @GetMapping("/facilities/{facilityId}/payments")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'APPLICANT', 'CREDIT_CONTROL_OFFICER', 'SENIOR_MANAGER', 'ADMIN')")
    @Operation(summary = "Get all payments recorded for a facility (US18)")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getFacilityPayments(
            @PathVariable Long facilityId) {
        List<PaymentResponse> response = paymentService.getPaymentsByFacility(facilityId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/installments/{installmentId}/payments")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'APPLICANT', 'ADMIN')")
    @Operation(summary = "Get payments for a specific installment")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getInstallmentPayments(
            @PathVariable Long installmentId) {
        List<PaymentResponse> response = paymentService.getPaymentsByInstallment(installmentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/payments/{paymentId}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Void/cancel a payment transaction with audit justification (US20)")
    public ResponseEntity<ApiResponse<PaymentResponse>> cancelPayment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long paymentId,
            @Valid @RequestBody PaymentCancelRequest request) {
        User adminUser = getCurrentUser(userPrincipal);
        PaymentResponse response = paymentService.cancelPayment(paymentId, request, adminUser);
        return ResponseEntity.ok(ApiResponse.success("Payment cancelled and balances reversed successfully", response));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
