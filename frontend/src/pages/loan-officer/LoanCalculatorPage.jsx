import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Slider,
  InputNumber,
  Button,
  Radio,
  Table,
  Tag,
  Divider,
  Tooltip,
} from 'antd';
import {
  Calculator,
  DollarSign,
  Calendar,
  Percent,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  Printer,
  FilePlus,
  Car,
  Banknote,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoanCalculatorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Facility Type: 'MONEY_LOAN' | 'VEHICLE_LEASE'
  const [facilityType, setFacilityType] = useState('MONEY_LOAN');

  // Parameters
  const [amount, setAmount] = useState(500000);
  const [tenure, setTenure] = useState(24);
  const [interestRate, setInterestRate] = useState(14.0);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'amortization'

  // Benchmark Rates
  const BENCHMARK_RATES = {
    MONEY_LOAN: 14.0,
    VEHICLE_LEASE: 12.5,
  };

  // Switch facility type and update benchmark rate
  const handleFacilityChange = (type) => {
    setFacilityType(type);
    setInterestRate(BENCHMARK_RATES[type]);
    if (type === 'VEHICLE_LEASE' && amount < 500000) {
      setAmount(1500000);
    }
  };

  // Reset to initial defaults
  const handleReset = () => {
    setFacilityType('MONEY_LOAN');
    setAmount(500000);
    setTenure(24);
    setInterestRate(14.0);
    setDownPaymentPercent(20);
    setActiveTab('summary');
  };

  // Calculations
  const calculations = useMemo(() => {
    let principal = amount;
    let downPaymentAmount = 0;

    if (facilityType === 'VEHICLE_LEASE') {
      downPaymentAmount = Math.round((amount * downPaymentPercent) / 100);
      principal = amount - downPaymentAmount;
    }

    const years = tenure / 12;
    const totalInterest = Math.round(principal * (interestRate / 100) * years);
    const totalPayable = principal + totalInterest;
    const monthlyInstallment = Math.round(totalPayable / tenure);
    const monthlyPrincipal = Math.round(principal / tenure);
    const monthlyInterest = monthlyInstallment - monthlyPrincipal;

    // Generate month-by-month amortization schedule
    const schedule = [];
    let remainingBalance = totalPayable;
    for (let month = 1; month <= tenure; month++) {
      const isLastMonth = month === tenure;
      const installmentThisMonth = isLastMonth ? remainingBalance : monthlyInstallment;
      remainingBalance = Math.max(0, remainingBalance - installmentThisMonth);

      schedule.push({
        key: month,
        month,
        installment: installmentThisMonth,
        principalPortion: monthlyPrincipal,
        interestPortion: monthlyInterest,
        balance: remainingBalance,
      });
    }

    return {
      assetValue: amount,
      downPaymentAmount,
      principal,
      totalInterest,
      totalPayable,
      monthlyInstallment,
      monthlyPrincipal,
      monthlyInterest,
      schedule,
    };
  }, [facilityType, amount, tenure, interestRate, downPaymentPercent]);

  // Currency Formatter
  const formatLkr = (val) => {
    return `LKR ${Number(val || 0).toLocaleString('en-LK')}`;
  };

  // Amortization Table Columns
  const scheduleColumns = [
    {
      title: 'Month #',
      dataIndex: 'month',
      key: 'month',
      width: 90,
      render: (m) => <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">Month {m}</span>,
    },
    {
      title: 'Installment (EMI)',
      dataIndex: 'installment',
      key: 'installment',
      render: (val) => <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{formatLkr(val)}</span>,
    },
    {
      title: 'Principal Portion',
      dataIndex: 'principalPortion',
      key: 'principalPortion',
      render: (val) => <span className="font-mono text-slate-600 dark:text-slate-300">{formatLkr(val)}</span>,
    },
    {
      title: 'Interest Portion',
      dataIndex: 'interestPortion',
      key: 'interestPortion',
      render: (val) => <span className="font-mono text-amber-600 dark:text-amber-400">{formatLkr(val)}</span>,
    },
    {
      title: 'Outstanding Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (val) => <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold">{formatLkr(val)}</span>,
    },
  ];

  const quickAmounts = facilityType === 'VEHICLE_LEASE'
    ? [1000000, 2000000, 3500000, 5000000, 8000000]
    : [250000, 500000, 1000000, 2000000, 3500000];

  const quickTenures = [12, 24, 36, 48, 60];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 dark:from-slate-900 dark:via-blue-950/60 dark:to-slate-900 border border-blue-500/30 dark:border-slate-800 p-6 sm:p-8 shadow-lg text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400 text-xs font-semibold">
                <Calculator className="w-3.5 h-3.5" />
                <span>OFFICER DECISION SUPPORT</span>
              </div>
              <Tag color="blue" className="rounded-full px-2.5 py-0.5 border-0 bg-blue-500/30 text-white font-medium text-xs">
                Smart Line Pricing Engine
              </Tag>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white m-0 flex items-center gap-2">
              Loan & Lease Installment Calculator
            </h1>
            <p className="text-sm text-blue-100 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Interactive financial simulation tool for officers. Model facility structures, assess borrower repayment capacity, and generate pre-application quotes.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={handleReset}
              className="bg-white/15 hover:bg-white/25 text-white border-white/20 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 h-10 px-4 rounded-xl"
            >
              Reset
            </Button>
            <Button
              icon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
              className="bg-white/15 hover:bg-white/25 text-white border-white/20 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 h-10 px-4 rounded-xl"
            >
              Print Quote
            </Button>
            {user?.role === 'APPLICANT' && (
              <Button
                type="primary"
                icon={<FilePlus className="w-4 h-4 text-blue-700" />}
                onClick={() => navigate('/applications/new')}
                className="bg-white hover:bg-blue-50 text-blue-700 font-semibold border-0 shadow-lg h-10 px-4 rounded-xl flex items-center gap-1.5"
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Facility Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleFacilityChange('MONEY_LOAN')}
          className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 ${
            facilityType === 'MONEY_LOAN'
              ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-3 rounded-xl flex-shrink-0 ${
            facilityType === 'MONEY_LOAN'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">Money Loan</h3>
              <Tag color="blue" className="text-xs font-semibold m-0">14.0% p.a. Standard</Tag>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-0 leading-relaxed">
              Personal, commercial, and working capital loans with fixed monthly installments and transparent interest.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleFacilityChange('VEHICLE_LEASE')}
          className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 ${
            facilityType === 'VEHICLE_LEASE'
              ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-3 rounded-xl flex-shrink-0 ${
            facilityType === 'VEHICLE_LEASE'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">Vehicle Leasing</h3>
              <Tag color="emerald" className="text-xs font-semibold m-0">12.5% p.a. Concessionary</Tag>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-0 leading-relaxed">
              Automotive leasing with customizable customer down payment, asset valuation, and flexible tenure.
            </p>
          </div>
        </button>
      </div>

      {/* Main Grid: Parameters & Calculations */}
      <Row gutter={[24, 24]}>
        {/* Left Column: Sliders & Controls */}
        <Col xs={24} lg={14} className="space-y-6">
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="space-y-6">
              {/* Parameter 1: Principal Amount or Vehicle Value */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {facilityType === 'VEHICLE_LEASE' ? 'Vehicle Market Value / Proforma Total' : 'Requested Loan Amount'}
                  </label>
                  <div className="flex items-center gap-1.5 font-mono text-base font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                    <span>LKR</span>
                    <InputNumber
                      min={50000}
                      max={15000000}
                      step={25000}
                      value={amount}
                      onChange={(val) => setAmount(val || 50000)}
                      className="w-32 text-right border-0 shadow-none font-mono font-bold text-blue-600 dark:text-blue-400 bg-transparent p-0"
                      formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                    />
                  </div>
                </div>

                <Slider
                  min={50000}
                  max={facilityType === 'VEHICLE_LEASE' ? 12000000 : 5000000}
                  step={25000}
                  value={amount}
                  onChange={(val) => setAmount(val)}
                  trackStyle={{ backgroundColor: '#2563EB', height: 6 }}
                  handleStyle={{ borderColor: '#3B82F6', backgroundColor: '#ffffff', width: 18, height: 18 }}
                  railStyle={{ backgroundColor: '#E2E8F0', height: 6 }}
                />

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
                  <span>LKR 50,000</span>
                  <span>{facilityType === 'VEHICLE_LEASE' ? 'LKR 12,000,000' : 'LKR 5,000,000'}</span>
                </div>

                {/* Quick Preset Amount Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">Presets:</span>
                  {quickAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        amount === preset
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {preset >= 1000000 ? `${preset / 1000000}M` : `${preset / 1000}K`}
                    </button>
                  ))}
                </div>
              </div>

              <Divider className="my-2 border-slate-200 dark:border-slate-800" />

              {/* Parameter 1.5: Down Payment (Vehicle Lease Only) */}
              {facilityType === 'VEHICLE_LEASE' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Percent className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Applicant Down Payment / Client Contribution
                    </label>
                    <span className="font-mono text-base font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-900/60">
                      {downPaymentPercent}% ({formatLkr(calculations.downPaymentAmount)})
                    </span>
                  </div>

                  <Slider
                    min={10}
                    max={60}
                    step={5}
                    value={downPaymentPercent}
                    onChange={(val) => setDownPaymentPercent(val)}
                    trackStyle={{ backgroundColor: '#D97706', height: 6 }}
                    handleStyle={{ borderColor: '#F59E0B', backgroundColor: '#ffffff', width: 18, height: 18 }}
                    railStyle={{ backgroundColor: '#E2E8F0', height: 6 }}
                  />

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>10% (Min Down Payment)</span>
                    <span>60% (Max Down Payment)</span>
                  </div>

                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span>Net Financed Principal:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatLkr(calculations.principal)}
                    </span>
                  </div>
                </div>
              )}

              {facilityType === 'VEHICLE_LEASE' && <Divider className="my-2 border-slate-200 dark:border-slate-800" />}

              {/* Parameter 2: Repayment Tenure */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Repayment Tenure
                  </label>
                  <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                    {tenure} Months ({Number(tenure / 12).toFixed(1)} Years)
                  </span>
                </div>

                <Slider
                  min={6}
                  max={84}
                  step={6}
                  value={tenure}
                  onChange={(val) => setTenure(val)}
                  trackStyle={{ backgroundColor: '#059669', height: 6 }}
                  handleStyle={{ borderColor: '#10B981', backgroundColor: '#ffffff', width: 18, height: 18 }}
                  railStyle={{ backgroundColor: '#E2E8F0', height: 6 }}
                />

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
                  <span>6 Months</span>
                  <span>84 Months (7 Years)</span>
                </div>

                {/* Quick Tenure Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">Presets:</span>
                  {quickTenures.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenure(m)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        tenure === m
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {m} Mo ({m / 12} Y)
                    </button>
                  ))}
                </div>
              </div>

              <Divider className="my-2 border-slate-200 dark:border-slate-800" />

              {/* Parameter 3: Annual Interest Rate */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Annual Interest Rate (Flat % p.a.)
                  </label>
                  <div className="flex items-center gap-1 font-mono text-base font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-3 py-1 rounded-lg border border-purple-200 dark:border-purple-900/60">
                    <InputNumber
                      min={6}
                      max={30}
                      step={0.25}
                      value={interestRate}
                      onChange={(val) => setInterestRate(val || 14.0)}
                      className="w-16 text-right border-0 shadow-none font-mono font-bold text-purple-600 dark:text-purple-400 bg-transparent p-0"
                    />
                    <span>%</span>
                  </div>
                </div>

                <Slider
                  min={8}
                  max={26}
                  step={0.25}
                  value={interestRate}
                  onChange={(val) => setInterestRate(val)}
                  trackStyle={{ backgroundColor: '#7C3AED', height: 6 }}
                  handleStyle={{ borderColor: '#8B5CF6', backgroundColor: '#ffffff', width: 18, height: 18 }}
                  railStyle={{ backgroundColor: '#E2E8F0', height: 6 }}
                />

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>8.0% (Concession)</span>
                  <button
                    type="button"
                    onClick={() => setInterestRate(BENCHMARK_RATES[facilityType])}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    Reset to Benchmark ({BENCHMARK_RATES[facilityType]}%)
                  </button>
                  <span>26.0% (Subprime)</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Column: Financial Results Display */}
        <Col xs={24} lg={10}>
          <div className="h-full flex flex-col gap-5">
            {/* Primary Result Card */}
            <div className="rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 dark:from-slate-900 dark:via-blue-950/80 dark:to-indigo-950/80 border border-blue-500/40 dark:border-slate-800 text-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-blue-100 dark:text-blue-300">
                    Estimated Monthly Repayment
                  </span>
                  <Tag color="cyan" className="rounded-full px-2.5 py-0.5 border-0 font-medium text-xs">
                    {tenure} Installments
                  </Tag>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                    {formatLkr(calculations.monthlyInstallment)}
                  </span>
                  <span className="text-xs text-blue-200 dark:text-slate-400 font-medium">/ month</span>
                </div>

                <p className="text-xs text-blue-100 dark:text-slate-400 mt-2 leading-relaxed">
                  Fixed monthly installment based on {interestRate}% flat interest over {tenure} months.
                </p>
              </div>

              {/* Detailed Breakdown List */}
              <div className="my-6 pt-5 border-t border-white/20 dark:border-slate-800/80 space-y-3 text-xs">
                {facilityType === 'VEHICLE_LEASE' && (
                  <div className="flex justify-between text-blue-100 dark:text-slate-300">
                    <span className="text-blue-200 dark:text-slate-400">Total Vehicle Value:</span>
                    <span className="font-mono font-medium text-white">{formatLkr(calculations.assetValue)}</span>
                  </div>
                )}
                {facilityType === 'VEHICLE_LEASE' && (
                  <div className="flex justify-between text-amber-200 dark:text-amber-300">
                    <span className="text-amber-200/80 dark:text-amber-400/80">Down Payment ({downPaymentPercent}%):</span>
                    <span className="font-mono font-medium">{formatLkr(calculations.downPaymentAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-blue-100 dark:text-slate-300">
                  <span className="text-blue-200 dark:text-slate-400">Net Financed Principal:</span>
                  <span className="font-mono font-semibold text-white">{formatLkr(calculations.principal)}</span>
                </div>
                <div className="flex justify-between text-blue-100 dark:text-slate-300">
                  <span className="text-blue-200 dark:text-slate-400">Total Interest Charge:</span>
                  <span className="font-mono font-semibold text-amber-300 dark:text-amber-400">
                    {formatLkr(calculations.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-3 border-t border-white/20 dark:border-slate-800/80">
                  <span>Total Repayable:</span>
                  <span className="font-mono text-emerald-300 dark:text-emerald-400 text-base">
                    {formatLkr(calculations.totalPayable)}
                  </span>
                </div>
              </div>

              {/* Transparency Notice */}
              <div className="flex items-start gap-2 text-[11px] text-blue-100 dark:text-slate-300 bg-white/10 dark:bg-slate-900/60 p-3 rounded-xl border border-white/15 dark:border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-300 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Transparent flat-rate calculation. Actual terms and sanction limits are subject to underwriting verification, CRIB scoring, and facility approval.
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Tabs & Amortization Schedule Section */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
              Installment Schedule & Amortization Table
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-0.5">
              Detailed month-by-month repayment breakdown for {tenure} months
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Radio.Group
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              buttonStyle="solid"
              size="middle"
            >
              <Radio.Button value="summary">First 12 Months</Radio.Button>
              <Radio.Button value="amortization">Full Schedule ({tenure}M)</Radio.Button>
            </Radio.Group>
          </div>
        </div>

        <Table
          dataSource={activeTab === 'summary' ? calculations.schedule.slice(0, 12) : calculations.schedule}
          columns={scheduleColumns}
          pagination={activeTab === 'amortization' && calculations.schedule.length > 12 ? { pageSize: 12 } : false}
          size="middle"
          rowClassName="dark:hover:bg-slate-800/50"
          className="dark-table-fix"
        />

        {activeTab === 'summary' && calculations.schedule.length > 12 && (
          <div className="mt-4 text-center">
            <Button
              type="link"
              onClick={() => setActiveTab('amortization')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400"
            >
              Show all {tenure} months in full schedule →
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LoanCalculatorPage;
