import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    question: 'What documents are required to apply for a Money Loan?',
    answer:
      'To submit your online application, you will need a clear digital copy or photo of: (1) Your National Identity Card (NIC) or Passport, (2) Proof of residential address (utility bill issued within 3 months), (3) Proof of income (recent 3 months payslips, bank statements, or business registration if self-employed), and (4) Guarantor details and NIC copy.',
  },
  {
    question: 'How does Vehicle Leasing work, and who does the inspection?',
    answer:
      'After you submit your vehicle leasing application online with details of your desired motorcycle, three-wheeler, or car, our certified Field Officer schedules an on-site visit to inspect the vehicle condition and verify ownership papers. Once verified, our Legal Officer drafts your lease agreement, and upon down-payment confirmation, your facility is disbursed.',
  },
  {
    question: 'How many guarantors are required for an application?',
    answer:
      'Typically, applications require 1 to 2 guarantors depending on the facility type and total requested amount. Guarantors submit basic KYC (NIC, phone number, and occupation). Our Credit Manager verifies guarantor details during the underwriting stage.',
  },
  {
    question: 'How fast can I receive my loan disbursal?',
    answer:
      'Most standard money loan applications that provide complete documentation are verified and approved within 24 to 48 hours. Once you review and accept the legal agreement, funds are disbursed directly to your nominated bank account by our Finance team.',
  },
  {
    question: 'What interest rates apply and how is the installment calculated?',
    answer:
      'Smart Line Investment applies transparent flat-rate annual interest (typically starting at 12.5% for vehicle leases and 14.0% for money loans). The monthly installment remains equal throughout your tenure, with no surprise rate adjustments or hidden maintenance charges.',
  },
  {
    question: 'How do I track my ongoing repayments after disbursal?',
    answer:
      'All active borrowers receive 24/7 access to our web applicant portal. You can view your complete installment schedule, past payment receipts, remaining outstanding balance, and receive automated SMS/WebSocket reminders before due dates.',
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-slate-950 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-slate-400 mt-4 leading-relaxed">
            Everything you need to know about our lending procedures, requirements, and repayment schedules.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900/90 border-blue-500/50 shadow-xl shadow-blue-950/30'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none bg-transparent border-0 cursor-pointer group m-0"
                  aria-expanded={isOpen}
                >
                  <span className={`text-base font-bold pr-4 transition-colors ${
                    isOpen ? 'text-blue-400' : 'text-slate-100 group-hover:text-white'
                  }`}>
                    {faq.question}
                  </span>
                  <div
                    className={`p-2 rounded-xl border transition-all duration-200 shrink-0 flex items-center justify-center ${
                      isOpen
                        ? 'bg-blue-600 text-white border-blue-500 rotate-180 shadow-md shadow-blue-600/30'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 group-hover:text-slate-200 group-hover:border-slate-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-950/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional support contact banner */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-white m-0">Still have questions?</h4>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Our loan advisors are available Monday through Saturday to assist with your inquiries.
            </p>
          </div>
          <a
            href="tel:+94112345678"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shrink-0"
          >
            Call +94 11 234 5678
          </a>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
