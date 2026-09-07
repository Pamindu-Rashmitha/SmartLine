package com.smartline.loan.entity;

import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "applications", indexes = {
    @Index(name = "idx_applications_number", columnList = "applicationNumber"),
    @Index(name = "idx_applications_applicant", columnList = "applicant_id"),
    @Index(name = "idx_applications_status", columnList = "status"),
    @Index(name = "idx_applications_type", columnList = "type")
})
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String applicationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private Applicant applicant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ApplicationStatus status = ApplicationStatus.DRAFT;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal requestedAmount;

    @Column(length = 500)
    private String purpose;

    private LocalDateTime submittedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    private LocalDateTime verifiedAt;

    @Column(length = 1000)
    private String rejectionReason;

    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private LoanDetail loanDetail;

    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private VehicleLeaseDetail vehicleLeaseDetail;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Guarantor> guarantors = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Document> documents = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Application() {
    }

    public Application(String applicationNumber, Applicant applicant, ApplicationType type,
                       BigDecimal requestedAmount, String purpose) {
        this.applicationNumber = applicationNumber;
        this.applicant = applicant;
        this.type = type;
        this.requestedAmount = requestedAmount;
        this.purpose = purpose;
        this.status = ApplicationStatus.DRAFT;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ApplicationStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper methods for bidirectional relationships
    public void setLoanDetail(LoanDetail loanDetail) {
        this.loanDetail = loanDetail;
        if (loanDetail != null) {
            loanDetail.setApplication(this);
        }
    }

    public void setVehicleLeaseDetail(VehicleLeaseDetail vehicleLeaseDetail) {
        this.vehicleLeaseDetail = vehicleLeaseDetail;
        if (vehicleLeaseDetail != null) {
            vehicleLeaseDetail.setApplication(this);
        }
    }

    public void addGuarantor(Guarantor guarantor) {
        guarantors.add(guarantor);
        guarantor.setApplication(this);
    }

    public void removeGuarantor(Guarantor guarantor) {
        guarantors.remove(guarantor);
        guarantor.setApplication(null);
    }

    public void addDocument(Document document) {
        documents.add(document);
        document.setApplication(this);
    }

    public void removeDocument(Document document) {
        documents.remove(document);
        document.setApplication(null);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApplicationNumber() {
        return applicationNumber;
    }

    public void setApplicationNumber(String applicationNumber) {
        this.applicationNumber = applicationNumber;
    }

    public Applicant getApplicant() {
        return applicant;
    }

    public void setApplicant(Applicant applicant) {
        this.applicant = applicant;
    }

    public ApplicationType getType() {
        return type;
    }

    public void setType(ApplicationType type) {
        this.type = type;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public BigDecimal getRequestedAmount() {
        return requestedAmount;
    }

    public void setRequestedAmount(BigDecimal requestedAmount) {
        this.requestedAmount = requestedAmount;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public User getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(User verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LoanDetail getLoanDetail() {
        return loanDetail;
    }

    public VehicleLeaseDetail getVehicleLeaseDetail() {
        return vehicleLeaseDetail;
    }

    public List<Guarantor> getGuarantors() {
        return guarantors;
    }

    public void setGuarantors(List<Guarantor> guarantors) {
        this.guarantors = guarantors;
    }

    public List<Document> getDocuments() {
        return documents;
    }

    public void setDocuments(List<Document> documents) {
        this.documents = documents;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
