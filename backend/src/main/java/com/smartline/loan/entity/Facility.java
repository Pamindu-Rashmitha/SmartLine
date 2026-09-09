package com.smartline.loan.entity;

import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.entity.enums.FacilityStatus;
import com.smartline.loan.entity.enums.PaymentMethod;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "facilities", indexes = {
    @Index(name = "idx_facilities_application", columnList = "application_id"),
    @Index(name = "idx_facilities_number", columnList = "facilityNumber"),
    @Index(name = "idx_facilities_status", columnList = "status"),
    @Index(name = "idx_facilities_type", columnList = "type")
})
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String facilityNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationType type;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal principalAmount;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(nullable = false)
    private Integer tenureMonths;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal installmentAmount;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalPayable;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalPaid = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal outstandingBalance;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FacilityStatus status = FacilityStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disbursed_by", nullable = false)
    private User disbursedBy;

    @Column(nullable = false)
    private LocalDateTime disbursedAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PaymentMethod disbursementMethod;

    @Column(length = 100)
    private String disbursementReference;

    private LocalDateTime completedAt;

    @OneToOne(mappedBy = "facility", fetch = FetchType.LAZY)
    private InstallmentSchedule installmentSchedule;

    @OneToMany(mappedBy = "facility")
    private List<Installment> installments = new ArrayList<>();

    @OneToMany(mappedBy = "facility")
    private List<Payment> payments = new ArrayList<>();

    @OneToMany(mappedBy = "facility")
    private List<CollectionFollowUp> collectionFollowUps = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Facility() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.disbursedAt == null) {
            this.disbursedAt = LocalDateTime.now();
        }
        if (this.totalPaid == null) {
            this.totalPaid = BigDecimal.ZERO;
        }
        if (this.status == null) {
            this.status = FacilityStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFacilityNumber() {
        return facilityNumber;
    }

    public void setFacilityNumber(String facilityNumber) {
        this.facilityNumber = facilityNumber;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public ApplicationType getType() {
        return type;
    }

    public void setType(ApplicationType type) {
        this.type = type;
    }

    public BigDecimal getPrincipalAmount() {
        return principalAmount;
    }

    public void setPrincipalAmount(BigDecimal principalAmount) {
        this.principalAmount = principalAmount;
    }

    public BigDecimal getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public BigDecimal getInstallmentAmount() {
        return installmentAmount;
    }

    public void setInstallmentAmount(BigDecimal installmentAmount) {
        this.installmentAmount = installmentAmount;
    }

    public BigDecimal getTotalPayable() {
        return totalPayable;
    }

    public void setTotalPayable(BigDecimal totalPayable) {
        this.totalPayable = totalPayable;
    }

    public BigDecimal getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(BigDecimal totalPaid) {
        this.totalPaid = totalPaid;
    }

    public BigDecimal getOutstandingBalance() {
        return outstandingBalance;
    }

    public void setOutstandingBalance(BigDecimal outstandingBalance) {
        this.outstandingBalance = outstandingBalance;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public FacilityStatus getStatus() {
        return status;
    }

    public void setStatus(FacilityStatus status) {
        this.status = status;
    }

    public User getDisbursedBy() {
        return disbursedBy;
    }

    public void setDisbursedBy(User disbursedBy) {
        this.disbursedBy = disbursedBy;
    }

    public LocalDateTime getDisbursedAt() {
        return disbursedAt;
    }

    public void setDisbursedAt(LocalDateTime disbursedAt) {
        this.disbursedAt = disbursedAt;
    }

    public PaymentMethod getDisbursementMethod() {
        return disbursementMethod;
    }

    public void setDisbursementMethod(PaymentMethod disbursementMethod) {
        this.disbursementMethod = disbursementMethod;
    }

    public String getDisbursementReference() {
        return disbursementReference;
    }

    public void setDisbursementReference(String disbursementReference) {
        this.disbursementReference = disbursementReference;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public InstallmentSchedule getInstallmentSchedule() {
        return installmentSchedule;
    }

    public void setInstallmentSchedule(InstallmentSchedule installmentSchedule) {
        this.installmentSchedule = installmentSchedule;
    }

    public List<Installment> getInstallments() {
        return installments;
    }

    public void setInstallments(List<Installment> installments) {
        this.installments = installments;
    }

    public List<Payment> getPayments() {
        return payments;
    }

    public void setPayments(List<Payment> payments) {
        this.payments = payments;
    }

    public List<CollectionFollowUp> getCollectionFollowUps() {
        return collectionFollowUps;
    }

    public void setCollectionFollowUps(List<CollectionFollowUp> collectionFollowUps) {
        this.collectionFollowUps = collectionFollowUps;
    }
}
