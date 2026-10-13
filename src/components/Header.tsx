import React, { useState } from 'react';
import { 
  Search, ShieldCheck, User, Bell, ChevronDown, Phone, 
  MessageSquare, Compass, ScrollText, HeartHandshake, AlertTriangle, 
  BookOpen, Menu, X, Wallet, Sparkles, ExternalLink
} from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const toggleLanguage = () => {
    setCurrentLang(prev => (prev === 'Eng' ? 'हिन्दी' : 'Eng'));
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs w-full font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          TOP ROW: Logo, Search, Quick Actions, Hamburger (Mobile First)
      ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-[68px] gap-1.5 sm:gap-4">
          
          {/* Left: Mobile Hamburger & Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
            {/* Hamburger Button (Mobile Only: 44x44px Touch Target) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-11 h-11 -ml-1.5 rounded-xl text-slate-700 hover:text-amber-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo & Title */}
            <div 
              onClick={() => handleNavClick('astrologers')}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group min-w-0"
            >
              <div className="relative flex-shrink-0">
                <img 
                  src="/astravani-logo.png" 
                  alt="AstraVani Logo" 
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-400 shadow-xs group-hover:scale-105 transition-transform" 
                  width={44}
                  height={44}
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white pulsing-online" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                    Astra<span className="text-amber-500">Vani</span>
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 fill-emerald-100 flex-shrink-0" />
                </div>
                <p className="hidden sm:flex text-[10px] sm:text-[11px] text-slate-500 font-semibold tracking-wide items-center gap-1 mt-0.5 truncate">
                  <span className="text-amber-600 font-black">25+ Yrs</span>
                  <span>Vedic Trust &amp; Verified Gurus</span>
                </p>
              </div>
            </div>
          </div>

          {/* Center: Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md items-center relative mx-2 lg:mx-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search astrologers, kundli, rashifal..."
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-amber-400 rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm focus:outline-hidden text-slate-800 placeholder-slate-400 shadow-2xs transition"
            />
          </div>

          {/* Right Action Controls: Search Icon (Mobile), Language, Wallet, Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            
            {/* Mobile Search Toggle Icon (44x44px tap target) */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden w-11 h-11 rounded-full text-slate-600 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center transition cursor-pointer"
              aria-label="Toggle mobile search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Toggle (Desktop & Tablet) */}
            <button
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 transition cursor-pointer min-h-[36px]"
              title="Change Language"
            >
              <span>🌐</span>
              <span>{currentLang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Wallet Balance Pill */}
            <div className="flex items-center bg-amber-50 border border-amber-200/90 rounded-full p-0.5 sm:p-1 gap-1 shadow-2xs">
              <button 
                type="button"
                onClick={onOpenWallet}
                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-amber-100/70 transition cursor-pointer min-h-[36px]"
                title="AstraVani Wallet"
                aria-label={`Wallet balance: ₹${walletBalance}`}
              >
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
                  ₹
                </div>
                <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                  {walletBalance}
                </span>
              </button>
              <button
                type="button"
                onClick={onOpenWallet}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] px-2 py-1 rounded-full transition shadow-xs flex items-center gap-1 cursor-pointer min-h-[36px]"
                aria-label="Add funds to wallet"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>

            {/* Profile / Sign In Button */}
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-full border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-white transition cursor-pointer shadow-2xs flex-shrink-0 min-h-[44px]"
                title={`Profile: ${currentUser.fullName}`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black flex items-center justify-center text-xs shadow-xs flex-shrink-0">
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
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 min-h-[40px]"
              >
                <User className="w-3.5 h-3.5 text-slate-900" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>

        {/* Expandable Mobile Search Bar */}
        {isMobileSearchOpen && (
          <div className="md:hidden pb-3 pt-1 animate-in fade-in duration-150">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search astrologer, horoscope, kundli..."
                className="w-full bg-slate-50 border border-amber-300 rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM ROW: Category Navigation Bar (Desktop Scroll)
      ─────────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block border-t border-slate-100 bg-slate-50/70 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 py-2 text-[13px] font-semibold text-slate-700">
            <button
              onClick={() => handleNavClick('astrologers')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'astrologers'
                  ? 'text-amber-700 bg-white shadow-2xs border border-amber-300 font-bold'
                  : 'hover:text-amber-600 hover:bg-white/80'
              }`}
            >
              <span>Home</span>
            </button>

            <button
              onClick={() => handleNavClick('astrologers')}
              className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:text-amber-600 hover:bg-white/80 transition cursor-pointer flex items-center gap-1"
            >
              <span>Consult Now</span>
              <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">Free</span>
            </button>

            <button
              onClick={() => handleNavClick('kundli')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'kundli'
                  ? 'text-amber-700 bg-white shadow-2xs border border-amber-300 font-bold'
                  : 'hover:text-amber-600 hover:bg-white/80'
              }`}
            >
              <span>Free Janam Kundli</span>
            </button>

            <button
              onClick={() => handleNavClick('matching')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'matching'
                  ? 'text-amber-700 bg-white shadow-2xs border border-amber-300 font-bold'
                  : 'hover:text-amber-600 hover:bg-white/80'
              }`}
            >
              <span>Kundli Matching</span>
            </button>

            <button
              onClick={() => handleNavClick('horoscope')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'horoscope'
                  ? 'text-amber-700 bg-white shadow-2xs border border-amber-300 font-bold'
                  : 'hover:text-amber-600 hover:bg-white/80'
              }`}
            >
              <span>Horoscope 2026</span>
            </button>

            <button
              onClick={() => handleNavClick('dosh')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'dosh'
                  ? 'text-amber-700 bg-white shadow-2xs border border-amber-300 font-bold'
                  : 'hover:text-amber-600 hover:bg-white/80'
              }`}
            >
              <span>Dosh &amp; Remedies</span>
            </button>

            <button
              onClick={() => handleNavClick('blog')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'blog'
                  ? 'text-amber-700 bg-white shadow-2xs border border-amber-300 font-bold'
                  : 'hover:text-amber-600 hover:bg-white/80'
              }`}
            >
              <span>Vedic Blog</span>
            </button>

            <button
              onClick={() => handleNavClick('astrologers')}
              className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:bg-white/80 transition cursor-pointer flex items-center gap-1.5 text-slate-700 ml-auto"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 pulsing-online" />
              <span>4,500+ Gurus Live</span>
              <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">Watch</span>
            </button>
          </nav>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SMOOTH SLIDE-IN MOBILE DRAWER (44px+ Tap Targets, Safe Height)
      ─────────────────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Body (100dvh safe height, slide from left) */}
          <div className="relative w-4/5 max-w-xs bg-white h-dvh flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-250 border-r border-slate-200">
            
            {/* Drawer Top Header */}
            <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <img 
                  src="/astravani-logo.png" 
                  alt="AstraVani" 
                  className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs" 
                />
                <div>
                  <h3 className="font-black text-base leading-tight">AstraVani</h3>
                  <p className="text-[10px] font-semibold text-slate-900">Vedic Astrology Platform</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-slate-950 transition cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Quick Info in Drawer */}
            <div className="p-4 bg-amber-50/70 border-b border-amber-200/80 flex items-center justify-between">
              {currentUser ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-black flex items-center justify-center text-sm shadow-xs">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.phone || currentUser.email}</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); onOpenAuth(); }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer min-h-[44px]"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                </button>
              )}
            </div>

            {/* Navigation Directory Links (44px+ minimum tap heights) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {[
                { id: 'astrologers', label: 'Home & Astrologers', icon: MessageSquare, badge: 'Live Free' },
                { id: 'kundli', label: 'Free Janam Kundli', icon: ScrollText, badge: 'Instant PDF' },
                { id: 'matching', label: 'Kundli Milan (36 Gunas)', icon: HeartHandshake, badge: 'Marriage' },
                { id: 'horoscope', label: 'Daily Horoscope 2026', icon: Compass, badge: 'Rashifal' },
                { id: 'dosh', label: 'Dosh & Upay Encyclopedia', icon: AlertTriangle, badge: 'Remedies' },
                { id: 'blog', label: 'Vedic Knowledge Blog', icon: BookOpen },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm font-bold transition min-h-[48px] cursor-pointer ${
                      isActive 
                        ? 'bg-amber-100/70 text-amber-900 font-black' 
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <hr className="my-2 border-slate-100" />

              {/* Language Switcher in Drawer */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 min-h-[44px]">
                <span className="text-xs font-bold text-slate-700">App Language:</span>
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-black text-amber-700 shadow-2xs"
                >
                  🌐 {currentLang} (Tap to change)
                </button>
              </div>

              {/* Wallet Direct Access */}
              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); onOpenWallet(); }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-900 text-xs font-bold min-h-[48px] cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-5 h-5 text-amber-600" />
                  <span>Wallet Balance</span>
                </div>
                <span className="font-black font-mono text-sm">₹{walletBalance} (Add +)</span>
              </button>
            </div>

            {/* Drawer Bottom Trust Seal */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-center pb-safe">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Private • Verified Jyotishacharyas</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};

export default Header;
