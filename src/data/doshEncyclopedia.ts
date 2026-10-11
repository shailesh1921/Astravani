// AstraVani Dosh Encyclopedia — Authentic Vedic Grah Dosh Reference Directory
// Powers SEO landing content + high-intent consultation conversion.

export interface DoshEntry {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  category: 'dosh' | 'dasha' | 'yoga' | 'nakshatra';
  shortSummary: string;
  detailedSummary: string;
  causes: string[];
  symptoms: string[];
  remedies: Array<{
    type: 'mantra' | 'daan' | 'gemstone' | 'puja' | 'fast' | 'behavioral' | 'vastu';
    text: string;
  }>;
  relatedPlanets: string[];
  relatedHouses: number[];
  keywordTags: string[];
  consultVolumeLabel: string;
  urgency: 'high' | 'medium' | 'standard';
  searchVolumeEstimate: number;
}

export const DOSH_ENCYCLOPEDIA: DoshEntry[] = [
  {
    id: 'dosh_manglik',
    slug: 'manglik-dosha',
    nameEn: 'Manglik Dosha',
    nameHi: 'मांगलिक दोष',
    category: 'dosh',
    shortSummary:
      'A kuja dosha arising from Mars (Mangal) placed in the 1st, 4th, 7th, 8th, or 12th house from Lagna, Moon, or Venus. Classically believed to affect marital harmony unless cancelled or remediated.',
    detailedSummary:
      'Brihat Parashara Hora Shastra describes Manglik as the fiery aggression of Mars afflicting the 7th bhava (dampatya sthana). When Mangal occupies the 1st, 4th, 7th, 8th or 12th house, it is termed Mangal Dosha. There are multiple prabal (strong) and mrdu (cancelling) conditions — e.g. Mars in own sign Aries or Scorpio, or in a movable sign where the effects neutralise. A Manglik marrying another Manglik is the classical cancellation; otherwise shanti puja, kumbh vivah, or Mangal mantra remedies apply.',
    causes: [
      'Mars placed in Lagna (1st) — aggression, dominance in marriage',
      'Mars in 4th house — disturbance in domestic peace, vehicles, property',
      'Mars in 7th house — direct affliction to the spouse bhava',
      'Mars in 8th house — longevity and in-law friction concerns',
      'Mars in 12th house — separation risk, sleep and energy issues'
    ],
    symptoms: [
      'Repeated delays or last-minute breakage in marriage proposals',
      'Frequent conflicts or temperament clashes in married life',
      'Unusual restlessness and sudden anger patterns',
      'Serial disruptions in family settlements or property matters'
    ],
    remedies: [
      { type: 'puja', text: 'Perform Mangal Shanti Puja (Kumbh Vivah / Vishnu Vivah) at Bageshwar Dham or Kumbhakonam on any Tuesday.' },
      { type: 'mantra', text: 'Chant "Om Kram Kreem Kraum Sah Bhaumaya Namah" — 108 times every Tuesday.' },
      { type: 'daan', text: 'Donate red lentils (masoor dal), copper, or red cloth to the needy on Tuesday.' },
      { type: 'gemstone', text: 'Wear a Red Coral (Moonga) in copper ring only after verifying Mars strength in your chart.' },
      { type: 'behavioral', text: 'Practise Hanuman Chalisa recitation daily — reduces Mars heat and mental agitation.' },
      { type: 'fast', text: 'Observe a半 (half) fast on Tuesday, breaking fast after sunset with jaggery.' }
    ],
    relatedPlanets: ['Mars (Mangal)', 'Venus (Shukra)', 'Rahu'],
    relatedHouses: [1, 4, 7, 8, 12],
    keywordTags: ['manglik dosha', 'mangal dosha', 'kuja dosha', 'manglik marriage', 'mangal bhat puja'],
    consultVolumeLabel: '7,412 people checked Manglik status this month',
    urgency: 'high',
    searchVolumeEstimate: 165000
  },
  {
    id: 'dosh_kaalsarp',
    slug: 'kaal-sarp-dosh',
    nameEn: 'Kaal Sarp Dosha',
    nameHi: 'काल सर्प दोष',
    category: 'dosh',
    shortSummary:
      'Formed when all seven classical planets (Sun to Saturn) are hemmed between Rahu and Ketu in the birth chart. Associated with sudden reversals, obstacles, and karmic debt cycles.',
    detailedSummary:
      'When every graha is positioned on one side of the Rahu–Ketu axis, the Kaal Sarp Yoga is formed. Its 12 variants (Anant, Kulik, Vasuki, Shankhpal, Padma, Mahapadma, Takshak, Karkotak, Shankachur, Ghatak, Vishdhar, Sheshnag) differ by the house of affliction. It is not always malefic — a full-strength Kaal Sarp often bestows rajyoga results after the karmic debt is discharged through remedies.',
    causes: [
      'All planets hemmed between Rahu and Ketu (one-sided axis)',
      'Rahu in an angular house (kendra) with Ketu in its 7th opposition',
      'Birth taken during a solar or lunar eclipse window'
    ],
    symptoms: [
      'Sudden, inexplicable failures despite meticulous effort',
      'Mental anxiety, overthinking, and disturbed sleep cycles',
      'Delays in marriage, promotions, or ancestral property matters',
      'Repeating karmic patterns that feel inescapable'
    ],
    remedies: [
      { type: 'puja', text: 'Perform Kaal Sarp Dosh Nivaran Puja (Nag-Nagin Puja) at Trimbakeshwar Nashik on any Nag Panchami.' },
      { type: 'mantra', text: 'Chant "Om Namah Shivaya" and the Maha Mrityunjaya Mantra 108 times daily, ideally at Brahma Muhurta.' },
      { type: 'daan', text: 'Donate a silver or brass snake idol and feed milk to a real serpent on Nag Panchami.' },
      { type: 'behavioral', text: 'Install a Karuvelam/Peepal worship at home; avoid harming reptiles in any circumstance.' },
      { type: 'gemstone', text: 'Consult for a Rahu–Ketu balancing stone (Hessonite Gomed) — only after dasha analysis.' },
      { type: 'fast', text: 'Observe a partial fast on Nag Panchami and every Amavasya evening lighting a sesame-oil lamp.' }
    ],
    relatedPlanets: ['Rahu', 'Ketu', 'Saturn (Shani)'],
    relatedHouses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    keywordTags: ['kaal sarp dosh', 'kaal sarp yoga', 'kaal sarp puja', 'kaal sarp dosh nivaran', 'kaal sarp dosh remedy'],
    consultVolumeLabel: '9,860 people checked Kaal Sarp status this month',
    urgency: 'high',
    searchVolumeEstimate: 110000
  },
  {
    id: 'dosh_sade_sati',
    slug: 'shani-sade-sati',
    nameEn: 'Shani Sade Sati',
    nameHi: 'शनि साढ़े साती',
    category: 'dasha',
    shortSummary:
      'The seven-and-a-half-year Saturn transit when Shani crosses the 12th, 1st, and 2nd house from your natal Moon sign. The most feared and most karmically rewarding dasha phase in Vedic astrology.',
    detailedSummary:
      'Sade Sati literally means "seven and a half" — Saturn moves through the three signs preceding, coinciding with, and following your Janma Rashi. It is divided into three phases: Ardha (entry, health/finance pressure), Middle (identity, career, family restructuring), and Gaman (exit, harvest of lessons). Saturn never denies — he delays and purifies. The two biggest mitigators are Shani puja, Hanuman bhakti, and honest karma.',
    causes: [
      'Saturn transits the 12th house from natal Moon (Ardha Sade Sati)',
      'Saturn transits the natal Moon sign itself (Moola Sade Sati)',
      'Saturn transits the 2nd house from natal Moon (Gaman Sade Sati)'
    ],
    symptoms: [
      'Unexplained financial pressure and debt accumulation',
      'Career stagnation despite competence and visible results',
      'Health decline — joint pain, chronic fatigue, dental issues',
      'Family disharmony and social isolation or loss of reputation'
    ],
    remedies: [
      { type: 'puja', text: 'Perform Shani Shanti Puja / Sade Sati Puja at Shingnapur, Ujjain, or Thirunallar on a Saturday.' },
      { type: 'mantra', text: 'Chant the Shani mantra "Om Sham Shanaischaraya Namah" or Hanuman Chalisa daily at evening.' },
      { type: 'daan', text: 'Donate black sesame (til), iron, mustard oil, or black blanket to the needy on Saturday.' },
      { type: 'behavioral', text: 'Serve the elderly, labourers, and animals — Saturn rewards humility and honest service.' },
      { type: 'fast', text: 'Observe a Saturday fast (only one meal) with food offered to crows or dogs before eating.' },
      { type: 'gemstone', text: 'Blue Sapphire (Neelam) or Amethyst only after verifying Saturn strength — never wear without a chart check.' }
    ],
    relatedPlanets: ['Saturn (Shani)', 'Moon (Chandra)'],
    relatedHouses: [12, 1, 2],
    keywordTags: ['shani sade sati', 'sade sati 2026', 'sade sati remedy', 'sadhe sati ka ilaj', 'shani dhaiya'],
    consultVolumeLabel: '12,540 people are in Sade Sati right now',
    urgency: 'high',
    searchVolumeEstimate: 90500
  },
  {
    id: 'dosh_pitra',
    slug: 'pitra-dosh',
    nameEn: 'Pitra Dosh',
    nameHi: 'पितृ दोष',
    category: 'dosh',
    shortSummary:
      'Ancestral karmic debt indicated by Sun–Rahu conjunction, 9th house affliction, or Saturn in the 5th/9th. Manifests as obstacles to progeny, education, and family lineage.',
    detailedSummary:
      'Pitra Dosh signals unsettled karma of forefathers. Classical markers: afflicted 9th house (dharma bhava), Sun conjunct Rahu or Ketu, Saturn in the 5th, and unfulfilled ancestral rites. The remedy is always tri-purusha — Tarpan (offer water), Pind Daan, and fulfilling the pending dharma of the lineage.',
    causes: [
      'Sun or Saturn afflicted in the 5th / 9th house',
      'Rahu conjunct Sun or Ketu (ancestral shadow)',
      'Unperformed shraddha, tarpana, or ancestral pind daan'
    ],
    symptoms: [
      'Delays or complications in childbirth and progeny',
      'Repeated failure in education and competitive examinations',
      'Chronic family disputes over property and inheritance',
      'Feeling of being blocked in every auspicious beginning'
    ],
    remedies: [
      { type: 'puja', text: 'Perform Pitra Dosh Nivaran Puja and Trimbakeshwar Pind Daan during the Pitri Paksha fortnight.' },
      { type: 'mantra', text: 'Chant "Om Pitrubhyah Namah" and offer Argya (water with black sesame) to the Sun at sunrise.' },
      { type: 'daan', text: 'Annadan (food donation), cow donation (gau daan), and feeding Brahmins during Pitri Paksha.' },
      { type: 'behavioral', text: 'Regularly perform Shraddha with tarpan — fulfil the last rites pending in your lineage.' },
      { type: 'fast', text: 'Fast on Amavasya (new moon) with lighting a mustard-oil diya under a Peepal tree in the evening.' }
    ],
    relatedPlanets: ['Sun (Surya)', 'Saturn (Shani)', 'Rahu', 'Ketu'],
    relatedHouses: [5, 9, 1, 4],
    keywordTags: ['pitra dosh', 'pitru dosha', 'pitra dosh nivaran', 'pitru dosh pooja', 'pitra dosh remedy'],
    consultVolumeLabel: '5,318 people checked Pitra Dosh this month',
    urgency: 'high',
    searchVolumeEstimate: 55000
  },
  {
    id: 'dosh_guru_chandal',
    slug: 'guru-chandal-yoga',
    nameEn: 'Guru Chandal Yoga',
    nameHi: 'गुरु चांडाल योग',
    category: 'yoga',
    shortSummary:
      'The Jupiter–Rahu conjunction that distorts wisdom, dharma, and ethical judgement. Often mis-read as purely malefic — in fact it becomes a powerful rajyoga when consciously channelised.',
    detailedSummary:
      'When Guru (Jupiter, the planet of dharma and wisdom) conjoins Chandal (Rahu, the shadow of illusion), the classical texts warn of unscrupulous teachers, misguided wisdom, and moral compromise. Yet Phaladeepika notes that in the 3rd, 6th, 10th or 11th house, this conjunction grants exceptional strategic brilliance, political mastery, and unconventional success. The shadow must be integrated, not suppressed.',
    causes: [
      'Jupiter and Rahu conjunct in the same house from Lagna',
      'Guru receiving an aspect from Rahu or Ketu',
      'Jupiter in a malefic house (6, 8, 12) with a node affliction'
    ],
    symptoms: [
      'Repeated betrayal by mentors, gurus, or senior figures',
      'Ethical dissonance between your ambition and values',
      'Confusion around religion, spirituality, and purpose',
      'Sharp intellect misdirected towards manipulation'
    ],
    remedies: [
      { type: 'mantra', text: 'Chant the Guru Stotra and "Om Gram Greem Graum Sah Gurave Namah" every Thursday.' },
      { type: 'daan', text: 'Donate yellow items — turmeric, chana dal, yellow cloth, ghee — to Brahmins or a temple on Thursday.' },
      { type: 'behavioral', text: 'Volunteer as a teacher for the underprivileged — Rahu in Guru channelises through selfless service.' },
      { type: 'puja', text: 'Perform Brihaspati Puja / Vishnu Sahasranama path under the guidance of an Acharya.' },
      { type: 'gemstone', text: 'Yellow Sapphire (Pukhraj) only after verifying Jupiter strength — weight and timing matter.' }
    ],
    relatedPlanets: ['Jupiter (Guru)', 'Rahu'],
    relatedHouses: [3, 6, 9, 10, 11],
    keywordTags: ['guru chandal yoga', 'guru chandali dosha', 'guru chandal dosh', 'guru rahu conjunction'],
    consultVolumeLabel: '2,207 people checked Guru Chandal this month',
    urgency: 'high',
    searchVolumeEstimate: 27000
  },
  {
    id: 'dosh_angarak',
    slug: 'angarak-yoga',
    nameEn: 'Angarak Yoga',
    nameHi: 'अंगारक योग',
    category: 'yoga',
    shortSummary:
      'The Mars–Rahu conjunction — explosive drive, sudden risk appetite, and a volatility profile that both builds and breaks fortunes quickly.',
    detailedSummary:
      'Angarak Yoga results from Mangal (fire, action, weapons) and Rahu (obsession, illusion, amplification) occupying the same house. Classical texts call it Angaraka — the burning coal. Temper, accidents, and impulsive decisions are hallmark risks, while the same intensity produces fearless entrepreneurs, surgeons, and defence personnel.',
    causes: [
      'Mars and Rahu conjunct from Lagna',
      'Mars receiving a full aspect from Rahu',
      'Mangal in the 7th or 8th with Rahu in an angular trine'
    ],
    symptoms: [
      'Sudden, uncontrollable anger and confrontational behaviour',
      'Accident-proneness and blood-related health issues',
      'Impulsive financial or speculative decisions',
      'Strained relationships due to harsh speech'
    ],
    remedies: [
      { type: 'mantra', text: 'Chrant Hanuman Chalisa and "Om Kram Kreem Kraum Sah Bhaumaya Namah" daily, especially on Tuesday.' },
      { type: 'puja', text: 'Perform Mangal Puja / Navagraha Shanti at a Hanuman temple on Tuesday.' },
      { type: 'daan', text: 'Donate red masoor dal, jaggery, and copper to a Hanuman temple on Tuesday.' },
      { type: 'behavioral', text: 'Practise martial arts, athletics, or disciplined physical training to channel the fire constructively.' },
      { type: 'gemstone', text: 'Avoid Red Coral in strong Angarak — it amplifies the affliction. Consult for a substitute.' }
    ],
    relatedPlanets: ['Mars (Mangal)', 'Rahu'],
    relatedHouses: [1, 4, 7, 8, 10],
    keywordTags: ['angarak yoga', 'mangal rahu conjunction', 'angarak dosh', 'angarak yoga 2026'],
    consultVolumeLabel: '3,915 people checked Angarak Yoga this month',
    urgency: 'high',
    searchVolumeEstimate: 22000
  },
  {
    id: 'dosh_gandmool',
    slug: 'gandmool-nakshatra-dosh',
    nameEn: 'Gandmool Nakshatra Dosh',
    nameHi: 'गंडमूल नक्षत्र दोष',
    category: 'nakshatra',
    shortSummary:
      'Birth on the 6 ill-fated nakshatras of Ashwini, Ashlesha, Magha, Jyeshtha, Moola and Revati. Requires a Gandmool Shanti puja within 27 days of birth classically.',
    detailedSummary:
      'The 27 nakshatras are divided into four ganas. Six nakshatras — each ruled by Ketu (Ashwini, Magha, Moola) and Mercury (Ashlesha, Jyeshtha, Revati) — are classified Gandmool. A birth in these lunar mansions traditionally calls for Shanti Puja 12 times (or once on the 27th day) to neutralise karmic friction. Without remedy, classical belief attaches risk to the child\'s longevity, the father\'s wellbeing, and later material stability.',
    causes: [
      'Ashwini (Ketu ruled) — risk to the native\'s father',
      'Ashlesha, Jyeshtha, Revati (Mercury ruled) — risk to the native\'s mother',
      'Magha, Moola (Ketu ruled) — material and lineage friction'
    ],
    symptoms: [
      'Early-life health fragility in classical interpretation',
      'Recurring parental or maternal-family obstacles',
      'Unexplained karmic delays in education and property'
    ],
    remedies: [
      { type: 'puja', text: 'Perform Gandmool Nakshatra Shanti Puja on the 27th day after birth, or on any purnima later.' },
      { type: 'mantra', text: 'Chant the ruling deity stotra of the birth nakshatra (Ashwini — Ashwini Kumar, Moola — Nirriti/Nagara) daily.' },
      { type: 'daan', text: 'Donate to a cow-shelter or offer sesame and rice to the mother\'s family deity.' },
      { type: 'behavioral', text: 'Regularly honour your mother and maternal lineage — Mercury nakshatras resolve through maternal dharma.' }
    ],
    relatedPlanets: ['Ketu', 'Mercury (Budh)', 'Moon (Chandra)'],
    relatedHouses: [1, 4, 9],
    keywordTags: ['gandmool nakshatra', 'gand mool dosh', 'gandmool dosh nivaran', 'gandmool shanti puja'],
    consultVolumeLabel: '1,406 people checked Gandmool status this month',
    urgency: 'medium',
    searchVolumeEstimate: 14800
  },
  {
    id: 'dosh_shrapit',
    slug: 'shrapit-dosh',
    nameEn: 'Shrapit Dosha',
    nameHi: 'श्रापित दोष',
    category: 'dosh',
    shortSummary:
      'A composite curse affliction from Saturn + Rahu + Ketu configuration, giving a persistent feeling that every effort is sabotaged before fruition.',
    detailedSummary:
      'Shrapit Dosha is identified when Saturn is conjunct Rahu, or Ketu is conjunct Saturn or Rahu, particularly in the 1st, 5th, 8th, or 9th house. It is read as the accumulated karmic debt (shrap) from past lives attached to the current birth. The Sanskrit sutras prescribe Rahu–Ketu Shanti, along with Shani puja, to discharge the debt.',
    causes: [
      'Saturn conjunct Rahu or Ketu in a kendra or trikona',
      'Rahu and Ketu together afflicting the Lagna lord',
      'Mahadasha or Antardasha of Saturn/Rahu during a critical life stage'
    ],
    symptoms: [
      'Efforts collapsing at the final stage without an identifiable cause',
      'Persistent self-sabotage and fear of success',
      'Strained paternal relationships and inheritance blocks',
      'Chronic disconnection between intention and outcome'
    ],
    remedies: [
      { type: 'puja', text: 'Perform Navagraha Puja / Rahu–Ketu Shanti at a Navagraha temple during an eclipse window.' },
      { type: 'mantra', text: 'Chant the Rahu Beej Mantra "Om Bhram Bhreem Bhroum Sah Rahave Namah" 108 times daily.' },
      { type: 'daan', text: 'Donate black gram (urad), blankets, and sesame on Saturday at a Shani temple.' },
      { type: 'behavioral', text: 'Practise deep accountability work — Shrapit resolves fastest through karma correction, not just ritual.' }
    ],
    relatedPlanets: ['Saturn (Shani)', 'Rahu', 'Ketu'],
    relatedHouses: [1, 5, 8, 9],
    keywordTags: ['shrapit dosh', 'shrapit dosh nivaran', 'shrapit dosha', 'shani rahu conjunction', 'shrapit dosh remedy'],
    consultVolumeLabel: '2,749 people checked Shrapit Dosh this month',
    urgency: 'high',
    searchVolumeEstimate: 18100
  }
];

export const DOSH_CATEGORY_LABELS: Record<DoshEntry['category'], { label: string; icon: string }> = {
  dosh: { label: 'Grah Dosha', icon: '⚠️' },
  dasha: { label: 'Dasha Phase', icon: '⏳' },
  yoga: { label: 'Trine Yoga', icon: '✨' },
  nakshatra: { label: 'Nakshatra', icon: '🌙' }
};

export function findDoshBySlug(slug: string): DoshEntry | undefined {
  return DOSH_ENCYCLOPEDIA.find(d => d.slug === slug);
}

export function searchDosh(query: string): DoshEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return DOSH_ENCYCLOPEDIA;
  return DOSH_ENCYCLOPEDIA.filter(d =>
    d.nameEn.toLowerCase().includes(q) ||
    d.nameHi.includes(query.trim()) ||
    d.shortSummary.toLowerCase().includes(q) ||
    d.keywordTags.some(t => t.toLowerCase().includes(q))
  );
}
