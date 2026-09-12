import React from 'react';
import { ShieldCheck, Zap, Users, Award, CheckCircle2, FileSpreadsheet, Headset, Eye } from 'lucide-react';

const STATS = [
  { value: 'LKR 500M+', label: 'Total Facilities Disbursed', subtitle: 'Capitalizing personal & business goals' },
  { value: '98.5%', label: 'Customer Satisfaction', subtitle: 'Verified borrower feedback' },
  { value: '24–48 Hrs', label: 'Average Disbursal Speed', subtitle: 'From digital intake to bank transfer' },
  { value: '5,000+', label: 'Active Borrowers & Leases', subtitle: 'Across Western & Southern Provinces' },
];

const ADVANTAGES = [
  {
    title: 'Zero Hidden Charges or Surprise Fees',
    description:
      'We operate with total transparency. All interest rates, document fees, and down-payments are locked and detailed in your certified agreement before signing.',
    icon: Eye,
  },
  {
    title: 'Rapid Doorstep Vehicle Inspections',
    description:
      'Applying for vehicle leasing? Our certified Field Officers visit your location within 24 hours to conduct rapid vehicle valuation and condition assessment.',
    icon: Zap,
  },
  {
    title: 'Digital Real-Time Workflow Tracking',
    description:
      'Never wonder what is happening with your file. Log into your borrower portal 24/7 to track live status from KYC review to final disbursal.',
    icon: FileSpreadsheet,
  },
  {
    title: 'Dedicated Microfinance Officers',
    description:
      'Our team is by your side throughout the loan lifecycle. We offer flexible payment methods and responsive customer service for any questions.',
    icon: Headset,
  },
];

const WhyChooseUsSection = () => {
  return (
    <section id="why-us" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/60 relative overflow-hidden transition-colors duration-200">
      {/* Background glow accent */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Top Metric Counter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-20">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-blue-600 dark:text-blue-400">
                {stat.value}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2">{stat.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Two Column Content & Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Vision */}
          <div className="lg:col-span-5 space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Why Partner With Us
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              A Financial Partner That Understands Your Reality
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Traditional banking can be slow, rigid, and intimidating. At Smart Line Investment, we combine modern technology with empathetic micro-lending to deliver loans and vehicle leases that empower your everyday life.
            </p>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0">Ethical & Regulated Practices</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Standardized contracts and transparent interest policies</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0">Multi-Guarantor Inclusivity</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Flexible eligibility checks for freelancers and self-employed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Key Advantages */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ADVANTAGES.map((adv, idx) => {
              const Icon = adv.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/40 transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-md group"
                >
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {adv.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {adv.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
