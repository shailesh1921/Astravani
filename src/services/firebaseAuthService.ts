import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyDv8b0tSaIcrDLBgUPED8kIbrPfO2imQhw",
  authDomain: "astravani.firebaseapp.com",
  projectId: "astravani",
  storageBucket: "astravani.firebasestorage.app",
  messagingSenderId: "690100596124",
  appId: "1:690100596124:web:bab17b8ccd6c8c15a0ac59",
  measurementId: "G-RFGF17M3SE"
};

// Initialize Firebase singleton
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);

let confirmationResultTracker: ConfirmationResult | null = null;
let recaptchaVerifierInstance: RecaptchaVerifier | null = null;

export const firebaseAuthService = {
  /**
   * Initialize or return Invisible Recaptcha for Real Carrier SMS OTP
   */
  initRecaptcha(buttonContainerId = 'recaptcha-container'): RecaptchaVerifier {
    if (typeof window === 'undefined') {
      throw new Error('Window not available');
    }

    if (recaptchaVerifierInstance) {
      try {
        recaptchaVerifierInstance.clear();
      } catch (e) {}
    }

    recaptchaVerifierInstance = new RecaptchaVerifier(firebaseAuth, buttonContainerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - will proceed with submit
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
      }
    });

    return recaptchaVerifierInstance;
  },

  /**
   * Send Real SMS OTP to Indian Mobile Number (+91) via Google Carrier Network (100% Free)
   */
  async sendPhoneOtp(phone: string): Promise<boolean> {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length !== 10) {
      throw new Error('Please enter a valid 10-digit Indian mobile number');
    }
    const formattedE164 = `+91${cleanDigits}`;

    const appVerifier = this.initRecaptcha('recaptcha-container');
    try {
      confirmationResultTracker = await signInWithPhoneNumber(firebaseAuth, formattedE164, appVerifier);
      return true;
    } catch (err: any) {
      console.warn('Firebase SMS dispatch fallback:', err);
      if (appVerifier) {
        try { appVerifier.clear(); } catch (e) {}
      }
      throw err;
    }
  },

  /**
   * Verify Carrier OTP entered by user
   */
  async verifyOtpCode(otpCode: string): Promise<any> {
    if (!confirmationResultTracker) {
      throw new Error('No active verification session. Please request OTP again.');
    }
    const result = await confirmationResultTracker.confirm(otpCode);
    return result.user;
  },

  /**
   * 1-Tap Google Sign-In
   */
  async signInWithGoogle(): Promise<any> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(firebaseAuth, provider);
    return result.user;
  }
};
