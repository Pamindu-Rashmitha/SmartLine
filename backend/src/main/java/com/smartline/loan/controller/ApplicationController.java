package com.smartline.loan.controller;

import com.smartline.loan.dto.request.ApplicationCreateRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.ApplicationDetailResponse;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.dto.response.PageResponse;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Applications", description = "Loan & Vehicle Leasing Application Management (EP01)")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    public ApplicationController(ApplicationService applicationService, UserRepository userRepository) {
        this.applicationService = applicationService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('APPLICANT')")
    @Operation(summary = "Create a new loan or lease application (Draft or Submitted)")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> createApplication(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ApplicationCreateRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        ApplicationDetailResponse response = applicationService.createApplication(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application created successfully", response));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('APPLICANT')")
    @Operation(summary = "Submit a draft application for verification")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> submitApplication(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        User currentUser = getCurrentUser(userPrincipal);
        ApplicationDetailResponse response = applicationService.submitApplication(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Application submitted for verification", response));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('APPLICANT')")
    @Operation(summary = "Cancel a draft or submitted application")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> cancelApplication(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        User currentUser = getCurrentUser(userPrincipal);
        ApplicationDetailResponse response = applicationService.cancelApplication(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Application cancelled", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('APPLICANT')")
    @Operation(summary = "Get list of all applications submitted by the logged-in applicant")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User currentUser = getCurrentUser(userPrincipal);
        List<ApplicationResponse> list = applicationService.getApplicantApplications(currentUser);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get detailed information of an application")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> getApplicationById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        User currentUser = getCurrentUser(userPrincipal);
        ApplicationDetailResponse response = applicationService.getApplicationDetail(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LOAN_OFFICER', 'CREDIT_MANAGER', 'SENIOR_MANAGER', 'ADMIN', 'LEGAL_OFFICER', 'FINANCE_OFFICER')")
    @Operation(summary = "Search and filter all applications across the organization")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> searchApplications(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) ApplicationType type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        PageResponse<ApplicationResponse> results = applicationService.searchApplications(status, type, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
