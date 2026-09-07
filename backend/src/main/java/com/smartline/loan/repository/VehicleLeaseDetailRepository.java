package com.smartline.loan.repository;

import com.smartline.loan.entity.VehicleLeaseDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleLeaseDetailRepository extends JpaRepository<VehicleLeaseDetail, Long> {
    Optional<VehicleLeaseDetail> findByApplicationId(Long applicationId);
}
