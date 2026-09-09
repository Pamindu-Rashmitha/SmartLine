package com.smartline.loan.service;

import com.smartline.loan.dto.request.VehicleInspectionRequest;
import com.smartline.loan.dto.response.VehicleInspectionResponse;
import com.smartline.loan.entity.Applicant;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.VehicleInspection;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.entity.enums.InspectionRating;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.ApplicationStatusHistoryRepository;
import com.smartline.loan.repository.VehicleInspectionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleInspectionServiceTest {

    @Mock
    private VehicleInspectionRepository vehicleInspectionRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @Mock
    private ApplicationService applicationService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private VehicleInspectionService vehicleInspectionService;

    private User fieldOfficer;
    private Application application;

    @BeforeEach
    void setUp() {
        fieldOfficer = new User();
        fieldOfficer.setId(3L);
        fieldOfficer.setUsername("fieldofficer");
        fieldOfficer.setFullName("Ruwan Perera");
        fieldOfficer.setRole(Role.FIELD_OFFICER);

        Applicant applicant = new Applicant();
        applicant.setId(10L);

        application = new Application("APP-2026-00002", applicant, ApplicationType.VEHICLE_LEASE, new BigDecimal("1200000.00"), "Lease");
        application.setId(200L);
        application.setStatus(ApplicationStatus.PENDING_FIELD_INSPECTION);
    }

    @Test
    void testRecordInspection_Success() {
        when(applicationRepository.findById(200L)).thenReturn(Optional.of(application));
        when(vehicleInspectionRepository.findByApplicationId(200L)).thenReturn(Optional.empty());
        when(vehicleInspectionRepository.save(any(VehicleInspection.class))).thenAnswer(i -> {
            VehicleInspection vi = i.getArgument(0);
            vi.setId(1L);
            return vi;
        });
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));

        VehicleInspectionRequest req = new VehicleInspectionRequest();
        req.setInspectionDate(LocalDate.now());
        req.setPhysicalCondition("Good paint, no rust");
        req.setMechanicalCondition("Engine and brakes optimal");
        req.setEstimatedMarketValue(new BigDecimal("1500000.00"));
        req.setForcedSaleValue(new BigDecimal("1200000.00"));
        req.setRecommendedValue(new BigDecimal("1300000.00"));
        req.setOverallRating(InspectionRating.GOOD);
        req.setRemarks("Vehicle in sound condition");

        VehicleInspectionResponse res = vehicleInspectionService.recordInspection(200L, req, fieldOfficer);

        assertNotNull(res);
        assertEquals(InspectionRating.GOOD, res.getOverallRating());
        assertEquals(ApplicationStatus.FIELD_INSPECTION_COMPLETED, application.getStatus());
        verify(statusHistoryRepository, times(1)).save(any());
    }

    @Test
    void testRecordInspection_NonLeaseApplication_ThrowsBadRequest() {
        application.setType(ApplicationType.LOAN);
        when(applicationRepository.findById(200L)).thenReturn(Optional.of(application));

        VehicleInspectionRequest req = new VehicleInspectionRequest();
        assertThrows(BadRequestException.class, () ->
                vehicleInspectionService.recordInspection(200L, req, fieldOfficer));
    }
}
