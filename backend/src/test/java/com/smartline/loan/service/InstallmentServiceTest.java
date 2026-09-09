package com.smartline.loan.service;

import com.smartline.loan.dto.request.InstallmentScheduleCreateRequest;
import com.smartline.loan.dto.response.InstallmentScheduleResponse;
import com.smartline.loan.entity.Facility;
import com.smartline.loan.entity.Installment;
import com.smartline.loan.entity.InstallmentSchedule;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.FacilityStatus;
import com.smartline.loan.entity.enums.InstallmentStatus;
import com.smartline.loan.entity.enums.RepaymentFrequency;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.repository.FacilityRepository;
import com.smartline.loan.repository.InstallmentRepository;
import com.smartline.loan.repository.InstallmentScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InstallmentServiceTest {

    @Mock
    private InstallmentScheduleRepository scheduleRepository;

    @Mock
    private InstallmentRepository installmentRepository;

    @Mock
    private FacilityRepository facilityRepository;

    @InjectMocks
    private InstallmentService installmentService;

    private User financeOfficer;
    private Facility facility;

    @BeforeEach
    void setUp() {
        financeOfficer = new User();
        financeOfficer.setId(7L);
        financeOfficer.setUsername("financeofficer");
        financeOfficer.setFullName("Asanka Bandara");

        facility = new Facility();
        facility.setId(1L);
        facility.setFacilityNumber("FAC-2026-00001");
        facility.setStatus(FacilityStatus.ACTIVE);
        facility.setPrincipalAmount(new BigDecimal("300000.00"));
        facility.setInterestRate(new BigDecimal("13.00"));
        facility.setTenureMonths(12);
        facility.setInstallmentAmount(new BigDecimal("28250.00"));
        facility.setTotalPayable(new BigDecimal("339000.00"));
        facility.setOutstandingBalance(new BigDecimal("339000.00"));
        facility.setStartDate(LocalDate.now());
    }

    @Test
    void testGenerateSchedule_Success() {
        when(facilityRepository.findById(1L)).thenReturn(Optional.of(facility));
        when(scheduleRepository.existsByFacilityId(1L)).thenReturn(false);
        when(scheduleRepository.save(any(InstallmentSchedule.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InstallmentScheduleCreateRequest request = new InstallmentScheduleCreateRequest();
        request.setFrequency(RepaymentFrequency.MONTHLY);
        request.setStartDate(LocalDate.now().plusMonths(1));

        InstallmentScheduleResponse response = installmentService.generateSchedule(1L, request, financeOfficer);

        assertNotNull(response);
        assertEquals(12, response.getTotalInstallments());
        assertEquals(RepaymentFrequency.MONTHLY, response.getFrequency());
        assertNotNull(response.getInstallments());
        assertEquals(12, response.getInstallments().size());

        // Verify total principal matches facility principal
        BigDecimal sumPrincipal = response.getInstallments().stream()
                .map(i -> i.getPrincipalPortion())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(0, new BigDecimal("300000.00").compareTo(sumPrincipal));

        verify(scheduleRepository).save(any(InstallmentSchedule.class));
    }

    @Test
    void testGenerateSchedule_ThrowsIfFacilityNotActive() {
        facility.setStatus(FacilityStatus.COMPLETED);
        when(facilityRepository.findById(1L)).thenReturn(Optional.of(facility));

        InstallmentScheduleCreateRequest request = new InstallmentScheduleCreateRequest();

        assertThrows(BadRequestException.class, () ->
                installmentService.generateSchedule(1L, request, financeOfficer));
        verify(scheduleRepository, never()).save(any());
    }

    @Test
    void testGenerateSchedule_ThrowsIfScheduleAlreadyExists() {
        when(facilityRepository.findById(1L)).thenReturn(Optional.of(facility));
        when(scheduleRepository.existsByFacilityId(1L)).thenReturn(true);

        InstallmentScheduleCreateRequest request = new InstallmentScheduleCreateRequest();

        assertThrows(BadRequestException.class, () ->
                installmentService.generateSchedule(1L, request, financeOfficer));
        verify(scheduleRepository, never()).save(any());
    }

    @Test
    void testSyncOverdueInstallments() {
        Installment overdueCandidate = new Installment();
        overdueCandidate.setId(3L);
        overdueCandidate.setDueDate(LocalDate.now().minusDays(5));
        overdueCandidate.setStatus(InstallmentStatus.PENDING);

        when(installmentRepository.findByDueDateBeforeAndStatusInOrderByDueDateAsc(any(), any()))
                .thenReturn(List.of(overdueCandidate));

        installmentService.syncOverdueInstallments();

        assertEquals(InstallmentStatus.OVERDUE, overdueCandidate.getStatus());
        verify(installmentRepository).save(overdueCandidate);
    }
}
