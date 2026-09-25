import React from 'react';
import { MessageSquare, ScrollText, HeartHandshake, Compass } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletBalance: number;
  onOpenWallet: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  walletBalance,
  onOpenWallet
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

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 pt-1.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all cursor-pointer min-h-[48px] rounded-xl ${
                isActive
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-amber-500' : ''}`} />
                {item.badge && (
                  <span className={`absolute -top-1 -right-2.5 w-2 h-2 rounded-full ${item.badgeColor} ring-2 ring-white animate-pulse`} />
                )}
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-black text-amber-950' : 'text-slate-600'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 bg-amber-500 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Quick Wallet Action Tab */}
        <button
          onClick={onOpenWallet}
          className="relative flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all cursor-pointer min-h-[48px] text-amber-700 hover:text-amber-800 rounded-xl"
        >
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
              ₹
            </div>
          </div>
          <span className="text-[11px] font-extrabold mt-0.5 tracking-tight text-amber-900">
            ₹{walletBalance}
          </span>
          <span className="text-[8px] font-black text-emerald-600 uppercase">
            Add
          </span>
        </button>
      </div>
    </nav>
  );
};
