package com.smartline.loan.service;

import com.smartline.loan.dto.request.DocumentVerifyRequest;
import com.smartline.loan.dto.request.VerificationDecisionRequest;
import com.smartline.loan.dto.response.ApplicationDetailResponse;
import com.smartline.loan.dto.response.DocumentResponse;
import com.smartline.loan.entity.*;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.entity.enums.DocumentType;
import com.smartline.loan.entity.enums.VerificationStatus;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.ApplicationStatusHistoryRepository;
import com.smartline.loan.repository.DocumentRepository;
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
class VerificationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @Mock
    private ApplicationService applicationService;

    @Mock
    private DocumentService documentService;

    @InjectMocks
    private VerificationService verificationService;

    private User loanOfficer;
    private Application application;

    @BeforeEach
    void setUp() {
        loanOfficer = new User();
        loanOfficer.setId(2L);
        loanOfficer.setUsername("loanofficer");
        loanOfficer.setFullName("Kasun Fernando");
        loanOfficer.setRole(Role.LOAN_OFFICER);

        Applicant applicant = new Applicant();
        applicant.setId(10L);

        application = new Application("APP-2026-00001", applicant, ApplicationType.LOAN, new BigDecimal("600000.00"), "Personal");
        application.setId(100L);
        application.setStatus(ApplicationStatus.SUBMITTED);
    }

    @Test
    void testStartVerification_Success() {
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));
        when(applicationService.getApplicationDetail(100L, loanOfficer)).thenReturn(new ApplicationDetailResponse());

        ApplicationDetailResponse res = verificationService.startVerification(100L, loanOfficer);

        assertNotNull(res);
        assertEquals(ApplicationStatus.UNDER_VERIFICATION, application.getStatus());
        assertEquals(loanOfficer, application.getVerifiedBy());
        verify(statusHistoryRepository, times(1)).save(any());
    }

    @Test
    void testCompleteVerification_Approve() {
        application.setStatus(ApplicationStatus.UNDER_VERIFICATION);
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));
        when(applicationService.getApplicationDetail(100L, loanOfficer)).thenReturn(new ApplicationDetailResponse());

        VerificationDecisionRequest request = new VerificationDecisionRequest(true, "All KYC files authentic");
        ApplicationDetailResponse res = verificationService.completeVerification(100L, request, loanOfficer);

        assertNotNull(res);
        assertEquals(ApplicationStatus.VERIFIED, application.getStatus());
        verify(statusHistoryRepository, times(1)).save(any());
    }

    @Test
    void testCompleteVerification_Reject() {
        application.setStatus(ApplicationStatus.UNDER_VERIFICATION);
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));
        when(applicationService.getApplicationDetail(100L, loanOfficer)).thenReturn(new ApplicationDetailResponse());

        VerificationDecisionRequest request = new VerificationDecisionRequest(false, "Unsatisfactory disposable income");
        ApplicationDetailResponse res = verificationService.completeVerification(100L, request, loanOfficer);

        assertNotNull(res);
        assertEquals(ApplicationStatus.REJECTED, application.getStatus());
        assertEquals("Unsatisfactory disposable income", application.getRejectionReason());
        verify(statusHistoryRepository, times(1)).save(any());
    }
}
