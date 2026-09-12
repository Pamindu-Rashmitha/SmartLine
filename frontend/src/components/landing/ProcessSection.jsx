import React from 'react';
import { UserCheck, FileCheck, Banknote, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    step: '01',
    title: 'Apply & Upload Documents',
    icon: UserCheck,
    subtitle: 'Takes less than 5 minutes',
    description:
      'Create your free borrower account online. Select Money Loan or Vehicle Leasing, input your requirements, and upload digital copies of your NIC, income verification, and guarantor info.',
    badge: '100% Digital Submission',
  },
  {
    step: '02',
    title: 'Verification & Assessment',
    icon: FileCheck,
    subtitle: 'Transparent underwriting review',
    description:
      'Our Loan Officers verify documents within hours. For vehicle leasing, our Field Officers conduct a rapid doorstep inspection. Credit assessment confirms your custom interest terms.',
    badge: 'Fast 24-48h Assessment',
  },
  {
    step: '03',
    title: 'Agreement & Instant Disbursal',
    icon: Banknote,
    subtitle: 'Funds released to your account',
    description:
      'Review your formal agreement online with instant PDF download. Settle any agreed down-payment, and our Finance Officer activates the facility and transfers funds immediately.',
    badge: 'Instant Facility Activation',
  },
];

const ProcessSection = () => {
  return (
    <section id="process" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/60 relative overflow-hidden transition-colors duration-200">
      {/* Background glow accent */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
            Simple, Transparent & Fast
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How Smart Line Works in 3 Quick Steps
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            Eliminating cumbersome paperwork, physical queues, and months of waiting. Experience an agile, digitized lending experience from intake to disbursal.
          </p>
        </div>

        {/* 3 Step Process Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-16 right-16 h-0.5 bg-gradient-to-r from-blue-300 via-indigo-300 to-teal-300 dark:from-blue-600/40 dark:via-indigo-600/40 dark:to-teal-600/40 -translate-y-12 pointer-events-none" />

          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-8 flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm hover:shadow-lg dark:hover:shadow-blue-900/10 group"
              >
                <div>
                  {/* Step number badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-4xl font-black text-slate-200 dark:text-slate-700/60 group-hover:text-blue-500/30 transition-colors font-mono">
                      {item.step}
                    </span>
                  </div>

                  <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-3 border border-slate-200 dark:border-slate-700/60">
                    {item.badge}
                  </span>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-blue-600 dark:text-blue-400/90 font-medium mb-3">
                    {item.subtitle}
                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secure & Encrypted
                  </span>
                  <span className="font-semibold text-slate-400 dark:text-slate-500">Step {idx + 1} of 3</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Process Footer CTA */}
        <div className="mt-14 text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-all"
          >
            Start Your Application Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
