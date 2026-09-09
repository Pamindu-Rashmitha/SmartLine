package com.smartline.loan.repository;

import com.smartline.loan.entity.InstallmentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstallmentScheduleRepository extends JpaRepository<InstallmentSchedule, Long> {
    Optional<InstallmentSchedule> findByFacilityId(Long facilityId);
    boolean existsByFacilityId(Long facilityId);
}
