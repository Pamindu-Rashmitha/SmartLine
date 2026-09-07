package com.smartline.loan.entity;

import com.smartline.loan.entity.enums.ApplicationStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "application_status_history", indexes = {
    @Index(name = "idx_status_history_application", columnList = "application_id")
})
public class ApplicationStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private ApplicationStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ApplicationStatus toStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    @Column(length = 1000)
    private String remarks;

    @Column(nullable = false, updatable = false)
    private LocalDateTime changedAt;

    public ApplicationStatusHistory() {
    }

    public ApplicationStatusHistory(Application application, ApplicationStatus fromStatus,
                                    ApplicationStatus toStatus, User changedBy, String remarks) {
        this.application = application;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.changedBy = changedBy;
        this.remarks = remarks;
    }

    @PrePersist
    protected void onCreate() {
        this.changedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public ApplicationStatus getFromStatus() {
        return fromStatus;
    }

    public void setFromStatus(ApplicationStatus fromStatus) {
        this.fromStatus = fromStatus;
    }

    public ApplicationStatus getToStatus() {
        return toStatus;
    }

    public void setToStatus(ApplicationStatus toStatus) {
        this.toStatus = toStatus;
    }

    public User getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(User changedBy) {
        this.changedBy = changedBy;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
}
