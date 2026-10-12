import { apiClient } from './apiClient';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  hasGoogleLinked?: boolean;
  createdAt?: string;
}

export interface LoginAuditItem {
  _id?: string;
  method: 'email_otp' | 'google';
  status: 'success' | 'failure';
  ip?: string;
  userAgent?: string;
  failureReason?: string;
  createdAt: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  cooldownSeconds?: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  user: AuthUser;
}

export interface GoogleAuthResponse {
  success: boolean;
  message: string;
  user: AuthUser;
}

export interface GetMeResponse {
  success: boolean;
  user: AuthUser;
  auditLog: LoginAuditItem[];
}

export const authApi = {
  /**
   * Request a 6-digit OTP code sent to user email
   */
  async requestEmailOtp(email: string): Promise<RequestOtpResponse> {
    const response = await apiClient.post<RequestOtpResponse>('/auth/email/request', {
      email: email.trim().toLowerCase()
    });
    return response.data;
  },

  /**
   * Verify the 6-digit OTP code and authenticate
   */
  async verifyEmailOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const response = await apiClient.post<VerifyOtpResponse>('/auth/email/verify', {
      email: email.trim().toLowerCase(),
      otp: otp.trim()
    });
    return response.data;
  },

  /**
   * Authenticate using Google Identity Services ID Token (credential)
   */
  async loginWithGoogle(credential: string): Promise<GoogleAuthResponse> {
    const response = await apiClient.post<GoogleAuthResponse>('/auth/google', {
      credential
    });
    return response.data;
  },

  /**
   * Fetch current authenticated user profile and login audit log
   */
  async getMe(): Promise<GetMeResponse> {
    const response = await apiClient.get<GetMeResponse>('/auth/me');
    return response.data;
  },

  /**
   * Explicitly rotate and refresh access token
   */
  async refreshSession(): Promise<{ success: boolean; user: AuthUser }> {
    const response = await apiClient.post<{ success: boolean; user: AuthUser }>('/auth/refresh');
    return response.data;
  },

  /**
   * Log out of current device and clear cookies
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/logout');
    return response.data;
  },

  /**
   * Log out of all active devices and revoke all session tokens
   */
  async logoutAllDevices(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/logout-all');
    return response.data;
  },

  /**
   * Update user profile details
   */
  async updateProfile(data: { name?: string; avatar?: string }): Promise<{ success: boolean; user: AuthUser }> {
    const response = await apiClient.patch<{ success: boolean; user: AuthUser }>('/auth/profile', data);
    return response.data;
  },

  /**
   * Permanently delete user account and sessions
   */
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>('/auth/account');
    return response.data;
  }
};
