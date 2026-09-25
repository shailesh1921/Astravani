import React, { useState } from 'react';
import { ApiConfig, PaymentConfig, PaymentTransaction } from '../types/astrotalk';
import { 
  X, Wallet, Sparkles, Check, 
  CreditCard, History, Download, ExternalLink, ShieldCheck 
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onSelectRechargePack: (pack: { pay: number; get: number; tag: string; bonus: string }) => void;
  transactions: PaymentTransaction[];
  paymentConfig: PaymentConfig;
  onUpdatePaymentConfig: (config: PaymentConfig) => void;
  apiConfig?: ApiConfig;
  onUpdateApiConfig?: (config: ApiConfig) => void;
  initialTab?: 'wallet' | 'gateway' | 'history';
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  walletBalance,
  onSelectRechargePack,
  transactions,
  paymentConfig,
  onUpdatePaymentConfig,
  initialTab = 'wallet'
}) => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'gateway' | 'history'>(initialTab);

  // Cashfree Gateway state (Default & Recommended)
  const [tempCfAppId, setTempCfAppId] = useState(paymentConfig.cashfreeAppId || import.meta.env.VITE_CASHFREE_APP_ID || '');
  const [tempCfSecret, setTempCfSecret] = useState(paymentConfig.cashfreeSecretKey || import.meta.env.VITE_CASHFREE_SECRET_KEY || '');
  const [tempCfEnv, setTempCfEnv] = useState<'sandbox' | 'production'>(paymentConfig.cashfreeEnv || 'sandbox');
  const [tempGatewayProvider, setTempGatewayProvider] = useState<'cashfree' | 'razorpay' | 'direct'>(paymentConfig.gatewayProvider || 'cashfree');
  
  // Razorpay Gateway state
  const [tempRzpKey, setTempRzpKey] = useState(paymentConfig.razorpayKeyId || '');
  const [savedGatewaySuccess, setSavedGatewaySuccess] = useState(false);

  if (!isOpen) return null;

  const packs = [
    { pay: 50, get: 100, tag: 'Popular', bonus: '100% EXTRA' },
    { pay: 100, get: 200, tag: 'Best Value', bonus: '100% EXTRA' },
    { pay: 250, get: 500, tag: 'Super Saver', bonus: '100% EXTRA' },
    { pay: 500, get: 1100, tag: 'Mega Pack', bonus: '120% EXTRA' },
  ];

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePaymentConfig({
      gatewayProvider: tempGatewayProvider,
      cashfreeAppId: tempCfAppId.trim(),
      cashfreeSecretKey: tempCfSecret.trim(),
      cashfreeEnv: tempCfEnv,
      razorpayKeyId: tempRzpKey.trim(),
      currency: 'INR'
    });
    setSavedGatewaySuccess(true);
    setTimeout(() => setSavedGatewaySuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-xl shadow-2xl border-t sm:border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slide-up sm:animate-none">
        
        {/* Navigation Tabs Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 pt-3 pb-3 sm:p-4 flex flex-col flex-shrink-0">
          {/* Mobile Bottom-sheet Drag Handle */}
          <div className="w-12 h-1.5 bg-white/40 rounded-full mx-auto mb-2.5 sm:hidden" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'wallet', label: 'Recharge Wallet', icon: Wallet },
                { id: 'history', label: 'Transaction History', icon: History },
                { id: 'gateway', label: 'Payment Gateway', icon: CreditCard },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer flex-shrink-0 min-h-[36px] ${
                      activeTab === t.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 text-white cursor-pointer ml-2 flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: WALLET RECHARGE PACKS */}
        {activeTab === 'wallet' && (
          <div className="p-5 sm:p-6 pb-safe space-y-5 overflow-y-auto">
            
            {/* Balance Badge */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">Available Consultation Balance</span>
                <span className="text-2xl font-black text-slate-900">₹{walletBalance}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                🪙
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Recharge Pack (100% Extra Active)
                </h4>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  ⚡ UPI, Cards, NetBanking
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {packs.map((pack) => (
                  <button
                    key={pack.pay}
                    onClick={() => onSelectRechargePack(pack)}
                    className="p-3.5 border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 rounded-2xl text-left transition relative group cursor-pointer"
                  >
                    <span className="absolute -top-2.5 right-3 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-tight">
                      {pack.bonus}
                    </span>
                    <span className="text-xs font-bold text-slate-500 block">Pay ₹{pack.pay}</span>
                    <span className="text-lg font-extrabold text-slate-900 block mt-0.5">
                      Get ₹{pack.get}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                      Proceed to Checkout →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>NPCI UPI & RBI Guidelines Compliant</span>
              </span>
              <button 
                onClick={() => setActiveTab('gateway')}
                className="text-amber-600 font-bold hover:underline cursor-pointer"
              >
                Gateway Settings
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTION HISTORY / RECEIPTS */}
        {activeTab === 'history' && (
          <div className="p-5 sm:p-6 pb-safe space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Payment & Recharge History</h4>
                <p className="text-xs text-slate-500">All authenticated wallet transactions</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                {transactions.length} Records
              </span>
            </div>

            {transactions.length > 0 ? (
              <div className="space-y-2.5">
                {transactions.map((txn) => (
                  <div key={txn.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{txn.id}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {txn.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {txn.timestamp} • Via {txn.method.toUpperCase()}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-700 block">
                        +₹{txn.totalCredited}
                      </span>
                      <span className="text-[10px] text-slate-400">Paid ₹{txn.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <History className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs">No recharge transactions found yet.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PAYMENT GATEWAY SETTINGS (CASHFREE & RAZORPAY) */}
        {activeTab === 'gateway' && (
          <form onSubmit={handleSaveGateway} className="p-5 sm:p-6 pb-safe space-y-4 overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900">Payment Gateway Configuration</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Configure your payment gateway. Cashfree Payments provides 0% setup fee, instant UPI & Card checkouts.
              </p>
            </div>

            {/* Gateway Mode Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Gateway</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTempGatewayProvider('cashfree')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition text-center ${
                    tempGatewayProvider === 'cashfree'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cashfree (Active)
                </button>
                <button
                  type="button"
                  onClick={() => setTempGatewayProvider('razorpay')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition text-center ${
                    tempGatewayProvider === 'razorpay'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Razorpay SDK
                </button>
                <button
                  type="button"
                  onClick={() => setTempGatewayProvider('direct')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition text-center ${
                    tempGatewayProvider === 'direct'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Direct UPI / QR
                </button>
              </div>
            </div>

            {/* Cashfree Fields */}
            {tempGatewayProvider === 'cashfree' && (
              <div className="space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Cashfree Environment</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTempCfEnv('sandbox')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                        tempCfEnv === 'sandbox'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Test Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempCfEnv('production')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                        tempCfEnv === 'production'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Live Production
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Cashfree App ID (Client ID)
                  </label>
                  <input
                    type="text"
                    value={tempCfAppId}
                    onChange={(e) => setTempCfAppId(e.target.value)}
                    placeholder="TEST... or CF..."
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:border-amber-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Cashfree Secret Key
                  </label>
                  <input
                    type="password"
                    value={tempCfSecret}
                    onChange={(e) => setTempCfSecret(e.target.value)}
                    placeholder="cfsk_..."
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:border-amber-500 text-slate-900"
                  />
                </div>

                <p className="text-[11px] text-slate-500">
                  Your sandbox keys are loaded and ready. Once Cashfree completes document approval, toggle to <strong>Live Production</strong> and paste your live keys.
                </p>
              </div>
            )}

            {/* Razorpay Key ID */}
            {tempGatewayProvider === 'razorpay' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Razorpay Key ID (Test or Live)
                </label>
                <input
                  type="text"
                  value={tempRzpKey}
                  onChange={(e) => setTempRzpKey(e.target.value)}
                  placeholder="rzp_test_... or rzp_live_..."
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 text-slate-900"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="btn-astrotalk w-full py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {savedGatewaySuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Payment Settings Saved!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save Payment Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
