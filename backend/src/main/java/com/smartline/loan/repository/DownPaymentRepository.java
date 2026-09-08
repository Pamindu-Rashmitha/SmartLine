package com.smartline.loan.repository;

import com.smartline.loan.entity.DownPayment;
import com.smartline.loan.entity.enums.DownPaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DownPaymentRepository extends JpaRepository<DownPayment, Long> {
    Optional<DownPayment> findByApplicationId(Long applicationId);
    boolean existsByApplicationId(Long applicationId);
    long countByStatus(DownPaymentStatus status);
}
