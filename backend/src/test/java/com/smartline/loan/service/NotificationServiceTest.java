package com.smartline.loan.service;

import com.smartline.loan.dto.response.NotificationResponse;
import com.smartline.loan.dto.response.PageResponse;
import com.smartline.loan.entity.Notification;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.NotificationType;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.NotificationRepository;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(101L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@smartline.com");
        testUser.setFullName("Test User");
        testUser.setRole(Role.LOAN_OFFICER);
        testUser.setActive(true);
    }

    @Test
    void sendToUser_SavesAndDispatchesWebSocket() {
        Notification savedEntity = new Notification(testUser, "Application Submitted",
                "New application received", NotificationType.ACTION_REQUIRED, "APPLICATION", 55L);
        savedEntity.setId(1L);
        savedEntity.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.save(any(Notification.class))).thenReturn(savedEntity);

        NotificationResponse response = notificationService.sendToUser(
                testUser, "Application Submitted", "New application received",
                NotificationType.ACTION_REQUIRED, "APPLICATION", 55L
        );

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Application Submitted", response.getTitle());
        assertEquals(NotificationType.ACTION_REQUIRED, response.getType());
        assertEquals("/applications/55", response.getTargetUrl());

        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(messagingTemplate, times(1)).convertAndSendToUser(
                eq("testuser"), eq("/queue/notifications"), any(NotificationResponse.class)
        );
    }

    @Test
    void sendToRole_DispatchesToAllActiveUsersInRole() {
        User user1 = new User();
        user1.setId(201L);
        user1.setUsername("officer1");
        user1.setActive(true);

        User user2 = new User();
        user2.setId(202L);
        user2.setUsername("officer2");
        user2.setActive(false); // Inactive, should be skipped

        when(userRepository.findAllByRole(Role.LOAN_OFFICER)).thenReturn(List.of(user1, user2));

        Notification saved = new Notification(user1, "Queue Update", "New item",
                NotificationType.INFO, "APPLICATION", 60L);
        saved.setId(10L);
        saved.setCreatedAt(LocalDateTime.now());
        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);

        notificationService.sendToRole(Role.LOAN_OFFICER, "Queue Update", "New item",
                NotificationType.INFO, "APPLICATION", 60L);

        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(messagingTemplate, times(1)).convertAndSendToUser(
                eq("officer1"), eq("/queue/notifications"), any(NotificationResponse.class)
        );
        verify(messagingTemplate, times(1)).convertAndSend(
                eq("/topic/role-LOAN_OFFICER"), any(NotificationResponse.class)
        );
    }

    @Test
    void getUserNotifications_ReturnsPaginatedResponses() {
        Pageable pageable = PageRequest.of(0, 10);
        Notification notif = new Notification(testUser, "Test", "Message",
                NotificationType.INFO, "FACILITY", 99L);
        notif.setId(5L);
        notif.setCreatedAt(LocalDateTime.now());

        Page<Notification> page = new PageImpl<>(List.of(notif), pageable, 1);
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(101L, pageable)).thenReturn(page);

        PageResponse<NotificationResponse> result = notificationService.getUserNotifications(101L, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        assertEquals("/facilities/99", result.getContent().get(0).getTargetUrl());
    }

    @Test
    void getUnreadCount_ReturnsCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse(101L)).thenReturn(3L);

        long count = notificationService.getUnreadCount(101L);
        assertEquals(3L, count);
        verify(notificationRepository, times(1)).countByUserIdAndIsReadFalse(101L);
    }

    @Test
    void markAsRead_Success() {
        Notification notif = new Notification(testUser, "Test", "Message",
                NotificationType.INFO, "APPLICATION", 12L);
        notif.setId(7L);
        notif.setRead(false);
        notif.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.findByIdAndUserId(7L, 101L)).thenReturn(Optional.of(notif));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NotificationResponse updated = notificationService.markAsRead(7L, 101L);

        assertNotNull(updated);
        assertTrue(updated.isRead());
        verify(notificationRepository, times(1)).save(notif);
    }

    @Test
    void markAsRead_NotFound_ThrowsException() {
        when(notificationRepository.findByIdAndUserId(999L, 101L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> notificationService.markAsRead(999L, 101L));
    }

    @Test
    void markAllAsRead_CallsRepository() {
        when(notificationRepository.markAllAsReadByUserId(101L)).thenReturn(4);

        notificationService.markAllAsRead(101L);

        verify(notificationRepository, times(1)).markAllAsReadByUserId(101L);
    }
}
