package com.smartline.loan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartline.loan.dto.request.LoginRequest;
import com.smartline.loan.dto.request.RegisterRequest;
import com.smartline.loan.entity.Role;
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
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/login with valid credentials returns 200 and JWT token")
    void testLoginSuccess() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .usernameOrEmail("admin")
                .password("admin123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.user.username", is("admin")))
                .andExpect(jsonPath("$.data.user.role", is("ADMIN")));
    }

    @Test
    @DisplayName("POST /api/auth/login with invalid password returns 401/400")
    void testLoginFailure() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .usernameOrEmail("admin")
                .password("incorrect-pass")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("POST /api/auth/register creates new applicant and returns 201")
    void testRegisterApplicant() throws Exception {
        long timestamp = System.currentTimeMillis();
        RegisterRequest registerRequest = RegisterRequest.builder()
                .username("newuser_" + timestamp)
                .email("user_" + timestamp + "@example.com")
                .password("securePassword123")
                .fullName("New Test User")
                .phoneNumber("+9477000" + (timestamp % 10000))
                .nicNumber("NIC" + timestamp)
                .role(Role.APPLICANT)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.user.username", is("newuser_" + timestamp)));
    }

    @Test
    @DisplayName("POST /api/auth/register with invalid data returns 400 Bad Request")
    void testRegisterValidationFailure() throws Exception {
        RegisterRequest invalidRequest = RegisterRequest.builder()
                .username("") // Blank
                .email("invalid-email-format")
                .password("123") // Too short
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/auth/me without authentication returns 401")
    void testGetCurrentUserUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
