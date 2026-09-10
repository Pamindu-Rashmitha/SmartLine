package com.smartline.loan.dto.response;

import com.smartline.loan.entity.Role;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DashboardStatsResponse {

    private Role role;
    private List<KpiCard> kpiCards = new ArrayList<>();
    private Map<String, Long> statusDistribution = new HashMap<>();
    private Map<String, Long> typeDistribution = new HashMap<>();
    private Map<String, Long> roleDistribution = new HashMap<>();
    private FinancialSummary financialSummary;
    private List<ApplicationResponse> recentApplications = new ArrayList<>();
    private List<InstallmentResponse> recentInstallments = new ArrayList<>();
    private List<ApplicationStatusHistoryResponse> recentAuditLogs = new ArrayList<>();

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(Role role) {
        this.role = role;
    }

    // Static nested DTO for KPI card representations
    public static class KpiCard {
        private String title;
        private String value;
        private String subtitle;
        private String color; // 'blue', 'emerald', 'purple', 'amber', 'indigo', 'rose'
        private String trend;
        private String icon;  // e.g. 'TrendingUp', 'CreditCard', 'Clock', etc.

        public KpiCard() {
        }

        public KpiCard(String title, String value, String subtitle, String color, String trend, String icon) {
            this.title = title;
            this.value = value;
            this.subtitle = subtitle;
            this.color = color;
            this.trend = trend;
            this.icon = icon;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public String getSubtitle() {
            return subtitle;
        }

        public void setSubtitle(String subtitle) {
            this.subtitle = subtitle;
        }

        public String getColor() {
            return color;
        }

        public void setColor(String color) {
            this.color = color;
        }

        public String getTrend() {
            return trend;
        }

        public void setTrend(String trend) {
            this.trend = trend;
        }

        public String getIcon() {
            return icon;
        }

        public void setIcon(String icon) {
            this.icon = icon;
        }
    }

    // Static nested DTO for financial totals
    public static class FinancialSummary {
        private BigDecimal totalOutstanding;
        private BigDecimal totalDisbursedMonth;
        private BigDecimal totalOverdue;
        private BigDecimal nextPaymentDueAmount;
        private String nextPaymentDueDate;
        private Integer activeFacilitiesCount;

        public FinancialSummary() {
        }

        public BigDecimal getTotalOutstanding() {
            return totalOutstanding;
        }

        public void setTotalOutstanding(BigDecimal totalOutstanding) {
            this.totalOutstanding = totalOutstanding;
        }

        public BigDecimal getTotalDisbursedMonth() {
            return totalDisbursedMonth;
        }

        public void setTotalDisbursedMonth(BigDecimal totalDisbursedMonth) {
            this.totalDisbursedMonth = totalDisbursedMonth;
        }

        public BigDecimal getTotalOverdue() {
            return totalOverdue;
        }

        public void setTotalOverdue(BigDecimal totalOverdue) {
            this.totalOverdue = totalOverdue;
        }

        public BigDecimal getNextPaymentDueAmount() {
            return nextPaymentDueAmount;
        }

        public void setNextPaymentDueAmount(BigDecimal nextPaymentDueAmount) {
            this.nextPaymentDueAmount = nextPaymentDueAmount;
        }

        public String getNextPaymentDueDate() {
            return nextPaymentDueDate;
        }

        public void setNextPaymentDueDate(String nextPaymentDueDate) {
            this.nextPaymentDueDate = nextPaymentDueDate;
        }

        public Integer getActiveFacilitiesCount() {
            return activeFacilitiesCount;
        }

        public void setActiveFacilitiesCount(Integer activeFacilitiesCount) {
            this.activeFacilitiesCount = activeFacilitiesCount;
        }
    }

    // Getters and Setters
    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public List<KpiCard> getKpiCards() {
        return kpiCards;
    }

    public void setKpiCards(List<KpiCard> kpiCards) {
        this.kpiCards = kpiCards;
    }

    public Map<String, Long> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(Map<String, Long> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }

    public Map<String, Long> getTypeDistribution() {
        return typeDistribution;
    }

    public void setTypeDistribution(Map<String, Long> typeDistribution) {
        this.typeDistribution = typeDistribution;
    }

    public Map<String, Long> getRoleDistribution() {
        return roleDistribution;
    }

    public void setRoleDistribution(Map<String, Long> roleDistribution) {
        this.roleDistribution = roleDistribution;
    }

    public FinancialSummary getFinancialSummary() {
        return financialSummary;
    }

    public void setFinancialSummary(FinancialSummary financialSummary) {
        this.financialSummary = financialSummary;
    }

    public List<ApplicationResponse> getRecentApplications() {
        return recentApplications;
    }

    public void setRecentApplications(List<ApplicationResponse> recentApplications) {
        this.recentApplications = recentApplications;
    }

    public List<InstallmentResponse> getRecentInstallments() {
        return recentInstallments;
    }

    public void setRecentInstallments(List<InstallmentResponse> recentInstallments) {
        this.recentInstallments = recentInstallments;
    }

    public List<ApplicationStatusHistoryResponse> getRecentAuditLogs() {
        return recentAuditLogs;
    }

    public void setRecentAuditLogs(List<ApplicationStatusHistoryResponse> recentAuditLogs) {
        this.recentAuditLogs = recentAuditLogs;
    }
}
