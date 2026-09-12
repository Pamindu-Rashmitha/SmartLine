package com.smartline.loan.dto.response;

import com.smartline.loan.entity.enums.InspectionRating;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class VehicleInspectionResponse {

    private Long id;
    private Long applicationId;
    private Long inspectedById;
    private String inspectedByName;
    private LocalDate inspectionDate;
    private String physicalCondition;
    private String mechanicalCondition;
    private BigDecimal estimatedMarketValue;
    private BigDecimal forcedSaleValue;
    private BigDecimal recommendedValue;
    private InspectionRating overallRating;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String applicationNumber;
    private String applicantName;
    private String applicantPhone;
    private String vehicleMake;
    private String vehicleModel;
    private String vehicleCategory;
    private Integer yearOfManufacture;
    private String registrationNumber;
    private String engineNumber;
    private String chassisNumber;

    public VehicleInspectionResponse() {
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

    public Long getInspectedById() {
        return inspectedById;
    }

    public void setInspectedById(Long inspectedById) {
        this.inspectedById = inspectedById;
    }

    public String getInspectedByName() {
        return inspectedByName;
    }

    public void setInspectedByName(String inspectedByName) {
        this.inspectedByName = inspectedByName;
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

    public String getApplicationNumber() {
        return applicationNumber;
    }

    public void setApplicationNumber(String applicationNumber) {
        this.applicationNumber = applicationNumber;
    }

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public String getApplicantPhone() {
        return applicantPhone;
    }

    public void setApplicantPhone(String applicantPhone) {
        this.applicantPhone = applicantPhone;
    }

    public String getVehicleMake() {
        return vehicleMake;
    }

    public void setVehicleMake(String vehicleMake) {
        this.vehicleMake = vehicleMake;
    }

    public String getVehicleModel() {
        return vehicleModel;
    }

    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }

    public String getVehicleCategory() {
        return vehicleCategory;
    }

    public void setVehicleCategory(String vehicleCategory) {
        this.vehicleCategory = vehicleCategory;
    }

    public Integer getYearOfManufacture() {
        return yearOfManufacture;
    }

    public void setYearOfManufacture(Integer yearOfManufacture) {
        this.yearOfManufacture = yearOfManufacture;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
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
}
