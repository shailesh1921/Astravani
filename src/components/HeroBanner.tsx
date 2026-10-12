import React, { useState, useEffect } from 'react';
import { ShieldCheck, Heart, Briefcase, Gem, Users, CheckCircle2, Sparkles, ArrowRight, Zap, Star } from 'lucide-react';
import { Astrologer } from '../types/astrotalk';
import { ASTROLOGERS_DATA } from '../data/astrologersData';

interface HeroBannerProps {
  onQuickTopicSelect: (topic: string) => void;
  onExploreAstrologers: () => void;
  onInitiateChat?: (astrologer: Astrologer) => void;
  onSelectTab?: (tab: string) => void;
  topAstrologer?: Astrologer;
  ctaLabel?: string;
}

const HEADLINE_ROTATOR = [
  {
    title: 'Enjoy your relationship,',
    highlight: "don't stress over it",
    topic: 'Love & Relationship',
    subtext: 'Get 100% accurate Kundli Milan, love compatibility & marital harmony remedies from India’s top Vedic Gurus.'
  },
  {
    title: 'Stuck in your career?',
    highlight: 'Find the right timing',
    topic: 'Career & Job Promotion',
    subtext: 'Discover favorable Mahadasha periods for job change, promotion, and business growth through Vedic Jyotish.'
  },
  {
    title: 'Marriage delayed?',
    highlight: 'Unlock easy Vedic Upay',
    topic: 'Marriage Timing',
    subtext: 'Resolve Manglik Dosha, Nadi Dosha, and planetary hurdles with 100% genuine Vedic gemstone & pooja remedies.'
  }
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onQuickTopicSelect,
  onExploreAstrologers,
  onInitiateChat,
  onSelectTab,
  topAstrologer,
  ctaLabel
}) => {
  const featuredPandit = topAstrologer || ASTROLOGERS_DATA[0];
  const [headlineIndex, setHeadlineIndex] = useState(0);

  // Rotate headline every 6 seconds for gentle emotional engagement
  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % HEADLINE_ROTATOR.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const activeHeadline = HEADLINE_ROTATOR[headlineIndex];

  const handleStartConsultation = () => {
    if (onInitiateChat && featuredPandit) {
      onInitiateChat(featuredPandit);
    } else {
      onExploreAstrologers();
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-amber-50/40 via-white to-slate-50/50 border-b border-slate-200/80 pt-8 pb-14 sm:pt-12 sm:pb-20 overflow-hidden">
      
      {/* Astroyogi Warm Radial Aura Accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN (60%): Headline, Value Prop & Big Yellow CTA
          ─────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            {/* Top Astroyogi #1 Platform Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-full px-3.5 py-1 shadow-2xs">
              <span className="text-amber-600 font-extrabold text-xs">✨ #1</span>
              <span className="text-xs font-black text-slate-800 tracking-wide">
                India's Sacred Vedic Astrology Platform
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-700 font-bold text-xs">4,500+ Verified Gurus</span>
            </div>

            {/* Emotional Lifestyle Headline (Astroyogi Style) */}
            <div className="min-h-[90px] sm:min-h-[120px] flex flex-col justify-center">
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.12]">
                {activeHeadline.title}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 block sm:inline">
                  {activeHeadline.highlight}
                </span>
              </h1>
            </div>

            {/* Subtitle / Value Proposition */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-medium">
              {activeHeadline.subtext}
            </p>

            {/* Large Yellow/Amber "Consult for FREE >" Button (Astroyogi Style) */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleStartConsultation}
                  className="px-8 sm:px-10 py-4 bg-amber-400 hover:bg-amber-500 text-slate-950 text-base sm:text-lg font-black rounded-full shadow-[0_8px_24px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_28px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <Zap className="w-5 h-5 fill-slate-900 text-slate-900" />
                  <span>{ctaLabel || 'Consult for FREE'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Secondary 1-Tap Kundli Button */}
                {onSelectTab && (
                  <button
                    onClick={() => {
                      onSelectTab('kundli');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-4 bg-white hover:bg-amber-50 border border-slate-300 hover:border-amber-400 text-slate-800 text-sm font-extrabold rounded-full transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📜 Free Janam Kundli</span>
                  </button>
                )}
              </div>

              {/* Trust Indicators */}
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>⚡ First 5 Mins 100% FREE • 100% Private &amp; Encrypted • No Hidden Charges</span>
              </p>
            </div>

            {/* Trust Badges Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 pt-3 border-t border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>100% Verified Scholars</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>5+ Crore Happy Clients</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-emerald-500 font-extrabold text-sm">₹</span>
                <span>Instant Wallet Refund</span>
              </div>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT COLUMN (40%): High-Converting Lifestyle Photo + Live Guru Card
          ─────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 w-full relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Background Circular Aura Frame */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-orange-400/10 to-amber-200/30 rounded-3xl transform rotate-2 scale-102 blur-xs pointer-events-none" />

              {/* Lifestyle Image Container */}
              <div className="relative bg-white rounded-3xl overflow-hidden border-2 border-amber-200 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
                
                {/* High-Quality Emotional Lifestyle Couple Image */}
                <div className="relative h-64 sm:h-76 w-full overflow-hidden bg-gradient-to-b from-amber-100 to-amber-50">
                  <img
                    src="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=800&q=80"
                    alt="Happy couple consulting astrologer online"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Top Badge: Free Consultation Tag */}
                  <div className="absolute top-3.5 left-3.5 bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Free First Consultation</span>
                  </div>

                  {/* Bottom Image Overlay: Live Astrologer Connect Preview */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Empowering Indian Relationships
                    </p>
                    <p className="text-sm font-black truncate">
                      Consult directly with India's top Jyotish Gurus 24/7
                    </p>
                  </div>
                </div>

                {/* Attached Live Guru Spotlight Snippet */}
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 flex-shrink-0">
                      <img
                        src={featuredPandit.avatarUrl}
                        alt={featuredPandit.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white pulsing-online" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="text-sm font-extrabold text-slate-900 truncate">
                          {featuredPandit.name}
                        </h4>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 flex-shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {featuredPandit.specialties.slice(0, 2).join(', ')} • {featuredPandit.experienceYears} Yrs Exp.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleStartConsultation}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                  >
                    <span>Chat Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
