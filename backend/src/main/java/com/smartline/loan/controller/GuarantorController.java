package com.smartline.loan.controller;

import com.smartline.loan.dto.request.GuarantorRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.GuarantorResponse;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.GuarantorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Guarantors", description = "Application Guarantors Management (EP01)")
public class GuarantorController {

    private final GuarantorService guarantorService;
    private final UserRepository userRepository;

    public GuarantorController(GuarantorService guarantorService, UserRepository userRepository) {
        this.guarantorService = guarantorService;
        this.userRepository = userRepository;
    }

    @PostMapping("/applications/{applicationId}/guarantors")
    @PreAuthorize("hasAnyRole('APPLICANT', 'LOAN_OFFICER', 'ADMIN')")
    @Operation(summary = "Add a guarantor to an application")
    public ResponseEntity<ApiResponse<GuarantorResponse>> addGuarantor(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId,
            @Valid @RequestBody GuarantorRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        GuarantorResponse response = guarantorService.addGuarantor(applicationId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Guarantor added successfully", response));
    }

    @GetMapping("/applications/{applicationId}/guarantors")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get list of guarantors for an application")
    public ResponseEntity<ApiResponse<List<GuarantorResponse>>> getGuarantors(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId) {
        User currentUser = getCurrentUser(userPrincipal);
        List<GuarantorResponse> guarantors = guarantorService.getGuarantors(applicationId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(guarantors));
    }

    @DeleteMapping("/guarantors/{id}")
    @PreAuthorize("hasAnyRole('APPLICANT', 'ADMIN')")
    @Operation(summary = "Remove a guarantor from an application")
    public ResponseEntity<ApiResponse<Void>> removeGuarantor(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        User currentUser = getCurrentUser(userPrincipal);
        guarantorService.removeGuarantor(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Guarantor removed successfully", null));
    }

    @PutMapping("/guarantors/{id}/verify")
    @PreAuthorize("hasAnyRole('CREDIT_MANAGER', 'LOAN_OFFICER', 'ADMIN')")
    @Operation(summary = "Verify or reject guarantor (US08)")
    public ResponseEntity<ApiResponse<GuarantorResponse>> verifyGuarantor(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody com.smartline.loan.dto.request.GuarantorVerifyRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        GuarantorResponse response = guarantorService.verifyGuarantor(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Guarantor verification updated", response));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
