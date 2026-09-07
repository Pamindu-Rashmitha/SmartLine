package com.smartline.loan.dto.request;

import com.smartline.loan.entity.enums.VehicleCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class VehicleLeaseDetailRequest {

    private VehicleCategory vehicleCategory = VehicleCategory.MOTORCYCLE;

    @NotBlank(message = "Vehicle make is required")
    private String make;

    @NotBlank(message = "Vehicle model is required")
    private String model;

    @NotNull(message = "Year of manufacture is required")
    @Min(value = 1990, message = "Year must be 1990 or later")
    private Integer yearOfManufacture;

    private String registrationNumber;
    private String engineNumber;
    private String chassisNumber;
    private String color;
    private String vehicleCondition = "USED";

    @NotNull(message = "Estimated vehicle value is required")
    @DecimalMin(value = "10000.0", message = "Estimated value must be at least 10,000")
    private BigDecimal estimatedMarketValue;

    private BigDecimal downPaymentAmount;

    @NotNull(message = "Requested tenure is required")
    @Min(value = 3, message = "Tenure must be at least 3 months")
    @Max(value = 84, message = "Tenure cannot exceed 84 months")
    private Integer requestedTenure;

    private BigDecimal proposedInterestRate;

    private String dealerName;
    private String dealerContact;

    public VehicleLeaseDetailRequest() {
    }

    public VehicleCategory getVehicleCategory() {
        return vehicleCategory;
    }

    public void setVehicleCategory(VehicleCategory vehicleCategory) {
        this.vehicleCategory = vehicleCategory;
    }

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
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

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getVehicleCondition() {
        return vehicleCondition;
    }

    public void setVehicleCondition(String vehicleCondition) {
        this.vehicleCondition = vehicleCondition;
    }

    public BigDecimal getEstimatedMarketValue() {
        return estimatedMarketValue;
    }

    public void setEstimatedMarketValue(BigDecimal estimatedMarketValue) {
        this.estimatedMarketValue = estimatedMarketValue;
    }

    public BigDecimal getDownPaymentAmount() {
        return downPaymentAmount;
    }

    public void setDownPaymentAmount(BigDecimal downPaymentAmount) {
        this.downPaymentAmount = downPaymentAmount;
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

    public String getDealerName() {
        return dealerName;
    }

    public void setDealerName(String dealerName) {
        this.dealerName = dealerName;
    }

    public String getDealerContact() {
        return dealerContact;
    }

    public void setDealerContact(String dealerContact) {
        this.dealerContact = dealerContact;
    }
}
