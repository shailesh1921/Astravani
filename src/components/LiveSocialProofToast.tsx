import React, { useState, useEffect } from 'react';
import { ShieldCheck, Star, Zap, MessageSquare, X } from 'lucide-react';

interface SocialProofEvent {
  id: string;
  name: string;
  city: string;
  action: string;
  target: string;
  timeAgo: string;
  avatar: string;
  type: 'consultation' | 'recharge' | 'review' | 'free_trial';
  rating?: number;
}

const LIVE_EVENTS: SocialProofEvent[] = [
  {
    id: 'e1',
    name: 'Pooja Sharma',
    city: 'Pune',
    action: 'Started consultation with',
    target: 'Pt. Anand Swaroop',
    timeAgo: 'Just now',
    avatar: '/astrologers/pandit-anand-swaroop.jpg',
    type: 'consultation'
  },
  {
    id: 'e2',
    name: 'Rahul Verma',
    city: 'New Delhi',
    action: 'Recharged wallet with',
    target: '₹250 Pack (100% Extra Added)',
    timeAgo: '14s ago',
    avatar: '/astrologers/dr-radhika-sharma.jpg',
    type: 'recharge'
  },
  {
    id: 'e3',
    name: 'Vikram Shekhawat',
    city: 'Jaipur',
    action: 'Rated 5.0 ★ for',
    target: 'Acharya Raman Shastri',
    timeAgo: '28s ago',
    avatar: '/astrologers/acharya-raman.jpg',
    type: 'review',
    rating: 5
  },
  {
    id: 'e4',
    name: 'Sneha Rao',
    city: 'Bengaluru',
    action: 'Unlocked 1-Min Free Chat with',
    target: 'Tarot Sunita Sen',
    timeAgo: '42s ago',
    avatar: '/astrologers/tarot-sunita.jpg',
    type: 'free_trial'
  },
  {
    id: 'e5',
    name: 'Manoj Pandey',
    city: 'Varanasi',
    action: 'Consulting regarding Lal Kitab Upay with',
    target: 'Pt. Kashi Nath Dixit',
    timeAgo: '1m ago',
    avatar: '/astrologers/pandit-kashi-nath.jpg',
    type: 'consultation'
  },
  {
    id: 'e6',
    name: 'Neha Dhillon',
    city: 'Amritsar',
    action: 'Rated 5.0 ★ — "Predicted relationship exact timeline" for',
    target: 'Tarot Simran Kaur',
    timeAgo: '1m ago',
    avatar: '/astrologers/tarot-simran-kaur.jpg',
    type: 'review',
    rating: 5
  },
  {
    id: 'e7',
    name: 'Karthik Subramanian',
    city: 'Chennai',
    action: 'Completed Nadi consultation with',
    target: 'Smt. Meenakshi Iyer',
    timeAgo: '2m ago',
    avatar: '/astrologers/meenakshi-iyer.jpg',
    type: 'consultation'
  }
];

export const LiveSocialProofToast: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Show first toast after 4 seconds
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 3500);

    // Cycle every 8.5 seconds (display 5.5s, pause 3s)
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
        setIsVisible(true);
      }, 700);

    }, 8500);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  const currentEvent = LIVE_EVENTS[currentIndex];

  return (
    <aside
      aria-label="Live recent consultation updates"
      className={`fixed left-3 sm:left-6 bottom-20 sm:bottom-6 z-40 max-w-[340px] sm:max-w-[360px] w-full transition-all duration-500 ease-out pointer-events-auto ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border border-amber-300/80 rounded-2xl p-3 shadow-xl flex items-center gap-3 relative group overflow-hidden">
        {/* Top Gold Highlight Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" />

        {/* Astrologer / Activity Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={currentEvent.avatar}
            alt={currentEvent.target}
            className="w-11 h-11 rounded-xl object-cover border border-amber-300 shadow-xs"
          />
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white pulsing-online" />
        </div>

        {/* Event Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-xs font-black text-slate-900 truncate">
              {currentEvent.name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">({currentEvent.city})</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          </div>

          <p className="text-[11px] text-slate-600 truncate mt-1">
            <span>{currentEvent.action} </span>
            <strong className="text-amber-800 font-bold">{currentEvent.target}</strong>
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {currentEvent.timeAgo}
            </span>
            <span className="text-[10px] text-slate-400">• Verified Consultation</span>
          </div>
        </div>

        {/* Close / Dismiss Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-700 rounded-full transition cursor-pointer"
          title="Dismiss updates"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
