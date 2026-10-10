import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Heart, Briefcase, Gem, Users, CheckCircle2, Sparkles, MessageSquare, ArrowRight, Lock, Zap } from 'lucide-react';
import { Astrologer } from '../types/astrotalk';
import { ASTROLOGERS_DATA } from '../data/astrologersData';

interface HeroBannerProps {
  onQuickTopicSelect: (topic: string) => void;
  onExploreAstrologers: () => void;
  onInitiateChat?: (astrologer: Astrologer) => void;
  onSelectTab?: (tab: string) => void;
  topAstrologer?: Astrologer;
}

const LIVE_ACTIVITIES = [
  '⚡ Pooja from Pune just started chat with Pt. Anand Swaroop',
  '⭐ Vikram from Bengaluru rated Dr. Radhika Sharma 5.0 (Accurate career timing)',
  '⚡ Sneha from Delhi started consultation with Acharya Devrat',
  '🔮 Amit from Jaipur generated his Free Janam Kundli',
  '⚡ Ananya from Mumbai connected with Acharya Devrat'
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onQuickTopicSelect,
  onExploreAstrologers,
  onInitiateChat,
  onSelectTab,
  topAstrologer
}) => {
  const featuredPandit = topAstrologer || ASTROLOGERS_DATA[0];
  const [activeActivityIndex, setActiveActivityIndex] = useState(0);

  // Rotate live activity social proof every 3.8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveActivityIndex((prev) => (prev + 1) % LIVE_ACTIVITIES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const problems = [
    { label: 'Love & Relationship', icon: Heart },
    { label: 'Marriage Timing', icon: Users },
    { label: 'Career & Job Promotion', icon: Briefcase },
    { label: 'Wealth & Business', icon: Gem },
  ];

  const handleStartConsultation = () => {
    if (onInitiateChat && featuredPandit) {
      onInitiateChat(featuredPandit);
    } else {
      onExploreAstrologers();
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-white via-[#FDFBF7] to-[#F8FAFC] border-b border-slate-200/80 py-8 sm:py-14 overflow-hidden">
      {/* Luxury Ambient Radial Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Focused Value Prop & Magnetic 1-Tap CTA */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            {/* Live Trust Pill */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-amber-300/80 rounded-full px-3.5 py-1 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 pulsing-online" />
              <span className="text-xs font-black text-slate-800 tracking-wide">
                4,500+ Top Astrologers Live
              </span>
              <span className="text-xs text-amber-600 font-bold">• 24x7 Instant Access</span>
            </div>

            {/* Headline - High Visual Impact */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 tracking-[-0.03em] leading-[1.12]">
              Answers to Life's Deepest Questions in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500">
                60 Seconds.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-medium">
              4,500+ Top Vedic Acharyas, Numerologists &amp; Tarot Scholars Online 24/7. Verified through 4-stage strict scrutiny for genuine cosmic guidance.
            </p>

            {/* Magnetic Dominant CTA Button */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleStartConsultation}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white text-base sm:text-lg font-black rounded-2xl shadow-[0_10px_25px_rgba(245,158,11,0.35)] hover:shadow-[0_15px_35px_rgba(245,158,11,0.45)] transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 cursor-pointer min-h-[56px]"
              >
                <Zap className="w-5 h-5 fill-amber-200 text-amber-200 animate-pulse" />
                <span>⚡ Connect with Astrologer (1st Min 100% Free)</span>
              </button>

              {/* Sub-text micro assurance */}
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 flex items-center gap-1.5 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>No Credit Card Needed • Instant 1-Tap Entry • 100% Private</span>
              </p>
            </div>

            {/* Psychological Trust Anchors */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-500 pt-2 border-t border-slate-200/60">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>100% Anonymous &amp; Encrypted</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>10-Second Instant Connection</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Vedic Precision Certified</span>
              </span>
            </div>

            {/* Quick Query Topic Chips */}
            <div className="pt-2">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                Or choose your life question:
              </span>
              <div className="flex flex-wrap gap-2">
                {problems.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.label}
                      onClick={() => onQuickTopicSelect(p.label)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-amber-800 transition shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Luxury CRED-style Live Pandit Spotlight */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col justify-between w-full">
              
              {/* Top Accent Gold Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" />

              {/* Card Header: Live Astrologer Spotlight */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulsing-online" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Top Verified Guru Live
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-extrabold text-slate-900 shadow-2xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>{featuredPandit.rating}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({(featuredPandit.ordersCount / 1000).toFixed(0)}k reviews)</span>
                </div>
              </div>

              {/* Pandit Profile Snippet */}
              <div className="flex items-center gap-4 mb-4 w-full">
                <div className="relative flex-shrink-0 w-18 h-18 sm:w-20 sm:h-20">
                  <img
                    src={featuredPandit.avatarUrl}
                    alt={featuredPandit.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-md flex-shrink-0"
                    loading="eager"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white pulsing-online" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-black text-slate-900 truncate">
                      {featuredPandit.name}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 truncate mb-1">
                    {featuredPandit.title}
                  </p>
                  <p className="text-[11px] text-amber-800 font-bold truncate">
                    Speciality: {featuredPandit.specialties.slice(0, 2).join(', ')} • {featuredPandit.experienceYears} Yrs Exp.
                  </p>
                </div>
              </div>

              {/* Instant 1-Click Consultation CTA */}
              <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block mb-1">
                    ⭐ TOP RATED ASTROLOGER
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-400 line-through">₹{featuredPandit.originalPrice || 80}/min</span>
                    <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      FREE (1st Min) ⚡
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleStartConsultation}
                  className="btn-astrotalk px-5 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg transition active:scale-95 flex-shrink-0 rounded-xl min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Start Chat ⚡</span>
                </button>
              </div>

              {/* Live Activity Social Proof Ticker */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                <span className="truncate font-semibold text-[11px] text-slate-600">
                  {LIVE_ACTIVITIES[activeActivityIndex]}
                </span>
              </div>

              {/* Quick Secondary Shortcut to Janam Kundli */}
              {onSelectTab && (
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Want your birth chart calculated?</span>
                  <button
                    onClick={() => {
                      onSelectTab('kundli');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-amber-700 hover:text-amber-800 font-extrabold flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>Free Janam Kundli</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
