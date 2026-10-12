import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Mail, Lock, ShieldCheck, 
  Sparkles, CheckCircle2, AlertCircle, Loader2,
  User, Phone, ArrowLeft, RefreshCw
} from 'lucide-react';
import { cloudAuth } from '../services/cloudAuthService';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { phoneAuthService } from '../services/phoneAuthService';
import { UserProfile } from '../types/astrotalk';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  defaultTab?: 'phone' | 'google' | 'email';
}

const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)', flag: '🇮🇳' },
  { code: '+1', label: 'USA / Canada (+1)', flag: '🇺🇸' },
  { code: '+44', label: 'UK (+44)', flag: '🇬🇧' },
  { code: '+971', label: 'UAE (+971)', flag: '🇦🇪' },
  { code: '+61', label: 'Australia (+61)', flag: '🇦🇺' },
  { code: '+65', label: 'Singapore (+65)', flag: '🇸🇬' },
  { code: '+49', label: 'Germany (+49)', flag: '🇩🇪' },
  { code: '+977', label: 'Nepal (+977)', flag: '🇳🇵' }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'phone'
}) => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'google' | 'email'>(defaultTab);
  
  // Phone OTP Flow states
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [devOtpNotice, setDevOtpNotice] = useState<string | null>(null);

  // Email form states
  const [emailMode, setEmailMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Refs for 6-Box OTP Inputs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset errors on method/step change
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [authMethod, phoneStep, emailMode]);

  // Cooldown timer countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Web OTP API autofill listener on mobile Chrome
  useEffect(() => {
    if (isOpen && phoneStep === 'otp' && authMethod === 'phone') {
      const stopListener = phoneAuthService.startWebOtpListener((receivedCode) => {
        if (receivedCode && receivedCode.length === 6) {
          const digits = receivedCode.split('').slice(0, 6);
          setOtpDigits(digits);
          handleAutoVerifyOtp(digits.join(''));
        }
      });
      return () => {
        stopListener();
      };
    }
  }, [isOpen, phoneStep, authMethod]);

  // Auto focus first OTP input box when moving to OTP step
  useEffect(() => {
    if (phoneStep === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [phoneStep]);

  if (!isOpen) return null;

  // Clean full phone number representation
  const clean10Digits = phoneNumber.replace(/\D/g, '').slice(-10);
  const formattedFullPhone = `${countryCode} ${clean10Digits}`;

  // 1. Send 6-Digit OTP Handler
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (clean10Digits.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (countryCode === '+91' && !/^[6-9]\d{9}$/.test(clean10Digits)) {
      setErrorMsg('Indian mobile numbers must start with 6, 7, 8, or 9.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await phoneAuthService.sendOtp(clean10Digits, countryCode);
      setPhoneStep('otp');
      setCooldown(result.cooldownSeconds || 60);
      setOtpDigits(['', '', '', '', '', '']);

      if (result.devOtp) {
        setDevOtpNotice(result.devOtp);
      } else {
        setDevOtpNotice(null);
      }

      setSuccessMsg(result.message || `6-digit verification code sent to ${formattedFullPhone}`);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setErrorMsg(err.message || 'Unable to send OTP. Please check the number and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Auto-Verify OTP when 6th digit entered
  const handleAutoVerifyOtp = async (fullOtpCode: string) => {
    if (fullOtpCode.length !== 6 || isLoading) return;
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const fullPhoneNumber = `${countryCode}${clean10Digits}`;
      const result = await phoneAuthService.verifyOtp(fullPhoneNumber, fullOtpCode, fullName);

      setSuccessMsg(`Welcome, ${result.user.fullName}! Phone verified successfully.`);
      setTimeout(() => {
        onSuccess(result.user);
        onClose();
      }, 600);
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setErrorMsg(err.message || 'Incorrect OTP code. Please verify the 6 digits.');
      // Refocus first empty box or box 0
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle individual digit box typing
  const handleOtpBoxChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    
    // In case user typed or autofilled multiple digits in one box
    if (cleanValue.length > 1) {
      handleOtpPasteString(cleanValue);
      return;
    }

    const singleChar = cleanValue.slice(-1);
    const updated = [...otpDigits];
    updated[index] = singleChar;
    setOtpDigits(updated);

    if (singleChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    const fullCode = updated.join('');
    if (fullCode.length === 6 && !updated.includes('')) {
      handleAutoVerifyOtp(fullCode);
    }
  };

  // 4. Handle Backspace navigation across boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  // 5. Handle Paste event (supports pasting full 6 digits)
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handleOtpPasteString(pastedData);
  };

  const handleOtpPasteString = (rawString: string) => {
    const cleanDigits = rawString.replace(/\D/g, '').slice(0, 6);
    if (!cleanDigits) return;

    const newArr = ['', '', '', '', '', ''];
    for (let i = 0; i < cleanDigits.length; i++) {
      newArr[i] = cleanDigits[i];
    }
    setOtpDigits(newArr);

    const focusIndex = Math.min(cleanDigits.length, 5);
    otpInputRefs.current[focusIndex]?.focus();

    if (cleanDigits.length === 6) {
      handleAutoVerifyOtp(cleanDigits);
    }
  };

  // 6. Manual Submit OTP form
  const handleManualVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }
    handleAutoVerifyOtp(fullCode);
  };

  // 7. Google 1-Tap Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const fbUser = await firebaseAuthService.signInWithGoogle();
      if (!fbUser) {
        throw new Error('Google Sign-In did not return account details.');
      }

      const user = await cloudAuth.syncGoogleUser({
        id: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'AstraVani Devotee',
        avatar: fbUser.photoURL || undefined
      });

      setSuccessMsg(`Welcome, ${user.fullName}! Connected via Google.`);
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 600);
    } catch (err: any) {
      console.warn('Google Sign-In notice:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setIsLoading(false);
        return;
      }
      if (err?.code === 'auth/operation-not-allowed') {
        setErrorMsg('Google Sign-In is not enabled on this Firebase project. Switched to instant Mobile OTP verification.');
        setAuthMethod('phone');
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMsg('Google sign-in popup was blocked by browser. Please allow popups or use Mobile OTP.');
      } else {
        setErrorMsg(err.message || 'Google Sign-In failed. Please continue with instant Mobile OTP.');
        setAuthMethod('phone');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Email & Password Authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (emailMode === 'login') {
        const user = await cloudAuth.loginWithEmail(email, password);
        setSuccessMsg(`Welcome back, ${user.fullName}!`);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 600);
      } else {
        const user = await cloudAuth.signupWithEmail(email, password, fullName);
        setSuccessMsg(`Account created! Welcome to AstraVani, ${user.fullName}!`);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94dvh]">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-5 py-4 text-slate-900 flex items-center justify-between relative shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/95 text-amber-700 flex items-center justify-center font-black text-lg shadow-xs">
              ॐ
            </div>
            <div>
              <h3 className="font-black text-base leading-tight text-slate-950">
                AstraVani Cloud Account
              </h3>
              <p className="text-[11px] font-medium text-slate-800">
                100% Private • Saves Wallet, Kundlis &amp; Consultations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <p className="font-semibold">{successMsg}</p>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: MOBILE NUMBER + 6-DIGIT OTP (PRIMARY FLOW)        */}
          {/* ======================================================== */}
          {authMethod === 'phone' && (
            <div>
              {phoneStep === 'input' ? (
                /* STEP 1: PHONE NUMBER INPUT */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {/* Trust Banner */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-3.5 text-center shadow-2xs">
                    <div className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-full mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Instant Phone Login (No Password Needed)</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Enter your mobile number to receive a secure 6-digit OTP via SMS
                    </p>
                  </div>

                  {/* Optional Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Shailesh Singh"
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Mobile Number with Country Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-amber-600">*</span>
                    </label>
                    <div className="flex gap-2">
                      {/* Country Code Picker */}
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {COUNTRY_CODES.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.flag} {item.code}
                          </option>
                        ))}
                      </select>

                      {/* 10-Digit Mobile Input */}
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 10-digit mobile number"
                          className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 tracking-wider"
                          autoFocus
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 pl-1">
                      OTP will be delivered via instant SMS carrier (MSG91 / DLT verified)
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || clean10Digits.length !== 10}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                        <span>Sending 6-Digit OTP...</span>
                      </>
                    ) : (
                      <span>Send 6-Digit OTP ➔</span>
                    )}
                  </button>

                  {/* Alternative Methods Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400">OR</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* Secondary Sign-in Options */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Google 1-Tap</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAuthMethod('email')}
                      className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>Email &amp; Pass</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 2: 6-BOX OTP VERIFICATION */
                <form onSubmit={handleManualVerifySubmit} className="space-y-4">
                  {/* Step Back + Phone Display */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPhoneStep('input')}
                      className="inline-flex items-center gap-1 text-xs text-amber-700 font-bold hover:underline cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change Number</span>
                    </button>
                    <span className="text-xs font-black text-slate-900 tracking-wide">
                      {formattedFullPhone}
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-black text-slate-900">
                      Enter 6-Digit Verification Code
                    </h4>
                    <p className="text-xs text-slate-500">
                      We sent a one-time password via SMS. Expires in 5 minutes.
                    </p>
                  </div>

                  {/* Dev / Sandbox OTP Notice */}
                  {devOtpNotice && (
                    <div className="bg-amber-100/70 border border-amber-300 text-amber-900 text-xs p-2 rounded-xl flex items-center justify-between">
                      <span className="font-bold">⚡ Sandbox / Dev Mode OTP:</span>
                      <button
                        type="button"
                        onClick={() => handleOtpPasteString(devOtpNotice)}
                        className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-md text-xs cursor-pointer hover:bg-amber-600"
                      >
                        Auto-fill {devOtpNotice}
                      </button>
                    </div>
                  )}

                  {/* 6 INDIVIDUAL OTP INPUT BOXES */}
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5 pt-1">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all shadow-2xs"
                      />
                    ))}
                  </div>

                  {/* Resend OTP Cooldown & Trigger */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-500">Didn't receive SMS?</span>
                    {cooldown > 0 ? (
                      <span className="text-slate-400 font-semibold">
                        Resend in <strong className="text-amber-700 font-black">{cooldown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={isLoading}
                        className="text-amber-700 font-black hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  {/* Manual Verify Button (auto-triggers when all 6 filled) */}
                  <button
                    type="submit"
                    disabled={isLoading || otpDigits.join('').length !== 6}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                        <span>Verifying Security Code...</span>
                      </>
                    ) : (
                      <span>Verify &amp; Continue ➔</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: GOOGLE 1-TAP                                      */}
          {/* ======================================================== */}
          {authMethod === 'google' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Vedic Astrology Platform</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Connect with Expert Astrologers
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Instant login • Sacred private consultations
                </p>
              </div>

              {/* 1-Tap Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-400 py-3.5 px-4 rounded-2xl text-sm font-black flex items-center justify-center gap-3 transition shadow-md hover:shadow-lg cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className="w-full py-2 px-3 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold rounded-xl border border-amber-200 cursor-pointer"
                >
                  📱 Use Mobile Number + OTP (Recommended)
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className="text-xs text-slate-500 hover:text-amber-800 font-semibold underline cursor-pointer"
                >
                  Or sign in with Email &amp; Password
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: EMAIL & PASSWORD FORM                             */}
          {/* ======================================================== */}
          {authMethod === 'email' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-800">
                  {emailMode === 'login' ? 'Email Login' : 'Create Free Account'}
                </span>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className="text-xs text-amber-700 font-bold hover:underline cursor-pointer"
                >
                  ← Back to Mobile OTP
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                {emailMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Shailesh Singh"
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <span>{emailMode === 'login' ? 'Login to AstraVani' : 'Create Free Account'}</span>
                    )}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setEmailMode(emailMode === 'login' ? 'signup' : 'login')}
                    className="text-xs text-amber-800 font-semibold hover:underline cursor-pointer"
                  >
                    {emailMode === 'login'
                      ? "Don't have an account? Sign Up for Free"
                      : 'Already registered? Login here'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Privacy and Trust Guarantees */}
          <div className="pt-2 text-center text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-500 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted • Zero Data Sharing • Sacred Privacy</span>
            </div>
            <p>By continuing, you agree to AstraVani's Terms &amp; Privacy Policy.</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AuthModal;
