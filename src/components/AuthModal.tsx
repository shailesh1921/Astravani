import React, { useState, useEffect } from 'react';
import { 
  X, Phone, Mail, Lock, ShieldCheck, ArrowRight, 
  Sparkles, CheckCircle2, AlertCircle, Loader2, KeyRound,
  User, RefreshCw
} from 'lucide-react';
import { cloudAuth } from '../services/cloudAuthService';
import { UserProfile } from '../types/astrotalk';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  defaultTab?: 'phone' | 'email';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'phone'
}) => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>(defaultTab);
  const [emailMode, setEmailMode] = useState<'login' | 'signup'>('login');

  // Phone states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  // Email states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend Countdown
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset errors on method change
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [authMethod, emailMode]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await cloudAuth.requestPhoneOtp(phoneNumber);
      setOtpSent(true);
      setDemoOtpHint(res.testOtp);
      setSuccessMsg(res.message);
      setResendTimer(60);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP. Please check your phone number.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const user = await cloudAuth.verifyPhoneOtp(phoneNumber, otp, fullName);
      setSuccessMsg(`Welcome, ${user.fullName}! Login successful.`);
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        }, 700);
      } else {
        const user = await cloudAuth.signupWithEmail(email, password, fullName, phoneNumber);
        setSuccessMsg(`Account created! Welcome to AstraVani, ${user.fullName}!`);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const user = await cloudAuth.loginWithGoogle();
      setSuccessMsg(`Logged in via Google as ${user.fullName}`);
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92dvh]">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-5 py-4 text-slate-900 flex items-center justify-between relative shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/90 text-amber-700 flex items-center justify-center font-black text-lg shadow-sm">
              ॐ
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight text-slate-950">
                AstraVani Cloud Account
              </h3>
              <p className="text-[11px] font-medium text-slate-800">
                100% Private • Saves Wallet, Kundlis &amp; Chats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setAuthMethod('phone'); setOtpSent(false); }}
            className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === 'phone'
                ? 'bg-white text-amber-700 border-b-2 border-amber-500 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Mobile OTP (India)</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === 'email'
                ? 'bg-white text-amber-700 border-b-2 border-amber-500 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email &amp; Password</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Notification Messages */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-semibold">{successMsg}</p>
                {demoOtpHint && (
                  <p className="text-[11px] text-emerald-700 font-mono mt-0.5">
                    Fast Demo OTP: <strong>{demoOtpHint}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: PHONE AUTHENTICATION */}
          {authMethod === 'phone' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Enter Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      We'll send a 4-digit verification code to confirm your number.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Shailesh Singh"
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || phoneNumber.length < 10}
                    className="btn-astrotalk w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending 4-Digit OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Get 4-Digit Verification Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-xs font-bold text-slate-800">
                      Enter 4-Digit OTP sent to +91 {phoneNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-amber-700 font-bold hover:underline block mx-auto cursor-pointer"
                    >
                      Change Number?
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • •"
                      className="w-36 text-center tracking-[0.6em] font-mono text-2xl font-black bg-white border-2 border-amber-400 rounded-2xl p-2.5 focus:outline-none focus:border-amber-600 text-slate-900 shadow-inner"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    {resendTimer > 0 ? (
                      <span className="text-slate-400">Resend in {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-amber-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                    {demoOtpHint && (
                      <span className="text-slate-400 text-[11px]">Demo: {demoOtpHint}</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 4}
                    className="btn-astrotalk w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying OTP...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify 4-Digit OTP &amp; Enter</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL & PASSWORD AUTH */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {emailMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Shailesh Singh"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
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
                  className="btn-astrotalk w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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
          )}

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold">Or continue with</span>
            </div>
          </div>

          {/* 1-Tap Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full border border-slate-300 hover:bg-slate-50 bg-white text-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition shadow-2xs cursor-pointer active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google (1-Tap)</span>
          </button>

          {/* Privacy and Trust Guarantees */}
          <div className="pt-2 text-center text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-500 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted • Zero Data Sharing • Sacred Privacy</span>
            </div>
            <p>By signing in, you agree to AstraVani's Terms &amp; Privacy Policy.</p>
          </div>

        </div>

      </div>
    </div>
  );
};
