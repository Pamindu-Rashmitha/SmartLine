package com.smartline.loan.dto.response;

import com.smartline.loan.entity.Payment;
import com.smartline.loan.entity.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PaymentResponse {

    private Long id;
    private Long installmentId;
    private Integer installmentNumber;
    private Long facilityId;
    private String facilityNumber;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private PaymentMethod paymentMethod;
    private String referenceNumber;
    private String recordedByOfficer;
    private String remarks;
    private Boolean isCancelled;
    private String cancelledByOfficer;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private LocalDateTime createdAt;

    public PaymentResponse() {
    }

    public static PaymentResponse fromEntity(Payment payment) {
        if (payment == null) return null;

        PaymentResponse res = new PaymentResponse();
        res.setId(payment.getId());
        if (payment.getInstallment() != null) {
            res.setInstallmentId(payment.getInstallment().getId());
            res.setInstallmentNumber(payment.getInstallment().getInstallmentNumber());
        }
        if (payment.getFacility() != null) {
            res.setFacilityId(payment.getFacility().getId());
            res.setFacilityNumber(payment.getFacility().getFacilityNumber());
        }
        res.setAmount(payment.getAmount());
        res.setPaymentDate(payment.getPaymentDate());
        res.setPaymentMethod(payment.getPaymentMethod());
        res.setReferenceNumber(payment.getReferenceNumber());
        if (payment.getRecordedBy() != null) {
            res.setRecordedByOfficer(payment.getRecordedBy().getFullName());
        }
        res.setRemarks(payment.getRemarks());
        res.setIsCancelled(payment.getIsCancelled());
        if (payment.getCancelledBy() != null) {
            res.setCancelledByOfficer(payment.getCancelledBy().getFullName());
        }
        res.setCancelledAt(payment.getCancelledAt());
        res.setCancellationReason(payment.getCancellationReason());
        res.setCreatedAt(payment.getCreatedAt());

        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInstallmentId() {
        return installmentId;
    }

    public void setInstallmentId(Long installmentId) {
        this.installmentId = installmentId;
    }

    public Integer getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(Integer installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public Long getFacilityId() {
        return facilityId;
    }

    public void setFacilityId(Long facilityId) {
        this.facilityId = facilityId;
    }

    public String getFacilityNumber() {
        return facilityNumber;
    }

    public void setFacilityNumber(String facilityNumber) {
        this.facilityNumber = facilityNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
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

    public String getRecordedByOfficer() {
        return recordedByOfficer;
    }

    public void setRecordedByOfficer(String recordedByOfficer) {
        this.recordedByOfficer = recordedByOfficer;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Boolean getIsCancelled() {
        return isCancelled;
    }

    public void setIsCancelled(Boolean isCancelled) {
        this.isCancelled = isCancelled;
    }

    public String getCancelledByOfficer() {
        return cancelledByOfficer;
    }

    public void setCancelledByOfficer(String cancelledByOfficer) {
        this.cancelledByOfficer = cancelledByOfficer;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
