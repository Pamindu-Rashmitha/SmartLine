package com.smartline.loan.controller;

import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.UserResponse;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User Directory & Management")
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;

    public UserController(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CREDIT_MANAGER', 'SENIOR_MANAGER')")
    @Operation(summary = "Get list of all users or filter by role (Admin & Management)")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(@RequestParam(required = false) Role role) {
        List<User> users = (role != null) ? userRepository.findAllByRole(role) : userRepository.findAll();
        List<UserResponse> responses = users.stream()
                .map(authService::mapToUserResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREDIT_MANAGER', 'SENIOR_MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Get user details by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return ResponseEntity.ok(ApiResponse.success(authService.mapToUserResponse(user)));
    }
}
