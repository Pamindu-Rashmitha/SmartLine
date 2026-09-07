package com.smartline.loan.dto.response;

import com.smartline.loan.entity.enums.ApplicationStatus;
import java.time.LocalDateTime;

public class ApplicationStatusHistoryResponse {
    private Long id;
    private ApplicationStatus fromStatus;
    private ApplicationStatus toStatus;
    private String changedByName;
    private String changedByRole;
    private String remarks;
    private LocalDateTime changedAt;

    public ApplicationStatusHistoryResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getChangedByName() {
        return changedByName;
    }

    public void setChangedByName(String changedByName) {
        this.changedByName = changedByName;
    }

    public String getChangedByRole() {
        return changedByRole;
    }

    public void setChangedByRole(String changedByRole) {
        this.changedByRole = changedByRole;
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
