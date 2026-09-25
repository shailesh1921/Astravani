import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Heart, Briefcase, Gem, Users, CheckCircle2, Sparkles, MessageSquare, ArrowRight, Lock } from 'lucide-react';
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
  '⚡ Sneha from Delhi claimed 100% FREE First Consultation',
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
    <div className="bg-gradient-to-b from-amber-50/60 via-white to-slate-50 border-b border-slate-200 py-7 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Value Prop, Direct CTA, and Topic Chips */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            
            {/* Live Trust Pill */}
            <div className="inline-flex items-center gap-2 bg-white border border-amber-300/80 rounded-full px-3.5 py-1 shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 pulsing-online" />
              <span className="text-xs font-bold text-slate-800">
                4,520+ Astrologers Available Live
              </span>
              <span className="text-xs text-amber-600 font-semibold">• 24x7 Instant Access</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Get Answers from India's <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600">
                Most Trusted Astrologers
              </span>
            </h1>

            <p className="text-xs sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
              Consult verified Vedic Acharyas, Jyotishis, and Tarot Scholars vetted through rigorous 4-stage examination. Guaranteed 100% private and confidential birth chart readings.
            </p>

            {/* Primary Action Button (Full-width on mobile thumb zone, minimum 48px touch target) */}
            <div className="pt-1">
              <button
                onClick={handleStartConsultation}
                className="btn-astrotalk w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-extrabold flex items-center justify-center gap-2.5 shadow-md hover:shadow-xl transition transform active:scale-95 cursor-pointer rounded-xl min-h-[48px]"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Chat with Astrologer (FREE 1st Chat) ⚡</span>
              </button>
            </div>

            {/* Clean Micro-Trust Row (Zero False Affordance) */}
            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500 pt-0.5">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                100% Free First Consultation
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                Vedic Coordinates Synced
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                100% Private & Anonymous
              </span>
            </div>

            {/* Harmonious Vedic Query Topic Chips */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                What is your query about?
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {problems.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.label}
                      onClick={() => onQuickTopicSelect(p.label)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-amber-50 border border-amber-200/80 hover:border-amber-400 text-slate-700 hover:text-slate-900 transition shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 min-h-[36px]"
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: High-Converting Live Pandit Spotlight & Real-Time Activity Hub */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white rounded-2xl border border-amber-200/80 p-4 sm:p-6 shadow-at-card relative overflow-hidden flex flex-col justify-between w-full max-w-full">
              
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" />

              {/* Card Header: Live Astrologer Spotlight */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulsing-online" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Top Verified Astrologer Live
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold text-slate-900 shadow-2xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>{featuredPandit.rating}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({(featuredPandit.ordersCount / 1000).toFixed(0)}k)</span>
                </div>
              </div>

              {/* Pandit Profile Snippet */}
              <div className="flex items-center gap-3.5 mb-3.5 w-full overflow-hidden">
                <div className="relative flex-shrink-0 w-16 h-16">
                  <img
                    src={featuredPandit.avatarUrl}
                    alt={featuredPandit.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300 shadow-sm flex-shrink-0"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white pulsing-online" />
                </div>

                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <h3 className="text-base font-extrabold text-slate-900 truncate">
                      {featuredPandit.name}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 truncate mb-1">
                    {featuredPandit.title}
                  </p>
                  <p className="text-[11px] text-amber-800 font-semibold truncate">
                    Speciality: {featuredPandit.specialties.slice(0, 2).join(', ')} • {featuredPandit.experienceYears} Yrs Exp.
                  </p>
                </div>
              </div>

              {/* Instant 1-Click Consultation CTA */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 mb-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full inline-block mb-1">
                    100% FREE FIRST CHAT
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-slate-900">₹0 Free Chat</span>
                    <span className="text-xs text-slate-400 line-through">₹{featuredPandit.originalPrice || 80}/min</span>
                  </div>
                </div>

                <button
                  onClick={handleStartConsultation}
                  className="btn-astrotalk px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md transition active:scale-95 flex-shrink-0 min-h-[44px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Start Chat Now</span>
                </button>
              </div>

              {/* Live Activity Social Proof Ticker */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 flex items-center gap-2 mb-3.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                <span className="truncate font-medium text-[11px] text-slate-600">
                  {LIVE_ACTIVITIES[activeActivityIndex]}
                </span>
              </div>

              {/* Quick Secondary Shortcut to Janam Kundli */}
              {onSelectTab && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Want your birth chart calculated?</span>
                  <button
                    onClick={() => {
                      onSelectTab('kundli');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 transition cursor-pointer"
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
