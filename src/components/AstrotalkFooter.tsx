import React from 'react';
import { ShieldCheck, Lock, Award, Sparkles } from 'lucide-react';
import { PolicyTab } from './CompliancePolicyModal';

interface AstrotalkFooterProps {
  onSelectNav: (tab: string) => void;
  onOpenPolicy: (tab: PolicyTab) => void;
}

export const AstrotalkFooter: React.FC<AstrotalkFooterProps> = ({ onSelectNav, onOpenPolicy }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Verified Astrologers</h4>
              <p className="text-xs text-slate-400">Strict 4-stage oral & written vetting</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Privacy Guarantee</h4>
              <p className="text-xs text-slate-400">End-to-end encrypted consultations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">5+ Crore Happy Clients</h4>
              <p className="text-xs text-slate-400">Consultations across 85+ countries</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Money-Back Guarantee</h4>
              <p className="text-xs text-slate-400">Instant wallet refund on call or chat drops</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-b border-slate-800 text-xs">
          
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold">
                ॐ
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Astra<span className="text-amber-400">Vani</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              AstraVani (<a href="https://astravani.in" className="text-amber-400 hover:underline">astravani.in</a>) is India's trusted online Vedic astrology portal providing genuine Jyotish, Kundli Milan, and Tarot consultations powered by India's most verified Vedic Pandits, Jyotishis, and Tarot Scholars.
            </p>
          </div>

          {/* Col 2: Services */}
          <div>
            <h5 className="text-white font-bold uppercase tracking-wider mb-3 text-[11px]">
              Astrological Services
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onSelectNav('astrologers')} className="hover:text-amber-400 transition cursor-pointer">
                  Chat with Astrologer
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav('astrologers')} className="hover:text-amber-400 transition cursor-pointer">
                  Talk to Astrologer (Call)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav('kundli')} className="hover:text-amber-400 transition cursor-pointer">
                  Free Janam Kundli
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav('matching')} className="hover:text-amber-400 transition cursor-pointer">
                  Kundli Matching (36 Gunas)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav('horoscope')} className="hover:text-amber-400 transition cursor-pointer">
                  Daily Horoscopes (Rashifal)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav('blog')} className="hover:text-amber-400 transition cursor-pointer font-bold text-amber-400">
                  📖 Vedic Astrology Blog & Upay
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Vedic Guides & Articles */}
          <div>
            <h5 className="text-white font-bold uppercase tracking-wider mb-3 text-[11px]">
              Vedic Gyan & Upay
            </h5>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => onSelectNav('blog')} className="hover:text-amber-400 transition cursor-pointer text-left">
                  काल सर्प दोष लक्षण एवं उपाय
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav('blog')} className="hover:text-amber-400 transition cursor-pointer text-left">
                  मांगलिक दोष एवं 36 गुण मिलान
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav('blog')} className="hover:text-amber-400 transition cursor-pointer text-left">
                  शनि साढ़े साती के अचूक उपाय
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav('blog')} className="hover:text-amber-400 transition cursor-pointer text-left">
                  राहु महादशा एवं शांति विधि
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav('blog')} className="hover:text-amber-400 transition cursor-pointer text-left">
                  घर में सुख-समृद्धि के 10 वास्तु टिप्स
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Policies */}
          <div>
            <h5 className="text-white font-bold uppercase tracking-wider mb-3 text-[11px]">
              Corporate & Legal Policies
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onOpenPolicy('terms')} className="hover:text-amber-400 transition cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('privacy')} className="hover:text-amber-400 transition cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('refund')} className="hover:text-amber-400 transition cursor-pointer">
                  Refund & Cancellation Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('contact')} className="hover:text-amber-400 transition cursor-pointer">
                  Contact Us & Business Info
                </button>
              </li>
              <li className="text-amber-400/90 font-medium">
                Customer Care: support@astravani.in
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Disclaimers */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 AstraVani (astravani.in). Operated by Shailesh Singh. All rights reserved.</p>
          <p className="text-center md:text-right max-w-lg">
            Disclaimer: Astrology is an empirical spiritual science and predictive study. Insights provided are intended for self-guidance and personal reflection.
          </p>
        </div>

      </div>
    </footer>
  );
};

