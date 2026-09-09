package com.smartline.loan.service;

import com.smartline.loan.dto.request.DownPaymentRecordRequest;
import com.smartline.loan.dto.response.DownPaymentResponse;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.DownPayment;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.DownPaymentStatus;
import com.smartline.loan.entity.enums.PaymentMethod;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.ApplicationStatusHistoryRepository;
import com.smartline.loan.repository.DownPaymentRepository;
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
class DownPaymentServiceTest {

    @Mock
    private DownPaymentRepository downPaymentRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private DownPaymentService downPaymentService;

    private User financeOfficer;
    private Application application;
    private DownPayment downPayment;

    @BeforeEach
    void setUp() {
        financeOfficer = new User();
        financeOfficer.setId(7L);
        financeOfficer.setUsername("financeofficer");
        financeOfficer.setFullName("Asanka Bandara");

        application = new Application();
        application.setId(10L);
        application.setStatus(ApplicationStatus.PENDING_DOWN_PAYMENT);

        downPayment = new DownPayment();
        downPayment.setId(1L);
        downPayment.setApplication(application);
        downPayment.setRequiredAmount(new BigDecimal("50000.00"));
        downPayment.setStatus(DownPaymentStatus.PENDING);
    }

    @Test
    void testRecordDownPayment_Paid_TransitionsToPendingDisbursal() {
        when(applicationRepository.findById(10L)).thenReturn(Optional.of(application));
        when(downPaymentRepository.findByApplicationId(10L)).thenReturn(Optional.of(downPayment));
        when(downPaymentRepository.save(any(DownPayment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DownPaymentRecordRequest request = new DownPaymentRecordRequest();
        request.setPaidAmount(new BigDecimal("50000.00"));
        request.setPaymentDate(LocalDate.now());
        request.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        request.setReferenceNumber("REF-12345");
        request.setStatus(DownPaymentStatus.PAID);
        request.setRemarks("Paid in full via online bank transfer");

        DownPaymentResponse response = downPaymentService.recordDownPayment(10L, request, financeOfficer);

        assertNotNull(response);
        assertEquals(DownPaymentStatus.PAID, response.getStatus());
        assertEquals(new BigDecimal("50000.00"), response.getPaidAmount());
        assertEquals(ApplicationStatus.PENDING_DISBURSAL, application.getStatus());
        verify(applicationRepository).save(application);
        verify(statusHistoryRepository).save(any());
    }
}
