package com.smartline.loan.repository;

import com.smartline.loan.entity.LoanDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoanDetailRepository extends JpaRepository<LoanDetail, Long> {
    Optional<LoanDetail> findByApplicationId(Long applicationId);
}
