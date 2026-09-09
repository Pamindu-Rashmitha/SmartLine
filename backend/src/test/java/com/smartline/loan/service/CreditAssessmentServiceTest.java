package com.smartline.loan.service;

import com.smartline.loan.dto.request.CreditAssessmentRequest;
import com.smartline.loan.dto.request.CreditDecisionRequest;
import com.smartline.loan.dto.response.ApplicationDetailResponse;
import com.smartline.loan.dto.response.CreditAssessmentResponse;
import com.smartline.loan.entity.Applicant;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.CreditAssessment;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.entity.enums.CreditDecision;
import com.smartline.loan.entity.enums.CreditRecommendation;
import com.smartline.loan.entity.enums.RiskLevel;
import com.smartline.loan.exception.BadRequestException;
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
class CreditAssessmentServiceTest {

    @Mock
    private CreditAssessmentRepository creditAssessmentRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @Mock
    private ApplicationService applicationService;

    @Mock
    private SystemConfigService systemConfigService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CreditAssessmentService creditAssessmentService;

    private User creditManager;
    private Application application;

    @BeforeEach
    void setUp() {
        creditManager = new User();
        creditManager.setId(4L);
        creditManager.setUsername("creditmanager");
        creditManager.setFullName("Nimali Silva");
        creditManager.setRole(Role.CREDIT_MANAGER);

        Applicant applicant = new Applicant();
        applicant.setId(10L);

        application = new Application("APP-2026-00001", applicant, ApplicationType.LOAN, new BigDecimal("400000.00"), "Personal Loan");
        application.setId(100L);
        application.setStatus(ApplicationStatus.VERIFIED);
    }

    @Test
    void testStartAssessment_Success() {
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));
        when(applicationService.getApplicationDetail(100L, creditManager)).thenReturn(new ApplicationDetailResponse());

        ApplicationDetailResponse res = creditAssessmentService.startAssessment(100L, creditManager);

        assertNotNull(res);
        assertEquals(ApplicationStatus.UNDER_CREDIT_ASSESSMENT, application.getStatus());
        verify(statusHistoryRepository, times(1)).save(any());
    }

    @Test
    void testRequestFieldInspection_ForVehicleLease_Success() {
        application.setType(ApplicationType.VEHICLE_LEASE);
        application.setStatus(ApplicationStatus.UNDER_CREDIT_ASSESSMENT);
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));
        when(applicationService.getApplicationDetail(100L, creditManager)).thenReturn(new ApplicationDetailResponse());

        ApplicationDetailResponse res = creditAssessmentService.requestFieldInspection(100L, "Inspection required", creditManager);

        assertNotNull(res);
        assertEquals(ApplicationStatus.PENDING_FIELD_INSPECTION, application.getStatus());
        verify(statusHistoryRepository, times(1)).save(any());
    }

    @Test
    void testRequestFieldInspection_ForLoan_ThrowsBadRequest() {
        application.setType(ApplicationType.LOAN);
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));

        assertThrows(BadRequestException.class, () ->
                creditAssessmentService.requestFieldInspection(100L, "Inspection", creditManager));
    }

    @Test
    void testSaveAssessment_Success() {
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(creditAssessmentRepository.findByApplicationId(100L)).thenReturn(Optional.empty());
        when(creditAssessmentRepository.save(any(CreditAssessment.class))).thenAnswer(i -> {
            CreditAssessment ca = i.getArgument(0);
            ca.setId(1L);
            return ca;
        });

        CreditAssessmentRequest req = new CreditAssessmentRequest();
        req.setIncomeVerified(true);
        req.setIncomeRemarks("Income confirmed");
        req.setEmploymentVerified(true);
        req.setOverallRiskLevel(RiskLevel.LOW);
        req.setRecommendation(CreditRecommendation.APPROVE);

        CreditAssessmentResponse res = creditAssessmentService.saveAssessment(100L, req, creditManager);

        assertNotNull(res);
        assertEquals(RiskLevel.LOW, res.getOverallRiskLevel());
        assertEquals(CreditRecommendation.APPROVE, res.getRecommendation());
        verify(creditAssessmentRepository, times(1)).save(any());
    }

    @Test
    void testRecordDecision_ApprovedBelowThreshold() {
        application.setStatus(ApplicationStatus.UNDER_CREDIT_ASSESSMENT);
        application.setRequestedAmount(new BigDecimal("400000.00")); // Below 500k

        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(creditAssessmentRepository.findByApplicationId(100L)).thenReturn(Optional.empty());
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));
        when(applicationService.getApplicationDetail(100L, creditManager)).thenReturn(new ApplicationDetailResponse());

        CreditDecisionRequest req = new CreditDecisionRequest(true, false, "Meets all credit parameters");
        ApplicationDetailResponse res = creditAssessmentService.recordDecision(100L, req, creditManager);

        assertNotNull(res);
        assertEquals(ApplicationStatus.APPROVED, application.getStatus());
        assertEquals(creditManager, application.getDecidedBy());
        verify(statusHistoryRepository, times(1)).save(any());
    }

    @Test
    void testRecordDecision_AutoEscalateAboveThreshold() {
        application.setStatus(ApplicationStatus.UNDER_CREDIT_ASSESSMENT);
        application.setRequestedAmount(new BigDecimal("800000.00")); // Above 500k threshold

        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(creditAssessmentRepository.findByApplicationId(100L)).thenReturn(Optional.empty());
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));
        when(applicationService.getApplicationDetail(100L, creditManager)).thenReturn(new ApplicationDetailResponse());

        CreditDecisionRequest req = new CreditDecisionRequest(true, false, "Recommended for approval");
        ApplicationDetailResponse res = creditAssessmentService.recordDecision(100L, req, creditManager);

        assertNotNull(res);
        assertEquals(ApplicationStatus.PENDING_SENIOR_APPROVAL, application.getStatus());
        verify(statusHistoryRepository, times(1)).save(any());
    }

    @Test
    void testRecordDecision_Reject() {
        application.setStatus(ApplicationStatus.UNDER_CREDIT_ASSESSMENT);

        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(creditAssessmentRepository.findByApplicationId(100L)).thenReturn(Optional.empty());
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));
        when(applicationService.getApplicationDetail(100L, creditManager)).thenReturn(new ApplicationDetailResponse());

        CreditDecisionRequest req = new CreditDecisionRequest(false, false, "High DTI ratio exceeds acceptable thresholds");
        ApplicationDetailResponse res = creditAssessmentService.recordDecision(100L, req, creditManager);

        assertNotNull(res);
        assertEquals(ApplicationStatus.REJECTED, application.getStatus());
        assertEquals("High DTI ratio exceeds acceptable thresholds", application.getRejectionReason());
        verify(statusHistoryRepository, times(1)).save(any());
    }
}
