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
      color: 'bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-500 text-white shadow-md',
      badgeColor: 'bg-red-600 text-white shadow-xs animate-pulse',
      isPrimary: true
    },
    {
      id: 'astrologers-call',
      name: 'Talk to Astrologer',
      tag: 'Call Live',
      icon: PhoneCall,
      color: 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md',
      badgeColor: 'bg-emerald-700 text-white shadow-xs',
      isPrimary: true
    },
    {
      id: 'kundli',
      name: 'Free Janam Kundli',
      tag: 'Instant PDF',
      icon: ScrollText,
      color: 'bg-amber-50 border border-amber-200/90 text-amber-800 hover:bg-amber-100 hover:border-amber-300 shadow-2xs',
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'matching',
      name: 'Kundli Matching',
      tag: '36 Gunas',
      icon: HeartHandshake,
      color: 'bg-amber-50 border border-amber-200/90 text-amber-800 hover:bg-amber-100 hover:border-amber-300 shadow-2xs',
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'horoscope',
      name: 'Daily Horoscopes',
      tag: 'Today & 2026',
      icon: Compass,
      color: 'bg-amber-50 border border-amber-200/90 text-amber-800 hover:bg-amber-100 hover:border-amber-300 shadow-2xs',
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'tarot',
      name: 'Tarot Readers',
      tag: 'Card Spread',
      icon: Sparkles,
      color: 'bg-amber-50 border border-amber-200/90 text-amber-800 hover:bg-amber-100 hover:border-amber-300 shadow-2xs',
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'panchang',
      name: 'Today Panchang',
      tag: 'Shubh Muhurat',
      icon: Sun,
      color: 'bg-amber-50 border border-amber-200/90 text-amber-800 hover:bg-amber-100 hover:border-amber-300 shadow-2xs',
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'astromall',
      name: 'AstroMall Remedies',
      tag: 'Rudraksha',
      icon: ShoppingBag,
      color: 'bg-amber-50 border border-amber-200/90 text-amber-800 hover:bg-amber-100 hover:border-amber-300 shadow-2xs',
      badgeColor: 'bg-amber-500 text-white'
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
                onClick={() => onSelectService(svc.id.includes('astrologers') ? 'astrologers' : svc.id)}
                className="flex flex-col items-center min-w-[76px] sm:min-w-[84px] group text-center transition-transform hover:-translate-y-1 focus:outline-none cursor-pointer"
              >
                {/* Circular Icon */}
                <div className="relative">
                  <div
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center transition-all ${svc.color} ${
                      isSelected ? 'ring-2 ring-offset-2 ring-amber-500 scale-105' : 'group-hover:scale-105'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${svc.isPrimary ? 'text-white' : 'text-amber-700 group-hover:text-amber-900'}`} />
                  </div>
                  {/* Badge */}
                  <span className={`absolute -top-1.5 -right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tight ${svc.badgeColor}`}>
                    {svc.tag}
                  </span>
                </div>

                {/* Name - strictly fixed 2-line height for aligned baseline */}
                <span className="mt-2 text-[11px] sm:text-xs font-bold text-slate-800 leading-tight group-hover:text-amber-600 transition h-7 sm:h-8 flex items-center justify-center text-center max-w-[80px]">
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
