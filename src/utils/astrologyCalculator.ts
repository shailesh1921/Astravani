import { 
  BirthDetails, 
  CalculatedChart, 
  ZodiacSignInfo, 
  ZodiacSignName, 
  VedicRashiName, 
  ChineseZodiacName 
} from '../types/astrology';

export const ZODIAC_SIGNS: Record<ZodiacSignName, ZodiacSignInfo> = {
  Aries: {
    name: 'Aries',
    symbol: 'Ram',
    glyph: '♈',
    element: 'Fire',
    modality: 'Cardinal',
    ruler: 'Mars',
    dates: 'Mar 21 - Apr 19',
    summary: 'The initiator, courageous, passionate, and driven by instinctual pioneer spirit.',
    keywords: ['Courage', 'Initiative', 'Vitality', 'Pioneer', 'Assertive']
  },
  Taurus: {
    name: 'Taurus',
    symbol: 'Bull',
    glyph: '♉',
    element: 'Earth',
    modality: 'Fixed',
    ruler: 'Venus',
    dates: 'Apr 20 - May 20',
    summary: 'The builder, grounded in sensory beauty, unwavering perseverance, and tangible creation.',
    keywords: ['Grounded', 'Sensual', 'Steadfast', 'Loyal', 'Resourceful']
  },
  Gemini: {
    name: 'Gemini',
    symbol: 'Twins',
    glyph: '♊',
    element: 'Air',
    modality: 'Mutable',
    ruler: 'Mercury',
    dates: 'May 21 - Jun 20',
    summary: 'The messenger, endlessly curious, connecting diverse perspectives with intellectual agility.',
    keywords: ['Curiosity', 'Communication', 'Adaptability', 'Intellect', 'Playful']
  },
  Cancer: {
    name: 'Cancer',
    symbol: 'Crab',
    glyph: '♋',
    element: 'Water',
    modality: 'Cardinal',
    ruler: 'Moon',
    dates: 'Jun 21 - Jul 22',
    summary: 'The protector, deeply intuitive, safeguarding emotional sanctuaries and ancestral roots.',
    keywords: ['Nurturing', 'Intuition', 'Empathy', 'Protective', 'Deep-feeling']
  },
  Leo: {
    name: 'Leo',
    symbol: 'Lion',
    glyph: '♌',
    element: 'Fire',
    modality: 'Fixed',
    ruler: 'Sun',
    dates: 'Jul 23 - Aug 22',
    summary: 'The sovereign, radiant, generous of heart, inspiring others through creative self-expression.',
    keywords: ['Radiance', 'Generosity', 'Creativity', 'Leadership', 'Dignity']
  },
  Virgo: {
    name: 'Virgo',
    symbol: 'Maiden',
    glyph: '♍',
    element: 'Earth',
    modality: 'Mutable',
    ruler: 'Mercury',
    dates: 'Aug 23 - Sep 22',
    summary: 'The alchemist of detail, devoted to mastery, service, healing, and graceful refinement.',
    keywords: ['Precision', 'Discernment', 'Healing', 'Integrity', 'Practical Wisdom']
  },
  Libra: {
    name: 'Libra',
    symbol: 'Scales',
    glyph: '♎',
    element: 'Air',
    modality: 'Cardinal',
    ruler: 'Venus',
    dates: 'Sep 23 - Oct 22',
    summary: 'The peacemaker, seeking aesthetic balance, relational harmony, and higher justice.',
    keywords: ['Harmony', 'Justice', 'Elegance', 'Diplomacy', 'Partnership']
  },
  Scorpio: {
    name: 'Scorpio',
    symbol: 'Scorpion / Phoenix',
    glyph: '♏',
    element: 'Water',
    modality: 'Fixed',
    ruler: 'Pluto & Mars',
    dates: 'Oct 23 - Nov 21',
    summary: 'The transformer, penetrating mysteries, embracing psychological depth and spiritual rebirth.',
    keywords: ['Transformation', 'Intensity', 'Perception', 'Power', 'Regeneration']
  },
  Sagittarius: {
    name: 'Sagittarius',
    symbol: 'Archer / Centaur',
    glyph: '♐',
    element: 'Fire',
    modality: 'Mutable',
    ruler: 'Jupiter',
    dates: 'Nov 22 - Dec 21',
    summary: 'The truth-seeker, expansive philosophical explorer, hunting wisdom across horizons.',
    keywords: ['Exploration', 'Truth', 'Optimism', 'Philosophy', 'Freedom']
  },
  Capricorn: {
    name: 'Capricorn',
    symbol: 'Sea-Goat',
    glyph: '♑',
    element: 'Earth',
    modality: 'Cardinal',
    ruler: 'Saturn',
    dates: 'Dec 22 - Jan 19',
    summary: 'The master builder, patient architect of destiny, climbing summits through disciplined integrity.',
    keywords: ['Ambition', 'Mastery', 'Structure', 'Resilience', 'Legacy']
  },
  Aquarius: {
    name: 'Aquarius',
    symbol: 'Water Bearer',
    glyph: '♒',
    element: 'Air',
    modality: 'Fixed',
    ruler: 'Uranus & Saturn',
    dates: 'Jan 20 - Feb 18',
    summary: 'The visionary, innovating collective evolution, humanitarian breakthroughs, and unconventional truth.',
    keywords: ['Innovation', 'Freedom', 'Community', 'Futurist', 'Authenticity']
  },
  Pisces: {
    name: 'Pisces',
    symbol: 'Two Fishes',
    glyph: '♓',
    element: 'Water',
    modality: 'Mutable',
    ruler: 'Neptune & Jupiter',
    dates: 'Feb 19 - Mar 20',
    summary: 'The mystic, boundaryless empathy dissolving limits between self and cosmic consciousness.',
    keywords: ['Compassion', 'Transcendence', 'Dreaming', 'Mysticism', 'Flow']
  }
};

