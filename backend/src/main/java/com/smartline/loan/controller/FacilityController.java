package com.smartline.loan.controller;

import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.FacilityResponse;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.FacilityStatus;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.FacilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@Tag(name = "Facility Management", description = "Active Facility Directory & Management APIs (EP03 - US15)")
public class FacilityController {

    private final FacilityService facilityService;
    private final UserRepository userRepository;

    public FacilityController(FacilityService facilityService, UserRepository userRepository) {
        this.facilityService = facilityService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('APPLICANT', 'FINANCE_OFFICER', 'CREDIT_CONTROL_OFFICER', 'ADMIN', 'SENIOR_MANAGER', 'CREDIT_MANAGER', 'LOAN_OFFICER', 'LEGAL_OFFICER')")
    @Operation(summary = "Get list of facilities (active/completed)")
    public ResponseEntity<ApiResponse<List<FacilityResponse>>> getFacilities(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) FacilityStatus status) {
        User currentUser = getCurrentUser(userPrincipal);
        List<FacilityResponse> list = facilityService.getFacilities(status, currentUser);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('APPLICANT', 'FINANCE_OFFICER', 'CREDIT_CONTROL_OFFICER', 'ADMIN', 'SENIOR_MANAGER', 'CREDIT_MANAGER', 'LOAN_OFFICER', 'LEGAL_OFFICER')")
    @Operation(summary = "Get facility details by ID")
    public ResponseEntity<ApiResponse<FacilityResponse>> getFacilityById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        User currentUser = getCurrentUser(userPrincipal);
        FacilityResponse response = facilityService.getFacilityById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
