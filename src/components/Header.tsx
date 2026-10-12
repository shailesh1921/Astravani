import React, { useState } from 'react';
import { Sparkles, Wallet, Search, ShieldCheck, User, Bell, ChevronDown, Phone, MessageSquare, Compass, ScrollText, HeartHandshake, AlertTriangle, BookOpen } from 'lucide-react';
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
  const [currentLang, setCurrentLang] = useState<'Eng' | 'हिन्दी'>('Eng');
  const [consultDropdownOpen, setConsultDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    setCurrentLang(prev => (prev === 'Eng' ? 'हिन्दी' : 'Eng'));
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs w-full font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          TOP ROW: Logo, Brand Trust, Search, Language, Alerts, Profile & Wallet
      ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px] gap-2 sm:gap-4">
          
          {/* Brand Logo & Trust Tagline */}
          <div 
            onClick={() => setActiveTab('astrologers')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group flex-shrink-0"
          >
            <div className="relative">
              <img 
                src="/astravani-logo.png" 
                alt="AstraVani Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-amber-400 shadow-md group-hover:scale-105 transition-transform flex-shrink-0" 
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white pulsing-online" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Astra<span className="text-amber-500">Vani</span>
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100 flex-shrink-0" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold tracking-wide flex items-center gap-1">
                <span className="text-amber-600 font-extrabold">25+ Yrs</span>
                <span>Vedic Trust &amp; Verified Gurus</span>
              </p>
            </div>
          </div>

          {/* Central Search Bar (Astroyogi Style) */}
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg items-center relative mx-2 lg:mx-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search astrologer, horoscope, kundli, remedies..."
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-amber-400 rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm focus:outline-hidden text-slate-800 placeholder-slate-400 shadow-2xs transition"
            />
          </div>

          {/* Right Action Icons: Language, Notifications, Wallet, Sign In */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Language Toggle Pill */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 transition cursor-pointer"
              title="Change Language"
            >
              <span>🌐</span>
              <span>{currentLang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Notification Bell with Badge */}
            <div className="relative hidden sm:block">
              <button 
                onClick={() => onOpenWallet()}
                className="w-9 h-9 rounded-full bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 flex items-center justify-center text-slate-600 hover:text-amber-600 transition cursor-pointer"
                title="Notifications: First Consultation 100% Free"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              </button>
            </div>

            {/* Wallet Balance Pill */}
            <div className="flex items-center bg-amber-50 border border-amber-200 rounded-full p-1 gap-1 shadow-2xs">
              <div 
                onClick={onOpenWallet}
                className="flex items-center gap-1 px-2 py-0.5 cursor-pointer hover:bg-amber-100/70 rounded-full transition"
                title="AstraVani Wallet"
              >
                <div className="w-4.5 h-4.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
                  ₹
                </div>
                <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                  {walletBalance}
                </span>
              </div>
              <button
                onClick={onOpenWallet}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-[11px] sm:text-xs px-2.5 py-1 rounded-full transition shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Wallet className="w-3 h-3" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>

            {/* Sign In Button / User Profile */}
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-white transition cursor-pointer shadow-2xs group flex-shrink-0"
                title={`Profile: ${currentUser.fullName}`}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black flex items-center justify-center text-xs shadow-xs flex-shrink-0">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    currentUser.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="hidden md:inline text-xs font-bold text-slate-800">
                  {currentUser.fullName.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-slate-900" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM ROW: Astroyogi Category Navigation Bar (Desktop & Mobile Scroll)
      ─────────────────────────────────────────────────────────────── */}
      <div className="border-t border-slate-100 bg-slate-50/70 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2 text-xs sm:text-[13px] font-semibold text-slate-700">
            
            {/* Home */}
            <button
              onClick={() => setActiveTab('astrologers')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'astrologers'
                  ? 'text-amber-700 bg-white shadow-2xs border border-amber-300 font-bold'
                  : 'hover:text-amber-600 hover:bg-white/80'
              }`}
            >
              <span>Home</span>
            </button>

            {/* Consult Now (Dropdown) */}
            <div className="relative">
              <button
                onClick={() => {
                  setActiveTab('astrologers');
                  setConsultDropdownOpen(!consultDropdownOpen);
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'astrologers' && !consultDropdownOpen
                    ? 'text-amber-700 bg-white font-bold'
                    : 'hover:text-amber-600 hover:bg-white/80'
                }`}
              >
                <span>Consult Now</span>
                <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">Free</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Horoscope 2026 */}
            <button
              onClick={() => setActiveTab('horoscope')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'horoscope'
                  ? 'text-amber-700 bg-white shadow-2xs border border-amber-300 font-bold'
                  : 'hover:text-amber-600 hover:bg-white/80'
              }`}
            >
              <span>Horoscope 2026</span>
            </button>

            {/* Kundli */}
            <button
              onClick={() => setActiveTab('kundli')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'kundli'
                  ? 'text-amber-700 bg-white shadow-2xs border border-amber-300 font-bold'
                  : 'hover:text-amber-600 hover:bg-white/80'
              }`}
            >
              <span>Free Janam Kundli</span>
            </button>

            {/* Kundli Matching */}
            <button
              onClick={() => setActiveTab('matching')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'matching'
                  ? 'text-amber-700 bg-white shadow-2xs border border-amber-300 font-bold'
                  : 'hover:text-amber-600 hover:bg-white/80'
              }`}
            >
              <span>Kundli Matching</span>
            </button>

            {/* Dosh Encyclopedia */}
            <button
              onClick={() => setActiveTab('dosh')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'dosh'
                  ? 'text-amber-700 bg-white shadow-2xs border border-amber-300 font-bold'
                  : 'hover:text-amber-600 hover:bg-white/80'
              }`}
            >
              <span>Dosh &amp; Remedies</span>
            </button>

            {/* Vedic Blog */}
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'blog'
                  ? 'text-amber-700 bg-white shadow-2xs border border-amber-300 font-bold'
                  : 'hover:text-amber-600 hover:bg-white/80'
              }`}
            >
              <span>Vedic Blog</span>
            </button>

            {/* Live Astrologers Badge */}
            <button
              onClick={() => setActiveTab('astrologers')}
              className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:bg-white/80 transition cursor-pointer flex items-center gap-1.5 text-slate-700"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 pulsing-online" />
              <span>Gurus Live</span>
              <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">Watch</span>
            </button>

          </nav>
        </div>
      </div>

    </header>
  );
};
