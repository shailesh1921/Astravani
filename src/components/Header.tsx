import React from 'react';
import { Sparkles, Wallet, KeyRound, Search, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  walletBalance: number;
  onOpenWallet: () => void;
  onOpenSettings: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  walletBalance,
  onOpenWallet,
  onOpenSettings,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Offer Ribbon */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-900 text-xs sm:text-sm font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <span className="bg-red-600 text-white text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded tracking-wider animate-pulse">
          Free Offer
        </span>
        <span>⚡ First Chat with Astrologer is FREE! (Valid for 5 Mins) | 4,500+ Verified Gurus Online ⚡</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('astrologers')}
            className="flex items-center gap-2.5 cursor-pointer select-none group flex-shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white text-xl font-bold">ॐ</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  Astra<span className="text-amber-500">Vani</span>
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-100" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide hidden sm:block">
                Sacred Vedic Astrology • astravani.in
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {[
              { id: 'astrologers', label: 'Consult Astrologers', icon: '🔮' },
              { id: 'kundli', label: 'Free Kundli', icon: '📜' },
              { id: 'matching', label: 'Kundli Matching', icon: '💑' },
              { id: 'horoscope', label: 'Horoscopes', icon: '⭐' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === item.id
                    ? 'text-amber-600 bg-amber-50 border border-amber-200/80 shadow-xs'
                    : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center relative w-48 lg:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search astrologer, skill..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 focus:bg-white text-slate-800 placeholder-slate-400 transition"
            />
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* AI API Key Button */}
            <button
              onClick={onOpenSettings}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5 border border-slate-200"
              title="Configure OpenAI or Google Gemini API Key"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">AI Settings</span>
            </button>

            {/* Wallet Button */}
            <div className="flex items-center bg-amber-50 border border-amber-200 rounded-xl p-1 gap-1 sm:gap-2">
              <div 
                onClick={onOpenWallet}
                className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-amber-100/60 rounded-lg transition"
              >
                <div className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center text-[10px] font-bold">
                  ₹
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {walletBalance}
                </span>
              </div>
              <button
                onClick={onOpenWallet}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Recharge</span>
              </button>
            </div>

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-2 border-t border-slate-100 no-scrollbar">
          {[
            { id: 'astrologers', label: 'Consult', icon: '🔮' },
            { id: 'kundli', label: 'Kundli', icon: '📜' },
            { id: 'matching', label: 'Matching', icon: '💑' },
            { id: 'horoscope', label: 'Horoscope', icon: '⭐' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition ${
                activeTab === item.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};
