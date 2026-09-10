package com.smartline.loan.service;

import com.smartline.loan.dto.response.DashboardStatsResponse;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;

public interface DashboardService {

    /**
     * Retrieve aggregated dashboard statistics, KPI cards, visual distribution data,
     * and recent relevant queue items tailored to the user's role.
     *
     * @param currentUser Authenticated user
     * @param targetRole  Optional role override (only permitted for ADMIN users)
     * @return DashboardStatsResponse
     */
    DashboardStatsResponse getDashboardStats(User currentUser, Role targetRole);
}
