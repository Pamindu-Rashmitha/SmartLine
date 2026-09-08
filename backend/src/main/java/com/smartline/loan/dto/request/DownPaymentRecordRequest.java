package com.smartline.loan.dto.request;

import com.smartline.loan.entity.enums.DownPaymentStatus;
import com.smartline.loan.entity.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDate;

public class DownPaymentRecordRequest {

    @DecimalMin(value = "0.0", inclusive = true, message = "Paid amount must be non-negative")
    private BigDecimal paidAmount;

    private LocalDate paymentDate;

    private PaymentMethod paymentMethod;

    private String referenceNumber;

    private DownPaymentStatus status;

    private String remarks;

    public DownPaymentRecordRequest() {
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
