import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer id="contact" className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm transition-colors duration-200">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: Brand & Overview (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <a href="#hero" className="flex items-center gap-3 no-underline">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shadow-sm flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                  Smart Line
                </span>
                <span className="text-[11px] font-semibold tracking-wide uppercase text-blue-600 dark:text-blue-400 block">
                  Investment (Pvt) Ltd
                </span>
              </div>
            </a>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Smart Line Investment provides reliable micro-lending, business working capital, and vehicle leasing services across Sri Lanka. Committed to financial empowerment with total transparency and digital speed.
            </p>

            <div className="pt-2 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300">
                  No. 45/A, Galle Road, Colombo 03, Western Province, Sri Lanka
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <a href="tel:+94112345678" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors no-underline">
                  +94 11 234 5678 / +94 77 123 4567
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <a href="mailto:info@smartline.lk" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors no-underline">
                  inquiries@smartline.lk
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  Monday – Saturday: 8:30 AM – 5:30 PM
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Financial Facilities (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Financial Facilities
            </h4>
            <ul className="space-y-2.5 text-xs list-none p-0 m-0">
              <li>
                <a href="#services" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group py-0.5 no-underline">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" /> Personal Money Loans
                </a>
              </li>
              <li>
                <a href="#services" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group py-0.5 no-underline">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" /> Motorcycle & Scooter Leasing
                </a>
              </li>
              <li>
                <a href="#services" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group py-0.5 no-underline">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" /> Three-Wheeler Asset Leasing
                </a>
              </li>
              <li>
                <a href="#services" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group py-0.5 no-underline">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" /> SME Working Capital Lines
                </a>
              </li>
              <li>
                <a href="#services" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group py-0.5 no-underline">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" /> Emergency Bridge Finance
                </a>
              </li>
              <li>
                <a href="#calculator" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group py-0.5 no-underline">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" /> Loan EMI Calculator
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs list-none p-0 m-0">
              <li>
                <a href="#hero" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block py-0.5 no-underline">Home</a>
              </li>
              <li>
                <a href="#services" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block py-0.5 no-underline">Our Services</a>
              </li>
              <li>
                <a href="#process" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block py-0.5 no-underline">Application Process</a>
              </li>
              <li>
                <a href="#why-us" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block py-0.5 no-underline">Why Choose Us</a>
              </li>
              <li>
                <a href="#testimonials" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block py-0.5 no-underline">Client Reviews</a>
              </li>
              <li>
                <a href="#faq" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block py-0.5 no-underline">Frequently Asked Questions</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Client & Staff Access (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              System Access
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Borrowers and company officers can log in to access the multi-role management desk.
            </p>

            <div className="space-y-2.5 pt-1">
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all no-underline shadow-sm"
              >
                Officer & Staff Portal
              </Link>
              <Link
                to="/register"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all no-underline"
              >
                Register as Borrower
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-footer copyright */}
      <div className="border-t border-slate-200 dark:border-slate-900 bg-slate-50/80 dark:bg-slate-950/90 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="m-0">
            &copy; {new Date().getFullYear()} Smart Line Investment (Pvt) Ltd. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-slate-500 dark:text-slate-400">
            <span className="hover:text-blue-600 dark:hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-blue-600 dark:hover:text-slate-300 cursor-pointer">Terms & Conditions</span>
            <span className="hover:text-blue-600 dark:hover:text-slate-300 cursor-pointer">Interest Disclosure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
