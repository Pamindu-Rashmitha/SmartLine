package com.smartline.loan.controller;

import com.smartline.loan.dto.request.DocumentVerifyRequest;
import com.smartline.loan.dto.request.VerificationDecisionRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.ApplicationDetailResponse;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.dto.response.DocumentResponse;
import com.smartline.loan.dto.response.PageResponse;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.VerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/verification")
@Tag(name = "Verification", description = "Loan Officer Verification Workflow (EP01)")
public class VerificationController {

    private final VerificationService verificationService;
    private final UserRepository userRepository;

    public VerificationController(VerificationService verificationService, UserRepository userRepository) {
        this.verificationService = verificationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('LOAN_OFFICER', 'ADMIN')")
    @Operation(summary = "Get applications in the verification queue (SUBMITTED, UNDER_VERIFICATION)")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getVerificationQueue(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<ApplicationResponse> queue = verificationService.getVerificationQueue(pageable);
        return ResponseEntity.ok(ApiResponse.success(queue));
    }

    @PostMapping("/{applicationId}/start")
    @PreAuthorize("hasAnyRole('LOAN_OFFICER', 'ADMIN')")
    @Operation(summary = "Start verification and assign to current loan officer")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> startVerification(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId) {
        User currentUser = getCurrentUser(userPrincipal);
        ApplicationDetailResponse response = verificationService.startVerification(applicationId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Verification started", response));
    }

    @PutMapping("/documents/{documentId}")
    @PreAuthorize("hasAnyRole('LOAN_OFFICER', 'ADMIN')")
    @Operation(summary = "Verify or reject an uploaded document")
    public ResponseEntity<ApiResponse<DocumentResponse>> verifyDocument(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long documentId,
            @Valid @RequestBody DocumentVerifyRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        DocumentResponse response = verificationService.verifyDocument(documentId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Document verification updated", response));
    }

    @PostMapping("/{applicationId}/complete")
    @PreAuthorize("hasAnyRole('LOAN_OFFICER', 'ADMIN')")
    @Operation(summary = "Complete verification decision (Mark as VERIFIED or REJECTED)")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> completeVerification(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId,
            @Valid @RequestBody VerificationDecisionRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        ApplicationDetailResponse response = verificationService.completeVerification(applicationId, request, currentUser);
        String msg = Boolean.TRUE.equals(request.getApproved()) ? "Application verified successfully" : "Application rejected";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
