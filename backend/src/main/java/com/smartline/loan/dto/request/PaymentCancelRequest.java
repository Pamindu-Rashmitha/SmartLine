package com.smartline.loan.dto.request;

import jakarta.validation.constraints.NotBlank;

public class PaymentCancelRequest {

    @NotBlank(message = "Cancellation reason is required for administrative payment voiding")
    private String cancellationReason;

    public PaymentCancelRequest() {
    }

    public PaymentCancelRequest(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }
}
