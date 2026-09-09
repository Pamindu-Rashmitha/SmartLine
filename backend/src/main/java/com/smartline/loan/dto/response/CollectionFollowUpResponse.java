package com.smartline.loan.dto.response;

import com.smartline.loan.entity.CollectionFollowUp;
import com.smartline.loan.entity.enums.ContactMethod;
import com.smartline.loan.entity.enums.ContactOutcome;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class CollectionFollowUpResponse {

    private Long id;
    private Long installmentId;
    private Integer installmentNumber;
    private Long facilityId;
    private String facilityNumber;
    private String borrowerName;
    private String borrowerPhone;
    private LocalDate followUpDate;
    private ContactMethod contactMethod;
    private ContactOutcome contactOutcome;
    private String notes;
    private LocalDate nextFollowUpDate;
    private String recordedByOfficer;
    private LocalDateTime createdAt;

    public CollectionFollowUpResponse() {
    }

    public static CollectionFollowUpResponse fromEntity(CollectionFollowUp followUp) {
        if (followUp == null) return null;

        CollectionFollowUpResponse res = new CollectionFollowUpResponse();
        res.setId(followUp.getId());
        if (followUp.getInstallment() != null) {
            res.setInstallmentId(followUp.getInstallment().getId());
            res.setInstallmentNumber(followUp.getInstallment().getInstallmentNumber());
        }
        if (followUp.getFacility() != null) {
            res.setFacilityId(followUp.getFacility().getId());
            res.setFacilityNumber(followUp.getFacility().getFacilityNumber());
            if (followUp.getFacility().getApplication() != null &&
                    followUp.getFacility().getApplication().getApplicant() != null) {
                res.setBorrowerName(followUp.getFacility().getApplication().getApplicant().getUser().getFullName());
                res.setBorrowerPhone(followUp.getFacility().getApplication().getApplicant().getUser().getPhoneNumber());
            }
        }
        res.setFollowUpDate(followUp.getFollowUpDate());
        res.setContactMethod(followUp.getContactMethod());
        res.setContactOutcome(followUp.getContactOutcome());
        res.setNotes(followUp.getNotes());
        res.setNextFollowUpDate(followUp.getNextFollowUpDate());
        if (followUp.getRecordedBy() != null) {
            res.setRecordedByOfficer(followUp.getRecordedBy().getFullName());
        }
        res.setCreatedAt(followUp.getCreatedAt());

        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInstallmentId() {
        return installmentId;
    }

    public void setInstallmentId(Long installmentId) {
        this.installmentId = installmentId;
    }

    public Integer getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(Integer installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public Long getFacilityId() {
        return facilityId;
    }

    public void setFacilityId(Long facilityId) {
        this.facilityId = facilityId;
    }

    public String getFacilityNumber() {
        return facilityNumber;
    }

    public void setFacilityNumber(String facilityNumber) {
        this.facilityNumber = facilityNumber;
    }

    public String getBorrowerName() {
        return borrowerName;
    }

    public void setBorrowerName(String borrowerName) {
        this.borrowerName = borrowerName;
    }

    public String getBorrowerPhone() {
        return borrowerPhone;
    }

    public void setBorrowerPhone(String borrowerPhone) {
        this.borrowerPhone = borrowerPhone;
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

    public String getRecordedByOfficer() {
        return recordedByOfficer;
    }

    public void setRecordedByOfficer(String recordedByOfficer) {
        this.recordedByOfficer = recordedByOfficer;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
