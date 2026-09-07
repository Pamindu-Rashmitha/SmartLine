package com.smartline.loan.dto.request;

import com.smartline.loan.entity.enums.VerificationStatus;
import jakarta.validation.constraints.NotNull;

public class DocumentVerifyRequest {

    @NotNull(message = "Verification status is required")
    private VerificationStatus status;

    private String remarks;

    public DocumentVerifyRequest() {
    }

    public DocumentVerifyRequest(VerificationStatus status, String remarks) {
        this.status = status;
        this.remarks = remarks;
    }

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
