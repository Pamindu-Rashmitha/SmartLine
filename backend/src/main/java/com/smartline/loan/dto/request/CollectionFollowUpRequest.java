package com.smartline.loan.dto.request;

import com.smartline.loan.entity.enums.ContactMethod;
import com.smartline.loan.entity.enums.ContactOutcome;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CollectionFollowUpRequest {

    @NotNull(message = "Contact method is required")
    private ContactMethod contactMethod;

    @NotNull(message = "Contact outcome is required")
    private ContactOutcome contactOutcome;

    private String notes;

    private LocalDate nextFollowUpDate;

    public CollectionFollowUpRequest() {
    }

    public CollectionFollowUpRequest(ContactMethod contactMethod, ContactOutcome contactOutcome, String notes, LocalDate nextFollowUpDate) {
        this.contactMethod = contactMethod;
        this.contactOutcome = contactOutcome;
        this.notes = notes;
        this.nextFollowUpDate = nextFollowUpDate;
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
}
