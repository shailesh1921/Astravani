import React, { useState, useEffect } from 'react';
import { ASTROLOGERS_DATA } from './data/astrologersData';
import { Astrologer, ConsultationIntake, ApiConfig, PaymentConfig, PaymentTransaction } from './types/astrotalk';
import { Header } from './components/Header';
import { QuickServicesBar } from './components/QuickServicesBar';
import { HeroBanner } from './components/HeroBanner';
import { AstrologersGrid } from './components/AstrologersGrid';
import { FreeKundliView } from './components/FreeKundliView';
import { KundliMatchingView } from './components/KundliMatchingView';
import { DailyHoroscopeView } from './components/DailyHoroscopeView';
import { KundliIntakeModal } from './components/KundliIntakeModal';
import { AstrologerChatModal } from './components/AstrologerChatModal';
import { WalletModal } from './components/WalletModal';
import { PaymentCheckoutModal } from './components/PaymentCheckoutModal';
import { AstrotalkFooter } from './components/AstrotalkFooter';

export const App: React.FC = () => {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>('astrologers');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Wallet balance
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('astrotalk_wallet');
    return saved ? parseInt(saved, 10) : 100;
  });

  // Payment configuration (Razorpay / Direct)
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => {
    const saved = localStorage.getItem('astrotalk_payment_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      gatewayProvider: 'razorpay',
      razorpayKeyId: '',
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
      apiKey: '',
      model: 'gemini-1.5-flash'
    };
  });

  // Modal states
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isCallMode, setIsCallMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentIntake, setCurrentIntake] = useState<ConsultationIntake | null>(null);

  // Wallet & Payment Checkout Modal states
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletTab, setWalletTab] = useState<'wallet' | 'gateway' | 'api' | 'history'>('wallet');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<{ pay: number; get: number; tag: string; bonus: string } | null>(null);

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
    setIsChatOpen(true);
  };

  const handleDeductWallet = (amount: number) => {
    setWalletBalance(prev => Math.max(0, prev - amount));
  };

  const handleSelectRechargePack = (pack: { pay: number; get: number; tag: string; bonus: string }) => {
    setSelectedPack(pack);
    setIsWalletOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (transaction: PaymentTransaction) => {
    setWalletBalance(prev => prev + transaction.totalCredited);
    setTransactions(prev => [transaction, ...prev]);
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* Header */}
      <Header
        walletBalance={walletBalance}
        onOpenWallet={() => {
          setWalletTab('wallet');
          setIsWalletOpen(true);
        }}
        onOpenSettings={() => {
          setWalletTab('api');
          setIsWalletOpen(true);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Circular Quick Services Bar */}
      <QuickServicesBar
        onSelectService={(serviceId) => {
          setActiveTab(serviceId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeService={activeTab}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'astrologers' && (
          <>
            <HeroBanner
              onQuickTopicSelect={handleQuickTopicSelect}
              onExploreAstrologers={() => {
                window.scrollTo({ top: 450, behavior: 'smooth' });
              }}
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
      <AstrotalkFooter onSelectNav={(tab) => setActiveTab(tab)} />

    </div>
  );
};

export default App;
