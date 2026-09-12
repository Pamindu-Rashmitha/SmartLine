import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, Check, Percent, Clock, Banknote, RefreshCw } from 'lucide-react';

const CalculatorSection = () => {
  const [facilityType, setFacilityType] = useState('LOAN'); // 'LOAN' | 'VEHICLE_LEASE'
  const [amount, setAmount] = useState(300000);
  const [tenureMonths, setTenureMonths] = useState(12);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);

  // Constants
  const ANNUAL_RATE = facilityType === 'LOAN' ? 14.0 : 12.5; // Flat rate % p.a.

  // Calculation logic
  const calculations = useMemo(() => {
    let principal = amount;
    let downPaymentAmount = 0;

    if (facilityType === 'VEHICLE_LEASE') {
      downPaymentAmount = Math.round((amount * downPaymentPercent) / 100);
      principal = amount - downPaymentAmount;
    }

    const years = tenureMonths / 12;
    const totalInterest = Math.round(principal * (ANNUAL_RATE / 100) * years);
    const totalPayable = principal + totalInterest;
    const monthlyInstallment = Math.round(totalPayable / tenureMonths);

    return {
      principal,
      downPaymentAmount,
      totalInterest,
      totalPayable,
      monthlyInstallment,
    };
  }, [facilityType, amount, tenureMonths, downPaymentPercent, ANNUAL_RATE]);

  return (
    <section id="calculator" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800/80 relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Financial Tool</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Estimate Your Monthly Installment
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            Plan your repayment effortlessly with zero surprises. Adjust the amount and duration sliders below to find a comfortable plan tailored to your monthly budget.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Sliders & Controls */}
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-8">
            {/* Facility Switcher */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Select Facility Type
              </label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFacilityType('LOAN')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    facilityType === 'LOAN'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  Money Loan (14% p.a.)
                </button>
                <button
                  type="button"
                  onClick={() => setFacilityType('VEHICLE_LEASE')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    facilityType === 'VEHICLE_LEASE'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  Vehicle Leasing (12.5% p.a.)
                </button>
              </div>
            </div>

            {/* Slider 1: Facility Amount */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-300">
                  {facilityType === 'LOAN' ? 'Required Loan Amount' : 'Vehicle Total Value'}
                </label>
                <div className="px-4 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono font-bold text-base">
                  LKR {amount.toLocaleString()}
                </div>
              </div>

              <input
                type="range"
                min={50000}
                max={2500000}
                step={10000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 font-mono">
                <span>LKR 50,000</span>
                <span>LKR 1,250,000</span>
                <span>LKR 2,500,000</span>
              </div>
            </div>

            {/* Down Payment Slider (Only for Vehicle Lease) */}
            {facilityType === 'VEHICLE_LEASE' && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-300">
                    Down-Payment Percentage
                  </label>
                  <div className="px-3.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-600 dark:text-teal-400 font-mono font-bold text-sm">
                    {downPaymentPercent}% (LKR {calculations.downPaymentAmount.toLocaleString()})
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 40].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDownPaymentPercent(pct)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        downPaymentPercent === pct
                          ? 'bg-teal-600 text-white border-teal-500'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Slider 2: Tenure Months */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-300">
                  Repayment Duration
                </label>
                <div className="px-4 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-base">
                  {tenureMonths} Months ({Math.round((tenureMonths / 12) * 10) / 10} Yrs)
                </div>
              </div>

              <input
                type="range"
                min={3}
                max={60}
                step={1}
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />

              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 font-mono">
                <span>3 Months</span>
                <span>24 Months</span>
                <span>60 Months</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-500">Popular tenures:</span>
              {[6, 12, 24, 36, 48].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTenureMonths(m)}
                  className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    tenureMonths === m
                      ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Dynamic Breakdown & Call to Action */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-10 border-t lg:border-t-0 lg:border-l border-slate-800/80 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                Estimated Repayment Summary
              </span>
              <h3 className="text-xl font-bold text-white mb-6">
                Monthly Breakdown
              </h3>

              {/* Huge Monthly Installment Highlight */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 shadow-inner mb-6 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Monthly Installment (EMI)
                </span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                  LKR {calculations.monthlyInstallment.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Fixed for {tenureMonths} equal monthly installments
                </span>
              </div>

              {/* Breakdown List */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Financed Principal</span>
                  <span className="font-mono font-semibold text-white">
                    LKR {calculations.principal.toLocaleString()}
                  </span>
                </div>

                {facilityType === 'VEHICLE_LEASE' && (
                  <div className="flex justify-between py-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Required Down-Payment</span>
                    <span className="font-mono font-semibold text-teal-400">
                      LKR {calculations.downPaymentAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Interest Rate</span>
                  <span className="font-mono font-semibold text-blue-400">
                    {ANNUAL_RATE}% p.a. (Flat Rate)
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Total Interest Payable</span>
                  <span className="font-mono font-semibold text-slate-300">
                    LKR {calculations.totalInterest.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2 text-base font-bold">
                  <span className="text-white">Total Amount Payable</span>
                  <span className="font-mono text-emerald-400">
                    LKR {calculations.totalPayable.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Apply Action */}
            <div className="pt-8">
              <Link
                to="/register"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 transition-all"
              >
                Apply for this Facility Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[11px] text-slate-500 text-center mt-3 mb-0">
                *Final rates and down-payment subject to KYC verification and credit appraisal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
