import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DistributionChart from '../DistributionChart';

describe('DistributionChart Component', () => {
  it('renders fallback when data is empty', () => {
    render(<DistributionChart title="Applications by Status" data={{}} />);
    expect(screen.getByText('Applications by Status')).toBeInTheDocument();
    expect(screen.getByText('No distribution data available')).toBeInTheDocument();
  });

  it('renders breakdown items with labels and counts when data is present', () => {
    const data = {
      SUBMITTED: 5,
      VERIFIED: 10,
      APPROVED: 15,
    };

    render(
      <DistributionChart
        title="Application Status Breakdown"
        subtitle="Current distribution across pipeline"
        data={data}
        type="bar"
      />
    );

    expect(screen.getByText('Application Status Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Current distribution across pipeline')).toBeInTheDocument();
    expect(screen.getByText('SUBMITTED')).toBeInTheDocument();
    expect(screen.getByText('VERIFIED')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('filters out zero-count categories from rendering', () => {
    const data = {
      ACTIVE: 8,
      REJECTED: 0,
    };

    render(<DistributionChart title="Loan Portfolio" data={data} />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.queryByText('REJECTED')).not.toBeInTheDocument();
  });
});
