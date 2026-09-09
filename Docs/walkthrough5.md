# Walkthrough — Phase 5: Repayment Tracking & Collection Management (EP04)

Phase 5 of the **Smart Line Investment — Loan & Leasing Management System** is complete. We built the complete post-disbursal repayment, installment schedule generation, payment recording, delinquency monitoring, collection follow-up, and administrative ledger management workflow covering **EP04: User Stories US16 to US20**:
- **US16**: Finance Officer generates and tracks straight-line installment amortization schedules (`/api/facilities/{id}/schedule`).
- **US17**: Finance Officer records installment payments (`POST /api/installments/{id}/payments`) with automatic dynamic reconciliation of remaining balances, installment statuses (`PARTIALLY_PAID`, `PAID`), and facility auto-completion (`COMPLETED`).
- **US18**: Applicant self-service portal (`/my-repayments`) with visual progress bars, upcoming due date alerts, full schedule breakdown, and official payment receipts drawer.
- **US19**: Credit Control Officer delinquency recovery desk (`/arrears`, `/collections`) with aging metrics (1–14 days, 15–30 days, 30+ days late), borrower contact details, and follow-up logging (`PHONE_CALL`, `SMS`, `VISIT`, `EMAIL`, `LETTER`) with next callback reminders.
- **US20**: Admin payment voiding & balance reversal (`PUT /api/payments/{id}/cancel`) with mandatory audit justification and automatic ledger restoration.
- All 33 automated backend unit & integration tests passing with 0 failures and 0 errors.
- Clean frontend production build (Vite: 2997 modules transformed, 0 errors).

---

## 1. Accomplishments Overview

