package com.smartline.loan.service;

import com.smartline.loan.dto.request.LoginRequest;
import com.smartline.loan.dto.request.RegisterRequest;
import com.smartline.loan.dto.response.AuthResponse;
import com.smartline.loan.entity.Applicant;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.repository.ApplicantRepository;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicantRepository applicantRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@smartline.lk")
                .fullName("Test User")
                .password("encodedSecret")
                .phoneNumber("+94771234567")
                .role(Role.APPLICANT)
                .active(true)
                .build();

        registerRequest = RegisterRequest.builder()
                .username("newapplicant")
                .email("applicant@example.com")
                .password("password123")
                .fullName("New Applicant")
                .phoneNumber("+94779876543")
                .nicNumber("199512345678")
                .role(Role.APPLICANT)
                .build();
    }

    @Test
    void register_success_createsUserAndApplicant() {
        when(userRepository.existsByUsername("newapplicant")).thenReturn(false);
        when(userRepository.existsByEmail("applicant@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedSecret123");
        Authentication mockAuth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(mockAuth);
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(applicantRepository.save(any(Applicant.class))).thenReturn(new Applicant());
        when(tokenProvider.generateToken(mockAuth)).thenReturn("jwt-mock-token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("jwt-mock-token", response.getAccessToken());
        assertEquals("Bearer", response.getTokenType());
        assertNotNull(response.getUser());
        verify(userRepository, times(1)).save(any(User.class));
        verify(applicantRepository, times(1)).save(any(Applicant.class));
    }

    @Test
    void register_duplicateUsername_throwsBadRequestException() {
        when(userRepository.existsByUsername("newapplicant")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        assertTrue(ex.getMessage().contains("Username is already taken"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_duplicateEmail_throwsBadRequestException() {
        when(userRepository.existsByUsername("newapplicant")).thenReturn(false);
        when(userRepository.existsByEmail("applicant@example.com")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        assertTrue(ex.getMessage().contains("Email address is already in use"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_validCredentials_returnsAuthResponse() {
        LoginRequest loginRequest = LoginRequest.builder()
                .usernameOrEmail("testuser")
                .password("correctPassword")
                .build();

        Authentication mockAuth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(mockAuth);
        when(tokenProvider.generateToken(mockAuth)).thenReturn("valid-jwt-token");
        when(userRepository.findByUsernameOrEmail("testuser", "testuser")).thenReturn(Optional.of(sampleUser));

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("valid-jwt-token", response.getAccessToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals("testuser", response.getUser().getUsername());
    }

    @Test
    void login_badCredentials_throwsException() {
        LoginRequest loginRequest = LoginRequest.builder()
                .usernameOrEmail("testuser")
                .password("wrongPassword")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));
        verify(tokenProvider, never()).generateToken(any());
    }
}
