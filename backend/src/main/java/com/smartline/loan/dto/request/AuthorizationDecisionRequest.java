package com.smartline.loan.dto.request;

import jakarta.validation.constraints.NotNull;

public class AuthorizationDecisionRequest {

    @NotNull(message = "Decision status is required")
    private Boolean approved;

    private String remarks;

    public AuthorizationDecisionRequest() {
    }

    public AuthorizationDecisionRequest(Boolean approved, String remarks) {
        this.approved = approved;
        this.remarks = remarks;
    }

    public Boolean getApproved() {
        return approved;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
