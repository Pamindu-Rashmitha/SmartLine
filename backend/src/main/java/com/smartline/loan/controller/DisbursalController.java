package com.smartline.loan.controller;

import com.smartline.loan.dto.request.DisbursalRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.dto.response.FacilityResponse;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.DisbursalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disbursals")
@Tag(name = "Disbursal Management", description = "Loan & Lease Disbursal and Facility Activation APIs (EP03 - US15)")
public class DisbursalController {

    private final DisbursalService disbursalService;
    private final UserRepository userRepository;

    public DisbursalController(DisbursalService disbursalService, UserRepository userRepository) {
        this.disbursalService = disbursalService;
        this.userRepository = userRepository;
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Get list of applications awaiting disbursal")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getPendingDisbursals() {
        List<ApplicationResponse> list = disbursalService.getPendingDisbursals();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Execute fund disbursal and activate facility (US15)")
    public ResponseEntity<ApiResponse<FacilityResponse>> recordDisbursal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId,
            @Valid @RequestBody DisbursalRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        FacilityResponse response = disbursalService.recordDisbursal(applicationId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Disbursal executed and facility activated successfully", response));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
