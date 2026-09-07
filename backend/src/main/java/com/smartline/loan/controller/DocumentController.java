package com.smartline.loan.controller;

import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.DocumentResponse;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.DocumentType;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Documents", description = "Document Vault & Verification Files (EP01)")
public class DocumentController {

    private final DocumentService documentService;
    private final UserRepository userRepository;

    public DocumentController(DocumentService documentService, UserRepository userRepository) {
        this.documentService = documentService;
        this.userRepository = userRepository;
    }

    @PostMapping(value = "/applications/{applicationId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('APPLICANT', 'LOAN_OFFICER', 'ADMIN')")
    @Operation(summary = "Upload a document for an application")
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId,
            @RequestParam("type") DocumentType type,
            @RequestParam("file") MultipartFile file) {
        User currentUser = getCurrentUser(userPrincipal);
        DocumentResponse response = documentService.uploadDocument(applicationId, type, file, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document uploaded successfully", response));
    }

    @GetMapping("/applications/{applicationId}/documents")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all documents uploaded for an application")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getDocuments(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId) {
        User currentUser = getCurrentUser(userPrincipal);
        List<DocumentResponse> documents = documentService.getDocuments(applicationId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    @GetMapping("/documents/{id}/download")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download or stream a document file")
    public ResponseEntity<Resource> downloadDocument(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        User currentUser = getCurrentUser(userPrincipal);
        DocumentService.DocumentDownloadResult result = documentService.getDocumentForDownload(id, currentUser);

        String contentType = result.getContentType() != null ? result.getContentType() : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + result.getOriginalFilename() + "\"")
                .body(result.getResource());
    }

    @DeleteMapping("/documents/{id}")
    @PreAuthorize("hasAnyRole('APPLICANT', 'ADMIN')")
    @Operation(summary = "Delete an uploaded document")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        User currentUser = getCurrentUser(userPrincipal);
        documentService.deleteDocument(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
