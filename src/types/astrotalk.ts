export interface Astrologer {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  languages: string[];
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  ordersCount: number;
  pricePerMin: number;
  originalPrice: number;
  avatarUrl: string;
  isOnline: boolean;
  isVerified: boolean;
  bio: string;
  greetingHindi: string;
  greetingEnglish: string;
  personaType: 'vedic' | 'tarot' | 'numerology' | 'nadi' | 'lal_kitab' | 'western';
  expertiseBadges: string[];
}

export interface ConsultationIntake {
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  tob: string;
  pob: string;
  topic: 'Love & Relationship' | 'Marriage & Kundli' | 'Career & Job' | 'Business & Money' | 'Health & Well-being' | 'General';
  question?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'astrologer' | 'system';
  text: string;
  timestamp: string;
  isAstrologicalChartNote?: boolean;
  status?: 'sending' | 'sent' | 'delivered';
}

export interface ChatSession {
  astrologer: Astrologer;
  intake: ConsultationIntake;
  messages: ChatMessage[];
  startTime: number;
  durationSeconds: number;
  totalCost: number;
  isActive: boolean;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  bonusCredit: number;
  totalCredited: number;
  method: 'upi' | 'card' | 'netbanking' | 'razorpay';
  status: 'success' | 'failed' | 'processing';
  timestamp: string;
  receiptId: string;
  paymentGatewayId?: string;
}

export interface PaymentConfig {
  gatewayProvider: 'razorpay' | 'direct';
  razorpayKeyId: string;
  currency: 'INR';
}

export interface WalletState {
  balance: number;
  history: PaymentTransaction[];
}

export interface ApiConfig {
  provider: 'gemini' | 'openai' | 'local';
  apiKey: string;
  model: string;
}

export interface HoroscopeSign {
  id: string;
  nameEn: string;
  nameHi: string;
  sanskrit: string;
  icon: string;
  dates: string;
  element: string;
  ruler: string;
  luckyNumber: number;
  luckyColor: string;
  luckyTime: string;
  overview: string;
  love: string;
  career: string;
  health: string;
}

export interface KundliData {
  name: string;
  gender: string;
  dob: string;
  tob: string;
  pob: string;
  lagnaSign: string;
  chandraRashi: string;
  suryaRashi: string;
  nakshatra: string;
  nakshatraPada: number;
  mahadasha: string;
  antardasha: string;
  tithi: string;
  yoga: string;
  karana: string;
  luckyGemstone: string;
  luckyMantra: string;
  favorableDeity: string;
  planets: {
    name: string;
    rashi: string;
    degree: string;
    nakshatra: string;
    house: number;
    isRetrograde?: boolean;
  }[];
  housePlacements: {
    houseNumber: number;
    sign: string;
    planets: string[];
  }[];
}

export interface GunaMilanResult {
  boyName: string;
  girlName: string;
  boyRashi: string;
  girlRashi: string;
  boyNakshatra: string;
  girlNakshatra: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  verdict: 'Excellent Match' | 'Very Good Match' | 'Average Match' | 'Requires Remedies';
  recommendation: string;
  isManglikBoy: boolean;
  isManglikGirl: boolean;
  manglikStatus: string;
  ashtakoota: {
    attribute: string;
    description: string;
    maxScore: number;
    obtainedScore: number;
    interpretation: string;
  }[];
}
