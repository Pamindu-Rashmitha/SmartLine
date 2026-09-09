package com.smartline.loan.dto.request;

import jakarta.validation.constraints.NotBlank;

public class SystemConfigRequest {

    @NotBlank(message = "Config value is required")
    private String configValue;

    private String description;

    public SystemConfigRequest() {}

    public SystemConfigRequest(String configValue, String description) {
        this.configValue = configValue;
        this.description = description;
    }

    public String getConfigValue() {
        return configValue;
    }

    public void setConfigValue(String configValue) {
        this.configValue = configValue;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
