import React from 'react';
import { 
  MessageSquare, ScrollText, HeartHandshake, Compass, 
  AlertTriangle, PhoneCall, MessageCircle, Zap 
} from 'lucide-react';
import { UserProfile } from '../types/astrotalk';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletBalance: number;
  onOpenWallet: () => void;
  currentUser?: UserProfile | null;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onQuickCall?: () => void;
  onBookConsultation?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onQuickCall,
  onBookConsultation,
}) => {
  const navItems = [
    {
      id: 'astrologers',
      label: 'Pandits',
      icon: MessageSquare,
      badge: 'Live',
      badgeColor: 'bg-emerald-500'
    },
    {
      id: 'kundli',
      label: 'Kundli',
      icon: ScrollText
    },
    {
      id: 'dosh',
      label: 'Dosh',
      icon: AlertTriangle
    },
    {
      id: 'matching',
      label: 'Milan',
      icon: HeartHandshake
    },
    {
      id: 'horoscope',
      label: 'Rashifal',
      icon: Compass
    }
  ];

  const handleCallClick = () => {
    if (onQuickCall) {
      onQuickCall();
    } else {
      setActiveTab('astrologers');
      const el = document.getElementById('astrologers-directory');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookClick = () => {
    if (onBookConsultation) {
      onBookConsultation();
    } else {
      setActiveTab('astrologers');
      const el = document.getElementById('astrologers-directory');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      aria-label="Mobile Bottom Navigation & Quick Actions"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-[0_-6px_24px_rgba(15,23,42,0.1)] select-none pb-safe"
    >
      {/* ─────────────────────────────────────────────────────────────
          ROW 1: Sticky Action Bar (Call, WhatsApp, Book Consultation)
      ─────────────────────────────────────────────────────────────── */}
      <div className="px-2.5 pt-2 pb-1.5 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90 border-b border-slate-100">
        <div className="grid grid-cols-12 gap-1.5 max-w-md mx-auto">
          
          {/* Call Button */}
          <button
            type="button"
            onClick={handleCallClick}
            className="col-span-3 min-h-[44px] rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition cursor-pointer px-2"
            aria-label="Call Astrologer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Call</span>
          </button>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/919876543210?text=Namaste%20AstraVani%2C%20I%20would%20like%20to%20consult%20a%20Vedic%20Pandit%20for%20my%20Kundli."
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-4 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition cursor-pointer px-2"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white/20 flex-shrink-0" />
            <span>WhatsApp</span>
          </a>

          {/* Book Consultation CTA */}
          <button
            type="button"
            onClick={handleBookClick}
            className="col-span-5 min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition cursor-pointer px-2.5"
            aria-label="Book Free Consultation"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950 flex-shrink-0" />
            <span className="truncate">Book Consultation</span>
          </button>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROW 2: Core Vedic Tool Switcher (44px+ Tap Targets)
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-around max-w-md mx-auto px-1 pt-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all cursor-pointer min-h-[46px] rounded-xl ${
                isActive
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-amber-500' : ''}`} />
                {item.badge && (
                  <span className={`absolute -top-1 -right-2 w-2 h-2 rounded-full ${item.badgeColor} ring-2 ring-white animate-pulse`} />
                )}
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight leading-none ${isActive ? 'font-black text-amber-950' : 'text-slate-600'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 bg-amber-500 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

