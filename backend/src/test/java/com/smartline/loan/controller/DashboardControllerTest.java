package com.smartline.loan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.smartline.loan.dto.request.LoginRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String obtainJwtToken(String username, String password) throws Exception {
        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail(username)
                .password(password)
                .build();

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return JsonPath.read(response, "$.data.accessToken");
    }

    @Test
    @DisplayName("GET /api/dashboard/stats unauthenticated returns 401")
    void testDashboardStatsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/dashboard/stats as Applicant returns 200 and applicant metrics")
    void testDashboardStatsAsApplicant() throws Exception {
        String token = obtainJwtToken("applicant", "applicant123");

        mockMvc.perform(get("/api/dashboard/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.role", is("APPLICANT")))
                .andExpect(jsonPath("$.data.kpiCards", hasSize(4)))
                .andExpect(jsonPath("$.data.kpiCards[0].title", is("My Applications")));
    }

    @Test
    @DisplayName("GET /api/dashboard/stats as Admin returns 200 and admin overview")
    void testDashboardStatsAsAdmin() throws Exception {
        String token = obtainJwtToken("admin", "admin123");

        mockMvc.perform(get("/api/dashboard/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.role", is("ADMIN")))
                .andExpect(jsonPath("$.data.kpiCards", hasSize(4)))
                .andExpect(jsonPath("$.data.roleDistribution", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/dashboard/stats as Admin with ?role=LOAN_OFFICER returns LO view")
    void testDashboardStatsAdminRoleOverride() throws Exception {
        String token = obtainJwtToken("admin", "admin123");

        mockMvc.perform(get("/api/dashboard/stats?role=LOAN_OFFICER")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.role", is("LOAN_OFFICER")))
                .andExpect(jsonPath("$.data.kpiCards[0].title", is("Pending Verification")));
    }
}
