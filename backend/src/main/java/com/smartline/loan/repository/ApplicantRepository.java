package com.smartline.loan.repository;

import com.smartline.loan.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicantRepository extends JpaRepository<Applicant, Long> {

    Optional<Applicant> findByUserId(Long userId);

    Optional<Applicant> findByNicNumber(String nicNumber);

    boolean existsByNicNumber(String nicNumber);
}
