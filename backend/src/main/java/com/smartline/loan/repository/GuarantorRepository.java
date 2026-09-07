package com.smartline.loan.repository;

import com.smartline.loan.entity.Guarantor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuarantorRepository extends JpaRepository<Guarantor, Long> {
    List<Guarantor> findByApplicationId(Long applicationId);
    long countByApplicationId(Long applicationId);
}
