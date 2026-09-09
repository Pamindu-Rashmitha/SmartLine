package com.smartline.loan.dto.response;

import com.smartline.loan.entity.Installment;
import com.smartline.loan.entity.enums.InstallmentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class InstallmentResponse {

    private Long id;
    private Long scheduleId;
    private Long facilityId;
    private String facilityNumber;
    private Integer installmentNumber;
    private LocalDate dueDate;
    private BigDecimal principalPortion;
    private BigDecimal interestPortion;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private InstallmentStatus status;
    private LocalDate paidDate;
    private Long daysOverdue;
    private Integer paymentCount;
    private Integer followUpCount;

    public InstallmentResponse() {
    }

    public static InstallmentResponse fromEntity(Installment installment) {
        if (installment == null) return null;

        InstallmentResponse res = new InstallmentResponse();
        res.setId(installment.getId());
        if (installment.getSchedule() != null) {
            res.setScheduleId(installment.getSchedule().getId());
        }
        if (installment.getFacility() != null) {
            res.setFacilityId(installment.getFacility().getId());
            res.setFacilityNumber(installment.getFacility().getFacilityNumber());
        }
        res.setInstallmentNumber(installment.getInstallmentNumber());
        res.setDueDate(installment.getDueDate());
        res.setPrincipalPortion(installment.getPrincipalPortion());
        res.setInterestPortion(installment.getInterestPortion());
        res.setTotalAmount(installment.getTotalAmount());
        res.setPaidAmount(installment.getPaidAmount() != null ? installment.getPaidAmount() : BigDecimal.ZERO);
        res.setRemainingAmount(installment.getRemainingAmount());
        res.setStatus(installment.getStatus());
        res.setPaidDate(installment.getPaidDate());

        if (installment.getStatus() == InstallmentStatus.OVERDUE ||
                (installment.getDueDate().isBefore(LocalDate.now()) && installment.getStatus() != InstallmentStatus.PAID)) {
            res.setDaysOverdue(ChronoUnit.DAYS.between(installment.getDueDate(), LocalDate.now()));
        } else {
            res.setDaysOverdue(0L);
        }

        res.setPaymentCount(installment.getPayments() != null ? installment.getPayments().size() : 0);
        res.setFollowUpCount(installment.getCollectionFollowUps() != null ? installment.getCollectionFollowUps().size() : 0);

        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
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

    public Integer getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(Integer installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public BigDecimal getPrincipalPortion() {
        return principalPortion;
    }

    public void setPrincipalPortion(BigDecimal principalPortion) {
        this.principalPortion = principalPortion;
    }

    public BigDecimal getInterestPortion() {
        return interestPortion;
    }

    public void setInterestPortion(BigDecimal interestPortion) {
        this.interestPortion = interestPortion;
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

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(BigDecimal remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public InstallmentStatus getStatus() {
        return status;
    }

    public void setStatus(InstallmentStatus status) {
        this.status = status;
    }

    public LocalDate getPaidDate() {
        return paidDate;
    }

    public void setPaidDate(LocalDate paidDate) {
        this.paidDate = paidDate;
    }

    public Long getDaysOverdue() {
        return daysOverdue;
    }

    public void setDaysOverdue(Long daysOverdue) {
        this.daysOverdue = daysOverdue;
    }

    public Integer getPaymentCount() {
        return paymentCount;
    }

    public void setPaymentCount(Integer paymentCount) {
        this.paymentCount = paymentCount;
    }

    public Integer getFollowUpCount() {
        return followUpCount;
    }

    public void setFollowUpCount(Integer followUpCount) {
        this.followUpCount = followUpCount;
    }
}
