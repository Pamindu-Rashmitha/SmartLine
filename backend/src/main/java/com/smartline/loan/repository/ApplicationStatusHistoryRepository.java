package com.smartline.loan.repository;

import com.smartline.loan.entity.ApplicationStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationStatusHistoryRepository extends JpaRepository<ApplicationStatusHistory, Long> {
    List<ApplicationStatusHistory> findByApplicationIdOrderByChangedAtAsc(Long applicationId);
    List<ApplicationStatusHistory> findTop10ByOrderByChangedAtDesc();
}
