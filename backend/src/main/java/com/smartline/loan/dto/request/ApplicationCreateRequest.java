package com.smartline.loan.dto.request;

import com.smartline.loan.entity.enums.ApplicationType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public class ApplicationCreateRequest {

    @NotNull(message = "Application type is required")
    private ApplicationType type;

    @NotNull(message = "Requested amount is required")
    @DecimalMin(value = "10000.0", message = "Requested amount must be at least LKR 10,000")
    private BigDecimal requestedAmount;

    private String purpose;

    @Valid
    private LoanDetailRequest loanDetail;

    @Valid
    private VehicleLeaseDetailRequest vehicleLeaseDetail;

    @Valid
    private List<GuarantorRequest> guarantors;

    private boolean submitImmediately = false;

    public ApplicationCreateRequest() {
    }

    public ApplicationType getType() {
        return type;
    }

    public void setType(ApplicationType type) {
        this.type = type;
    }

    public BigDecimal getRequestedAmount() {
        return requestedAmount;
    }

    public void setRequestedAmount(BigDecimal requestedAmount) {
        this.requestedAmount = requestedAmount;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public LoanDetailRequest getLoanDetail() {
        return loanDetail;
    }

    public void setLoanDetail(LoanDetailRequest loanDetail) {
        this.loanDetail = loanDetail;
    }

    public VehicleLeaseDetailRequest getVehicleLeaseDetail() {
        return vehicleLeaseDetail;
    }

    public void setVehicleLeaseDetail(VehicleLeaseDetailRequest vehicleLeaseDetail) {
        this.vehicleLeaseDetail = vehicleLeaseDetail;
    }

    public List<GuarantorRequest> getGuarantors() {
        return guarantors;
    }

    public void setGuarantors(List<GuarantorRequest> guarantors) {
        this.guarantors = guarantors;
    }

    public boolean isSubmitImmediately() {
        return submitImmediately;
    }

    public void setSubmitImmediately(boolean submitImmediately) {
        this.submitImmediately = submitImmediately;
    }
}
