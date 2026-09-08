package com.smartline.loan.repository;

import com.smartline.loan.entity.Facility;
import com.smartline.loan.entity.enums.FacilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    Optional<Facility> findByApplicationId(Long applicationId);
    Optional<Facility> findByFacilityNumber(String facilityNumber);
    List<Facility> findByStatusOrderByCreatedAtDesc(FacilityStatus status);
    List<Facility> findAllByOrderByCreatedAtDesc();
    boolean existsByApplicationId(Long applicationId);
    long countByStatus(FacilityStatus status);
}
