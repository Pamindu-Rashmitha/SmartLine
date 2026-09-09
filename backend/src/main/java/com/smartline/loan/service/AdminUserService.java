package com.smartline.loan.service;

import com.smartline.loan.dto.request.PasswordResetRequest;
import com.smartline.loan.dto.request.UserCreateRequest;
import com.smartline.loan.dto.request.UserUpdateRequest;
import com.smartline.loan.dto.response.UserResponse;
import com.smartline.loan.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface AdminUserService {

    Page<UserResponse> getAllUsers(String search, Role role, Boolean active, Pageable pageable);

    UserResponse getUserById(Long id);

    UserResponse createUser(UserCreateRequest request);

    UserResponse updateUser(Long id, UserUpdateRequest request);

    UserResponse toggleUserStatus(Long id, boolean active);

    void resetPassword(Long id, PasswordResetRequest request);

    Map<String, Object> getUserStatistics();
}
