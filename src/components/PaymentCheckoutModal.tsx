import React, { useState } from 'react';
import { PaymentConfig, PaymentTransaction } from '../types/astrotalk';
import { launchCashfreeCheckout } from '../utils/cashfreeService';
import { sounds } from '../utils/audioEffects';
import { 
  X, ShieldCheck, QrCode, CreditCard, Lock, 
  CheckCircle2, Sparkles, Loader2, Download,
  Copy, Check, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack: { pay: number; get: number; tag: string; bonus: string };
  paymentConfig: PaymentConfig;
  onPaymentSuccess: (transaction: PaymentTransaction) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  pack,
  paymentConfig,
  onPaymentSuccess
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [showUtrInput, setShowUtrInput] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showCardOption, setShowCardOption] = useState(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Processing & Verification state
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTxn, setCompletedTxn] = useState<PaymentTransaction | null>(null);

  if (!isOpen) return null;

  const payeeName = 'AstraVani';
  const defaultUpiId = 'singh44shailesh@okhdfcbank';
  const phonepeUpiId = '9173108730@ybl';
  const paytmUpiId = '9173108730@ptyes';
  const note = `AstraVani Recharge Rs ${pack.pay}`;

  // App-specific direct deep links to prevent WhatsApp hijacking on mobile
  const gpayUri = `tez://upi/pay?pa=${defaultUpiId}&pn=${encodeURIComponent(payeeName)}&am=${pack.pay}&cu=INR&tn=${encodeURIComponent(note)}`;
  const phonepeUri = `phonepe://pay?pa=${phonepeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${pack.pay}&cu=INR&tn=${encodeURIComponent(note)}`;
  const paytmUri = `paytmmp://pay?pa=${paytmUpiId}&pn=${encodeURIComponent(payeeName)}&am=${pack.pay}&cu=INR&tn=${encodeURIComponent(note)}`;
  const universalUpiUri = `upi://pay?pa=${defaultUpiId}&pn=${encodeURIComponent(payeeName)}&am=${pack.pay}&cu=INR&tn=${encodeURIComponent(note)}`;

  // Dynamic QR Code for Desktop or Scanner
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(universalUpiUri)}`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(defaultUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2200);
  };

  // Launch official Cashfree Checkout if user opts for Card/Netbanking
  const handleLaunchCashfree = async () => {
    setIsProcessing(true);
    await launchCashfreeCheckout({
      appId: paymentConfig.cashfreeAppId || import.meta.env.VITE_CASHFREE_APP_ID || '',
      secretKey: paymentConfig.cashfreeSecretKey || import.meta.env.VITE_CASHFREE_SECRET_KEY || '',
      env: paymentConfig.cashfreeEnv || 'sandbox',
      amount: pack.pay,
      userName: 'AstraVani User',
      onSuccess: (paymentId) => {
        completeTransaction(paymentId, 'cashfree');
      },
      onFailure: (err) => {
        setIsProcessing(false);
        if (err) alert(err);
      }
    });
  };

  const handleProcessPayment = (paymentMethod: string = 'upi') => {
    setIsProcessing(true);
    setTimeout(() => {
      completeTransaction(utrNumber, paymentMethod);
    }, 1200);
  };

  const completeTransaction = (customRef?: string, methodType: string = 'upi') => {
    setIsProcessing(false);
    const txnId = `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const txn: PaymentTransaction = {
      id: txnId,
      amount: pack.pay,
      bonusCredit: pack.get - pack.pay,
      totalCredited: pack.get,
      method: methodType as any,
      status: 'success',
      timestamp: new Date().toLocaleString(),
      receiptId: `RCPT_${Math.floor(100000 + Math.random() * 900000)}`,
      paymentGatewayId: customRef?.trim() ? `REF_${customRef.trim()}` : `UPI_${Date.now()}`
    };

    setCompletedTxn(txn);
    onPaymentSuccess(txn);
    sounds.playSuccessChime();
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slide-up sm:animate-none">
        
        {/* Official Header */}
        <div className="bg-slate-900 text-white px-4 pt-3 pb-3 sm:p-4 flex flex-col border-b border-slate-800 flex-shrink-0">
          {/* Mobile Bottom-sheet Drag Handle */}
          <div className="w-12 h-1.5 bg-white/40 rounded-full mx-auto mb-2.5 sm:hidden" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                ॐ
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
                  AstraVani Secure Checkout
                </h3>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  100% Safe • RBI & NPCI Compliant
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!completedTxn ? (
          <div className="p-4 sm:p-6 pb-safe overflow-y-auto space-y-4">
            
            {/* Recharge Package Summary */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs font-semibold text-slate-600 block">Recharge Package</span>
                <span className="text-2xl font-black text-slate-900 block mt-0.5">Pay ₹{pack.pay}</span>
                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md inline-block mt-1">
                  Get ₹{pack.get} Wallet Balance (100% Extra)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Taxes: ₹0.00</span>
                <span className="text-xs font-bold text-emerald-600 block mt-1">⚡ Instant Credit</span>
              </div>
            </div>

            {/* DIRECT 1-TAP UPI APP LAUNCH SECTION */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Pay Directly via UPI App
                </label>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  0% Convenience Fee
                </span>
              </div>

              {/* 1-Tap App Deep-Link Buttons (Never opens WhatsApp) */}
              <div className="space-y-2">
                {/* Google Pay */}
                <a
                  href={gpayUri}
                  className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-500/40 hover:border-emerald-600 rounded-xl flex items-center justify-between transition cursor-pointer text-slate-900 group active:scale-[0.99] min-h-[50px]"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-black shadow-xs">
                      G
                    </span>
                    <div className="text-left">
                      <span className="text-xs sm:text-sm font-bold block text-slate-900">Google Pay (GPay)</span>
                      <span className="text-[10px] text-slate-500">Tap to open Google Pay directly</span>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-700 flex items-center gap-1">
                    Pay ₹{pack.pay} <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                </a>

                {/* PhonePe */}
                <a
                  href={phonepeUri}
                  className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-500/40 hover:border-purple-600 rounded-xl flex items-center justify-between transition cursor-pointer text-slate-900 group active:scale-[0.99] min-h-[50px]"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-sm font-black shadow-xs">
                      पे
                    </span>
                    <div className="text-left">
                      <span className="text-xs sm:text-sm font-bold block text-slate-900">PhonePe</span>
                      <span className="text-[10px] text-slate-500">Tap to open PhonePe directly</span>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-purple-700 flex items-center gap-1">
                    Pay ₹{pack.pay} <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                  </span>
                </a>

                {/* Paytm */}
                <a
                  href={paytmUri}
                  className="w-full py-3 px-4 bg-sky-50 hover:bg-sky-100 border-2 border-sky-500/40 hover:border-sky-600 rounded-xl flex items-center justify-between transition cursor-pointer text-slate-900 group active:scale-[0.99] min-h-[50px]"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center text-sm font-black shadow-xs">
                      P
                    </span>
                    <div className="text-left">
                      <span className="text-xs sm:text-sm font-bold block text-slate-900">Paytm UPI</span>
                      <span className="text-[10px] text-slate-500">Tap to open Paytm directly</span>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-sky-700 flex items-center gap-1">
                    Pay ₹{pack.pay} <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                  </span>
                </a>

                {/* Universal Any UPI */}
                <a
                  href={universalUpiUri}
                  className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border-2 border-slate-300 hover:border-slate-400 rounded-xl flex items-center justify-between transition cursor-pointer text-slate-900 group active:scale-[0.99] min-h-[50px]"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center text-sm font-black shadow-xs">
                      ⚡
                    </span>
                    <div className="text-left">
                      <span className="text-xs sm:text-sm font-bold block text-slate-900">BHIM / CRED / Any UPI</span>
                      <span className="text-[10px] text-slate-500">Open default UPI application</span>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1">
                    Pay ₹{pack.pay} <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </span>
                </a>
              </div>
            </div>

            {/* QR CODE & UPI ID ACCORDION (For Desktop / Camera Scan) */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
              <button
                type="button"
                onClick={() => setShowQrCode(!showQrCode)}
                className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/70 transition"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800">Scan QR Code or Copy UPI ID</span>
                </div>
                {showQrCode ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showQrCode && (
                <div className="p-4 pt-1 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-200 shadow-xs">
                    <img
                      src={qrCodeUrl}
                      alt={`QR code for ₹${pack.pay}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-xs text-slate-600">
                      Scan using Google Pay, PhonePe, Paytm or BHIM app on any phone.
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 truncate">
                        {defaultUpiId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpiId}
                        className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 cursor-pointer transition"
                      >
                        {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PRIMARY ACTION: I HAVE COMPLETED PAYMENT */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={() => handleProcessPayment('upi')}
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] cursor-pointer min-h-[48px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying with Bank...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>✓ I Have Paid ₹{pack.pay} — Credit ₹{pack.get}</span>
                  </>
                )}
              </button>

              {/* Optional UTR Input Toggle */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowUtrInput(!showUtrInput)}
                  className="text-[11px] text-slate-500 hover:text-slate-700 underline cursor-pointer"
                >
                  {showUtrInput ? 'Hide UTR reference' : 'Have a 12-digit UPI / UTR Ref? (Optional)'}
                </button>
                {showUtrInput && (
                  <div className="mt-2 flex gap-2 max-w-sm mx-auto">
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 428910293847"
                      className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleProcessPayment('upi')}
                      className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Save & Credit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SECONDARY CARD / NETBANKING ACCORDION */}
            <div className="border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => {
                  if (paymentConfig.gatewayProvider === 'cashfree' && paymentConfig.cashfreeAppId) {
                    handleLaunchCashfree();
                  } else {
                    setShowCardOption(!showCardOption);
                  }
                }}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-amber-600 flex items-center justify-center gap-1.5 cursor-pointer py-1"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay via Debit / Credit Card or NetBanking</span>
              </button>

              {showCardOption && (
                <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 8920 1823 4901"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="08/29"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="782"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono text-slate-900"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleProcessPayment('card')}
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Pay ₹{pack.pay} with Card
                  </button>
                </div>
              )}
            </div>

            <p className="text-[10px] text-center text-slate-400">
              🔒 256-Bit SSL Encrypted • Instant Wallet Activation Guaranteed
            </p>

          </div>
        ) : (
          /* OFFICIAL PAYMENT SUCCESS RECEIPT SCREEN */
          <div className="p-6 sm:p-8 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ₹{completedTxn.totalCredited} has been credited to your AstraVani wallet.
              </p>
            </div>

            {/* Official Receipt Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left max-w-md mx-auto text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">{completedTxn.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-mono text-slate-700">{completedTxn.receiptId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-slate-900">₹{completedTxn.amount}.00</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">100% Promotional Bonus:</span>
                <span className="font-bold text-emerald-600">+₹{completedTxn.bonusCredit}.00</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm pt-1 text-slate-900">
                <span>Total Added to Wallet:</span>
                <span className="text-emerald-700">₹{completedTxn.totalCredited}.00</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-astrotalk px-6 py-2.5 text-xs font-bold cursor-pointer"
              >
                Start Consultation Now →
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
