package com.smartline.loan.dto.response;

import com.smartline.loan.entity.enums.CreditDecision;
import com.smartline.loan.entity.enums.CreditRecommendation;
import com.smartline.loan.entity.enums.RiskLevel;
import java.time.LocalDateTime;

public class CreditAssessmentResponse {

    private Long id;
    private Long applicationId;
    private Long assessedById;
    private String assessedByName;
    private LocalDateTime assessmentDate;
    private Boolean incomeVerified;
    private String incomeRemarks;
    private Boolean employmentVerified;
    private String employmentRemarks;
    private String debtToIncomeNotes;
    private String creditHistoryNotes;
    private String collateralNotes;
    private RiskLevel overallRiskLevel;
    private CreditRecommendation recommendation;
    private CreditDecision decision;
    private String decisionReason;
    private Long decidedById;
    private String decidedByName;
    private LocalDateTime decidedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CreditAssessmentResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public Long getAssessedById() {
        return assessedById;
    }

    public void setAssessedById(Long assessedById) {
        this.assessedById = assessedById;
    }

    public String getAssessedByName() {
        return assessedByName;
    }

    public void setAssessedByName(String assessedByName) {
        this.assessedByName = assessedByName;
    }

    public LocalDateTime getAssessmentDate() {
        return assessmentDate;
    }

    public void setAssessmentDate(LocalDateTime assessmentDate) {
        this.assessmentDate = assessmentDate;
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

    public CreditDecision getDecision() {
        return decision;
    }

    public void setDecision(CreditDecision decision) {
        this.decision = decision;
    }

    public String getDecisionReason() {
        return decisionReason;
    }

    public void setDecisionReason(String decisionReason) {
        this.decisionReason = decisionReason;
    }

    public Long getDecidedById() {
        return decidedById;
    }

    public void setDecidedById(Long decidedById) {
        this.decidedById = decidedById;
    }

    public String getDecidedByName() {
        return decidedByName;
    }

    public void setDecidedByName(String decidedByName) {
        this.decidedByName = decidedByName;
    }

    public LocalDateTime getDecidedAt() {
        return decidedAt;
    }

    public void setDecidedAt(LocalDateTime decidedAt) {
        this.decidedAt = decidedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
