package com.smartline.loan.service;

import com.smartline.loan.entity.enums.ApplicationStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class ApplicationStateMachineTest {

    // Define the valid next statuses for each stage in the Smart Line business lifecycle
    private static final Map<ApplicationStatus, Set<ApplicationStatus>> VALID_TRANSITIONS = Map.ofEntries(
            Map.entry(ApplicationStatus.DRAFT, Set.of(ApplicationStatus.SUBMITTED, ApplicationStatus.CANCELLED)),
            Map.entry(ApplicationStatus.SUBMITTED, Set.of(ApplicationStatus.UNDER_VERIFICATION, ApplicationStatus.CANCELLED)),
            Map.entry(ApplicationStatus.UNDER_VERIFICATION, Set.of(ApplicationStatus.VERIFIED, ApplicationStatus.PENDING_FIELD_INSPECTION, ApplicationStatus.REJECTED)),
            Map.entry(ApplicationStatus.PENDING_FIELD_INSPECTION, Set.of(ApplicationStatus.FIELD_INSPECTION_COMPLETED, ApplicationStatus.REJECTED)),
            Map.entry(ApplicationStatus.FIELD_INSPECTION_COMPLETED, Set.of(ApplicationStatus.UNDER_CREDIT_ASSESSMENT, ApplicationStatus.REJECTED)),
            Map.entry(ApplicationStatus.VERIFIED, Set.of(ApplicationStatus.UNDER_CREDIT_ASSESSMENT, ApplicationStatus.REJECTED)),
            Map.entry(ApplicationStatus.UNDER_CREDIT_ASSESSMENT, Set.of(ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.PENDING_SENIOR_APPROVAL)),
            Map.entry(ApplicationStatus.PENDING_SENIOR_APPROVAL, Set.of(ApplicationStatus.APPROVED, ApplicationStatus.REJECTED)),
            Map.entry(ApplicationStatus.APPROVED, Set.of(ApplicationStatus.AGREEMENT_PENDING, ApplicationStatus.AGREEMENT_VERIFIED)),
            Map.entry(ApplicationStatus.AGREEMENT_PENDING, Set.of(ApplicationStatus.AGREEMENT_VERIFIED, ApplicationStatus.CANCELLED)),
            Map.entry(ApplicationStatus.AGREEMENT_VERIFIED, Set.of(ApplicationStatus.PENDING_DOWN_PAYMENT, ApplicationStatus.PENDING_DISBURSAL)),
            Map.entry(ApplicationStatus.PENDING_DOWN_PAYMENT, Set.of(ApplicationStatus.PENDING_DISBURSAL, ApplicationStatus.CANCELLED)),
            Map.entry(ApplicationStatus.PENDING_DISBURSAL, Set.of(ApplicationStatus.DISBURSED)),
            Map.entry(ApplicationStatus.DISBURSED, Set.of()), // Terminal
            Map.entry(ApplicationStatus.REJECTED, Set.of()),  // Terminal
            Map.entry(ApplicationStatus.CANCELLED, Set.of())  // Terminal
    );

    private boolean isValidTransition(ApplicationStatus from, ApplicationStatus to) {
        Set<ApplicationStatus> allowed = VALID_TRANSITIONS.get(from);
        return allowed != null && allowed.contains(to);
    }

    @Test
    @DisplayName("Money Loan Happy Path Transition Chain succeeds")
    void testMoneyLoanHappyPath() {
        List<ApplicationStatus> happyPath = List.of(
                ApplicationStatus.DRAFT,
                ApplicationStatus.SUBMITTED,
                ApplicationStatus.UNDER_VERIFICATION,
                ApplicationStatus.VERIFIED,
                ApplicationStatus.UNDER_CREDIT_ASSESSMENT,
                ApplicationStatus.APPROVED,
                ApplicationStatus.AGREEMENT_PENDING,
                ApplicationStatus.AGREEMENT_VERIFIED,
                ApplicationStatus.PENDING_DISBURSAL,
                ApplicationStatus.DISBURSED
        );

        for (int i = 0; i < happyPath.size() - 1; i++) {
            ApplicationStatus current = happyPath.get(i);
            ApplicationStatus next = happyPath.get(i + 1);
            assertTrue(isValidTransition(current, next),
                    "Transition from " + current + " to " + next + " should be valid");
        }
    }

    @Test
    @DisplayName("Vehicle Lease with Inspection & Senior Approval Path succeeds")
    void testVehicleLeaseBranchingPath() {
        List<ApplicationStatus> leasePath = List.of(
                ApplicationStatus.DRAFT,
                ApplicationStatus.SUBMITTED,
                ApplicationStatus.UNDER_VERIFICATION,
                ApplicationStatus.PENDING_FIELD_INSPECTION,
                ApplicationStatus.FIELD_INSPECTION_COMPLETED,
                ApplicationStatus.UNDER_CREDIT_ASSESSMENT,
                ApplicationStatus.PENDING_SENIOR_APPROVAL,
                ApplicationStatus.APPROVED,
                ApplicationStatus.AGREEMENT_PENDING,
                ApplicationStatus.AGREEMENT_VERIFIED,
                ApplicationStatus.PENDING_DOWN_PAYMENT,
                ApplicationStatus.PENDING_DISBURSAL,
                ApplicationStatus.DISBURSED
        );

        for (int i = 0; i < leasePath.size() - 1; i++) {
            ApplicationStatus current = leasePath.get(i);
            ApplicationStatus next = leasePath.get(i + 1);
            assertTrue(isValidTransition(current, next),
                    "Transition from " + current + " to " + next + " should be valid");
        }
    }

    @Test
    @DisplayName("Terminal states have no outgoing valid transitions")
    void testTerminalStates() {
        List<ApplicationStatus> terminalStates = List.of(
                ApplicationStatus.DISBURSED,
                ApplicationStatus.REJECTED,
                ApplicationStatus.CANCELLED
        );

        for (ApplicationStatus terminal : terminalStates) {
            for (ApplicationStatus other : ApplicationStatus.values()) {
                assertFalse(isValidTransition(terminal, other),
                        "Terminal state " + terminal + " should not transition to " + other);
            }
        }
    }

    @Test
    @DisplayName("Invalid shortcut transitions are strictly rejected")
    void testInvalidTransitionsRejected() {
        assertFalse(isValidTransition(ApplicationStatus.DRAFT, ApplicationStatus.DISBURSED));
        assertFalse(isValidTransition(ApplicationStatus.SUBMITTED, ApplicationStatus.APPROVED));
        assertFalse(isValidTransition(ApplicationStatus.UNDER_VERIFICATION, ApplicationStatus.DISBURSED));
        assertFalse(isValidTransition(ApplicationStatus.PENDING_DOWN_PAYMENT, ApplicationStatus.VERIFIED));
        assertFalse(isValidTransition(ApplicationStatus.REJECTED, ApplicationStatus.APPROVED));
    }
}