export const SIGNS_ORDER: ZodiacSignName[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const VEDIC_RASHIS: Record<ZodiacSignName, VedicRashiName> = {
  Aries: 'Mesha',
  Taurus: 'Vrishabha',
  Gemini: 'Mithuna',
  Cancer: 'Karka',
  Leo: 'Simha',
  Virgo: 'Kanya',
  Libra: 'Tula',
  Scorpio: 'Vrishchika',
  Sagittarius: 'Dhanu',
  Capricorn: 'Makara',
  Aquarius: 'Kumbha',
  Pisces: 'Meena'
};

export const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu' },
  { name: 'Bharani', lord: 'Venus' },
  { name: 'Krittika', lord: 'Sun' },
  { name: 'Rohini', lord: 'Moon' },
  { name: 'Mrigashira', lord: 'Mars' },
  { name: 'Ardra', lord: 'Rahu' },
  { name: 'Punarvasu', lord: 'Jupiter' },
  { name: 'Pushya', lord: 'Saturn' },
  { name: 'Ashlesha', lord: 'Mercury' },
  { name: 'Magha', lord: 'Ketu' },
  { name: 'Purva Phalguni', lord: 'Venus' },
  { name: 'Uttara Phalguni', lord: 'Sun' },
  { name: 'Hasta', lord: 'Moon' },
  { name: 'Chitra', lord: 'Mars' },
  { name: 'Swati', lord: 'Rahu' },
  { name: 'Vishakha', lord: 'Jupiter' },
  { name: 'Anuradha', lord: 'Saturn' },
  { name: 'Jyeshtha', lord: 'Mercury' },
  { name: 'Mula', lord: 'Ketu' },
  { name: 'Purva Ashadha', lord: 'Venus' },
  { name: 'Uttara Ashadha', lord: 'Sun' },
  { name: 'Shravana', lord: 'Moon' },
  { name: 'Dhanishta', lord: 'Mars' },
  { name: 'Shatabhisha', lord: 'Rahu' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn' },
  { name: 'Revati', lord: 'Mercury' }
];

export const CHINESE_ANIMALS: ChineseZodiacName[] = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
];

/**
 * Calculates Sun Longitude based on Day of Year
 */
export function calculateSunSign(date: Date): { sign: ZodiacSignName; degree: number } {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { sign: 'Aries', degree: day >= 21 ? day - 20 : day + 10 };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { sign: 'Taurus', degree: day >= 20 ? day - 19 : day + 11 };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { sign: 'Gemini', degree: day >= 21 ? day - 20 : day + 11 };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { sign: 'Cancer', degree: day >= 21 ? day - 20 : day + 10 };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { sign: 'Leo', degree: day >= 23 ? day - 22 : day + 9 };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { sign: 'Virgo', degree: day >= 23 ? day - 22 : day + 9 };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { sign: 'Libra', degree: day >= 23 ? day - 22 : day + 8 };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { sign: 'Scorpio', degree: day >= 23 ? day - 22 : day + 9 };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { sign: 'Sagittarius', degree: day >= 22 ? day - 21 : day + 9 };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { sign: 'Capricorn', degree: day >= 22 ? day - 21 : day + 10 };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { sign: 'Aquarius', degree: day >= 20 ? day - 19 : day + 12 };
  return { sign: 'Pisces', degree: day >= 19 ? day - 18 : day + 10 };
}

