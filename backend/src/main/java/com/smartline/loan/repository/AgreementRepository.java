package com.smartline.loan.repository;

import com.smartline.loan.entity.Agreement;
import com.smartline.loan.entity.enums.AgreementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgreementRepository extends JpaRepository<Agreement, Long> {
    Optional<Agreement> findByApplicationId(Long applicationId);
    Optional<Agreement> findByAgreementNumber(String agreementNumber);
    boolean existsByApplicationId(Long applicationId);
    long countByStatus(AgreementStatus status);
}
