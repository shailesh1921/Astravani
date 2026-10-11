import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ASTROLOGERS_DATA } from './data/astrologersData';
import { Astrologer, ConsultationIntake, ApiConfig, PaymentConfig, PaymentTransaction, UserProfile } from './types/astrotalk';
import { cloudAuth } from './services/cloudAuthService';
import { walletSecurity } from './utils/walletSecurity';
import { analytics } from './services/analytics';
import { getVariantLabel, getExperimentContext, syncExperimentContext } from './services/growthExperiments';
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
const BlogView = lazy(() => import('./components/BlogView').then(m => ({ default: m.BlogView })));
const DoshEncyclopediaView = lazy(() => import('./components/DoshEncyclopediaView').then(m => ({ default: m.DoshEncyclopediaView })));
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

// Smart specialist matching for Dosh Encyclopedia consultations
function doshKeywordMatch(astrologers: Astrologer[], doshName: string): {
  specialist: Astrologer | null;
  name: string;
  topic: 'Career & Job' | 'Marriage & Kundli' | 'Love & Relationship' | 'Business & Money' | 'Health & Well-being' | 'General';
} {
  const q = doshName.toLowerCase();
  const topic: 'Career & Job' | 'Marriage & Kundli' | 'Love & Relationship' | 'Business & Money' | 'Health & Well-being' | 'General' =
    q.includes('manglik') || q.includes('marriage') || q.includes('nadi') ? 'Marriage & Kundli'
    : q.includes('pitra') || q.includes('kaal') || q.includes('shrapit') || q.includes('guru') || q.includes('angarak') ? 'Health & Well-being'
    : q.includes('sade sati') || q.includes('shani') || q.includes('saturn') ? 'Career & Job'
    : 'General';

  const specialist = astrologers.find(a => {
    const specs = a.specialties.map(s => s.toLowerCase()).join(' ');
    if (q.includes('manglik') || q.includes('marriage')) return specs.includes('manglik') || specs.includes('marriage') || specs.includes('milan');
    if (q.includes('kaal sarp') || q.includes('rahu') || q.includes('ketu')) return specs.includes('rahu') || specs.includes('ketu') || specs.includes('kaal sarp');
    if (q.includes('sade sati') || q.includes('shani')) return specs.includes('sade sati') || specs.includes('shani') || specs.includes('shani sade sati');
    if (q.includes('pitra')) return specs.includes('pitra') || specs.includes('ancestral');
    if (q.includes('guru')) return specs.includes('guru') || specs.includes('jupiter');
    if (q.includes('angarak')) return specs.includes('mangal') || specs.includes('manglik');
    if (q.includes('shrapit')) return specs.includes('shani') || specs.includes('rahu');
    if (q.includes('gandmool')) return specs.includes('nakshatra') || specs.includes('ketu');
    return specs.includes('vedic') || specs.includes('dosha');
  }) || astrologers.find(a => a.personaType === 'vedic') || astrologers[0] || null;

  return { specialist, name: `${doshName} Jatak`, topic };
}

