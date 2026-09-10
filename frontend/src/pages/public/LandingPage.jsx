import React, { useEffect } from 'react';
import LandingNavbar from '../../components/landing/LandingNavbar';
import HeroSection from '../../components/landing/HeroSection';
import ServicesSection from '../../components/landing/ServicesSection';
import ProcessSection from '../../components/landing/ProcessSection';
import CalculatorSection from '../../components/landing/CalculatorSection';
import WhyChooseUsSection from '../../components/landing/WhyChooseUsSection';
import TestimonialsSection from '../../components/landing/TestimonialsSection';
import FaqSection from '../../components/landing/FaqSection';
import CtaSection from '../../components/landing/CtaSection';
import LandingFooter from '../../components/landing/LandingFooter';

const LandingPage = () => {
  useEffect(() => {
    document.title = 'Smart Line Investment — Money Loan & Vehicle Leasing in Sri Lanka';
    // Ensure smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased overflow-x-hidden">

      {/* 2. Sticky Navbar */}
      <LandingNavbar />

      {/* 3. Hero Section & Quick Floating Inquiry */}
      <HeroSection />

      {/* 4. Core Services (Money Loans & Vehicle Leases) */}
      <ServicesSection />

      {/* 5. 3-Step Simple Application Process */}
      <ProcessSection />

      {/* 6. Interactive EMI & Leasing Calculator */}
      <CalculatorSection />

      {/* 7. Why Choose Smart Line (Stats & Trust Pillars) */}
      <WhyChooseUsSection />

      {/* 8. Verified Borrower Testimonials */}
      <TestimonialsSection />

      {/* 9. Frequently Asked Questions */}
      <FaqSection />

      {/* 10. High-Conversion Call To Action Banner */}
      <CtaSection />

      {/* 11. Enterprise Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
