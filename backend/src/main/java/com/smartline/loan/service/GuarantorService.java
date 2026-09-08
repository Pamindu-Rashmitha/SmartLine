package com.smartline.loan.service;

import com.smartline.loan.dto.request.GuarantorRequest;
import com.smartline.loan.dto.response.GuarantorResponse;
import com.smartline.loan.entity.Applicant;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.Guarantor;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.ApplicantRepository;
import com.smartline.loan.repository.ApplicationRepository;
import com.smartline.loan.repository.GuarantorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GuarantorService {

    private final GuarantorRepository guarantorRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicantRepository applicantRepository;

    public GuarantorService(GuarantorRepository guarantorRepository,
                            ApplicationRepository applicationRepository,
                            ApplicantRepository applicantRepository) {
        this.guarantorRepository = guarantorRepository;
        this.applicationRepository = applicationRepository;
        this.applicantRepository = applicantRepository;
    }

    @Transactional
    public GuarantorResponse addGuarantor(Long applicationId, GuarantorRequest request, User currentUser) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        checkOwnershipOrStaff(application, currentUser);

        if (application.getStatus() != ApplicationStatus.DRAFT &&
            application.getStatus() != ApplicationStatus.SUBMITTED &&
            currentUser.getRole() == Role.APPLICANT) {
            throw new BadRequestException("Guarantors cannot be modified when application is " + application.getStatus());
        }

        long count = guarantorRepository.countByApplicationId(applicationId);
        if (count >= 3) {
            throw new BadRequestException("A maximum of 3 guarantors can be added per application");
        }

        Guarantor guarantor = new Guarantor(
                application,
                request.getFullName(),
                request.getNic(),
                request.getPhone(),
                request.getRelationship(),
                request.getAddress(),
                request.getOccupation(),
                request.getEmployerName(),
                request.getMonthlyIncome()
        );

        Guarantor saved = guarantorRepository.save(guarantor);
        return mapToResponse(saved);
    }

    @Transactional
    public void removeGuarantor(Long guarantorId, User currentUser) {
        Guarantor guarantor = guarantorRepository.findById(guarantorId)
                .orElseThrow(() -> new ResourceNotFoundException("Guarantor", "id", guarantorId));

        Application application = guarantor.getApplication();
        checkOwnershipOrStaff(application, currentUser);

        if (application.getStatus() != ApplicationStatus.DRAFT && currentUser.getRole() == Role.APPLICANT) {
            throw new BadRequestException("Guarantor cannot be removed after application has progressed beyond DRAFT");
        }

        guarantorRepository.delete(guarantor);
    }

    @Transactional(readOnly = true)
    public List<GuarantorResponse> getGuarantors(Long applicationId, User currentUser) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        checkOwnershipOrStaff(application, currentUser);

        return guarantorRepository.findByApplicationId(applicationId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void checkOwnershipOrStaff(Application application, User user) {
        if (user.getRole() == Role.APPLICANT) {
            Applicant applicant = applicantRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new BadRequestException("Applicant profile not found"));
            if (!application.getApplicant().getId().equals(applicant.getId())) {
                throw new BadRequestException("You do not have permission to access this application");
            }
        }
    }

    @Transactional
    public GuarantorResponse verifyGuarantor(Long guarantorId, com.smartline.loan.dto.request.GuarantorVerifyRequest request, User officer) {
        Guarantor guarantor = guarantorRepository.findById(guarantorId)
                .orElseThrow(() -> new ResourceNotFoundException("Guarantor", "id", guarantorId));

        guarantor.setVerificationStatus(request.getStatus());
        guarantor.setVerifiedBy(officer);
        guarantor.setVerifiedAt(java.time.LocalDateTime.now());
        guarantor.setVerificationRemarks(request.getRemarks());

        Guarantor saved = guarantorRepository.save(guarantor);
        return mapToResponse(saved);
    }

    public GuarantorResponse mapToResponse(Guarantor g) {
        GuarantorResponse res = new GuarantorResponse();
        res.setId(g.getId());
        res.setFullName(g.getFullName());
        res.setNic(g.getNic());
        res.setPhone(g.getPhone());
        res.setRelationship(g.getRelationship());
        res.setAddress(g.getAddress());
        res.setOccupation(g.getOccupation());
        res.setEmployerName(g.getEmployerName());
        res.setMonthlyIncome(g.getMonthlyIncome());
        res.setVerificationStatus(g.getVerificationStatus());
        if (g.getVerifiedBy() != null) {
            res.setVerifiedByName(g.getVerifiedBy().getFullName());
        }
        res.setVerifiedAt(g.getVerifiedAt());
        res.setVerificationRemarks(g.getVerificationRemarks());
        res.setCreatedAt(g.getCreatedAt());
        return res;
    }
}
