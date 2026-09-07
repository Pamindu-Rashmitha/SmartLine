# Walkthrough — Phase 2: Loan & Lease Application Intake & Verification (EP01)

Phase 2 of the **Smart Line Investment — Loan & Leasing Management System** is complete. We built the complete application intake and verification lifecycle covering **EP01: User Stories US01 to US05**:
- Borrower facility selection (**Money Loan** vs. **Vehicle Leasing**).
- Dynamic, interactive monthly installment (EMI) calculator.
- Multi-step customer onboarding wizard with guarantor management and document vault.
- Local disk-backed file storage with UUID naming, type validation, and authenticated streaming downloads.
- Loan Officer verification pipeline queue and side-by-side verification appraisal desk.
- Automated tests, REST API live verification, and end-to-end browser subagent walkthrough.

---

## 1. Accomplishments Overview

### A. Backend Architecture (`/backend`)
- **Enums**:
  - `ApplicationType`: `LOAN`, `VEHICLE_LEASE`.
  - `ApplicationStatus`: Complete 16-state underwriting lifecycle (`DRAFT`, `SUBMITTED`, `UNDER_VERIFICATION`, `VERIFIED`, `UNDER_CREDIT_ASSESSMENT`, `PENDING_FIELD_INSPECTION`, `FIELD_INSPECTION_COMPLETED`, `PENDING_SENIOR_APPROVAL`, `APPROVED`, `REJECTED`, `AGREEMENT_PENDING`, `AGREEMENT_VERIFIED`, `PENDING_DOWN_PAYMENT`, `PENDING_DISBURSAL`, `DISBURSED`, `CANCELLED`).
  - `VehicleCategory`: `MOTORCYCLE`, `THREE_WHEELER`, `CAR`, `VAN`, `BUS`, `TRUCK`, `OTHER`.
  - `DocumentType`: `NIC_FRONT`, `NIC_BACK`, `SALARY_SLIP`, `BANK_STATEMENT`, `UTILITY_BILL`, `VEHICLE_REGISTRATION`, `GUARANTOR_NIC`, etc.
  - `VerificationStatus`: `PENDING`, `VERIFIED`, `REJECTED`.

- **JPA Entities & Tables**:
  - `Application`: Central entity with auto-sequenced reference tracking (e.g. `APP-2026-00001`), applicant linkage, and audit fields.
  - `LoanDetail`: Purpose, tenor, proposed rate, existing debt, calculated EMI, and total repayable.
  - `VehicleLeaseDetail`: Category, make, model, year, condition, market value, down payment, dealer details, calculated monthly lease installment.
  - `Guarantor`: Full name, NIC, phone, relationship, residential address, employer, monthly income, verification status.
  - `Document`: Type, original filename, UUID-based stored filename, disk path, size, content type, verification status, rejection reason.
  - `ApplicationStatusHistory`: Audit log tracking status transitions with triggering user, role, timestamp, and remarks.

- **Storage & Services**:
  - `FileStorageService`: Secure storage in `./uploads/documents/{applicationId}/` with type filtering (PDF, PNG, JPG, WEBP) and 5MB size guard.
  - `ApplicationService`: Creation of loans/leases, EMI computations, draft updates, pre-submission validations, applicant retrieval, and officer search.
  - `GuarantorService`: Adding, removing, and retrieving guarantors with ownership security checks.
  - `DocumentService`: Multi-part file upload, replacement handling, and binary stream download.
  - `VerificationService`: Loan Officer queue management, assigning review locks (`UNDER_VERIFICATION`), document verification, and final decision recording (`VERIFIED` or `REJECTED`).

- **REST Controllers**:
  - `ApplicationController` (`/api/applications`)
  - `GuarantorController` (`/api/applications/{id}/guarantors`, `/api/guarantors/{id}`)
  - `DocumentController` (`/api/applications/{id}/documents`, `/api/documents/{id}/download`)
  - `VerificationController` (`/api/verification/queue`, `/api/verification/{id}/start`, `/api/verification/{id}/complete`)

---

### B. Frontend Architecture (`/frontend`)
- **API Clients**:
  - `applicationApi.js`, `documentApi.js`, `guarantorApi.js`, `verificationApi.js`.
- **Interactive Loan & Lease Calculator**:
  - `LoanCalculatorWidget.jsx`: Real-time interactive sliders for requested financing and tenure with live computation of monthly installment (EMI), interest portion, and gross total repayable.
