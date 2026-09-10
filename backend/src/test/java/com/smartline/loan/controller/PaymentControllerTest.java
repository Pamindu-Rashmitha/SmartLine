package com.smartline.loan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.smartline.loan.dto.request.LoginRequest;
import com.smartline.loan.dto.request.PaymentRecordRequest;
import com.smartline.loan.entity.enums.PaymentMethod;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PaymentControllerTest {

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
    @DisplayName("POST /api/installments/{id}/payments as Applicant returns 403 Forbidden (RBAC guard)")
    void testRecordPaymentAsApplicantForbidden() throws Exception {
        String token = obtainJwtToken("applicant", "applicant123");

        PaymentRecordRequest request = new PaymentRecordRequest();
        request.setAmount(new BigDecimal("20000.00"));
        request.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        request.setPaymentDate(LocalDate.now());
        request.setReferenceNumber("SLIPS-TEST-001");

        mockMvc.perform(post("/api/installments/1/payments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/facilities/1/payments unauthenticated returns 401")
    void testGetFacilityPaymentsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/facilities/1/payments"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/facilities/1/payments as Finance Officer returns 200 OK")
    void testGetFacilityPaymentsAsFinanceOfficer() throws Exception {
        String token = obtainJwtToken("financeofficer", "finance123");

        mockMvc.perform(get("/api/facilities/1/payments")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", notNullValue()));
    }
}
