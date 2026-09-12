import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Calculator, CheckCircle2, ChevronRight, BadgePercent, X } from 'lucide-react';

const HeroSection = () => {
  const [showInquiry, setShowInquiry] = useState(false);
  const [activeTab, setActiveTab] = useState('LOAN');
  const [quickAmount, setQuickAmount] = useState('250000');
  const [quickTenure, setQuickTenure] = useState('12');
  const navigate = useNavigate();

  const handleQuickApply = (e) => {
    e.preventDefault();
    const element = document.getElementById('calculator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-blue-50/40 via-slate-50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 transition-colors duration-200">
      {/* Background radial glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-5 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline, Description & Key Trust Badges */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Empowering Your Ambitions with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 dark:from-blue-400 dark:via-indigo-300 dark:to-sky-400 bg-clip-text text-transparent">
                Flexible Loans & Leasing
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Smart Line Investment digitizes modern micro-lending and vehicle leasing across Sri Lanka.
              Access quick capital for personal growth, enterprise expansion, or drive home your two-wheeler
              with transparent rates and zero hidden charges.
            </p>



            {/* Trust Highlights Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-left">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Digital Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">On-Site Field Inspection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Real-Time SMS Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">LKR 50K – 2.5M Limit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Dedicated Officer Support</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Quick Pre-Check Floating Card */}
          <div className="lg:col-span-5">
            {!showInquiry ? (
              <div className="relative mx-auto max-w-md rounded-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl p-8 text-center transition-all hover:border-blue-500/40">
                {/* Floating % button */}
                <button
                  type="button"
                  onClick={() => setShowInquiry(true)}
                  className="group inline-flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50/80 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-blue-500/30 hover:border-blue-500 shadow-md dark:shadow-xl shadow-slate-200/50 dark:shadow-blue-950/40 hover:shadow-blue-600/20 transition-all cursor-pointer w-full"
                  aria-label="Open Quick Facility Inquiry"
                >

                  <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Quick Facility Inquiry
                  </span>

                  <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <span>Calculate Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Quick teaser rates */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-left">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Money Loans</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">From 14.0% p.a.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Vehicle Leases</span>
                    <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">From 12.5% p.a.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative mx-auto max-w-md rounded-2xl bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-blue-500/40 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-blue-950/40 p-6 sm:p-8 animate-fadeIn">
                {/* Card Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white m-0">Quick Facility Inquiry</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 m-0">Instant rate & tenure estimation</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInquiry(false)}
                    className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-200 dark:border-blue-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Click % or close to hide"
                  >
                    <BadgePercent className="w-4 h-4" />
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Service Tab Switcher */}
                <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('LOAN')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'LOAN'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    Money Loan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('VEHICLE_LEASE')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'VEHICLE_LEASE'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    Vehicle Leasing
                  </button>
                </div>

                <form onSubmit={handleQuickApply} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      Desired Amount (LKR)
                    </label>
                    <select
                      value={quickAmount}
                      onChange={(e) => setQuickAmount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="100000">LKR 100,000</option>
                      <option value="250000">LKR 250,000</option>
                      <option value="500000">LKR 500,000</option>
                      <option value="1000000">LKR 1,000,000</option>
                      <option value="2000000">LKR 2,000,000</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      Repayment Tenure
                    </label>
                    <select
                      value={quickTenure}
                      onChange={(e) => setQuickTenure(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="6">6 Months</option>
                      <option value="12">12 Months (1 Year)</option>
                      <option value="24">24 Months (2 Years)</option>
                      <option value="36">36 Months (3 Years)</option>
                      <option value="48">48 Months (4 Years)</option>
                    </select>
                  </div>

                  {/* Estimate Preview */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                      <span>Estimated Monthly Installment:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        LKR {Math.round((Number(quickAmount) * 1.14) / Number(quickTenure)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Indicative Flat Rate:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">14.0% p.a.</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                  >
                    <Calculator className="w-4 h-4" />
                    Customize in Detailed Calculator
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <Link
                    to="/register"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1"
                  >
                    Already decided? Jump straight to online application &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
