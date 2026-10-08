import React from 'react';
import { MessageSquare, PhoneCall, ScrollText, HeartHandshake, Compass, Sparkles, Sun, ShoppingBag, BookOpen } from 'lucide-react';

interface QuickServicesBarProps {
  onSelectService: (serviceId: string) => void;
  activeService: string;
}

export const QuickServicesBar: React.FC<QuickServicesBarProps> = ({
  onSelectService,
  activeService
}) => {
  const services = [
    {
      id: 'astrologers',
      name: 'Chat with Astrologer',
      tag: 'Instant Chat',
      icon: MessageSquare,
      bgGradient: 'from-amber-500 via-orange-500 to-amber-600',
      shadowColor: 'shadow-amber-500/30',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
      ringColor: 'ring-amber-500',
    },
    {
      id: 'astrologers-call',
      name: 'Talk to Astrologer',
      tag: 'Call Live',
      icon: PhoneCall,
      bgGradient: 'from-emerald-500 via-teal-500 to-emerald-600',
      shadowColor: 'shadow-emerald-500/30',
      badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
      ringColor: 'ring-emerald-500',
    },
    {
      id: 'kundli',
      name: 'Free Janam Kundli',
      tag: 'Instant PDF',
      icon: ScrollText,
      bgGradient: 'from-blue-600 via-indigo-600 to-violet-700',
      shadowColor: 'shadow-indigo-500/30',
      badgeBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
      ringColor: 'ring-indigo-500',
    },
    {
      id: 'matching',
      name: 'Kundli Matching',
      tag: '36 Gunas',
      icon: HeartHandshake,
      bgGradient: 'from-rose-500 via-pink-600 to-red-500',
      shadowColor: 'shadow-rose-500/30',
      badgeBg: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white',
      ringColor: 'ring-rose-500',
    },
    {
      id: 'horoscope',
      name: 'Daily Horoscopes',
      tag: 'Today 2026',
      icon: Compass,
      bgGradient: 'from-purple-600 via-violet-600 to-fuchsia-600',
      shadowColor: 'shadow-purple-500/30',
      badgeBg: 'bg-gradient-to-r from-purple-600 to-violet-600 text-white',
      ringColor: 'ring-purple-500',
    },
    {
      id: 'tarot',
      name: 'Tarot Readers',
      tag: 'Card Spread',
      icon: Sparkles,
      bgGradient: 'from-cyan-600 via-sky-600 to-blue-700',
      shadowColor: 'shadow-cyan-500/30',
      badgeBg: 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white',
      ringColor: 'ring-cyan-500',
    },
    {
      id: 'panchang',
      name: 'Today Panchang',
      tag: 'Shubh Muhurat',
      icon: Sun,
      bgGradient: 'from-amber-400 via-amber-500 to-orange-600',
      shadowColor: 'shadow-amber-500/30',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white',
      ringColor: 'ring-amber-500',
    },
    {
      id: 'blog',
      name: 'Vedic Blog & Upay',
      tag: 'Dosh Nivaran',
      icon: BookOpen,
      bgGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
      shadowColor: 'shadow-teal-500/30',
      badgeBg: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
      ringColor: 'ring-emerald-500',
    },
    {
      id: 'astromall',
      name: 'AstroMall Remedies',
      tag: 'Rudraksha',
      icon: ShoppingBag,
      bgGradient: 'from-red-600 via-rose-700 to-amber-700',
      shadowColor: 'shadow-red-600/30',
      badgeBg: 'bg-gradient-to-r from-rose-600 to-red-600 text-white',
      ringColor: 'ring-red-600',
    }
  ];

  return (
    <div className="bg-gradient-to-b from-white via-amber-50/20 to-white border-b border-slate-200/90 py-2.5 sm:py-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] select-none relative z-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-start justify-start lg:justify-between gap-2.5 sm:gap-4 lg:gap-2 overflow-x-auto no-scrollbar pt-3.5 pb-1.5 px-1">
          {services.map((svc) => {
            const IconComponent = svc.icon;
            const isSelected = activeService === svc.id;
            return (
              <button
                key={svc.id}
                onClick={() => onSelectService(svc.id)}
                className="flex flex-col items-center flex-1 min-w-[76px] sm:min-w-[88px] max-w-[98px] group text-center transition-all duration-200 focus:outline-none cursor-pointer"
              >
                {/* 3D Jewel Icon Container */}
                <div className="relative flex flex-col items-center mt-1">
                  {/* Symmetrically Centered Micro Badge - Never clipped, all letters 100% visible */}
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[8.5px] sm:text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs whitespace-nowrap z-20 border border-white/95 leading-normal flex items-center justify-center ${svc.badgeBg}`}>
                    {svc.tag}
                  </span>

                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 bg-gradient-to-br ${svc.bgGradient} shadow-md ${svc.shadowColor} border-2 border-white/80 relative overflow-hidden ${
                      isSelected 
                        ? `ring-2 ring-offset-2 ${svc.ringColor} scale-105 shadow-lg` 
                        : 'group-hover:scale-105 group-hover:-translate-y-0.5 group-hover:shadow-lg'
                    }`}
                  >
                    {/* Top-glass highlight reflection */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/40 pointer-events-none rounded-2xl" />
                    
                    {/* Radial light glint */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/30 blur-[2px] pointer-events-none" />
                    
                    {/* Solid Crisp White Icon */}
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm relative z-10 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>

                {/* Name - strictly aligned 2-line baseline */}
                <span className={`mt-2 text-[11px] sm:text-xs font-bold leading-tight transition-colors h-7 sm:h-8 flex items-center justify-center text-center max-w-[84px] sm:max-w-[94px] px-0.5 ${
                  isSelected ? 'text-amber-600 font-extrabold' : 'text-slate-700 group-hover:text-amber-600'
                }`}>
                  {svc.name}
                </span>

                {/* Active Indicator Dot */}
                {isSelected ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shadow-xs animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-transparent mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
