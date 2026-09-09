package com.smartline.loan.service;

import com.smartline.loan.dto.response.NotificationResponse;
import com.smartline.loan.dto.response.PageResponse;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.NotificationType;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    NotificationResponse sendToUser(User user, String title, String message,
                                   NotificationType type, String referenceType, Long referenceId);

    void sendToRole(Role role, String title, String message,
                    NotificationType type, String referenceType, Long referenceId);

    PageResponse<NotificationResponse> getUserNotifications(Long userId, Pageable pageable);

    long getUnreadCount(Long userId);

    NotificationResponse markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);
}
