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
import com.smartline.loan.entity.enums.PaymentMethod;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.repository.FacilityRepository;
import com.smartline.loan.repository.InstallmentRepository;
import com.smartline.loan.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private InstallmentRepository installmentRepository;

    @Mock
    private FacilityRepository facilityRepository;

    @InjectMocks
    private PaymentService paymentService;

    private User financeOfficer;
    private User adminUser;
    private Facility facility;
    private Installment installment;

    @BeforeEach
    void setUp() {
        financeOfficer = new User();
        financeOfficer.setId(7L);
        financeOfficer.setUsername("financeofficer");
        financeOfficer.setFullName("Asanka Bandara");

        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setFullName("System Admin");

        facility = new Facility();
        facility.setId(1L);
        facility.setFacilityNumber("FAC-2026-00001");
        facility.setStatus(FacilityStatus.ACTIVE);
        facility.setTotalPayable(new BigDecimal("339000.00"));
        facility.setTotalPaid(BigDecimal.ZERO);
        facility.setOutstandingBalance(new BigDecimal("339000.00"));

        installment = new Installment();
        installment.setId(10L);
        installment.setInstallmentNumber(1);
        installment.setFacility(facility);
        installment.setDueDate(LocalDate.now().plusDays(10));
        installment.setTotalAmount(new BigDecimal("28250.00"));
        installment.setPaidAmount(BigDecimal.ZERO);
        installment.setStatus(InstallmentStatus.PENDING);
    }

    @Test
    void testRecordPayment_FullInstallmentPayment() {
        when(installmentRepository.findById(10L)).thenReturn(Optional.of(installment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentRecordRequest request = new PaymentRecordRequest();
        request.setAmount(new BigDecimal("28250.00"));
        request.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        request.setReferenceNumber("SLIPS-001");
        request.setRemarks("Paid in full");

        PaymentResponse response = paymentService.recordPayment(10L, request, financeOfficer);

        assertNotNull(response);
        assertEquals(new BigDecimal("28250.00"), response.getAmount());
        assertEquals(InstallmentStatus.PAID, installment.getStatus());
        assertEquals(new BigDecimal("28250.00"), installment.getPaidAmount());
        assertEquals(new BigDecimal("28250.00"), facility.getTotalPaid());
        assertEquals(new BigDecimal("310750.00"), facility.getOutstandingBalance());

        verify(installmentRepository).save(installment);
        verify(facilityRepository).save(facility);
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void testRecordPayment_CompletesFacilityWhenZeroBalance() {
        facility.setOutstandingBalance(new BigDecimal("28250.00"));
        facility.setTotalPaid(new BigDecimal("310750.00"));

        when(installmentRepository.findById(10L)).thenReturn(Optional.of(installment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentRecordRequest request = new PaymentRecordRequest();
        request.setAmount(new BigDecimal("28250.00"));
        request.setPaymentMethod(PaymentMethod.CASH);

        PaymentResponse response = paymentService.recordPayment(10L, request, financeOfficer);

        assertNotNull(response);
        assertEquals(FacilityStatus.COMPLETED, facility.getStatus());
        assertEquals(0, BigDecimal.ZERO.compareTo(facility.getOutstandingBalance()));
        assertNotNull(facility.getCompletedAt());
    }

    @Test
    void testRecordPayment_ThrowsIfExceedsRemaining() {
        when(installmentRepository.findById(10L)).thenReturn(Optional.of(installment));

        PaymentRecordRequest request = new PaymentRecordRequest();
        request.setAmount(new BigDecimal("30000.00")); // exceeds 28,250.00

        assertThrows(BadRequestException.class, () ->
                paymentService.recordPayment(10L, request, financeOfficer));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void testCancelPayment_ReversesLedger() {
        installment.setPaidAmount(new BigDecimal("28250.00"));
        installment.setStatus(InstallmentStatus.PAID);
        facility.setTotalPaid(new BigDecimal("28250.00"));
        facility.setOutstandingBalance(new BigDecimal("310750.00"));

        Payment payment = new Payment();
        payment.setId(50L);
        payment.setInstallment(installment);
        payment.setFacility(facility);
        payment.setAmount(new BigDecimal("28250.00"));
        payment.setIsCancelled(false);

        when(paymentRepository.findById(50L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentCancelRequest cancelRequest = new PaymentCancelRequest("Bounced cheque reversal");

        PaymentResponse response = paymentService.cancelPayment(50L, cancelRequest, adminUser);

        assertNotNull(response);
        assertTrue(payment.getIsCancelled());
        assertEquals("Bounced cheque reversal", payment.getCancellationReason());
        assertEquals(0, BigDecimal.ZERO.compareTo(installment.getPaidAmount()));
        assertEquals(InstallmentStatus.PENDING, installment.getStatus());
        assertEquals(0, BigDecimal.ZERO.compareTo(facility.getTotalPaid()));
        assertEquals(0, new BigDecimal("339000.00").compareTo(facility.getOutstandingBalance()));

        verify(installmentRepository).save(installment);
        verify(facilityRepository).save(facility);
    }
}
