package com.smartline.loan.dto.response;

import com.smartline.loan.entity.Agreement;
import com.smartline.loan.entity.enums.AgreementStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AgreementResponse {

    private Long id;
    private Long applicationId;
    private String agreementNumber;
    private Long preparedById;
    private String preparedByName;
    private LocalDateTime preparedDate;
    private ApplicationType facilityType;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private BigDecimal installmentAmount;
    private BigDecimal totalPayable;
    private BigDecimal downPaymentRequired;
    private String termsAndConditions;
    private String specialConditions;
    private AgreementStatus status;
    private Long verifiedById;
    private String verifiedByName;
    private LocalDateTime verifiedDate;
    private LocalDateTime createdAt;

    public AgreementResponse() {
    }

    public static AgreementResponse fromEntity(Agreement entity) {
        if (entity == null) return null;
        AgreementResponse dto = new AgreementResponse();
        dto.setId(entity.getId());
        if (entity.getApplication() != null) {
            dto.setApplicationId(entity.getApplication().getId());
        }
        dto.setAgreementNumber(entity.getAgreementNumber());
        if (entity.getPreparedBy() != null) {
            dto.setPreparedById(entity.getPreparedBy().getId());
            dto.setPreparedByName(entity.getPreparedBy().getFullName());
        }
        dto.setPreparedDate(entity.getPreparedDate());
        dto.setFacilityType(entity.getFacilityType());
        dto.setPrincipalAmount(entity.getPrincipalAmount());
        dto.setInterestRate(entity.getInterestRate());
        dto.setTenureMonths(entity.getTenureMonths());
        dto.setInstallmentAmount(entity.getInstallmentAmount());
        dto.setTotalPayable(entity.getTotalPayable());
        dto.setDownPaymentRequired(entity.getDownPaymentRequired());
        dto.setTermsAndConditions(entity.getTermsAndConditions());
        dto.setSpecialConditions(entity.getSpecialConditions());
        dto.setStatus(entity.getStatus());
        if (entity.getVerifiedBy() != null) {
            dto.setVerifiedById(entity.getVerifiedBy().getId());
            dto.setVerifiedByName(entity.getVerifiedBy().getFullName());
        }
        dto.setVerifiedDate(entity.getVerifiedDate());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
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

    public String getAgreementNumber() {
        return agreementNumber;
    }

    public void setAgreementNumber(String agreementNumber) {
        this.agreementNumber = agreementNumber;
    }

    public Long getPreparedById() {
        return preparedById;
    }

    public void setPreparedById(Long preparedById) {
        this.preparedById = preparedById;
    }

    public String getPreparedByName() {
        return preparedByName;
    }

    public void setPreparedByName(String preparedByName) {
        this.preparedByName = preparedByName;
    }

    public LocalDateTime getPreparedDate() {
        return preparedDate;
    }

    public void setPreparedDate(LocalDateTime preparedDate) {
        this.preparedDate = preparedDate;
    }

    public ApplicationType getFacilityType() {
        return facilityType;
    }

    public void setFacilityType(ApplicationType facilityType) {
        this.facilityType = facilityType;
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

    public BigDecimal getDownPaymentRequired() {
        return downPaymentRequired;
    }

    public void setDownPaymentRequired(BigDecimal downPaymentRequired) {
        this.downPaymentRequired = downPaymentRequired;
    }

    public String getTermsAndConditions() {
        return termsAndConditions;
    }

    public void setTermsAndConditions(String termsAndConditions) {
        this.termsAndConditions = termsAndConditions;
    }

    public String getSpecialConditions() {
        return specialConditions;
    }

    public void setSpecialConditions(String specialConditions) {
        this.specialConditions = specialConditions;
    }

    public AgreementStatus getStatus() {
        return status;
    }

    public void setStatus(AgreementStatus status) {
        this.status = status;
    }

    public Long getVerifiedById() {
        return verifiedById;
    }

    public void setVerifiedById(Long verifiedById) {
        this.verifiedById = verifiedById;
    }

    public String getVerifiedByName() {
        return verifiedByName;
    }

    public void setVerifiedByName(String verifiedByName) {
        this.verifiedByName = verifiedByName;
    }

    public LocalDateTime getVerifiedDate() {
        return verifiedDate;
    }

    public void setVerifiedDate(LocalDateTime verifiedDate) {
        this.verifiedDate = verifiedDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
