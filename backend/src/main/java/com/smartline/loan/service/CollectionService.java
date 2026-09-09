package com.smartline.loan.service;

import com.smartline.loan.dto.request.CollectionFollowUpRequest;
import com.smartline.loan.dto.response.CollectionFollowUpResponse;
import com.smartline.loan.dto.response.OverdueInstallmentSummary;
import com.smartline.loan.entity.CollectionFollowUp;
import com.smartline.loan.entity.Facility;
import com.smartline.loan.entity.Installment;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.InstallmentStatus;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.CollectionFollowUpRepository;
import com.smartline.loan.repository.InstallmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CollectionService {

    private final InstallmentRepository installmentRepository;
    private final CollectionFollowUpRepository collectionFollowUpRepository;

    public CollectionService(InstallmentRepository installmentRepository,
                             CollectionFollowUpRepository collectionFollowUpRepository) {
        this.installmentRepository = installmentRepository;
        this.collectionFollowUpRepository = collectionFollowUpRepository;
    }

    @Transactional
    public List<OverdueInstallmentSummary> getOverdueInstallments() {
        LocalDate today = LocalDate.now();
        List<Installment> delinquentList = installmentRepository.findDelinquentInstallments(today);

        // Ensure status reflects OVERDUE
        for (Installment inst : delinquentList) {
            if (inst.getStatus() != InstallmentStatus.OVERDUE && inst.getStatus() != InstallmentStatus.PAID) {
                inst.setStatus(InstallmentStatus.OVERDUE);
                installmentRepository.save(inst);
            }
        }

        return delinquentList.stream()
                .map(OverdueInstallmentSummary::fromEntity)
                .sorted((a, b) -> Long.compare(b.getDaysOverdue(), a.getDaysOverdue()))
                .collect(Collectors.toList());
    }

    @Transactional
    public CollectionFollowUpResponse recordFollowUp(Long installmentId, CollectionFollowUpRequest request, User officer) {
        Installment installment = installmentRepository.findById(installmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Installment", "id", installmentId));

        Facility facility = installment.getFacility();

        CollectionFollowUp followUp = new CollectionFollowUp();
        followUp.setInstallment(installment);
        followUp.setFacility(facility);
        followUp.setFollowUpDate(LocalDate.now());
        followUp.setContactMethod(request.getContactMethod());
        followUp.setContactOutcome(request.getContactOutcome());
        followUp.setNotes(request.getNotes());
        followUp.setNextFollowUpDate(request.getNextFollowUpDate());
        followUp.setRecordedBy(officer);

        CollectionFollowUp saved = collectionFollowUpRepository.save(followUp);

        return CollectionFollowUpResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<CollectionFollowUpResponse> getFollowUpsByInstallment(Long installmentId) {
        return collectionFollowUpRepository.findByInstallmentIdOrderByCreatedAtDesc(installmentId).stream()
                .map(CollectionFollowUpResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CollectionFollowUpResponse> getFollowUpsByFacility(Long facilityId) {
        return collectionFollowUpRepository.findByFacilityIdOrderByFollowUpDateDescCreatedAtDesc(facilityId).stream()
                .map(CollectionFollowUpResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
