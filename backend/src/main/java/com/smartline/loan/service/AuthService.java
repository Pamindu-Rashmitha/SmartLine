package com.smartline.loan.service;

import com.smartline.loan.dto.request.LoginRequest;
import com.smartline.loan.dto.request.RegisterRequest;
import com.smartline.loan.dto.response.AuthResponse;
import com.smartline.loan.dto.response.UserResponse;
import com.smartline.loan.entity.Applicant;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.ApplicantRepository;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ApplicantRepository applicantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       ApplicantRepository applicantRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.applicantRepository = applicantRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsernameOrEmail(
                loginRequest.getUsernameOrEmail(),
                loginRequest.getUsernameOrEmail()
        ).orElseThrow(() -> new ResourceNotFoundException("User", "username/email", loginRequest.getUsernameOrEmail()));

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email address is already in use!");
        }

        Role role = registerRequest.getRole() != null ? registerRequest.getRole() : Role.APPLICANT;

        User user = User.builder()
                .username(registerRequest.getUsername().trim())
                .email(registerRequest.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName().trim())
                .phoneNumber(registerRequest.getPhoneNumber())
                .role(role)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        Long applicantId = null;
        if (role == Role.APPLICANT) {
            String nic = registerRequest.getNicNumber() != null ? registerRequest.getNicNumber().trim() : "NIC-" + savedUser.getId();
            if (applicantRepository.existsByNicNumber(nic)) {
                nic = nic + "-" + System.currentTimeMillis() % 10000;
            }

            Applicant applicant = Applicant.builder()
                    .user(savedUser)
                    .nicNumber(nic)
                    .employmentStatus(registerRequest.getEmploymentStatus() != null ? registerRequest.getEmploymentStatus() : "EMPLOYED")
                    .monthlyIncome(registerRequest.getMonthlyIncome())
                    .employerName(registerRequest.getEmployerName())
                    .city(registerRequest.getCity())
                    .build();

            Applicant savedApplicant = applicantRepository.save(applicant);
            applicantId = savedApplicant.getId();
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getUsername(),
                        registerRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserResponse userResponse = mapToUserResponse(savedUser);
        userResponse.setApplicantId(applicantId);

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return mapToUserResponse(user);
    }

    public UserResponse mapToUserResponse(User user) {
        Long applicantId = null;
        if (user.getRole() == Role.APPLICANT) {
            applicantId = applicantRepository.findByUserId(user.getId())
                    .map(Applicant::getId)
                    .orElse(null);
        }

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .active(user.isActive())
                .applicantId(applicantId)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