### A. Backend Architecture (`/backend`)
- **Enums (`com.smartline.loan.entity.enums`)**:
  - `InstallmentStatus`: `PENDING`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`.
  - `RepaymentFrequency`: `MONTHLY`, `WEEKLY`, `BI_WEEKLY`.
  - `ContactMethod`: `PHONE_CALL`, `SMS`, `VISIT`, `EMAIL`, `LETTER`.
  - `ContactOutcome`: `PROMISED_TO_PAY`, `NO_RESPONSE`, `PARTIAL_PAYMENT_MADE`, `DISPUTED`, `RESCHEDULED`, `OTHER`.
- **JPA Entities & Mappings**:
  - `InstallmentSchedule`: 1:1 linked with `Facility`, tracking total installments, monthly installment amount, frequency, start date, created by officer, and collection of installments.
  - `Installment`: Linked to `InstallmentSchedule` and `Facility`, tracking installment number (1..N), due date, principal portion, interest portion, total amount, paid amount, status, and paid date.
  - `Payment`: Linked to `Installment` and `Facility`, tracking payment amount, payment date, method (`BANK_TRANSFER`, `CASH`, `CHEQUE`), reference number, recorded by officer, remarks, cancellation flag, cancelled by, and cancellation reason.
  - `CollectionFollowUp`: Linked to `Installment` and `Facility`, tracking follow-up date, contact method, contact outcome, borrower conversation notes, next follow-up date, and recording officer.
  - `Facility`: Updated to link `InstallmentSchedule`, `Installment`, `Payment`, and `CollectionFollowUp`.
- **Repositories**:
  - `InstallmentScheduleRepository`: Lookup by `facilityId`.
  - `InstallmentRepository`: Lookup by schedule, facility, status, and custom delinquent query `findDelinquentInstallments`.
  - `PaymentRepository`: Lookup by installment, facility, and active payments.
  - `CollectionFollowUpRepository`: Lookup by installment and facility ordered by date.
- **DTOs**:
  - `InstallmentScheduleCreateRequest`, `InstallmentScheduleResponse`, `InstallmentResponse`.
  - `PaymentRecordRequest`, `PaymentResponse`, `PaymentCancelRequest`.
  - `CollectionFollowUpRequest`, `CollectionFollowUpResponse`, `OverdueInstallmentSummary`.
- **Services**:
  - `InstallmentService`: Straight-line amortization generator reconciling principal/interest rounding on the final installment, schedule retrieval, and automatic overdue status synchronization.
  - `PaymentService`: Transactional payment recording, partial/full payment validation, facility ledger decrement, facility completion on zero balance, and administrative cancellation/reversal.
  - `CollectionService`: Overdue aging calculations, delinquency reporting, and debtor follow-up logging.
- **REST Controllers**:
  - `InstallmentController` (`/api`):
    - `POST /api/facilities/{id}/schedule`: Generates schedule (Finance / Admin).
    - `GET /api/facilities/{id}/schedule`: Full schedule with summary stats.
    - `GET /api/facilities/{id}/installments`: Installment list.
    - `POST /api/installments/sync-overdue`: Synchronizes overdue statuses.
  - `PaymentController` (`/api`):
    - `POST /api/installments/{id}/payments`: Records payment receipt.
    - `GET /api/facilities/{id}/payments`: Facility payment ledger.
    - `GET /api/installments/{id}/payments`: Installment payment receipts.
    - `PUT /api/payments/{id}/cancel`: Void payment with audit justification (Admin).
  - `CollectionController` (`/api`):
    - `GET /api/collections/overdue`: Overdue installments portfolio with aging metrics.
    - `POST /api/installments/{id}/follow-ups`: Log collection follow-up.
    - `GET /api/installments/{id}/follow-ups`: Installment follow-up history.
    - `GET /api/facilities/{id}/follow-ups`: Facility recovery log.
- **Data Seeding (`DataInitializer.java`)**:
  - Enhanced active facility `FAC-2026-00001` (`APP-2026-00007`, LKR 300,000 principal, 12 months, LKR 28,250/mo):
    - Initialized 12-month installment schedule.
    - Installment 1: `PAID` with payment reference `SLIPS-TXN-881920`.
    - Installment 2: `PAID` with payment reference `SLIPS-TXN-894102`.
    - Installment 3: `OVERDUE` with collection follow-up logged by `creditcontrol` ("Debtor confirmed payment will be deposited by coming Friday").
    - Installments 4–12: `PENDING` with upcoming monthly due dates.
    - Facility updated with LKR 56,500.00 total paid and LKR 282,500.00 outstanding.

---

### B. Frontend Architecture (`/frontend`)
- **API Client**:
  - `repaymentApi.js`: Complete wrapper for schedule generation, installment lookups, payment processing, delinquency monitoring, and recovery logging.
- **Modals & Shared Components**:
  - `InstallmentScheduleModal.jsx`: Interactive amortization schedule modal with progress indicators, overdue alerts, installment table, and embedded payment triggers.
  - `PaymentRecordModal.jsx`: Finance Officer payment modal with amount validation, payment channel selector (`BANK_TRANSFER`, `CASH`, `CHEQUE`), reference number, and date.
  - `StatusBadge.jsx`: Added support for `PAID`, `PARTIALLY_PAID`, and `COMPLETED`.
- **Workstations & Pages**:
  - `DelinquentAccountsDesk.jsx` (`/arrears`, `/collections`):
    - Dedicated Credit Control recovery dashboard.
    - KPI cards: Total Overdue Book, Critical Accounts >30 Days, Promised Payments, Recovery Efficiency.
    - Aging bucket filters (`1-14 days`, `15-30 days`, `30+ days`).
    - Borrower contact shortcuts (quick call link, NIC, email).
    - Modal to log debtor interaction notes and scheduled callbacks.
    - Drawer showing complete historical timeline of recovery efforts.
  - `ApplicantRepaymentsPage.jsx` (`/my-repayments`):
    - Borrower self-service repayment portal.
    - Active facility card with completion progress bar.
    - Next payment due date card with countdown and overdue warnings.
    - Tabbed view: Amortization Schedule vs. Payment History & Receipts.
    - Official payment receipt modal with formatted transaction details.
  - `FacilityListPage.jsx`:
    - Added "Schedule & Payments" action trigger to each active facility card.
- **Routing & Navigation**:
  - `AppRoutes.jsx`: Added routes for `/my-repayments`, `/arrears`, `/collections`, `/follow-ups`. Updated `ApplicationsIndexDispatcher` to route Credit Control Officers directly to their recovery desk.
  - `AppSidebar.jsx`: Added "Repayments & Dues" link for applicants, recovery links for credit control, and updated version footer to `Phase 5: EP04 Ready`.

---

## 2. Verification Results

### A. Automated Backend Tests
Ran `.\mvnw.cmd test` targeting JDK 17 with H2 in-memory MySQL mode:
```
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0 -- in com.smartline.loan.LoanManagementApplicationTests
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0 -- in com.smartline.loan.service.AgreementServiceTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0 -- in com.smartline.loan.service.ApplicationServiceTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0 -- in com.smartline.loan.service.CollectionServiceTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0 -- in com.smartline.loan.service.CreditAssessmentServiceTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0 -- in com.smartline.loan.service.DisbursalServiceTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0 -- in com.smartline.loan.service.DownPaymentServiceTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0 -- in com.smartline.loan.service.InstallmentServiceTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0 -- in com.smartline.loan.service.PaymentServiceTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0 -- in com.smartline.loan.service.SeniorAuthorizationServiceTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0 -- in com.smartline.loan.service.VehicleInspectionServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0 -- in com.smartline.loan.service.VerificationServiceTest
[INFO] 
[INFO] Results:
[INFO] Tests run: 33, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### B. Frontend Production Build
Ran `npm run build` in `/frontend`:
```
vite v5.4.21 building for production...
transforming...
✓ 2997 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     1.23 kB │ gzip:   0.68 kB
dist/assets/index-DVEiFimi.css     37.99 kB │ gzip:   6.71 kB
dist/assets/index-DrzhIElL.js   1,664.98 kB │ gzip: 488.62 kB
✓ built in 6.77s
```

---

## 3. Demo Credentials & Test Scenarios

| Role | Username | Password | Key Desk / Workstation | Ready Demo Data |
| :--- | :--- | :--- | :--- | :--- |
| **Credit Control Officer** | `creditcontrol` | `Password@123` | `/arrears` | Overdue installment #3 on `FAC-2026-00001` (Log recovery call, view timeline) |
| **Applicant** | `applicant` | `Password@123` | `/my-repayments` | Active `FAC-2026-00001` (2 of 12 paid progress bar, overdue alert, receipt modal) |
| **Finance Officer** | `financeofficer` | `Password@123` | `/facilities` | Open schedule on `FAC-2026-00001`, click "Pay EMI" to settle installment |
| **Admin** | `admin` | `Password@123` | `/facilities`, `/arrears` | Full administrative visibility, payment voiding and balance reversal |
