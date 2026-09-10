import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Lock, PhoneCall } from 'lucide-react';

const CtaSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-slate-950 relative overflow-hidden">
      {/* Background glow and patterns */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-indigo-900/30 to-blue-900/20 pointer-events-none" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-3/4 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-slate-850 border border-blue-500/30 p-8 sm:p-14 lg:p-16 text-center shadow-2xl shadow-blue-950/50 relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
            Ready to Take the Next Step Toward Your Financial Freedom?
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mt-5 leading-relaxed">
            Apply online today for flexible Money Loans or reliable Vehicle Leasing. Experience swift decisions, friendly service, and zero hidden costs.
          </p>

          {/* Action Button Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all group"
            >
              Apply for Loan or Lease
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-700 font-semibold text-base transition-all"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              Existing Client Portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
