package com.smartline.loan.service;

import com.smartline.loan.dto.response.DashboardStatsResponse;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.repository.*;
import com.smartline.loan.service.impl.DashboardServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private FacilityRepository facilityRepository;

    @Mock
    private InstallmentRepository installmentRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VehicleInspectionRepository vehicleInspectionRepository;

    @Mock
    private AgreementRepository agreementRepository;

    @Mock
    private GuarantorRepository guarantorRepository;

    @Mock
    private CollectionFollowUpRepository collectionFollowUpRepository;

    @Mock
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @Mock
    private ApplicationService applicationService;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    private User applicantUser;
    private User officerUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        applicantUser = new User();
        applicantUser.setId(10L);
        applicantUser.setUsername("applicant1");
        applicantUser.setFullName("Saman Kumara");
        applicantUser.setRole(Role.APPLICANT);

        officerUser = new User();
        officerUser.setId(20L);
        officerUser.setUsername("loanofficer1");
        officerUser.setFullName("Loan Officer One");
        officerUser.setRole(Role.LOAN_OFFICER);

        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin1");
        adminUser.setFullName("System Admin");
        adminUser.setRole(Role.ADMIN);

        // Default distributions mock
        when(applicationRepository.countByStatusGrouped()).thenReturn(Collections.emptyList());
        when(applicationRepository.countByTypeGrouped()).thenReturn(Collections.emptyList());
    }

    @Test
    void getDashboardStats_forApplicant_returnsCorrectMetrics() {
        when(applicationRepository.countByApplicantUserId(10L)).thenReturn(2L);
        when(applicationRepository.countByApplicantUserIdAndStatusNotIn(eq(10L), any())).thenReturn(1L);
        when(facilityRepository.countByApplicationApplicantUserIdAndStatus(eq(10L), any())).thenReturn(1L);
        when(facilityRepository.sumOutstandingBalanceByApplicantUserId(10L)).thenReturn(new BigDecimal("450000.00"));
        when(installmentRepository.findFirstByFacilityApplicationApplicantUserIdAndStatusInOrderByDueDateAsc(eq(10L), any()))
                .thenReturn(Optional.empty());
        when(applicationRepository.findTop5ByApplicantUserIdOrderByCreatedAtDesc(10L)).thenReturn(new ArrayList<>());
        when(installmentRepository.findTop5ByFacilityApplicationApplicantUserIdAndStatusInOrderByDueDateAsc(eq(10L), any()))
                .thenReturn(new ArrayList<>());

        DashboardStatsResponse response = dashboardService.getDashboardStats(applicantUser, null);

        assertNotNull(response);
        assertEquals(Role.APPLICANT, response.getRole());
        assertEquals(4, response.getKpiCards().size());
        assertEquals("My Applications", response.getKpiCards().get(0).getTitle());
        assertEquals("2", response.getKpiCards().get(0).getValue());
        assertEquals("Active Facilities", response.getKpiCards().get(1).getTitle());
        assertEquals("1", response.getKpiCards().get(1).getValue());
        assertNotNull(response.getFinancialSummary());
        assertEquals(new BigDecimal("450000.00"), response.getFinancialSummary().getTotalOutstanding());
    }

    @Test
    void getDashboardStats_forLoanOfficer_returnsCorrectCards() {
        when(applicationRepository.countByStatus(any())).thenReturn(5L);
        when(applicationRepository.countByVerifiedAtBetween(any(), any())).thenReturn(3L);
        when(applicationRepository.countByDecidedAtBetweenAndStatus(any(), any(), any())).thenReturn(1L);
        when(applicationRepository.findTop10ByStatusInOrderByCreatedAtDesc(any())).thenReturn(new ArrayList<>());

        DashboardStatsResponse response = dashboardService.getDashboardStats(officerUser, null);

        assertNotNull(response);
        assertEquals(Role.LOAN_OFFICER, response.getRole());
        assertEquals(4, response.getKpiCards().size());
        assertEquals("Pending Verification", response.getKpiCards().get(0).getTitle());
        assertEquals("Under Verification", response.getKpiCards().get(1).getTitle());
        assertEquals("Verified Today", response.getKpiCards().get(2).getTitle());
    }

    @Test
    void getDashboardStats_forAdmin_returnsAdminOverview() {
        when(userRepository.count()).thenReturn(15L);
        when(applicationRepository.count()).thenReturn(25L);
        when(facilityRepository.countByStatus(any())).thenReturn(8L);
        when(facilityRepository.sumOutstandingBalance()).thenReturn(new BigDecimal("12500000.00"));
        when(statusHistoryRepository.findTop10ByOrderByChangedAtDesc()).thenReturn(new ArrayList<>());
        when(applicationRepository.findTop10ByOrderByCreatedAtDesc()).thenReturn(new ArrayList<>());

        DashboardStatsResponse response = dashboardService.getDashboardStats(adminUser, null);

        assertNotNull(response);
        assertEquals(Role.ADMIN, response.getRole());
        assertEquals(4, response.getKpiCards().size());
        assertEquals("Total Registered Users", response.getKpiCards().get(0).getTitle());
        assertEquals("15", response.getKpiCards().get(0).getValue());
        assertNotNull(response.getRoleDistribution());
        assertNotNull(response.getFinancialSummary());
    }

    @Test
    void getDashboardStats_adminOverrideRole_returnsTargetRoleMetrics() {
        when(applicationRepository.countByStatus(any())).thenReturn(4L);
        when(applicationRepository.countByVerifiedAtBetween(any(), any())).thenReturn(2L);
        when(applicationRepository.countByDecidedAtBetweenAndStatus(any(), any(), any())).thenReturn(0L);
        when(applicationRepository.findTop10ByStatusInOrderByCreatedAtDesc(any())).thenReturn(new ArrayList<>());

        // Admin requests LOAN_OFFICER view
        DashboardStatsResponse response = dashboardService.getDashboardStats(adminUser, Role.LOAN_OFFICER);

        assertNotNull(response);
        assertEquals(Role.LOAN_OFFICER, response.getRole());
        assertEquals("Pending Verification", response.getKpiCards().get(0).getTitle());
    }
}
