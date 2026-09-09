package com.smartline.loan.repository;

import com.smartline.loan.entity.Installment;
import com.smartline.loan.entity.enums.InstallmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InstallmentRepository extends JpaRepository<Installment, Long> {
    List<Installment> findByScheduleIdOrderByInstallmentNumberAsc(Long scheduleId);
    List<Installment> findByFacilityIdOrderByInstallmentNumberAsc(Long facilityId);
    List<Installment> findByStatusOrderByDueDateAsc(InstallmentStatus status);
    List<Installment> findByDueDateBeforeAndStatusInOrderByDueDateAsc(LocalDate date, List<InstallmentStatus> statuses);

    @Query("SELECT i FROM Installment i WHERE i.facility.id = :facilityId AND i.installmentNumber = :number")
    Optional<Installment> findByFacilityIdAndInstallmentNumber(@Param("facilityId") Long facilityId, @Param("number") Integer number);

    @Query("SELECT i FROM Installment i WHERE i.status = 'OVERDUE' OR (i.dueDate < :today AND i.status IN ('PENDING', 'PARTIALLY_PAID')) ORDER BY i.dueDate ASC")
    List<Installment> findDelinquentInstallments(@Param("today") LocalDate today);

    long countByStatus(InstallmentStatus status);
    long countByFacilityIdAndStatus(Long facilityId, InstallmentStatus status);
}
