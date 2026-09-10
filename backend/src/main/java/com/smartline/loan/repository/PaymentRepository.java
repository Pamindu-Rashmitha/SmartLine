package com.smartline.loan.repository;

import com.smartline.loan.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInstallmentIdOrderByCreatedAtDesc(Long installmentId);
    List<Payment> findByFacilityIdOrderByPaymentDateDescCreatedAtDesc(Long facilityId);
    List<Payment> findByIsCancelledFalseOrderByPaymentDateDescCreatedAtDesc();
    long countByIsCancelledFalse();

    long countByPaymentDateAndIsCancelledFalse(LocalDate paymentDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentDate = :paymentDate AND p.isCancelled = false")
    BigDecimal sumAmountByPaymentDateAndIsCancelledFalse(@Param("paymentDate") LocalDate paymentDate);

    List<Payment> findTop5ByIsCancelledFalseOrderByPaymentDateDescCreatedAtDesc();
}
