import React from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { CalculatedChart } from '../types/astrology';
import { ZODIAC_SIGNS } from '../utils/astrologyCalculator';

interface ChartResultViewProps {
  chart: CalculatedChart;
  onAskAstra: (prompt: string) => void;
  onRecalculate: () => void;
}

export const ChartResultView: React.FC<ChartResultViewProps> = ({
  chart,
  onAskAstra,
  onRecalculate
}) => {
  const { western, vedic, chinese, birthDetails } = chart;

  return (
    <section id="chart-result" className="py-20 bg-[#F4EFE6] text-[#0F172A] border-b border-[#E5DFD3]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        
        {/* Dossier Header Banner */}
        <div className="bg-[#FFFFFF] border-2 border-[#0F172A] p-8 sm:p-10 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF552E] text-white text-xs font-mono font-bold uppercase tracking-wider">
                <span>NATAL DOSSIER #AST-{birthDetails.birthDate.replace(/-/g, '')}</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight">
                {birthDetails.name}
              </h2>
              <p className="text-[#FF552E] font-bold text-lg">
                "{western.archetypeTitle}"
              </p>
              <div className="text-xs text-[#64748B] font-mono flex flex-wrap gap-4 pt-1">
                <span>DATE: {birthDetails.birthDate}</span>
                <span>TIME: {birthDetails.birthTime} {birthDetails.birthTimePeriod}</span>
                <span>LOCATION: {birthDetails.city}, {birthDetails.country}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onAskAstra(`Please furnish an in-depth astrological analysis of my chart: Sun in ${western.sun.sign}, Moon in ${western.moon.sign}, and ${western.rising.sign} Rising. Explore psychological archetypes and current transit timing.`)}
                className="px-6 py-3.5 bg-[#FF552E] hover:bg-[#E6441D] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-md"
              >
                <span>CONSULT ASTRA AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onRecalculate}
                className="px-5 py-3.5 bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RE-CALCULATE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Western Triad Cards */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#D8D0C5] pb-3">
            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-wide">
              Western Planetary Coordinates
            </h3>
            <span className="text-xs font-mono text-[#64748B] font-semibold">Tropical System • Placidus</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sun */}
            <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#FF552E] font-bold uppercase tracking-wider">Solar Horizon (Sun)</span>
                <span className="text-2xl font-black text-[#0F172A]">☉</span>
              </div>
              <div>
                <div className="text-3xl font-black text-[#0F172A]">
                  {western.sun.sign} <span className="text-sm font-mono text-[#64748B]">({western.sun.degree}°)</span>
                </div>
                <div className="text-xs text-[#FF552E] font-mono font-bold mt-1 uppercase">
                  {ZODIAC_SIGNS[western.sun.sign].element} • {ZODIAC_SIGNS[western.sun.sign].modality}
                </div>
                <p className="text-xs text-[#475569] mt-3 leading-relaxed">
                  Conscious identity, vocational vitality, and creative drive. Planetary ruler: <span className="font-bold text-[#0F172A]">{ZODIAC_SIGNS[western.sun.sign].ruler}</span>.
                </p>
              </div>
              <button
                onClick={() => onAskAstra(`Examine my ${western.sun.sign} Sun and how to develop its vocational mastery.`)}
                className="text-xs font-mono font-bold text-[#FF552E] hover:text-[#E6441D] uppercase flex items-center gap-1"
              >
                <span>Interpret Solar Axis &rarr;</span>
              </button>
            </div>

            {/* Moon */}
            <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#FF552E] font-bold uppercase tracking-wider">Lunar Subconscious (Moon)</span>
                <span className="text-2xl font-black text-[#0F172A]">☽</span>
              </div>
              <div>
                <div className="text-3xl font-black text-[#0F172A]">
                  {western.moon.sign} <span className="text-sm font-mono text-[#64748B]">({western.moon.degree}°)</span>
                </div>
                <div className="text-xs text-[#FF552E] font-mono font-bold mt-1 uppercase">
                  {ZODIAC_SIGNS[western.moon.sign].element} • {ZODIAC_SIGNS[western.moon.sign].modality}
                </div>
                <p className="text-xs text-[#475569] mt-3 leading-relaxed">
                  Instinctual emotional foundation, stress response, and unconditional psychological safety.
                </p>
              </div>
              <button
                onClick={() => onAskAstra(`How does my ${western.moon.sign} Moon process emotional tension and relational intimacy?`)}
                className="text-xs font-mono font-bold text-[#FF552E] hover:text-[#E6441D] uppercase flex items-center gap-1"
              >
                <span>Interpret Lunar Axis &rarr;</span>
              </button>
            </div>

            {/* Rising */}
            <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#FF552E] font-bold uppercase tracking-wider">Ascendant Horizon (ASC)</span>
                <span className="text-xs font-mono font-black text-[#0F172A] px-2 py-1 bg-[#F1F5F9]">ASC</span>
              </div>
              <div>
                <div className="text-3xl font-black text-[#0F172A]">
                  {western.rising.sign} <span className="text-sm font-mono text-[#64748B]">({western.rising.degree}°)</span>
                </div>
                <div className="text-xs text-[#FF552E] font-mono font-bold mt-1 uppercase">
                  {ZODIAC_SIGNS[western.rising.sign].element} • 1st House Cusp
                </div>
                <p className="text-xs text-[#475569] mt-3 leading-relaxed">
                  The lens through which you meet the world, spontaneous persona, and physical vitality.
                </p>
              </div>
              <button
                onClick={() => onAskAstra(`What does having ${western.rising.sign} Rising signify regarding my life journey and social presence?`)}
                className="text-xs font-mono font-bold text-[#FF552E] hover:text-[#E6441D] uppercase flex items-center gap-1"
              >
                <span>Interpret Horizon &rarr;</span>
              </button>
            </div>

          </div>
        </div>

        {/* Dual Column: Vedic Jyotish & Chinese BaZi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Vedic Parashari Jyotish */}
          <div className="lg:col-span-7 bg-[#FFFFFF] p-8 border border-[#E2E8F0] space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h4 className="text-xl font-black text-[#0F172A]">
                  Vedic Parashari Kundali
                </h4>
                <p className="text-xs text-[#64748B] font-mono mt-0.5">Sidereal Zodiac • Lahiri Ayanamsha (24° Offset)</p>
              </div>
              <span className="px-3 py-1 bg-[#0F172A] text-white text-xs font-mono font-bold">
                {vedic.birthNakshatra}
              </span>
            </div>

            {/* Classical Diamond Kundali Chart */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="w-56 h-56 relative bg-[#0F172A] border-2 border-[#FF552E] p-2 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <line x1="0" y1="0" x2="100" y2="100" stroke="#FF552E" strokeWidth="0.8" opacity="0.6" />
                  <line x1="100" y1="0" x2="0" y2="100" stroke="#FF552E" strokeWidth="0.8" opacity="0.6" />
                  <polygon points="50,0 100,50 50,100 0,50" fill="none" stroke="#FF552E" strokeWidth="1.2" />
                  
                  {/* House 1 (Lagna) */}
                  <text x="50" y="32" textAnchor="middle" fill="#FF552E" fontSize="6.5" fontWeight="bold">H1 Lagna</text>
                  <text x="50" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="5.5" fontFamily="monospace">{vedic.ascendantRashi}</text>

                  {/* House 4 */}
                  <text x="25" y="52" textAnchor="middle" fill="#94A3B8" fontSize="5" fontFamily="monospace">H4: {vedic.moonRashi}</text>

                  {/* House 10 */}
                  <text x="75" y="52" textAnchor="middle" fill="#94A3B8" fontSize="5" fontFamily="monospace">H10: Karma</text>

                  {/* House 7 */}
                  <text x="50" y="75" textAnchor="middle" fill="#FF552E" fontSize="5" fontFamily="monospace">H7: Partner</text>
                </svg>
              </div>

              {/* Technical Breakdown */}
              <div className="space-y-3 flex-1 text-xs font-mono">
                <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
                  <span className="text-[#64748B]">Lagna Rashi:</span>
                  <span className="font-bold text-[#0F172A]">{vedic.ascendantRashi}</span>
                </div>
                <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
                  <span className="text-[#64748B]">Chandra (Moon):</span>
                  <span className="font-bold text-[#0F172A]">{vedic.moonRashi}</span>
                </div>
                <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
                  <span className="text-[#64748B]">Nakshatra & Lord:</span>
                  <span className="font-bold text-[#FF552E]">{vedic.birthNakshatra} ({vedic.nakshatraLord})</span>
                </div>
                <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
                  <span className="text-[#64748B]">Vimshottari Dasha:</span>
                  <span className="font-bold text-[#0F172A]">{vedic.currentDasha}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Kuja Disposition:</span>
                  <span className="font-bold text-[#0F172A]">{vedic.manglikStatus} Energy</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onAskAstra(`Analyze my Vedic chart: ${vedic.birthNakshatra} Nakshatra and ${vedic.currentDasha}. What karmic invitations and remedies are indicated?`)}
                className="text-xs font-mono font-bold text-[#FF552E] hover:text-[#E6441D] uppercase"
              >
                Inquire about Vedic Planetary Seasons with Astra &rarr;
              </button>
            </div>
          </div>

          {/* Chinese BaZi & Elemental Balance */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Chinese BaZi Dossier */}
            <div className="bg-[#FFFFFF] p-8 border border-[#E2E8F0] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h4 className="text-xl font-black text-[#0F172A]">
                  Imperial BaZi Pillar
                </h4>
                <span className="text-xs font-mono font-bold text-[#FF552E]">
                  {chinese.polarity} {chinese.element}
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-[#0F172A]">
                  Year of the {chinese.animal}
                </div>
                <div className="text-xs font-mono text-[#64748B] mt-1 font-semibold">
                  Constitutional Energy: {chinese.polarity} {chinese.element}
                </div>
              </div>

              <p className="text-xs text-[#475569] leading-relaxed">
                {chinese.pillarCharacteristics}
              </p>
            </div>

            {/* Elemental Constitution Gauge */}
            <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                <span className="text-xs font-mono font-bold uppercase text-[#64748B]">
                  Elemental Equilibrium
                </span>
                <span className="text-xs font-mono font-bold text-[#FF552E]">
                  Dominant: {western.dominantElement}
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-[#64748B] mb-1 font-semibold">
                    <span>Fire</span>
                    <span>{western.elementDistribution.fire}%</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2">
                    <div className="bg-[#FF552E] h-2" style={{ width: `${western.elementDistribution.fire}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#64748B] mb-1 font-semibold">
                    <span>Earth</span>
                    <span>{western.elementDistribution.earth}%</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2">
                    <div className="bg-[#0F172A] h-2" style={{ width: `${western.elementDistribution.earth}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#64748B] mb-1 font-semibold">
                    <span>Air</span>
                    <span>{western.elementDistribution.air}%</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2">
                    <div className="bg-[#F59E0B] h-2" style={{ width: `${western.elementDistribution.air}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#64748B] mb-1 font-semibold">
                    <span>Water</span>
                    <span>{western.elementDistribution.water}%</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2">
                    <div className="bg-[#3B82F6] h-2" style={{ width: `${western.elementDistribution.water}%` }} />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
