package com.smartline.loan.service;

import com.smartline.loan.dto.request.AuthorizationDecisionRequest;
import com.smartline.loan.dto.response.ApplicationDetailResponse;
import com.smartline.loan.entity.Applicant;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.CreditAssessment;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.entity.enums.CreditDecision;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.ApplicationStatusHistoryRepository;
import com.smartline.loan.repository.CreditAssessmentRepository;
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
class SeniorAuthorizationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private CreditAssessmentRepository creditAssessmentRepository;

    @Mock
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @Mock
    private ApplicationService applicationService;

    @InjectMocks
    private SeniorAuthorizationService seniorAuthorizationService;

    private User seniorManager;
    private Application application;
    private CreditAssessment assessment;

    @BeforeEach
    void setUp() {
        seniorManager = new User();
        seniorManager.setId(5L);
        seniorManager.setUsername("seniormanager");
        seniorManager.setFullName("Samantha Jayasinghe");
        seniorManager.setRole(Role.SENIOR_MANAGER);

        Applicant applicant = new Applicant();
        applicant.setId(10L);

        application = new Application("APP-2026-00003", applicant, ApplicationType.LOAN, new BigDecimal("1500000.00"), "Commercial");
        application.setId(300L);
        application.setStatus(ApplicationStatus.PENDING_SENIOR_APPROVAL);

        assessment = new CreditAssessment();
        assessment.setId(1L);
        assessment.setApplication(application);
    }

    @Test
    void testSeniorDecision_Approved() {
        when(applicationRepository.findById(300L)).thenReturn(Optional.of(application));
        when(creditAssessmentRepository.findByApplicationId(300L)).thenReturn(Optional.of(assessment));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));
        when(applicationService.getApplicationDetail(300L, seniorManager)).thenReturn(new ApplicationDetailResponse());

        AuthorizationDecisionRequest req = new AuthorizationDecisionRequest(true, "Authorized by executive committee");
        ApplicationDetailResponse res = seniorAuthorizationService.recordDecision(300L, req, seniorManager);

        assertNotNull(res);
        assertEquals(ApplicationStatus.APPROVED, application.getStatus());
        assertEquals(seniorManager, application.getDecidedBy());
        assertEquals(CreditDecision.APPROVED, assessment.getDecision());
        verify(statusHistoryRepository, times(1)).save(any());
    }

    @Test
    void testSeniorDecision_Rejected() {
        when(applicationRepository.findById(300L)).thenReturn(Optional.of(application));
        when(creditAssessmentRepository.findByApplicationId(300L)).thenReturn(Optional.of(assessment));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));
        when(applicationService.getApplicationDetail(300L, seniorManager)).thenReturn(new ApplicationDetailResponse());

        AuthorizationDecisionRequest req = new AuthorizationDecisionRequest(false, "Asset concentration risk exceeds limits");
        ApplicationDetailResponse res = seniorAuthorizationService.recordDecision(300L, req, seniorManager);

        assertNotNull(res);
        assertEquals(ApplicationStatus.REJECTED, application.getStatus());
        assertEquals(seniorManager, application.getDecidedBy());
        assertEquals("Asset concentration risk exceeds limits", application.getRejectionReason());
        assertEquals(CreditDecision.REJECTED, assessment.getDecision());
        verify(statusHistoryRepository, times(1)).save(any());
    }
}
