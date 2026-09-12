package com.smartline.loan.dto.request;

import com.smartline.loan.entity.enums.InspectionRating;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class VehicleInspectionRequest {

    private LocalDate inspectionDate;

    private String physicalCondition;

    private String mechanicalCondition;

    @NotNull(message = "Estimated market value is required")
    private BigDecimal estimatedMarketValue;

    private BigDecimal forcedSaleValue;

    private BigDecimal recommendedValue;

    @NotNull(message = "Overall rating is required")
    private InspectionRating overallRating;

    private String remarks;

    private String engineNumber;

    private String chassisNumber;

    private String registrationNumber;

    public VehicleInspectionRequest() {
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

    public String getEngineNumber() {
        return engineNumber;
    }

    public void setEngineNumber(String engineNumber) {
        this.engineNumber = engineNumber;
    }

    public String getChassisNumber() {
        return chassisNumber;
    }

    public void setChassisNumber(String chassisNumber) {
        this.chassisNumber = chassisNumber;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }
}
