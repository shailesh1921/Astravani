import React from 'react';
import { AuthCard } from './AuthCard';
import { AuthUser } from '../../services/authApi';
import { ShieldCheck, Lock, Sparkles, Check } from 'lucide-react';

interface LoginPageProps {
  onSuccess?: (user: AuthUser) => void;
  brandTitle?: string;
  brandTagline?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  brandTitle = 'AstraVani Cloud',
  brandTagline = 'Passwordless authentication built for privacy, security, and speed.'
}) => {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row transition-colors">
      
      {/* Left Column: Branding / Value Proposition (Desktop & Tablet) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-12 flex-col justify-between relative overflow-hidden text-white border-r border-slate-800">
        
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Branding */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-amber-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Security Architecture</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white leading-tight">
            {brandTitle}
          </h1>
          <p className="text-slate-300 text-sm mt-3 max-w-md leading-relaxed">
            {brandTagline}
          </p>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-4 my-10 max-w-md">
          <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Passwordless Architecture</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Never worry about forgotten passwords, credential stuffing, or leaked databases.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Automated Account Linking</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Google and Email OTP share verified email identities seamlessly with zero duplicate accounts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Strict HttpOnly Cookie Security</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Short-lived 15m JWTs paired with 7-day rotating refresh tokens immune to XSS theft.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Trust Guarantee */}
        <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Enterprise Grade Free-Tier Certified</span>
          <span>© 2026 All Rights Reserved</span>
        </div>

      </div>

      {/* Right Column: Interactive Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <AuthCard onSuccess={onSuccess} />
      </div>

    </div>
  );
};

export default LoginPage;
