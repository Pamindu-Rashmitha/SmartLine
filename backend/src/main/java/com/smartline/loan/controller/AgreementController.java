package com.smartline.loan.controller;

import com.smartline.loan.dto.request.AgreementCreateRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.AgreementResponse;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.entity.Agreement;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.AgreementPdfService;
import com.smartline.loan.service.AgreementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agreements")
@Tag(name = "Agreement Management", description = "Legal Agreement Execution & PDF Generation APIs (EP03 - US11, US12, US13)")
public class AgreementController {

    private final AgreementService agreementService;
    private final AgreementPdfService agreementPdfService;
    private final UserRepository userRepository;

    public AgreementController(AgreementService agreementService,
                               AgreementPdfService agreementPdfService,
                               UserRepository userRepository) {
        this.agreementService = agreementService;
        this.agreementPdfService = agreementPdfService;
        this.userRepository = userRepository;
    }

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('LEGAL_OFFICER', 'ADMIN')")
    @Operation(summary = "Get Legal Officer agreement preparation queue")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getLegalQueue() {
        List<ApplicationResponse> queue = agreementService.getLegalQueue();
        return ResponseEntity.ok(ApiResponse.success(queue));
    }

    @PostMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('LEGAL_OFFICER', 'ADMIN')")
    @Operation(summary = "Prepare draft financing agreement (US11)")
    public ResponseEntity<ApiResponse<AgreementResponse>> prepareAgreement(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId,
            @Valid @RequestBody(required = false) AgreementCreateRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        AgreementResponse response = agreementService.prepareAgreement(applicationId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Agreement prepared successfully", response));
    }

    @PostMapping("/{applicationId}/verify")
    @PreAuthorize("hasAnyRole('LEGAL_OFFICER', 'ADMIN')")
    @Operation(summary = "Verify and seal financing agreement (US12)")
    public ResponseEntity<ApiResponse<AgreementResponse>> verifyAgreement(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId) {
        User currentUser = getCurrentUser(userPrincipal);
        AgreementResponse response = agreementService.verifyAgreement(applicationId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Agreement verified and sealed", response));
    }

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasAnyRole('APPLICANT', 'LEGAL_OFFICER', 'FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Get agreement details by application ID (US13)")
    public ResponseEntity<ApiResponse<AgreementResponse>> getAgreementByApplication(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId) {
        User currentUser = getCurrentUser(userPrincipal);
        AgreementResponse response = agreementService.getAgreementByApplicationId(applicationId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('APPLICANT', 'LEGAL_OFFICER', 'FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Download/preview agreement PDF (US13)")
    public ResponseEntity<byte[]> downloadAgreementPdf(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        User currentUser = getCurrentUser(userPrincipal);
        Agreement agreement = agreementService.getAgreementById(id, currentUser);
        byte[] pdfBytes = agreementPdfService.generateAgreementPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "Agreement_" + agreement.getAgreementNumber() + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
