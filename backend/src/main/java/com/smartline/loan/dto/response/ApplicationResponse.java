package com.smartline.loan.dto.response;

import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ApplicationResponse {
    private Long id;
    private String applicationNumber;
    private Long applicantId;
    private String applicantName;
    private String applicantNic;
    private String applicantPhone;
    private ApplicationType type;
    private ApplicationStatus status;
    private BigDecimal requestedAmount;
    private String purpose;
    private Integer tenureMonths;
    private BigDecimal monthlyEmi;
    private Integer guarantorCount;
    private Integer documentCount;
    private String verifiedByName;
    private LocalDateTime verifiedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;

    public ApplicationResponse() {
    }

    public static ApplicationResponse fromEntity(com.smartline.loan.entity.Application app) {
        if (app == null) return null;
        ApplicationResponse res = new ApplicationResponse();
        res.setId(app.getId());
        res.setApplicationNumber(app.getApplicationNumber());
        if (app.getApplicant() != null) {
            res.setApplicantId(app.getApplicant().getId());
            if (app.getApplicant().getUser() != null) {
                res.setApplicantName(app.getApplicant().getUser().getFullName());
                res.setApplicantPhone(app.getApplicant().getUser().getPhoneNumber());
            }
            res.setApplicantNic(app.getApplicant().getNicNumber());
        }
        res.setType(app.getType());
        res.setStatus(app.getStatus());
        res.setRequestedAmount(app.getRequestedAmount());
        res.setPurpose(app.getPurpose());
        if (app.getLoanDetail() != null) {
            res.setTenureMonths(app.getLoanDetail().getRequestedTenure());
            res.setMonthlyEmi(app.getLoanDetail().getCalculatedMonthlyEmi());
        } else if (app.getVehicleLeaseDetail() != null) {
            res.setTenureMonths(app.getVehicleLeaseDetail().getRequestedTenure());
            res.setMonthlyEmi(app.getVehicleLeaseDetail().getCalculatedMonthlyEmi());
        }
        res.setGuarantorCount(app.getGuarantors() != null ? app.getGuarantors().size() : 0);
        res.setDocumentCount(app.getDocuments() != null ? app.getDocuments().size() : 0);
        if (app.getVerifiedBy() != null) {
            res.setVerifiedByName(app.getVerifiedBy().getFullName());
        }
        res.setVerifiedAt(app.getVerifiedAt());
        res.setSubmittedAt(app.getSubmittedAt());
        res.setCreatedAt(app.getCreatedAt());
        return res;
    }

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

    public Long getApplicantId() {
        return applicantId;
    }

    public void setApplicantId(Long applicantId) {
        this.applicantId = applicantId;
    }

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public String getApplicantNic() {
        return applicantNic;
    }

    public void setApplicantNic(String applicantNic) {
        this.applicantNic = applicantNic;
    }

    public String getApplicantPhone() {
        return applicantPhone;
    }

    public void setApplicantPhone(String applicantPhone) {
        this.applicantPhone = applicantPhone;
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

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public BigDecimal getMonthlyEmi() {
        return monthlyEmi;
    }

    public void setMonthlyEmi(BigDecimal monthlyEmi) {
        this.monthlyEmi = monthlyEmi;
    }

    public Integer getGuarantorCount() {
        return guarantorCount;
    }

    public void setGuarantorCount(Integer guarantorCount) {
        this.guarantorCount = guarantorCount;
    }

    public Integer getDocumentCount() {
        return documentCount;
    }

    public void setDocumentCount(Integer documentCount) {
        this.documentCount = documentCount;
    }

    public String getVerifiedByName() {
        return verifiedByName;
    }

    public void setVerifiedByName(String verifiedByName) {
        this.verifiedByName = verifiedByName;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
