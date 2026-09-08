package com.smartline.loan.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "loan_details")
public class LoanDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Column(length = 255)
    private String loanPurpose;

    @Column(nullable = false)
    private Integer requestedTenure; // in months (e.g. 12, 24, 36, 48, 60)

    @Column(precision = 5, scale = 2)
    private BigDecimal proposedInterestRate; // annual % (e.g. 14.50)

    @Column(length = 500)
    private String existingLoans;

    @Column(precision = 14, scale = 2)
    private BigDecimal totalExistingDebt = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal calculatedMonthlyEmi;

    @Column(precision = 14, scale = 2)
    private BigDecimal calculatedTotalRepayable;

    public LoanDetail() {
    }

    public LoanDetail(Application application, String loanPurpose, Integer requestedTenure,
                      BigDecimal proposedInterestRate, String existingLoans, BigDecimal totalExistingDebt) {
        this.application = application;
        this.loanPurpose = loanPurpose;
        this.requestedTenure = requestedTenure;
        this.proposedInterestRate = proposedInterestRate;
        this.existingLoans = existingLoans;
        this.totalExistingDebt = totalExistingDebt != null ? totalExistingDebt : BigDecimal.ZERO;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
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

    public BigDecimal getCalculatedEmi() {
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

    public BigDecimal getTotalRepayable() {
        return calculatedTotalRepayable;
    }
}
