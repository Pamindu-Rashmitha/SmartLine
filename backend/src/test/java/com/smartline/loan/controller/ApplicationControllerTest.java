package com.smartline.loan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.smartline.loan.dto.request.ApplicationCreateRequest;
import com.smartline.loan.dto.request.LoanDetailRequest;
import com.smartline.loan.dto.request.LoginRequest;
import com.smartline.loan.entity.enums.ApplicationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ApplicationControllerTest {

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
    @DisplayName("GET /api/applications/my unauthenticated returns 401")
    void testGetMyApplicationsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/applications/my"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/applications/my as Applicant returns 200 and list")
    void testGetMyApplicationsAsApplicant() throws Exception {
        String token = obtainJwtToken("applicant", "applicant123");

        mockMvc.perform(get("/api/applications/my")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/applications as Applicant creates draft application (201 Created)")
    void testCreateApplicationAsApplicant() throws Exception {
        String token = obtainJwtToken("applicant", "applicant123");

        ApplicationCreateRequest request = new ApplicationCreateRequest();
        request.setType(ApplicationType.LOAN);
        request.setRequestedAmount(new BigDecimal("250000.00"));
        request.setPurpose("Education tuition fee support");

        LoanDetailRequest loanDetail = new LoanDetailRequest();
        loanDetail.setLoanPurpose("Higher Education");
        loanDetail.setRequestedTenure(12);
        loanDetail.setProposedInterestRate(new BigDecimal("14.0"));
        request.setLoanDetail(loanDetail);
        request.setSubmitImmediately(false);

        mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.applicationNumber", notNullValue()))
                .andExpect(jsonPath("$.data.status", is("DRAFT")));
    }

    @Test
    @DisplayName("POST /api/applications as Loan Officer returns 403 Forbidden (RBAC guard)")
    void testCreateApplicationAsOfficerForbidden() throws Exception {
        String token = obtainJwtToken("loanofficer", "officer123");

        ApplicationCreateRequest request = new ApplicationCreateRequest();
        request.setType(ApplicationType.LOAN);
        request.setRequestedAmount(new BigDecimal("100000.00"));
        request.setPurpose("Should be blocked");

        mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
