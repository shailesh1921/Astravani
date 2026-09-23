import React, { useState } from 'react';
import { Menu, X, ArrowRight, Globe } from 'lucide-react';
import { AstrologicalTradition, SupportedLanguage } from '../types/astrology';

interface NavbarProps {
  onOpenChartModal: () => void;
  onOpenChat: () => void;
  currentTradition: AstrologicalTradition;
  onChangeTradition: (t: AstrologicalTradition) => void;
  currentLanguage: SupportedLanguage;
  onChangeLanguage: (l: SupportedLanguage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenChartModal,
  onOpenChat,
  currentTradition,
  onChangeTradition,
  currentLanguage,
  onChangeLanguage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo with primenumbers.in signature 2x3 dot grid */}
        <a href="#" className="flex items-center gap-3">
          {/* 2x3 Dot Matrix Icon */}
          <div className="grid grid-cols-2 gap-1 w-5 h-6">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="w-2 h-2 rounded-full bg-[#FF552E]" />
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0F172A] font-sans">
            astra<span className="text-[#FF552E]">.in</span>
          </span>
        </a>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#334155]">
          <a href="#products" className="hover:text-[#FF552E] transition-colors">Products</a>
          <a href="#platform" className="hover:text-[#FF552E] transition-colors">Platform</a>
          <a href="#chart" className="hover:text-[#FF552E] transition-colors">Natal Engine</a>
          <a href="#customers" className="hover:text-[#FF552E] transition-colors">Customers</a>
          <a href="#careers" className="hover:text-[#FF552E] transition-colors">Careers</a>
        </nav>

        {/* Right CTA Button & Quick Controls */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Language Selector */}
          <button
            onClick={() => onChangeLanguage(currentLanguage === 'en' ? 'hi' : currentLanguage === 'hi' ? 'es' : 'en')}
            className="flex items-center gap-1 text-xs font-semibold text-[#475569] hover:text-[#0F172A] px-2.5 py-1.5 border border-[#CBD5E1] rounded-none bg-[#F8FAFC]"
          >
            <Globe className="w-3.5 h-3.5 text-[#FF552E]" />
            <span className="uppercase">{currentLanguage}</span>
          </button>

          {/* Quick Chat Pill */}
          <button
            onClick={onOpenChat}
            className="text-xs font-bold text-[#0F172A] hover:text-[#FF552E] px-3 py-2 transition-colors uppercase tracking-wider font-mono"
          >
            AI Chatbot
          </button>

          {/* Primary CTA with signature orange bottom border */}
          <button
            onClick={onOpenChartModal}
            className="relative px-6 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 group"
          >
            <span>TALK TO US</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FF552E] group-hover:translate-x-1 transition-transform" />
            {/* Signature Orange Accent underline */}
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF552E]" />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenChartModal}
            className="px-3 py-2 bg-[#0F172A] text-white text-xs font-bold font-mono"
          >
            CALCULATE
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#0F172A]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-b border-[#E2E8F0] px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-base font-semibold text-[#0F172A]">
            <a href="#products" onClick={() => setMobileMenuOpen(false)}>Products</a>
            <a href="#platform" onClick={() => setMobileMenuOpen(false)}>Platform</a>
            <a href="#chart" onClick={() => setMobileMenuOpen(false)}>Natal Engine</a>
            <a href="#customers" onClick={() => setMobileMenuOpen(false)}>Customers</a>
            <a href="#careers" onClick={() => setMobileMenuOpen(false)}>Careers</a>
          </nav>
          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenChat();
              }}
              className="w-full py-3 bg-[#F1F5F9] text-[#0F172A] text-xs font-bold font-mono uppercase"
            >
              Open AI Chatbot
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenChartModal();
              }}
              className="w-full py-3 bg-[#FF552E] text-white text-xs font-bold font-mono uppercase tracking-wider"
            >
              Explore Natal Chart →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
