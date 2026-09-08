package com.smartline.loan.entity;

import com.smartline.loan.entity.enums.VehicleCategory;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "vehicle_lease_details")
public class VehicleLeaseDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VehicleCategory vehicleCategory = VehicleCategory.MOTORCYCLE;

    @Column(nullable = false, length = 100)
    private String make;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false)
    private Integer yearOfManufacture;

    @Column(length = 50)
    private String registrationNumber;

    @Column(length = 100)
    private String engineNumber;

    @Column(length = 100)
    private String chassisNumber;

    @Column(length = 50)
    private String color;

    @Column(length = 20)
    private String vehicleCondition = "USED"; // NEW / USED

    @Column(precision = 14, scale = 2)
    private BigDecimal estimatedMarketValue;

    @Column(precision = 14, scale = 2)
    private BigDecimal downPaymentAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer requestedTenure; // in months

    @Column(precision = 5, scale = 2)
    private BigDecimal proposedInterestRate;

    @Column(length = 150)
    private String dealerName;

    @Column(length = 50)
    private String dealerContact;

    @Column(precision = 14, scale = 2)
    private BigDecimal calculatedMonthlyEmi;

    @Column(precision = 14, scale = 2)
    private BigDecimal calculatedTotalRepayable;

    public VehicleLeaseDetail() {
    }

    public VehicleLeaseDetail(Application application, VehicleCategory vehicleCategory, String make,
                              String model, Integer yearOfManufacture, BigDecimal estimatedMarketValue,
                              BigDecimal downPaymentAmount, Integer requestedTenure, BigDecimal proposedInterestRate) {
        this.application = application;
        this.vehicleCategory = vehicleCategory;
        this.make = make;
        this.model = model;
        this.yearOfManufacture = yearOfManufacture;
        this.estimatedMarketValue = estimatedMarketValue;
        this.downPaymentAmount = downPaymentAmount != null ? downPaymentAmount : BigDecimal.ZERO;
        this.requestedTenure = requestedTenure;
        this.proposedInterestRate = proposedInterestRate;
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

    public Integer getYear() {
        return yearOfManufacture;
    }

    public BigDecimal getMarketValue() {
        return estimatedMarketValue;
    }

    public BigDecimal getDownPayment() {
        return downPaymentAmount;
    }

    public BigDecimal getCalculatedMonthlyInstallment() {
        return calculatedMonthlyEmi;
    }

    public BigDecimal getTotalLeasePayable() {
        return calculatedTotalRepayable;
    }
}
