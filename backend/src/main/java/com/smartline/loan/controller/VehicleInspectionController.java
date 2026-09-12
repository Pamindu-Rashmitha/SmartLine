package com.smartline.loan.controller;

import com.smartline.loan.dto.request.VehicleInspectionRequest;
import com.smartline.loan.dto.response.ApiResponse;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.dto.response.PageResponse;
import com.smartline.loan.dto.response.VehicleInspectionResponse;
import com.smartline.loan.entity.User;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.UserRepository;
import com.smartline.loan.security.UserPrincipal;
import com.smartline.loan.service.VehicleInspectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vehicle-inspections")
@Tag(name = "Vehicle Inspections", description = "Field Officer Vehicle Inspection APIs (EP02 - US07)")
public class VehicleInspectionController {

    private final VehicleInspectionService vehicleInspectionService;
    private final UserRepository userRepository;

    public VehicleInspectionController(VehicleInspectionService vehicleInspectionService,
                                       UserRepository userRepository) {
        this.vehicleInspectionService = vehicleInspectionService;
        this.userRepository = userRepository;
    }

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('FIELD_OFFICER', 'ADMIN')")
    @Operation(summary = "Get field officer vehicle inspection queue")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getInspectionQueue(
            @PageableDefault(size = 10) Pageable pageable) {
        PageResponse<ApplicationResponse> queue = vehicleInspectionService.getInspectionQueue(pageable);
        return ResponseEntity.ok(ApiResponse.success(queue));
    }

    @PostMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('FIELD_OFFICER', 'ADMIN')")
    @Operation(summary = "Record vehicle physical and mechanical inspection report")
    public ResponseEntity<ApiResponse<VehicleInspectionResponse>> recordInspection(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long applicationId,
            @Valid @RequestBody VehicleInspectionRequest request) {
        User currentUser = getCurrentUser(userPrincipal);
        VehicleInspectionResponse response = vehicleInspectionService.recordInspection(applicationId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Vehicle inspection report submitted successfully", response));
    }

    @GetMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('FIELD_OFFICER', 'CREDIT_MANAGER', 'SENIOR_MANAGER', 'LOAN_OFFICER', 'ADMIN')")
    @Operation(summary = "Get vehicle inspection report for an application")
    public ResponseEntity<ApiResponse<VehicleInspectionResponse>> getInspection(
            @PathVariable Long applicationId) {
        VehicleInspectionResponse response = vehicleInspectionService.getInspection(applicationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FIELD_OFFICER', 'CREDIT_MANAGER', 'SENIOR_MANAGER', 'LOAN_OFFICER', 'ADMIN')")
    @Operation(summary = "Get all vehicle inspection reports")
    public ResponseEntity<ApiResponse<List<VehicleInspectionResponse>>> getAllInspections() {
        List<VehicleInspectionResponse> reports = vehicleInspectionService.getAllInspections();
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
