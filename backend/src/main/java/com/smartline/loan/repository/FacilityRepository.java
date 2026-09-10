package com.smartline.loan.repository;

import com.smartline.loan.entity.Facility;
import com.smartline.loan.entity.enums.FacilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    Optional<Facility> findByApplicationId(Long applicationId);
    Optional<Facility> findByFacilityNumber(String facilityNumber);
    List<Facility> findByStatusOrderByCreatedAtDesc(FacilityStatus status);
    List<Facility> findAllByOrderByCreatedAtDesc();
    List<Facility> findByApplicationApplicantUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByApplicationId(Long applicationId);
    long countByStatus(FacilityStatus status);

    long countByApplicationApplicantUserId(Long userId);
    long countByApplicationApplicantUserIdAndStatus(Long userId, FacilityStatus status);

    @Query("SELECT COALESCE(SUM(f.outstandingBalance), 0) FROM Facility f WHERE f.application.applicant.user.id = :userId AND f.status = 'ACTIVE'")
    BigDecimal sumOutstandingBalanceByApplicantUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(f.outstandingBalance), 0) FROM Facility f WHERE f.status = 'ACTIVE'")
    BigDecimal sumOutstandingBalance();

    @Query("SELECT COALESCE(SUM(f.principalAmount), 0) FROM Facility f WHERE f.startDate >= :start AND f.startDate <= :end")
    BigDecimal sumPrincipalAmountByStartDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    long countByStartDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT f.type, COUNT(f) FROM Facility f GROUP BY f.type")
    List<Object[]> countFacilitiesByTypeGrouped();
}
