import { UserProfile } from '../types/astrotalk';
import { cloudAuth } from './cloudAuthService';

const VERIFICATION_TOKEN_KEY = 'astravani_otp_verification_token';
const PHONE_AUTH_CACHE_KEY = 'astravani_phone_auth_cache';

export interface SendOtpResult {
  success: boolean;
  message: string;
  phone: string;
  cooldownSeconds: number;
  expiresInSeconds: number;
  verificationToken?: string;
  devOtp?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  user: UserProfile;
  token?: string;
}

class PhoneAuthService {
  private activeAbortController: AbortController | null = null;

  /**
   * Send 6-digit OTP via /api/send-otp
   */
  public async sendOtp(phone: string, countryCode: string = '+91'): Promise<SendOtpResult> {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length !== 10 || !/^[6-9]\d{9}$/.test(cleanDigits)) {
      throw new Error('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
    }

    const fullPhone = `${countryCode.startsWith('+') ? countryCode : '+' + countryCode}${cleanDigits}`;

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: fullPhone,
          countryCode
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code. Please retry.');
      }

      if (data.verificationToken) {
        sessionStorage.setItem(VERIFICATION_TOKEN_KEY, data.verificationToken);
      }
      sessionStorage.setItem(PHONE_AUTH_CACHE_KEY, JSON.stringify({
        phone: fullPhone,
        sentAt: Date.now(),
        cooldownSeconds: data.cooldownSeconds || 60
      }));

      return {
        success: true,
        message: data.message || `6-digit code sent to ${fullPhone}`,
        phone: fullPhone,
        cooldownSeconds: data.cooldownSeconds || 60,
        expiresInSeconds: data.expiresInSeconds || 300,
        verificationToken: data.verificationToken,
        devOtp: data.devOtp
      };
    } catch (networkErr: any) {
      // Graceful fallback for local Vite dev / offline preview environments without running Vercel serverless
      console.warn('Backend /api/send-otp call encountered:', networkErr.message);

      // Local fallback in browser memory
      const fallbackResult = await cloudAuth.requestPhoneOtp(fullPhone);
      return {
        success: true,
        message: fallbackResult.message,
        phone: fullPhone,
        cooldownSeconds: 60,
        expiresInSeconds: 300,
        devOtp: fallbackResult.testOtp
      };
    }
  }

  /**
   * Verify 6-digit OTP via /api/verify-otp
   */
  public async verifyOtp(phone: string, otp: string, fullName?: string): Promise<VerifyOtpResult> {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const fullPhone = phone.startsWith('+') ? phone : `+91${cleanDigits}`;
    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      throw new Error('Please enter the complete 6-digit code.');
    }

    const verificationToken = sessionStorage.getItem(VERIFICATION_TOKEN_KEY) || undefined;

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: fullPhone,
          otp: cleanOtp,
          verificationToken,
          fullName
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.updatedToken) {
          sessionStorage.setItem(VERIFICATION_TOKEN_KEY, data.updatedToken);
        }
        throw new Error(data.error || 'Verification failed. Please retry.');
      }

      // Cleanup pending session token
      sessionStorage.removeItem(VERIFICATION_TOKEN_KEY);
      sessionStorage.removeItem(PHONE_AUTH_CACHE_KEY);

      // Establish session in cloudAuthService so all listeners, wallet, and UI update
      const user: UserProfile = {
        ...data.user,
        phoneVerified: true
      };
      await cloudAuth.syncPhoneUser(user);

      return {
        success: true,
        message: 'Phone verified successfully!',
        user,
        token: data.token
      };
    } catch (networkErr: any) {
      console.warn('Backend /api/verify-otp fallback:', networkErr.message);

      // Fallback to client vault verification
      const user = await cloudAuth.verifyPhoneOtp(fullPhone, cleanOtp, fullName);
      return {
        success: true,
        message: 'Phone verified successfully!',
        user: {
          ...user,
          phoneVerified: true
        }
      };
    }
  }

  /**
   * Web OTP API support for mobile Chrome autofill
   */
  public startWebOtpListener(onOtpReceived: (otp: string) => void): () => void {
    if (typeof window === 'undefined' || !('OTPCredential' in window)) {
      return () => {};
    }

    if (this.activeAbortController) {
      this.activeAbortController.abort();
    }
    this.activeAbortController = new AbortController();

    navigator.credentials
      .get({
        otp: { transport: ['sms'] },
        signal: this.activeAbortController.signal
      } as any)
      .then((otpCredential: any) => {
        if (otpCredential && otpCredential.code) {
          const match = otpCredential.code.match(/\d{6}/);
          if (match) {
            onOtpReceived(match[0]);
          }
        }
      })
      .catch((err) => {
        // Abort or unsupported is expected
        if (err.name !== 'AbortError') {
          console.debug('Web OTP API notification:', err.message);
        }
      });

    return () => {
      if (this.activeAbortController) {
        this.activeAbortController.abort();
        this.activeAbortController = null;
      }
    };
  }
}

export const phoneAuthService = new PhoneAuthService();
