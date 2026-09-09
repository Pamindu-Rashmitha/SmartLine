package com.smartline.loan.dto.request;

import com.smartline.loan.entity.enums.RepaymentFrequency;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class InstallmentScheduleCreateRequest {

    private RepaymentFrequency frequency = RepaymentFrequency.MONTHLY;

    private LocalDate startDate;

    public InstallmentScheduleCreateRequest() {
    }

    public InstallmentScheduleCreateRequest(RepaymentFrequency frequency, LocalDate startDate) {
        this.frequency = frequency;
        this.startDate = startDate;
    }

    public RepaymentFrequency getFrequency() {
        return frequency != null ? frequency : RepaymentFrequency.MONTHLY;
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
}
