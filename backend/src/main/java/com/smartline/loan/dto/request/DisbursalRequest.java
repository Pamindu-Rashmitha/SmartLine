package com.smartline.loan.dto.request;

import com.smartline.loan.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class DisbursalRequest {

    @NotNull(message = "Disbursement method is required")
    private PaymentMethod disbursementMethod;

    private String disbursementReference;

    private LocalDate disbursementDate;

    private LocalDate firstInstallmentDate;

    private String remarks;

    public DisbursalRequest() {
    }

    public PaymentMethod getDisbursementMethod() {
        return disbursementMethod;
    }

    public void setDisbursementMethod(PaymentMethod disbursementMethod) {
        this.disbursementMethod = disbursementMethod;
    }

    public String getDisbursementReference() {
        return disbursementReference;
    }

    public void setDisbursementReference(String disbursementReference) {
        this.disbursementReference = disbursementReference;
    }

    public LocalDate getDisbursementDate() {
        return disbursementDate;
    }

    public void setDisbursementDate(LocalDate disbursementDate) {
        this.disbursementDate = disbursementDate;
    }

    public LocalDate getFirstInstallmentDate() {
        return firstInstallmentDate;
    }

    public void setFirstInstallmentDate(LocalDate firstInstallmentDate) {
        this.firstInstallmentDate = firstInstallmentDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
