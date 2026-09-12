package com.smartline.loan.dto.response;

import com.smartline.loan.entity.PaymentProof;
import com.smartline.loan.entity.enums.PaymentMethod;
import com.smartline.loan.entity.enums.PaymentProofStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PaymentProofResponse {

    private Long id;
    private Long installmentId;
    private Integer installmentNumber;
    private Long facilityId;
    private String facilityNumber;
    private Long borrowerId;
    private String borrowerName;
    private String borrowerEmail;
    private String slipFileName;
    private String slipFileType;
    private Long slipFileSize;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private PaymentMethod paymentMethod;
    private String referenceNumber;
    private String borrowerRemarks;
    private PaymentProofStatus status;
    private Long reviewedById;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
    private Long paymentId;
    private LocalDateTime createdAt;

    public PaymentProofResponse() {
    }

    public static PaymentProofResponse fromEntity(PaymentProof proof) {
        if (proof == null) return null;
        PaymentProofResponse res = new PaymentProofResponse();
        res.setId(proof.getId());
        if (proof.getInstallment() != null) {
            res.setInstallmentId(proof.getInstallment().getId());
            res.setInstallmentNumber(proof.getInstallment().getInstallmentNumber());
        }
        if (proof.getFacility() != null) {
            res.setFacilityId(proof.getFacility().getId());
            res.setFacilityNumber(proof.getFacility().getFacilityNumber());
        }
        if (proof.getUploadedBy() != null) {
            res.setBorrowerId(proof.getUploadedBy().getId());
            res.setBorrowerName(proof.getUploadedBy().getFullName());
            res.setBorrowerEmail(proof.getUploadedBy().getEmail());
        }
        res.setSlipFileName(proof.getSlipFileName());
        res.setSlipFileType(proof.getSlipFileType());
        res.setSlipFileSize(proof.getSlipFileSize());
        res.setAmount(proof.getAmount());
        res.setPaymentDate(proof.getPaymentDate());
        res.setPaymentMethod(proof.getPaymentMethod());
        res.setReferenceNumber(proof.getReferenceNumber());
        res.setBorrowerRemarks(proof.getBorrowerRemarks());
        res.setStatus(proof.getStatus());

        if (proof.getReviewedBy() != null) {
            res.setReviewedById(proof.getReviewedBy().getId());
            res.setReviewedByName(proof.getReviewedBy().getFullName());
        }
        res.setReviewedAt(proof.getReviewedAt());
        res.setRejectionReason(proof.getRejectionReason());

        if (proof.getPayment() != null) {
            res.setPaymentId(proof.getPayment().getId());
        }
        res.setCreatedAt(proof.getCreatedAt());
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

    public Long getBorrowerId() {
        return borrowerId;
    }

    public void setBorrowerId(Long borrowerId) {
        this.borrowerId = borrowerId;
    }

    public String getBorrowerName() {
        return borrowerName;
    }

    public void setBorrowerName(String borrowerName) {
        this.borrowerName = borrowerName;
    }

    public String getBorrowerEmail() {
        return borrowerEmail;
    }

    public void setBorrowerEmail(String borrowerEmail) {
        this.borrowerEmail = borrowerEmail;
    }

    public String getSlipFileName() {
        return slipFileName;
    }

    public void setSlipFileName(String slipFileName) {
        this.slipFileName = slipFileName;
    }

    public String getSlipFileType() {
        return slipFileType;
    }

    public void setSlipFileType(String slipFileType) {
        this.slipFileType = slipFileType;
    }

    public Long getSlipFileSize() {
        return slipFileSize;
    }

    public void setSlipFileSize(Long slipFileSize) {
        this.slipFileSize = slipFileSize;
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

    public String getBorrowerRemarks() {
        return borrowerRemarks;
    }

    public void setBorrowerRemarks(String borrowerRemarks) {
        this.borrowerRemarks = borrowerRemarks;
    }

    public PaymentProofStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentProofStatus status) {
        this.status = status;
    }

    public Long getReviewedById() {
        return reviewedById;
    }

    public void setReviewedById(Long reviewedById) {
        this.reviewedById = reviewedById;
    }

    public String getReviewedByName() {
        return reviewedByName;
    }

    public void setReviewedByName(String reviewedByName) {
        this.reviewedByName = reviewedByName;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