/**
 * Astronomical approximation for Moon & Ascendant
 */
export function calculateAscendantAndMoon(
  date: Date, 
  hour: number, 
  minute: number, 
  sunSign: ZodiacSignName
): { rising: ZodiacSignName; moon: ZodiacSignName; moonDegree: number } {
  const sunIndex = SIGNS_ORDER.indexOf(sunSign);
  
  // Ascendant shifts ~1 sign every 2 hours starting around sunrise (approx 6 AM)
  const timeInDecimal = hour + minute / 60;
  const hoursFromSunrise = (timeInDecimal - 6 + 24) % 24;
  const ascendantOffset = Math.floor(hoursFromSunrise / 2);
  const risingIndex = (sunIndex + ascendantOffset) % 12;
  const rising = SIGNS_ORDER[risingIndex];

  // Moon moves ~13.2 degrees/day. Approximate through day-of-year + birth year cycles
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const moonIndex = (Math.floor(dayOfYear * 13.2 / 30) + date.getFullYear() % 12) % 12;
  const moonDegree = Math.floor((dayOfYear * 13.2) % 30);
  const moon = SIGNS_ORDER[moonIndex];

  return { rising, moon, moonDegree };
}

/**
 * Converts Western Tropical to Vedic Sidereal using ~24 degree Lahiri Ayanamsha offset
 */
export function convertToSidereal(westernSign: ZodiacSignName, degree: number): { rashi: VedicRashiName; degree: number } {
  let totalDeg = (SIGNS_ORDER.indexOf(westernSign) * 30 + degree) - 23.85;
  if (totalDeg < 0) totalDeg += 360;
  const siderealIndex = Math.floor(totalDeg / 30) % 12;
  const siderealSign = SIGNS_ORDER[siderealIndex];
  return {
    rashi: VEDIC_RASHIS[siderealSign],
    degree: Math.round(totalDeg % 30)
  };
}

/**
 * Calculates Chinese BaZi Year Animal and Element
 */
export function calculateChineseZodiac(year: number): {
  animal: ChineseZodiacName;
  element: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
  polarity: 'Yin' | 'Yang';
  characteristics: string;
} {
  // 1900 was Year of the Rat, Metal
  const animalIndex = (year - 4) % 12;
  const animal = CHINESE_ANIMALS[(animalIndex + 12) % 12];

  const lastDigit = year % 10;
  let element: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water' = 'Earth';
  if (lastDigit === 0 || lastDigit === 1) element = 'Metal';
  else if (lastDigit === 2 || lastDigit === 3) element = 'Water';
  else if (lastDigit === 4 || lastDigit === 5) element = 'Wood';
  else if (lastDigit === 6 || lastDigit === 7) element = 'Fire';
  else element = 'Earth';

  const polarity = year % 2 === 0 ? 'Yang' : 'Yin';

  const characteristicsMap: Record<ChineseZodiacName, string> = {
    Rat: 'Resourceful, sharp-witted, charming, and naturally alert to hidden opportunities.',
    Ox: 'Dependable, methodical, resilient, possessing quiet unshakeable strength.',
    Tiger: 'Brave, magnetic, fiercely independent, driven by chivalry and high ideals.',
    Rabbit: 'Gentle, diplomatic, aesthetically gifted, navigating life with profound grace.',
    Dragon: 'Noble, ambitious, charismatic, blessed with supreme vitality and vision.',
    Snake: 'Enigmatic, deeply philosophical, intuitive, discerning truth beyond illusions.',
    Horse: 'Energetic, freedom-seeking, passionate, inspiring others through boundless zeal.',
    Goat: 'Peace-loving, artistic, empathetic, devoted to beauty and collective harmony.',
    Monkey: 'Brilliant, versatile, innovative problem-solver with infectious levity.',
    Rooster: 'Meticulous, observant, courageous, upholding high standards of truth.',
    Dog: 'Fiercely loyal, honest, protector of loved ones, guided by deep moral purpose.',
    Pig: 'Generous, sincere, broad-minded, savoring life with authentic abundance.'
  };

  return {
    animal,
    element,
    polarity,
    characteristics: characteristicsMap[animal] || 'Balanced and harmonious.'
  };
}

/**
 * Generate full comprehensive chart
 */
