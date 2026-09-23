// AstraVani Authentic Astrological Knowledge Base & Dataset Store
// Ingests classical Vedic sutras, Lal Kitab principles, and external datasets like Hugging Face's thutasann/TTS_Astro_data.

export interface AstrologicalSutra {
  id: string;
  source: 'Brihat Parashara' | 'Phaladeepika' | 'Lal Kitab' | 'Jaimini' | 'Nadi Grantha' | 'Mahabote (TTS_Astro_data)' | 'Saravali';
  topic: 'career' | 'marriage' | 'wealth' | 'health' | 'manglik' | 'sade_sati' | 'remedy' | 'mahabote' | 'general';
  condition: string;
  insightHindi: string;
  insightEnglish: string;
  timingIndicator?: string;
  remedy?: string;
  rawDatasetMetadata?: Record<string, any>;
}

// --------------------------------------------------------------------------
// INGESTED HUGGING FACE DATASET: "thutasann/TTS_Astro_data"
// Content: The 7 Houses of Mahabote Astrology (Burmese branch of Vedic Graha system)
// Derived from Birth Day Lord + Birth Year Modulo 7.
// --------------------------------------------------------------------------
export const INGESTED_TTS_ASTRO_DATA: AstrologicalSutra[] = [
  {
    id: 'tts_astro_0_bhanga',
    source: 'Mahabote (TTS_Astro_data)',
    topic: 'mahabote',
    condition: 'Birth Day-Lord in Bhanga (ဘင်္ဂ - House of Impermanence / Sensitivity)',
    insightHindi: 'महाबोट के अनुसार आपका ग्रह "भंग" (Bhanga) भाव में है। बाल्यकाल में स्वास्थ्य में उतार-चढ़ाव रहा होगा और मन अत्यंत भावुक व तीव्र गति से विचार बदलने वाला है।',
    insightEnglish: 'According to Mahabote, your birth planet resides in Bhanga (ဘင်္ဂ). Childhood had sensitive health, giving you a remarkably intuitive mind that adapts with high speed.',
    timingIndicator: 'Matures into sharp emotional discernment in the current planetary phase.',
    remedy: 'जल और चंद्रमा का सम्मान करें; पूर्णिमा के दिन जल अर्पण करने से मन में अटूट स्थिरता आएगी।',
    rawDatasetMetadata: {
      house_burmese: 'ဘင်္ဂ',
      house_name: 'Bhanga',
      prediction_burmese: 'ငယ်စဉ်က ချူချာတတ်သည်။ စိတ်အပြောင်းအလဲမြန်သည်။',
      original_dataset: 'thutasann/TTS_Astro_data'
    }
  },
  {
    id: 'tts_astro_1_puti',
    source: 'Mahabote (TTS_Astro_data)',
    topic: 'mahabote',
    condition: 'Birth Day-Lord in Puti (ပုတိ - House of Struggle & Frugality)',
    insightHindi: 'महाबोट में आपकी स्थिति "पुति" (Puti) भाव की है। जीवन का आरंभिक चरण अत्यंत संघर्षमय रहा, परंतु यही संघर्ष आपको मितव्ययी, स्वाभिमानी और आत्मनिर्भर बनाता है।',
    insightEnglish: 'Your birth planet resides in Puti (ပုတိ). Early life presented steep hurdles, forging deep frugality, enduring resilience, and self-made authority.',
    timingIndicator: 'Greatest financial consolidation unfolds steadily after 30 years of age.',
    remedy: 'शनिवार को जरूरतमंदों को तिल या तेल का दान करें; परिश्रम का फल कई गुना होकर लौटेगा।',
    rawDatasetMetadata: {
      house_burmese: 'ပုတိ',
      house_name: 'Puti',
      prediction_burmese: 'ဘ၀အစ ခက်ခဲတသည်။ နှမြောတွန့်တိုတတ်သည်။',
      original_dataset: 'thutasann/TTS_Astro_data'
    }
  },
  {
    id: 'tts_astro_2_marana',
    source: 'Mahabote (TTS_Astro_data)',
    topic: 'mahabote',
    condition: 'Birth Day-Lord in Marana (မရဏ - House of Metamorphosis / High Destiny)',
    insightHindi: 'आपकी कुंडली महाबोट के "मरण" (Marana) भाव से जुड़ी है—यह "मर कर स्वर्ण मुकुट पहनने" (သေမြေကြီး၊ ရှင်ရွှေထီး) जैसी चरम उत्कर्ष की नियति दर्शाती है। सामान्य जीवन आपके लिए नहीं है।',
    insightEnglish: 'Your chart is aligned with Marana (မရဏ)—the classic "dust or golden crown" destiny. You are built for momentous transformations and extraordinary highs.',
    timingIndicator: 'Major breakthrough occurs following a decisive shift in environment or responsibility.',
    remedy: 'महामृत्युंजय मंत्र का नित्य 11 बार स्मरण करें; हर संकट विजय में परिवर्तित होगा।',
    rawDatasetMetadata: {
      house_burmese: 'မရဏ',
      house_name: 'Marana',
      prediction_burmese: 'သေမြေကြီး၊ ရှင်ရွှေထီးဇာတာဖြစ်သည်။',
      original_dataset: 'thutasann/TTS_Astro_data'
    }
  },
  {
    id: 'tts_astro_3_thike',
    source: 'Mahabote (TTS_Astro_data)',
    topic: 'mahabote',
    condition: 'Birth Day-Lord in Thike (သိုက် - House of Hidden Wealth & Guardianship)',
    insightHindi: 'महाबोट के अनुसार आपका ग्रह "थाइक" (Thike - खजाना/दैवीय संरक्षण) भाव में है। आप पर पूर्वजों और ईश्वरीय शक्तियों की विशेष कृपा है; जीवन में धन व संपन्नता अनायास प्राप्त होती है।',
    insightEnglish: 'Your planet rests in Thike (သိုက် - Hidden Treasure & Protection). You are blessed with ancestral protection and effortless affinity for accumulating wealth and goodwill.',
    timingIndicator: 'Unlocks rapid abundance during Jupiter or Venus transits.',
    remedy: 'प्रातःकाल पक्षियों को दाना और गाय को हरी घास खिलाएं; लक्ष्मी का वास सदैव बना रहेगा।',
    rawDatasetMetadata: {
      house_burmese: 'သိုက်',
      house_name: 'Thike',
      prediction_burmese: 'ကြီးပွားချမ်းသာလွယ်သည်။ အစောင့်အရှောက်ကောင်းရှိသည်။',
      original_dataset: 'thutasann/TTS_Astro_data'
    }
  },
  {
    id: 'tts_astro_4_raja',
    source: 'Mahabote (TTS_Astro_data)',
    topic: 'mahabote',
    condition: 'Birth Day-Lord in Raja (ရာဇ - House of Sovereignty & Royal Elegance)',
    insightHindi: 'महाबोट में आपका ग्रह "राज" (Raja - राजसी स्वभाव) भाव में स्थित है। आप उत्तम भोजन, सुरुचिपूर्ण वस्त्र और उच्च सम्मान पसंद करते हैं; अपने क्षेत्र में श्रेष्ठता प्राप्त करना आपका स्वाभाविक गुण है।',
    insightEnglish: 'Positioned in Raja (ရာဇ - Royal Dignity). You have exquisite taste for quality and life comforts, with innate talents that effortlessly distinguish you in any group.',
    timingIndicator: 'Leadership recognition amplifies during Sun and Mars periods.',
    remedy: 'रविवार को तांबे के पात्र से सूर्य देव को कुमकुम मिश्रित जल अर्पित करें।',
    rawDatasetMetadata: {
      house_burmese: 'ရာဇ',
      house_name: 'Raja',
      prediction_burmese: 'အစားကောင်းကြိုက်သည်။ ထူးချွန်တတ်သည်။',
      original_dataset: 'thutasann/TTS_Astro_data'
    }
  },
  {
    id: 'tts_astro_5_ahtun',
    source: 'Mahabote (TTS_Astro_data)',
    topic: 'mahabote',
    condition: 'Birth Day-Lord in Ahtun (အထွန်း - House of Radiance & Splendour)',
    insightHindi: 'महाबोट विधान के अनुसार आपका ग्रह "अहुन" (Ahtun - प्रदीप्त कीर्ति) भाव में है। आपका जीवन उत्तरोत्तर उन्नति और प्रतिष्ठा की ओर अग्रसर रहेगा; आप जिस कार्य में हाथ डालेंगे, उसमें यश फैलेगा।',
    insightEnglish: 'Enshrined in Ahtun (အထွန်း - Radiance & Success). Your life trajectory is characterized by steady ascent, social renown, and luminous accomplishments.',
    timingIndicator: 'Accelerates continuously over the upcoming multi-month cycle.',
    remedy: 'संध्या समय घर के मुख्य द्वार पर घी का दीपक प्रज्वलित करें।',
    rawDatasetMetadata: {
      house_burmese: 'အထွန်း',
      house_name: 'Ahtun',
      prediction_burmese: 'တိုးတက်ကြီးပွားမည်။ အောင်မြင်ထွန်းပေါက်မည်။',
      original_dataset: 'thutasann/TTS_Astro_data'
    }
  },
  {
    id: 'tts_astro_6_adhipati',
    source: 'Mahabote (TTS_Astro_data)',
    topic: 'mahabote',
    condition: 'Birth Day-Lord in Adhipati (အဓိပတိ - House of Supreme Authority & Mastery)',
    insightHindi: 'महाबोट में आपका ग्रह "अधिपति" (Adhipati - महानायक) भाव में विराजित है। आप में जन्मजात नेतृत्व गुण (Leader / Guru) है; आप दूसरों का मार्गदर्शन करने और बड़े संगठन का संचालन करने हेतु निर्मित हैं।',
    insightEnglish: 'Resting in Adhipati (အဓိပတိ - Supreme Master & Commander). You possess natural-born leadership authority and the destiny of a master strategist.',
    timingIndicator: 'Executive command manifests prominently in ongoing Dasha alignments.',
    remedy: 'गुरुवार को पीले वस्त्र धारण करें और गुरुजनों/विद्वानों का चरण स्पर्श कर आशीर्वाद लें।',
    rawDatasetMetadata: {
      house_burmese: 'အဓိပတိ',
      house_name: 'Adhipati',
      prediction_burmese: 'ခေါင်းဆောင်ဖြစ်တတ်သည်။ ဆရာကြီးဇာတာပါသည်။',
      original_dataset: 'thutasann/TTS_Astro_data'
    }
  }
];

