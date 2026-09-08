package com.smartline.loan.controller;

import com.smartline.loan.dto.request.DownPaymentRecordRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.dto.response.DownPaymentResponse;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.DownPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/down-payments")
@Tag(name = "Down Payment Management", description = "Pre-Disbursal Down Payment Recording APIs (EP03 - US14)")
public class DownPaymentController {

    private final DownPaymentService downPaymentService;
    private final UserRepository userRepository;

    public DownPaymentController(DownPaymentService downPaymentService, UserRepository userRepository) {
        this.downPaymentService = downPaymentService;
        this.userRepository = userRepository;
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Get list of applications awaiting down-payment")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getPendingDownPayments() {
        List<ApplicationResponse> list = downPaymentService.getPendingDownPayments();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Record customer down-payment receipt (US14)")
    public ResponseEntity<ApiResponse<DownPaymentResponse>> recordDownPayment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId,
            @Valid @RequestBody DownPaymentRecordRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        DownPaymentResponse response = downPaymentService.recordDownPayment(applicationId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Down-payment recorded successfully", response));
    }

    @GetMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('APPLICANT', 'FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Get down-payment status for an application")
    public ResponseEntity<ApiResponse<DownPaymentResponse>> getDownPayment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId) {
        User currentUser = getCurrentUser(userPrincipal);
        DownPaymentResponse response = downPaymentService.getDownPayment(applicationId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
