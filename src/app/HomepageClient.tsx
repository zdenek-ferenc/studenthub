"use client";

import dynamic from 'next/dynamic';
import HeroSection from '../components/homepage/HeroSection';

const ProcessSection = dynamic(() => import('../components/homepage/ProcessSection'));
const FeaturesSection = dynamic(() => import('../components/homepage/FeaturesSection'));
const WinWinSection = dynamic(() => import('../components/homepage/WinWinSection'));
const GrowthSection = dynamic(() => import('../components/homepage/GrowthSection'));
const CTASection = dynamic(() => import('../components/homepage/CTASection'));

export default function HomePage() {
  return (
    <div className="w-full overflow-x-hidden bg-[#001224] text-gray-900">
      
      <HeroSection />

      <main className="relative z-20 bg-white rounded-t-[2.5rem] md:rounded-t-[4rem] shadow-[0_-20px_60px_rgba(0,0,0,0.2)] -mt-10 overflow-hidden">
        
        <ProcessSection />

        <FeaturesSection />

        <WinWinSection />

        <GrowthSection />

        <CTASection />

      </main>
    </div>
  );
}