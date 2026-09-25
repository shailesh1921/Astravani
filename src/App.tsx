import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ASTROLOGERS_DATA } from './data/astrologersData';
import { Astrologer, ConsultationIntake, ApiConfig, PaymentConfig, PaymentTransaction, UserProfile } from './types/astrotalk';
import { cloudAuth } from './services/cloudAuthService';
import { walletSecurity } from './utils/walletSecurity';
import { Header } from './components/Header';
import { QuickServicesBar } from './components/QuickServicesBar';
import { HeroBanner } from './components/HeroBanner';
import { AstrologersGrid } from './components/AstrologersGrid';
import { KundliIntakeModal } from './components/KundliIntakeModal';
import { AstrologerChatModal } from './components/AstrologerChatModal';
import { WalletModal } from './components/WalletModal';
import { AuthModal } from './components/AuthModal';
import { AstrotalkFooter } from './components/AstrotalkFooter';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LiveSocialProofToast } from './components/LiveSocialProofToast';
import { LiveTrustProofSection } from './components/LiveTrustProofSection';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { PolicyTab } from './components/CompliancePolicyModal';

// Code-splitting heavy secondary views and modals to optimize initial bundle size
const FreeKundliView = lazy(() => import('./components/FreeKundliView').then(m => ({ default: m.FreeKundliView })));
const KundliMatchingView = lazy(() => import('./components/KundliMatchingView').then(m => ({ default: m.KundliMatchingView })));
const DailyHoroscopeView = lazy(() => import('./components/DailyHoroscopeView').then(m => ({ default: m.DailyHoroscopeView })));
const AstrologerCallModal = lazy(() => import('./components/AstrologerCallModal').then(m => ({ default: m.AstrologerCallModal })));
const PaymentCheckoutModal = lazy(() => import('./components/PaymentCheckoutModal').then(m => ({ default: m.PaymentCheckoutModal })));
const CompliancePolicyModal = lazy(() => import('./components/CompliancePolicyModal').then(m => ({ default: m.CompliancePolicyModal })));
const UserProfileDrawer = lazy(() => import('./components/UserProfileDrawer').then(m => ({ default: m.UserProfileDrawer })));

