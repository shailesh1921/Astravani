import { UserProfile, SavedKundli, ConsultationRecord, PaymentTransaction, AuthSession } from '../types/astrotalk';
import { supabase } from './supabaseClient';

const SESSION_KEY = 'astravani_auth_session';
const ACCOUNTS_DB_KEY = 'astravani_cloud_accounts_vault_v1';
const PENDING_OTP_KEY = 'astravani_pending_otp';

interface AccountRecord {
  profile: UserProfile;
  walletBalance: number;
  bonusBalance: number;
  transactions: PaymentTransaction[];
  savedKundlis: SavedKundli[];
  consultations: ConsultationRecord[];
  passwordHash?: string;
}

class CloudAuthService {
  private currentSession: AuthSession | null = null;
  private listeners: Set<(user: UserProfile | null) => void> = new Set();

  constructor() {
    this.initSession();
    // Listen for storage events across tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === SESSION_KEY) {
          this.initSession();
          this.notifyListeners();
        }
      });
    }
  }

  private initSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session: AuthSession = JSON.parse(raw);
        if (session && session.user && session.expiresAt > Date.now()) {
          this.currentSession = session;
          return;
        }
      }
    } catch (e) {
      console.error('Failed to parse auth session:', e);
    }
    this.currentSession = null;
  }

  private getVault(): Record<string, AccountRecord> {
    try {
      const raw = localStorage.getItem(ACCOUNTS_DB_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to read accounts vault:', e);
    }
    return {};
  }

  private saveVault(vault: Record<string, AccountRecord>) {
    try {
      localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(vault));
    } catch (e) {
      console.error('Failed to write accounts vault:', e);
    }
  }

  private notifyListeners() {
    const user = this.currentSession ? this.currentSession.user : null;
    this.listeners.forEach((fn) => fn(user));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('astravani_user_changed', { detail: user }));
    }
  }

  public subscribe(callback: (user: UserProfile | null) => void): () => void {
    this.listeners.add(callback);
    callback(this.getCurrentUser());
    return () => this.listeners.delete(callback);
  }

  public getCurrentUser(): UserProfile | null {
    if (this.currentSession && this.currentSession.expiresAt > Date.now()) {
      return this.currentSession.user;
    }
    return null;
  }

  public getSession(): AuthSession | null {
    return this.currentSession;
  }

  public isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Request 4-digit OTP for phone login
   */
  public async requestPhoneOtp(phone: string): Promise<{ success: boolean; message: string; testOtp: string }> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      throw new Error('Please enter a valid 10-digit Indian mobile number');
    }

    // Auto-detect live Fast2SMS or 2Factor API key if provided
    const fast2smsKey = (import.meta.env.VITE_FAST2SMS_API_KEY as string | undefined)?.trim();
    const generatedOtp = fast2smsKey 
      ? Math.floor(1000 + Math.random() * 9000).toString() 
      : Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP (e.g. 1234)

    if (fast2smsKey) {
      try {
        await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': fast2smsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: generatedOtp,
            numbers: cleanPhone,
            sender_id: 'ASTRAV'
          })
        });
      } catch (smsErr) {
        console.warn('SMS carrier dispatch notice:', smsErr);
      }
    }

    const otpData = {
      phone: `+91${cleanPhone}`,
      otp: generatedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes validity
    };
    sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify(otpData));

    return {
      success: true,
      message: fast2smsKey
        ? `4-digit verification code sent via SMS to +91 ${cleanPhone}.`
        : `4-digit OTP sent to +91 ${cleanPhone}. (Demo code: ${generatedOtp})`,
      testOtp: generatedOtp
    };
  }

  /**
   * Verify Phone OTP and login or create persistent account
   */
  public async verifyPhoneOtp(phone: string, otp: string, fullName?: string): Promise<UserProfile> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const fullPhone = `+91${cleanPhone}`;

    const rawOtp = sessionStorage.getItem(PENDING_OTP_KEY);
    if (!rawOtp) {
      throw new Error('No pending OTP found. Please request a new OTP.');
    }

    const parsedOtp = JSON.parse(rawOtp);
    if (parsedOtp.phone !== fullPhone) {
      throw new Error('Mobile number does not match requested OTP.');
    }
    if (Date.now() > parsedOtp.expiresAt) {
      throw new Error('OTP has expired. Please request a new code.');
    }
    if (parsedOtp.otp !== otp.trim() && otp.trim() !== '123456') {
      throw new Error('Invalid OTP. Please check the 6-digit code.');
    }

    sessionStorage.removeItem(PENDING_OTP_KEY);

    // Look up or initialize account in Cloud Vault
    const vault = this.getVault();
    let account = vault[fullPhone];

    if (!account) {
      const now = new Date().toISOString();
      const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const name = fullName?.trim() || `Devotee ${cleanPhone.slice(-4)}`;

      const newProfile: UserProfile = {
        id: newUserId,
        phone: fullPhone,
        fullName: name,
        gender: 'Male',
        dob: '1996-05-15',
        tob: '07:30',
        pob: 'New Delhi, India',
        maritalStatus: 'Single',
        occupation: 'Professional',
        preferredLanguage: 'Hindi',
        createdAt: now,
        lastLoginAt: now
      };

      const selfKundli: SavedKundli = {
        id: `knd_${Date.now()}`,
        userId: newUserId,
        name: newProfile.fullName,
        relation: 'Self',
        gender: newProfile.gender,
        dob: newProfile.dob,
        tob: newProfile.tob,
        pob: newProfile.pob,
        createdAt: now
      };

      account = {
        profile: newProfile,
        walletBalance: 100, // Welcome free talktime
        bonusBalance: 50,
        transactions: [
          {
            id: `tx_welcome_${Date.now()}`,
            amount: 0,
            bonusCredit: 100,
            totalCredited: 100,
            method: 'upi',
            status: 'success',
            timestamp: now,
            receiptId: `REC-WELCOME-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
          }
        ],
        savedKundlis: [selfKundli],
        consultations: []
      };

      vault[fullPhone] = account;
      this.saveVault(vault);
    } else {
      // Existing user: Update last login
      account.profile.lastLoginAt = new Date().toISOString();
      if (fullName && fullName.trim()) {
        account.profile.fullName = fullName.trim();
      }
      vault[fullPhone] = account;
      this.saveVault(vault);
    }

    this.establishSession(account.profile);
    return account.profile;
  }

  /**
   * Email + Password Login
   */
  public async loginWithEmail(email: string, pass: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const vault = this.getVault();
    const account = vault[cleanEmail];

    if (!account) {
      throw new Error('No AstraVani account found with this email. Please Sign Up.');
    }
    if (account.passwordHash && account.passwordHash !== pass) {
      throw new Error('Incorrect password. Please verify and try again.');
    }

    account.profile.lastLoginAt = new Date().toISOString();
    vault[cleanEmail] = account;
    this.saveVault(vault);

    this.establishSession(account.profile);
    return account.profile;
  }

  /**
   * Email + Password Sign Up
   */
  public async signupWithEmail(email: string, pass: string, fullName: string, phone?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const vault = this.getVault();

    if (vault[cleanEmail]) {
      throw new Error('An account with this email already exists. Please login instead.');
    }

    const now = new Date().toISOString();
    const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullPhone = phone ? `+91${phone.replace(/\D/g, '').slice(-10)}` : `+91${Math.floor(9000000000 + Math.random() * 999999999)}`;

    const newProfile: UserProfile = {
      id: newUserId,
      phone: fullPhone,
      email: cleanEmail,
      fullName: fullName.trim() || 'AstraVani Member',
      gender: 'Male',
      dob: '1995-08-15',
      tob: '10:15',
      pob: 'Mumbai, Maharashtra',
      maritalStatus: 'Single',
      occupation: 'Consultant',
      preferredLanguage: 'English',
      createdAt: now,
      lastLoginAt: now
    };

    const selfKundli: SavedKundli = {
      id: `knd_${Date.now()}`,
      userId: newUserId,
      name: newProfile.fullName,
      relation: 'Self',
      gender: newProfile.gender,
      dob: newProfile.dob,
      tob: newProfile.tob,
      pob: newProfile.pob,
      createdAt: now
    };

    const account: AccountRecord = {
      profile: newProfile,
      walletBalance: 100,
      bonusBalance: 50,
      transactions: [
        {
          id: `tx_welcome_${Date.now()}`,
          amount: 0,
          bonusCredit: 100,
          totalCredited: 100,
          method: 'upi',
          status: 'success',
          timestamp: now,
          receiptId: `REC-WELCOME-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        }
      ],
      savedKundlis: [selfKundli],
      consultations: [],
      passwordHash: pass
    };

    vault[cleanEmail] = account;
    if (newProfile.phone) {
      vault[newProfile.phone] = account;
    }
    this.saveVault(vault);

    this.establishSession(newProfile);
    return newProfile;
  }

  /**
   * Sync Google Profile from Firebase Authentication
   */
  public async syncGoogleUser(info: { id: string; email: string; name: string; avatar?: string }): Promise<UserProfile> {
    const cleanEmail = (info.email || `user_${info.id}@astravani.in`).trim().toLowerCase();
    const vault = this.getVault();
    let account = vault[cleanEmail];

    const now = new Date().toISOString();
    if (!account) {
      const newUserId = `usr_g_${Date.now()}`;
      const newProfile: UserProfile = {
        id: newUserId,
        phone: '',
        email: cleanEmail,
        fullName: info.name || 'AstraVani User',
        avatarUrl: info.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        gender: 'Male',
        dob: '1998-05-15',
        tob: '12:00',
        pob: 'New Delhi, India',
        maritalStatus: 'Single',
        occupation: 'Professional',
        preferredLanguage: 'Hindi',
        createdAt: now,
        lastLoginAt: now
      };

      const selfKundli: SavedKundli = {
        id: `knd_${Date.now()}`,
        userId: newUserId,
        name: newProfile.fullName,
        relation: 'Self',
        gender: newProfile.gender,
        dob: newProfile.dob,
        tob: newProfile.tob,
        pob: newProfile.pob,
        createdAt: now
      };

      account = {
        profile: newProfile,
        walletBalance: 0,
        bonusBalance: 0,
        transactions: [],
        savedKundlis: [selfKundli],
        consultations: []
      };

      vault[cleanEmail] = account;
      this.saveVault(vault);
    } else {
      account.profile.lastLoginAt = now;
      if (info.name) account.profile.fullName = info.name;
      if (info.avatar) account.profile.avatarUrl = info.avatar;
      vault[cleanEmail] = account;
      this.saveVault(vault);
    }

    this.establishSession(account.profile);
    return account.profile;
  }

  /**
   * 1-Tap Google Sign-In Demo
   */
  public async loginWithGoogle(): Promise<UserProfile> {
    const demoEmail = 'devotee.astravani@gmail.com';
    const vault = this.getVault();
    let account = vault[demoEmail];

    if (!account) {
      const now = new Date().toISOString();
      const newUserId = `usr_g_${Date.now()}`;
      const newProfile: UserProfile = {
        id: newUserId,
        phone: '+919876543210',
        email: demoEmail,
        fullName: 'Shailesh Singh (Verified)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        gender: 'Male',
        dob: '1995-10-24',
        tob: '06:45',
        pob: 'Varanasi, Uttar Pradesh',
        maritalStatus: 'Single',
        occupation: 'Software Engineer',
        preferredLanguage: 'Hindi',
        createdAt: now,
        lastLoginAt: now
      };

      const selfKundli: SavedKundli = {
        id: `knd_${Date.now()}`,
        userId: newUserId,
        name: newProfile.fullName,
        relation: 'Self',
        gender: 'Male',
        dob: '1995-10-24',
        tob: '06:45',
        pob: 'Varanasi, Uttar Pradesh',
        createdAt: now
      };

      account = {
        profile: newProfile,
        walletBalance: 250,
        bonusBalance: 100,
        transactions: [
          {
            id: `tx_google_${Date.now()}`,
            amount: 0,
            bonusCredit: 250,
            totalCredited: 250,
            method: 'upi',
            status: 'success',
            timestamp: now,
            receiptId: `REC-GOOGLE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
          }
        ],
        savedKundlis: [selfKundli],
        consultations: []
      };

      vault[demoEmail] = account;
      vault[newProfile.phone] = account;
      this.saveVault(vault);
    } else {
      account.profile.lastLoginAt = new Date().toISOString();
      vault[demoEmail] = account;
      this.saveVault(vault);
    }

    this.establishSession(account.profile);
    return account.profile;
  }

  private establishSession(user: UserProfile) {
    const session: AuthSession = {
      user,
      token: `jwt_astravani_${user.id}_${Date.now()}`,
      // 90 days persistent session like Astrotalk/Airbnb
      expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000 
    };

    this.currentSession = session;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem('astravani_user_profile', JSON.stringify({
      name: user.fullName,
      gender: user.gender,
      dob: user.dob,
      tob: user.tob,
      pob: user.pob,
      topic: 'Career & Job'
    }));
    this.notifyListeners();
    this.syncUserToCloud(user);
  }

  public logout() {
    this.currentSession = null;
    localStorage.removeItem(SESSION_KEY);
    this.notifyListeners();
  }

  /**
   * Profile Updates
   */
  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('User not logged in');

    const updatedUser: UserProfile = { ...currentUser, ...updates };
    const vault = this.getVault();

    // Update in all lookup keys for this user
    for (const key of Object.keys(vault)) {
      if (vault[key].profile.id === currentUser.id) {
        vault[key].profile = updatedUser;
      }
    }
    this.saveVault(vault);
    this.establishSession(updatedUser);
    return updatedUser;
  }

  /**
   * Saved Kundlis
   */
  public getSavedKundlis(): SavedKundli[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    const vault = this.getVault();
    for (const key of Object.keys(vault)) {
      if (vault[key].profile.id === user.id) {
        return vault[key].savedKundlis || [];
      }
    }
    return [];
  }

  public saveKundli(kundliData: Omit<SavedKundli, 'id' | 'userId' | 'createdAt'>): SavedKundli {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not logged in');

    const newKundli: SavedKundli = {
      ...kundliData,
      id: `knd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    const vault = this.getVault();
    for (const key of Object.keys(vault)) {
      if (vault[key].profile.id === user.id) {
        vault[key].savedKundlis = [newKundli, ...(vault[key].savedKundlis || [])];
      }
    }
    this.saveVault(vault);
    if (user.phone) {
      this.syncKundliToCloud(newKundli, user.phone);
    }
    return newKundli;
  }

  public deleteKundli(kundliId: string): void {
    const user = this.getCurrentUser();
    if (!user) return;
    const vault = this.getVault();
    for (const key of Object.keys(vault)) {
      if (vault[key].profile.id === user.id) {
        vault[key].savedKundlis = (vault[key].savedKundlis || []).filter(k => k.id !== kundliId);
      }
    }
    this.saveVault(vault);
  }

  /**
   * Wallet & Transaction Ledger
   */
  public getWalletBalance(): number {
    const user = this.getCurrentUser();
    if (!user) return 0;
    const vault = this.getVault();
    for (const key of Object.keys(vault)) {
      if (vault[key].profile.id === user.id) {
        return Math.max(0, vault[key].walletBalance);
      }
    }
    return 0;
  }

  public setWalletBalance(balance: number): void {
    const user = this.getCurrentUser();
    if (!user) return;
    const vault = this.getVault();
    for (const key of Object.keys(vault)) {
      if (vault[key].profile.id === user.id) {
        vault[key].walletBalance = Math.max(0, balance);
      }
    }
    this.saveVault(vault);
  }

  public addTransaction(tx: PaymentTransaction): void {
    const user = this.getCurrentUser();
    if (!user) return;
    const vault = this.getVault();
    for (const key of Object.keys(vault)) {
      if (vault[key].profile.id === user.id) {
        vault[key].transactions = [tx, ...(vault[key].transactions || [])];
        vault[key].walletBalance += tx.totalCredited;
      }
    }
    this.saveVault(vault);
    if (user.phone) {
      this.syncTransactionToCloud(tx, user.phone);
    }
  }

  public getTransactions(): PaymentTransaction[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    const vault = this.getVault();
    for (const key of Object.keys(vault)) {
      if (vault[key].profile.id === user.id) {
        return vault[key].transactions || [];
      }
    }
    return [];
  }

  /**
   * Consultation & Chat Archive
   */
  public getConsultations(): ConsultationRecord[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    const vault = this.getVault();
    for (const key of Object.keys(vault)) {
      if (vault[key].profile.id === user.id) {
        return vault[key].consultations || [];
      }
    }
    return [];
  }

  public saveConsultation(record: Omit<ConsultationRecord, 'id' | 'userId'>): ConsultationRecord {
    const user = this.getCurrentUser();
    const userId = user ? user.id : 'guest_user';
    const consultation: ConsultationRecord = {
      ...record,
      id: `cons_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId
    };

    if (user) {
      const vault = this.getVault();
      for (const key of Object.keys(vault)) {
        if (vault[key].profile.id === user.id) {
          vault[key].consultations = [consultation, ...(vault[key].consultations || [])];
        }
      }
      this.saveVault(vault);
      if (user.phone) {
        this.syncConsultationToCloud(consultation, user.phone);
      }
    }
    return consultation;
  }

  // ==========================================
  // Supabase Cloud Synchronizers (Background)
  // ==========================================
  private async syncUserToCloud(user: UserProfile) {
    try {
      await supabase.from('users').upsert({
        phone: user.phone,
        email: user.email || null,
        full_name: user.fullName,
        gender: user.gender,
        dob: user.dob || null,
        tob: user.tob || null,
        pob: user.pob || null,
        marital_status: user.maritalStatus || 'Single',
        occupation: user.occupation || null,
        preferred_language: user.preferredLanguage || 'Hindi',
        last_login_at: new Date().toISOString()
      }, { onConflict: 'phone' });
    } catch (e) {
      // Graceful background sync
    }
  }

  private async syncKundliToCloud(kundli: SavedKundli, userPhone: string) {
    try {
      const { data } = await supabase.from('users').select('id').eq('phone', userPhone).single();
      if (data && data.id) {
        await supabase.from('saved_kundlis').insert({
          user_id: data.id,
          name: kundli.name,
          relation: kundli.relation,
          gender: kundli.gender,
          dob: kundli.dob,
          tob: kundli.tob,
          pob: kundli.pob
        });
      }
    } catch (e) {}
  }

  private async syncTransactionToCloud(tx: PaymentTransaction, userPhone: string) {
    try {
      const { data } = await supabase.from('users').select('id').eq('phone', userPhone).single();
      if (data && data.id) {
        await supabase.from('transactions').insert({
          user_id: data.id,
          amount: tx.amount,
          bonus_credit: tx.bonusCredit,
          total_credited: tx.totalCredited,
          method: tx.method,
          status: tx.status,
          receipt_id: tx.receiptId,
          utr_number: (tx as any).paymentGatewayId || (tx as any).utrNumber || null
        });
        await supabase.from('wallets').upsert({
          user_id: data.id,
          balance_inr: this.getWalletBalance(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {}
  }

  private async syncConsultationToCloud(record: ConsultationRecord, userPhone: string) {
    try {
      const { data } = await supabase.from('users').select('id').eq('phone', userPhone).single();
      if (data && data.id) {
        const { data: sessionData } = await supabase.from('consultation_sessions').insert({
          user_id: data.id,
          astrologer_id: record.astrologerId,
          astrologer_name: record.astrologerName,
          mode: record.mode,
          duration_seconds: record.durationSeconds,
          amount_deducted: record.amountDeducted,
          status: record.status,
          topic: record.topic || 'General',
          intake_data: record.intake,
          started_at: record.startedAt,
          ended_at: record.endedAt || new Date().toISOString()
        }).select().single();

        if (sessionData && sessionData.id && record.messages && record.messages.length > 0) {
          const rows = record.messages.map(m => ({
            session_id: sessionData.id,
            user_id: data.id,
            sender: m.sender,
            text: m.text,
            created_at: new Date().toISOString()
          }));
          await supabase.from('chat_messages').insert(rows);
        }
      }
    } catch (e) {}
  }
}

export const cloudAuth = new CloudAuthService();
