export type ZodiacSignName = 
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type VedicRashiName = 
  | 'Mesha' | 'Vrishabha' | 'Mithuna' | 'Karka'
  | 'Simha' | 'Kanya' | 'Tula' | 'Vrishchika'
  | 'Dhanu' | 'Makara' | 'Kumbha' | 'Meena';

export type ChineseZodiacName =
  | 'Rat' | 'Ox' | 'Tiger' | 'Rabbit'
  | 'Dragon' | 'Snake' | 'Horse' | 'Goat'
  | 'Monkey' | 'Rooster' | 'Dog' | 'Pig';

export type AstrologicalTradition = 'western' | 'vedic' | 'chinese' | 'integrated';

export type SupportedLanguage = 'en' | 'es' | 'hi' | 'fr' | 'de' | 'ja';

export interface BirthDetails {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthTimePeriod: 'AM' | 'PM';
  city: string;
  country: string;
  tradition: AstrologicalTradition;
}

export interface CalculatedPlanet {
  name: string;
  symbol: string;
  sign: ZodiacSignName;
  degree: number;
  house: number;
  vedicRashi?: VedicRashiName;
  nakshatra?: string;
  pada?: number;
}

export interface CalculatedChart {
  birthDetails: BirthDetails;
  western: {
    sun: CalculatedPlanet;
    moon: CalculatedPlanet;
    rising: CalculatedPlanet;
    midheaven: CalculatedPlanet;
    dominantElement: 'Fire' | 'Earth' | 'Air' | 'Water';
    elementDistribution: {
      fire: number;
      earth: number;
      air: number;
      water: number;
    };
    archetypeTitle: string;
  };
  vedic: {
    ascendantRashi: VedicRashiName;
    moonRashi: VedicRashiName;
    sunRashi: VedicRashiName;
    birthNakshatra: string;
    nakshatraLord: string;
    currentDasha: string;
    manglikStatus: 'Calm' | 'Neutral' | 'Dynamic';
  };
  chinese: {
    animal: ChineseZodiacName;
    element: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
    polarity: 'Yin' | 'Yang';
    pillarCharacteristics: string;
  };
}

export interface StructuredReading {
  cosmicSignature: string;
  coreInsight: string;
  timingCycles: string;
  practicalMicroAction: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'astra' | 'system';
  text: string;
  timestamp: string;
  structuredReading?: StructuredReading;
  isStreaming?: boolean;
}

export interface ZodiacSignInfo {
  name: ZodiacSignName;
  symbol: string;
  glyph: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruler: string;
  dates: string;
  summary: string;
  keywords: string[];
}
