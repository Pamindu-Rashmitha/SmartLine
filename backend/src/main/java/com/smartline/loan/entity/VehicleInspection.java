package com.smartline.loan.entity;

import com.smartline.loan.entity.enums.InspectionRating;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_inspections", indexes = {
    @Index(name = "idx_vehicle_inspections_application", columnList = "application_id"),
    @Index(name = "idx_vehicle_inspections_officer", columnList = "inspected_by")
})
public class VehicleInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspected_by", nullable = false)
    private User inspectedBy;

    @Column(nullable = false)
    private LocalDate inspectionDate;

    @Column(length = 1000)
    private String physicalCondition;

    @Column(length = 1000)
    private String mechanicalCondition;

    @Column(precision = 14, scale = 2)
    private BigDecimal estimatedMarketValue;

    @Column(precision = 14, scale = 2)
    private BigDecimal forcedSaleValue;

    @Column(precision = 14, scale = 2)
    private BigDecimal recommendedValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InspectionRating overallRating = InspectionRating.GOOD;

    @Column(length = 1000)
    private String remarks;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public VehicleInspection() {
    }

    public VehicleInspection(Application application, User inspectedBy, LocalDate inspectionDate,
                             String physicalCondition, String mechanicalCondition, BigDecimal estimatedMarketValue,
                             BigDecimal forcedSaleValue, BigDecimal recommendedValue, InspectionRating overallRating,
                             String remarks) {
        this.application = application;
        this.inspectedBy = inspectedBy;
        this.inspectionDate = inspectionDate != null ? inspectionDate : LocalDate.now();
        this.physicalCondition = physicalCondition;
        this.mechanicalCondition = mechanicalCondition;
        this.estimatedMarketValue = estimatedMarketValue;
        this.forcedSaleValue = forcedSaleValue;
        this.recommendedValue = recommendedValue;
        this.overallRating = overallRating != null ? overallRating : InspectionRating.GOOD;
        this.remarks = remarks;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.inspectionDate == null) {
            this.inspectionDate = LocalDate.now();
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

    public User getInspectedBy() {
        return inspectedBy;
    }

    public void setInspectedBy(User inspectedBy) {
        this.inspectedBy = inspectedBy;
    }

    public LocalDate getInspectionDate() {
        return inspectionDate;
    }

    public void setInspectionDate(LocalDate inspectionDate) {
        this.inspectionDate = inspectionDate;
    }

    public String getPhysicalCondition() {
        return physicalCondition;
    }

    public void setPhysicalCondition(String physicalCondition) {
        this.physicalCondition = physicalCondition;
    }

    public String getMechanicalCondition() {
        return mechanicalCondition;
    }

    public void setMechanicalCondition(String mechanicalCondition) {
        this.mechanicalCondition = mechanicalCondition;
    }

    public BigDecimal getEstimatedMarketValue() {
        return estimatedMarketValue;
    }

    public void setEstimatedMarketValue(BigDecimal estimatedMarketValue) {
        this.estimatedMarketValue = estimatedMarketValue;
    }

    public BigDecimal getForcedSaleValue() {
        return forcedSaleValue;
    }

    public void setForcedSaleValue(BigDecimal forcedSaleValue) {
        this.forcedSaleValue = forcedSaleValue;
    }

    public BigDecimal getRecommendedValue() {
        return recommendedValue;
    }

    public void setRecommendedValue(BigDecimal recommendedValue) {
        this.recommendedValue = recommendedValue;
    }

    public InspectionRating getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(InspectionRating overallRating) {
        this.overallRating = overallRating;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
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
