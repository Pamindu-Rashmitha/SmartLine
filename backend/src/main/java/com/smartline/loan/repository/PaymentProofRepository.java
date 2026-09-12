package com.smartline.loan.repository;

import com.smartline.loan.entity.PaymentProof;
import com.smartline.loan.entity.enums.PaymentProofStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentProofRepository extends JpaRepository<PaymentProof, Long> {

    List<PaymentProof> findByStatusOrderByCreatedAtDesc(PaymentProofStatus status);

    List<PaymentProof> findByInstallmentIdOrderByCreatedAtDesc(Long installmentId);

    List<PaymentProof> findByFacilityIdOrderByCreatedAtDesc(Long facilityId);

    Optional<PaymentProof> findFirstByInstallmentIdOrderByCreatedAtDesc(Long installmentId);

    Optional<PaymentProof> findFirstByInstallmentIdAndStatus(Long installmentId, PaymentProofStatus status);

    long countByStatus(PaymentProofStatus status);
}
