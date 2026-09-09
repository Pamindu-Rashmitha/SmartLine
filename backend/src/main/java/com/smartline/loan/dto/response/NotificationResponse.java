package com.smartline.loan.dto.response;

import com.smartline.loan.entity.Notification;
import com.smartline.loan.entity.enums.NotificationType;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private String referenceType;
    private Long referenceId;
    private String targetUrl;
    private boolean read;
    private LocalDateTime createdAt;

    public NotificationResponse() {
    }

    public NotificationResponse(Long id, String title, String message, NotificationType type,
                                String referenceType, Long referenceId, String targetUrl,
                                boolean read, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.targetUrl = targetUrl;
        this.read = read;
        this.createdAt = createdAt;
    }

    public static NotificationResponse fromEntity(Notification notification) {
        if (notification == null) {
            return null;
        }

        String targetUrl = null;
        if (notification.getReferenceType() != null && notification.getReferenceId() != null) {
            switch (notification.getReferenceType().toUpperCase()) {
                case "APPLICATION":
                case "INSPECTION":
                case "AGREEMENT":
                    targetUrl = "/applications/" + notification.getReferenceId();
                    break;
                case "FACILITY":
                case "DISBURSAL":
                case "PAYMENT":
                case "COLLECTION":
                    targetUrl = "/facilities/" + notification.getReferenceId();
                    break;
                default:
                    targetUrl = "/applications";
                    break;
            }
        }

        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getReferenceType(),
                notification.getReferenceId(),
                targetUrl,
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getTargetUrl() {
        return targetUrl;
    }

    public void setTargetUrl(String targetUrl) {
        this.targetUrl = targetUrl;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
