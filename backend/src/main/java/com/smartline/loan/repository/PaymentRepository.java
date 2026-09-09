package com.smartline.loan.repository;

import com.smartline.loan.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInstallmentIdOrderByCreatedAtDesc(Long installmentId);
    List<Payment> findByFacilityIdOrderByPaymentDateDescCreatedAtDesc(Long facilityId);
    List<Payment> findByIsCancelledFalseOrderByPaymentDateDescCreatedAtDesc();
    long countByIsCancelledFalse();
}
