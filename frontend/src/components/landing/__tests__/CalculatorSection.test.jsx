import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CalculatorSection from '../CalculatorSection';

describe('CalculatorSection Component', () => {
  const renderCalculator = () =>
    render(
      <BrowserRouter>
        <CalculatorSection />
      </BrowserRouter>
    );

  it('renders the calculator section header and sliders', () => {
    renderCalculator();
    expect(screen.getByText(/Estimate Your Monthly Installment/i)).toBeInTheDocument();
    expect(screen.getByText(/Money Loan/i)).toBeInTheDocument();
    expect(screen.getByText(/Vehicle Leasing/i)).toBeInTheDocument();
  });

  it('displays default monthly installment estimate for Money Loan', () => {
    renderCalculator();
    // Default: amount 300,000, 12 months, 14% p.a. -> interest: 42,000 -> total: 342,000 -> monthly: 28,500
    expect(screen.getByText(/LKR 28,500/i)).toBeInTheDocument();
  });

  it('switches to Vehicle Leasing mode and shows down-payment selector', () => {
    renderCalculator();
    const leaseBtn = screen.getByRole('button', { name: /Vehicle Leasing/i });
    fireEvent.click(leaseBtn);

    expect(screen.getByText(/Down-Payment Percentage/i)).toBeInTheDocument();
    expect(screen.getByText(/Required Down-Payment/i)).toBeInTheDocument();
  });

  it('contains call-to-action button linking to registration', () => {
    renderCalculator();
    const ctaLink = screen.getByRole('link', { name: /Apply for this Facility Now/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/register');
  });
});
