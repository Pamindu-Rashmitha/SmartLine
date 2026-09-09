package com.smartline.loan.entity;

import com.smartline.loan.entity.enums.InstallmentStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "installments", indexes = {
    @Index(name = "idx_installments_schedule", columnList = "schedule_id"),
    @Index(name = "idx_installments_facility", columnList = "facility_id"),
    @Index(name = "idx_installments_status", columnList = "status"),
    @Index(name = "idx_installments_due_date", columnList = "dueDate")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_schedule_installment", columnNames = {"schedule_id", "installmentNumber"})
})
public class Installment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private InstallmentSchedule schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Column(nullable = false)
    private Integer installmentNumber;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal principalPortion;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal interestPortion;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InstallmentStatus status = InstallmentStatus.PENDING;

    private LocalDate paidDate;

    @OneToMany(mappedBy = "installment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments = new ArrayList<>();

    @OneToMany(mappedBy = "installment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CollectionFollowUp> collectionFollowUps = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Installment() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.paidAmount == null) {
            this.paidAmount = BigDecimal.ZERO;
        }
        if (this.status == null) {
            this.status = InstallmentStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public BigDecimal getRemainingAmount() {
        if (totalAmount == null) return BigDecimal.ZERO;
        BigDecimal paid = paidAmount != null ? paidAmount : BigDecimal.ZERO;
        BigDecimal remaining = totalAmount.subtract(paid);
        return remaining.compareTo(BigDecimal.ZERO) > 0 ? remaining : BigDecimal.ZERO;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public InstallmentSchedule getSchedule() {
        return schedule;
    }

    public void setSchedule(InstallmentSchedule schedule) {
        this.schedule = schedule;
    }

    public Facility getFacility() {
        return facility;
    }

    public void setFacility(Facility facility) {
        this.facility = facility;
    }

    public Integer getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(Integer installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public BigDecimal getPrincipalPortion() {
        return principalPortion;
    }

    public void setPrincipalPortion(BigDecimal principalPortion) {
        this.principalPortion = principalPortion;
    }

    public BigDecimal getInterestPortion() {
        return interestPortion;
    }

    public void setInterestPortion(BigDecimal interestPortion) {
        this.interestPortion = interestPortion;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public InstallmentStatus getStatus() {
        return status;
    }

    public void setStatus(InstallmentStatus status) {
        this.status = status;
    }

    public LocalDate getPaidDate() {
        return paidDate;
    }

    public void setPaidDate(LocalDate paidDate) {
        this.paidDate = paidDate;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
