package com.smartline.loan.dto.response;

import com.smartline.loan.entity.DownPayment;
import com.smartline.loan.entity.enums.DownPaymentStatus;
import com.smartline.loan.entity.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DownPaymentResponse {

    private Long id;
    private Long applicationId;
    private BigDecimal requiredAmount;
    private BigDecimal paidAmount;
    private LocalDate paymentDate;
    private PaymentMethod paymentMethod;
    private String referenceNumber;
    private DownPaymentStatus status;
    private Long recordedById;
    private String recordedByName;
    private Long verifiedById;
    private String verifiedByName;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DownPaymentResponse() {
    }

    public static DownPaymentResponse fromEntity(DownPayment entity) {
        if (entity == null) return null;
        DownPaymentResponse dto = new DownPaymentResponse();
        dto.setId(entity.getId());
        if (entity.getApplication() != null) {
            dto.setApplicationId(entity.getApplication().getId());
        }
        dto.setRequiredAmount(entity.getRequiredAmount());
        dto.setPaidAmount(entity.getPaidAmount());
        dto.setPaymentDate(entity.getPaymentDate());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setReferenceNumber(entity.getReferenceNumber());
        dto.setStatus(entity.getStatus());
        if (entity.getRecordedBy() != null) {
            dto.setRecordedById(entity.getRecordedBy().getId());
            dto.setRecordedByName(entity.getRecordedBy().getFullName());
        }
        if (entity.getVerifiedBy() != null) {
            dto.setVerifiedById(entity.getVerifiedBy().getId());
            dto.setVerifiedByName(entity.getVerifiedBy().getFullName());
        }
        dto.setRemarks(entity.getRemarks());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
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

    public Long getRecordedById() {
        return recordedById;
    }

    public void setRecordedById(Long recordedById) {
        this.recordedById = recordedById;
    }

    public String getRecordedByName() {
        return recordedByName;
    }

    public void setRecordedByName(String recordedByName) {
        this.recordedByName = recordedByName;
    }

    public Long getVerifiedById() {
        return verifiedById;
    }

    public void setVerifiedById(Long verifiedById) {
        this.verifiedById = verifiedById;
    }

    public String getVerifiedByName() {
        return verifiedByName;
    }

    public void setVerifiedByName(String verifiedByName) {
        this.verifiedByName = verifiedByName;
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
