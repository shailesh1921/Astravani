import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Zap, CheckCircle2, Sparkles, Star } from 'lucide-react';
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
    <div className="relative bg-gradient-to-b from-amber-50/40 via-white to-slate-50/50 border-b border-slate-200/80 pt-5 pb-10 sm:pt-10 sm:pb-16 overflow-hidden w-full max-w-full">
      
      {/* Soft Radial Ambient Glows (Clipped within overflow-hidden container) */}
      <div className="absolute top-0 right-0 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 sm:w-96 h-60 sm:h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN: Headline, Value Prop & Big Mobile-Friendly CTA
          ─────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
            
            {/* Top Astroyogi #1 Platform Badge (Wraps cleanly without overflow) */}
            <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 bg-amber-50 border border-amber-300 rounded-full px-3 py-1 shadow-2xs max-w-full">
              <span className="text-amber-600 font-extrabold text-[11px] sm:text-xs">✨ #1 Vedic Platform</span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-emerald-700 font-extrabold text-[11px] sm:text-xs">4,500+ Verified Gurus</span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-amber-700 font-bold text-[10px] sm:text-xs">100% Private</span>
            </div>

            {/* Emotional Lifestyle Headline with fluid mobile sizing */}
            <div className="min-h-[72px] sm:min-h-[110px] flex flex-col justify-center">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.18] sm:leading-[1.12]">
                {activeHeadline.title}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 block sm:inline">
                  {activeHeadline.highlight}
                </span>
              </h1>
            </div>

            {/* Subtitle / Value Proposition */}
            <p className="text-xs sm:text-base text-slate-600 leading-relaxed max-w-xl font-medium">
              {activeHeadline.subtext}
            </p>

            {/* CTA Buttons: Full-width on mobile, flex row on tablet/desktop */}
            <div className="pt-1 sm:pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={handleStartConsultation}
                  className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 bg-amber-400 hover:bg-amber-500 text-slate-950 text-sm sm:text-lg font-black rounded-full shadow-[0_8px_24px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_28px_rgba(245,158,11,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer group min-h-[48px]"
                >
                  <Zap className="w-5 h-5 fill-slate-900 text-slate-900 flex-shrink-0" />
                  <span>{ctaLabel || 'Consult for FREE'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </button>

                {/* Secondary 1-Tap Free Kundli Button */}
                {onSelectTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('kundli');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 bg-white hover:bg-amber-50 border border-slate-300 hover:border-amber-400 text-slate-800 text-xs sm:text-sm font-extrabold rounded-full transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                  >
                    <span>📜 Free Janam Kundli</span>
                  </button>
                )}
              </div>

              {/* Free Trial Trust Indicator */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>⚡ First 5 Mins 100% FREE • Instant Live Connect • No Credit Card</span>
              </div>
            </div>

            {/* Trust Badges Bar (Responsive wrap) */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-slate-600 pt-2.5 border-t border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Verified Gurus</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>5+ Cr Consultations</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-emerald-600 font-extrabold text-sm">₹</span>
                <span>Instant Wallet Refund</span>
              </div>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT COLUMN: High-Quality Lifestyle Visual + Live Pandit Pill
          ─────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 w-full relative mt-2 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Lifestyle Image Container */}
              <div className="relative bg-white rounded-3xl overflow-hidden border-2 border-amber-200 shadow-md">
                
                {/* Responsive Image with set Aspect Ratio */}
                <div className="relative aspect-[16/10] sm:aspect-[16/11] w-full overflow-hidden bg-amber-100">
                  <img
                    src="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=800&q=80"
                    alt="Happy couple consulting astrologer online"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                    width={800}
                    height={500}
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                  {/* Top Badge: Free Consultation Tag */}
                  <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Free First Consultation</span>
                  </div>

                  {/* Bottom Image Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Empowering Indian Relationships
                    </p>
                    <p className="text-xs sm:text-sm font-black truncate">
                      Consult directly with India's top Jyotish Gurus 24/7
                    </p>
                  </div>
                </div>

                {/* Attached Live Guru Spotlight Snippet */}
                <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={featuredPandit.avatarUrl}
                        alt={featuredPandit.name}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-400"
                        width={44}
                        height={44}
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white pulsing-online" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                          {featuredPandit.name}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 truncate font-medium">
                        {featuredPandit.specialties.slice(0, 2).join(', ')} • {featuredPandit.experienceYears}+ Yrs
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onInitiateChat && onInitiateChat(featuredPandit)}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-3 sm:px-4 py-2 rounded-xl transition shadow-xs flex-shrink-0 cursor-pointer min-h-[40px] flex items-center gap-1"
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

export default HeroBanner;
