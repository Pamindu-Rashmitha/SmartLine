import React from 'react';
import { Link } from 'react-router-dom';
import { Banknote, Bike, Building2, ShieldAlert, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

const SERVICES = [
  {
    id: 'money-loan',
    title: 'Money Loan (Personal & SME)',
    category: 'CASH ADVANCE & CAPITAL',
    icon: Banknote,
    accentColor: 'from-blue-600 to-indigo-600',
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    description:
      'Fast, structured personal and small enterprise financing designed to meet urgent cash-flow needs, medical expenses, or inventory acquisition.',
    features: [
      'Borrow from LKR 50,000 up to LKR 1,500,000',
      'Flexible tenures from 3 to 60 months',
      'Simple KYC with minimal documentation',
      'Fixed monthly installments with flat-rate interest',
      'Direct disbursal upon legal deed verification',
    ],
    popular: true,
  },
  {
    id: 'vehicle-lease',
    title: 'Vehicle Leasing (Bikes & Autos)',
    category: 'ASSET FINANCING',
    icon: Bike,
    accentColor: 'from-sky-500 to-teal-500',
    iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    description:
      'Drive your two-wheeler, three-wheeler, or personal car without financial strain. Quick on-site field inspections and tailored down-payments.',
    features: [
      'Motorcycles, 3-wheelers, and commercial vehicles',
      'Doorstep vehicle inspection & condition evaluation',
      'Customizable down-payment options (10%–40%)',
      'Rapid facility activation post legal review',
      'Transparent repayment schedule generated instantly',
    ],
    popular: false,
  },
  {
    id: 'sme-business',
    title: 'Business Working Capital',
    category: 'GROWTH FINANCING',
    icon: Building2,
    accentColor: 'from-purple-600 to-pink-600',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    description:
      'Dedicated financing lines for registered local sole proprietors and small businesses seeking seasonal trade support or stock expansion.',
    features: [
      'Higher authorization thresholds up to LKR 2.5M',
      'Executive Senior Manager fast-track approval',
      'Multi-guarantor support for optimal credit health',
      'Competitive tiered annual interest rates',
      'Structured grace periods upon request',
    ],
    popular: false,
  },
  {
    id: 'emergency-facility',
    title: 'Emergency Short-Term Facility',
    category: 'QUICK ASSISTANCE',
    icon: ShieldAlert,
    accentColor: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description:
      'Urgent short-term micro facilities crafted for unexpected life events, medical emergencies, or immediate family bridge commitments.',
    features: [
      'Quick 24-hour turnaround for verified borrowers',
      'Tenures starting at 3 to 6 months',
      'Zero pre-settlement penalty fees',
      'Simplified guarantor requirements',
      'Real-time status updates via SMS & Portal',
    ],
    popular: false,
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 lg:py-28 bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/60 relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
            Tailored Financing Solutions
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Services Crafted for Every Need
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            Whether you need liquid cash for personal ambitions or seek to lease a vehicle for daily travel or commercial trade, Smart Line Investment offers transparent, dependable products.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="relative rounded-2xl bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/90 hover:border-blue-400 dark:hover:border-slate-700/90 p-8 transition-all hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-blue-900/10 flex flex-col justify-between group"
              >
                {service.popular && (
                  <span className="absolute top-6 right-6 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`p-3.5 rounded-xl border ${service.iconBg}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 block">
                        {service.category}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors m-0">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <div className="space-y-2.5 mb-8">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700 dark:text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                  <a
                    href="#calculator"
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    Calculate Installment
                  </a>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 group-hover:translate-x-1 transition-all"
                  >
                    Apply Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
