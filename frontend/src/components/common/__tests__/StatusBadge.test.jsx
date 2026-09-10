import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';

describe('StatusBadge Component', () => {
  it('renders correctly for SUBMITTED status', () => {
    render(<StatusBadge status="SUBMITTED" />);
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });

  it('renders correctly for APPROVED status', () => {
    render(<StatusBadge status="APPROVED" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders correctly for DISBURSED status', () => {
    render(<StatusBadge status="DISBURSED" />);
    expect(screen.getByText('Disbursed')).toBeInTheDocument();
  });

  it('handles lowercase status input gracefully', () => {
    render(<StatusBadge status="rejected" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('falls back to default Pending when status is null or undefined', () => {
    render(<StatusBadge status={null} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('displays the raw status for unrecognized status codes', () => {
    render(<StatusBadge status="CUSTOM_NEW_STATUS" />);
    expect(screen.getByText('CUSTOM_NEW_STATUS')).toBeInTheDocument();
  });
});
