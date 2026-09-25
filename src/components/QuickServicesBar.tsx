import React from 'react';
import { MessageSquare, PhoneCall, ScrollText, HeartHandshake, Compass, Sparkles, Sun, ShoppingBag } from 'lucide-react';

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
      tag: 'FREE 1st Chat',
      icon: MessageSquare,
      bgGradient: 'from-amber-500 via-orange-500 to-amber-600',
      shadowColor: 'shadow-amber-500/35',
      badgeBg: 'bg-red-600 text-white animate-pulse',
      ringColor: 'ring-amber-500',
    },
    {
      id: 'astrologers-call',
      name: 'Talk to Astrologer',
      tag: 'Call Live',
      icon: PhoneCall,
      bgGradient: 'from-emerald-500 via-teal-500 to-emerald-600',
      shadowColor: 'shadow-emerald-500/35',
      badgeBg: 'bg-emerald-700 text-white',
      ringColor: 'ring-emerald-500',
    },
    {
      id: 'kundli',
      name: 'Free Janam Kundli',
      tag: 'Instant PDF',
      icon: ScrollText,
      bgGradient: 'from-blue-600 via-indigo-600 to-violet-700',
      shadowColor: 'shadow-indigo-500/35',
      badgeBg: 'bg-indigo-700 text-white',
      ringColor: 'ring-indigo-500',
    },
    {
      id: 'matching',
      name: 'Kundli Matching',
      tag: '36 Gunas',
      icon: HeartHandshake,
      bgGradient: 'from-rose-500 via-pink-600 to-red-500',
      shadowColor: 'shadow-rose-500/35',
      badgeBg: 'bg-rose-700 text-white',
      ringColor: 'ring-rose-500',
    },
    {
      id: 'horoscope',
      name: 'Daily Horoscopes',
      tag: 'Today 2026',
      icon: Compass,
      bgGradient: 'from-purple-600 via-violet-600 to-fuchsia-600',
      shadowColor: 'shadow-purple-500/35',
      badgeBg: 'bg-purple-700 text-white',
      ringColor: 'ring-purple-500',
    },
    {
      id: 'tarot',
      name: 'Tarot Readers',
      tag: 'Card Spread',
      icon: Sparkles,
      bgGradient: 'from-cyan-600 via-sky-600 to-blue-700',
      shadowColor: 'shadow-cyan-500/35',
      badgeBg: 'bg-cyan-700 text-white',
      ringColor: 'ring-cyan-500',
    },
    {
      id: 'panchang',
      name: 'Today Panchang',
      tag: 'Shubh Muhurat',
      icon: Sun,
      bgGradient: 'from-amber-400 via-amber-500 to-orange-600',
      shadowColor: 'shadow-amber-500/35',
      badgeBg: 'bg-amber-700 text-white',
      ringColor: 'ring-amber-500',
    },
    {
      id: 'astromall',
      name: 'AstroMall Remedies',
      tag: 'Rudraksha',
      icon: ShoppingBag,
      bgGradient: 'from-red-600 via-rose-700 to-amber-700',
      shadowColor: 'shadow-red-600/35',
      badgeBg: 'bg-red-800 text-white',
      ringColor: 'ring-red-600',
    }
  ];

  return (
    <div className="bg-white border-b border-slate-200 py-3.5 shadow-2xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-1">
          {services.map((svc) => {
            const IconComponent = svc.icon;
            const isSelected = activeService === svc.id || (svc.id === 'astrologers-call' && activeService === 'astrologers');
            return (
              <button
                key={svc.id}
                onClick={() => onSelectService(svc.id)}
                className="flex flex-col items-center min-w-[76px] sm:min-w-[84px] group text-center transition-transform hover:-translate-y-1 focus:outline-none cursor-pointer"
              >
                {/* 3D Jewel Icon Container */}
                <div className="relative">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all bg-gradient-to-br ${svc.bgGradient} shadow-md ${svc.shadowColor} border border-white/30 relative overflow-hidden ${
                      isSelected ? `ring-2 ring-offset-2 ${svc.ringColor} scale-105 shadow-lg` : 'group-hover:scale-105 group-hover:shadow-lg'
                    }`}
                  >
                    {/* Top-glass highlight reflection */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/35 pointer-events-none rounded-2xl" />
                    
                    {/* Solid Crisp White Icon */}
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-xs relative z-10" />
                  </div>

                  {/* Micro Badge */}
                  <span className={`absolute -top-1.5 -right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tight shadow-xs whitespace-nowrap z-20 ${svc.badgeBg}`}>
                    {svc.tag}
                  </span>
                </div>

                {/* Name - strictly fixed 2-line height for aligned baseline */}
                <span className="mt-2 text-[11px] sm:text-xs font-bold text-slate-800 leading-tight group-hover:text-amber-600 transition h-7 sm:h-8 flex items-center justify-center text-center max-w-[82px]">
                  {svc.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