// --------------------------------------------------------------------------
// CLASSICAL VEDIC SUTRAS KNOWLEDGE BASE
// From Brihat Parashara, Phaladeepika, Saravali, Lal Kitab & Jaimini Sutras
// --------------------------------------------------------------------------
export const ASTROLOGY_KNOWLEDGE_BASE: AstrologicalSutra[] = [
  ...INGESTED_TTS_ASTRO_DATA,

  // CAREER & PROFESSIONAL MASTERY
  {
    id: 'sutra_c1',
    source: 'Brihat Parashara',
    topic: 'career',
    condition: '10th lord in Kendra or Trikona with Jupiter or Mercury aspect',
    insightHindi: 'दशमेश का केंद्र-त्रिकोण संबंध उच्च पद, प्रशासनिक प्रभाव अथवा स्वतंत्र व्यवसाय में दीर्घकालिक ख्याति प्रदान करता है।',
    insightEnglish: '10th lord well-placed in angular or trinal houses ensures executive leadership, administrative respect, and sustained business growth.',
    timingIndicator: 'During Jupiter or Mercury Antardasha; significant breakthrough between 4 to 8 months.',
    remedy: 'Offer Arghya (water) with a pinch of turmeric to Lord Surya at sunrise every morning.'
  },
  {
    id: 'sutra_c2',
    source: 'Phaladeepika',
    topic: 'career',
    condition: 'Saturn transiting 10th or 11th from Moon sign',
    insightHindi: 'शनि का गोचर आपके कार्यक्षेत्र में अनुशासन और गंभीर परिश्रम की मांग कर रहा है। शुरुआती विलंब के बाद स्थायी पदोन्नति का योग है।',
    insightEnglish: 'Saturn’s transit demands rigorous discipline. Initial delays will convert into substantial, permanent professional elevation.',
    timingIndicator: 'Relief and financial surge begin in the upcoming Gochar transition.',
    remedy: 'Light a mustard oil lamp under a Peepal tree on Saturdays after sunset.'
  },
  {
    id: 'sutra_c3',
    source: 'Lal Kitab',
    topic: 'wealth',
    condition: '2nd or 11th house obstruction / blocked cashflow',
    insightHindi: 'धन भाव में ग्रहों की युति संकेत देती है कि संचित धन का व्यय अनपेक्षित कार्यों में हो रहा है। गुप्त धन संचय के लिए उपाय अनिवार्य है।',
    insightEnglish: 'Planetary alignments in the wealth house suggest recurring unexpected expenditures. Sattvic wealth-stabilization remedies are indicated.',
    timingIndicator: 'Financial consolidation within 90 to 120 days.',
    remedy: 'Keep a square silver coin in your wallet and feed soaked green moong to birds on Wednesdays.'
  },
  {
    id: 'sutra_c4',
    source: 'Saravali',
    topic: 'career',
    condition: 'Sun in 10th house (Digbala) or Budhaditya Yoga in 1st/10th',
    insightHindi: 'दशम भाव में सूर्य का दिग्बल प्रशासनिक सेवा, सरकारी कार्यों अथवा उच्च अधिकारियों से पूर्ण समर्थन का प्रबल योग बनाता है।',
    insightEnglish: 'Sun holding directional strength (Digbala) in the 10th house creates exceptional favor in governance, senior corporate authority, and prestige.',
    timingIndicator: 'Peak recognition aligned with Sun transits across Aries and Leo.',
    remedy: 'Chant Aditya Hridaya Stotram on Sundays facing East.'
  },

  // MARRIAGE & RELATIONSHIPS
  {
    id: 'sutra_m1',
    source: 'Brihat Parashara',
    topic: 'marriage',
    condition: '7th lord in auspicious house or Jupiter aspecting 7th house',
    insightHindi: 'सप्तम भाव पर गुरु की अमृत दृष्टि सुखद, सुसंस्कृत और संस्कारवान जीवनसाथी की प्राप्ति सुनिश्चित करती है।',
    insightEnglish: 'Jupiter’s benefic aspect upon the 7th house guarantees a culturally rooted, intellectually supportive, and loving spouse.',
    timingIndicator: 'Marriage alliances mature rapidly during the upcoming transit of Jupiter (अगले 5 से 9 महीनों में).',
    remedy: 'Worship Lord Vishnu with yellow flowers and chant "Om Namo Bhagavate Vasudevaya" 108 times on Thursdays.'
  },
  {
    id: 'sutra_m2',
    source: 'Lal Kitab',
    topic: 'manglik',
    condition: 'Mars in 1st, 4th, 7th, 8th or 12th house (Manglik factor)',
    insightHindi: 'मंगल का प्रभाव केवल ऊर्जा और स्वाभिमान का प्रतीक है, कोई अनिष्ट नहीं। परिपक्वता के साथ यह योग स्वतः निष्प्रभावी हो जाता है।',
    insightEnglish: 'The Mangal energy primarily signifies high drive and passionate independence; it matures into stability after age 28.',
    timingIndicator: 'Mutual understanding deepens post the 28th solar revolution.',
    remedy: 'Recite Hanuman Chalisa daily and avoid wearing deep red shirts on Tuesdays.'
  },
  {
    id: 'sutra_m3',
    source: 'Jaimini',
    topic: 'marriage',
    condition: 'Darakaraka planet planetary interaction',
    insightHindi: 'दाराकारक ग्रह की स्थिति दर्शाती है कि जीवनसाथी का स्वभाव गंभीर, बौद्धिक और परिवार को साथ लेकर चलने वाला होगा।',
    insightEnglish: 'Darakaraka indicates your future spouse will possess intellectual maturity, emotional depth, and strong family loyalty.',
    timingIndicator: 'Direct proposal or significant emotional commitment within the upcoming season.',
    remedy: 'Donate milk, white rice, or sugar to elderly needy individuals on Mondays.'
  },
  {
    id: 'sutra_m4',
    source: 'Nadi Grantha',
    topic: 'marriage',
    condition: 'Venus-Saturn contact or delay in 7th house',
    insightHindi: 'शुक्र और शनि का संस्पर्श विवाह में विलंब अवश्य कराता है, परंतु देर से होने वाला विवाह अत्यंत स्थायी, परिपक्व और सुरक्षित रहता है।',
    insightEnglish: 'Venus-Saturn contact causes deliberate pacing in matrimony, but yields an exceptionally stable, deeply committed, and lifelong bond.',
    timingIndicator: 'Definite fructification during Saturn retrograde direct motion.',
    remedy: 'Offer white fragrant flowers (jasmine/mogra) at a Shiva temple on Friday mornings.'
  },

  // HEALTH, PEACE OF MIND & SADE SATI
  {
    id: 'sutra_h1',
    source: 'Phaladeepika',
    topic: 'health',
    condition: 'Moon influenced by Rahu or Saturn (Vish Yoga / Grahan effect)',
    insightHindi: 'चंद्रमा पर छाया ग्रहों का प्रभाव मन में अनावश्यक चिंता, अति-विचार (overthinking) और अनिद्रा की प्रवृत्ति पैदा करता है।',
    insightEnglish: 'Shadow planetary influence on the Moon creates mental fatigue, overthinking, and restless sleep patterns.',
    timingIndicator: 'Mental clarity returns sharply after full moon water energization.',
    remedy: 'Drink water from a pure silver tumbler and practice 10 minutes of Pranayama facing East at sunrise.'
  },
  {
    id: 'sutra_h2',
    source: 'Lal Kitab',
    topic: 'sade_sati',
    condition: 'Saturn 7.5 year transit (Sade Sati / Dhaiya)',
    insightHindi: 'शनि की साढ़ेसाती या ढैय्या वास्तव में जीवन का शोधन काल है। यह आपके वास्तविक मित्रों और आंतरिक शक्ति को परखकर परिपक्व बनाता है।',
    insightEnglish: 'Shani Sade Sati is a period of karmic refining—it strips away illusions and builds unshakeable resilience and patience.',
    timingIndicator: 'Second phase challenges ease as Saturn moves into the next Nakshatra quarter.',
    remedy: 'Donate black sesame seeds, iron vessels, or footwear to working-class labourers on Saturday mornings.'
  },
  {
    id: 'sutra_h3',
    source: 'Brihat Parashara',
    topic: 'wealth',
    condition: 'Dhana Yoga of 2nd, 5th, 9th and 11th house lords',
    insightHindi: 'द्वितीय, पंचम, नवम एवं एकादश भाव के स्वामियों का संबंध अखंड धन योग निर्मित करता है, जो आकस्मिक लाभ व संपत्ति योग देता है।',
    insightEnglish: 'Harmonious mutual reception between wealth, fortune, and gain lords establishes an unbroken stream of prosperity and assets.',
    timingIndicator: 'Materializes when Dasha lord transits friendly signs.',
    remedy: 'Recite Kanakadhara Stotram on Friday evenings with a pure ghee lamp.'
  }
];

