package com.smartline.loan.service;

import com.smartline.loan.dto.request.PaymentCancelRequest;
import com.smartline.loan.dto.request.PaymentRecordRequest;
import com.smartline.loan.dto.response.PaymentResponse;
import com.smartline.loan.entity.Facility;
import com.smartline.loan.entity.Installment;
import com.smartline.loan.entity.Payment;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.FacilityStatus;
import com.smartline.loan.entity.enums.InstallmentStatus;
import com.smartline.loan.entity.enums.NotificationType;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.FacilityRepository;
import com.smartline.loan.repository.InstallmentRepository;
import com.smartline.loan.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InstallmentRepository installmentRepository;
    private final FacilityRepository facilityRepository;
    private final NotificationService notificationService;

    public PaymentService(PaymentRepository paymentRepository,
                          InstallmentRepository installmentRepository,
                          FacilityRepository facilityRepository,
                          NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.installmentRepository = installmentRepository;
        this.facilityRepository = facilityRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public PaymentResponse recordPayment(Long installmentId, PaymentRecordRequest request, User officer) {
        Installment installment = installmentRepository.findById(installmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Installment", "id", installmentId));

        Facility facility = installment.getFacility();
        if (facility == null) {
            throw new BadRequestException("Installment has no associated facility.");
        }

        if (installment.getStatus() == InstallmentStatus.PAID) {
            throw new BadRequestException("Installment #" + installment.getInstallmentNumber() + " is already fully settled.");
        }

        BigDecimal remaining = installment.getRemainingAmount();
        BigDecimal paymentAmount = request.getAmount();

        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero.");
        }

        if (paymentAmount.compareTo(remaining) > 0) {
            throw new BadRequestException(String.format("Payment amount LKR %.2f exceeds installment remaining balance LKR %.2f",
                    paymentAmount, remaining));
        }

        LocalDate paymentDate = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now();

        BigDecimal newPaidAmount = installment.getPaidAmount().add(paymentAmount);
        installment.setPaidAmount(newPaidAmount);
        installment.setPaidDate(paymentDate);

        if (newPaidAmount.compareTo(installment.getTotalAmount()) >= 0) {
            installment.setStatus(InstallmentStatus.PAID);
        } else {
            installment.setStatus(InstallmentStatus.PARTIALLY_PAID);
        }
        installmentRepository.save(installment);

        // Update Facility totals
        facility.setTotalPaid(facility.getTotalPaid().add(paymentAmount));
        BigDecimal newFacilityBalance = facility.getOutstandingBalance().subtract(paymentAmount);
        if (newFacilityBalance.compareTo(BigDecimal.ZERO) <= 0) {
            newFacilityBalance = BigDecimal.ZERO;
            facility.setStatus(FacilityStatus.COMPLETED);
            facility.setCompletedAt(LocalDateTime.now());
        }
        facility.setOutstandingBalance(newFacilityBalance);
        facilityRepository.save(facility);

        // Record payment transaction
        Payment payment = new Payment();
        payment.setInstallment(installment);
        payment.setFacility(facility);
        payment.setAmount(paymentAmount);
        payment.setPaymentDate(paymentDate);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setReferenceNumber(request.getReferenceNumber());
        payment.setRecordedBy(officer);
        payment.setRemarks(request.getRemarks());
        payment.setIsCancelled(false);

        Payment saved = paymentRepository.save(payment);

        if (facility.getApplication() != null && facility.getApplication().getApplicant() != null &&
                facility.getApplication().getApplicant().getUser() != null) {
            notificationService.sendToUser(facility.getApplication().getApplicant().getUser(), "Payment Received",
                    "Payment of LKR " + paymentAmount + " recorded for installment #" + installment.getInstallmentNumber() +
                    " on facility " + facility.getFacilityNumber() + ".",
                    NotificationType.STATUS_UPDATE, "FACILITY", facility.getId());
        }

        return PaymentResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByFacility(Long facilityId) {
        return paymentRepository.findByFacilityIdOrderByPaymentDateDescCreatedAtDesc(facilityId).stream()
                .map(PaymentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByInstallment(Long installmentId) {
        return paymentRepository.findByInstallmentIdOrderByCreatedAtDesc(installmentId).stream()
                .map(PaymentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse cancelPayment(Long paymentId, PaymentCancelRequest request, User adminUser) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        if (Boolean.TRUE.equals(payment.getIsCancelled())) {
            throw new BadRequestException("Payment #" + paymentId + " is already marked as cancelled.");
        }

        payment.setIsCancelled(true);
        payment.setCancelledBy(adminUser);
        payment.setCancelledAt(LocalDateTime.now());
        payment.setCancellationReason(request.getCancellationReason());
        paymentRepository.save(payment);

        // Reverse from Installment
        Installment installment = payment.getInstallment();
        BigDecimal reversedPaid = installment.getPaidAmount().subtract(payment.getAmount());
        if (reversedPaid.compareTo(BigDecimal.ZERO) < 0) {
            reversedPaid = BigDecimal.ZERO;
        }
        installment.setPaidAmount(reversedPaid);

        if (reversedPaid.compareTo(BigDecimal.ZERO) == 0) {
            installment.setPaidDate(null);
            if (installment.getDueDate().isBefore(LocalDate.now())) {
                installment.setStatus(InstallmentStatus.OVERDUE);
            } else {
                installment.setStatus(InstallmentStatus.PENDING);
            }
        } else {
            installment.setStatus(InstallmentStatus.PARTIALLY_PAID);
        }
        installmentRepository.save(installment);

        // Reverse from Facility
        Facility facility = payment.getFacility();
        facility.setTotalPaid(facility.getTotalPaid().subtract(payment.getAmount()));
        facility.setOutstandingBalance(facility.getOutstandingBalance().add(payment.getAmount()));

        if (facility.getStatus() == FacilityStatus.COMPLETED) {
            facility.setStatus(FacilityStatus.ACTIVE);
            facility.setCompletedAt(null);
        }
        facilityRepository.save(facility);

        if (facility.getApplication() != null && facility.getApplication().getApplicant() != null &&
                facility.getApplication().getApplicant().getUser() != null) {
            notificationService.sendToUser(facility.getApplication().getApplicant().getUser(), "Payment Reversal Notice",
                    "Payment of LKR " + payment.getAmount() + " on facility " + facility.getFacilityNumber() +
                    " has been reversed: " + request.getCancellationReason(),
                    NotificationType.WARNING, "FACILITY", facility.getId());
        }

        return PaymentResponse.fromEntity(payment);
    }
}
