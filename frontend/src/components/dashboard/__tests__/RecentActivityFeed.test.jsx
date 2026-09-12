import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecentActivityFeed from '../RecentActivityFeed';

describe('RecentActivityFeed Component', () => {
  it('renders fallback when logs are empty', () => {
    render(<RecentActivityFeed logs={[]} />);
    expect(screen.getByText('Recent System Activity')).toBeInTheDocument();
    expect(screen.getByText('No recent activity logged yet')).toBeInTheDocument();
  });

  it('renders paginated logs with default pageSize of 2', () => {
    const mockLogs = [
      { id: 1, fromStatus: 'SUBMITTED', toStatus: 'VERIFIED', changedByName: 'Loan Officer Kasun', changedByRole: 'LOAN_OFFICER', remarks: 'KYC verified' },
      { id: 2, fromStatus: 'VERIFIED', toStatus: 'INSPECTION_PENDING', changedByName: 'Field Officer Ruwan', changedByRole: 'FIELD_OFFICER', remarks: 'Valuation required' },
      { id: 3, fromStatus: 'INSPECTION_PENDING', toStatus: 'UNDER_ASSESSMENT', changedByName: 'Credit Mgr Nimali', changedByRole: 'CREDIT_MANAGER', remarks: 'CRIB scoring' },
      { id: 4, fromStatus: 'UNDER_ASSESSMENT', toStatus: 'APPROVED', changedByName: 'Senior Mgr Samantha', changedByRole: 'SENIOR_MANAGER', remarks: 'Sanction approved' },
    ];

    render(<RecentActivityFeed logs={mockLogs} />);

    // First page items should be rendered (2 items)
    expect(screen.getByText('Loan Officer Kasun')).toBeInTheDocument();
    expect(screen.getByText('Field Officer Ruwan')).toBeInTheDocument();

    // 3rd & 4th items on later pages should not be on first page
    expect(screen.queryByText('Credit Mgr Nimali')).not.toBeInTheDocument();
    expect(screen.queryByText('Senior Mgr Samantha')).not.toBeInTheDocument();

    // Pagination summary
    expect(screen.getByText('1–2 of 4')).toBeInTheDocument();
  });
});