export const App: React.FC = () => {
  // Navigation & View state - supports direct deep linking
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['astrologers', 'kundli', 'matching', 'horoscope', 'blog', 'dosh'].includes(tab)) {
        return tab;
      }
    } catch (e) {}
    return 'astrologers';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastTool, setLastTool] = useState<'kundli' | 'matching' | 'horoscope' | 'blog' | 'dosh' | null>(null);
  const [detectedDosh, setDetectedDosh] = useState<string | null>(null);
  // Growth experiment: hero CTA framing (deterministic per visitor)
  const [heroCtaVariant] = useState<string | undefined>(() => {
    try {
      const v = getVariantLabel('hero_cta_copy_v1');
      return v || undefined;
    } catch (e) {
      return undefined;
    }
  });
  // Growth experiment: astrologer grid default sort (Smart Match vs Most Popular)
  const [gridDefaultSort] = useState<string>(() => {
    try {
      return getVariantLabel('astrologer_grid_sort_v1') === 'Smart Match' ? 'smart' : 'popular';
    } catch (e) {
      return 'popular';
    }
  });

  // Synchronize browser history and URL with activeTab
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('tab') !== activeTab) {
        url.searchParams.set('tab', activeTab);
        window.history.pushState({ tab: activeTab }, '', url.toString());
      }
    } catch (e) {}
  }, [activeTab]);

  // Dynamic SEO, Canonical & Meta Description Synchronization for Googlebot indexing
  useEffect(() => {
    try {
      const seoConfig: Record<string, { title: string; desc: string; canonical: string }> = {
        astrologers: {
          title: "AstraVani — Talk to 4,500+ Top Vedic Astrologers Online | Official Website",
          desc: "Consult India's most trusted Vedic astrologers 24/7 on AstraVani. Instant chat & call consultation with verified Jyotish Acharyas.",
          canonical: "https://www.astravani.in/"
        },
        kundli: {
          title: "Free Janam Kundli Online with Detailed Predictions & Dosha Analysis — AstraVani",
          desc: "Generate your 100% free Janam Kundli report by date of birth. Accurate Vedic birth chart, planetary positions, Lagna, Navamsha & Dasha analysis.",
          canonical: "https://www.astravani.in/?tab=kundli"
        },
        matching: {
          title: "Free Kundli Matching for Marriage (36 Gunas & Manglik Milan) — AstraVani",
          desc: "Calculate 36 Guna Ashtakoota compatibility, Manglik Dosha report, and marital harmony based on Vedic Jyotish. Free marriage horoscope matching.",
          canonical: "https://www.astravani.in/?tab=matching"
        },
        horoscope: {
          title: "Aaj Ka Rashifal 2026 — Daily Horoscope, Shubh Muhurat & Lucky Color — AstraVani",
          desc: "Read daily horoscope for all 12 zodiac signs (Mesh to Meen). Today's lucky number, auspicious timings, shubh color, and Vedic astrology forecasts.",
          canonical: "https://www.astravani.in/?tab=horoscope"
        },
        blog: {
          title: "Vedic Astrology Blog & Remedies — Kaal Sarp, Manglik & Sade Sati Upay — AstraVani",
          desc: "Comprehensive sacred Vedic guides on Kaal Sarp Dosh, Manglik Dosha, Shani Sade Sati, Rahu Mahadasha, and Vastu Shastra remedies for wealth.",
          canonical: "https://www.astravani.in/?tab=blog"
        },
        dosh: {
          title: "Grah Dosh Encyclopedia — Manglik, Kaal Sarp, Sade Sati & Pitra Dosh Upay — AstraVani",
          desc: "Complete Vedic reference on Manglik Dosha, Kaal Sarp Yog, Shani Sade Sati, Pitra Dosh, Guru Chandal, Angarak & Shrapit Dosh — causes, symptoms and authentic shanti upay.",
          canonical: "https://www.astravani.in/?tab=dosh"
        }
      };

      const currentSeo = seoConfig[activeTab] || seoConfig.astrologers;

      // Update Document Title
      document.title = currentSeo.title;

      // Update Meta Description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', currentSeo.desc);

      // Update Canonical Link
      const canonicalTag = document.querySelector('link[rel="canonical"]');
      if (canonicalTag) canonicalTag.setAttribute('href', currentSeo.canonical);

      // Update OpenGraph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', currentSeo.title);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', currentSeo.desc);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', currentSeo.canonical);
    } catch (e) {
      console.warn('SEO meta update error:', e);
    }
  }, [activeTab]);

  // Experiment assignment + context sync (deterministic, sticky per visitor)
  useEffect(() => {
    syncExperimentContext();
  }, []);

  // Scroll-depth engagement tracking (25/50/75/100% milestones, once per page view)
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const reached = new Set<number>();
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollable > 0) {
          const pct = Math.round((window.scrollY / scrollable) * 100);
          for (const m of milestones) {
            if (pct >= m && !reached.has(m)) {
              reached.add(m);
              try {
                analytics.trackEvent('scroll_depth', {
                  percent_scrolled: m,
                  page_path: window.location.search,
                  ...getExperimentContext(),
                });
              } catch (e) {
                // ignore
              }
            }
          }
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  // Handle browser back and forward buttons seamlessly
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') || e.state?.tab;
        if (tab && ['astrologers', 'kundli', 'matching', 'horoscope', 'blog', 'dosh'].includes(tab)) {
          setActiveTab(tab);
        } else {
          setActiveTab('astrologers');
        }
      } catch (err) {}
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track page views when activeTab changes
  useEffect(() => {
    const pagePaths: Record<string, string> = {
      astrologers: '/',
      kundli: '/kundli',
      matching: '/matching',
      horoscope: '/horoscope',
      blog: '/blog',
      dosh: '/dosh',
    };
    const pageTitles: Record<string, string> = {
      astrologers: 'Talk to Astrologers',
      kundli: 'Free Janam Kundli',
      matching: 'Kundli Matching (36 Guna Milan)',
      horoscope: 'Daily Horoscope (Rashifal)',
      blog: 'Vedic Astrology Blog',
      dosh: 'Grah Dosh Encyclopedia',
    };
    
    const path = pagePaths[activeTab] || '/';
    const title = pageTitles[activeTab] || 'AstraVani';
    
    analytics.trackPageView(path, title);
  }, [activeTab]);

  // Persistent User Authentication & Cloud Synchronization
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => cloudAuth.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Update analytics user properties when user changes
  useEffect(() => {
    if (currentUser) {
      analytics.init(currentUser.id, {
        user_id: currentUser.id,
        user_type: 'authenticated',
        preferred_language: currentUser.preferredLanguage || 'Hindi',
        has_free_trial: !cloudAuth.hasUsedFreeTrial(),
        wallet_balance: walletSecurity.getBalance(),
        total_consultations: cloudAuth.getConsultations().length,
      });
    } else {
      analytics.init(undefined, {
        user_type: 'guest',
      });
    }
  }, [currentUser]);

  // Tamper-proof signed wallet balance: Defaults strictly to 0
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    return walletSecurity.getBalance();
  });

  // Update analytics with wallet balance changes
  useEffect(() => {
    analytics.setUserProperties({
      wallet_balance: walletBalance,
    });
  }, [walletBalance]);

  // Payment configuration (Cashfree / Razorpay / Direct)
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => {
    const saved = localStorage.getItem('astravani_payment_config');
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
    const saved = localStorage.getItem('astravani_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // AI Configuration
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem('astravani_api_config');
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
    localStorage.setItem('astravani_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('astravani_api_config', JSON.stringify(apiConfig));
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

  // Frictionless 1-Tap Consultation Handlers (Zero form drop-off barrier)
  const handleInitiateChat = (astrologer: Astrologer) => {
    analytics.trackConsultationStart({
      astrologer_id: astrologer.id,
      mode: 'chat',
      is_free_trial: !cloudAuth.hasUsedFreeTrial(),
    });
    
    setSelectedAstrologer(astrologer);
    setIsCallMode(false);
    const intake: ConsultationIntake = currentIntake || {
      name: currentUser?.fullName || 'AstraVani Seeker',
      gender: 'Male',
      dob: '1996-01-01',
      tob: '12:00',
      pob: 'New Delhi, India',
      topic: 'Career & Job',
      question: ''
    };
    setCurrentIntake(intake);
    setIsIntakeOpen(false);
    setIsChatOpen(true);
  };

  const handleInitiateCall = (astrologer: Astrologer) => {
    analytics.trackConsultationStart({
      astrologer_id: astrologer.id,
      mode: 'call',
      is_free_trial: !cloudAuth.hasUsedFreeTrial(),
    });
    
    setSelectedAstrologer(astrologer);
    setIsCallMode(true);
    const intake: ConsultationIntake = currentIntake || {
      name: currentUser?.fullName || 'AstraVani Seeker',
      gender: 'Male',
      dob: '1996-01-01',
      tob: '12:00',
      pob: 'New Delhi, India',
      topic: 'Career & Job',
      question: ''
    };
    setCurrentIntake(intake);
    setIsIntakeOpen(false);
    setIsCallOpen(true);
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
      
      // Track wallet recharge
      analytics.trackWalletRecharge({
        amount: transaction.amount,
        bonus: transaction.bonusCredit,
        method: transaction.method,
      });
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

  const handleConsultFromTool = (astrologer?: Astrologer, intakeData?: Partial<ConsultationIntake>, sourceTool?: 'kundli' | 'matching' | 'horoscope' | 'blog' | 'dosh', dosh?: string) => {
    const target = astrologer || ASTROLOGERS_DATA[0];
    
    analytics.trackConsultationStart({
      astrologer_id: target.id,
      mode: 'chat',
      is_free_trial: !cloudAuth.hasUsedFreeTrial(),
    });
    
    // Track the source tool for smart matching
    if (sourceTool) {
      setLastTool(sourceTool);
    }
    if (dosh) {
      setDetectedDosh(dosh);
    }
    
    setSelectedAstrologer(target);
    setIsCallMode(false);

    // Frictionless payload forwarding from Kundli, Matching, or Daily Horoscope tools
    const intake: ConsultationIntake = {
      name: intakeData?.name || currentUser?.fullName || 'AstraVani Seeker',
      gender: intakeData?.gender || 'Male',
      dob: intakeData?.dob || '1996-01-01',
      tob: intakeData?.tob || '12:00',
      pob: intakeData?.pob || 'New Delhi, India',
      topic: intakeData?.topic || 'Career & Job',
      question: intakeData?.question || 'Pranam Pandit Ji, kripya meri kundli ka vishleshan karein.'
    };
    setCurrentIntake(intake);
    setIsIntakeOpen(false);
    setIsChatOpen(true);
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
              ctaLabel={heroCtaVariant}
            />
            <AstrologersGrid
              astrologers={ASTROLOGERS_DATA}
              searchQuery={searchQuery}
              onInitiateChat={handleInitiateChat}
              onInitiateCall={handleInitiateCall}
              userTool={lastTool || undefined}
              userDosh={detectedDosh || undefined}
              initialSort={gridDefaultSort}
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

          {activeTab === 'blog' && (
            <BlogView 
              onConsultArticle={(topic) => handleQuickTopicSelect(topic)}
              onOpenKundli={() => {
                setActiveTab('kundli');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenMatching={() => {
                setActiveTab('matching');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'dosh' && (
            <DoshEncyclopediaView
              onConsultDosh={(doshName, question) => {
                const matches = doshKeywordMatch(ASTROLOGERS_DATA, doshName);
                handleConsultFromTool(
                  matches.specialist || undefined,
                  {
                    name: matches.name,
                    gender: 'Male',
                    dob: '1995-01-01',
                    tob: '12:00',
                    pob: 'New Delhi, India',
                    topic: matches.topic,
                    question
                  },
                  'dosh',
                  doshName
                );
              }}
              onOpenKundli={() => {
                setActiveTab('kundli');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
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
          onNavigate={(tab) => {
            setIsChatOpen(false);
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
              onNavigate={(tab) => {
                setIsCallOpen(false);
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
