package com.smartline.loan.entity;

import com.smartline.loan.entity.enums.CreditDecision;
import com.smartline.loan.entity.enums.CreditRecommendation;
import com.smartline.loan.entity.enums.RiskLevel;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_assessments", indexes = {
    @Index(name = "idx_credit_assessments_application", columnList = "application_id"),
    @Index(name = "idx_credit_assessments_risk", columnList = "overallRiskLevel")
})
public class CreditAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessed_by", nullable = false)
    private User assessedBy;

    @Column(nullable = false)
    private LocalDateTime assessmentDate;

    @Column(nullable = false)
    private Boolean incomeVerified = false;

    @Column(length = 500)
    private String incomeRemarks;

    @Column(nullable = false)
    private Boolean employmentVerified = false;

    @Column(length = 500)
    private String employmentRemarks;

    @Column(length = 1000)
    private String debtToIncomeNotes;

    @Column(length = 1000)
    private String creditHistoryNotes;

    @Column(length = 1000)
    private String collateralNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RiskLevel overallRiskLevel = RiskLevel.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CreditRecommendation recommendation = CreditRecommendation.APPROVE;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CreditDecision decision;

    @Column(length = 1000)
    private String decisionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decided_by")
    private User decidedBy;

    private LocalDateTime decidedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public CreditAssessment() {
    }

    public CreditAssessment(Application application, User assessedBy, LocalDateTime assessmentDate,
                            Boolean incomeVerified, String incomeRemarks, Boolean employmentVerified,
                            String employmentRemarks, String debtToIncomeNotes, String creditHistoryNotes,
                            String collateralNotes, RiskLevel overallRiskLevel, CreditRecommendation recommendation) {
        this.application = application;
        this.assessedBy = assessedBy;
        this.assessmentDate = assessmentDate;
        this.incomeVerified = incomeVerified != null ? incomeVerified : false;
        this.incomeRemarks = incomeRemarks;
        this.employmentVerified = employmentVerified != null ? employmentVerified : false;
        this.employmentRemarks = employmentRemarks;
        this.debtToIncomeNotes = debtToIncomeNotes;
        this.creditHistoryNotes = creditHistoryNotes;
        this.collateralNotes = collateralNotes;
        this.overallRiskLevel = overallRiskLevel != null ? overallRiskLevel : RiskLevel.MEDIUM;
        this.recommendation = recommendation != null ? recommendation : CreditRecommendation.APPROVE;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.assessmentDate == null) {
            this.assessmentDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public User getAssessedBy() {
        return assessedBy;
    }

    public void setAssessedBy(User assessedBy) {
        this.assessedBy = assessedBy;
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

    public User getDecidedBy() {
        return decidedBy;
    }

    public void setDecidedBy(User decidedBy) {
        this.decidedBy = decidedBy;
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
