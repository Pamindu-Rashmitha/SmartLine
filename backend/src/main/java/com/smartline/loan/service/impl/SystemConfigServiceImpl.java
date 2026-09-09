package com.smartline.loan.service.impl;

import com.smartline.loan.dto.request.SystemConfigRequest;
import com.smartline.loan.dto.response.SystemConfigResponse;
import com.smartline.loan.entity.SystemConfig;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.SystemConfigRepository;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.service.SystemConfigService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SystemConfigServiceImpl implements SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;
    private final UserRepository userRepository;

    public SystemConfigServiceImpl(SystemConfigRepository systemConfigRepository, UserRepository userRepository) {
        this.systemConfigRepository = systemConfigRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemConfigResponse> getAllConfigs() {
        return systemConfigRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SystemConfigResponse getConfigByKey(String key) {
        SystemConfig config = systemConfigRepository.findByConfigKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("SystemConfig", "configKey", key));
        return mapToResponse(config);
    }

    @Override
    @Transactional(readOnly = true)
    public String getConfigValue(String key, String defaultValue) {
        return systemConfigRepository.findByConfigKey(key)
                .map(SystemConfig::getConfigValue)
                .orElse(defaultValue);
    }

    @Override
    public SystemConfigResponse updateConfig(String key, SystemConfigRequest request, Long updatedByUserId) {
        User updatedBy = null;
        if (updatedByUserId != null) {
            updatedBy = userRepository.findById(updatedByUserId).orElse(null);
        }

        SystemConfig config = systemConfigRepository.findByConfigKey(key)
                .orElseGet(() -> {
                    SystemConfig newConfig = new SystemConfig();
                    newConfig.setConfigKey(key);
                    return newConfig;
                });

        config.setConfigValue(request.getConfigValue());
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            config.setDescription(request.getDescription());
        }
        config.setUpdatedBy(updatedBy);

        SystemConfig saved = systemConfigRepository.save(config);
        return mapToResponse(saved);
    }

    private SystemConfigResponse mapToResponse(SystemConfig config) {
        String updatedByUsername = config.getUpdatedBy() != null ? config.getUpdatedBy().getUsername() : "SYSTEM";
        return new SystemConfigResponse(
                config.getId(),
                config.getConfigKey(),
                config.getConfigValue(),
                config.getDescription(),
                updatedByUsername,
                config.getUpdatedAt()
        );
    }
}
