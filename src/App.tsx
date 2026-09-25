import React, { useState, useEffect } from 'react';
import { ASTROLOGERS_DATA } from './data/astrologersData';
import { Astrologer, ConsultationIntake, ApiConfig, PaymentConfig, PaymentTransaction, UserProfile } from './types/astrotalk';
import { cloudAuth } from './services/cloudAuthService';
import { Header } from './components/Header';
import { QuickServicesBar } from './components/QuickServicesBar';
import { HeroBanner } from './components/HeroBanner';
import { AstrologersGrid } from './components/AstrologersGrid';
import { FreeKundliView } from './components/FreeKundliView';
import { KundliMatchingView } from './components/KundliMatchingView';
import { DailyHoroscopeView } from './components/DailyHoroscopeView';
import { KundliIntakeModal } from './components/KundliIntakeModal';
import { AstrologerChatModal } from './components/AstrologerChatModal';
import { AstrologerCallModal } from './components/AstrologerCallModal';
import { WalletModal } from './components/WalletModal';
import { PaymentCheckoutModal } from './components/PaymentCheckoutModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileDrawer } from './components/UserProfileDrawer';
import { AstrotalkFooter } from './components/AstrotalkFooter';
import { CompliancePolicyModal, PolicyTab } from './components/CompliancePolicyModal';
import { MobileBottomNav } from './components/MobileBottomNav';

export const App: React.FC = () => {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>('astrologers');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persistent User Authentication & Cloud Synchronization
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => cloudAuth.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Wallet balance
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('astrotalk_wallet');
    return saved ? parseInt(saved, 10) : 100;
  });

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
    localStorage.setItem('astrotalk_wallet', walletBalance.toString());
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem('astrotalk_payment_config', JSON.stringify(paymentConfig));
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
    setWalletBalance(prev => prev + transaction.totalCredited);
    setTransactions(prev => [transaction, ...prev]);
    if (cloudAuth.isAuthenticated()) {
      cloudAuth.addTransaction(transaction);
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

      {/* Main Content Area */}
      <main className="flex-1 pb-20 sm:pb-0">
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
          </>
        )}

        {activeTab === 'kundli' && (
          <FreeKundliView onConsultKundli={handleConsultFromTool} />
        )}

        {activeTab === 'matching' && (
          <KundliMatchingView onConsultMatch={handleConsultFromTool} />
        )}

        {activeTab === 'horoscope' && (
          <DailyHoroscopeView onConsultSign={handleConsultFromTool} />
        )}
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

      {/* Astrotalk Footer */}
      <AstrotalkFooter 
        onSelectNav={(tab) => setActiveTab(tab)} 
        onOpenPolicy={(tab) => {
          setPolicyTab(tab);
          setIsPolicyOpen(true);
        }}
      />

      {/* Legal & Compliance Policy Modal for Payment Gateway (Cashfree/Razorpay) Verification */}
      <CompliancePolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        activeTab={policyTab}
        onTabChange={(tab) => setPolicyTab(tab)}
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

    </div>
  );
};

export default App;