const ViewSuspenseFallback: React.FC = () => (
  <div className="flex items-center justify-center p-12 min-h-[300px]">
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 rounded-full border-3 border-amber-500 border-t-transparent animate-spin" />
      <span className="text-xs text-slate-500 font-medium">Loading Vedic View...</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>('astrologers');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persistent User Authentication & Cloud Synchronization
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => cloudAuth.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Tamper-proof signed wallet balance: Defaults strictly to 0
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    return walletSecurity.getBalance();
  });

  useEffect(() => {
    walletSecurity.setBalance(walletBalance);
  }, [walletBalance]);

  // Payment configuration (Cashfree / Razorpay / Direct)
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => {
    const saved = localStorage.getItem('astrotalk_payment_config');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed.cashfreeAppId) return parsed;
      } catch (e) {}
    }
    return {
      gatewayProvider: 'cashfree',
      cashfreeAppId: import.meta.env.VITE_CASHFREE_APP_ID || '',
      cashfreeSecretKey: import.meta.env.VITE_CASHFREE_SECRET_KEY || '',
      cashfreeEnv: 'sandbox',
      currency: 'INR'
    };
  });

  // Transaction Ledger history
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('astrotalk_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // AI Configuration
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem('astrotalk_api_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      provider: 'gemini',
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      model: 'gemini-3.5-flash'
    };
  });

  // Modal states
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isCallMode, setIsCallMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [currentIntake, setCurrentIntake] = useState<ConsultationIntake | null>(null);

  // Wallet & Payment Checkout Modal states
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletTab, setWalletTab] = useState<'wallet' | 'gateway' | 'history'>('wallet');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<{ pay: number; get: number; tag: string; bonus: string } | null>(null);
  
  // Legal & Compliance Policy Modal states
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<PolicyTab>('terms');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('astravani_payment_config', JSON.stringify(paymentConfig));
  }, [paymentConfig]);

  useEffect(() => {
    localStorage.setItem('astrotalk_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('astrotalk_api_config', JSON.stringify(apiConfig));
  }, [apiConfig]);

  // Persistent Cloud User Subscription & Sync
  useEffect(() => {
    const unsub = cloudAuth.subscribe((user) => {
      setCurrentUser(user);
      if (user) {
        setWalletBalance(cloudAuth.getWalletBalance());
        setTransactions(cloudAuth.getTransactions());
      }
    });
    return () => unsub();
  }, []);

  // Active Consultation Session Recovery on Mount (Pull-to-refresh / tab reload safety)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('astravani_active_chat_session');
      if (raw) {
        const session = JSON.parse(raw);
        if (
          session &&
          session.astrologerId &&
          session.intake &&
          Date.now() - (session.lastUpdated || 0) < 30 * 60 * 1000
        ) {
          const astro = ASTROLOGERS_DATA.find((a) => a.id === session.astrologerId);
          if (astro) {
            setSelectedAstrologer(astro);
            setCurrentIntake(session.intake);
            setIsChatOpen(true);
          }
        }
      }
    } catch (e) {
      console.warn('Session recovery check failed:', e);
    }
  }, []);

  // Handlers
  const handleInitiateChat = (astrologer: Astrologer) => {
    setSelectedAstrologer(astrologer);
    setIsCallMode(false);
    setIsIntakeOpen(true);
  };

  const handleInitiateCall = (astrologer: Astrologer) => {
    setSelectedAstrologer(astrologer);
    setIsCallMode(true);
    setIsIntakeOpen(true);
  };

  const handleIntakeSubmit = (intake: ConsultationIntake) => {
    setCurrentIntake(intake);
    setIsIntakeOpen(false);
    if (isCallMode) {
      setIsCallOpen(true);
    } else {
      setIsChatOpen(true);
    }
  };

  const handleDeductWallet = (amount: number) => {
    setWalletBalance(prev => {
      const next = Math.max(0, prev - amount);
      walletSecurity.setBalance(next);
      if (cloudAuth.isAuthenticated()) {
        cloudAuth.setWalletBalance(next);
      }
      return next;
    });
  };

  const handleSelectRechargePack = (pack: { pay: number; get: number; tag: string; bonus: string }) => {
    setSelectedPack(pack);
    setIsWalletOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (transaction: PaymentTransaction) => {
    setTransactions(prev => [transaction, ...prev]);
    if (transaction.status === 'success') {
      const nextBal = walletSecurity.credit(transaction.totalCredited);
      setWalletBalance(nextBal);
      if (cloudAuth.isAuthenticated()) {
        cloudAuth.addTransaction(transaction);
      }
    } else {
      // Pending verification from manual UTR -> do not credit balance
      if (cloudAuth.isAuthenticated()) {
        cloudAuth.addTransaction(transaction);
      }
    }
  };

  const handleQuickTopicSelect = (topic: string) => {
    setSearchQuery(topic);
    setActiveTab('astrologers');
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const handleConsultFromTool = (astrologer?: Astrologer) => {
    const target = astrologer || ASTROLOGERS_DATA[0];
    handleInitiateChat(target);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900 w-full overflow-x-hidden">
      
      {/* Header */}
      <Header
        walletBalance={walletBalance}
        onOpenWallet={() => {
          setWalletTab('wallet');
          setIsWalletOpen(true);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileDrawerOpen(true)}
      />

      {/* Circular Quick Services Bar */}
      <QuickServicesBar
        onSelectService={(serviceId) => {
          if (serviceId === 'astrologers-call') {
            setActiveTab('astrologers');
            window.scrollTo({ top: 450, behavior: 'smooth' });
          } else if (serviceId === 'tarot') {
            setActiveTab('astrologers');
            setSearchQuery('Tarot');
            window.scrollTo({ top: 450, behavior: 'smooth' });
          } else if (serviceId === 'astromall') {
            setActiveTab('astrologers');
            setSearchQuery('Vedic');
            window.scrollTo({ top: 450, behavior: 'smooth' });
          } else if (serviceId === 'panchang') {
            setActiveTab('horoscope');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setActiveTab(serviceId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        activeService={activeTab}
      />

      {/* Main Content Area (Extra bottom clearance so sticky mobile nav never obscures CTAs) */}
      <main className="flex-1 pb-24 sm:pb-0 w-full overflow-x-hidden">
        {activeTab === 'astrologers' && (
          <>
            <HeroBanner
              onQuickTopicSelect={handleQuickTopicSelect}
              onExploreAstrologers={() => {
                window.scrollTo({ top: 450, behavior: 'smooth' });
              }}
              onInitiateChat={handleInitiateChat}
              onSelectTab={(tab) => setActiveTab(tab)}
              topAstrologer={ASTROLOGERS_DATA[0]}
            />
            <AstrologersGrid
              astrologers={ASTROLOGERS_DATA}
              searchQuery={searchQuery}
              onInitiateChat={handleInitiateChat}
              onInitiateCall={handleInitiateCall}
            />
            <LiveTrustProofSection />
          </>
        )}

        <Suspense fallback={<ViewSuspenseFallback />}>
          {activeTab === 'kundli' && (
            <FreeKundliView onConsultKundli={handleConsultFromTool} />
          )}

          {activeTab === 'matching' && (
            <KundliMatchingView onConsultMatch={handleConsultFromTool} />
          )}

          {activeTab === 'horoscope' && (
            <DailyHoroscopeView onConsultSign={handleConsultFromTool} />
          )}
        </Suspense>
      </main>

      {/* Consultation Modals */}
      {selectedAstrologer && (
        <KundliIntakeModal
          astrologer={selectedAstrologer}
          isOpen={isIntakeOpen}
          onClose={() => setIsIntakeOpen(false)}
          onSubmit={handleIntakeSubmit}
          isCallMode={isCallMode}
        />
      )}

      {selectedAstrologer && currentIntake && (
        <AstrologerChatModal
          astrologer={selectedAstrologer}
          intake={currentIntake}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          walletBalance={walletBalance}
          onDeductWallet={handleDeductWallet}
          onOpenRecharge={() => {
            setWalletTab('wallet');
            setIsWalletOpen(true);
          }}
          apiConfig={apiConfig}
        />
      )}

      {/* Voice Call Consultation Modal */}
      <Suspense fallback={null}>
        {selectedAstrologer && currentIntake && (
          <AstrologerCallModal
            astrologer={selectedAstrologer}
            intake={currentIntake}
            isOpen={isCallOpen}
            onClose={() => setIsCallOpen(false)}
            walletBalance={walletBalance}
            onDeductWallet={handleDeductWallet}
            onOpenRecharge={() => {
              setWalletTab('wallet');
              setIsWalletOpen(true);
            }}
            onSwitchToChat={() => {
              setIsCallOpen(false);
              setIsChatOpen(true);
            }}
          />
        )}

        {/* Real Payment Gateway Checkout Modal (UPI, Cards, Razorpay) */}
        {selectedPack && (
          <PaymentCheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            pack={selectedPack}
            paymentConfig={paymentConfig}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {/* Legal & Compliance Policy Modal for Payment Gateway Verification */}
        <CompliancePolicyModal
          isOpen={isPolicyOpen}
          onClose={() => setIsPolicyOpen(false)}
          activeTab={policyTab}
          onTabChange={(tab) => setPolicyTab(tab)}
        />

        {/* Slide-over User Profile, Saved Kundlis, Ledger & Chat History Drawer */}
        {currentUser && (
          <UserProfileDrawer
            isOpen={isProfileDrawerOpen}
            onClose={() => setIsProfileDrawerOpen(false)}
            currentUser={currentUser}
            onLogout={() => {
              cloudAuth.logout();
              setCurrentUser(null);
            }}
            onOpenRecharge={() => {
              setWalletTab('wallet');
              setIsWalletOpen(true);
            }}
          />
        )}
      </Suspense>

      {/* Wallet Management & Settings Modal */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        walletBalance={walletBalance}
        onSelectRechargePack={handleSelectRechargePack}
        transactions={transactions}
        paymentConfig={paymentConfig}
        onUpdatePaymentConfig={(cfg) => setPaymentConfig(cfg)}
        apiConfig={apiConfig}
        onUpdateApiConfig={(cfg) => setApiConfig(cfg)}
        initialTab={walletTab}
      />

      {/* Astrotalk Footer */}
      <AstrotalkFooter 
        onSelectNav={(tab) => setActiveTab(tab)} 
        onOpenPolicy={(tab) => {
          setPolicyTab(tab);
          setIsPolicyOpen(true);
        }}
      />

      {/* Cloud Authentication Modal (Phone OTP, Email/Pass, Google 1-Tap) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setWalletBalance(cloudAuth.getWalletBalance());
          setTransactions(cloudAuth.getTransactions());
        }}
      />

      {/* Mobile Sticky Bottom Navigation (<640px) with 1-Tap Account Switcher */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletBalance={walletBalance}
        onOpenWallet={() => {
          setWalletTab('wallet');
          setIsWalletOpen(true);
        }}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileDrawerOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Floating Live Social Proof Activity Toast */}
      <LiveSocialProofToast />

      {/* Progressive Web App (PWA) Mobile Install Prompt */}
      <PwaInstallBanner />

    </div>
  );
};

export default App;
