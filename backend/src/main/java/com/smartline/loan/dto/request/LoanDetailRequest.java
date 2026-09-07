package com.smartline.loan.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class LoanDetailRequest {

    private String loanPurpose;

    @NotNull(message = "Requested tenure is required")
    @Min(value = 3, message = "Tenure must be at least 3 months")
    @Max(value = 84, message = "Tenure cannot exceed 84 months")
    private Integer requestedTenure;

    @DecimalMin(value = "0.0", message = "Interest rate cannot be negative")
    private BigDecimal proposedInterestRate;

    private String existingLoans;

    private BigDecimal totalExistingDebt;

    public LoanDetailRequest() {
    }

    public String getLoanPurpose() {
        return loanPurpose;
    }

    public void setLoanPurpose(String loanPurpose) {
        this.loanPurpose = loanPurpose;
    }

    public Integer getRequestedTenure() {
        return requestedTenure;
    }

    public void setRequestedTenure(Integer requestedTenure) {
        this.requestedTenure = requestedTenure;
    }

    public BigDecimal getProposedInterestRate() {
        return proposedInterestRate;
    }

    public void setProposedInterestRate(BigDecimal proposedInterestRate) {
        this.proposedInterestRate = proposedInterestRate;
    }

    public String getExistingLoans() {
        return existingLoans;
    }

    public void setExistingLoans(String existingLoans) {
        this.existingLoans = existingLoans;
    }

    public BigDecimal getTotalExistingDebt() {
        return totalExistingDebt;
    }

    public void setTotalExistingDebt(BigDecimal totalExistingDebt) {
        this.totalExistingDebt = totalExistingDebt;
    }
}
