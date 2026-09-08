package com.smartline.loan.dto.request;

import com.smartline.loan.entity.enums.CreditRecommendation;
import com.smartline.loan.entity.enums.RiskLevel;
import jakarta.validation.constraints.NotNull;

public class CreditAssessmentRequest {

    private Boolean incomeVerified = false;
    private String incomeRemarks;

    private Boolean employmentVerified = false;
    private String employmentRemarks;

    private String debtToIncomeNotes;
    private String creditHistoryNotes;
    private String collateralNotes;

    @NotNull(message = "Overall risk level is required")
    private RiskLevel overallRiskLevel;

    @NotNull(message = "Recommendation is required")
    private CreditRecommendation recommendation;

    private String remarks;

    public CreditAssessmentRequest() {
    }

    public Boolean getIncomeVerified() {
        return incomeVerified;
    }

    public void setIncomeVerified(Boolean incomeVerified) {
        this.incomeVerified = incomeVerified;
    }

    public String getIncomeRemarks() {
        return incomeRemarks;
    }

    public void setIncomeRemarks(String incomeRemarks) {
        this.incomeRemarks = incomeRemarks;
    }

    public Boolean getEmploymentVerified() {
        return employmentVerified;
    }

    public void setEmploymentVerified(Boolean employmentVerified) {
        this.employmentVerified = employmentVerified;
    }

    public String getEmploymentRemarks() {
        return employmentRemarks;
    }

    public void setEmploymentRemarks(String employmentRemarks) {
        this.employmentRemarks = employmentRemarks;
    }

    public String getDebtToIncomeNotes() {
        return debtToIncomeNotes;
    }

    public void setDebtToIncomeNotes(String debtToIncomeNotes) {
        this.debtToIncomeNotes = debtToIncomeNotes;
    }

    public String getCreditHistoryNotes() {
        return creditHistoryNotes;
    }

    public void setCreditHistoryNotes(String creditHistoryNotes) {
        this.creditHistoryNotes = creditHistoryNotes;
    }

    public String getCollateralNotes() {
        return collateralNotes;
    }

    public void setCollateralNotes(String collateralNotes) {
        this.collateralNotes = collateralNotes;
    }

    public RiskLevel getOverallRiskLevel() {
        return overallRiskLevel;
    }

    public void setOverallRiskLevel(RiskLevel overallRiskLevel) {
        this.overallRiskLevel = overallRiskLevel;
    }

    public CreditRecommendation getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(CreditRecommendation recommendation) {
        this.recommendation = recommendation;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
