package com.smartline.loan.integration;

import com.smartline.loan.dto.request.*;
import com.smartline.loan.dto.response.*;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.Facility;
import com.smartline.loan.entity.Installment;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.*;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.FacilityRepository;
import com.smartline.loan.repository.InstallmentRepository;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class LoanLifecycleIntegrationTest {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private VerificationService verificationService;

    @Autowired
    private CreditAssessmentService creditAssessmentService;

    @Autowired
    private SeniorAuthorizationService seniorAuthorizationService;

    @Autowired
    private AgreementService agreementService;

    @Autowired
    private DisbursalService disbursalService;

    @Autowired
    private InstallmentService installmentService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private InstallmentRepository installmentRepository;

    private User applicantUser;
    private User loanOfficer;
    private User creditManager;
    private User seniorManager;
    private User legalOfficer;
    private User financeOfficer;
    private User adminUser;

    @BeforeEach
    void setUp() {
        applicantUser = userRepository.findByUsername("applicant").orElseThrow();
        loanOfficer = userRepository.findByUsername("loanofficer").orElseThrow();
        creditManager = userRepository.findByUsername("creditmanager").orElseThrow();
        seniorManager = userRepository.findByUsername("seniormanager").orElseThrow();
        legalOfficer = userRepository.findByUsername("legalofficer").orElseThrow();
        financeOfficer = userRepository.findByUsername("financeofficer").orElseThrow();
        adminUser = userRepository.findByUsername("admin").orElseThrow();
    }

    @Test
    @DisplayName("Complete E2E Loan Lifecycle: Submission -> Verification -> Credit Assessment -> Agreement -> Disbursal -> Installments -> Repayment -> Dashboard")
    void testFullLoanLifecycle_FromApplicationToDisbursalAndRepayment() {
        // Step 1: Applicant submits loan application with a guarantor
        GuarantorRequest guarantor = new GuarantorRequest();
        guarantor.setFullName("Kamal Gunaratne");
        guarantor.setNic("198512345678");
        guarantor.setPhone("+94771122334");
        guarantor.setRelationship("Uncle");
        guarantor.setAddress("No. 12, Peradeniya Rd, Kandy");
        guarantor.setOccupation("Accounts Manager");
        guarantor.setEmployerName("ABC Enterprises Ltd");
        guarantor.setMonthlyIncome(new BigDecimal("150000.00"));

        LoanDetailRequest loanDetail = new LoanDetailRequest();
        loanDetail.setLoanPurpose("Education & IT Equipment Financing");
        loanDetail.setRequestedTenure(12);
        loanDetail.setProposedInterestRate(new BigDecimal("14.00"));
        loanDetail.setExistingLoans("None");
        loanDetail.setTotalExistingDebt(BigDecimal.ZERO);

        ApplicationCreateRequest createRequest = new ApplicationCreateRequest();
        createRequest.setType(ApplicationType.LOAN);
        createRequest.setRequestedAmount(new BigDecimal("120000.00"));
        createRequest.setPurpose("Higher education course fees");
        createRequest.setLoanDetail(loanDetail);
        createRequest.setGuarantors(List.of(guarantor));
        createRequest.setSubmitImmediately(true);

        ApplicationDetailResponse createdApp = applicationService.createApplication(applicantUser, createRequest);
        assertNotNull(createdApp);
        assertNotNull(createdApp.getId());
        assertEquals(ApplicationStatus.SUBMITTED, createdApp.getStatus());
        Long applicationId = createdApp.getId();

        // Step 2: Loan Officer picks up application and completes KYC verification
        verificationService.startVerification(applicationId, loanOfficer);
        ApplicationDetailResponse verifiedApp = verificationService.completeVerification(
                applicationId,
                new VerificationDecisionRequest(true, "All KYC and identity documents verified satisfactorily"),
                loanOfficer
        );
        assertEquals(ApplicationStatus.VERIFIED, verifiedApp.getStatus());

        // Step 3: Credit Manager assesses risk and grants credit approval (amount <= 500,000 threshold)
        creditAssessmentService.startAssessment(applicationId, creditManager);

        CreditAssessmentRequest assessmentReq = new CreditAssessmentRequest();
        assessmentReq.setIncomeVerified(true);
        assessmentReq.setEmploymentVerified(true);
        assessmentReq.setDebtToIncomeNotes("DTI ratio within 30% safety limit");
        assessmentReq.setCreditHistoryNotes("CRIB record clear with strong score");
        assessmentReq.setOverallRiskLevel(RiskLevel.LOW);
        assessmentReq.setRecommendation(CreditRecommendation.APPROVE);
        assessmentReq.setRemarks("Recommended for immediate sanction");
        creditAssessmentService.saveAssessment(applicationId, assessmentReq, creditManager);

        CreditDecisionRequest decisionReq = new CreditDecisionRequest(true, false, "Credit facility approved by Credit Manager");
        ApplicationDetailResponse approvedApp = creditAssessmentService.recordDecision(applicationId, decisionReq, creditManager);
        assertEquals(ApplicationStatus.APPROVED, approvedApp.getStatus());

        // Step 4: Legal Officer drafts agreement and seals it (0 down payment for money loan -> directly PENDING_DISBURSAL)
        AgreementCreateRequest agreementReq = new AgreementCreateRequest();
        agreementReq.setDownPaymentRequired(BigDecimal.ZERO);
        agreementReq.setTermsAndConditions("SmartLine Standard Financing Terms v2.1");
        agreementReq.setSpecialConditions("No prepayment penalty after 6 months");

        AgreementResponse draftAgreement = agreementService.prepareAgreement(applicationId, agreementReq, legalOfficer);
        assertNotNull(draftAgreement);
        assertEquals(AgreementStatus.DRAFT, draftAgreement.getStatus());

        AgreementResponse verifiedAgreement = agreementService.verifyAgreement(applicationId, legalOfficer);
        assertEquals(AgreementStatus.VERIFIED, verifiedAgreement.getStatus());

        Application postAgreementApp = applicationRepository.findById(applicationId).orElseThrow();
        assertEquals(ApplicationStatus.PENDING_DISBURSAL, postAgreementApp.getStatus());

        // Step 5: Finance Officer records disbursal -> Application marked DISBURSED & Facility activated
        DisbursalRequest disbursalReq = new DisbursalRequest();
        disbursalReq.setDisbursementMethod(PaymentMethod.BANK_TRANSFER);
        disbursalReq.setDisbursementReference("CEFT-202609-887123");
        disbursalReq.setDisbursementDate(LocalDate.now());
        disbursalReq.setRemarks("Funds remitted directly to applicant's verified bank account");

        FacilityResponse facilityResp = disbursalService.recordDisbursal(applicationId, disbursalReq, financeOfficer);
        assertNotNull(facilityResp);
        assertEquals(FacilityStatus.ACTIVE, facilityResp.getStatus());
        assertEquals(0, new BigDecimal("120000.00").compareTo(facilityResp.getPrincipalAmount()));
        Long facilityId = facilityResp.getId();

        Application disbursedApp = applicationRepository.findById(applicationId).orElseThrow();
        assertEquals(ApplicationStatus.DISBURSED, disbursedApp.getStatus());

        // Step 6: Finance Officer generates 12-month installment repayment schedule
        InstallmentScheduleCreateRequest schedReq = new InstallmentScheduleCreateRequest();
        schedReq.setFrequency(RepaymentFrequency.MONTHLY);
        schedReq.setStartDate(LocalDate.now().plusMonths(1));

        InstallmentScheduleResponse scheduleResp = installmentService.generateSchedule(facilityId, schedReq, financeOfficer);
        assertNotNull(scheduleResp);
        assertEquals(12, scheduleResp.getInstallments().size());
        assertEquals(12, scheduleResp.getTotalInstallments());

        // Step 7: Record repayment of the first monthly installment
        List<Installment> installments = installmentRepository.findByFacilityIdOrderByInstallmentNumberAsc(facilityId);
        assertFalse(installments.isEmpty());
        Installment firstInstallment = installments.get(0);
        assertEquals(InstallmentStatus.PENDING, firstInstallment.getStatus());

        BigDecimal emiAmount = firstInstallment.getTotalAmount();
        PaymentRecordRequest paymentReq = new PaymentRecordRequest(
                emiAmount,
                LocalDate.now(),
                PaymentMethod.BANK_TRANSFER,
                "PAY-SL-2026-901",
                "Month 1 installment payment received"
        );

        PaymentResponse paymentResp = paymentService.recordPayment(firstInstallment.getId(), paymentReq, financeOfficer);
        assertNotNull(paymentResp);
        assertEquals(emiAmount, paymentResp.getAmount());

        Installment updatedInstallment = installmentRepository.findById(firstInstallment.getId()).orElseThrow();
        assertEquals(InstallmentStatus.PAID, updatedInstallment.getStatus());

        Facility updatedFacility = facilityRepository.findById(facilityId).orElseThrow();
        assertEquals(0, emiAmount.compareTo(updatedFacility.getTotalPaid()));
        assertTrue(updatedFacility.getOutstandingBalance().compareTo(BigDecimal.ZERO) > 0);

        // Step 8: Query Dashboard Service to verify analytics and aggregations reflect the new activity
        DashboardStatsResponse adminDashboard = dashboardService.getDashboardStats(adminUser, null);
        assertNotNull(adminDashboard);
        assertNotNull(adminDashboard.getKpiCards());
        assertFalse(adminDashboard.getKpiCards().isEmpty());

        DashboardStatsResponse financeDashboard = dashboardService.getDashboardStats(financeOfficer, null);
        assertNotNull(financeDashboard);
        assertNotNull(financeDashboard.getKpiCards());
    }

    @Test
    @DisplayName("High-Value Loan Lifecycle: Auto-escalates to Senior Manager approval (> 500,000 threshold)")
    void testHighValueLoan_EscalatesToSeniorManagerApproval() {
        GuarantorRequest guarantor = new GuarantorRequest();
        guarantor.setFullName("Sunil Fernando");
        guarantor.setNic("197812345678");
        guarantor.setPhone("+94772233445");
        guarantor.setRelationship("Brother");
        guarantor.setAddress("No. 88, Galle Road, Moratuwa");
        guarantor.setOccupation("Senior Engineer");
        guarantor.setEmployerName("Tech Solutions");
        guarantor.setMonthlyIncome(new BigDecimal("300000.00"));

        LoanDetailRequest loanDetail = new LoanDetailRequest();
        loanDetail.setLoanPurpose("Commercial Business Expansion");
        loanDetail.setRequestedTenure(24);
        loanDetail.setProposedInterestRate(new BigDecimal("14.00"));
        loanDetail.setExistingLoans("None");
        loanDetail.setTotalExistingDebt(BigDecimal.ZERO);

        ApplicationCreateRequest createRequest = new ApplicationCreateRequest();
        createRequest.setType(ApplicationType.LOAN);
        createRequest.setRequestedAmount(new BigDecimal("750000.00")); // Exceeds 500,000 threshold
        createRequest.setPurpose("Expanding retail warehouse inventory");
        createRequest.setLoanDetail(loanDetail);
        createRequest.setGuarantors(List.of(guarantor));
        createRequest.setSubmitImmediately(true);

        ApplicationDetailResponse createdApp = applicationService.createApplication(applicantUser, createRequest);
        Long applicationId = createdApp.getId();

        // Verification
        verificationService.startVerification(applicationId, loanOfficer);
        verificationService.completeVerification(
                applicationId,
                new VerificationDecisionRequest(true, "High value applicant KYC verified"),
                loanOfficer
        );

        // Credit assessment - Credit manager approves, but system auto-escalates due to amount > threshold
        creditAssessmentService.startAssessment(applicationId, creditManager);
        CreditDecisionRequest cmDecision = new CreditDecisionRequest(true, false, "Credit score excellent; exceeds threshold");
        ApplicationDetailResponse escalatedApp = creditAssessmentService.recordDecision(applicationId, cmDecision, creditManager);

        assertEquals(ApplicationStatus.PENDING_SENIOR_APPROVAL, escalatedApp.getStatus());

        // Senior Manager sanctions the loan
        AuthorizationDecisionRequest seniorDecision = new AuthorizationDecisionRequest(true, "Executive sanction granted after portfolio review");
        ApplicationDetailResponse seniorApprovedApp = seniorAuthorizationService.recordDecision(applicationId, seniorDecision, seniorManager);

        assertEquals(ApplicationStatus.APPROVED, seniorApprovedApp.getStatus());
    }
}
