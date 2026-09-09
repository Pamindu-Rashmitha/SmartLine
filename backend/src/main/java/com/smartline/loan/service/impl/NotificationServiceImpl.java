package com.smartline.loan.service.impl;

import com.smartline.loan.dto.response.NotificationResponse;
import com.smartline.loan.dto.response.PageResponse;
import com.smartline.loan.entity.Notification;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.NotificationType;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.NotificationRepository;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   UserRepository userRepository,
                                   SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public NotificationResponse sendToUser(User user, String title, String message,
                                           NotificationType type, String referenceType, Long referenceId) {
        if (user == null) {
            log.warn("Attempted to send notification to null user");
            return null;
        }

        Notification notification = new Notification(user, title, message, type, referenceType, referenceId);
        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = NotificationResponse.fromEntity(saved);

        try {
            messagingTemplate.convertAndSendToUser(user.getUsername(), "/queue/notifications", response);
            log.debug("Sent notification {} to user {}", saved.getId(), user.getUsername());
        } catch (Exception e) {
            log.warn("Failed to dispatch WebSocket notification to user {}: {}", user.getUsername(), e.getMessage());
        }

        return response;
    }

    @Override
    public void sendToRole(Role role, String title, String message,
                           NotificationType type, String referenceType, Long referenceId) {
        if (role == null) {
            return;
        }

        List<User> users = userRepository.findAllByRole(role);
        for (User user : users) {
            if (user.isActive()) {
                Notification notification = new Notification(user, title, message, type, referenceType, referenceId);
                Notification saved = notificationRepository.save(notification);
                NotificationResponse response = NotificationResponse.fromEntity(saved);
                try {
                    messagingTemplate.convertAndSendToUser(user.getUsername(), "/queue/notifications", response);
                } catch (Exception e) {
                    log.warn("Failed to send WebSocket notification to user {}: {}", user.getUsername(), e.getMessage());
                }
            }
        }

        try {
            NotificationResponse roleBroadcast = new NotificationResponse(
                    null, title, message, type, referenceType, referenceId, null, false, LocalDateTime.now()
            );
            messagingTemplate.convertAndSend("/topic/role-" + role.name(), roleBroadcast);
        } catch (Exception e) {
            log.warn("Failed to broadcast WebSocket message to topic /topic/role-{}: {}", role.name(), e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        List<NotificationResponse> dtos = page.getContent().stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());

        return new PageResponse<>(
                dtos,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return NotificationResponse.fromEntity(updated);
    }

    @Override
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
}
