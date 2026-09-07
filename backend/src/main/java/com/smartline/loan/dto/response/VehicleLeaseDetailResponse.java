package com.smartline.loan.dto.response;

import com.smartline.loan.entity.enums.VehicleCategory;
import java.math.BigDecimal;

public class VehicleLeaseDetailResponse {
    private Long id;
    private VehicleCategory vehicleCategory;
    private String make;
    private String model;
    private Integer yearOfManufacture;
    private String registrationNumber;
    private String engineNumber;
    private String chassisNumber;
    private String color;
    private String vehicleCondition;
    private BigDecimal estimatedMarketValue;
    private BigDecimal downPaymentAmount;
    private Integer requestedTenure;
    private BigDecimal proposedInterestRate;
    private String dealerName;
    private String dealerContact;
    private BigDecimal calculatedMonthlyEmi;
    private BigDecimal calculatedTotalRepayable;

    public VehicleLeaseDetailResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
