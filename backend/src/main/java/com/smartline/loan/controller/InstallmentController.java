package com.smartline.loan.controller;

import com.smartline.loan.dto.request.InstallmentScheduleCreateRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.InstallmentResponse;
import com.smartline.loan.dto.response.InstallmentScheduleResponse;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.InstallmentService;
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
@Tag(name = "Installment Schedule Management", description = "Installment Schedule Generation & Tracking APIs (EP04 - US16, US18)")
public class InstallmentController {

    private final InstallmentService installmentService;
    private final UserRepository userRepository;

    public InstallmentController(InstallmentService installmentService, UserRepository userRepository) {
        this.installmentService = installmentService;
        this.userRepository = userRepository;
    }

    @PostMapping("/facilities/{facilityId}/schedule")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Generate installment schedule for an active facility (US16)")
    public ResponseEntity<ApiResponse<InstallmentScheduleResponse>> generateSchedule(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long facilityId,
            @Valid @RequestBody InstallmentScheduleCreateRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        InstallmentScheduleResponse response = installmentService.generateSchedule(facilityId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Installment schedule generated successfully", response));
    }

    @GetMapping("/facilities/{facilityId}/schedule")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'CREDIT_CONTROL_OFFICER', 'APPLICANT', 'SENIOR_MANAGER', 'ADMIN')")
    @Operation(summary = "Get full installment schedule for facility (US16, US18)")
    public ResponseEntity<ApiResponse<InstallmentScheduleResponse>> getSchedule(
            @PathVariable Long facilityId) {
        InstallmentScheduleResponse response = installmentService.getScheduleByFacility(facilityId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/facilities/{facilityId}/installments")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'CREDIT_CONTROL_OFFICER', 'APPLICANT', 'SENIOR_MANAGER', 'ADMIN')")
    @Operation(summary = "List all installments for facility")
    public ResponseEntity<ApiResponse<List<InstallmentResponse>>> getInstallments(
            @PathVariable Long facilityId) {
        List<InstallmentResponse> response = installmentService.getInstallmentsByFacility(facilityId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/installments/sync-overdue")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'CREDIT_CONTROL_OFFICER', 'ADMIN')")
    @Operation(summary = "Trigger overdue synchronization across pending installments")
    public ResponseEntity<ApiResponse<String>> syncOverdue() {
        installmentService.syncOverdueInstallments();
        return ResponseEntity.ok(ApiResponse.success("Overdue installments synchronized successfully", "OK"));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
