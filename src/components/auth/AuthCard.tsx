import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, ArrowLeft, RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, ShieldCheck, Sun, Moon 
} from 'lucide-react';
import { authApi, AuthUser } from '../../services/authApi';

interface AuthCardProps {
  onSuccess?: (user: AuthUser) => void;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onSuccess, className = '' }) => {
  // Theme state (Dark/Light mode support)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Flow State: 'email' (Step 1) | 'otp' (Step 2)
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Refs for 6-Box OTP input elements
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const googleBtnContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Auto-focus box 0 when moving to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Initialize Google Identity Services (GSI)
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    const setupGoogle = () => {
      if (typeof window === 'undefined' || !(window as any).google?.accounts?.id) {
        return;
      }

      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              await handleGoogleCredential(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          (window as any).google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: isDarkMode ? 'filled_black' : 'outline',
            size: 'large',
            width: '100%',
            shape: 'rectangular',
            text: 'continue_with',
            logo_alignment: 'left'
          });
        }
      } catch (err) {
        console.warn('Google Identity Services init notice:', err);
      }
    };

    // If script already loaded
    if ((window as any).google?.accounts?.id) {
      setupGoogle();
    } else {
      // Poll briefly for script load
      const checkTimer = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(checkTimer);
          setupGoogle();
        }
      }, 200);
      return () => clearInterval(checkTimer);
    }
  }, [isDarkMode, step]);

  // 1. Google Credential Handler
  const handleGoogleCredential = async (credential: string) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const data = await authApi.loginWithGoogle(credential);
      setSuccessMsg(`Welcome, ${data.user.name}!`);
      if (onSuccess) {
        setTimeout(() => onSuccess(data.user), 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try Email OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Request Email OTP (Step 1 submit)
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await authApi.requestEmailOtp(cleanEmail);
      setStep('otp');
      setCooldown(res.cooldownSeconds || 30);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Verify Email OTP (Step 2 verification)
  const handleVerifyOtp = async (fullOtpCode: string) => {
    if (fullOtpCode.length !== 6 || isLoading) return;

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await authApi.verifyEmailOtp(email, fullOtpCode);
      setSuccessMsg(`Welcome, ${res.user.name}!`);
      if (onSuccess) {
        setTimeout(() => onSuccess(res.user), 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired verification code.');
      // Refocus first box
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Individual OTP Digit Change
  const handleDigitChange = (index: number, val: string) => {
    const cleanChar = val.replace(/\D/g, '');
    
    // In case multiple digits are entered/autofilled in one box
    if (cleanChar.length > 1) {
      handlePasteString(cleanChar);
      return;
    }

    const singleDigit = cleanChar.slice(-1);
    const updated = [...otpDigits];
    updated[index] = singleDigit;
    setOtpDigits(updated);

    // Auto-advance to next box
    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are complete
    const fullCode = updated.join('');
    if (fullCode.length === 6 && !updated.includes('')) {
      handleVerifyOtp(fullCode);
    }
  };

  // 5. Backspace Navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // 6. Paste Support
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    handlePasteString(pasted);
  };

  const handlePasteString = (rawString: string) => {
    const digits = rawString.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    const newArr = ['', '', '', '', '', ''];
    for (let i = 0; i < digits.length; i++) {
      newArr[i] = digits[i];
    }
    setOtpDigits(newArr);

    const focusIdx = Math.min(digits.length, 5);
    inputRefs.current[focusIdx]?.focus();

    // Auto-submit if complete 6 digits
    if (digits.length === 6) {
      handleVerifyOtp(digits);
    }
  };

  // 7. Manual Submit for OTP form
  const handleOtpManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }
    handleVerifyOtp(fullCode);
  };

  return (
    <div 
      className={`w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden transition-colors ${className}`}
    >
      {/* Top Header / Branding Bar */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-lg border border-amber-500/20">
            ⚡
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              Secure Authentication
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Passwordless Google &amp; Email OTP
            </p>
          </div>
        </div>

        {/* Dark/Light mode toggle */}
        <button
          type="button"
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      <div className="p-6 space-y-4">
        
        {/* ARIA Live Region for Screen Readers & Visual Feedback */}
        <div aria-live="polite" className="space-y-2">
          {errorMsg && (
            <div 
              role="alert"
              className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div 
              role="status"
              className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <p className="font-semibold">{successMsg}</p>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* STEP 1: GOOGLE BUTTON + EMAIL OTP REQUEST                */}
        {/* ======================================================== */}
        {step === 'email' ? (
          <div className="space-y-5">
            
            {/* 1. Official Google Identity Services Container */}
            <div className="space-y-2">
              <div 
                ref={googleBtnContainerRef} 
                className="w-full flex justify-center min-h-[44px]"
              >
                {/* Fallback button if Google script is blocked or still loading */}
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>

            {/* "or" divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                or continue with email
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* Email OTP Request Form */}
            <form onSubmit={handleRequestOtp} className="space-y-3.5">
              <div>
                <label 
                  htmlFor="email-input" 
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="email-input"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-1">
                  We'll send a 6-digit login code. No password required.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm hover:shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send 6-Digit Code ➔</span>
                )}
              </button>
            </form>

          </div>
        ) : (
          /* ======================================================== */
          /* STEP 2: 6-BOX OTP VERIFICATION                           */
          /* ======================================================== */
          <form onSubmit={handleOtpManualSubmit} className="space-y-4">
            
            {/* Top Bar with "Change Email" */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-2.5 rounded-xl">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email</span>
              </button>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[190px]">
                {email}
              </span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Enter 6-Digit Security Code
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Check your inbox. Code expires in 5 minutes.
              </p>
            </div>

            {/* 6 INDIVIDUAL OTP INPUT BOXES */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 pt-1">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  aria-label={`Digit ${idx + 1} of verification code`}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-600 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition shadow-2xs"
                />
              ))}
            </div>

            {/* Countdown & Resend Button */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 dark:text-slate-400">Didn't receive email?</span>
              {cooldown > 0 ? (
                <span className="text-slate-400 dark:text-slate-500 font-medium">
                  Resend in <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{cooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              )}
            </div>

            {/* Manual Verify Button (auto-submits when 6th digit entered) */}
            <button
              type="submit"
              disabled={isLoading || otpDigits.join('').length !== 6}
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm hover:shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify &amp; Sign In ➔</span>
              )}
            </button>

          </form>
        )}

        {/* Security & Privacy Footer */}
        <div className="pt-3 text-center border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>256-Bit SSL Encrypted • Zero Passwords • Free Tier Certified</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthCard;
