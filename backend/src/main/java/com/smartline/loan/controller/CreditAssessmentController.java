package com.smartline.loan.controller;

import com.smartline.loan.dto.request.CreditAssessmentRequest;
import com.smartline.loan.dto.request.CreditDecisionRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.ApplicationDetailResponse;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.dto.response.CreditAssessmentResponse;
import com.smartline.loan.dto.response.PageResponse;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.CreditAssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/credit-assessment")
@Tag(name = "Credit Assessment", description = "Credit Assessment & Risk Evaluation APIs (EP02 - US06, US09)")
public class CreditAssessmentController {

    private final CreditAssessmentService creditAssessmentService;
    private final UserRepository userRepository;

    public CreditAssessmentController(CreditAssessmentService creditAssessmentService,
                                      UserRepository userRepository) {
        this.creditAssessmentService = creditAssessmentService;
        this.userRepository = userRepository;
    }

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('CREDIT_MANAGER', 'ADMIN')")
    @Operation(summary = "Get credit assessment appraisal queue")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getCreditQueue(
            @PageableDefault(size = 10) Pageable pageable) {
        PageResponse<ApplicationResponse> queue = creditAssessmentService.getCreditQueue(pageable);
        return ResponseEntity.ok(ApiResponse.success(queue));
    }

    @PostMapping("/{applicationId}/start")
    @PreAuthorize("hasAnyRole('CREDIT_MANAGER', 'ADMIN')")
    @Operation(summary = "Start credit assessment for an application")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> startAssessment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId) {
        User currentUser = getCurrentUser(userPrincipal);
        ApplicationDetailResponse response = creditAssessmentService.startAssessment(applicationId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Credit assessment started", response));
    }

    @PostMapping("/{applicationId}/request-inspection")
    @PreAuthorize("hasAnyRole('CREDIT_MANAGER', 'ADMIN')")
    @Operation(summary = "Request field inspection for vehicle lease application")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> requestFieldInspection(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId,
            @RequestBody(required = false) Map<String, String> body) {
        User currentUser = getCurrentUser(userPrincipal);
        String remarks = body != null ? body.get("remarks") : null;
        ApplicationDetailResponse response = creditAssessmentService.requestFieldInspection(applicationId, remarks, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Vehicle inspection requested successfully", response));
    }

    @PostMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('CREDIT_MANAGER', 'ADMIN')")
    @Operation(summary = "Save or update credit evaluation details")
    public ResponseEntity<ApiResponse<CreditAssessmentResponse>> saveAssessment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId,
            @Valid @RequestBody CreditAssessmentRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        CreditAssessmentResponse response = creditAssessmentService.saveAssessment(applicationId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Credit assessment saved successfully", response));
    }

    @PostMapping("/{applicationId}/decide")
    @PreAuthorize("hasAnyRole('CREDIT_MANAGER', 'ADMIN')")
    @Operation(summary = "Record credit approval/rejection or referral to Senior Manager")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> recordDecision(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId,
            @Valid @RequestBody CreditDecisionRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        ApplicationDetailResponse response = creditAssessmentService.recordDecision(applicationId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Credit decision recorded successfully", response));
    }

    @GetMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('CREDIT_MANAGER', 'SENIOR_MANAGER', 'LOAN_OFFICER', 'ADMIN')")
    @Operation(summary = "Get credit assessment details for an application")
    public ResponseEntity<ApiResponse<CreditAssessmentResponse>> getCreditAssessment(
            @PathVariable Long applicationId) {
        CreditAssessmentResponse response = creditAssessmentService.getCreditAssessment(applicationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
