import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';

type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY';

const CURRENCIES: Record<Currency, { symbol: string; rate: number; suffix: string }> = {
  USD: { symbol: '$', rate: 1, suffix: '/mo' },
  EUR: { symbol: '€', rate: 0.92, suffix: '/mo' },
  GBP: { symbol: '£', rate: 0.79, suffix: '/mo' },
  INR: { symbol: '₹', rate: 83, suffix: '/mo' },
  JPY: { symbol: '¥', rate: 155, suffix: '/mo' },
};

interface PricingProps {
  onOpenChartModal: () => void;
  onOpenChat: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onOpenChartModal, onOpenChat }) => {
  const [currency, setCurrency] = useState<Currency>('INR');
  const [isAnnual, setIsAnnual] = useState(true);

  const curr = CURRENCIES[currency];

  const formatPrice = (baseUsd: number) => {
    let amount = baseUsd * curr.rate;
    if (isAnnual) amount *= 0.8;
    if (currency === 'INR' || currency === 'JPY') {
      return `${curr.symbol}${Math.round(amount)}`;
    }
    return `${curr.symbol}${amount.toFixed(2)}`;
  };

  return (
    <section id="pricing" className="py-24 bg-[#FFFFFF] text-[#0F172A] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F1F5F9] text-[#0F172A] text-xs font-mono font-bold uppercase tracking-wider">
            <span>MEMBERSHIP & PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0F172A]">
            Transparent pricing for individuals and operators.
          </h2>
          <p className="text-base text-[#475569] leading-relaxed">
            Choose your regional operating currency and billing frequency. Cancel anytime.
          </p>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            
            <div className="inline-flex p-1 bg-[#F1F5F9] border border-[#CBD5E1] text-xs font-mono">
              {(['INR', 'USD', 'EUR', 'GBP', 'JPY'] as Currency[]).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 transition-colors font-bold ${
                    currency === c ? 'bg-[#0F172A] text-white' : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-3 text-xs font-mono font-bold text-[#475569] bg-[#F1F5F9] px-4 py-2 border border-[#CBD5E1]">
              <span className={!isAnnual ? 'text-[#0F172A]' : ''}>Monthly</span>
              <button
                type="button"
                onClick={() => setIsAnnual(!isAnnual)}
                className={`w-10 h-5 p-0.5 transition-colors ${
                  isAnnual ? 'bg-[#FF552E]' : 'bg-[#94A3B8]'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white transition-transform ${
                    isAnnual ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={isAnnual ? 'text-[#FF552E]' : ''}>
                Annual (Save 20%)
              </span>
            </div>

          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Tier 1 */}
          <div className="p-8 bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#64748B] font-bold uppercase tracking-wider block">Starter</span>
              <h3 className="text-2xl font-bold text-[#0F172A]">Explorer</h3>
              <div className="text-4xl font-black text-[#0F172A]">
                {curr.symbol}0 <span className="text-xs font-mono text-[#64748B] font-normal">/ forever</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                Essential natal ephemeris coordinates and daily celestial transit tracking for personal contemplation.
              </p>
              <ul className="space-y-3 text-xs text-[#475569] pt-4 border-t border-[#E2E8F0]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF552E] shrink-0" />
                  <span>Western Tropical Natal Ephemeris</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF552E] shrink-0" />
                  <span>Daily Transits & Elemental Equilibrium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF552E] shrink-0" />
                  <span>Astra Terminal Dialog (5 inquiries / day)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenChartModal}
              className="w-full py-3.5 bg-[#FFFFFF] border-2 border-[#0F172A] hover:bg-[#0F172A] hover:text-white text-[#0F172A] text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              Get Free Chart
            </button>
          </div>

          {/* Tier 2 (Featured - High Contrast Orange / Dark) */}
          <div className="p-8 bg-[#0F172A] text-white border-2 border-[#FF552E] shadow-xl flex flex-col justify-between space-y-6 relative">
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#FF552E] font-bold uppercase tracking-wider block">Most Popular</span>
              <h3 className="text-2xl font-bold text-white">Palladium Pro</h3>
              <div className="text-4xl font-black text-white">
                {formatPrice(12)} <span className="text-xs font-mono text-[#94A3B8] font-normal">{curr.suffix}</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Unlimited AI consultations, complete Vedic Dasha cycles, and Synastry aspect matrices.
              </p>
              <ul className="space-y-3 text-xs text-[#CBD5E1] pt-4 border-t border-[#1E293B]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF552E] shrink-0" />
                  <span><strong>Unlimited</strong> Astra AI Astrologer Consultations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF552E] shrink-0" />
                  <span>Full Vedic Kundali & 27 Nakshatra Analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF552E] shrink-0" />
                  <span>Chinese BaZi Four Pillars & Wu Xing Balance</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF552E] shrink-0" />
                  <span>Synastry Aspect Matrix & Harmonic Scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF552E] shrink-0" />
                  <span>Saturn Return & Major Ingress Alerts</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenChat}
              className="w-full py-4 bg-[#FF552E] hover:bg-[#E6441D] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 group shadow-lg"
            >
              <span>START 7-DAY FREE TRIAL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Tier 3 */}
          <div className="p-8 bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#64748B] font-bold uppercase tracking-wider block">Enterprise / Mastery</span>
              <h3 className="text-2xl font-bold text-[#0F172A]">Enterprise</h3>
              <div className="text-4xl font-black text-[#0F172A]">
                {formatPrice(29)} <span className="text-xs font-mono text-[#64748B] font-normal">{curr.suffix}</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                Annual Solar Return architectural dossier, guided audio transit briefings, and high-fidelity archival charts.
              </p>
              <ul className="space-y-3 text-xs text-[#475569] pt-4 border-t border-[#E2E8F0]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF552E] shrink-0" />
                  <span>Complete Features of Pro Tier</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF552E] shrink-0" />
                  <span>Annual Solar Return Architectural Dossier</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF552E] shrink-0" />
                  <span>Monthly Guided Audio Transit Meditations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF552E] shrink-0" />
                  <span>High-Fidelity Archival Print Ephemeris Maps</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenChat}
              className="w-full py-3.5 bg-[#FFFFFF] border border-[#CBD5E1] hover:border-[#0F172A] text-[#0F172A] text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              Contact Sales
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
