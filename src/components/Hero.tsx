import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onOpenChartModal: () => void;
  onOpenChat: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenChartModal, onOpenChat }) => {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between pt-24 bg-[#0A0D14] overflow-hidden">
      
      {/* Background with Dark Atmospheric Workspace Image & Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14] via-[#0A0D14]/90 to-[#0A0D14]/70 pointer-events-none" />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full pt-16 pb-20 relative z-10 space-y-8">
        
        {/* Eyebrow Pill Tag matching primenumbers.in screenshot */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFFFF] text-[#0A0D14] text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#FF552E]" />
          <span>AI PRODUCTS FROM ASTRA.IN</span>
        </div>

        {/* Signature Highlighted Headline */}
        <div className="max-w-4xl space-y-2">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-extrabold tracking-tight text-white leading-none flex flex-wrap items-center gap-3">
            {/* The Signature Vibrant Orange Highlight Box */}
            <span className="bg-[#FF552E] px-4 py-1.5 text-white font-black inline-block">
              ₹70,000 CRORE
            </span>
            <span className="text-white">, DECODED.</span>
          </h1>
        </div>

        {/* Subtitle Paragraph */}
        <p className="text-base sm:text-xl text-[#CBD5E1] max-w-2xl font-normal leading-relaxed">
          Astra Ephemeris and our stealth AI engine help seekers and operators find, rank, and act on cosmic timing across Western Tropical, Vedic Jyotish, and BaZi traditions.
        </p>

        {/* Dual Action Buttons matching primenumbers.in */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          
          {/* Orange Primary Button */}
          <button
            onClick={onOpenChartModal}
            className="px-8 py-4 bg-[#FF552E] hover:bg-[#E6441D] text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg group"
          >
            <span>EXPLORE PRODUCTS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* White Secondary Button */}
          <button
            onClick={onOpenChat}
            className="px-8 py-4 bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[#0F172A] font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center"
          >
            <span>TALK TO US</span>
          </button>
        </div>

        {/* Micro Tagline below CTAs */}
        <div className="pt-2">
          <span className="text-xs font-mono font-bold text-[#FF552E] uppercase tracking-widest">
            BOOTSTRAPPED, PROFITABLE & GROWING…
          </span>
        </div>

      </div>

      {/* Signature 3-Block Geometric Metric Strip (from bottom of screenshot) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 border-t border-[#232836] relative z-10">
        
        {/* Block 1: Dark Navy/Black */}
        <div className="bg-[#0C0E14] px-8 py-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#232836]">
          <div className="text-5xl sm:text-6xl font-black text-white tracking-tight font-sans">
            150K+
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] mt-2 font-semibold">
            Natal Ephemeris Calculations Cast
          </div>
        </div>

        {/* Block 2: Warm Sand / Cream */}
        <div className="bg-[#F4EFE6] px-8 py-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#E5DFD3]">
          <div className="text-5xl sm:text-6xl font-black text-[#0F172A] tracking-tight font-sans">
            90L+
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#475569] mt-2 font-semibold">
            Planetary Aspects & Transit Signals Ranked
          </div>
        </div>

        {/* Block 3: Vibrant Vermilion Orange */}
        <div className="bg-[#FF552E] px-8 py-10 flex flex-col justify-center">
          <div className="text-5xl sm:text-6xl font-black text-white tracking-tight font-sans">
            50L+
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-white/90 mt-2 font-semibold">
            AI Astrologer Conversations & Insights
          </div>
        </div>

      </div>

    </section>
  );
};
