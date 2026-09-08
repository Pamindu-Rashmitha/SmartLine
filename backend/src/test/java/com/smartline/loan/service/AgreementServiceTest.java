package com.smartline.loan.service;

import com.smartline.loan.dto.request.AgreementCreateRequest;
import com.smartline.loan.dto.response.AgreementResponse;
import com.smartline.loan.entity.*;
import com.smartline.loan.entity.enums.AgreementStatus;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.entity.enums.DownPaymentStatus;
import com.smartline.loan.repository.AgreementRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AgreementServiceTest {

    @Mock
    private AgreementRepository agreementRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private DownPaymentRepository downPaymentRepository;

    @Mock
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @InjectMocks
    private AgreementService agreementService;

    private User legalOfficer;
    private Application application;
    private LoanDetail loanDetail;

    @BeforeEach
    void setUp() {
        legalOfficer = new User();
        legalOfficer.setId(6L);
        legalOfficer.setUsername("legalofficer");
        legalOfficer.setFullName("Dilani Wickramasinghe");

        application = new Application();
        application.setId(10L);
        application.setApplicationNumber("APP-2026-00010");
        application.setType(ApplicationType.LOAN);
        application.setStatus(ApplicationStatus.APPROVED);
        application.setRequestedAmount(new BigDecimal("500000.00"));

        loanDetail = new LoanDetail();
        loanDetail.setRequestedTenure(12);
        loanDetail.setProposedInterestRate(new BigDecimal("14.00"));
        loanDetail.setCalculatedMonthlyEmi(new BigDecimal("47500.00"));
        loanDetail.setCalculatedTotalRepayable(new BigDecimal("570000.00"));
        application.setLoanDetail(loanDetail);
    }

    @Test
    void testPrepareAgreement_SetsTermsAndTransitionsToAgreementPending() {
        when(applicationRepository.findById(10L)).thenReturn(Optional.of(application));
        when(agreementRepository.findByApplicationId(10L)).thenReturn(Optional.empty());
        when(agreementRepository.save(any(Agreement.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AgreementCreateRequest request = new AgreementCreateRequest();
        request.setTermsAndConditions("Custom covenants agreed");
        request.setDownPaymentRequired(new BigDecimal("50000.00"));

        AgreementResponse response = agreementService.prepareAgreement(10L, request, legalOfficer);

        assertNotNull(response);
        assertEquals(AgreementStatus.DRAFT, response.getStatus());
        assertEquals(new BigDecimal("500000.00"), response.getPrincipalAmount());
        assertEquals(new BigDecimal("50000.00"), response.getDownPaymentRequired());
        assertEquals(ApplicationStatus.AGREEMENT_PENDING, application.getStatus());
        verify(applicationRepository).save(application);
        verify(statusHistoryRepository).save(any());
    }

    @Test
    void testVerifyAgreement_WithDownPayment_TransitionsToPendingDownPayment() {
        Agreement agreement = new Agreement();
        agreement.setId(1L);
        agreement.setApplication(application);
        agreement.setAgreementNumber("AGR-2026-00010");
        agreement.setDownPaymentRequired(new BigDecimal("50000.00"));
        agreement.setStatus(AgreementStatus.DRAFT);
        application.setStatus(ApplicationStatus.AGREEMENT_PENDING);

        when(applicationRepository.findById(10L)).thenReturn(Optional.of(application));
        when(agreementRepository.findByApplicationId(10L)).thenReturn(Optional.of(agreement));
        when(agreementRepository.save(any(Agreement.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(downPaymentRepository.findByApplicationId(10L)).thenReturn(Optional.empty());

        AgreementResponse response = agreementService.verifyAgreement(10L, legalOfficer);

        assertEquals(AgreementStatus.VERIFIED, response.getStatus());
        assertEquals(ApplicationStatus.PENDING_DOWN_PAYMENT, application.getStatus());
        verify(downPaymentRepository).save(argThat(dp -> dp.getStatus() == DownPaymentStatus.PENDING));
        verify(statusHistoryRepository).save(any());
    }

    @Test
    void testVerifyAgreement_WithoutDownPayment_TransitionsToPendingDisbursal() {
        Agreement agreement = new Agreement();
        agreement.setId(2L);
        agreement.setApplication(application);
        agreement.setAgreementNumber("AGR-2026-00011");
        agreement.setDownPaymentRequired(BigDecimal.ZERO);
        agreement.setStatus(AgreementStatus.DRAFT);
        application.setStatus(ApplicationStatus.AGREEMENT_PENDING);

        when(applicationRepository.findById(10L)).thenReturn(Optional.of(application));
        when(agreementRepository.findByApplicationId(10L)).thenReturn(Optional.of(agreement));
        when(agreementRepository.save(any(Agreement.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(downPaymentRepository.findByApplicationId(10L)).thenReturn(Optional.empty());

        AgreementResponse response = agreementService.verifyAgreement(10L, legalOfficer);

        assertEquals(AgreementStatus.VERIFIED, response.getStatus());
        assertEquals(ApplicationStatus.PENDING_DISBURSAL, application.getStatus());
        verify(downPaymentRepository).save(argThat(dp -> dp.getStatus() == DownPaymentStatus.WAIVED));
        verify(statusHistoryRepository).save(any());
    }
}
