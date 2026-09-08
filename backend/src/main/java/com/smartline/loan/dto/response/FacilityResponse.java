package com.smartline.loan.dto.response;

import com.smartline.loan.entity.Facility;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.entity.enums.FacilityStatus;
import com.smartline.loan.entity.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class FacilityResponse {

    private Long id;
    private String facilityNumber;
    private Long applicationId;
    private String applicationNumber;
    private Long applicantId;
    private String applicantName;
    private ApplicationType type;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private BigDecimal installmentAmount;
    private BigDecimal totalPayable;
    private BigDecimal totalPaid;
    private BigDecimal outstandingBalance;
    private LocalDate startDate;
    private LocalDate endDate;
    private FacilityStatus status;
    private Long disbursedById;
    private String disbursedByName;
    private LocalDateTime disbursedAt;
    private PaymentMethod disbursementMethod;
    private String disbursementReference;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;

    public FacilityResponse() {
    }

    public static FacilityResponse fromEntity(Facility entity) {
        if (entity == null) return null;
        FacilityResponse dto = new FacilityResponse();
        dto.setId(entity.getId());
        dto.setFacilityNumber(entity.getFacilityNumber());
        if (entity.getApplication() != null) {
            dto.setApplicationId(entity.getApplication().getId());
            dto.setApplicationNumber(entity.getApplication().getApplicationNumber());
            if (entity.getApplication().getApplicant() != null) {
                dto.setApplicantId(entity.getApplication().getApplicant().getId());
                dto.setApplicantName(entity.getApplication().getApplicant().getFullName());
            }
        }
        dto.setType(entity.getType());
        dto.setPrincipalAmount(entity.getPrincipalAmount());
        dto.setInterestRate(entity.getInterestRate());
        dto.setTenureMonths(entity.getTenureMonths());
        dto.setInstallmentAmount(entity.getInstallmentAmount());
        dto.setTotalPayable(entity.getTotalPayable());
        dto.setTotalPaid(entity.getTotalPaid());
        dto.setOutstandingBalance(entity.getOutstandingBalance());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setStatus(entity.getStatus());
        if (entity.getDisbursedBy() != null) {
            dto.setDisbursedById(entity.getDisbursedBy().getId());
            dto.setDisbursedByName(entity.getDisbursedBy().getFullName());
        }
        dto.setDisbursedAt(entity.getDisbursedAt());
        dto.setDisbursementMethod(entity.getDisbursementMethod());
        dto.setDisbursementReference(entity.getDisbursementReference());
        dto.setCompletedAt(entity.getCompletedAt());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFacilityNumber() {
        return facilityNumber;
    }

    public void setFacilityNumber(String facilityNumber) {
        this.facilityNumber = facilityNumber;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public String getApplicationNumber() {
        return applicationNumber;
    }

    public void setApplicationNumber(String applicationNumber) {
        this.applicationNumber = applicationNumber;
    }

    public Long getApplicantId() {
        return applicantId;
    }

    public void setApplicantId(Long applicantId) {
        this.applicantId = applicantId;
    }

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public ApplicationType getType() {
        return type;
    }

    public void setType(ApplicationType type) {
        this.type = type;
    }

    public BigDecimal getPrincipalAmount() {
        return principalAmount;
    }

    public void setPrincipalAmount(BigDecimal principalAmount) {
        this.principalAmount = principalAmount;
    }

    public BigDecimal getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public BigDecimal getInstallmentAmount() {
        return installmentAmount;
    }

    public void setInstallmentAmount(BigDecimal installmentAmount) {
        this.installmentAmount = installmentAmount;
    }

    public BigDecimal getTotalPayable() {
        return totalPayable;
    }

    public void setTotalPayable(BigDecimal totalPayable) {
        this.totalPayable = totalPayable;
    }

    public BigDecimal getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(BigDecimal totalPaid) {
        this.totalPaid = totalPaid;
    }

    public BigDecimal getOutstandingBalance() {
        return outstandingBalance;
    }

    public void setOutstandingBalance(BigDecimal outstandingBalance) {
        this.outstandingBalance = outstandingBalance;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public FacilityStatus getStatus() {
        return status;
    }

    public void setStatus(FacilityStatus status) {
        this.status = status;
    }

    public Long getDisbursedById() {
        return disbursedById;
    }

    public void setDisbursedById(Long disbursedById) {
        this.disbursedById = disbursedById;
    }

    public String getDisbursedByName() {
        return disbursedByName;
    }

    public void setDisbursedByName(String disbursedByName) {
        this.disbursedByName = disbursedByName;
    }

    public LocalDateTime getDisbursedAt() {
        return disbursedAt;
    }

    public void setDisbursedAt(LocalDateTime disbursedAt) {
        this.disbursedAt = disbursedAt;
    }

    public PaymentMethod getDisbursementMethod() {
        return disbursementMethod;
    }

    public void setDisbursementMethod(PaymentMethod disbursementMethod) {
        this.disbursementMethod = disbursementMethod;
    }

    public String getDisbursementReference() {
        return disbursementReference;
    }

    public void setDisbursementReference(String disbursementReference) {
        this.disbursementReference = disbursementReference;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
