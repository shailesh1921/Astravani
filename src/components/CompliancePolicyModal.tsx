import React from 'react';
import { X, ShieldCheck, FileText, RefreshCw, Mail, CheckCircle2, MapPin } from 'lucide-react';

export type PolicyTab = 'terms' | 'privacy' | 'refund' | 'contact';

interface CompliancePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: PolicyTab;
  onTabChange: (tab: PolicyTab) => void;
}

export const CompliancePolicyModal: React.FC<CompliancePolicyModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-3xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border-t sm:border border-slate-200 animate-slide-up sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 pt-3 pb-4 sm:px-6 sm:py-4 flex flex-col text-white flex-shrink-0">
          {/* Mobile Bottom-sheet Drag Handle */}
          <div className="w-12 h-1.5 bg-white/40 rounded-full mx-auto mb-2.5 sm:hidden" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg">
                ॐ
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold">AstraVani Legal & Compliance</h2>
                <p className="text-xs text-amber-100">AstraVani Online Vedic Astrology Services (astravani.in)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto">
          <button
            onClick={() => onTabChange('terms')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-amber-500 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Terms & Conditions
          </button>

          <button
            onClick={() => onTabChange('privacy')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-amber-500 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Privacy Policy
          </button>

          <button
            onClick={() => onTabChange('refund')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'refund'
                ? 'border-amber-500 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Refund & Cancellation
          </button>

          <button
            onClick={() => onTabChange('contact')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'contact'
                ? 'border-amber-500 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            Contact & Business Info
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 pb-safe overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed max-h-[65vh]">
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">Terms & Conditions</h3>
              <p className="text-xs text-slate-500">Last updated: September 2026</p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">1. Acceptance of Terms</h4>
                <p>
                  By accessing and using <strong>AstraVani</strong> (available at <a href="https://astravani.in" className="text-amber-600 underline">https://astravani.in</a> and <a href="https://www.astravani.in" className="text-amber-600 underline">https://www.astravani.in</a>), you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.
                </p>

                <h4 className="font-semibold text-slate-800">2. Services Offered</h4>
                <p>
                  AstraVani provides digital Vedic astrology consultations, Janam Kundli chart generation, 36-Guna Kundli matching, and daily horoscopes. Astrological predictions are an empirical interpretation based on ancient Indian astrological sciences for personal guidance.
                </p>

                <h4 className="font-semibold text-slate-800">3. User Wallet & Digital Transactions</h4>
                <p>
                  Users may add funds to their AstraVani wallet via secure verified payment gateways (UPI, Netbanking, Debit/Credit Cards). Wallet credits are utilized strictly for per-minute or per-service consultation fees.
                </p>

                <h4 className="font-semibold text-slate-800">4. User Conduct</h4>
                <p>
                  Users agree to provide accurate birth details (date, time, place) to enable precise astrological calculations. Any abusive language, harassment, or unauthorized exploitation of the platform will result in immediate termination of account access.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">Privacy Policy</h3>
              <p className="text-xs text-slate-500">Last updated: September 2026</p>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">1. Information We Collect</h4>
                <p>
                  We collect user-provided details including name, birth date, exact birth time, and birth place solely to compute mathematical planetary charts (Kundli) and provide astrological consultation.
                </p>

                <h4 className="font-semibold text-slate-800">2. Confidentiality & Encryption</h4>
                <p>
                  All consultation chats and personal discussions between users and astrologers on AstraVani are strictly confidential. We do not sell, rent, or trade your personal birth information to any third parties.
                </p>

                <h4 className="font-semibold text-slate-800">3. Payment Security</h4>
                <p>
                  We do not store complete credit card or debit card numbers on our servers. All financial transactions are securely processed through RBI-authorized payment aggregators (Cashfree / Razorpay) adhering to PCI-DSS Level 1 compliance and 256-bit SSL encryption.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">Refund & Cancellation Policy</h3>
              <p className="text-xs text-slate-500">Last updated: September 2026</p>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">1. 100% Satisfaction & Technical Drop Guarantee</h4>
                <p>
                  At AstraVani, customer trust is our highest priority. If a consultation is interrupted due to network disconnections, system errors, or platform unavailability, the deducted amount will be immediately refunded to your AstraVani wallet balance.
                </p>

                <h4 className="font-semibold text-slate-800">2. Wallet Recharge Refunds</h4>
                <p>
                  If you recharge your wallet by mistake or encounter duplicate debits from your bank account during a payment gateway transaction, you can request a reversal within 48 hours by emailing <a href="mailto:support@astravani.in" className="text-amber-600 font-semibold underline">support@astravani.in</a> with your transaction ID.
                </p>

                <h4 className="font-semibold text-slate-800">3. Processing Timeline</h4>
                <p>
                  Approved refunds to original payment sources (UPI, Credit/Debit card, or Netbanking) are processed within <strong>5 to 7 business days</strong> as per standard banking schedules.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">Contact & Business Information</h3>
              <p className="text-xs text-slate-500">Merchant Information for Customers & Compliance</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Platform & Brand</h4>
                  <p className="font-bold text-slate-900">AstraVani</p>
                  <p className="text-xs text-slate-600 mt-1">Official Domain: <a href="https://astravani.in" className="text-amber-600 font-semibold">https://astravani.in</a></p>
                  <p className="text-xs text-slate-600">Mirror: <a href="https://www.astravani.in" className="text-amber-600 font-semibold">https://www.astravani.in</a></p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Operator</h4>
                  <p className="font-bold text-slate-900">Shailesh Singh (AstraVani Services)</p>
                  <p className="text-xs text-slate-600 mt-1">Business Type: Sole Proprietorship / Professional Services</p>
                  <p className="text-xs text-slate-600">Operating Country: India (IN)</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-slate-900">Customer Support Email</h5>
                    <p className="text-slate-600">support@astravani.in (Response within 24 hours)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-slate-900">Registered Operational Address</h5>
                    <p className="text-slate-600">AstraVani Digital Services, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-slate-900">Digital Delivery Model</h5>
                    <p className="text-slate-600">
                      All consultations, horoscope calculations, and Janam Kundli charts are delivered instantly in digital format through web app interactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">© 2026 AstraVani (astravani.in). All rights reserved.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
