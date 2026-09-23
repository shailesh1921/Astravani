import React from 'react';
import { ArrowRight, Database, Cpu, Compass } from 'lucide-react';

interface TraditionShowcaseProps {
  onOpenChartModal?: () => void;
  onOpenChat?: () => void;
}

export const TraditionShowcase: React.FC<TraditionShowcaseProps> = ({ onOpenChartModal, onOpenChat }) => {
  return (
    <section id="products" className="py-24 bg-[#FFFFFF] text-[#0F172A] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-20">
        
        {/* Section 1: Two products, one data engine */}
        <div className="space-y-12">
          
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0F172A]">
              Two products, one data engine.
            </h2>
            <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
              Palladium Ephemeris is live in precision astronomical calculations. Astra AI Terminal is built for individuals and teams who want to understand cosmic timing before life transitions arrive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Product 1: Palladium Ephemeris */}
            <div className="p-8 sm:p-10 bg-[#F8FAFC] border border-[#E2E8F0] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm">
                  01
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A]">
                  Palladium Ephemeris
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Precision multi-tradition calculation engine for teams and seekers that need exact planetary coordinates, Vedic Lahiri Kundalis, and Chinese BaZi Four Pillars.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-[#334155]">
                  <span className="px-2.5 py-1 bg-[#E2E8F0] font-semibold">Western Tropical</span>
                  <span className="px-2.5 py-1 bg-[#E2E8F0] font-semibold">Vedic 27 Nakshatras</span>
                  <span className="px-2.5 py-1 bg-[#E2E8F0] font-semibold">Chinese BaZi</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <button
                  onClick={onOpenChartModal}
                  className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF552E] hover:text-[#E6441D] flex items-center gap-2 group"
                >
                  <span>CALCULATE IN PALLADIUM</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Product 2: Stealth AI Terminal */}
            <div className="p-8 sm:p-10 bg-[#0F172A] text-white border border-[#1E293B] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 bg-[#FF552E] text-white flex items-center justify-center font-bold text-sm">
                  02
                </div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-white">
                    Astra AI Terminal
                  </h3>
                  <span className="px-2 py-0.5 bg-[#FF552E]/20 text-[#FF552E] border border-[#FF552E]/40 text-[10px] font-mono font-bold uppercase">
                    Live
                  </span>
                </div>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  An empathetic intelligence layer for users who want to spot psychological triggers, Saturn transits, relationship resonance, and life season shifts before they manifest.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-[#94A3B8]">
                  <span className="px-2.5 py-1 bg-[#1E293B] font-semibold text-white">Jungian Archetypes</span>
                  <span className="px-2.5 py-1 bg-[#1E293B] font-semibold text-white">Zero Fatalism</span>
                  <span className="px-2.5 py-1 bg-[#1E293B] font-semibold text-white">Multilingual</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1E293B]">
                <button
                  onClick={onOpenChat}
                  className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF552E] hover:text-white flex items-center gap-2 group"
                >
                  <span>ENTER ASTRA TERMINAL</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Section 2: Raw data in. Useful workflows out. */}
        <div id="platform" className="space-y-12 pt-8 border-t border-[#E2E8F0]">
          
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A]">
              Raw celestial data in. Useful workflows out.
            </h2>
            <p className="text-base text-[#475569] leading-relaxed">
              Both products share the same operating layer: planetary ingestion, aspect matching, timing ranking, psychological context, and human-readable explanations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="text-xs font-mono font-bold text-[#FF552E] uppercase">Step 01</div>
              <h3 className="text-lg font-bold text-[#0F172A]">Capture celestial and temporal signals.</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                We ingest NASA JPL ephemeris tables, local historical daylight savings data, and geographic coordinates, turning them into structured astrological data.
              </p>
            </div>

            <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="text-xs font-mono font-bold text-[#FF552E] uppercase">Step 02</div>
              <h3 className="text-lg font-bold text-[#0F172A]">Score fit, urgency, and transit cycles.</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                The matching layer ranks transit pressure, Vimshottari Mahadashas, and elemental imbalances so users spend energy on the periods worth acting on.
              </p>
            </div>

            <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="text-xs font-mono font-bold text-[#FF552E] uppercase">Step 03</div>
              <h3 className="text-lg font-bold text-[#0F172A]">Move from insight to grounded action.</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Astra formats every reading into actionable micro-habits, mindfulness rituals, and ethical boundaries without deterministic fear-mongering.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