- **5-Step Application Wizard**:
  - `ApplyLoanPage.jsx`:
    1. Facility Choice: Side-by-side comparison of Money Loan vs. Vehicle Leasing.
    2. Financing Terms: Sliders, purpose, vehicle details (category, make, model, year, value, down-payment).
    3. Guarantors: Dynamic modal form to add up to 3 guarantors with NIC, contact, and income details.
    4. Document Vault: File upload cards for mandatory KYC documents with size checks and staging.
    5. Review & Submit: Summary declaration and immediate allocation of an application reference number.
- **Borrower Portal**:
  - `MyApplicationsPage.jsx`: Searchable list of all submitted applications, facility badges, amount, EMI, and status indicators.
  - `ApplicationDetailPage.jsx`: Complete view with status stepper, facility specs, guarantor cards, document download buttons, and status history timeline.
- **Loan Officer Underwriting**:
  - `LoanPipelinePage.jsx`: Queue with pipeline metrics, status and type filters, and action buttons.
  - `ApplicationReviewPage.jsx`: Verification Desk with borrower profile, requested facility parameters, document checklist, document-level verification actions, and decision modals.
- **Routing & Menus**:
  - `AppRoutes.jsx` and `AppSidebar.jsx` updated with role-aware dispatching for `/applications`, `/applications/new`, `/applications/:id`, and `/applications/:id/verify`.

---

## 2. Verification Results

### A. Automated Unit Tests
```
[INFO] Running com.smartline.loan.service.ApplicationServiceTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.637 s
[INFO] Running com.smartline.loan.service.VerificationServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.095 s
[INFO] Results: Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### B. Frontend Production Build
```
vite v5.4.21 building for production...
✓ 2975 modules transformed.
dist/index.html                     1.23 kB │ gzip:   0.69 kB
dist/assets/index-CT_FaYVh.css     31.87 kB │ gzip:   5.85 kB
dist/assets/index-CeD9gVln.js   1,359.59 kB │ gzip: 417.85 kB
✓ built in 11.39s
```

### C. Live REST API Verification
| Operation | Method & Endpoint | Payload / Header | Status | Result |
| :--- | :--- | :--- | :--- | :--- |
| **Login** | POST `/api/auth/login` | `loanofficer` / `officer123` | `200 OK` | Returned JWT Bearer token |
| **Fetch Queue** | GET `/api/verification/queue` | `Bearer <token>` | `200 OK` | Returned `APP-2026-00001` (LOAN) & `APP-2026-00002` (VEHICLE_LEASE) |
| **Applicant Applications** | GET `/api/applications/my` | `Bearer <applicant_token>` | `200 OK` | Returned borrower's application list |
| **Submit Application** | POST `/api/applications` | Loan payload with guarantor | `201 CREATED` | Assigned `APP-2026-00003` with status `SUBMITTED` |
| **Start Verification** | POST `/api/verification/3/start` | `Bearer <token>` | `200 OK` | Transitioned to `UNDER_VERIFICATION` |
| **Complete Verification** | POST `/api/verification/3/complete` | `{ approved: true }` | `200 OK` | Transitioned to `VERIFIED` with audit log |

### D. End-to-End Browser Subagent Verification
- Verified 1-click login as Applicant (`Saman Kumara`).
- Verified opening `/applications/new` (Loan Application Wizard).
- Tested interactive loan calculator sliders: amount LKR 2,375,000 computed EMI LKR 127,656/mo in real time.
- Verified `/applications` table displaying all applications with colored badges.
- Verified opening `/applications/1` showing the multi-stage status stepper and tabs.
- Switched account to Loan Officer (`Kasun Fernando`).
- Verified Loan Pipeline queue displaying all cases.
- Opened `/applications/1/verify` to confirm borrower profile, loan specifications, and document verification controls.

---

## 3. Summary of Implemented User Stories

| Story ID | Description | Role | Status |
| :--- | :--- | :--- | :--- |
| **US01** | Applicant selects between Money Loan and Vehicle Leasing | Applicant | ✅ Complete |
| **US02** | Applicant enters personal, financial, and facility information | Applicant | ✅ Complete |
| **US03** | Applicant uploads supporting documents and adds guarantors | Applicant | ✅ Complete |
| **US04** | Loan Officer reviews submitted applications and documents | Loan Officer | ✅ Complete |
| **US05** | Loan Officer updates application verification status with remarks | Loan Officer | ✅ Complete |
