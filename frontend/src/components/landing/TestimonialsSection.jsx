import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Nihal Jayawardena',
    role: 'SME Retail Business Owner',
    location: 'Maharagama, Colombo',
    facility: 'Money Loan (LKR 750,000)',
    quote:
      'Smart Line Investment changed the game for my grocery business during the festive season. The online intake was straightforward, and the loan officer completed verification within a day. No endless bank queues!',
    rating: 5,
    avatar: 'NJ',
  },
  {
    id: 2,
    name: 'Kavindu Rathnayake',
    role: 'Logistics & Delivery Entrepreneur',
    location: 'Piliyandala',
    facility: 'Vehicle Lease — Motorcycle',
    quote:
      'I urgently needed to lease a reliable motorcycle to expand my delivery courier work. Smart Line’s Field Officer visited my doorstep for the inspection on Tuesday, and by Thursday the lease deed was signed and bike activated.',
    rating: 5,
    avatar: 'KR',
  },
  {
    id: 3,
    name: 'Dilini Samarasinghe',
    role: 'Senior Executive & Homeowner',
    location: 'Kelaniya',
    facility: 'Money Loan (LKR 300,000)',
    quote:
      'What impressed me most was the absolute clarity on interest rates and installments. No hidden management charges, and I can check my upcoming installment dates on the applicant portal anytime from my phone.',
    rating: 5,
    avatar: 'DS',
  },
  {
    id: 4,
    name: 'Sunil Wickramasinghe',
    role: 'Contractor & Construction Tradesman',
    location: 'Moratuwa',
    facility: 'Commercial Lease — 3-Wheeler Delivery',
    quote:
      'The down-payment structure was very accommodating for my current capital. The Finance Officer and Legal team walked me through every clause. Smart Line Investment truly supports self-employed individuals.',
    rating: 5,
    avatar: 'SW',
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80 relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
            Client Experiences
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Trusted by Hundreds of Sri Lankan Borrowers
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            Real stories from hardworking entrepreneurs, vehicle leasers, and families who turned to Smart Line Investment for dependable financial support.
          </p>
        </div>

        {/* Testimonial Card Slider */}
        <div className="max-w-4xl mx-auto relative">
          <div className="relative rounded-3xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-lg dark:shadow-2xl">
            {/* Top Row: Quote Icon & Star Ratings */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-1.5">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold text-amber-500 dark:text-amber-400 ml-2 font-mono">5.0 / 5.0</span>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Facility: {current.facility}
              </span>
            </div>

            {/* Quote body */}
            <blockquote className="text-lg sm:text-xl text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic mb-8">
              "{current.quote}"
            </blockquote>

            {/* Author details */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                  {current.avatar}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white m-0">{current.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
                    {current.role} &bull; <span className="text-blue-600 dark:text-blue-400">{current.location}</span>
                  </p>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevTestimonial}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white shadow-sm transition-all cursor-pointer"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white shadow-sm transition-all cursor-pointer"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentIndex === idx ? 'w-8 bg-blue-600' : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
