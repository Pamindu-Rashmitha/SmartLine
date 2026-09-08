package com.smartline.loan.service;

import com.smartline.loan.dto.request.ApplicationCreateRequest;
import com.smartline.loan.dto.request.GuarantorRequest;
import com.smartline.loan.dto.request.LoanDetailRequest;
import com.smartline.loan.dto.request.VehicleLeaseDetailRequest;
import com.smartline.loan.dto.response.*;
import com.smartline.loan.entity.*;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.entity.enums.VehicleCategory;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicantRepository applicantRepository;
    private final LoanDetailRepository loanDetailRepository;
    private final VehicleLeaseDetailRepository vehicleLeaseDetailRepository;
    private final GuarantorRepository guarantorRepository;
    private final DocumentRepository documentRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final GuarantorService guarantorService;
    private final DocumentService documentService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              ApplicantRepository applicantRepository,
                              LoanDetailRepository loanDetailRepository,
                              VehicleLeaseDetailRepository vehicleLeaseDetailRepository,
                              GuarantorRepository guarantorRepository,
                              DocumentRepository documentRepository,
                              ApplicationStatusHistoryRepository statusHistoryRepository,
                              GuarantorService guarantorService,
                              DocumentService documentService) {
        this.applicationRepository = applicationRepository;
        this.applicantRepository = applicantRepository;
        this.loanDetailRepository = loanDetailRepository;
        this.vehicleLeaseDetailRepository = vehicleLeaseDetailRepository;
        this.guarantorRepository = guarantorRepository;
        this.documentRepository = documentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.guarantorService = guarantorService;
        this.documentService = documentService;
    }

    @Transactional
    public ApplicationDetailResponse createApplication(User currentUser, ApplicationCreateRequest request) {
        Applicant applicant = applicantRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("Applicant profile not found for user: " + currentUser.getUsername()));

        String appNumber = generateApplicationNumber();

        Application application = new Application(
                appNumber,
                applicant,
                request.getType(),
                request.getRequestedAmount(),
                request.getPurpose()
        );

        if (request.getType() == ApplicationType.LOAN) {
            LoanDetailRequest ldr = request.getLoanDetail();
            if (ldr == null) {
                throw new BadRequestException("Loan details are required for Money Loan application");
            }
            BigDecimal interestRate = ldr.getProposedInterestRate() != null ?
                    ldr.getProposedInterestRate() : new BigDecimal("14.50");

            LoanDetail loanDetail = new LoanDetail(
                    application,
                    ldr.getLoanPurpose(),
                    ldr.getRequestedTenure(),
                    interestRate,
                    ldr.getExistingLoans(),
                    ldr.getTotalExistingDebt()
            );

            // Compute EMI: Flat rate = (P + P * R * T) / T_months
            BigDecimal[] emiResult = calculateFlatEmi(request.getRequestedAmount(), interestRate, ldr.getRequestedTenure());
            loanDetail.setCalculatedMonthlyEmi(emiResult[0]);
            loanDetail.setCalculatedTotalRepayable(emiResult[1]);

            application.setLoanDetail(loanDetail);

        } else if (request.getType() == ApplicationType.VEHICLE_LEASE) {
            VehicleLeaseDetailRequest vldr = request.getVehicleLeaseDetail();
            if (vldr == null) {
                throw new BadRequestException("Vehicle lease details are required for Leasing application");
            }
            BigDecimal interestRate = vldr.getProposedInterestRate() != null ?
                    vldr.getProposedInterestRate() : new BigDecimal("15.00");

            BigDecimal downPayment = vldr.getDownPaymentAmount() != null ? vldr.getDownPaymentAmount() : BigDecimal.ZERO;
            BigDecimal leaseAmount = vldr.getEstimatedMarketValue().subtract(downPayment);
            if (leaseAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Estimated market value must exceed down-payment amount");
            }
            application.setRequestedAmount(leaseAmount);

            VehicleLeaseDetail vld = new VehicleLeaseDetail(
                    application,
                    vldr.getVehicleCategory() != null ? vldr.getVehicleCategory() : VehicleCategory.MOTORCYCLE,
                    vldr.getMake(),
                    vldr.getModel(),
                    vldr.getYearOfManufacture(),
                    vldr.getEstimatedMarketValue(),
                    downPayment,
                    vldr.getRequestedTenure(),
                    interestRate
            );
            vld.setRegistrationNumber(vldr.getRegistrationNumber());
            vld.setEngineNumber(vldr.getEngineNumber());
            vld.setChassisNumber(vldr.getChassisNumber());
            vld.setColor(vldr.getColor());
            vld.setVehicleCondition(vldr.getVehicleCondition() != null ? vldr.getVehicleCondition() : "USED");
            vld.setDealerName(vldr.getDealerName());
            vld.setDealerContact(vldr.getDealerContact());

            BigDecimal[] emiResult = calculateFlatEmi(leaseAmount, interestRate, vldr.getRequestedTenure());
            vld.setCalculatedMonthlyEmi(emiResult[0]);
            vld.setCalculatedTotalRepayable(emiResult[1]);

            application.setVehicleLeaseDetail(vld);
        }

        // Add initial guarantors if provided in wizard
        if (request.getGuarantors() != null) {
            for (GuarantorRequest gr : request.getGuarantors()) {
                Guarantor g = new Guarantor(
                        application,
                        gr.getFullName(),
                        gr.getNic(),
                        gr.getPhone(),
                        gr.getRelationship(),
                        gr.getAddress(),
                        gr.getOccupation(),
                        gr.getEmployerName(),
                        gr.getMonthlyIncome()
                );
                application.addGuarantor(g);
            }
        }

        if (request.isSubmitImmediately()) {
            if (application.getGuarantors().isEmpty()) {
                throw new BadRequestException("At least one guarantor is required to submit an application");
            }
            application.setStatus(ApplicationStatus.SUBMITTED);
            application.setSubmittedAt(LocalDateTime.now());
        } else {
            application.setStatus(ApplicationStatus.DRAFT);
        }

        Application saved = applicationRepository.save(application);

        // Record initial status in history
        ApplicationStatusHistory history = new ApplicationStatusHistory(
                saved,
                null,
                saved.getStatus(),
                currentUser,
                saved.getStatus() == ApplicationStatus.SUBMITTED ? "Application submitted by applicant" : "Application draft created"
        );
        statusHistoryRepository.save(history);

        return getApplicationDetail(saved.getId(), currentUser);
    }

    @Transactional
    public ApplicationDetailResponse submitApplication(Long applicationId, User currentUser) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        checkApplicantOwnership(application, currentUser);

        if (application.getStatus() != ApplicationStatus.DRAFT) {
            throw new BadRequestException("Application cannot be submitted because it is currently " + application.getStatus());
        }

        long guarantorCount = guarantorRepository.countByApplicationId(applicationId);
        if (guarantorCount == 0) {
            throw new BadRequestException("Please add at least one guarantor before submitting the application");
        }

        ApplicationStatus previousStatus = application.getStatus();
        application.setStatus(ApplicationStatus.SUBMITTED);
        application.setSubmittedAt(LocalDateTime.now());
        Application updated = applicationRepository.save(application);

        ApplicationStatusHistory history = new ApplicationStatusHistory(
                updated,
                previousStatus,
                ApplicationStatus.SUBMITTED,
                currentUser,
                "Submitted for loan officer verification"
        );
        statusHistoryRepository.save(history);

        return getApplicationDetail(updated.getId(), currentUser);
    }

    @Transactional
    public ApplicationDetailResponse cancelApplication(Long applicationId, User currentUser) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        checkApplicantOwnership(application, currentUser);

        if (application.getStatus() != ApplicationStatus.DRAFT &&
            application.getStatus() != ApplicationStatus.SUBMITTED) {
            throw new BadRequestException("Application cannot be cancelled at status: " + application.getStatus());
        }

        ApplicationStatus previousStatus = application.getStatus();
        application.setStatus(ApplicationStatus.CANCELLED);
        Application updated = applicationRepository.save(application);

        ApplicationStatusHistory history = new ApplicationStatusHistory(
                updated,
                previousStatus,
                ApplicationStatus.CANCELLED,
                currentUser,
                "Cancelled by applicant"
        );
        statusHistoryRepository.save(history);

        return getApplicationDetail(updated.getId(), currentUser);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicantApplications(User currentUser) {
        Applicant applicant = applicantRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("Applicant profile not found"));

        return applicationRepository.findByApplicantIdOrderByCreatedAtDesc(applicant.getId())
                .stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplicationDetail(Long applicationId, User currentUser) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        // Security check: applicant can only view their own; staff roles can view any
        if (currentUser.getRole() == Role.APPLICANT) {
            checkApplicantOwnership(application, currentUser);
        }

        return mapToDetailResponse(application);
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> searchApplications(ApplicationStatus status,
                                                               ApplicationType type,
                                                               String search,
                                                               Pageable pageable) {
        Page<Application> page = applicationRepository.searchApplications(status, type, search, pageable);
        List<ApplicationResponse> responses = page.getContent().stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                responses,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    private void checkApplicantOwnership(Application application, User user) {
        Applicant applicant = applicantRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Applicant profile not found"));
        if (!application.getApplicant().getId().equals(applicant.getId())) {
            throw new BadRequestException("You do not have permission to access this application");
        }
    }

    private synchronized String generateApplicationNumber() {
        int year = Year.now().getValue();
        long count = applicationRepository.count() + 1;
        return String.format("APP-%d-%05d", year, count);
    }

    // Flat Rate calculation: Returns [Monthly EMI, Total Repayable]
    private BigDecimal[] calculateFlatEmi(BigDecimal principal, BigDecimal annualRate, int tenureMonths) {
        if (principal == null || annualRate == null || tenureMonths <= 0) {
            return new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO};
        }
        BigDecimal years = BigDecimal.valueOf(tenureMonths).divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
        BigDecimal totalInterest = principal.multiply(annualRate).multiply(years)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal totalRepayable = principal.add(totalInterest);
        BigDecimal monthlyEmi = totalRepayable.divide(BigDecimal.valueOf(tenureMonths), 2, RoundingMode.HALF_UP);
        return new BigDecimal[]{monthlyEmi, totalRepayable};
    }

    public ApplicationResponse mapToSummaryResponse(Application app) {
        ApplicationResponse res = new ApplicationResponse();
        res.setId(app.getId());
        res.setApplicationNumber(app.getApplicationNumber());
        res.setApplicantId(app.getApplicant().getId());
        res.setApplicantName(app.getApplicant().getUser().getFullName());
        res.setApplicantNic(app.getApplicant().getNicNumber());
        res.setApplicantPhone(app.getApplicant().getUser().getPhoneNumber());
        res.setType(app.getType());
        res.setStatus(app.getStatus());
        res.setRequestedAmount(app.getRequestedAmount());
        res.setPurpose(app.getPurpose());

        if (app.getLoanDetail() != null) {
            res.setTenureMonths(app.getLoanDetail().getRequestedTenure());
            res.setMonthlyEmi(app.getLoanDetail().getCalculatedMonthlyEmi());
        } else if (app.getVehicleLeaseDetail() != null) {
            res.setTenureMonths(app.getVehicleLeaseDetail().getRequestedTenure());
            res.setMonthlyEmi(app.getVehicleLeaseDetail().getCalculatedMonthlyEmi());
        }

        res.setGuarantorCount(app.getGuarantors() != null ? app.getGuarantors().size() : 0);
        res.setDocumentCount(app.getDocuments() != null ? app.getDocuments().size() : 0);

        if (app.getVerifiedBy() != null) {
            res.setVerifiedByName(app.getVerifiedBy().getFullName());
        }
        res.setVerifiedAt(app.getVerifiedAt());
        res.setSubmittedAt(app.getSubmittedAt());
        res.setCreatedAt(app.getCreatedAt());
        return res;
    }

    public ApplicationDetailResponse mapToDetailResponse(Application app) {
        ApplicationDetailResponse res = new ApplicationDetailResponse();
        res.setId(app.getId());
        res.setApplicationNumber(app.getApplicationNumber());

        Applicant applicant = app.getApplicant();
        res.setApplicantId(applicant.getId());
        res.setApplicantName(applicant.getUser().getFullName());
        res.setApplicantNic(applicant.getNicNumber());
        res.setApplicantEmail(applicant.getUser().getEmail());
        res.setApplicantPhone(applicant.getUser().getPhoneNumber());
        res.setApplicantAddress(applicant.getAddressLine1() + (applicant.getAddressLine2() != null ? ", " + applicant.getAddressLine2() : ""));
        res.setApplicantCity(applicant.getCity());
        res.setApplicantEmployment(applicant.getEmploymentStatus());
        res.setApplicantMonthlyIncome(applicant.getMonthlyIncome());
        res.setApplicantEmployer(applicant.getEmployerName());
        res.setApplicantCreditScore(applicant.getCreditScore());

        res.setType(app.getType());
        res.setStatus(app.getStatus());
        res.setRequestedAmount(app.getRequestedAmount());
        res.setPurpose(app.getPurpose());
        res.setRejectionReason(app.getRejectionReason());

        if (app.getLoanDetail() != null) {
            LoanDetail ld = app.getLoanDetail();
            LoanDetailResponse ldr = new LoanDetailResponse();
            ldr.setId(ld.getId());
            ldr.setLoanPurpose(ld.getLoanPurpose());
            ldr.setRequestedTenure(ld.getRequestedTenure());
            ldr.setProposedInterestRate(ld.getProposedInterestRate());
            ldr.setExistingLoans(ld.getExistingLoans());
            ldr.setTotalExistingDebt(ld.getTotalExistingDebt());
            ldr.setCalculatedMonthlyEmi(ld.getCalculatedMonthlyEmi());
            ldr.setCalculatedTotalRepayable(ld.getCalculatedTotalRepayable());
            res.setLoanDetail(ldr);
        }

        if (app.getVehicleLeaseDetail() != null) {
            VehicleLeaseDetail vld = app.getVehicleLeaseDetail();
            VehicleLeaseDetailResponse vldr = new VehicleLeaseDetailResponse();
            vldr.setId(vld.getId());
            vldr.setVehicleCategory(vld.getVehicleCategory());
            vldr.setMake(vld.getMake());
            vldr.setModel(vld.getModel());
            vldr.setYearOfManufacture(vld.getYearOfManufacture());
            vldr.setRegistrationNumber(vld.getRegistrationNumber());
            vldr.setEngineNumber(vld.getEngineNumber());
            vldr.setChassisNumber(vld.getChassisNumber());
            vldr.setColor(vld.getColor());
            vldr.setVehicleCondition(vld.getVehicleCondition());
            vldr.setEstimatedMarketValue(vld.getEstimatedMarketValue());
            vldr.setDownPaymentAmount(vld.getDownPaymentAmount());
            vldr.setRequestedTenure(vld.getRequestedTenure());
            vldr.setProposedInterestRate(vld.getProposedInterestRate());
            vldr.setDealerName(vld.getDealerName());
            vldr.setDealerContact(vld.getDealerContact());
            vldr.setCalculatedMonthlyEmi(vld.getCalculatedMonthlyEmi());
            vldr.setCalculatedTotalRepayable(vld.getCalculatedTotalRepayable());
            res.setVehicleLeaseDetail(vldr);
        }

        if (app.getGuarantors() != null) {
            res.setGuarantors(app.getGuarantors().stream()
                    .map(guarantorService::mapToResponse)
                    .collect(Collectors.toList()));
        }

        if (app.getDocuments() != null) {
            res.setDocuments(app.getDocuments().stream()
                    .map(documentService::mapToResponse)
                    .collect(Collectors.toList()));
        }

        List<ApplicationStatusHistory> historyList = statusHistoryRepository.findByApplicationIdOrderByChangedAtAsc(app.getId());
        res.setStatusHistory(historyList.stream().map(h -> {
            ApplicationStatusHistoryResponse hr = new ApplicationStatusHistoryResponse();
            hr.setId(h.getId());
            hr.setFromStatus(h.getFromStatus());
            hr.setToStatus(h.getToStatus());
            hr.setChangedByName(h.getChangedBy().getFullName());
            hr.setChangedByRole(h.getChangedBy().getRole().name());
            hr.setRemarks(h.getRemarks());
            hr.setChangedAt(h.getChangedAt());
            return hr;
        }).collect(Collectors.toList()));

        if (app.getVerifiedBy() != null) {
            res.setVerifiedByName(app.getVerifiedBy().getFullName());
        }
        res.setVerifiedAt(app.getVerifiedAt());

        if (app.getDecidedBy() != null) {
            res.setDecidedByName(app.getDecidedBy().getFullName());
        }
        res.setDecidedAt(app.getDecidedAt());

        if (app.getCreditAssessment() != null) {
            res.setCreditAssessment(mapCreditAssessment(app.getCreditAssessment()));
        }

        if (app.getVehicleInspection() != null) {
            res.setVehicleInspection(mapVehicleInspection(app.getVehicleInspection()));
        }

        res.setSubmittedAt(app.getSubmittedAt());
        res.setCreatedAt(app.getCreatedAt());
        res.setUpdatedAt(app.getUpdatedAt());

        return res;
    }

    private com.smartline.loan.dto.response.CreditAssessmentResponse mapCreditAssessment(com.smartline.loan.entity.CreditAssessment ca) {
        if (ca == null) return null;
        com.smartline.loan.dto.response.CreditAssessmentResponse res = new com.smartline.loan.dto.response.CreditAssessmentResponse();
        res.setId(ca.getId());
        res.setApplicationId(ca.getApplication().getId());
        if (ca.getAssessedBy() != null) {
            res.setAssessedById(ca.getAssessedBy().getId());
            res.setAssessedByName(ca.getAssessedBy().getFullName());
        }
        res.setAssessmentDate(ca.getAssessmentDate());
        res.setIncomeVerified(ca.getIncomeVerified());
        res.setIncomeRemarks(ca.getIncomeRemarks());
        res.setEmploymentVerified(ca.getEmploymentVerified());
        res.setEmploymentRemarks(ca.getEmploymentRemarks());
        res.setDebtToIncomeNotes(ca.getDebtToIncomeNotes());
        res.setCreditHistoryNotes(ca.getCreditHistoryNotes());
        res.setCollateralNotes(ca.getCollateralNotes());
        res.setOverallRiskLevel(ca.getOverallRiskLevel());
        res.setRecommendation(ca.getRecommendation());
        res.setDecision(ca.getDecision());
        res.setDecisionReason(ca.getDecisionReason());
        if (ca.getDecidedBy() != null) {
            res.setDecidedById(ca.getDecidedBy().getId());
            res.setDecidedByName(ca.getDecidedBy().getFullName());
        }
        res.setDecidedAt(ca.getDecidedAt());
        res.setCreatedAt(ca.getCreatedAt());
        res.setUpdatedAt(ca.getUpdatedAt());
        return res;
    }

    private com.smartline.loan.dto.response.VehicleInspectionResponse mapVehicleInspection(com.smartline.loan.entity.VehicleInspection vi) {
        if (vi == null) return null;
        com.smartline.loan.dto.response.VehicleInspectionResponse res = new com.smartline.loan.dto.response.VehicleInspectionResponse();
        res.setId(vi.getId());
        res.setApplicationId(vi.getApplication().getId());
        if (vi.getInspectedBy() != null) {
            res.setInspectedById(vi.getInspectedBy().getId());
            res.setInspectedByName(vi.getInspectedBy().getFullName());
        }
        res.setInspectionDate(vi.getInspectionDate());
        res.setPhysicalCondition(vi.getPhysicalCondition());
        res.setMechanicalCondition(vi.getMechanicalCondition());
        res.setEstimatedMarketValue(vi.getEstimatedMarketValue());
        res.setForcedSaleValue(vi.getForcedSaleValue());
        res.setRecommendedValue(vi.getRecommendedValue());
        res.setOverallRating(vi.getOverallRating());
        res.setRemarks(vi.getRemarks());
        res.setCreatedAt(vi.getCreatedAt());
        res.setUpdatedAt(vi.getUpdatedAt());
        return res;
    }
}
