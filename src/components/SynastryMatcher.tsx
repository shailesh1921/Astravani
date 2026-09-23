import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ZodiacSignName } from '../types/astrology';
import { SIGNS_ORDER, ZODIAC_SIGNS } from '../utils/astrologyCalculator';

interface SynastryMatcherProps {
  onAskAstra: (prompt: string) => void;
}

export const SynastryMatcher: React.FC<SynastryMatcherProps> = ({ onAskAstra }) => {
  const [signA, setSignA] = useState<ZodiacSignName>('Scorpio');
  const [signB, setSignB] = useState<ZodiacSignName>('Pisces');

  const infoA = ZODIAC_SIGNS[signA];
  const infoB = ZODIAC_SIGNS[signB];

  const getElementalAffinity = (elA: string, elB: string) => {
    if (elA === elB) return { resonance: 92, dialogue: 94, structural: 88 };
    if ((elA === 'Fire' && elB === 'Air') || (elA === 'Air' && elB === 'Fire')) {
      return { resonance: 95, dialogue: 90, structural: 84 };
    }
    if ((elA === 'Earth' && elB === 'Water') || (elA === 'Water' && elB === 'Earth')) {
      return { resonance: 88, dialogue: 89, structural: 96 };
    }
    if ((elA === 'Fire' && elB === 'Water') || (elA === 'Water' && elB === 'Fire')) {
      return { resonance: 90, dialogue: 72, structural: 70 };
    }
    return { resonance: 80, dialogue: 84, structural: 82 };
  };

  const scores = getElementalAffinity(infoA.element, infoB.element);
  const compositeIndex = Math.round((scores.resonance + scores.dialogue + scores.structural) / 3);

  return (
    <section id="synastry" className="py-24 bg-[#FFFFFF] text-[#0F172A] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F1F5F9] text-[#0F172A] text-xs font-mono font-bold uppercase tracking-wider">
            <span>RELATIONAL HARMONICS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0F172A]">
            Harmonic Synastry & Aspect Resonance
          </h2>
          <p className="text-base text-[#475569] leading-relaxed">
            Astrological synastry measures the geometric dialogue between two natal matrices. Interpersonal friction is evaluated as a catalyst for growth rather than fatalistic incompatibility.
          </p>
        </div>

        {/* Dual Sign Selector Card */}
        <div className="bg-[#F8FAFC] border-2 border-[#0F172A] p-8 sm:p-12 max-w-4xl mx-auto shadow-md space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
            
            {/* Subject 1 */}
            <div className="md:col-span-5 space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#475569]">
                Primary Coordinate (Sign I)
              </label>
              <select
                value={signA}
                onChange={(e) => setSignA(e.target.value as ZodiacSignName)}
                className="w-full px-4 py-3.5 bg-white border border-[#CBD5E1] text-sm font-bold text-[#0F172A] cursor-pointer"
              >
                {SIGNS_ORDER.map(s => (
                  <option key={s} value={s}>{s} ({ZODIAC_SIGNS[s].element} • {ZODIAC_SIGNS[s].modality})</option>
                ))}
              </select>
              <div className="p-4 bg-white border border-[#E2E8F0] text-xs font-mono space-y-1">
                <div className="text-[#FF552E] font-bold text-sm">{infoA.glyph} {infoA.name}</div>
                <div className="text-[#64748B]">Ruler: {infoA.ruler} • Element: {infoA.element}</div>
              </div>
            </div>

            {/* Geometric Center Index */}
            <div className="md:col-span-1 flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-[#FF552E] text-white flex items-center justify-center text-sm font-black font-mono shadow-md">
                {compositeIndex}%
              </div>
              <span className="text-[10px] font-mono text-[#64748B] mt-1.5 uppercase font-bold tracking-wider">Score</span>
            </div>

            {/* Subject 2 */}
            <div className="md:col-span-5 space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#475569]">
                Secondary Coordinate (Sign II)
              </label>
              <select
                value={signB}
                onChange={(e) => setSignB(e.target.value as ZodiacSignName)}
                className="w-full px-4 py-3.5 bg-white border border-[#CBD5E1] text-sm font-bold text-[#0F172A] cursor-pointer"
              >
                {SIGNS_ORDER.map(s => (
                  <option key={s} value={s}>{s} ({ZODIAC_SIGNS[s].element} • {ZODIAC_SIGNS[s].modality})</option>
                ))}
              </select>
              <div className="p-4 bg-white border border-[#E2E8F0] text-xs font-mono space-y-1">
                <div className="text-[#FF552E] font-bold text-sm">{infoB.glyph} {infoB.name}</div>
                <div className="text-[#64748B]">Ruler: {infoB.ruler} • Element: {infoB.element}</div>
              </div>
            </div>

          </div>

          {/* Triad Metric Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#E2E8F0]">
            <div className="p-4 bg-white border border-[#E2E8F0]">
              <span className="text-xs font-mono text-[#64748B] uppercase font-bold tracking-wider block">Archetypal Resonance</span>
              <span className="text-2xl font-black text-[#0F172A] mt-1 block">{scores.resonance}%</span>
              <div className="w-full bg-[#F1F5F9] h-2 mt-2">
                <div className="bg-[#FF552E] h-2" style={{ width: `${scores.resonance}%` }} />
              </div>
            </div>

            <div className="p-4 bg-white border border-[#E2E8F0]">
              <span className="text-xs font-mono text-[#64748B] uppercase font-bold tracking-wider block">Intellectual Rapport</span>
              <span className="text-2xl font-black text-[#0F172A] mt-1 block">{scores.dialogue}%</span>
              <div className="w-full bg-[#F1F5F9] h-2 mt-2">
                <div className="bg-[#0F172A] h-2" style={{ width: `${scores.dialogue}%` }} />
              </div>
            </div>

            <div className="p-4 bg-white border border-[#E2E8F0]">
              <span className="text-xs font-mono text-[#64748B] uppercase font-bold tracking-wider block">Structural Longevity</span>
              <span className="text-2xl font-black text-[#0F172A] mt-1 block">{scores.structural}%</span>
              <div className="w-full bg-[#F1F5F9] h-2 mt-2">
                <div className="bg-[#10B981] h-2" style={{ width: `${scores.structural}%` }} />
              </div>
            </div>
          </div>

          {/* Synthesis CTA */}
          <div className="pt-2 text-center">
            <button
              onClick={() => onAskAstra(`Provide a formal synastry report for ${signA} and ${signB}. Examine emotional communication dynamics, vocational support, and growth boundaries.`)}
              className="px-6 py-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 group shadow-sm"
            >
              <span>Examine {signA} & {signB} Synastry in Astra Terminal</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF552E] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
