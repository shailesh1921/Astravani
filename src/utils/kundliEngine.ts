import { KundliData } from '../types/astrotalk';

const ZODIAC_SIGNS = [
  'Aries (मेष)', 'Taurus (वृषभ)', 'Gemini (मिथुन)', 'Cancer (कर्क)',
  'Leo (सिंह)', 'Virgo (कन्या)', 'Libra (तुला)', 'Scorpio (वृश्चिक)',
  'Sagittarius (धनु)', 'Capricorn (मकर)', 'Aquarius (कुंभ)', 'Pisces (मीन)'
];

const NAKSHATRAS = [
  'Ashwini (अश्विनी)', 'Bharani (भरणी)', 'Krittika (कृत्तिका)', 'Rohini (रोहिणी)',
  'Mrigashira (मृगशिरा)', 'Ardra (आर्द्रा)', 'Punarvasu (पुनर्वसु)', 'Pushya (पुष्य)',
  'Ashlesha (आश्लेषा)', 'Magha (मघा)', 'Purva Phalguni (पूर्वा फाल्गुनी)', 'Uttara Phalguni (उत्तरा फाल्गुनी)',
  'Hasta (हस्त)', 'Chitra (चित्रा)', 'Swati (स्वाती)', 'Vishakha (विशाखा)',
  'Anuradha (अनुराधा)', 'Jyeshtha (ज्येष्ठा)', 'Mula (मूल)', 'Purva Ashadha (पूर्वाषाढ़ा)',
  'Uttara Ashadha (उत्तराषाढ़ा)', 'Shravana (श्रवण)', 'Dhanishta (धनिष्ठा)', 'Shatabhisha (शतभिषा)',
  'Purva Bhadrapada (पूर्वा भाद्रपद)', 'Uttara Bhadrapada (उत्तरा भाद्रपद)', 'Revati (रेवती)'
];

const DASHAS = ['Sun (सूर्य)', 'Moon (चन्द्र)', 'Mars (मंगल)', 'Rahu (राहु)', 'Jupiter (गुरु)', 'Saturn (शनि)', 'Mercury (बुध)', 'Ketu (केतु)', 'Venus (शुक्र)'];

const GEMSTONES: Record<string, string> = {
  'Aries': 'Red Coral (मूंगा)',
  'Taurus': 'Diamond / White Opal (हीरा/ओपल)',
  'Gemini': 'Emerald (पन्ना)',
  'Cancer': 'Natural Pearl (मोती)',
  'Leo': 'Ruby (माणिक्य)',
  'Virgo': 'Emerald (पन्ना)',
  'Libra': 'Diamond / White Topaz (हीरा)',
  'Scorpio': 'Red Coral (मूंगा)',
  'Sagittarius': 'Yellow Sapphire (पुखराज)',
  'Capricorn': 'Blue Sapphire (नीलम)',
  'Aquarius': 'Blue Sapphire / Amethyst (नीलम)',
  'Pisces': 'Yellow Sapphire (पुखराज)'
};

const MANTRAS: Record<string, string> = {
  'Aries': 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः (Om Kram Kreem Kroum Sah Bhaumaya Namah)',
  'Taurus': 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः (Om Dram Dreem Droum Sah Shukraya Namah)',
  'Gemini': 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः (Om Bram Breem Broum Sah Budhaya Namah)',
  'Cancer': 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः (Om Shram Shreem Shroum Sah Chandramase Namah)',
  'Leo': 'ॐ घृणिः सूर्याय नमः (Om Ghrinih Suryaya Namah)',
  'Virgo': 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः (Om Bram Breem Broum Sah Budhaya Namah)',
  'Libra': 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः (Om Dram Dreem Droum Sah Shukraya Namah)',
  'Scorpio': 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः (Om Kram Kreem Kroum Sah Bhaumaya Namah)',
  'Sagittarius': 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः (Om Gram Greem Groum Sah Gurave Namah)',
  'Capricorn': 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः (Om Pram Preem Proum Sah Shanaishcharaya Namah)',
  'Aquarius': 'ॐ शं शनैश्चराय नमः (Om Sham Shanaishcharaya Namah)',
  'Pisces': 'ॐ बृं बृहस्पतये नमः (Om Brim Brihaspataye Namah)'
};

