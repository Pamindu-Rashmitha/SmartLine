package com.smartline.loan.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applicants", indexes = {
    @Index(name = "idx_applicants_nic", columnList = "nicNumber")
})
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 20)
    private String nicNumber;

    private LocalDate dateOfBirth;

    @Column(length = 150)
    private String addressLine1;

    @Column(length = 150)
    private String addressLine2;

    @Column(length = 60)
    private String city;

    @Column(length = 20)
    private String postalCode;

    @Column(length = 50)
    private String employmentStatus;

    @Column(precision = 14, scale = 2)
    private BigDecimal monthlyIncome;

    @Column(length = 120)
    private String employerName;

    private Integer creditScore;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Applicant() {
    }

    public Applicant(Long id, User user, String nicNumber, LocalDate dateOfBirth, String addressLine1,
                     String addressLine2, String city, String postalCode, String employmentStatus,
                     BigDecimal monthlyIncome, String employerName, Integer creditScore) {
        this.id = id;
        this.user = user;
        this.nicNumber = nicNumber;
        this.dateOfBirth = dateOfBirth;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.city = city;
        this.postalCode = postalCode;
        this.employmentStatus = employmentStatus;
        this.monthlyIncome = monthlyIncome;
        this.employerName = employerName;
        this.creditScore = creditScore;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getNicNumber() {
        return nicNumber;
    }

    public void setNicNumber(String nicNumber) {
        this.nicNumber = nicNumber;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
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

    public Integer getCreditScore() {
        return creditScore;
    }

    public void setCreditScore(Integer creditScore) {
        this.creditScore = creditScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Builder
    public static ApplicantBuilder builder() {
        return new ApplicantBuilder();
    }

    public static class ApplicantBuilder {
        private Long id;
        private User user;
        private String nicNumber;
        private LocalDate dateOfBirth;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String postalCode;
        private String employmentStatus;
        private BigDecimal monthlyIncome;
        private String employerName;
        private Integer creditScore;

        ApplicantBuilder() {}

        public ApplicantBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ApplicantBuilder user(User user) {
            this.user = user;
            return this;
        }

        public ApplicantBuilder nicNumber(String nicNumber) {
            this.nicNumber = nicNumber;
            return this;
        }

        public ApplicantBuilder dateOfBirth(LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
            return this;
        }

        public ApplicantBuilder addressLine1(String addressLine1) {
            this.addressLine1 = addressLine1;
            return this;
        }

        public ApplicantBuilder addressLine2(String addressLine2) {
            this.addressLine2 = addressLine2;
            return this;
        }

        public ApplicantBuilder city(String city) {
            this.city = city;
            return this;
        }

        public ApplicantBuilder postalCode(String postalCode) {
            this.postalCode = postalCode;
            return this;
        }

        public ApplicantBuilder employmentStatus(String employmentStatus) {
            this.employmentStatus = employmentStatus;
            return this;
        }

        public ApplicantBuilder monthlyIncome(BigDecimal monthlyIncome) {
            this.monthlyIncome = monthlyIncome;
            return this;
        }

        public ApplicantBuilder employerName(String employerName) {
            this.employerName = employerName;
            return this;
        }

        public ApplicantBuilder creditScore(Integer creditScore) {
            this.creditScore = creditScore;
            return this;
        }

        public Applicant build() {
            return new Applicant(id, user, nicNumber, dateOfBirth, addressLine1, addressLine2, city, postalCode, employmentStatus, monthlyIncome, employerName, creditScore);
        }
    }
}
