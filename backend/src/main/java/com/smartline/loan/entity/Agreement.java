package com.smartline.loan.entity;

import com.smartline.loan.entity.enums.AgreementStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "agreements", indexes = {
    @Index(name = "idx_agreements_application", columnList = "application_id"),
    @Index(name = "idx_agreements_number", columnList = "agreementNumber"),
    @Index(name = "idx_agreements_status", columnList = "status")
})
public class Agreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Column(nullable = false, unique = true, length = 30)
    private String agreementNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prepared_by", nullable = false)
    private User preparedBy;

    @Column(nullable = false)
    private LocalDateTime preparedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationType facilityType;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal principalAmount;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(nullable = false)
    private Integer tenureMonths;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal installmentAmount;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalPayable;

    @Column(precision = 14, scale = 2)
    private BigDecimal downPaymentRequired = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(columnDefinition = "TEXT")
    private String specialConditions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AgreementStatus status = AgreementStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    private LocalDateTime verifiedDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Agreement() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.preparedDate == null) {
            this.preparedDate = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = AgreementStatus.DRAFT;
        }
        if (this.downPaymentRequired == null) {
            this.downPaymentRequired = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public String getAgreementNumber() {
        return agreementNumber;
    }

    public void setAgreementNumber(String agreementNumber) {
        this.agreementNumber = agreementNumber;
    }

    public User getPreparedBy() {
        return preparedBy;
    }

    public void setPreparedBy(User preparedBy) {
        this.preparedBy = preparedBy;
    }

    public LocalDateTime getPreparedDate() {
        return preparedDate;
    }

    public void setPreparedDate(LocalDateTime preparedDate) {
        this.preparedDate = preparedDate;
    }

    public ApplicationType getFacilityType() {
        return facilityType;
    }

    public void setFacilityType(ApplicationType facilityType) {
        this.facilityType = facilityType;
    }

    public BigDecimal getPrincipalAmount() {
        return principalAmount;
    }

    public void setPrincipalAmount(BigDecimal principalAmount) {
        this.principalAmount = principalAmount;
    }

    public BigDecimal getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public BigDecimal getInstallmentAmount() {
        return installmentAmount;
    }

    public void setInstallmentAmount(BigDecimal installmentAmount) {
        this.installmentAmount = installmentAmount;
    }

    public BigDecimal getTotalPayable() {
        return totalPayable;
    }

    public void setTotalPayable(BigDecimal totalPayable) {
        this.totalPayable = totalPayable;
    }

    public BigDecimal getDownPaymentRequired() {
        return downPaymentRequired;
    }

    public void setDownPaymentRequired(BigDecimal downPaymentRequired) {
        this.downPaymentRequired = downPaymentRequired;
    }

    public String getTermsAndConditions() {
        return termsAndConditions;
    }

    public void setTermsAndConditions(String termsAndConditions) {
        this.termsAndConditions = termsAndConditions;
    }

    public String getSpecialConditions() {
        return specialConditions;
    }

    public void setSpecialConditions(String specialConditions) {
        this.specialConditions = specialConditions;
    }

    public AgreementStatus getStatus() {
        return status;
    }

    public void setStatus(AgreementStatus status) {
        this.status = status;
    }

    public User getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(User verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public LocalDateTime getVerifiedDate() {
        return verifiedDate;
    }

    public void setVerifiedDate(LocalDateTime verifiedDate) {
        this.verifiedDate = verifiedDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
