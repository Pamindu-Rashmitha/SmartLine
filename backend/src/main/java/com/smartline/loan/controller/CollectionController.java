package com.smartline.loan.controller;

import com.smartline.loan.dto.request.CollectionFollowUpRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.CollectionFollowUpResponse;
import com.smartline.loan.dto.response.OverdueInstallmentSummary;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.CollectionService;
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
@Tag(name = "Collections & Recovery", description = "Delinquency Monitoring and Collection Follow-up APIs (EP04 - US19)")
public class CollectionController {

    private final CollectionService collectionService;
    private final UserRepository userRepository;

    public CollectionController(CollectionService collectionService, UserRepository userRepository) {
        this.collectionService = collectionService;
        this.userRepository = userRepository;
    }

    @GetMapping("/collections/overdue")
    @PreAuthorize("hasAnyRole('CREDIT_CONTROL_OFFICER', 'SENIOR_MANAGER', 'FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Get list of delinquent installments with aging metrics (US19)")
    public ResponseEntity<ApiResponse<List<OverdueInstallmentSummary>>> getOverdueInstallments() {
        List<OverdueInstallmentSummary> response = collectionService.getOverdueInstallments();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/installments/{installmentId}/follow-ups")
    @PreAuthorize("hasAnyRole('CREDIT_CONTROL_OFFICER', 'ADMIN')")
    @Operation(summary = "Record debtor collection follow-up interaction (US19)")
    public ResponseEntity<ApiResponse<CollectionFollowUpResponse>> recordFollowUp(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long installmentId,
            @Valid @RequestBody CollectionFollowUpRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        CollectionFollowUpResponse response = collectionService.recordFollowUp(installmentId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Collection follow-up logged successfully", response));
    }

    @GetMapping("/installments/{installmentId}/follow-ups")
    @PreAuthorize("hasAnyRole('CREDIT_CONTROL_OFFICER', 'SENIOR_MANAGER', 'ADMIN')")
    @Operation(summary = "Get collection follow-up history for an installment")
    public ResponseEntity<ApiResponse<List<CollectionFollowUpResponse>>> getInstallmentFollowUps(
            @PathVariable Long installmentId) {
        List<CollectionFollowUpResponse> response = collectionService.getFollowUpsByInstallment(installmentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/facilities/{facilityId}/follow-ups")
    @PreAuthorize("hasAnyRole('CREDIT_CONTROL_OFFICER', 'SENIOR_MANAGER', 'ADMIN')")
    @Operation(summary = "Get all collection follow-up records for a facility")
    public ResponseEntity<ApiResponse<List<CollectionFollowUpResponse>>> getFacilityFollowUps(
            @PathVariable Long facilityId) {
        List<CollectionFollowUpResponse> response = collectionService.getFollowUpsByFacility(facilityId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
