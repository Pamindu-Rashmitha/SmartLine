package com.smartline.loan.service;

import com.smartline.loan.dto.response.DocumentResponse;
import com.smartline.loan.entity.Applicant;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.Document;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.DocumentType;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.ApplicantRepository;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.DocumentRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicantRepository applicantRepository;
    private final FileStorageService fileStorageService;

    public DocumentService(DocumentRepository documentRepository,
                           ApplicationRepository applicationRepository,
                           ApplicantRepository applicantRepository,
                           FileStorageService fileStorageService) {
        this.documentRepository = documentRepository;
        this.applicationRepository = applicationRepository;
        this.applicantRepository = applicantRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public DocumentResponse uploadDocument(Long applicationId, DocumentType documentType,
                                           MultipartFile file, User currentUser) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        checkOwnershipOrStaff(application, currentUser);

        if (application.getStatus() != ApplicationStatus.DRAFT &&
            application.getStatus() != ApplicationStatus.SUBMITTED &&
            currentUser.getRole() == Role.APPLICANT) {
            throw new BadRequestException("Documents cannot be uploaded when application status is " + application.getStatus());
        }

        // Store file on disk
        FileStorageService.StorageResult storage = fileStorageService.storeFile(applicationId, file);

        // Check if document of this type already exists; if so, replace file
        Optional<Document> existingOpt = documentRepository.findByApplicationIdAndDocumentType(applicationId, documentType);
        Document document;
        if (existingOpt.isPresent()) {
            document = existingOpt.get();
            // Delete previous file from disk
            fileStorageService.deleteFile(document.getFilePath());
            document.setOriginalFilename(storage.getOriginalFilename());
            document.setStoredFilename(storage.getStoredFilename());
            document.setFilePath(storage.getFilePath());
            document.setFileSize(storage.getFileSize());
            document.setContentType(storage.getContentType());
        } else {
            document = new Document(
                    application,
                    documentType,
                    storage.getOriginalFilename(),
                    storage.getStoredFilename(),
                    storage.getFilePath(),
                    storage.getFileSize(),
                    storage.getContentType()
            );
        }

        Document saved = documentRepository.save(document);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public DocumentDownloadResult getDocumentForDownload(Long documentId, User currentUser) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        checkOwnershipOrStaff(document.getApplication(), currentUser);

        Resource resource = fileStorageService.loadFileAsResource(document.getFilePath());
        return new DocumentDownloadResult(resource, document.getOriginalFilename(), document.getContentType());
    }

    @Transactional
    public void deleteDocument(Long documentId, User currentUser) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        Application application = document.getApplication();
        checkOwnershipOrStaff(application, currentUser);

        if (application.getStatus() != ApplicationStatus.DRAFT && currentUser.getRole() == Role.APPLICANT) {
            throw new BadRequestException("Documents cannot be deleted once the application has been submitted");
        }

        fileStorageService.deleteFile(document.getFilePath());
        documentRepository.delete(document);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocuments(Long applicationId, User currentUser) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        checkOwnershipOrStaff(application, currentUser);

        return documentRepository.findByApplicationId(applicationId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getMyDocuments(User currentUser) {
        if (currentUser.getRole() == Role.APPLICANT) {
            Applicant applicant = applicantRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new BadRequestException("Applicant profile not found"));
            return documentRepository.findByApplicationApplicantIdOrderByUploadedAtDesc(applicant.getId())
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } else {
            return documentRepository.findAllByOrderByUploadedAtDesc()
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
    }

    private void checkOwnershipOrStaff(Application application, User user) {
        if (user.getRole() == Role.APPLICANT) {
            Applicant applicant = applicantRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new BadRequestException("Applicant profile not found"));
            if (!application.getApplicant().getId().equals(applicant.getId())) {
                throw new BadRequestException("You do not have permission to access this application's documents");
            }
        }
    }

    public DocumentResponse mapToResponse(Document doc) {
        DocumentResponse res = new DocumentResponse();
        res.setId(doc.getId());
        res.setDocumentType(doc.getDocumentType());
        res.setOriginalFilename(doc.getOriginalFilename());
        res.setFileSize(doc.getFileSize());
        res.setContentType(doc.getContentType());
        res.setVerificationStatus(doc.getVerificationStatus());
        if (doc.getVerifiedBy() != null) {
            res.setVerifiedByName(doc.getVerifiedBy().getFullName());
        }
        res.setVerifiedAt(doc.getVerifiedAt());
        res.setRejectionReason(doc.getRejectionReason());
        res.setUploadedAt(doc.getUploadedAt());
        res.setDownloadUrl("/api/documents/" + doc.getId() + "/download");
        if (doc.getApplication() != null) {
            res.setApplicationId(doc.getApplication().getId());
            res.setApplicationNumber(doc.getApplication().getApplicationNumber());
            if (doc.getApplication().getType() != null) {
                res.setApplicationType(doc.getApplication().getType().name());
            }
        }
        return res;
    }

    public static class DocumentDownloadResult {
        private final Resource resource;
        private final String originalFilename;
        private final String contentType;

        public DocumentDownloadResult(Resource resource, String originalFilename, String contentType) {
            this.resource = resource;
            this.originalFilename = originalFilename;
            this.contentType = contentType;
        }

        public Resource getResource() {
            return resource;
        }

        public String getOriginalFilename() {
            return originalFilename;
        }

        public String getContentType() {
            return contentType;
        }
    }
}
