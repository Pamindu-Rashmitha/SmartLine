package com.smartline.loan.service;

import com.smartline.loan.dto.request.DisbursalRequest;
import com.smartline.loan.dto.response.FacilityResponse;
import com.smartline.loan.entity.Agreement;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.Facility;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.AgreementStatus;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.entity.enums.FacilityStatus;
import com.smartline.loan.entity.enums.PaymentMethod;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.repository.AgreementRepository;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.ApplicationStatusHistoryRepository;
import com.smartline.loan.repository.FacilityRepository;
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
class DisbursalServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private AgreementRepository agreementRepository;

    @Mock
    private FacilityRepository facilityRepository;

    @Mock
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private DisbursalService disbursalService;

    private User financeOfficer;
    private Application application;
    private Agreement agreement;

    @BeforeEach
    void setUp() {
        financeOfficer = new User();
        financeOfficer.setId(7L);
        financeOfficer.setUsername("financeofficer");
        financeOfficer.setFullName("Asanka Bandara");

        application = new Application();
        application.setId(10L);
        application.setType(ApplicationType.LOAN);
        application.setStatus(ApplicationStatus.PENDING_DISBURSAL);

        agreement = new Agreement();
        agreement.setId(1L);
        agreement.setApplication(application);
        agreement.setAgreementNumber("AGR-2026-00010");
        agreement.setPrincipalAmount(new BigDecimal("500000.00"));
        agreement.setInterestRate(new BigDecimal("14.00"));
        agreement.setTenureMonths(12);
        agreement.setInstallmentAmount(new BigDecimal("47500.00"));
        agreement.setTotalPayable(new BigDecimal("570000.00"));
        agreement.setStatus(AgreementStatus.VERIFIED);
    }

    @Test
    void testRecordDisbursal_CreatesFacilityAndActivates() {
        when(applicationRepository.findById(10L)).thenReturn(Optional.of(application));
        when(agreementRepository.findByApplicationId(10L)).thenReturn(Optional.of(agreement));
        when(facilityRepository.findByApplicationId(10L)).thenReturn(Optional.empty());
        when(facilityRepository.save(any(Facility.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DisbursalRequest request = new DisbursalRequest();
        request.setDisbursementMethod(PaymentMethod.BANK_TRANSFER);
        request.setDisbursementReference("TXN-984210");
        request.setDisbursementDate(LocalDate.now());

        FacilityResponse response = disbursalService.recordDisbursal(10L, request, financeOfficer);

        assertNotNull(response);
        assertEquals(FacilityStatus.ACTIVE, response.getStatus());
        assertEquals(new BigDecimal("500000.00"), response.getPrincipalAmount());
        assertEquals(new BigDecimal("570000.00"), response.getOutstandingBalance());
        assertEquals(ApplicationStatus.DISBURSED, application.getStatus());
        verify(applicationRepository).save(application);
        verify(statusHistoryRepository).save(any());
    }

    @Test
    void testRecordDisbursal_ThrowsIfAgreementNotVerified() {
        agreement.setStatus(AgreementStatus.DRAFT);
        when(applicationRepository.findById(10L)).thenReturn(Optional.of(application));
        when(agreementRepository.findByApplicationId(10L)).thenReturn(Optional.of(agreement));

        DisbursalRequest request = new DisbursalRequest();
        request.setDisbursementMethod(PaymentMethod.BANK_TRANSFER);

        assertThrows(BadRequestException.class, () -> disbursalService.recordDisbursal(10L, request, financeOfficer));
        verify(facilityRepository, never()).save(any());
    }
}
