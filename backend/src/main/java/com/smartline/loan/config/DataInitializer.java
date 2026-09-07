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
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ApplicantRepository applicantRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.applicantRepository = applicantRepository;
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

        logger.info("Data initialization complete. 9 demo accounts ready.");
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
