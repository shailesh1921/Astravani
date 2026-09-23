import React, { useState } from 'react';
import { ApiConfig, PaymentConfig, PaymentTransaction } from '../types/astrotalk';
import { 
  X, Wallet, Sparkles, Check, KeyRound, Eye, EyeOff, 
  ShieldCheck, CreditCard, History, Download, ExternalLink 
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onSelectRechargePack: (pack: { pay: number; get: number; tag: string; bonus: string }) => void;
  transactions: PaymentTransaction[];
  paymentConfig: PaymentConfig;
  onUpdatePaymentConfig: (config: PaymentConfig) => void;
  apiConfig: ApiConfig;
  onUpdateApiConfig: (config: ApiConfig) => void;
  initialTab?: 'wallet' | 'gateway' | 'api' | 'history';
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  walletBalance,
  onSelectRechargePack,
  transactions,
  paymentConfig,
  onUpdatePaymentConfig,
  apiConfig,
  onUpdateApiConfig,
  initialTab = 'wallet'
}) => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'gateway' | 'api' | 'history'>(initialTab);
  
  // AI Key state
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiConfig.apiKey);
  const [tempProvider, setTempProvider] = useState<'gemini' | 'openai' | 'local'>(apiConfig.provider);
  const [tempModel, setTempModel] = useState(apiConfig.model);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Razorpay Gateway state
  const [tempRzpKey, setTempRzpKey] = useState(paymentConfig.razorpayKeyId || '');
  const [tempRzpProvider, setTempRzpProvider] = useState<'razorpay' | 'direct'>(paymentConfig.gatewayProvider || 'razorpay');
  const [savedGatewaySuccess, setSavedGatewaySuccess] = useState(false);

  if (!isOpen) return null;

  const packs = [
    { pay: 50, get: 100, tag: 'Popular', bonus: '100% EXTRA' },
    { pay: 100, get: 200, tag: 'Best Value', bonus: '100% EXTRA' },
    { pay: 250, get: 500, tag: 'Super Saver', bonus: '100% EXTRA' },
    { pay: 500, get: 1100, tag: 'Mega Pack', bonus: '120% EXTRA' },
  ];

  const handleSaveApi = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateApiConfig({
      provider: tempProvider,
      apiKey: tempKey.trim(),
      model: tempModel
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePaymentConfig({
      gatewayProvider: tempRzpProvider,
      razorpayKeyId: tempRzpKey.trim(),
      currency: 'INR'
    });
    setSavedGatewaySuccess(true);
    setTimeout(() => setSavedGatewaySuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Navigation Tabs Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'wallet', label: 'Recharge', icon: Wallet },
              { id: 'history', label: 'History', icon: History },
              { id: 'gateway', label: 'Payment Gateway', icon: CreditCard },
              { id: 'api', label: 'AI Settings', icon: KeyRound },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
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

          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer ml-2 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB 1: WALLET RECHARGE PACKS */}
        {activeTab === 'wallet' && (
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            
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
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
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

        {/* TAB 3: PAYMENT GATEWAY SETTINGS (RAZORPAY) */}
        {activeTab === 'gateway' && (
          <form onSubmit={handleSaveGateway} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900">Payment Gateway Configuration</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect your real Indian payment gateway. We support official Razorpay Standard Checkout (UPI, Cards, NetBanking).
              </p>
            </div>

            {/* Gateway Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Gateway Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTempRzpProvider('razorpay')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    tempRzpProvider === 'razorpay'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Razorpay (Official SDK)
                </button>
                <button
                  type="button"
                  onClick={() => setTempRzpProvider('direct')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    tempRzpProvider === 'direct'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Interactive UPI & Cards
                </button>
              </div>
            </div>

            {/* Razorpay Key ID */}
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
              <p className="text-[11px] text-slate-400 mt-1">
                Get your free Key ID instantly from <a href="https://dashboard.razorpay.com/#/access/api_keys" target="_blank" rel="noreferrer" className="text-amber-600 underline inline-flex items-center gap-0.5">Razorpay Dashboard <ExternalLink className="w-2.5 h-2.5" /></a>.
              </p>
            </div>

            {/* Step-by-Step Guide */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs space-y-1 text-slate-700">
              <span className="font-bold text-amber-900 block">How to get a Razorpay Key in 2 minutes:</span>
              <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-600">
                <li>Sign up at <span className="font-mono">razorpay.com</span></li>
                <li>Go to <strong>Settings → API Keys → Generate Key</strong></li>
                <li>Copy your <strong>Key ID</strong> (starts with <span className="font-mono">rzp_test_</span>) and paste here</li>
              </ol>
            </div>

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

        {/* TAB 4: AI SETTINGS */}
        {activeTab === 'api' && (
          <form onSubmit={handleSaveApi} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">AI Consultation Engine</h4>
              </div>
              <p className="text-xs text-slate-500">
                Connect your OpenAI or Google Gemini API Key. Each astrologer persona will query the model with authentic Vedic scholar instructions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">AI Provider</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTempProvider('gemini');
                    setTempModel('gemini-1.5-flash');
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    tempProvider === 'gemini'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Google Gemini (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempProvider('openai');
                    setTempModel('gpt-4o-mini');
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    tempProvider === 'openai'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  OpenAI (GPT-4o)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {tempProvider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder={tempProvider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                  className="w-full pr-10 pl-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Leave blank to use our built-in intelligent multi-persona astrological engine.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Model Name</label>
              <select
                value={tempModel}
                onChange={(e) => setTempModel(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 text-slate-800"
              >
                {tempProvider === 'gemini' ? (
                  <>
                    <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Cost Effective)</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash (Ultra Low Latency)</option>
                  </>
                ) : (
                  <>
                    <option value="gpt-4o-mini">gpt-4o-mini (Smart & Fast)</option>
                    <option value="gpt-4o">gpt-4o (Deep Reasoning)</option>
                  </>
                )}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-astrotalk w-full py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Settings Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save AI Configuration</span>
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
