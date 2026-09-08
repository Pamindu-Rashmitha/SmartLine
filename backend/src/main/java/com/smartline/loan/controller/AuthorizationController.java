package com.smartline.loan.controller;

import com.smartline.loan.dto.request.AuthorizationDecisionRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.ApplicationDetailResponse;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.dto.response.PageResponse;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.SeniorAuthorizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/authorizations")
@Tag(name = "Authorizations", description = "Senior Manager Higher-Level Sanction APIs (EP02 - US10)")
public class AuthorizationController {

    private final SeniorAuthorizationService seniorAuthorizationService;
    private final UserRepository userRepository;

    public AuthorizationController(SeniorAuthorizationService seniorAuthorizationService,
                                   UserRepository userRepository) {
        this.seniorAuthorizationService = seniorAuthorizationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('SENIOR_MANAGER', 'ADMIN')")
    @Operation(summary = "Get high-value sanction queue for senior management")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getAuthorizationQueue(
            @PageableDefault(size = 10) Pageable pageable) {
        PageResponse<ApplicationResponse> queue = seniorAuthorizationService.getAuthorizationQueue(pageable);
        return ResponseEntity.ok(ApiResponse.success(queue));
    }

    @PostMapping("/{applicationId}/decision")
    @PreAuthorize("hasAnyRole('SENIOR_MANAGER', 'ADMIN')")
    @Operation(summary = "Record senior manager executive authorization decision")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> recordDecision(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId,
            @Valid @RequestBody AuthorizationDecisionRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        ApplicationDetailResponse response = seniorAuthorizationService.recordDecision(applicationId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Authorization decision recorded successfully", response));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
