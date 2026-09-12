import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '../StatCard';
import { DollarSign } from 'lucide-react';

describe('StatCard Component', () => {
  it('renders title and value properly', () => {
    render(
      <StatCard
        title="Total Disbursed"
        value="LKR 4,500,000"
        color="emerald"
      />
    );

    expect(screen.getByText('Total Disbursed')).toBeInTheDocument();
    expect(screen.getByText('LKR 4,500,000')).toBeInTheDocument();
  });

  it('renders upward trend indicator and text', () => {
    render(
      <StatCard
        title="Active Facilities"
        value="42"
        trend="+12.5% vs last month"
        trendType="up"
        color="blue"
      />
    );

    expect(screen.getByText('+12.5% vs last month')).toBeInTheDocument();
    expect(screen.getByText('+12.5% vs last month')).toHaveClass('text-emerald-600');
  });

  it('renders downward trend indicator correctly', () => {
    render(
      <StatCard
        title="Default Rate"
        value="2.1%"
        trend="-0.8% reduction"
        trendType="down"
        color="amber"
      />
    );

    expect(screen.getByText('-0.8% reduction')).toBeInTheDocument();
    expect(screen.getByText('-0.8% reduction')).toHaveClass('text-rose-600');
  });

  it('renders subtitle text when provided', () => {
    render(
      <StatCard
        title="Pending Verifications"
        value="7"
        subtitle="3 requiring immediate review"
        color="purple"
      />
    );

    expect(screen.getByText('3 requiring immediate review')).toBeInTheDocument();
  });

  it('renders Lucide icon when passed as component', () => {
    const { container } = render(
      <StatCard
        title="Revenue"
        value="LKR 1,200,000"
        icon={DollarSign}
        color="indigo"
      />
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
