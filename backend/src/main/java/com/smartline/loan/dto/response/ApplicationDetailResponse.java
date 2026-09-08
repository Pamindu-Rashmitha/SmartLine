package com.smartline.loan.dto.response;

import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ApplicationDetailResponse {
    private Long id;
    private String applicationNumber;
    private Long applicantId;
    private String applicantName;
    private String applicantNic;
    private String applicantEmail;
    private String applicantPhone;
    private String applicantAddress;
    private String applicantCity;
    private String applicantEmployment;
    private BigDecimal applicantMonthlyIncome;
    private String applicantEmployer;
    private Integer applicantCreditScore;

    private ApplicationType type;
    private ApplicationStatus status;
    private BigDecimal requestedAmount;
    private String purpose;
    private String rejectionReason;

    private LoanDetailResponse loanDetail;
    private VehicleLeaseDetailResponse vehicleLeaseDetail;
    private CreditAssessmentResponse creditAssessment;
    private VehicleInspectionResponse vehicleInspection;
    private List<GuarantorResponse> guarantors = new ArrayList<>();
    private List<DocumentResponse> documents = new ArrayList<>();
    private List<ApplicationStatusHistoryResponse> statusHistory = new ArrayList<>();

    private String verifiedByName;
    private LocalDateTime verifiedAt;
    private String decidedByName;
    private LocalDateTime decidedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ApplicationDetailResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApplicationNumber() {
        return applicationNumber;
    }

    public void setApplicationNumber(String applicationNumber) {
        this.applicationNumber = applicationNumber;
    }

    public Long getApplicantId() {
        return applicantId;
    }

    public void setApplicantId(Long applicantId) {
        this.applicantId = applicantId;
    }

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public String getApplicantNic() {
        return applicantNic;
    }

    public void setApplicantNic(String applicantNic) {
        this.applicantNic = applicantNic;
    }

    public String getApplicantEmail() {
        return applicantEmail;
    }

    public void setApplicantEmail(String applicantEmail) {
        this.applicantEmail = applicantEmail;
    }

    public String getApplicantPhone() {
        return applicantPhone;
    }

    public void setApplicantPhone(String applicantPhone) {
        this.applicantPhone = applicantPhone;
    }

    public String getApplicantAddress() {
        return applicantAddress;
    }

    public void setApplicantAddress(String applicantAddress) {
        this.applicantAddress = applicantAddress;
    }

    public String getApplicantCity() {
        return applicantCity;
    }

    public void setApplicantCity(String applicantCity) {
        this.applicantCity = applicantCity;
    }

    public String getApplicantEmployment() {
        return applicantEmployment;
    }

    public void setApplicantEmployment(String applicantEmployment) {
        this.applicantEmployment = applicantEmployment;
    }

    public BigDecimal getApplicantMonthlyIncome() {
        return applicantMonthlyIncome;
    }

    public void setApplicantMonthlyIncome(BigDecimal applicantMonthlyIncome) {
        this.applicantMonthlyIncome = applicantMonthlyIncome;
    }

    public String getApplicantEmployer() {
        return applicantEmployer;
    }

    public void setApplicantEmployer(String applicantEmployer) {
        this.applicantEmployer = applicantEmployer;
    }

    public Integer getApplicantCreditScore() {
        return applicantCreditScore;
    }

    public void setApplicantCreditScore(Integer applicantCreditScore) {
        this.applicantCreditScore = applicantCreditScore;
    }

    public ApplicationType getType() {
        return type;
    }

    public void setType(ApplicationType type) {
        this.type = type;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public BigDecimal getRequestedAmount() {
        return requestedAmount;
    }

    public void setRequestedAmount(BigDecimal requestedAmount) {
        this.requestedAmount = requestedAmount;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LoanDetailResponse getLoanDetail() {
        return loanDetail;
    }

    public void setLoanDetail(LoanDetailResponse loanDetail) {
        this.loanDetail = loanDetail;
    }

    public VehicleLeaseDetailResponse getVehicleLeaseDetail() {
        return vehicleLeaseDetail;
    }

    public void setVehicleLeaseDetail(VehicleLeaseDetailResponse vehicleLeaseDetail) {
        this.vehicleLeaseDetail = vehicleLeaseDetail;
    }

    public List<GuarantorResponse> getGuarantors() {
        return guarantors;
    }

    public void setGuarantors(List<GuarantorResponse> guarantors) {
        this.guarantors = guarantors;
    }

    public List<DocumentResponse> getDocuments() {
        return documents;
    }

    public void setDocuments(List<DocumentResponse> documents) {
        this.documents = documents;
    }

    public List<ApplicationStatusHistoryResponse> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<ApplicationStatusHistoryResponse> statusHistory) {
        this.statusHistory = statusHistory;
    }

    public String getVerifiedByName() {
        return verifiedByName;
    }

    public void setVerifiedByName(String verifiedByName) {
        this.verifiedByName = verifiedByName;
    }

    public CreditAssessmentResponse getCreditAssessment() {
        return creditAssessment;
    }

    public void setCreditAssessment(CreditAssessmentResponse creditAssessment) {
        this.creditAssessment = creditAssessment;
    }

    public VehicleInspectionResponse getVehicleInspection() {
        return vehicleInspection;
    }

    public void setVehicleInspection(VehicleInspectionResponse vehicleInspection) {
        this.vehicleInspection = vehicleInspection;
    }

    public String getDecidedByName() {
        return decidedByName;
    }

    public void setDecidedByName(String decidedByName) {
        this.decidedByName = decidedByName;
    }

    public LocalDateTime getDecidedAt() {
        return decidedAt;
    }

    public void setDecidedAt(LocalDateTime decidedAt) {
        this.decidedAt = decidedAt;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
