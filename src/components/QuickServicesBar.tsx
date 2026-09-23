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
      color: 'bg-amber-500 text-white',
      badgeColor: 'bg-red-500 text-white'
    },
    {
      id: 'astrologers-call',
      name: 'Talk to Astrologer',
      tag: 'Call Now',
      icon: PhoneCall,
      color: 'bg-emerald-500 text-white',
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'kundli',
      name: 'Free Janam Kundli',
      tag: 'Instant PDF',
      icon: ScrollText,
      color: 'bg-blue-500 text-white',
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'matching',
      name: 'Kundli Matching',
      tag: '36 Gunas',
      icon: HeartHandshake,
      color: 'bg-pink-500 text-white',
      badgeColor: 'bg-pink-600 text-white'
    },
    {
      id: 'horoscope',
      name: 'Daily Horoscopes',
      tag: 'Today & 2026',
      icon: Compass,
      color: 'bg-purple-500 text-white',
      badgeColor: 'bg-purple-600 text-white'
    },
    {
      id: 'tarot',
      name: 'Tarot Readers',
      tag: 'Card Spread',
      icon: Sparkles,
      color: 'bg-indigo-500 text-white',
      badgeColor: 'bg-indigo-600 text-white'
    },
    {
      id: 'panchang',
      name: 'Today Panchang',
      tag: 'Shubh Muhurat',
      icon: Sun,
      color: 'bg-orange-500 text-white',
      badgeColor: 'bg-orange-600 text-white'
    },
    {
      id: 'astromall',
      name: 'AstroMall Remedies',
      tag: 'Rudraksha',
      icon: ShoppingBag,
      color: 'bg-teal-500 text-white',
      badgeColor: 'bg-teal-600 text-white'
    }
  ];

  return (
    <div className="bg-white border-b border-slate-200 py-4 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar pb-1">
          {services.map((svc) => {
            const IconComponent = svc.icon;
            const isSelected = activeService === svc.id || (svc.id === 'astrologers-call' && activeService === 'astrologers');
            return (
              <button
                key={svc.id}
                onClick={() => onSelectService(svc.id.includes('astrologers') ? 'astrologers' : svc.id)}
                className="flex flex-col items-center min-w-[76px] sm:min-w-[88px] group text-center transition-transform hover:-translate-y-1 focus:outline-none"
              >
                {/* Circular Icon */}
                <div className="relative">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition shadow-sm group-hover:shadow-md ${svc.color} ${
                      isSelected ? 'ring-2 ring-offset-2 ring-amber-500' : ''
                    }`}
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  {/* Badge */}
                  <span className={`absolute -top-1 -right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs uppercase tracking-tight ${svc.badgeColor}`}>
                    {svc.tag}
                  </span>
                </div>

                {/* Name */}
                <span className="mt-2 text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight group-hover:text-amber-600 transition">
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
