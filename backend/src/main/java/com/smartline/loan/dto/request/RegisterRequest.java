package com.smartline.loan.dto.request;

import com.smartline.loan.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phoneNumber;

    private Role role;

    private String nicNumber;
    private String employmentStatus;
    private BigDecimal monthlyIncome;
    private String employerName;
    private String city;

    public RegisterRequest() {}

    public RegisterRequest(String username, String email, String password, String fullName, String phoneNumber,
                           Role role, String nicNumber, String employmentStatus, BigDecimal monthlyIncome,
                           String employerName, String city) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.nicNumber = nicNumber;
        this.employmentStatus = employmentStatus;
        this.monthlyIncome = monthlyIncome;
        this.employerName = employerName;
        this.city = city;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getNicNumber() {
        return nicNumber;
    }

    public void setNicNumber(String nicNumber) {
        this.nicNumber = nicNumber;
    }

    public String getEmploymentStatus() {
        return employmentStatus;
    }

    public void setEmploymentStatus(String employmentStatus) {
        this.employmentStatus = employmentStatus;
    }

    public BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(BigDecimal monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public String getEmployerName() {
        return employerName;
    }

    public void setEmployerName(String employerName) {
        this.employerName = employerName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public static RegisterRequestBuilder builder() {
        return new RegisterRequestBuilder();
    }

    public static class RegisterRequestBuilder {
        private String username;
        private String email;
        private String password;
        private String fullName;
        private String phoneNumber;
        private Role role;
        private String nicNumber;
        private String employmentStatus;
        private BigDecimal monthlyIncome;
        private String employerName;
        private String city;

        RegisterRequestBuilder() {}

        public RegisterRequestBuilder username(String username) {
            this.username = username;
            return this;
        }

        public RegisterRequestBuilder email(String email) {
            this.email = email;
            return this;
        }

        public RegisterRequestBuilder password(String password) {
            this.password = password;
            return this;
        }

        public RegisterRequestBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public RegisterRequestBuilder phoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
            return this;
        }

        public RegisterRequestBuilder role(Role role) {
            this.role = role;
            return this;
        }

        public RegisterRequestBuilder nicNumber(String nicNumber) {
            this.nicNumber = nicNumber;
            return this;
        }

        public RegisterRequestBuilder employmentStatus(String employmentStatus) {
            this.employmentStatus = employmentStatus;
            return this;
        }

        public RegisterRequestBuilder monthlyIncome(BigDecimal monthlyIncome) {
            this.monthlyIncome = monthlyIncome;
            return this;
        }

        public RegisterRequestBuilder employerName(String employerName) {
            this.employerName = employerName;
            return this;
        }

        public RegisterRequestBuilder city(String city) {
            this.city = city;
            return this;
        }

        public RegisterRequest build() {
            return new RegisterRequest(username, email, password, fullName, phoneNumber, role, nicNumber, employmentStatus, monthlyIncome, employerName, city);
        }
    }
}