export function calculateKundli(name: string, gender: string, dob: string, tob: string, pob: string): KundliData {
  const dateObj = new Date(dob);
  const timeParts = (tob || '12:00').split(':');
  const hours = parseInt(timeParts[0] || '12', 10);
  const minutes = parseInt(timeParts[1] || '0', 10);
  
  // Seed hash for deterministic yet rich astronomical chart simulation
  const seed = (dateObj.getFullYear() * 10000 + (dateObj.getMonth() + 1) * 100 + dateObj.getDate() + hours * 37 + minutes * 19) % 100000;
  
  const lagnaIndex = (Math.floor(seed / 100) + hours) % 12;
  const moonIndex = (lagnaIndex + 3 + (seed % 7)) % 12;
  const sunIndex = (lagnaIndex + 8 + (seed % 5)) % 12;
  const nakshatraIndex = (seed + moonIndex * 2) % 27;
  const nakshatraPada = (seed % 4) + 1;
  
  const lagnaSign = ZODIAC_SIGNS[lagnaIndex];
  const chandraRashi = ZODIAC_SIGNS[moonIndex];
  const suryaRashi = ZODIAC_SIGNS[sunIndex];
  const nakshatra = NAKSHATRAS[nakshatraIndex];
  
  const baseSignName = lagnaSign.split(' ')[0];
  const gemstone = GEMSTONES[baseSignName] || 'Yellow Sapphire (पुखराज)';
  const mantra = MANTRAS[baseSignName] || 'ॐ नमः शिवाय (Om Namah Shivaya)';
  
  const mahadasha = DASHAS[nakshatraIndex % 9];
  const antardasha = DASHAS[(nakshatraIndex + 4) % 9];
  
  // Houses and planets placement
  const planetsList = [
    { name: 'Sun (सूर्य)', rashi: suryaRashi, degree: `${12 + (seed % 15)}° ${seed % 60}'`, nakshatra: NAKSHATRAS[(nakshatraIndex + 2) % 27], house: ((sunIndex - lagnaIndex + 12) % 12) + 1 },
    { name: 'Moon (चन्द्र)', rashi: chandraRashi, degree: `${8 + (seed % 20)}° ${(seed * 3) % 60}'`, nakshatra: nakshatra, house: ((moonIndex - lagnaIndex + 12) % 12) + 1 },
    { name: 'Mars (मंगल)', rashi: ZODIAC_SIGNS[(lagnaIndex + 1) % 12], degree: `${15 + (seed % 10)}° 14'`, nakshatra: NAKSHATRAS[(nakshatraIndex + 5) % 27], house: 2 },
    { name: 'Mercury (बुध)', rashi: ZODIAC_SIGNS[(sunIndex + 1) % 12], degree: `${22 + (seed % 6)}° 42'`, nakshatra: NAKSHATRAS[(nakshatraIndex + 7) % 27], house: ((sunIndex - lagnaIndex + 13) % 12) + 1, isRetrograde: seed % 3 === 0 },
    { name: 'Jupiter (गुरु)', rashi: ZODIAC_SIGNS[(lagnaIndex + 4) % 12], degree: `${18 + (seed % 10)}° 05'`, nakshatra: NAKSHATRAS[(nakshatraIndex + 9) % 27], house: 5 },
    { name: 'Venus (शुक्र)', rashi: ZODIAC_SIGNS[(sunIndex + 11) % 12], degree: `${25 + (seed % 4)}° 18'`, nakshatra: NAKSHATRAS[(nakshatraIndex + 11) % 27], house: ((sunIndex - lagnaIndex + 11) % 12) + 1 },
    { name: 'Saturn (शनि)', rashi: ZODIAC_SIGNS[(lagnaIndex + 9) % 12], degree: `${7 + (seed % 18)}° 33'`, nakshatra: NAKSHATRAS[(nakshatraIndex + 14) % 27], house: 10, isRetrograde: seed % 2 === 0 },
    { name: 'Rahu (राहु)', rashi: ZODIAC_SIGNS[(lagnaIndex + 2) % 12], degree: `${14 + (seed % 12)}° 19'`, nakshatra: NAKSHATRAS[(nakshatraIndex + 18) % 27], house: 3, isRetrograde: true },
    { name: 'Ketu (केतु)', rashi: ZODIAC_SIGNS[(lagnaIndex + 8) % 12], degree: `${14 + (seed % 12)}° 19'`, nakshatra: NAKSHATRAS[(nakshatraIndex + 23) % 27], house: 9, isRetrograde: true },
  ];

  // Organize by house 1-12
  const housePlacements = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const signIndex = (lagnaIndex + i) % 12;
    const planetsInHouse = planetsList.filter(p => p.house === houseNum).map(p => p.name.split(' ')[0]);
    return {
      houseNumber: houseNum,
      sign: ZODIAC_SIGNS[signIndex],
      planets: planetsInHouse
    };
  });

  return {
    name,
    gender,
    dob,
    tob,
    pob,
    lagnaSign,
    chandraRashi,
    suryaRashi,
    nakshatra,
    nakshatraPada,
    mahadasha,
    antardasha,
    tithi: 'Shukla Paksha Dashami (शुक्ल पक्ष दशमी)',
    yoga: 'Siddhi Yoga (सिद्धि योग)',
    karana: 'Taitila (तैतिल)',
    luckyGemstone: gemstone,
    luckyMantra: mantra,
    favorableDeity: 'Lord Shiva / Shri Vishnu',
    planets: planetsList,
    housePlacements
  };
}
