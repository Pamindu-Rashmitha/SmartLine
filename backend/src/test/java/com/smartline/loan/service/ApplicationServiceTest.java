package com.smartline.loan.service;

import com.smartline.loan.dto.request.ApplicationCreateRequest;
import com.smartline.loan.dto.request.GuarantorRequest;
import com.smartline.loan.dto.request.LoanDetailRequest;
import com.smartline.loan.dto.response.ApplicationDetailResponse;
import com.smartline.loan.entity.Applicant;
import com.smartline.loan.entity.Application;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.entity.enums.ApplicationStatus;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ApplicantRepository applicantRepository;

    @Mock
    private LoanDetailRepository loanDetailRepository;

    @Mock
    private VehicleLeaseDetailRepository vehicleLeaseDetailRepository;

    @Mock
    private GuarantorRepository guarantorRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @Mock
    private GuarantorService guarantorService;

    @Mock
    private DocumentService documentService;

    @InjectMocks
    private ApplicationService applicationService;

    private User applicantUser;
    private Applicant applicant;

    @BeforeEach
    void setUp() {
        applicantUser = new User();
        applicantUser.setId(1L);
        applicantUser.setUsername("applicant");
        applicantUser.setFullName("Saman Kumara");
        applicantUser.setRole(Role.APPLICANT);

        applicant = new Applicant();
        applicant.setId(10L);
        applicant.setUser(applicantUser);
        applicant.setNicNumber("199428501234");
        applicant.setMonthlyIncome(new BigDecimal("150000.00"));
    }

    @Test
    void testCreateMoneyLoanApplication_Success() {
        when(applicantRepository.findByUserId(1L)).thenReturn(Optional.of(applicant));
        when(applicationRepository.count()).thenReturn(0L);

        when(applicationRepository.save(any(Application.class))).thenAnswer(invocation -> {
            Application app = invocation.getArgument(0);
            app.setId(100L);
            return app;
        });

        when(applicationRepository.findById(100L)).thenAnswer(invocation -> {
            Application app = new Application("APP-2026-00001", applicant, ApplicationType.LOAN, new BigDecimal("500000.00"), "Home Renovation");
            app.setId(100L);
            return Optional.of(app);
        });

        ApplicationCreateRequest request = new ApplicationCreateRequest();
        request.setType(ApplicationType.LOAN);
        request.setRequestedAmount(new BigDecimal("500000.00"));
        request.setPurpose("Home Renovation");

        LoanDetailRequest ldr = new LoanDetailRequest();
        ldr.setLoanPurpose("Home Renovation");
        ldr.setRequestedTenure(24);
        ldr.setProposedInterestRate(new BigDecimal("14.50"));
        request.setLoanDetail(ldr);

        GuarantorRequest gr = new GuarantorRequest();
        gr.setFullName("Sunil Perera");
        gr.setNic("197012301234");
        gr.setPhone("+94771234567");
        gr.setRelationship("Father");
        gr.setAddress("Colombo");
        gr.setMonthlyIncome(new BigDecimal("80000.00"));
        request.setGuarantors(Collections.singletonList(gr));

        ApplicationDetailResponse response = applicationService.createApplication(applicantUser, request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        verify(applicationRepository, times(1)).save(any(Application.class));
        verify(statusHistoryRepository, times(1)).save(any());
    }

    @Test
    void testSubmitApplication_FailsWhenNoGuarantors() {
        Application draftApp = new Application("APP-2026-00001", applicant, ApplicationType.LOAN, new BigDecimal("500000.00"), "Personal");
        draftApp.setId(100L);
        draftApp.setStatus(ApplicationStatus.DRAFT);

        when(applicationRepository.findById(100L)).thenReturn(Optional.of(draftApp));
        when(applicantRepository.findByUserId(1L)).thenReturn(Optional.of(applicant));
        when(guarantorRepository.countByApplicationId(100L)).thenReturn(0L);

        assertThrows(BadRequestException.class, () -> applicationService.submitApplication(100L, applicantUser));
    }
}
