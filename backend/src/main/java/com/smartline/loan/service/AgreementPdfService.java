package com.smartline.loan.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.smartline.loan.entity.*;
import com.smartline.loan.entity.enums.ApplicationType;
import com.smartline.loan.exception.ResourceNotFoundException;
import com.smartline.loan.repository.AgreementRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class AgreementPdfService {

    private final AgreementRepository agreementRepository;

    private static final DeviceRgb NAVY_PRIMARY = new DeviceRgb(15, 23, 42); // slate-900
    private static final DeviceRgb BLUE_ACCENT = new DeviceRgb(37, 99, 235); // blue-600
    private static final DeviceRgb GRAY_BG = new DeviceRgb(241, 245, 249); // slate-100
    private static final DeviceRgb BORDER_COLOR = new DeviceRgb(203, 213, 225); // slate-300
    private static final DeviceRgb TEXT_DARK = new DeviceRgb(30, 41, 59); // slate-800
    private static final DeviceRgb TEXT_MUTED = new DeviceRgb(100, 116, 139); // slate-500

    public AgreementPdfService(AgreementRepository agreementRepository) {
        this.agreementRepository = agreementRepository;
    }

    public byte[] generateAgreementPdf(Long agreementId) {
        Agreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement", "id", agreementId));

        Application application = agreement.getApplication();
        Applicant applicant = application.getApplicant();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdfDoc = new PdfDocument(writer);
        pdfDoc.setDefaultPageSize(PageSize.A4);
        Document document = new Document(pdfDoc);
        document.setMargins(36, 40, 36, 40);

        NumberFormat currencyFormat = NumberFormat.getNumberInstance(Locale.US);
        currencyFormat.setMinimumFractionDigits(2);
        currencyFormat.setMaximumFractionDigits(2);
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

        // Header Table (Branding & Document Title)
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{65, 35}));
        headerTable.setWidth(UnitValue.createPercentValue(100));

        Cell brandCell = new Cell().setBorder(Border.NO_BORDER);
        brandCell.add(new Paragraph("SMART LINE INVESTMENT (PVT) LTD")
                .setFontSize(16)
                .setBold()
                .setFontColor(NAVY_PRIMARY));
        brandCell.add(new Paragraph("Reg No: PV-982412 | Microfinance & Vehicle Leasing Division\nNo. 45/A, Galle Road, Colombo 03, Sri Lanka | support@smartline.lk")
                .setFontSize(8)
                .setFontColor(TEXT_MUTED));
        headerTable.addCell(brandCell);

        Cell docMetaCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        docMetaCell.add(new Paragraph("FINANCING AGREEMENT")
                .setFontSize(12)
                .setBold()
                .setFontColor(BLUE_ACCENT));
        docMetaCell.add(new Paragraph("Agreement #: " + agreement.getAgreementNumber() + "\n" +
                "Application #: " + application.getApplicationNumber() + "\n" +
                "Date: " + (agreement.getPreparedDate() != null ? agreement.getPreparedDate().format(dtf) : "N/A"))
                .setFontSize(8)
                .setFontColor(TEXT_MUTED));
        headerTable.addCell(docMetaCell);

        document.add(headerTable);

        // Divider
        document.add(new Paragraph("\n").setFontSize(3));
        Table divider = new Table(UnitValue.createPercentArray(new float[]{100}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBorderTop(new SolidBorder(BLUE_ACCENT, 2));
        document.add(divider);
        document.add(new Paragraph("\n").setFontSize(4));

        // Preamble
        Paragraph preamble = new Paragraph("THIS FINANCING AGREEMENT is entered into between Smart Line Investment (Pvt) Ltd (the 'Lender/Lessor') and the Customer (the 'Borrower/Lessee') named herein, subject to the covenants, schedules, and terms set forth below.")
                .setFontSize(8.5f)
                .setFontColor(TEXT_DARK)
                .setItalic();
        document.add(preamble);
        document.add(new Paragraph("\n").setFontSize(4));

        // Section 1: Customer Details
        document.add(createSectionHeader("1. BORROWER / CUSTOMER PARTICULARS"));
        Table customerTable = new Table(UnitValue.createPercentArray(new float[]{25, 25, 25, 25}));
        customerTable.setWidth(UnitValue.createPercentValue(100));
        customerTable.setBorder(new SolidBorder(BORDER_COLOR, 0.5f));

        addKeyValueCell(customerTable, "Full Name", applicant != null ? applicant.getFullName() : "N/A");
        addKeyValueCell(customerTable, "National ID (NIC)", applicant != null ? applicant.getNic() : "N/A");
        addKeyValueCell(customerTable, "Contact Phone", applicant != null ? applicant.getPhone() : "N/A");
        addKeyValueCell(customerTable, "City / Region", applicant != null ? applicant.getCity() : "N/A");
        addFullSpanCell(customerTable, "Residential Address", applicant != null ? applicant.getAddress() : "N/A", 4);
        addKeyValueCell(customerTable, "Employment Type", applicant != null ? String.valueOf(applicant.getEmploymentType()) : "N/A");
        addKeyValueCell(customerTable, "Employer / Business", applicant != null ? applicant.getEmployerName() : "N/A");
        addKeyValueCell(customerTable, "Monthly Income (LKR)", applicant != null && applicant.getMonthlyIncome() != null ? "LKR " + currencyFormat.format(applicant.getMonthlyIncome()) : "N/A");
        addKeyValueCell(customerTable, "Occupation", applicant != null ? applicant.getOccupation() : "N/A");

        document.add(customerTable);
        document.add(new Paragraph("\n").setFontSize(4));

        // Section 2: Financial Terms
        document.add(createSectionHeader("2. APPROVED FACILITY & REPAYMENT TERMS"));
        Table termsTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}));
        termsTable.setWidth(UnitValue.createPercentValue(100));
        termsTable.setBorder(new SolidBorder(BORDER_COLOR, 0.5f));

        addTermRow(termsTable, "Facility Type", agreement.getFacilityType() == ApplicationType.VEHICLE_LEASE ? "Vehicle Lease Facility" : "Money Loan Facility");
        addTermRow(termsTable, "Principal Financing Amount", "LKR " + currencyFormat.format(agreement.getPrincipalAmount()));
        addTermRow(termsTable, "Agreed Annual Flat Interest Rate", agreement.getInterestRate() + "% p.a.");
        addTermRow(termsTable, "Repayment Tenor", agreement.getTenureMonths() + " Months (" + (agreement.getTenureMonths() / 12.0) + " Years)");
        addTermRow(termsTable, "Monthly Installment (EMI)", "LKR " + currencyFormat.format(agreement.getInstallmentAmount()));
        addTermRow(termsTable, "Total Amount Repayable", "LKR " + currencyFormat.format(agreement.getTotalPayable()));
        BigDecimal downPayment = agreement.getDownPaymentRequired() != null ? agreement.getDownPaymentRequired() : BigDecimal.ZERO;
        addTermRow(termsTable, "Upfront Down-Payment Required", downPayment.compareTo(BigDecimal.ZERO) > 0 ? "LKR " + currencyFormat.format(downPayment) : "LKR 0.00 (Waived / None)");
        addTermRow(termsTable, "Agreement Execution Status", String.valueOf(agreement.getStatus()));

        document.add(termsTable);
        document.add(new Paragraph("\n").setFontSize(4));

        // Section 3: Vehicle Particulars (if lease)
        if (application.getType() == ApplicationType.VEHICLE_LEASE && application.getVehicleLeaseDetail() != null) {
            VehicleLeaseDetail vld = application.getVehicleLeaseDetail();
            document.add(createSectionHeader("3. LEASED ASSET / VEHICLE SPECIFICATIONS"));
            Table vehicleTable = new Table(UnitValue.createPercentArray(new float[]{25, 25, 25, 25}));
            vehicleTable.setWidth(UnitValue.createPercentValue(100));
            vehicleTable.setBorder(new SolidBorder(BORDER_COLOR, 0.5f));

            addKeyValueCell(vehicleTable, "Category", String.valueOf(vld.getVehicleCategory()));
            addKeyValueCell(vehicleTable, "Make & Model", vld.getMake() + " " + vld.getModel());
            addKeyValueCell(vehicleTable, "Manufacture Year", String.valueOf(vld.getYear()));
            addKeyValueCell(vehicleTable, "Condition", String.valueOf(vld.getVehicleCondition()));
            addKeyValueCell(vehicleTable, "Registration No.", vld.getRegistrationNumber() != null ? vld.getRegistrationNumber() : "UNREGISTERED");
            addKeyValueCell(vehicleTable, "Chassis / VIN", vld.getChassisNumber() != null ? vld.getChassisNumber() : "N/A");
            addKeyValueCell(vehicleTable, "Engine Number", vld.getEngineNumber() != null ? vld.getEngineNumber() : "N/A");
            addKeyValueCell(vehicleTable, "Estimated Value", vld.getMarketValue() != null ? "LKR " + currencyFormat.format(vld.getMarketValue()) : "N/A");

            document.add(vehicleTable);
            document.add(new Paragraph("\n").setFontSize(4));
        }

        // Section 4: Guarantor(s)
        if (!application.getGuarantors().isEmpty()) {
            document.add(createSectionHeader("4. GUARANTOR(S) UNDERTAKING"));
            Table guarantorTable = new Table(UnitValue.createPercentArray(new float[]{30, 20, 25, 25}));
            guarantorTable.setWidth(UnitValue.createPercentValue(100));
            guarantorTable.setBorder(new SolidBorder(BORDER_COLOR, 0.5f));

            guarantorTable.addHeaderCell(createTableHeaderCell("Guarantor Name"));
            guarantorTable.addHeaderCell(createTableHeaderCell("NIC"));
            guarantorTable.addHeaderCell(createTableHeaderCell("Relationship"));
            guarantorTable.addHeaderCell(createTableHeaderCell("Monthly Income"));

            for (Guarantor g : application.getGuarantors()) {
                guarantorTable.addCell(createTableCell(g.getFullName()));
                guarantorTable.addCell(createTableCell(g.getNic()));
                guarantorTable.addCell(createTableCell(g.getRelationship() != null ? g.getRelationship() : "N/A"));
                guarantorTable.addCell(createTableCell(g.getMonthlyIncome() != null ? "LKR " + currencyFormat.format(g.getMonthlyIncome()) : "N/A"));
            }
            document.add(guarantorTable);
            document.add(new Paragraph("\n").setFontSize(4));
        }

        // Section 5: Terms and Special Conditions
        document.add(createSectionHeader("5. STANDARD COVENANTS & SPECIAL CONDITIONS"));
        String termsText = agreement.getTermsAndConditions() != null && !agreement.getTermsAndConditions().isBlank() ?
                agreement.getTermsAndConditions() :
                "1. The Borrower agrees to pay each monthly installment on or before the due date specified in the disbursement schedule.\n" +
                "2. Default in payment exceeding 30 calendar days shall empower Smart Line Investment (Pvt) Ltd to initiate recovery follow-ups, seize collateral, or pursue legal remedies under applicable Sri Lankan microfinance and leasing laws.\n" +
                "3. Early facility settlement may be permitted subject to prepayment administrative terms.\n" +
                "4. All notices and legal declarations shall be delivered to the primary contact address provided by the Borrower.";

        Paragraph termsP = new Paragraph(termsText)
                .setFontSize(8)
                .setFontColor(TEXT_DARK)
                .setMultipliedLeading(1.2f);
        document.add(termsP);

        if (agreement.getSpecialConditions() != null && !agreement.getSpecialConditions().isBlank()) {
            document.add(new Paragraph("\nSpecial Conditions / Covenants:").setFontSize(8.5f).setBold().setFontColor(NAVY_PRIMARY));
            document.add(new Paragraph(agreement.getSpecialConditions()).setFontSize(8).setFontColor(TEXT_DARK));
        }

        document.add(new Paragraph("\n").setFontSize(8));

        // Section 6: Signatures
        Table signatureTable = new Table(UnitValue.createPercentArray(new float[]{33, 33, 34}));
        signatureTable.setWidth(UnitValue.createPercentValue(100));

        Cell borrowerSig = new Cell().setBorder(Border.NO_BORDER).add(
                new Paragraph("___________________________\nBorrower / Lessee Signature\n\nName: " + (applicant != null ? applicant.getFullName() : "") + "\nDate: _______________")
                        .setFontSize(8)
                        .setFontColor(TEXT_DARK)
        );
        Cell legalSig = new Cell().setBorder(Border.NO_BORDER).add(
                new Paragraph("___________________________\nPrepared by Legal Officer\n\nName: " + (agreement.getPreparedBy() != null ? agreement.getPreparedBy().getFullName() : "Legal Dept") + "\nSeal: VERIFIED & SEALED")
                        .setFontSize(8)
                        .setFontColor(TEXT_DARK)
        );
        Cell companySig = new Cell().setBorder(Border.NO_BORDER).add(
                new Paragraph("___________________________\nAuthorized Signatory\n\nSmart Line Investment (Pvt) Ltd\nOfficial Corporate Seal")
                        .setFontSize(8)
                        .setFontColor(TEXT_DARK)
        );

        signatureTable.addCell(borrowerSig);
        signatureTable.addCell(legalSig);
        signatureTable.addCell(companySig);
        document.add(signatureTable);

        document.close();
        return out.toByteArray();
    }

    private Paragraph createSectionHeader(String title) {
        return new Paragraph(title)
                .setFontSize(9.5f)
                .setBold()
                .setFontColor(NAVY_PRIMARY)
                .setBackgroundColor(GRAY_BG)
                .setPadding(3)
                .setMarginBottom(3);
    }

    private void addKeyValueCell(Table table, String key, String value) {
        Cell cell = new Cell().setBorder(new SolidBorder(BORDER_COLOR, 0.5f)).setPadding(3);
        cell.add(new Paragraph(key).setFontSize(7).setFontColor(TEXT_MUTED).setBold());
        cell.add(new Paragraph(value != null ? value : "-").setFontSize(8).setFontColor(TEXT_DARK));
        table.addCell(cell);
    }

    private void addFullSpanCell(Table table, String key, String value, int span) {
        Cell cell = new Cell(1, span).setBorder(new SolidBorder(BORDER_COLOR, 0.5f)).setPadding(3);
        cell.add(new Paragraph(key).setFontSize(7).setFontColor(TEXT_MUTED).setBold());
        cell.add(new Paragraph(value != null ? value : "-").setFontSize(8).setFontColor(TEXT_DARK));
        table.addCell(cell);
    }

    private void addTermRow(Table table, String term, String detail) {
        Cell termCell = new Cell().setBorder(new SolidBorder(BORDER_COLOR, 0.5f)).setPadding(3.5f);
        termCell.add(new Paragraph(term).setFontSize(8).setFontColor(TEXT_MUTED).setBold());

        Cell detailCell = new Cell().setBorder(new SolidBorder(BORDER_COLOR, 0.5f)).setPadding(3.5f);
        detailCell.add(new Paragraph(detail).setFontSize(8.5f).setFontColor(TEXT_DARK).setBold());

        table.addCell(termCell);
        table.addCell(detailCell);
    }

    private Cell createTableHeaderCell(String text) {
        return new Cell()
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f))
                .setBackgroundColor(GRAY_BG)
                .setPadding(3)
                .add(new Paragraph(text).setFontSize(7.5f).setBold().setFontColor(NAVY_PRIMARY));
    }

    private Cell createTableCell(String text) {
        return new Cell()
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f))
                .setPadding(3)
                .add(new Paragraph(text != null ? text : "-").setFontSize(8).setFontColor(TEXT_DARK));
    }
}
