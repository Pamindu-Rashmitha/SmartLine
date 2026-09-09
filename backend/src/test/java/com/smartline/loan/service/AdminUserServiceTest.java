package com.smartline.loan.service;

import com.smartline.loan.dto.request.PasswordResetRequest;
import com.smartline.loan.dto.request.UserCreateRequest;
import com.smartline.loan.dto.request.UserUpdateRequest;
import com.smartline.loan.dto.response.UserResponse;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.ApplicantRepository;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.service.impl.AdminUserServiceImpl;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicantRepository applicantRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminUserServiceImpl adminUserService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(5L);
        sampleUser.setUsername("testofficer");
        sampleUser.setEmail("officer@smartline.lk");
        sampleUser.setFullName("Test Officer");
        sampleUser.setRole(Role.LOAN_OFFICER);
        sampleUser.setActive(true);
        sampleUser.setPassword("encodedPassword123");
    }

    @Test
    void testGetAllUsers() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> userPage = new PageImpl<>(List.of(sampleUser), pageable, 1);
        when(userRepository.searchUsers(null, null, null, pageable)).thenReturn(userPage);

        Page<UserResponse> result = adminUserService.getAllUsers(null, null, null, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("testofficer", result.getContent().get(0).getUsername());
        assertEquals(Role.LOAN_OFFICER, result.getContent().get(0).getRole());
    }

    @Test
    void testGetUserById_Success() {
        when(userRepository.findById(5L)).thenReturn(Optional.of(sampleUser));

        UserResponse response = adminUserService.getUserById(5L);

        assertNotNull(response);
        assertEquals("testofficer", response.getUsername());
    }

    @Test
    void testGetUserById_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> adminUserService.getUserById(999L));
    }

    @Test
    void testCreateUser_Success() {
        UserCreateRequest request = new UserCreateRequest(
                "newofficer", "new@smartline.lk", "password123", "New Officer", "+94771112223", Role.CREDIT_MANAGER
        );

        when(userRepository.existsByUsername("newofficer")).thenReturn(false);
        when(userRepository.existsByEmail("new@smartline.lk")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        UserResponse response = adminUserService.createUser(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("newofficer", response.getUsername());
        assertEquals(Role.CREDIT_MANAGER, response.getRole());
        assertTrue(response.isActive());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testCreateUser_DuplicateUsername() {
        UserCreateRequest request = new UserCreateRequest(
                "testofficer", "unique@smartline.lk", "password123", "Duplicate User", null, Role.LOAN_OFFICER
        );

        when(userRepository.existsByUsername("testofficer")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> adminUserService.createUser(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testCreateUser_DuplicateEmail() {
        UserCreateRequest request = new UserCreateRequest(
                "uniqueuser", "officer@smartline.lk", "password123", "Duplicate User", null, Role.LOAN_OFFICER
        );

        when(userRepository.existsByUsername("uniqueuser")).thenReturn(false);
        when(userRepository.existsByEmail("officer@smartline.lk")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> adminUserService.createUser(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testUpdateUser_Success() {
        UserUpdateRequest request = new UserUpdateRequest("Updated Name", "officer@smartline.lk", "+94779998877", Role.CREDIT_MANAGER, true);
        when(userRepository.findById(5L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse updated = adminUserService.updateUser(5L, request);

        assertNotNull(updated);
        assertEquals("Updated Name", updated.getFullName());
        assertEquals(Role.CREDIT_MANAGER, updated.getRole());
        assertEquals("+94779998877", updated.getPhoneNumber());
    }

    @Test
    void testToggleUserStatus() {
        when(userRepository.findById(5L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse updated = adminUserService.toggleUserStatus(5L, false);

        assertNotNull(updated);
        assertFalse(updated.isActive());
    }

    @Test
    void testResetPassword() {
        when(userRepository.findById(5L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.encode("brandNewSecret")).thenReturn("newHashedSecret");

        adminUserService.resetPassword(5L, new PasswordResetRequest("brandNewSecret"));

        assertEquals("newHashedSecret", sampleUser.getPassword());
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    void testGetUserStatistics() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByActive(true)).thenReturn(8L);
        when(userRepository.countByActive(false)).thenReturn(2L);
        when(userRepository.countByRole(Role.APPLICANT)).thenReturn(3L);

        Map<String, Object> stats = adminUserService.getUserStatistics();

        assertEquals(10L, stats.get("totalUsers"));
        assertEquals(8L, stats.get("activeUsers"));
        assertEquals(2L, stats.get("inactiveUsers"));
        assertEquals(3L, stats.get("applicantUsers"));
        assertEquals(7L, stats.get("staffUsers"));
    }
}
