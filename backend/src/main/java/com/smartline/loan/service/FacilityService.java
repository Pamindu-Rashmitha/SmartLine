package com.smartline.loan.service;

import com.smartline.loan.dto.response.FacilityResponse;
import com.smartline.loan.entity.Facility;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.FacilityStatus;
import com.smartline.loan.exception.ForbiddenException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.FacilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    @Transactional(readOnly = true)
    public List<FacilityResponse> getFacilities(FacilityStatus status, User currentUser) {
        List<Facility> facilities;
        if (status != null) {
            facilities = facilityRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            facilities = facilityRepository.findAllByOrderByCreatedAtDesc();
        }

        if (currentUser.getRole() != null && currentUser.getRole().name().equals("APPLICANT")) {
            facilities = facilities.stream()
                    .filter(f -> f.getApplication() != null &&
                            f.getApplication().getApplicant() != null &&
                            f.getApplication().getApplicant().getUser().getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        }

        return facilities.stream()
                .map(FacilityResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FacilityResponse getFacilityById(Long id, User currentUser) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", id));

        if (currentUser.getRole() != null && currentUser.getRole().name().equals("APPLICANT")) {
            if (facility.getApplication() == null ||
                facility.getApplication().getApplicant() == null ||
                !facility.getApplication().getApplicant().getUser().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You do not have permission to view this facility");
            }
        }

        return FacilityResponse.fromEntity(facility);
    }
}
