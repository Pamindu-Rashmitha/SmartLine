package com.smartline.loan.repository;

import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Optional<Application> findByApplicationNumber(String applicationNumber);

    List<Application> findByApplicantIdOrderByCreatedAtDesc(Long applicantId);

    Page<Application> findByStatusInOrderByCreatedAtDesc(List<ApplicationStatus> statuses, Pageable pageable);

    List<Application> findByStatusInOrderByCreatedAtAsc(List<ApplicationStatus> statuses);

    List<Application> findByStatusInOrderByCreatedAtDesc(List<ApplicationStatus> statuses);

    @Query("SELECT a FROM Application a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:type IS NULL OR a.type = :type) AND " +
           "(:search IS NULL OR LOWER(a.applicationNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.applicant.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.applicant.nicNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Application> searchApplications(
            @Param("status") ApplicationStatus status,
            @Param("type") ApplicationType type,
            @Param("search") String search,
            Pageable pageable);

    long countByStatus(ApplicationStatus status);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.status IN ('SUBMITTED', 'UNDER_VERIFICATION')")
    long countPendingVerification();

    @Query("SELECT COUNT(a) FROM Application a WHERE a.status IN ('VERIFIED', 'UNDER_CREDIT_ASSESSMENT', 'FIELD_INSPECTION_COMPLETED')")
    long countPendingCreditAssessment();

    @Query("SELECT COUNT(a) FROM Application a WHERE a.status = 'PENDING_FIELD_INSPECTION'")
    long countPendingFieldInspection();

    @Query("SELECT COUNT(a) FROM Application a WHERE a.status = 'PENDING_SENIOR_APPROVAL'")
    long countPendingSeniorApproval();

    long countByApplicantUserId(Long userId);

    long countByApplicantUserIdAndStatusNotIn(Long userId, List<ApplicationStatus> statuses);

    long countByVerifiedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByDecidedAtBetweenAndStatus(LocalDateTime start, LocalDateTime end, ApplicationStatus status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT a.status, COUNT(a) FROM Application a GROUP BY a.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT a.type, COUNT(a) FROM Application a GROUP BY a.type")
    List<Object[]> countByTypeGrouped();

    List<Application> findTop10ByOrderByCreatedAtDesc();

    List<Application> findTop5ByApplicantUserIdOrderByCreatedAtDesc(Long userId);

    List<Application> findTop10ByStatusInOrderByCreatedAtDesc(List<ApplicationStatus> statuses);
}
