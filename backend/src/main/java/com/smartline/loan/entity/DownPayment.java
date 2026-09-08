package com.smartline.loan.entity;

import com.smartline.loan.entity.enums.DownPaymentStatus;
import com.smartline.loan.entity.enums.PaymentMethod;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "down_payments", indexes = {
    @Index(name = "idx_down_payments_application", columnList = "application_id"),
    @Index(name = "idx_down_payments_status", columnList = "status")
})
public class DownPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal requiredAmount;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PaymentMethod paymentMethod;

    @Column(length = 100)
    private String referenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DownPaymentStatus status = DownPaymentStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by")
    private User recordedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(length = 1000)
    private String remarks;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public DownPayment() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.paidAmount == null) {
            this.paidAmount = BigDecimal.ZERO;
        }
        if (this.status == null) {
            this.status = DownPaymentStatus.PENDING;
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

    public BigDecimal getRequiredAmount() {
        return requiredAmount;
    }

    public void setRequiredAmount(BigDecimal requiredAmount) {
        this.requiredAmount = requiredAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public DownPaymentStatus getStatus() {
        return status;
    }

    public void setStatus(DownPaymentStatus status) {
        this.status = status;
    }

    public User getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(User recordedBy) {
        this.recordedBy = recordedBy;
    }

    public User getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(User verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