export function calculateFullNatalChart(details: BirthDetails): CalculatedChart {
  const [yearStr, monthStr, dayStr] = details.birthDate.split('-');
  const year = parseInt(yearStr) || 1995;
  const month = parseInt(monthStr) || 1;
  const day = parseInt(dayStr) || 1;
  const dateObj = new Date(year, month - 1, day);

  const [rawHStr, rawMStr] = (details.birthTime || '12:00').split(':');
  let rawH = parseInt(rawHStr) || 12;
  const minute = parseInt(rawMStr) || 0;
  if (details.birthTimePeriod === 'PM' && rawH < 12) rawH += 12;
  if (details.birthTimePeriod === 'AM' && rawH === 12) rawH = 0;

  const sunData = calculateSunSign(dateObj);
  const { rising, moon, moonDegree } = calculateAscendantAndMoon(dateObj, rawH, minute, sunData.sign);

  const siderealMoon = convertToSidereal(moon, moonDegree);
  const siderealSun = convertToSidereal(sunData.sign, sunData.degree);
  const siderealRising = convertToSidereal(rising, 15);

  // Nakshatra calculation (Moon sidereal total degrees / 13°20')
  const totalMoonSiderealDeg = (SIGNS_ORDER.findIndex(s => VEDIC_RASHIS[s] === siderealMoon.rashi) * 30) + siderealMoon.degree;
  const nakshatraIndex = Math.min(26, Math.floor(totalMoonSiderealDeg / 13.333));
  const nakshatra = NAKSHATRAS[nakshatraIndex];

  // Chinese BaZi
  const chineseData = calculateChineseZodiac(year);

  // Dominant element
  const elementsCount = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  elementsCount[ZODIAC_SIGNS[sunData.sign].element] += 3;
  elementsCount[ZODIAC_SIGNS[moon].element] += 3;
  elementsCount[ZODIAC_SIGNS[rising].element] += 2;

  let dominantElement: 'Fire' | 'Earth' | 'Air' | 'Water' = 'Fire';
  let maxScore = -1;
  (Object.keys(elementsCount) as Array<'Fire' | 'Earth' | 'Air' | 'Water'>).forEach(el => {
    if (elementsCount[el] > maxScore) {
      maxScore = elementsCount[el];
      dominantElement = el;
    }
  });

  const totalScore = elementsCount.Fire + elementsCount.Earth + elementsCount.Air + elementsCount.Water;
  const elementDistribution = {
    fire: Math.round((elementsCount.Fire / totalScore) * 100),
    earth: Math.round((elementsCount.Earth / totalScore) * 100),
    air: Math.round((elementsCount.Air / totalScore) * 100),
    water: Math.round((elementsCount.Water / totalScore) * 100)
  };

  const titles = [
    `The ${ZODIAC_SIGNS[sunData.sign].element} Sovereign & ${rising} Visionary`,
    `The Mystic Strategist of ${sunData.sign}`,
    `The ${chineseData.element} ${chineseData.animal} Luminary`
  ];

  return {
    birthDetails: details,
    western: {
      sun: {
        name: 'Sun',
        symbol: '☉',
        sign: sunData.sign,
        degree: sunData.degree,
        house: 1
      },
      moon: {
        name: 'Moon',
        symbol: '☽',
        sign: moon,
        degree: moonDegree,
        house: 4
      },
      rising: {
        name: 'Rising / Ascendant',
        symbol: 'ASC',
        sign: rising,
        degree: 14,
        house: 1
      },
      midheaven: {
        name: 'Midheaven (MC)',
        symbol: 'MC',
        sign: SIGNS_ORDER[(SIGNS_ORDER.indexOf(rising) + 9) % 12],
        degree: 18,
        house: 10
      },
      dominantElement,
      elementDistribution,
      archetypeTitle: titles[0]
    },
    vedic: {
      ascendantRashi: siderealRising.rashi,
      moonRashi: siderealMoon.rashi,
      sunRashi: siderealSun.rashi,
      birthNakshatra: nakshatra.name,
      nakshatraLord: nakshatra.lord,
      currentDasha: `${nakshatra.lord} - ${nakshatra.name.slice(0, 3)} Mahadasha`,
      manglikStatus: (sunData.sign === 'Aries' || sunData.sign === 'Scorpio') ? 'Dynamic' : 'Calm'
    },
    chinese: {
      animal: chineseData.animal,
      element: chineseData.element,
      polarity: chineseData.polarity,
      pillarCharacteristics: chineseData.characteristics
    }
  };
}
