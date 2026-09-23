// AstraVani Authentic Astrological Knowledge Base & Dataset Store
// Houses classical Vedic sutras, Lal Kitab principles, and multi-turn conversational patterns.
// Designed to easily ingest external datasets provided by users.

export interface AstrologicalSutra {
  id: string;
  source: 'Brihat Parashara' | 'Phaladeepika' | 'Lal Kitab' | 'Jaimini' | 'Nadi Grantha';
  topic: 'career' | 'marriage' | 'wealth' | 'health' | 'manglik' | 'sade_sati' | 'remedy' | 'general';
  condition: string;
  insightHindi: string;
  insightEnglish: string;
  timingIndicator?: string;
  remedy?: string;
}

export const ASTROLOGY_KNOWLEDGE_BASE: AstrologicalSutra[] = [
  // CAREER & WEALTH
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

  // HEALTH & PEACE OF MIND
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
  }
];

// Helper to dynamically ingest new user datasets into runtime memory
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
        remedy: record.remedy || 'Chant Gayatri Mantra 21 times at dawn'
      });
      count++;
    }
  });
  return count;
}
