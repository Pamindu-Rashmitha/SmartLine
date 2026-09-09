package com.smartline.loan.controller;

import com.smartline.loan.dto.request.SystemConfigRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.SystemConfigResponse;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.SystemConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/system-config")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "System Configuration", description = "Business Rules and Operational Parameters APIs")
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    public SystemConfigController(SystemConfigService systemConfigService) {
        this.systemConfigService = systemConfigService;
    }

    @GetMapping
    @Operation(summary = "Get all system configuration parameters")
    public ResponseEntity<ApiResponse<List<SystemConfigResponse>>> getAllConfigs() {
        List<SystemConfigResponse> configs = systemConfigService.getAllConfigs();
        return ResponseEntity.ok(ApiResponse.success(configs));
    }

    @GetMapping("/{key}")
    @Operation(summary = "Get a specific system configuration parameter by key")
    public ResponseEntity<ApiResponse<SystemConfigResponse>> getConfigByKey(@PathVariable String key) {
        SystemConfigResponse config = systemConfigService.getConfigByKey(key);
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @PutMapping("/{key}")
    @Operation(summary = "Update a system configuration parameter")
    public ResponseEntity<ApiResponse<SystemConfigResponse>> updateConfig(
            @PathVariable String key,
            @Valid @RequestBody SystemConfigRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long currentUserId = userPrincipal != null ? userPrincipal.getId() : null;
        SystemConfigResponse updated = systemConfigService.updateConfig(key, request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Configuration parameter updated successfully", updated));
    }
}
