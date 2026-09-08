package com.smartline.loan.repository;

import com.smartline.loan.entity.VehicleInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleInspectionRepository extends JpaRepository<VehicleInspection, Long> {
    Optional<VehicleInspection> findByApplicationId(Long applicationId);
    boolean existsByApplicationId(Long applicationId);
}
