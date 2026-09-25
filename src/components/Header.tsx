import React from 'react';
import { Sparkles, Wallet, Search, ShieldCheck, User } from 'lucide-react';
import { UserProfile } from '../types/astrotalk';

interface HeaderProps {
  walletBalance: number;
  onOpenWallet: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser?: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  walletBalance,
  onOpenWallet,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  currentUser,
  onOpenAuth,
  onOpenProfile
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm w-full">
      {/* Top Offer Ribbon */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-900 text-xs sm:text-sm font-semibold py-1.5 px-3 sm:px-4 text-center flex items-center justify-center gap-1.5 sm:gap-2 overflow-hidden">
        <span className="bg-red-600 text-white text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded tracking-wider animate-pulse flex-shrink-0">
          Free Offer
        </span>
        <span className="truncate sm:overflow-visible">
          ⚡ First Chat with Astrologer is FREE! <span className="hidden md:inline">(100% Free First Consultation) | 4,500+ Verified Gurus Online ⚡</span>
        </span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('astrologers')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <span className="text-white text-lg sm:text-xl font-bold">ॐ</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  Astra<span className="text-amber-500">Vani</span>
                </span>
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 fill-emerald-100 flex-shrink-0" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide hidden xl:block">
                India's Sacred Vedic Platform • 4,500+ Verified Gurus
              </p>
            </div>
          </div>

          {/* Navigation Links (Laptop & Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {[
              { id: 'astrologers', label: 'Consult', fullLabel: 'Consult Astrologers', icon: '🔮' },
              { id: 'kundli', label: 'Kundli', fullLabel: 'Free Kundli', icon: '📜' },
              { id: 'matching', label: 'Matching', fullLabel: 'Kundli Matching', icon: '💑' },
              { id: 'horoscope', label: 'Horoscope', fullLabel: 'Horoscopes', icon: '⭐' },
              { id: 'blog', label: 'Blog', fullLabel: 'Vedic Blog', icon: '📖' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === item.id
                    ? 'text-amber-600 bg-amber-50 border border-amber-200/80 shadow-xs'
                    : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
                }`}
              >
                <span>{item.icon}</span>
                <span className="xl:hidden">{item.label}</span>
                <span className="hidden xl:inline">{item.fullLabel}</span>
              </button>
            ))}
          </nav>

          {/* Search Bar - Visible on XL screens to preserve frame balance on laptops */}
          <div className="hidden xl:flex items-center relative w-52 2xl:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search astrologer, skill..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 focus:bg-white text-slate-800 placeholder-slate-400 transition"
            />
          </div>

          {/* Right Action Buttons: Wallet Balance, Recharge & User Cloud Profile */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            
            {/* Wallet Balance Pill */}
            <div className="flex items-center bg-amber-50 border border-amber-200/90 rounded-2xl p-1 gap-1 sm:gap-1.5 shadow-xs">
              <div 
                onClick={onOpenWallet}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 cursor-pointer hover:bg-amber-100/70 rounded-xl transition"
                title="Your AstraVani Wallet Balance"
              >
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">
                  ₹
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono">
                  {walletBalance}
                </span>
              </div>
              <button
                onClick={onOpenWallet}
                className="btn-astrotalk text-white font-bold text-xs px-2 sm:px-3 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1 sm:gap-1.5 cursor-pointer flex-shrink-0"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ Recharge</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>

            {/* Astrotalk User Profile / Login Avatar */}
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-2xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-white transition cursor-pointer shadow-2xs group flex-shrink-0"
                title={`Profile: ${currentUser.fullName}`}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black flex items-center justify-center text-xs shadow-xs flex-shrink-0">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    currentUser.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden md:block text-left max-w-[85px]">
                  <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-extrabold block">● Synced</span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition cursor-pointer shadow-2xs flex-shrink-0"
              >
                <User className="w-3.5 h-3.5 text-amber-700" />
                <span>Login</span>
              </button>
            )}

          </div>

        </div>

      </div>
    </header>
  );
};
