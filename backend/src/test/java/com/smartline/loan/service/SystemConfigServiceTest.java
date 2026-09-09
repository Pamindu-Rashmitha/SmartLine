package com.smartline.loan.service;

import com.smartline.loan.dto.request.SystemConfigRequest;
import com.smartline.loan.dto.response.SystemConfigResponse;
import com.smartline.loan.entity.SystemConfig;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.SystemConfigRepository;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.service.impl.SystemConfigServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SystemConfigServiceTest {

    @Mock
    private SystemConfigRepository systemConfigRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SystemConfigServiceImpl systemConfigService;

    private User adminUser;
    private SystemConfig thresholdConfig;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");

        thresholdConfig = new SystemConfig("SENIOR_APPROVAL_THRESHOLD", "500000.00", "Approval threshold", adminUser);
        thresholdConfig.setId(10L);
    }

    @Test
    void testGetAllConfigs() {
        when(systemConfigRepository.findAll()).thenReturn(List.of(thresholdConfig));

        List<SystemConfigResponse> results = systemConfigService.getAllConfigs();

        assertEquals(1, results.size());
        assertEquals("SENIOR_APPROVAL_THRESHOLD", results.get(0).getConfigKey());
        assertEquals("500000.00", results.get(0).getConfigValue());
        assertEquals("admin", results.get(0).getUpdatedByUsername());
    }

    @Test
    void testGetConfigByKey_Success() {
        when(systemConfigRepository.findByConfigKey("SENIOR_APPROVAL_THRESHOLD")).thenReturn(Optional.of(thresholdConfig));

        SystemConfigResponse result = systemConfigService.getConfigByKey("SENIOR_APPROVAL_THRESHOLD");

        assertNotNull(result);
        assertEquals("500000.00", result.getConfigValue());
    }

    @Test
    void testGetConfigByKey_NotFound() {
        when(systemConfigRepository.findByConfigKey("UNKNOWN_KEY")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> systemConfigService.getConfigByKey("UNKNOWN_KEY"));
    }

    @Test
    void testGetConfigValue_Found() {
        when(systemConfigRepository.findByConfigKey("SENIOR_APPROVAL_THRESHOLD")).thenReturn(Optional.of(thresholdConfig));

        String val = systemConfigService.getConfigValue("SENIOR_APPROVAL_THRESHOLD", "250000.00");
        assertEquals("500000.00", val);
    }

    @Test
    void testGetConfigValue_Fallback() {
        when(systemConfigRepository.findByConfigKey("NON_EXISTENT")).thenReturn(Optional.empty());

        String val = systemConfigService.getConfigValue("NON_EXISTENT", "DEFAULT_VAL");
        assertEquals("DEFAULT_VAL", val);
    }

    @Test
    void testUpdateConfig() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(systemConfigRepository.findByConfigKey("SENIOR_APPROVAL_THRESHOLD")).thenReturn(Optional.of(thresholdConfig));
        when(systemConfigRepository.save(any(SystemConfig.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SystemConfigRequest request = new SystemConfigRequest("750000.00", "Updated threshold");
        SystemConfigResponse updated = systemConfigService.updateConfig("SENIOR_APPROVAL_THRESHOLD", request, 1L);

        assertNotNull(updated);
        assertEquals("750000.00", updated.getConfigValue());
        assertEquals("Updated threshold", updated.getDescription());
        verify(systemConfigRepository, times(1)).save(any(SystemConfig.class));
    }
}
