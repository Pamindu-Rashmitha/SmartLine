package com.smartline.loan.dto.response;

import java.math.BigDecimal;

public class LoanDetailResponse {
    private Long id;
    private String loanPurpose;
    private Integer requestedTenure;
    private BigDecimal proposedInterestRate;
    private String existingLoans;
    private BigDecimal totalExistingDebt;
    private BigDecimal calculatedMonthlyEmi;
    private BigDecimal calculatedTotalRepayable;

    public LoanDetailResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public BigDecimal getCalculatedMonthlyEmi() {
        return calculatedMonthlyEmi;
    }

    public void setCalculatedMonthlyEmi(BigDecimal calculatedMonthlyEmi) {
        this.calculatedMonthlyEmi = calculatedMonthlyEmi;
    }

    public BigDecimal getCalculatedTotalRepayable() {
        return calculatedTotalRepayable;
    }

    public void setCalculatedTotalRepayable(BigDecimal calculatedTotalRepayable) {
        this.calculatedTotalRepayable = calculatedTotalRepayable;
    }
}
