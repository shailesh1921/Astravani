import React from 'react';
import { Star, ShieldCheck, Heart, Briefcase, Gem, Users, CheckCircle2 } from 'lucide-react';

interface HeroBannerProps {
  onQuickTopicSelect: (topic: string) => void;
  onExploreAstrologers: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onQuickTopicSelect,
  onExploreAstrologers
}) => {
  const problems = [
    { label: 'Love & Relationship', icon: Heart, color: 'text-rose-500 bg-rose-50 border-rose-200' },
    { label: 'Marriage Timing', icon: Users, color: 'text-pink-500 bg-pink-50 border-pink-200' },
    { label: 'Career & Job Promotion', icon: Briefcase, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { label: 'Wealth & Business', icon: Gem, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ];

  return (
    <div className="bg-gradient-to-b from-amber-50/70 via-white to-slate-50 border-b border-slate-200 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 bg-white border border-amber-300 rounded-full px-3.5 py-1 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 pulsing-online" />
              <span className="text-xs font-bold text-slate-800">
                4,520+ Astrologers Available Live
              </span>
              <span className="text-xs text-amber-600 font-semibold">• 24x7 Instant Access</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Get Answers from India's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
                Most Trusted Astrologers
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              100% Private & Confidential. Ask questions regarding Love, Marriage, Career, Business, or Health. Consult verified Vedic Acharyas, Jyotishis, and Tarot Scholars vetted through rigorous 4-stage examination.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreAstrologers}
                className="btn-astrotalk px-6 py-3 text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <span>⚡ Chat with Astrologer (FREE 1st Min)</span>
              </button>
              
              <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Money-Back Guarantee</span>
              </div>
            </div>

            {/* Quick Topic Chips */}
            <div className="pt-3">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-2">
                What is your query about?
              </span>
              <div className="flex flex-wrap gap-2">
                {problems.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.label}
                      onClick={() => onQuickTopicSelect(p.label)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition hover:scale-105 ${p.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Highlights & Social Proof Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-at-card relative overflow-hidden">
              
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" />

              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Why Trust AstraVani?</h3>
                  <p className="text-xs text-slate-500">Verified by 5+ Crore Consultations</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-900">4.8 / 5</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-lg sm:text-xl font-extrabold text-amber-600 block">4,500+</span>
                  <span className="text-xs text-slate-600 font-medium">Verified Astrologers</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-lg sm:text-xl font-extrabold text-emerald-600 block">5.2 Cr+</span>
                  <span className="text-xs text-slate-600 font-medium">Minutes Consulted</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-lg sm:text-xl font-extrabold text-blue-600 block">98.6%</span>
                  <span className="text-xs text-slate-600 font-medium">Positive Satisfaction</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-lg sm:text-xl font-extrabold text-purple-600 block">24 / 7</span>
                  <span className="text-xs text-slate-600 font-medium">Live Pandits Ready</span>
                </div>
              </div>

              {/* Security Banner */}
              <div className="flex items-center gap-3 bg-amber-50/60 border border-amber-200/70 rounded-xl p-3">
                <ShieldCheck className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">100% Encrypted & Anonymous</h4>
                  <p className="text-[11px] text-slate-600">Your chat transcripts, birth details & identity remain strictly confidential.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
