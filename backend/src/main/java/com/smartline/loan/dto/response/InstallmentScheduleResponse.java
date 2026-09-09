package com.smartline.loan.dto.response;

import com.smartline.loan.entity.Installment;
import com.smartline.loan.entity.InstallmentSchedule;
import com.smartline.loan.entity.enums.InstallmentStatus;
import com.smartline.loan.entity.enums.RepaymentFrequency;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class InstallmentScheduleResponse {

    private Long id;
    private Long facilityId;
    private String facilityNumber;
    private Integer totalInstallments;
    private BigDecimal installmentAmount;
    private RepaymentFrequency frequency;
    private LocalDate startDate;
    private String createdByOfficer;
    private LocalDateTime createdAt;

    private Integer paidInstallmentsCount = 0;
    private Integer overdueInstallmentsCount = 0;
    private Integer pendingInstallmentsCount = 0;
    private BigDecimal totalPaidAmount = BigDecimal.ZERO;
    private BigDecimal totalRemainingAmount = BigDecimal.ZERO;

    private List<InstallmentResponse> installments = new ArrayList<>();

    public InstallmentScheduleResponse() {
    }

    public static InstallmentScheduleResponse fromEntity(InstallmentSchedule schedule) {
        if (schedule == null) return null;

        InstallmentScheduleResponse res = new InstallmentScheduleResponse();
        res.setId(schedule.getId());
        if (schedule.getFacility() != null) {
            res.setFacilityId(schedule.getFacility().getId());
            res.setFacilityNumber(schedule.getFacility().getFacilityNumber());
        }
        res.setTotalInstallments(schedule.getTotalInstallments());
        res.setInstallmentAmount(schedule.getInstallmentAmount());
        res.setFrequency(schedule.getFrequency());
        res.setStartDate(schedule.getStartDate());
        if (schedule.getCreatedBy() != null) {
            res.setCreatedByOfficer(schedule.getCreatedBy().getFullName());
        }
        res.setCreatedAt(schedule.getCreatedAt());

        if (schedule.getInstallments() != null && !schedule.getInstallments().isEmpty()) {
            res.setInstallments(schedule.getInstallments().stream()
                    .map(InstallmentResponse::fromEntity)
                    .collect(Collectors.toList()));

            int paid = 0;
            int overdue = 0;
            int pending = 0;
            BigDecimal paidSum = BigDecimal.ZERO;
            BigDecimal remainingSum = BigDecimal.ZERO;

            for (Installment i : schedule.getInstallments()) {
                if (i.getStatus() == InstallmentStatus.PAID) {
                    paid++;
                } else if (i.getStatus() == InstallmentStatus.OVERDUE ||
                        (i.getDueDate().isBefore(LocalDate.now()) && i.getStatus() != InstallmentStatus.PAID)) {
                    overdue++;
                } else {
                    pending++;
                }

                if (i.getPaidAmount() != null) {
                    paidSum = paidSum.add(i.getPaidAmount());
                }
                remainingSum = remainingSum.add(i.getRemainingAmount());
            }

            res.setPaidInstallmentsCount(paid);
            res.setOverdueInstallmentsCount(overdue);
            res.setPendingInstallmentsCount(pending);
            res.setTotalPaidAmount(paidSum);
            res.setTotalRemainingAmount(remainingSum);
        }

        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Integer getTotalInstallments() {
        return totalInstallments;
    }

    public void setTotalInstallments(Integer totalInstallments) {
        this.totalInstallments = totalInstallments;
    }

    public BigDecimal getInstallmentAmount() {
        return installmentAmount;
    }

    public void setInstallmentAmount(BigDecimal installmentAmount) {
        this.installmentAmount = installmentAmount;
    }

    public RepaymentFrequency getFrequency() {
        return frequency;
    }

    public void setFrequency(RepaymentFrequency frequency) {
        this.frequency = frequency;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public String getCreatedByOfficer() {
        return createdByOfficer;
    }

    public void setCreatedByOfficer(String createdByOfficer) {
        this.createdByOfficer = createdByOfficer;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getPaidInstallmentsCount() {
        return paidInstallmentsCount;
    }

    public void setPaidInstallmentsCount(Integer paidInstallmentsCount) {
        this.paidInstallmentsCount = paidInstallmentsCount;
    }

    public Integer getOverdueInstallmentsCount() {
        return overdueInstallmentsCount;
    }

    public void setOverdueInstallmentsCount(Integer overdueInstallmentsCount) {
        this.overdueInstallmentsCount = overdueInstallmentsCount;
    }

    public Integer getPendingInstallmentsCount() {
        return pendingInstallmentsCount;
    }

    public void setPendingInstallmentsCount(Integer pendingInstallmentsCount) {
        this.pendingInstallmentsCount = pendingInstallmentsCount;
    }

    public BigDecimal getTotalPaidAmount() {
        return totalPaidAmount;
    }

    public void setTotalPaidAmount(BigDecimal totalPaidAmount) {
        this.totalPaidAmount = totalPaidAmount;
    }

    public BigDecimal getTotalRemainingAmount() {
        return totalRemainingAmount;
    }

    public void setTotalRemainingAmount(BigDecimal totalRemainingAmount) {
        this.totalRemainingAmount = totalRemainingAmount;
    }

    public List<InstallmentResponse> getInstallments() {
        return installments;
    }

    public void setInstallments(List<InstallmentResponse> installments) {
        this.installments = installments;
    }
}
