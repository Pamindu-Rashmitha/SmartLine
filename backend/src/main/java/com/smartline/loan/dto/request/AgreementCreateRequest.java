package com.smartline.loan.dto.request;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public class AgreementCreateRequest {

    @DecimalMin(value = "0.0", inclusive = true, message = "Down payment required must be 0 or positive")
    private BigDecimal downPaymentRequired;

    private String termsAndConditions;

    private String specialConditions;

    public AgreementCreateRequest() {
    }

    public BigDecimal getDownPaymentRequired() {
        return downPaymentRequired;
    }

    public void setDownPaymentRequired(BigDecimal downPaymentRequired) {
        this.downPaymentRequired = downPaymentRequired;
    }

    public String getTermsAndConditions() {
        return termsAndConditions;
    }

    public void setTermsAndConditions(String termsAndConditions) {
        this.termsAndConditions = termsAndConditions;
    }

    public String getSpecialConditions() {
        return specialConditions;
    }

    public void setSpecialConditions(String specialConditions) {
        this.specialConditions = specialConditions;
    }
}
