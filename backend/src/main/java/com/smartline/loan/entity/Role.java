package com.smartline.loan.entity;

public enum Role {
    APPLICANT,
    LOAN_OFFICER,
    FIELD_OFFICER,
    CREDIT_MANAGER,
    SENIOR_MANAGER,
    LEGAL_OFFICER,
    FINANCE_OFFICER,
    CREDIT_CONTROL_OFFICER,
    ADMIN;

    public String getAuthority() {
        return "ROLE_" + this.name();
    }
}
