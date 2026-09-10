package com.smartline.loan.repository;

import com.smartline.loan.entity.CollectionFollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CollectionFollowUpRepository extends JpaRepository<CollectionFollowUp, Long> {
    List<CollectionFollowUp> findByInstallmentIdOrderByCreatedAtDesc(Long installmentId);
    List<CollectionFollowUp> findByFacilityIdOrderByFollowUpDateDescCreatedAtDesc(Long facilityId);
    List<CollectionFollowUp> findAllByOrderByFollowUpDateDescCreatedAtDesc();

    long countByFollowUpDateBetween(LocalDate start, LocalDate end);
}
