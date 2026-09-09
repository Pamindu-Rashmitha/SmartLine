package com.smartline.loan.service;

import com.smartline.loan.dto.request.InstallmentScheduleCreateRequest;
import com.smartline.loan.dto.response.InstallmentResponse;
import com.smartline.loan.dto.response.InstallmentScheduleResponse;
import com.smartline.loan.entity.Facility;
import com.smartline.loan.entity.Installment;
import com.smartline.loan.entity.InstallmentSchedule;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.FacilityStatus;
import com.smartline.loan.entity.enums.InstallmentStatus;
import com.smartline.loan.entity.enums.RepaymentFrequency;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.FacilityRepository;
import com.smartline.loan.repository.InstallmentRepository;
import com.smartline.loan.repository.InstallmentScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InstallmentService {

    private final InstallmentScheduleRepository scheduleRepository;
    private final InstallmentRepository installmentRepository;
    private final FacilityRepository facilityRepository;

    public InstallmentService(InstallmentScheduleRepository scheduleRepository,
                              InstallmentRepository installmentRepository,
                              FacilityRepository facilityRepository) {
        this.scheduleRepository = scheduleRepository;
        this.installmentRepository = installmentRepository;
        this.facilityRepository = facilityRepository;
    }

    @Transactional
    public InstallmentScheduleResponse generateSchedule(Long facilityId,
                                                        InstallmentScheduleCreateRequest request,
                                                        User officer) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", facilityId));

        if (facility.getStatus() != FacilityStatus.ACTIVE) {
            throw new BadRequestException("Installment schedule can only be created for ACTIVE facilities. Current: " + facility.getStatus());
        }

        if (scheduleRepository.existsByFacilityId(facilityId)) {
            throw new BadRequestException("An installment schedule already exists for facility #" + facility.getFacilityNumber());
        }

        Integer tenure = facility.getTenureMonths() != null ? facility.getTenureMonths() : 12;
        if (tenure <= 0) {
            throw new BadRequestException("Invalid facility tenure: " + tenure);
        }

        BigDecimal principal = facility.getPrincipalAmount();
        BigDecimal totalPayable = facility.getTotalPayable();
        BigDecimal totalInterest = totalPayable.subtract(principal);
        if (totalInterest.compareTo(BigDecimal.ZERO) < 0) {
            totalInterest = BigDecimal.ZERO;
        }

        RepaymentFrequency frequency = request.getFrequency() != null ? request.getFrequency() : RepaymentFrequency.MONTHLY;
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : facility.getStartDate().plusMonths(1);

        InstallmentSchedule schedule = new InstallmentSchedule();
        schedule.setFacility(facility);
        schedule.setTotalInstallments(tenure);
        schedule.setFrequency(frequency);
        schedule.setStartDate(startDate);
        schedule.setCreatedBy(officer);

        BigDecimal tenureBD = BigDecimal.valueOf(tenure);
        BigDecimal standardPrincipal = principal.divide(tenureBD, 2, RoundingMode.HALF_UP);
        BigDecimal standardInterest = totalInterest.divide(tenureBD, 2, RoundingMode.HALF_UP);
        BigDecimal standardTotal = standardPrincipal.add(standardInterest);

        schedule.setInstallmentAmount(facility.getInstallmentAmount() != null ? facility.getInstallmentAmount() : standardTotal);

        List<Installment> installments = new ArrayList<>();
        BigDecimal accumulatedPrincipal = BigDecimal.ZERO;
        BigDecimal accumulatedInterest = BigDecimal.ZERO;
        LocalDate today = LocalDate.now();

        for (int i = 1; i <= tenure; i++) {
            Installment inst = new Installment();
            inst.setSchedule(schedule);
            inst.setFacility(facility);
            inst.setInstallmentNumber(i);

            LocalDate dueDate;
            if (frequency == RepaymentFrequency.WEEKLY) {
                dueDate = startDate.plusWeeks(i - 1);
            } else if (frequency == RepaymentFrequency.BI_WEEKLY) {
                dueDate = startDate.plusWeeks((i - 1) * 2L);
            } else {
                dueDate = startDate.plusMonths(i - 1);
            }
            inst.setDueDate(dueDate);

            BigDecimal instPrincipal;
            BigDecimal instInterest;

            if (i == tenure) {
                // Reconcile remaining cents to ensure total matches exactly
                instPrincipal = principal.subtract(accumulatedPrincipal);
                instInterest = totalInterest.subtract(accumulatedInterest);
            } else {
                instPrincipal = standardPrincipal;
                instInterest = standardInterest;
                accumulatedPrincipal = accumulatedPrincipal.add(instPrincipal);
                accumulatedInterest = accumulatedInterest.add(instInterest);
            }

            inst.setPrincipalPortion(instPrincipal);
            inst.setInterestPortion(instInterest);
            inst.setTotalAmount(instPrincipal.add(instInterest));
            inst.setPaidAmount(BigDecimal.ZERO);

            if (dueDate.isBefore(today)) {
                inst.setStatus(InstallmentStatus.OVERDUE);
            } else {
                inst.setStatus(InstallmentStatus.PENDING);
            }

            installments.add(inst);
        }

        schedule.setInstallments(installments);
        InstallmentSchedule saved = scheduleRepository.save(schedule);

        return InstallmentScheduleResponse.fromEntity(saved);
    }

    @Transactional
    public InstallmentScheduleResponse getScheduleByFacility(Long facilityId) {
        InstallmentSchedule schedule = scheduleRepository.findByFacilityId(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("InstallmentSchedule for Facility", "id", facilityId));

        syncScheduleOverdues(schedule);
        return InstallmentScheduleResponse.fromEntity(schedule);
    }

    @Transactional(readOnly = true)
    public List<InstallmentResponse> getInstallmentsByFacility(Long facilityId) {
        return installmentRepository.findByFacilityIdOrderByInstallmentNumberAsc(facilityId).stream()
                .map(InstallmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void syncOverdueInstallments() {
        LocalDate today = LocalDate.now();
        List<Installment> dueInstallments = installmentRepository.findByDueDateBeforeAndStatusInOrderByDueDateAsc(
                today,
                List.of(InstallmentStatus.PENDING, InstallmentStatus.PARTIALLY_PAID)
        );

        for (Installment inst : dueInstallments) {
            inst.setStatus(InstallmentStatus.OVERDUE);
            installmentRepository.save(inst);
        }
    }

    private void syncScheduleOverdues(InstallmentSchedule schedule) {
        LocalDate today = LocalDate.now();
        if (schedule.getInstallments() != null) {
            for (Installment inst : schedule.getInstallments()) {
                if ((inst.getStatus() == InstallmentStatus.PENDING || inst.getStatus() == InstallmentStatus.PARTIALLY_PAID)
                        && inst.getDueDate().isBefore(today)) {
                    inst.setStatus(InstallmentStatus.OVERDUE);
                    installmentRepository.save(inst);
                }
            }
        }
    }
}
