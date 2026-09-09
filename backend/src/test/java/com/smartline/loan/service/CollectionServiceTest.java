package com.smartline.loan.service;

import com.smartline.loan.dto.request.CollectionFollowUpRequest;
import com.smartline.loan.dto.response.CollectionFollowUpResponse;
import com.smartline.loan.dto.response.OverdueInstallmentSummary;
import com.smartline.loan.entity.*;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.entity.enums.ContactMethod;
import com.smartline.loan.entity.enums.ContactOutcome;
import com.smartline.loan.entity.enums.InstallmentStatus;
import com.smartline.loan.repository.CollectionFollowUpRepository;
import com.smartline.loan.repository.InstallmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CollectionServiceTest {

    @Mock
    private InstallmentRepository installmentRepository;

    @Mock
    private CollectionFollowUpRepository collectionFollowUpRepository;

    @InjectMocks
    private CollectionService collectionService;

    private User creditControlOfficer;
    private Facility facility;
    private Installment overdueInstallment;

    @BeforeEach
    void setUp() {
        creditControlOfficer = new User();
        creditControlOfficer.setId(8L);
        creditControlOfficer.setUsername("creditcontrol");
        creditControlOfficer.setFullName("Chathura Dias");

        User borrowerUser = new User();
        borrowerUser.setId(9L);
        borrowerUser.setFullName("Saman Kumara");
        borrowerUser.setPhoneNumber("+94779012345");

        Applicant applicant = new Applicant();
        applicant.setId(1L);
        applicant.setUser(borrowerUser);
        applicant.setNicNumber("199428501234");

        Application application = new Application();
        application.setId(7L);
        application.setApplicant(applicant);

        facility = new Facility();
        facility.setId(1L);
        facility.setFacilityNumber("FAC-2026-00001");
        facility.setType(ApplicationType.LOAN);
        facility.setApplication(application);

        overdueInstallment = new Installment();
        overdueInstallment.setId(30L);
        overdueInstallment.setInstallmentNumber(3);
        overdueInstallment.setFacility(facility);
        overdueInstallment.setDueDate(LocalDate.now().minusDays(10));
        overdueInstallment.setTotalAmount(new BigDecimal("28250.00"));
        overdueInstallment.setPaidAmount(BigDecimal.ZERO);
        overdueInstallment.setStatus(InstallmentStatus.OVERDUE);
    }

    @Test
    void testGetOverdueInstallments_CalculatesAging() {
        when(installmentRepository.findDelinquentInstallments(any())).thenReturn(List.of(overdueInstallment));

        List<OverdueInstallmentSummary> result = collectionService.getOverdueInstallments();

        assertNotNull(result);
        assertEquals(1, result.size());
        OverdueInstallmentSummary summary = result.get(0);
        assertEquals(30L, summary.getInstallmentId());
        assertEquals("Saman Kumara", summary.getBorrowerName());
        assertEquals("+94779012345", summary.getBorrowerPhone());
        assertEquals(10L, summary.getDaysOverdue());
        assertEquals(new BigDecimal("28250.00"), summary.getOverdueAmount());
    }

    @Test
    void testRecordFollowUp_Success() {
        when(installmentRepository.findById(30L)).thenReturn(Optional.of(overdueInstallment));
        when(collectionFollowUpRepository.save(any(CollectionFollowUp.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CollectionFollowUpRequest request = new CollectionFollowUpRequest(
                ContactMethod.PHONE_CALL,
                ContactOutcome.PROMISED_TO_PAY,
                "Borrower promised payment on Friday",
                LocalDate.now().plusDays(3)
        );

        CollectionFollowUpResponse response = collectionService.recordFollowUp(30L, request, creditControlOfficer);

        assertNotNull(response);
        assertEquals(ContactMethod.PHONE_CALL, response.getContactMethod());
        assertEquals(ContactOutcome.PROMISED_TO_PAY, response.getContactOutcome());
        assertEquals("Borrower promised payment on Friday", response.getNotes());
        assertEquals("Chathura Dias", response.getRecordedByOfficer());

        verify(collectionFollowUpRepository).save(any(CollectionFollowUp.class));
    }
}
