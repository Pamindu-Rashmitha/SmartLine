package com.smartline.loan.entity;

import com.smartline.loan.entity.enums.ContactMethod;
import com.smartline.loan.entity.enums.ContactOutcome;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "collection_follow_ups", indexes = {
    @Index(name = "idx_followups_installment", columnList = "installment_id"),
    @Index(name = "idx_followups_facility", columnList = "facility_id"),
    @Index(name = "idx_followups_date", columnList = "followUpDate")
})
public class CollectionFollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "installment_id", nullable = false)
    private Installment installment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Column(nullable = false)
    private LocalDate followUpDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ContactMethod contactMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ContactOutcome contactOutcome;

    @Column(length = 1000)
    private String notes;

    private LocalDate nextFollowUpDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by", nullable = false)
    private User recordedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public CollectionFollowUp() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.followUpDate == null) {
            this.followUpDate = LocalDate.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Installment getInstallment() {
        return installment;
    }

    public void setInstallment(Installment installment) {
        this.installment = installment;
    }

    public Facility getFacility() {
        return facility;
    }

    public void setFacility(Facility facility) {
        this.facility = facility;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
    }

    public ContactMethod getContactMethod() {
        return contactMethod;
    }

    public void setContactMethod(ContactMethod contactMethod) {
        this.contactMethod = contactMethod;
    }

    public ContactOutcome getContactOutcome() {
        return contactOutcome;
    }

    public void setContactOutcome(ContactOutcome contactOutcome) {
        this.contactOutcome = contactOutcome;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDate getNextFollowUpDate() {
        return nextFollowUpDate;
    }

    public void setNextFollowUpDate(LocalDate nextFollowUpDate) {
        this.nextFollowUpDate = nextFollowUpDate;
    }

    public User getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(User recordedBy) {
        this.recordedBy = recordedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
