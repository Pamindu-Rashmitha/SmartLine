package com.smartline.loan.service;

import com.smartline.loan.dto.request.VehicleInspectionRequest;
import com.smartline.loan.dto.response.ApplicationResponse;
import com.smartline.loan.dto.response.PageResponse;
import com.smartline.loan.dto.response.VehicleInspectionResponse;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.ApplicationStatusHistory;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.VehicleInspection;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.ApplicationStatusHistoryRepository;
import com.smartline.loan.repository.VehicleInspectionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleInspectionService {

    private final VehicleInspectionRepository vehicleInspectionRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final ApplicationService applicationService;

    public VehicleInspectionService(VehicleInspectionRepository vehicleInspectionRepository,
                                    ApplicationRepository applicationRepository,
                                    ApplicationStatusHistoryRepository statusHistoryRepository,
                                    ApplicationService applicationService) {
        this.vehicleInspectionRepository = vehicleInspectionRepository;
        this.applicationRepository = applicationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.applicationService = applicationService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getInspectionQueue(Pageable pageable) {
        List<ApplicationStatus> statuses = Collections.singletonList(ApplicationStatus.PENDING_FIELD_INSPECTION);
        Page<Application> page = applicationRepository.findByStatusInOrderByCreatedAtDesc(statuses, pageable);

        List<ApplicationResponse> content = page.getContent().stream()
                .map(applicationService::mapToSummaryResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Transactional
    public VehicleInspectionResponse recordInspection(Long applicationId, VehicleInspectionRequest request, User fieldOfficer) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (application.getType() != ApplicationType.VEHICLE_LEASE) {
            throw new BadRequestException("Vehicle inspection is only applicable for Vehicle Lease facilities");
        }

        if (application.getStatus() != ApplicationStatus.PENDING_FIELD_INSPECTION &&
            application.getStatus() != ApplicationStatus.FIELD_INSPECTION_COMPLETED) {
            throw new BadRequestException("Cannot record inspection for application in status: " + application.getStatus());
        }

        VehicleInspection inspection = vehicleInspectionRepository.findByApplicationId(applicationId)
                .orElse(new VehicleInspection());

        inspection.setApplication(application);
        inspection.setInspectedBy(fieldOfficer);
        inspection.setInspectionDate(request.getInspectionDate() != null ? request.getInspectionDate() : LocalDate.now());
        inspection.setPhysicalCondition(request.getPhysicalCondition());
        inspection.setMechanicalCondition(request.getMechanicalCondition());
        inspection.setEstimatedMarketValue(request.getEstimatedMarketValue());
        inspection.setForcedSaleValue(request.getForcedSaleValue());
        inspection.setRecommendedValue(request.getRecommendedValue());
        inspection.setOverallRating(request.getOverallRating());
        inspection.setRemarks(request.getRemarks());

        VehicleInspection saved = vehicleInspectionRepository.save(inspection);

        ApplicationStatus previousStatus = application.getStatus();
        if (previousStatus != ApplicationStatus.FIELD_INSPECTION_COMPLETED) {
            application.setStatus(ApplicationStatus.FIELD_INSPECTION_COMPLETED);
            Application updated = applicationRepository.save(application);

            ApplicationStatusHistory history = new ApplicationStatusHistory(
                    updated,
                    previousStatus,
                    ApplicationStatus.FIELD_INSPECTION_COMPLETED,
                    fieldOfficer,
                    "Vehicle inspection recorded by Field Officer: " + fieldOfficer.getFullName() +
                    " | Rating: " + saved.getOverallRating() +
                    " | Recommended Value: LKR " + saved.getRecommendedValue()
            );
            statusHistoryRepository.save(history);
        }

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public VehicleInspectionResponse getInspection(Long applicationId) {
        VehicleInspection inspection = vehicleInspectionRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("VehicleInspection", "applicationId", applicationId));
        return mapToResponse(inspection);
    }

    public VehicleInspectionResponse mapToResponse(VehicleInspection vi) {
        if (vi == null) return null;
        VehicleInspectionResponse res = new VehicleInspectionResponse();
        res.setId(vi.getId());
        res.setApplicationId(vi.getApplication().getId());
        if (vi.getInspectedBy() != null) {
            res.setInspectedById(vi.getInspectedBy().getId());
            res.setInspectedByName(vi.getInspectedBy().getFullName());
        }
        res.setInspectionDate(vi.getInspectionDate());
        res.setPhysicalCondition(vi.getPhysicalCondition());
        res.setMechanicalCondition(vi.getMechanicalCondition());
        res.setEstimatedMarketValue(vi.getEstimatedMarketValue());
        res.setForcedSaleValue(vi.getForcedSaleValue());
        res.setRecommendedValue(vi.getRecommendedValue());
        res.setOverallRating(vi.getOverallRating());
        res.setRemarks(vi.getRemarks());
        res.setCreatedAt(vi.getCreatedAt());
        res.setUpdatedAt(vi.getUpdatedAt());
        return res;
    }
}