// Helper to calculate Mahabote House for any birth date using the 7-house algorithm
export function calculateMahaboteHouse(dobString: string): AstrologicalSutra {
  const date = new Date(dobString);
  const dayOfWeek = isNaN(date.getDay()) ? 1 : date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const year = isNaN(date.getFullYear()) ? 1995 : date.getFullYear();

  // Burmese/Vedic Planetary Day numbering:
  // Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6, Sat=7
  const dayNumbers: Record<number, number> = {
    0: 1, // Sun
    1: 2, // Mon
    2: 3, // Tue
    3: 4, // Wed
    4: 5, // Thu
    5: 6, // Fri
    6: 7  // Sat
  };
  const planetNum = dayNumbers[dayOfWeek] || 1;

  // Mahabote formula:
  // Burmese Era Year = Gregorian Year - 638 (approx for Sakkaraj)
  // Remainder = (Year - 638) % 7
  // House calculation: (Planet Number - Remainder + 7) % 7
  const remainder = ((year - 638) % 7 + 7) % 7;
  const houseIndex = ((planetNum - remainder) % 7 + 7) % 7;

  // Ingested TTS_Astro_data mapping (0 to 6)
  return INGESTED_TTS_ASTRO_DATA[houseIndex] || INGESTED_TTS_ASTRO_DATA[4]; // Default to Raja if edge case
}

// Ingestion helper for any external dataset provided by user (e.g. Hugging Face, CSV, JSON)
export function ingestAstrologyDataset(newRecords: Partial<AstrologicalSutra>[]): number {
  let count = 0;
  newRecords.forEach((record, idx) => {
    if (record.insightHindi || record.insightEnglish) {
      ASTROLOGY_KNOWLEDGE_BASE.push({
        id: record.id || `custom_dataset_${Date.now()}_${idx}`,
        source: record.source || 'Brihat Parashara',
        topic: record.topic || 'general',
        condition: record.condition || 'Custom user astrological rule',
        insightHindi: record.insightHindi || '',
        insightEnglish: record.insightEnglish || '',
        timingIndicator: record.timingIndicator || 'As indicated by current Vimshottari Mahadasha',
        remedy: record.remedy || 'Chant Gayatri Mantra 21 times at dawn',
        rawDatasetMetadata: record.rawDatasetMetadata
      });
      count++;
    }
  });
  return count;
}
