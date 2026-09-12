package com.smartline.loan.repository;

import com.smartline.loan.entity.Document;
import com.smartline.loan.entity.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByApplicationId(Long applicationId);
    Optional<Document> findByApplicationIdAndDocumentType(Long applicationId, DocumentType documentType);
    long countByApplicationId(Long applicationId);
    List<Document> findByApplicationApplicantIdOrderByUploadedAtDesc(Long applicantId);
    List<Document> findAllByOrderByUploadedAtDesc();
}
