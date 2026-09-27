import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Lock, ShieldCheck, 
  Sparkles, CheckCircle2, AlertCircle, Loader2,
  User, Gift
} from 'lucide-react';
import { cloudAuth } from '../services/cloudAuthService';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { UserProfile } from '../types/astrotalk';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  defaultTab?: 'google' | 'email';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'google'
}) => {
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>(defaultTab);
  const [emailMode, setEmailMode] = useState<'login' | 'signup'>('login');

  // Email form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset errors on method change
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [authMethod, emailMode]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      try {
        const fbUser = await firebaseAuthService.signInWithGoogle();
        if (fbUser) {
          const user = await cloudAuth.syncGoogleUser({
            id: fbUser.uid,
            email: fbUser.email || '',
            name: fbUser.displayName || 'AstraVani User',
            avatar: fbUser.photoURL || undefined
          });
          setSuccessMsg(`Welcome, ${user.fullName}! Login successful.`);
          setTimeout(() => {
            onSuccess(user);
            onClose();
          }, 600);
          return;
        }
      } catch (fbErr: any) {
        console.warn('Firebase Google sign-in fallback:', fbErr);
        if (fbErr?.code === 'auth/popup-closed-by-user') {
          setIsLoading(false);
          return; // User intentionally closed popup
        }
      }

      // High-speed fallback
      const user = await cloudAuth.loginWithGoogle();
      setSuccessMsg(`Welcome, ${user.fullName}! Login successful.`);
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
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
                100% Private • Saves Wallet, Kundlis &amp; Consultations
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
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
              <p className="font-semibold">{successMsg}</p>
            </div>
          )}

          {authMethod === 'google' ? (
            <div className="space-y-4">
              
              {/* Welcome Gift Box */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full mb-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  <span>Welcome Devotee Offer</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Sign in &amp; Get ₹100 Free Consultation Balance
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Instant 1-Click login • No phone or OTP wait
                </p>
              </div>

              {/* PRIMARY HERO: 1-Tap Google Sign-In */}
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
                  </>
                )}
              </button>

              {/* Value Props */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>Instant 1-Click Access</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>100% Private &amp; Secure</span>
                </div>
              </div>

              {/* Secondary switch to Email */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className="text-xs text-slate-500 hover:text-amber-800 font-semibold underline cursor-pointer"
                >
                  Or sign in with Email &amp; Password
                </button>
              </div>

            </div>
          ) : (
            /* EMAIL & PASSWORD AUTH FORM */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-800">
                  {emailMode === 'login' ? 'Email Login' : 'Create Free Account'}
                </span>
                <button
                  type="button"
                  onClick={() => setAuthMethod('google')}
                  className="text-xs text-amber-700 font-bold hover:underline cursor-pointer"
                >
                  ← Back to Google 1-Tap
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
            </div>
          )}

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
export default AuthModal;
