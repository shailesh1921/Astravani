/**
 * AstraVani Secure Wallet Integrity & Anti-Tamper Service
 * Protects client-side wallet state against browser DevTools manipulation
 * and unverified payment exploits.
 */

const STORAGE_KEY = 'astravani_secure_wallet_v2';
const LEGACY_KEY = 'astravani_wallet_balance';
const INTEGRITY_SALT = 'AstraVani_Vedic_Fin_Secure_2026_#@!9841';

interface SecureWalletPayload {
  balance: number;
  nonce: string;
  timestamp: number;
  signature: string;
}

// Lightweight fast deterministic hash (Murmur3 / DJB2 variant with salt)
function generateChecksum(balance: number, nonce: string, timestamp: number): string {
  const payload = `${balance}::${nonce}::${timestamp}::${INTEGRITY_SALT}`;
  let hash1 = 0xdeadbeef;
  let hash2 = 0x41c64e6d;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
  }
  hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & hash2) + (hash1 >>> 0)).toString(36);
}

export const walletSecurity = {
  /**
   * Retrieves verified wallet balance.
   * If any client-side tampering is detected, resets to 0.
   */
  getBalance(): number {
    try {
      // Remove deprecated insecure legacy keys
      if (typeof window !== 'undefined') {
        localStorage.removeItem('astrotalk_wallet');
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // If legacy key exists, reset to 0 to prevent migration of exploited values
        if (localStorage.getItem(LEGACY_KEY)) {
          localStorage.removeItem(LEGACY_KEY);
        }
        return 0;
      }

      const data: SecureWalletPayload = JSON.parse(raw);
      if (typeof data.balance !== 'number' || isNaN(data.balance) || data.balance < 0) {
        this.setBalance(0);
        return 0;
      }

      const expectedSig = generateChecksum(data.balance, data.nonce, data.timestamp);
      if (data.signature !== expectedSig) {
        console.warn('⚠️ [AstraVani Security] Tampering detected in wallet balance. Resetting balance to ₹0.');
        this.setBalance(0);
        return 0;
      }

      return Math.floor(data.balance);
    } catch (e) {
      console.error('Wallet validation error:', e);
      return 0;
    }
  },

  /**
   * Saves an integrity-signed wallet balance.
   */
  setBalance(balance: number): void {
    try {
      const cleanBalance = Math.max(0, Math.floor(isNaN(balance) ? 0 : balance));
      const nonce = Math.random().toString(36).substring(2, 10);
      const timestamp = Date.now();
      const signature = generateChecksum(cleanBalance, nonce, timestamp);

      const payload: SecureWalletPayload = {
        balance: cleanBalance,
        nonce,
        timestamp,
        signature
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      // Keep legacy key mirrored only as read-only display if needed, but always verified by token
      localStorage.setItem(LEGACY_KEY, cleanBalance.toString());
    } catch (e) {
      console.error('Failed to securely save wallet balance:', e);
    }
  },

  /**
   * Safely deducts amount from verified balance
   */
  deduct(amount: number): number {
    const current = this.getBalance();
    const newBal = Math.max(0, current - amount);
    this.setBalance(newBal);
    return newBal;
  },

  /**
   * Safely credits verified amount to balance
   */
  credit(amount: number): number {
    const current = this.getBalance();
    const newBal = current + Math.max(0, Math.floor(amount));
    this.setBalance(newBal);
    return newBal;
  }
};
