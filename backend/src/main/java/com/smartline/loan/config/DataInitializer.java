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
                // Application 1: Money Loan (Submitted)
                com.smartline.loan.entity.Application app1 = new com.smartline.loan.entity.Application(
                        "APP-2026-00001",
                        applicant,
                        com.smartline.loan.entity.enums.ApplicationType.LOAN,
                        new BigDecimal("750000.00"),
                        "Home renovation and solar panel installation"
                );
                app1.setStatus(com.smartline.loan.entity.enums.ApplicationStatus.SUBMITTED);
                app1.setSubmittedAt(java.time.LocalDateTime.now().minusDays(1));

                com.smartline.loan.entity.LoanDetail ld = new com.smartline.loan.entity.LoanDetail(
                        app1,
                        "Home Renovation",
                        24,
                        new BigDecimal("14.50"),
                        "None",
                        BigDecimal.ZERO
                );
                ld.setCalculatedMonthlyEmi(new BigDecimal("40312.50"));
                ld.setCalculatedTotalRepayable(new BigDecimal("967500.00"));
                app1.setLoanDetail(ld);

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

                com.smartline.loan.entity.Document d1 = new com.smartline.loan.entity.Document(
                        app1,
                        com.smartline.loan.entity.enums.DocumentType.NIC_FRONT,
                        "saman_nic_front.pdf",
                        "demo_nic_front.pdf",
                        "./uploads/documents/demo_nic_front.pdf",
                        102400L,
                        "application/pdf"
                );
                com.smartline.loan.entity.Document d2 = new com.smartline.loan.entity.Document(
                        app1,
                        com.smartline.loan.entity.enums.DocumentType.SALARY_SLIP,
                        "saman_salary_slip.pdf",
                        "demo_salary_slip.pdf",
                        "./uploads/documents/demo_salary_slip.pdf",
                        204800L,
                        "application/pdf"
                );
                app1.addDocument(d1);
                app1.addDocument(d2);

                applicationRepository.save(app1);

                // Application 2: Vehicle Lease (Under Verification)
                com.smartline.loan.entity.Application app2 = new com.smartline.loan.entity.Application(
                        "APP-2026-00002",
                        applicant,
                        com.smartline.loan.entity.enums.ApplicationType.VEHICLE_LEASE,
                        new BigDecimal("1200000.00"),
                        "Commercial motorcycle delivery fleet addition"
                );
                app2.setStatus(com.smartline.loan.entity.enums.ApplicationStatus.UNDER_VERIFICATION);
                app2.setSubmittedAt(java.time.LocalDateTime.now().minusHours(12));
                userRepository.findByUsername("loanofficer").ifPresent(app2::setVerifiedBy);

                com.smartline.loan.entity.VehicleLeaseDetail vld = new com.smartline.loan.entity.VehicleLeaseDetail(
                        app2,
                        com.smartline.loan.entity.enums.VehicleCategory.MOTORCYCLE,
                        "Yamaha",
                        "FZ-S V3.0",
                        2024,
                        new BigDecimal("1600000.00"),
                        new BigDecimal("400000.00"),
                        36,
                        new BigDecimal("15.00")
                );
                vld.setRegistrationNumber("WP BHY-4820");
                vld.setVehicleCondition("NEW");
                vld.setDealerName("Yamaha Plaza Colombo");
                vld.setDealerContact("+94112345678");
                vld.setCalculatedMonthlyEmi(new BigDecimal("48333.33"));
                vld.setCalculatedTotalRepayable(new BigDecimal("1740000.00"));
                app2.setVehicleLeaseDetail(vld);

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
                logger.info("Seeded initial demo applications: APP-2026-00001 (LOAN) and APP-2026-00002 (VEHICLE_LEASE)");
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
