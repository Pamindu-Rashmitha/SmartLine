package com.smartline.loan.repository;

import com.smartline.loan.entity.VehicleInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleInspectionRepository extends JpaRepository<VehicleInspection, Long> {
    Optional<VehicleInspection> findByApplicationId(Long applicationId);
    boolean existsByApplicationId(Long applicationId);

    List<VehicleInspection> findAllByOrderByInspectionDateDesc();

    long countByInspectionDate(LocalDate date);
    long countByInspectionDateBetween(LocalDate start, LocalDate end);
}
