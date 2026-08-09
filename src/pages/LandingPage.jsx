import React from 'react';
import { useEffect } from 'react';
import LandingNavbar from '../components/common/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import DashboardMockupSection from '../components/landing/DashboardMockupSection';
import StatisticsSection from '../components/landing/StatisticsSection';
import MarqueeLogos from '../components/landing/MarqueeLogos';
import FeatureGrid from '../components/landing/FeatureGrid';
import ExperienceTypesSection from '../components/landing/ExperienceTypesSection';
import FeaturedEventsSection from '../components/landing/FeaturedEventsSection';
import WorkflowSection from '../components/landing/WorkflowSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import PricingSection from '../components/landing/PricingSection';
import LandingFooter from '../components/common/LandingFooter';
import StickyDemoButton from '../components/common/StickyDemoButton';

const LandingPage = () => {
  useEffect(() => {
    // Scroll to top on load/reload
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-page bg-white selection:bg-[#e4322a]/30">
      <LandingNavbar />
      <StickyDemoButton />
      <main>
        {/* Dark Hero Area */}
        <div id="hero">
          <HeroSection />
        </div>

        {/* Light Dashboard Showcase */}
        <DashboardMockupSection />

        {/* Partners Row */}
        <MarqueeLogos />

        {/* Experience Cards - Blue/Orange/Purple */}
        <ExperienceTypesSection />

        {/* Core Features - Clean Grid UI */}
        <FeatureGrid />

        {/* Statistics Bar - Peach background */}
        <StatisticsSection />

        {/* Featured Events - High Impact */}
        <FeaturedEventsSection />

        {/* Professional Workflow - Sequential Steps */}
        <WorkflowSection />

        {/* Global Testimonials - Social Proof */}
        <TestimonialsSection />

        {/* Flexible Pricing - Subscription Plans */}
        <PricingSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
