package com.smartline.loan.dto.request;

import jakarta.validation.constraints.NotNull;

public class CreditDecisionRequest {

    @NotNull(message = "Approval flag is required")
    private Boolean approved;

    private Boolean referToSenior = false;

    private String remarks;

    public CreditDecisionRequest() {
    }

    public CreditDecisionRequest(Boolean approved, Boolean referToSenior, String remarks) {
        this.approved = approved;
        this.referToSenior = referToSenior;
        this.remarks = remarks;
    }

    public Boolean getApproved() {
        return approved;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }

    public Boolean getReferToSenior() {
        return referToSenior;
    }

    public void setReferToSenior(Boolean referToSenior) {
        this.referToSenior = referToSenior;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
