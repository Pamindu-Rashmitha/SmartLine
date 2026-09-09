package com.smartline.loan.service;

import com.smartline.loan.dto.request.SystemConfigRequest;
import com.smartline.loan.dto.response.SystemConfigResponse;

import java.util.List;

public interface SystemConfigService {

    List<SystemConfigResponse> getAllConfigs();

    SystemConfigResponse getConfigByKey(String key);

    String getConfigValue(String key, String defaultValue);

    SystemConfigResponse updateConfig(String key, SystemConfigRequest request, Long updatedByUserId);
}
