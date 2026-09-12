package com.smartline.loan.service.impl;

import com.smartline.loan.dto.response.*;
import com.smartline.loan.dto.response.DashboardStatsResponse.FinancialSummary;
import com.smartline.loan.dto.response.DashboardStatsResponse.KpiCard;
import com.smartline.loan.entity.*;
import com.smartline.loan.entity.enums.*;
import com.smartline.loan.repository.*;
import com.smartline.loan.service.ApplicationService;
import com.smartline.loan.service.DashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final ApplicationRepository applicationRepository;
    private final FacilityRepository facilityRepository;
    private final InstallmentRepository installmentRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final VehicleInspectionRepository vehicleInspectionRepository;
    private final AgreementRepository agreementRepository;
    private final GuarantorRepository guarantorRepository;
    private final CollectionFollowUpRepository collectionFollowUpRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final ApplicationService applicationService;

    public DashboardServiceImpl(ApplicationRepository applicationRepository,
                                FacilityRepository facilityRepository,
                                InstallmentRepository installmentRepository,
                                PaymentRepository paymentRepository,
                                UserRepository userRepository,
                                VehicleInspectionRepository vehicleInspectionRepository,
                                AgreementRepository agreementRepository,
                                GuarantorRepository guarantorRepository,
                                CollectionFollowUpRepository collectionFollowUpRepository,
                                ApplicationStatusHistoryRepository statusHistoryRepository,
                                ApplicationService applicationService) {
        this.applicationRepository = applicationRepository;
        this.facilityRepository = facilityRepository;
        this.installmentRepository = installmentRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.vehicleInspectionRepository = vehicleInspectionRepository;
        this.agreementRepository = agreementRepository;
        this.guarantorRepository = guarantorRepository;
        this.collectionFollowUpRepository = collectionFollowUpRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.applicationService = applicationService;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(User currentUser, Role targetRole) {
        Role effectiveRole = currentUser.getRole();
        if (targetRole != null && currentUser.getRole() == Role.ADMIN) {
            effectiveRole = targetRole;
        }

        DashboardStatsResponse response = new DashboardStatsResponse(effectiveRole);
        if (effectiveRole != Role.APPLICANT) {
            populateCommonDistributions(response);
        }
        if (effectiveRole == Role.ADMIN) {
            populateRecentAuditLogs(response);
        }

        switch (effectiveRole) {
            case APPLICANT -> populateApplicantDashboard(currentUser, response);
            case LOAN_OFFICER -> populateLoanOfficerDashboard(response);
            case FIELD_OFFICER -> populateFieldOfficerDashboard(response);
            case CREDIT_MANAGER -> populateCreditManagerDashboard(response);
            case SENIOR_MANAGER -> populateSeniorManagerDashboard(response);
            case LEGAL_OFFICER -> populateLegalOfficerDashboard(response);
            case FINANCE_OFFICER -> populateFinanceOfficerDashboard(response);
            case CREDIT_CONTROL_OFFICER -> populateCreditControlDashboard(response);
            case ADMIN -> populateAdminDashboard(response);
        }

        return response;
    }

    private void populateCommonDistributions(DashboardStatsResponse response) {
        Map<String, Long> statusMap = new LinkedHashMap<>();
        List<Object[]> statusCounts = applicationRepository.countByStatusGrouped();
        for (Object[] row : statusCounts) {
            if (row[0] != null) {
                statusMap.put(row[0].toString(), (Long) row[1]);
            }
        }
        response.setStatusDistribution(statusMap);

        Map<String, Long> typeMap = new LinkedHashMap<>();
        List<Object[]> typeCounts = applicationRepository.countByTypeGrouped();
        for (Object[] row : typeCounts) {
            if (row[0] != null) {
                typeMap.put(row[0].toString(), (Long) row[1]);
            }
        }
        response.setTypeDistribution(typeMap);
    }

    private void populateApplicantDashboard(User user, DashboardStatsResponse response) {
        long totalApps = applicationRepository.countByApplicantUserId(user.getId());
        long pendingApps = applicationRepository.countByApplicantUserIdAndStatusNotIn(
                user.getId(),
                List.of(ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.CANCELLED, ApplicationStatus.DISBURSED)
        );
        long activeFacilities = facilityRepository.countByApplicationApplicantUserIdAndStatus(user.getId(), FacilityStatus.ACTIVE);
        BigDecimal totalOutstanding = facilityRepository.sumOutstandingBalanceByApplicantUserId(user.getId());

        Optional<Installment> nextDue = installmentRepository.findFirstByFacilityApplicationApplicantUserIdAndStatusInOrderByDueDateAsc(
                user.getId(),
                List.of(InstallmentStatus.PENDING, InstallmentStatus.PARTIALLY_PAID, InstallmentStatus.OVERDUE)
        );

        List<KpiCard> cards = new ArrayList<>();
        cards.add(new KpiCard("My Applications", String.valueOf(totalApps), pendingApps + " currently in review", "blue", null, "FileText"));
        cards.add(new KpiCard("Active Facilities", String.valueOf(activeFacilities), "Active credit accounts", "emerald", null, "CreditCard"));

        String nextDueStr = "No Dues";
        String nextDueSub = "All installments up to date";
        if (nextDue.isPresent()) {
            Installment inst = nextDue.get();
            BigDecimal remaining = inst.getTotalAmount().subtract(inst.getPaidAmount());
            nextDueStr = formatCurrency(remaining);
            nextDueSub = "Due on " + inst.getDueDate();
        }
        cards.add(new KpiCard("Next EMI Due", nextDueStr, nextDueSub, "amber", null, "Clock"));
        cards.add(new KpiCard("Total Outstanding", formatCurrency(totalOutstanding), "Across all active facilities", "purple", null, "TrendingUp"));

        response.setKpiCards(cards);

        FinancialSummary summary = new FinancialSummary();
        summary.setTotalOutstanding(totalOutstanding);
        summary.setActiveFacilitiesCount((int) activeFacilities);
        if (nextDue.isPresent()) {
            Installment inst = nextDue.get();
            summary.setNextPaymentDueAmount(inst.getTotalAmount().subtract(inst.getPaidAmount()));
            summary.setNextPaymentDueDate(inst.getDueDate().toString());
        }
        response.setFinancialSummary(summary);

        List<Application> recent = applicationRepository.findTop5ByApplicantUserIdOrderByCreatedAtDesc(user.getId());
        response.setRecentApplications(recent.stream().map(applicationService::mapToSummaryResponse).collect(Collectors.toList()));

        List<Installment> nextInstallments = installmentRepository.findTop5ByFacilityApplicationApplicantUserIdAndStatusInOrderByDueDateAsc(
                user.getId(),
                List.of(InstallmentStatus.PENDING, InstallmentStatus.PARTIALLY_PAID, InstallmentStatus.OVERDUE)
        );
        response.setRecentInstallments(nextInstallments.stream().map(InstallmentResponse::fromEntity).collect(Collectors.toList()));
    }

    private void populateLoanOfficerDashboard(DashboardStatsResponse response) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);
        LocalDateTime startOfWeek = LocalDate.now().minusDays(7).atStartOfDay();

        long pendingVerification = applicationRepository.countByStatus(ApplicationStatus.SUBMITTED);
        long underVerification = applicationRepository.countByStatus(ApplicationStatus.UNDER_VERIFICATION);
        long verifiedToday = applicationRepository.countByVerifiedAtBetween(startOfToday, endOfToday);
        long rejectedToday = applicationRepository.countByDecidedAtBetweenAndStatus(startOfToday, endOfToday, ApplicationStatus.REJECTED);
        long processedWeek = applicationRepository.countByVerifiedAtBetween(startOfWeek, endOfToday)
                + applicationRepository.countByDecidedAtBetweenAndStatus(startOfWeek, endOfToday, ApplicationStatus.REJECTED);

        List<KpiCard> cards = new ArrayList<>();
        cards.add(new KpiCard("Pending Verification", String.valueOf(pendingVerification), "New applications awaiting appraisal", "amber", "+active", "Clock"));
        cards.add(new KpiCard("Under Verification", String.valueOf(underVerification), "Assigned appraisal queue", "blue", null, "FileText"));
        cards.add(new KpiCard("Verified Today", String.valueOf(verifiedToday), rejectedToday + " rejected today", "emerald", "+today", "CheckCircle2"));
        cards.add(new KpiCard("Weekly Processed", String.valueOf(processedWeek), "Total appraisals this week", "purple", null, "TrendingUp"));

        response.setKpiCards(cards);

        List<Application> recent = applicationRepository.findTop10ByStatusInOrderByCreatedAtDesc(
                List.of(ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_VERIFICATION)
        );
        response.setRecentApplications(recent.stream().map(applicationService::mapToSummaryResponse).collect(Collectors.toList()));
    }

    private void populateFieldOfficerDashboard(DashboardStatsResponse response) {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);

        long pendingInspections = applicationRepository.countByStatus(ApplicationStatus.PENDING_FIELD_INSPECTION);
        long completedToday = vehicleInspectionRepository.countByInspectionDate(today);
        long monthTotal = vehicleInspectionRepository.countByInspectionDateBetween(startOfMonth, today);
        long inspectionCompletedStage = applicationRepository.countByStatus(ApplicationStatus.FIELD_INSPECTION_COMPLETED);

        List<KpiCard> cards = new ArrayList<>();
        cards.add(new KpiCard("Pending Inspections", String.valueOf(pendingInspections), "Vehicles awaiting site visit", "blue", "+assigned", "Compass"));
        cards.add(new KpiCard("Completed Today", String.valueOf(completedToday), "Valuation reports filed today", "emerald", "+today", "CheckCircle2"));
        cards.add(new KpiCard("Completed This Month", String.valueOf(monthTotal), "Total vehicle inspections", "purple", null, "TrendingUp"));
        cards.add(new KpiCard("Inspection Done Stage", String.valueOf(inspectionCompletedStage), "Ready for Credit Assessment", "amber", null, "Clock"));

        response.setKpiCards(cards);

        List<Application> recent = applicationRepository.findTop10ByStatusInOrderByCreatedAtDesc(
                List.of(ApplicationStatus.PENDING_FIELD_INSPECTION, ApplicationStatus.FIELD_INSPECTION_COMPLETED)
        );
        response.setRecentApplications(recent.stream().map(applicationService::mapToSummaryResponse).collect(Collectors.toList()));
    }

    private void populateCreditManagerDashboard(DashboardStatsResponse response) {
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);

        long pendingAssessment = applicationRepository.countPendingCreditAssessment();
        long underAssessment = applicationRepository.countByStatus(ApplicationStatus.UNDER_CREDIT_ASSESSMENT);
        long pendingGuarantor = guarantorRepository.countByVerificationStatus(VerificationStatus.PENDING);
        long approvedMonth = applicationRepository.countByDecidedAtBetweenAndStatus(startOfMonth, endOfToday, ApplicationStatus.APPROVED);
        long rejectedMonth = applicationRepository.countByDecidedAtBetweenAndStatus(startOfMonth, endOfToday, ApplicationStatus.REJECTED);
        long referredToSenior = applicationRepository.countByStatus(ApplicationStatus.PENDING_SENIOR_APPROVAL);

        List<KpiCard> cards = new ArrayList<>();
        cards.add(new KpiCard("Underwriting Queue", String.valueOf(pendingAssessment), underAssessment + " currently being scored", "purple", null, "FileText"));
        cards.add(new KpiCard("Pending Guarantors", String.valueOf(pendingGuarantor), "Guarantors awaiting check", "amber", null, "ShieldAlert"));
        cards.add(new KpiCard("Approved (Month)", String.valueOf(approvedMonth), rejectedMonth + " rejected this month", "emerald", "+optimal", "CheckCircle2"));
        cards.add(new KpiCard("Referred to Senior", String.valueOf(referredToSenior), "> LKR 500k threshold or flagged", "indigo", null, "Scale"));

        response.setKpiCards(cards);

        List<Application> recent = applicationRepository.findTop10ByStatusInOrderByCreatedAtDesc(
                List.of(ApplicationStatus.VERIFIED, ApplicationStatus.FIELD_INSPECTION_COMPLETED, ApplicationStatus.UNDER_CREDIT_ASSESSMENT)
        );
        response.setRecentApplications(recent.stream().map(applicationService::mapToSummaryResponse).collect(Collectors.toList()));
    }

    private void populateSeniorManagerDashboard(DashboardStatsResponse response) {
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);

        long pendingAuth = applicationRepository.countByStatus(ApplicationStatus.PENDING_SENIOR_APPROVAL);
        long authorizedMonth = applicationRepository.countByDecidedAtBetweenAndStatus(startOfMonth, endOfToday, ApplicationStatus.APPROVED);
        long rejectedMonth = applicationRepository.countByDecidedAtBetweenAndStatus(startOfMonth, endOfToday, ApplicationStatus.REJECTED);
        BigDecimal totalPortfolio = facilityRepository.sumOutstandingBalance();

        List<KpiCard> cards = new ArrayList<>();
        cards.add(new KpiCard("High-Value Sanctions", String.valueOf(pendingAuth), "Awaiting executive sign-off", "indigo", "+action", "Scale"));
        cards.add(new KpiCard("Authorized (Month)", String.valueOf(authorizedMonth), "Executive approvals granted", "emerald", "+approved", "CheckCircle2"));
        cards.add(new KpiCard("Declined (Month)", String.valueOf(rejectedMonth), "High-risk applications rejected", "rose", null, "AlertCircle"));
        cards.add(new KpiCard("Portfolio Outstanding", formatCurrency(totalPortfolio), "Total live credit exposure", "blue", null, "DollarSign"));

        response.setKpiCards(cards);

        FinancialSummary summary = new FinancialSummary();
        summary.setTotalOutstanding(totalPortfolio);
        response.setFinancialSummary(summary);

        List<Application> recent = applicationRepository.findTop10ByStatusInOrderByCreatedAtDesc(
                List.of(ApplicationStatus.PENDING_SENIOR_APPROVAL)
        );
        response.setRecentApplications(recent.stream().map(applicationService::mapToSummaryResponse).collect(Collectors.toList()));
    }

    private void populateLegalOfficerDashboard(DashboardStatsResponse response) {
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);

        long pendingAgreement = applicationRepository.countByStatus(ApplicationStatus.APPROVED)
                + applicationRepository.countByStatus(ApplicationStatus.AGREEMENT_PENDING);
        long draftAgreements = agreementRepository.countByStatus(AgreementStatus.DRAFT);
        long verifiedMonth = agreementRepository.countByVerifiedDateBetween(startOfMonth, endOfToday);
        long totalAgreements = agreementRepository.count();

        List<KpiCard> cards = new ArrayList<>();
        cards.add(new KpiCard("Agreements to Draft", String.valueOf(pendingAgreement), "Sanctioned facilities awaiting contract", "amber", null, "Scale"));
        cards.add(new KpiCard("Draft Agreements", String.valueOf(draftAgreements), "In-preparation agreements", "blue", null, "FileText"));
        cards.add(new KpiCard("Verified (Month)", String.valueOf(verifiedMonth), "Deeds verified & sealed", "emerald", "+month", "CheckCircle2"));
        cards.add(new KpiCard("Total Contracts", String.valueOf(totalAgreements), "Lifetime contracts on record", "purple", null, "FolderLock"));

        response.setKpiCards(cards);

        List<Application> recent = applicationRepository.findTop10ByStatusInOrderByCreatedAtDesc(
                List.of(ApplicationStatus.APPROVED, ApplicationStatus.AGREEMENT_PENDING, ApplicationStatus.AGREEMENT_VERIFIED)
        );
        response.setRecentApplications(recent.stream().map(applicationService::mapToSummaryResponse).collect(Collectors.toList()));
    }

    private void populateFinanceOfficerDashboard(DashboardStatsResponse response) {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);

        long pendingDownPayment = applicationRepository.countByStatus(ApplicationStatus.PENDING_DOWN_PAYMENT);
        long pendingDisbursal = applicationRepository.countByStatus(ApplicationStatus.PENDING_DISBURSAL);
        long activeFacilities = facilityRepository.countByStatus(FacilityStatus.ACTIVE);
        long disbursedMonth = facilityRepository.countByStartDateBetween(startOfMonth, today);
        BigDecimal disbursedAmountMonth = facilityRepository.sumPrincipalAmountByStartDateBetween(startOfMonth, today);
        long paymentsToday = paymentRepository.countByPaymentDateAndIsCancelledFalse(today);
        BigDecimal paymentAmountToday = paymentRepository.sumAmountByPaymentDateAndIsCancelledFalse(today);

        List<KpiCard> cards = new ArrayList<>();
        cards.add(new KpiCard("Pending Down-Payments", String.valueOf(pendingDownPayment), "Down-payment required before release", "amber", null, "Clock"));
        cards.add(new KpiCard("Pending Disbursals", String.valueOf(pendingDisbursal), "Ready for fund release & facility setup", "blue", "+ready", "DollarSign"));
        cards.add(new KpiCard("Disbursed (Month)", formatCurrency(disbursedAmountMonth), disbursedMonth + " facilities activated", "emerald", "+disbursed", "CheckCircle2"));
        cards.add(new KpiCard("Payments (Today)", String.valueOf(paymentsToday), formatCurrency(paymentAmountToday) + " received", "purple", null, "CreditCard"));

        response.setKpiCards(cards);

        FinancialSummary summary = new FinancialSummary();
        summary.setTotalDisbursedMonth(disbursedAmountMonth);
        summary.setActiveFacilitiesCount((int) activeFacilities);
        response.setFinancialSummary(summary);

        List<Application> recent = applicationRepository.findTop10ByStatusInOrderByCreatedAtDesc(
                List.of(ApplicationStatus.PENDING_DOWN_PAYMENT, ApplicationStatus.PENDING_DISBURSAL, ApplicationStatus.DISBURSED)
        );
        response.setRecentApplications(recent.stream().map(applicationService::mapToSummaryResponse).collect(Collectors.toList()));
    }

    private void populateCreditControlDashboard(DashboardStatsResponse response) {
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);

        long totalDelinquent = installmentRepository.countOverdueInstallments(today);
        long overdueStatusCount = installmentRepository.countByStatus(InstallmentStatus.OVERDUE);
        BigDecimal totalOverdueAmount = installmentRepository.sumOverdueAmount(today);
        long followUpsWeek = collectionFollowUpRepository.countByFollowUpDateBetween(weekAgo, today);

        List<KpiCard> cards = new ArrayList<>();
        cards.add(new KpiCard("Delinquent Installments", String.valueOf(totalDelinquent), "Installments overdue or past due date", "amber", "+action", "AlertCircle"));
        cards.add(new KpiCard("Overdue Bucket", String.valueOf(overdueStatusCount), "Formally classified OVERDUE", "rose", null, "ShieldAlert"));
        cards.add(new KpiCard("Total Arrears Balance", formatCurrency(totalOverdueAmount), "Principal + Interest in arrears", "purple", null, "DollarSign"));
        cards.add(new KpiCard("Follow-ups (Week)", String.valueOf(followUpsWeek), "Calls, letters & site follow-ups", "emerald", "+logged", "CheckCircle2"));

        response.setKpiCards(cards);

        FinancialSummary summary = new FinancialSummary();
        summary.setTotalOverdue(totalOverdueAmount);
        response.setFinancialSummary(summary);

        List<Installment> delinquent = installmentRepository.findDelinquentInstallments(today).stream()
                .limit(10)
                .collect(Collectors.toList());
        response.setRecentInstallments(delinquent.stream().map(InstallmentResponse::fromEntity).collect(Collectors.toList()));
    }

    private void populateAdminDashboard(DashboardStatsResponse response) {
        long totalUsers = userRepository.count();
        long totalApps = applicationRepository.count();
        long activeFacilities = facilityRepository.countByStatus(FacilityStatus.ACTIVE);
        BigDecimal totalOutstanding = facilityRepository.sumOutstandingBalance();

        Map<String, Long> roleMap = new LinkedHashMap<>();
        for (Role role : Role.values()) {
            long count = userRepository.countByRole(role);
            if (count > 0) {
                roleMap.put(role.name(), count);
            }
        }
        response.setRoleDistribution(roleMap);

        List<KpiCard> cards = new ArrayList<>();
        cards.add(new KpiCard("Total Registered Users", String.valueOf(totalUsers), roleMap.size() + " active user roles configured", "blue", "+RBAC", "Users"));
        cards.add(new KpiCard("Total Applications", String.valueOf(totalApps), "Total loan & lease cases", "purple", null, "FileText"));
        cards.add(new KpiCard("Active Portfolio", formatCurrency(totalOutstanding), activeFacilities + " live running facilities", "emerald", null, "DollarSign"));
        cards.add(new KpiCard("System Health", "100% Operational", "Security, MySQL 8 & WebSocket OK", "emerald", "+healthy", "CheckCircle2"));

        response.setKpiCards(cards);

        FinancialSummary summary = new FinancialSummary();
        summary.setTotalOutstanding(totalOutstanding);
        summary.setActiveFacilitiesCount((int) activeFacilities);
        response.setFinancialSummary(summary);

        List<Application> recent = applicationRepository.findTop10ByOrderByCreatedAtDesc();
        response.setRecentApplications(recent.stream().map(applicationService::mapToSummaryResponse).collect(Collectors.toList()));
    }

    private void populateRecentAuditLogs(DashboardStatsResponse response) {
        List<ApplicationStatusHistory> auditLogs = statusHistoryRepository.findTop10ByOrderByChangedAtDesc();
        List<ApplicationStatusHistoryResponse> logResponses = auditLogs.stream().map(log -> {
            ApplicationStatusHistoryResponse r = new ApplicationStatusHistoryResponse();
            r.setId(log.getId());
            r.setFromStatus(log.getFromStatus());
            r.setToStatus(log.getToStatus());
            if (log.getChangedBy() != null) {
                r.setChangedByName(log.getChangedBy().getFullName());
                r.setChangedByRole(log.getChangedBy().getRole().name());
            }
            r.setRemarks(log.getRemarks());
            r.setChangedAt(log.getChangedAt());
            return r;
        }).collect(Collectors.toList());
        response.setRecentAuditLogs(logResponses);
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) {
            return "LKR 0.00";
        }
        NumberFormat formatter = NumberFormat.getNumberInstance(Locale.US);
        formatter.setMinimumFractionDigits(2);
        formatter.setMaximumFractionDigits(2);
        return "LKR " + formatter.format(amount);
    }
}
