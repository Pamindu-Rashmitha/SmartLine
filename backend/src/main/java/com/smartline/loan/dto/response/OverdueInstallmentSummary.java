package com.smartline.loan.dto.response;

import com.smartline.loan.entity.Installment;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.entity.enums.InstallmentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class OverdueInstallmentSummary {

    private Long installmentId;
    private Integer installmentNumber;
    private Long facilityId;
    private String facilityNumber;
    private ApplicationType facilityType;
    private String borrowerName;
    private String borrowerPhone;
    private String borrowerEmail;
    private String borrowerNic;
    private LocalDate dueDate;
    private Long daysOverdue;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal overdueAmount;
    private InstallmentStatus status;
    private Integer followUpCount;
    private LocalDate lastFollowUpDate;
    private String lastFollowUpOutcome;

    public OverdueInstallmentSummary() {
    }

    public static OverdueInstallmentSummary fromEntity(Installment installment) {
        if (installment == null) return null;

        OverdueInstallmentSummary summary = new OverdueInstallmentSummary();
        summary.setInstallmentId(installment.getId());
        summary.setInstallmentNumber(installment.getInstallmentNumber());
        summary.setDueDate(installment.getDueDate());
        summary.setTotalAmount(installment.getTotalAmount());
        summary.setPaidAmount(installment.getPaidAmount() != null ? installment.getPaidAmount() : BigDecimal.ZERO);
        summary.setOverdueAmount(installment.getRemainingAmount());
        summary.setStatus(installment.getStatus());

        if (installment.getDueDate().isBefore(LocalDate.now())) {
            summary.setDaysOverdue(ChronoUnit.DAYS.between(installment.getDueDate(), LocalDate.now()));
        } else {
            summary.setDaysOverdue(0L);
        }

        if (installment.getFacility() != null) {
            summary.setFacilityId(installment.getFacility().getId());
            summary.setFacilityNumber(installment.getFacility().getFacilityNumber());
            summary.setFacilityType(installment.getFacility().getType());

            if (installment.getFacility().getApplication() != null &&
                    installment.getFacility().getApplication().getApplicant() != null) {
                var applicant = installment.getFacility().getApplication().getApplicant();
                summary.setBorrowerNic(applicant.getNicNumber());
                if (applicant.getUser() != null) {
                    summary.setBorrowerName(applicant.getUser().getFullName());
                    summary.setBorrowerPhone(applicant.getUser().getPhoneNumber());
                    summary.setBorrowerEmail(applicant.getUser().getEmail());
                }
            }
        }

        if (installment.getCollectionFollowUps() != null && !installment.getCollectionFollowUps().isEmpty()) {
            summary.setFollowUpCount(installment.getCollectionFollowUps().size());
            var latest = installment.getCollectionFollowUps().get(installment.getCollectionFollowUps().size() - 1);
            summary.setLastFollowUpDate(latest.getFollowUpDate());
            summary.setLastFollowUpOutcome(latest.getContactOutcome().name());
        } else {
            summary.setFollowUpCount(0);
        }

        return summary;
    }

    public Long getInstallmentId() {
        return installmentId;
    }

    public void setInstallmentId(Long installmentId) {
        this.installmentId = installmentId;
    }

    public Integer getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(Integer installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public Long getFacilityId() {
        return facilityId;
    }

    public void setFacilityId(Long facilityId) {
        this.facilityId = facilityId;
    }

    public String getFacilityNumber() {
        return facilityNumber;
    }

    public void setFacilityNumber(String facilityNumber) {
        this.facilityNumber = facilityNumber;
    }

    public ApplicationType getFacilityType() {
        return facilityType;
    }

    public void setFacilityType(ApplicationType facilityType) {
        this.facilityType = facilityType;
    }

    public String getBorrowerName() {
        return borrowerName;
    }

    public void setBorrowerName(String borrowerName) {
        this.borrowerName = borrowerName;
    }

    public String getBorrowerPhone() {
        return borrowerPhone;
    }

    public void setBorrowerPhone(String borrowerPhone) {
        this.borrowerPhone = borrowerPhone;
    }

    public String getBorrowerEmail() {
        return borrowerEmail;
    }

    public void setBorrowerEmail(String borrowerEmail) {
        this.borrowerEmail = borrowerEmail;
    }

    public String getBorrowerNic() {
        return borrowerNic;
    }

    public void setBorrowerNic(String borrowerNic) {
        this.borrowerNic = borrowerNic;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Long getDaysOverdue() {
        return daysOverdue;
    }

    public void setDaysOverdue(Long daysOverdue) {
        this.daysOverdue = daysOverdue;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public BigDecimal getOverdueAmount() {
        return overdueAmount;
    }

    public void setOverdueAmount(BigDecimal overdueAmount) {
        this.overdueAmount = overdueAmount;
    }

    public InstallmentStatus getStatus() {
        return status;
    }

    public void setStatus(InstallmentStatus status) {
        this.status = status;
    }

    public Integer getFollowUpCount() {
        return followUpCount;
    }

    public void setFollowUpCount(Integer followUpCount) {
        this.followUpCount = followUpCount;
    }

    public LocalDate getLastFollowUpDate() {
        return lastFollowUpDate;
    }

    public void setLastFollowUpDate(LocalDate lastFollowUpDate) {
        this.lastFollowUpDate = lastFollowUpDate;
    }

    public String getLastFollowUpOutcome() {
        return lastFollowUpOutcome;
    }

    public void setLastFollowUpOutcome(String lastFollowUpOutcome) {
        this.lastFollowUpOutcome = lastFollowUpOutcome;
    }
}
