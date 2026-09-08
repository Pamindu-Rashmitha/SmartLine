package com.smartline.loan.config;

import com.smartline.loan.entity.Applicant;
import com.smartline.loan.entity.Role;
import com.smartline.loan.entity.User;
import com.smartline.loan.repository.ApplicantRepository;
import com.smartline.loan.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ApplicantRepository applicantRepository;
    private final com.smartline.loan.repository.ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ApplicantRepository applicantRepository,
                           com.smartline.loan.repository.ApplicationRepository applicationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.applicantRepository = applicantRepository;
        this.applicationRepository = applicationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        logger.info("Checking database initialization...");

        createOrUpdateUser("admin", "admin@smartline.lk", "admin123", "System Administrator", "+94771234567", Role.ADMIN);
        createOrUpdateUser("loanofficer", "loanofficer@smartline.lk", "officer123", "Kasun Fernando (Loan Officer)", "+94772345678", Role.LOAN_OFFICER);
        createOrUpdateUser("fieldofficer", "fieldofficer@smartline.lk", "field123", "Ruwan Perera (Field Officer)", "+94773456789", Role.FIELD_OFFICER);
        createOrUpdateUser("creditmanager", "creditmanager@smartline.lk", "manager123", "Nimali Silva (Credit Manager)", "+94774567890", Role.CREDIT_MANAGER);
        createOrUpdateUser("seniormanager", "seniormanager@smartline.lk", "senior123", "Samantha Jayasinghe (Senior Manager)", "+94775678901", Role.SENIOR_MANAGER);
        createOrUpdateUser("legalofficer", "legalofficer@smartline.lk", "legal123", "Dilani Wickramasinghe (Legal Officer)", "+94776789012", Role.LEGAL_OFFICER);
        createOrUpdateUser("financeofficer", "financeofficer@smartline.lk", "finance123", "Asanka Bandara (Finance Officer)", "+94777890123", Role.FINANCE_OFFICER);
        createOrUpdateUser("creditcontrol", "creditcontrol@smartline.lk", "creditcontrol123", "Chathura Dias (Credit Control Officer)", "+94778901234", Role.CREDIT_CONTROL_OFFICER);

        User applicantUser = createOrUpdateUser("applicant", "applicant@smartline.lk", "applicant123", "Saman Kumara (Borrower)", "+94779012345", Role.APPLICANT);

        if (applicantUser != null && applicantRepository.findByUserId(applicantUser.getId()).isEmpty()) {
            Applicant applicant = Applicant.builder()
                    .user(applicantUser)
                    .nicNumber("199428501234")
                    .dateOfBirth(LocalDate.of(1994, 5, 15))
                    .addressLine1("No. 42, Galle Road")
                    .addressLine2("Kollupitiya")
                    .city("Colombo")
                    .postalCode("00300")
                    .employmentStatus("PERMANENT_FULL_TIME")
                    .monthlyIncome(new BigDecimal("185000.00"))
                    .employerName("Apex Software Solutions PLC")
                    .creditScore(745)
                    .build();
            applicantRepository.save(applicant);
            logger.info("Initialized default demo applicant profile for Saman Kumara");
        }

        seedInitialApplications();

        logger.info("Data initialization complete. 9 demo accounts and sample applications ready.");
    }

    private void seedInitialApplications() {
        if (applicationRepository.count() == 0) {
            applicantRepository.findAll().stream().findFirst().ifPresent(applicant -> {
                User loanOfficer = userRepository.findByUsername("loanofficer").orElse(null);
                User creditManager = userRepository.findByUsername("creditmanager").orElse(null);
                User fieldOfficer = userRepository.findByUsername("fieldofficer").orElse(null);
                User seniorManager = userRepository.findByUsername("seniormanager").orElse(null);

                // Application 1: Money Loan (VERIFIED - Ready for Credit Manager)
                com.smartline.loan.entity.Application app1 = new com.smartline.loan.entity.Application(
                        "APP-2026-00001",
                        applicant,
                        com.smartline.loan.entity.enums.ApplicationType.LOAN,
                        new BigDecimal("450000.00"),
                        "Home renovation and solar panel installation"
                );
                app1.setStatus(com.smartline.loan.entity.enums.ApplicationStatus.VERIFIED);
                app1.setSubmittedAt(java.time.LocalDateTime.now().minusDays(2));
                app1.setVerifiedBy(loanOfficer);
                app1.setVerifiedAt(java.time.LocalDateTime.now().minusDays(1));

                com.smartline.loan.entity.LoanDetail ld1 = new com.smartline.loan.entity.LoanDetail(
                        app1,
                        "Home Renovation",
                        24,
                        new BigDecimal("14.00"),
                        "None",
                        BigDecimal.ZERO
                );
                ld1.setCalculatedMonthlyEmi(new BigDecimal("24000.00"));
                ld1.setCalculatedTotalRepayable(new BigDecimal("576000.00"));
                app1.setLoanDetail(ld1);

                com.smartline.loan.entity.Guarantor g1 = new com.smartline.loan.entity.Guarantor(
                        app1,
                        "Sunil Kumara",
                        "196815401234",
                        "+94712345678",
                        "Father",
                        "No. 42, Galle Road, Colombo",
                        "Retired Government Officer",
                        "Pension Department",
                        new BigDecimal("85000.00")
                );
                app1.addGuarantor(g1);
                applicationRepository.save(app1);

                // Application 2: Vehicle Lease (PENDING_FIELD_INSPECTION - Ready for Field Officer)
                com.smartline.loan.entity.Application app2 = new com.smartline.loan.entity.Application(
                        "APP-2026-00002",
                        applicant,
                        com.smartline.loan.entity.enums.ApplicationType.VEHICLE_LEASE,
                        new BigDecimal("1200000.00"),
                        "Commercial motorcycle delivery fleet addition"
                );
                app2.setStatus(com.smartline.loan.entity.enums.ApplicationStatus.PENDING_FIELD_INSPECTION);
                app2.setSubmittedAt(java.time.LocalDateTime.now().minusDays(3));
                app2.setVerifiedBy(loanOfficer);
                app2.setVerifiedAt(java.time.LocalDateTime.now().minusDays(2));

                com.smartline.loan.entity.VehicleLeaseDetail vld2 = new com.smartline.loan.entity.VehicleLeaseDetail(
                        app2,
                        com.smartline.loan.entity.enums.VehicleCategory.MOTORCYCLE,
                        "Yamaha",
                        "FZ-S V3.0 FI",
                        2024,
                        new BigDecimal("1600000.00"),
                        new BigDecimal("400000.00"),
                        36,
                        new BigDecimal("15.00")
                );
                vld2.setRegistrationNumber("WP BHY-4820");
                vld2.setVehicleCondition("NEW");
                vld2.setDealerName("Yamaha Plaza Colombo");
                vld2.setDealerContact("+94112345678");
                vld2.setCalculatedMonthlyEmi(new BigDecimal("48333.33"));
                vld2.setCalculatedTotalRepayable(new BigDecimal("1740000.00"));
                app2.setVehicleLeaseDetail(vld2);

                com.smartline.loan.entity.Guarantor g2 = new com.smartline.loan.entity.Guarantor(
                        app2,
                        "Rohan Jayawardena",
                        "199012301987",
                        "+94776543210",
                        "Colleague",
                        "15/2, Kandy Road, Kelaniya",
                        "Senior Engineer",
                        "Apex Software Solutions PLC",
                        new BigDecimal("210000.00")
                );
                app2.addGuarantor(g2);
                applicationRepository.save(app2);

                // Application 3: High-Value Loan (PENDING_SENIOR_APPROVAL - Ready for Senior Manager)
                com.smartline.loan.entity.Application app3 = new com.smartline.loan.entity.Application(
                        "APP-2026-00003",
                        applicant,
                        com.smartline.loan.entity.enums.ApplicationType.LOAN,
                        new BigDecimal("1500000.00"),
                        "Commercial warehouse solar generation facility setup"
                );
                app3.setStatus(com.smartline.loan.entity.enums.ApplicationStatus.PENDING_SENIOR_APPROVAL);
                app3.setSubmittedAt(java.time.LocalDateTime.now().minusDays(4));
                app3.setVerifiedBy(loanOfficer);
                app3.setVerifiedAt(java.time.LocalDateTime.now().minusDays(3));

                com.smartline.loan.entity.LoanDetail ld3 = new com.smartline.loan.entity.LoanDetail(
                        app3,
                        "Solar Setup",
                        48,
                        new BigDecimal("13.50"),
                        "Vehicle Lease with ABC Finance (Active)",
                        new BigDecimal("35000.00")
                );
                ld3.setCalculatedMonthlyEmi(new BigDecimal("48125.00"));
                ld3.setCalculatedTotalRepayable(new BigDecimal("2310000.00"));
                app3.setLoanDetail(ld3);

                com.smartline.loan.entity.Guarantor g3 = new com.smartline.loan.entity.Guarantor(
                        app3,
                        "Kusum Kumara",
                        "197065401982",
                        "+94771122334",
                        "Mother",
                        "No. 42, Galle Road, Colombo",
                        "Business Owner",
                        "Kumara Stores",
                        new BigDecimal("145000.00")
                );
                g3.setVerificationStatus(com.smartline.loan.entity.enums.VerificationStatus.VERIFIED);
                g3.setVerifiedBy(creditManager);
                g3.setVerifiedAt(java.time.LocalDateTime.now().minusDays(1));
                g3.setVerificationRemarks("Verified via CRIB & bank statement confirmation");
                app3.addGuarantor(g3);

                com.smartline.loan.entity.CreditAssessment ca3 = new com.smartline.loan.entity.CreditAssessment(
                        app3,
                        creditManager,
                        java.time.LocalDateTime.now().minusDays(1),
                        true,
                        "Salary verified against payslip and 6-month bank statements",
                        true,
                        "Confirmed permanent status with employer HR department",
                        "DTI ratio is 32.4% (well within 45% ceiling)",
                        "CRIB rating Grade A, no historical default records",
                        "Guarantor has documented net cashflow exceeding LKR 100k/mo",
                        com.smartline.loan.entity.enums.RiskLevel.LOW,
                        com.smartline.loan.entity.enums.CreditRecommendation.REFER_TO_SENIOR
                );
                app3.setCreditAssessment(ca3);
                applicationRepository.save(app3);

                // Application 4: Vehicle Lease (APPROVED - Complete lifecycle demo)
                com.smartline.loan.entity.Application app4 = new com.smartline.loan.entity.Application(
                        "APP-2026-00004",
                        applicant,
                        com.smartline.loan.entity.enums.ApplicationType.VEHICLE_LEASE,
                        new BigDecimal("950000.00"),
                        "Three-wheeler passenger transport expansion"
                );
                app4.setStatus(com.smartline.loan.entity.enums.ApplicationStatus.APPROVED);
                app4.setSubmittedAt(java.time.LocalDateTime.now().minusDays(5));
                app4.setVerifiedBy(loanOfficer);
                app4.setVerifiedAt(java.time.LocalDateTime.now().minusDays(4));
                app4.setDecidedBy(seniorManager);
                app4.setDecidedAt(java.time.LocalDateTime.now().minusDays(1));

                com.smartline.loan.entity.VehicleLeaseDetail vld4 = new com.smartline.loan.entity.VehicleLeaseDetail(
                        app4,
                        com.smartline.loan.entity.enums.VehicleCategory.THREE_WHEELER,
                        "Bajaj",
                        "RE 205 Optima",
                        2023,
                        new BigDecimal("1400000.00"),
                        new BigDecimal("450000.00"),
                        36,
                        new BigDecimal("15.50")
                );
                vld4.setRegistrationNumber("WP AAX-8932");
                vld4.setVehicleCondition("USED");
                vld4.setCalculatedMonthlyEmi(new BigDecimal("38680.56"));
                vld4.setCalculatedTotalRepayable(new BigDecimal("1392500.00"));
                app4.setVehicleLeaseDetail(vld4);

                com.smartline.loan.entity.VehicleInspection vi4 = new com.smartline.loan.entity.VehicleInspection(
                        app4,
                        fieldOfficer,
                        java.time.LocalDate.now().minusDays(2),
                        "Good exterior paintwork, minor scratches on left fender",
                        "Engine runs smoothly, compression test optimal, transmission gear shift intact",
                        new BigDecimal("1400000.00"),
                        new BigDecimal("1150000.00"),
                        new BigDecimal("1250000.00"),
                        com.smartline.loan.entity.enums.InspectionRating.GOOD,
                        "Recommended for lease financing. Asset value supports requested exposure."
                );
                app4.setVehicleInspection(vi4);

                com.smartline.loan.entity.CreditAssessment ca4 = new com.smartline.loan.entity.CreditAssessment(
                        app4,
                        creditManager,
                        java.time.LocalDateTime.now().minusDays(2),
                        true,
                        "Verified monthly business income",
                        true,
                        "Self-employed transport driver with valid taxi permits",
                        "DTI 28.5%",
                        "CRIB rating 745",
                        "Vehicle inspected with market value LKR 1.4M",
                        com.smartline.loan.entity.enums.RiskLevel.LOW,
                        com.smartline.loan.entity.enums.CreditRecommendation.APPROVE
                );
                ca4.setDecision(com.smartline.loan.entity.enums.CreditDecision.APPROVED);
                ca4.setDecidedBy(seniorManager);
                ca4.setDecidedAt(java.time.LocalDateTime.now().minusDays(1));
                ca4.setDecisionReason("Executive sanction granted based on solid collateral coverage and low risk profile");
                app4.setCreditAssessment(ca4);

                applicationRepository.save(app4);

                logger.info("Seeded 4 comprehensive demo applications across all underwriting stages: APP-2026-00001 (VERIFIED), APP-2026-00002 (PENDING_FIELD_INSPECTION), APP-2026-00003 (PENDING_SENIOR_APPROVAL), APP-2026-00004 (APPROVED)");
            });
        }
    }

    private User createOrUpdateUser(String username, String email, String password, String fullName, String phone, Role role) {
        if (!userRepository.existsByUsername(username)) {
            User user = User.builder()
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .fullName(fullName)
                    .phoneNumber(phone)
                    .role(role)
                    .active(true)
                    .build();
            User saved = userRepository.save(user);
            logger.info("Seeded user account: {} ({})", username, role);
            return saved;
        }
        return userRepository.findByUsername(username).orElse(null);
    }
}
