import { GunaMilanResult } from '../types/astrotalk';

export function calculateGunaMilan(
  boyName: string,
  boyDob: string,
  boyRashi: string,
  girlName: string,
  girlDob: string,
  girlRashi: string
): GunaMilanResult {
  const hash = Math.abs(
    (boyName.length * 37 + girlName.length * 41 + new Date(boyDob).getTime() % 1000 + new Date(girlDob).getTime() % 1000) % 100
  );

  // Deterministic scores that yield realistic Astrotalk scores (between 18 and 34)
  const varna = hash % 2 === 0 ? 1 : 1;
  const vashya = (hash % 3 === 0) ? 1.5 : 2;
  const tara = (hash % 4 === 0) ? 2 : 3;
  const yoni = 2 + (hash % 3); // 2, 3, or 4
  const grahaMaitri = 3.5 + (hash % 3) * 0.5; // 3.5, 4, or 5
  const gana = (hash % 5 === 0) ? 4 : 6;
  const bhakoot = (hash % 7 === 0) ? 0 : 7;
  const nadi = (hash % 6 === 0) ? 0 : 8;

  const totalScore = Math.min(36, Math.max(18, Math.round(varna + vashya + tara + yoni + grahaMaitri + gana + bhakoot + nadi)));
  const percentage = Math.round((totalScore / 36) * 100);

  let verdict: 'Excellent Match' | 'Very Good Match' | 'Average Match' | 'Requires Remedies' = 'Very Good Match';
  let recommendation = '';

  if (totalScore >= 28) {
    verdict = 'Excellent Match';
    recommendation = 'Exceptionally auspicious alignment (Uttam Vivah Yog). Both charts exhibit deep spiritual and mental harmony, long marital longevity, and mutual prosperity.';
  } else if (totalScore >= 21) {
    verdict = 'Very Good Match';
    recommendation = 'Strong astrological synergy with high emotional understanding. A happy and enduring marital union is indicated with mutual respect.';
  } else if (totalScore >= 18) {
    verdict = 'Average Match';
    recommendation = 'Moderate compatibility. Marriage is permissible according to classical scriptures, but standard pre-marital remedies and mutual patience are advised.';
  } else {
    verdict = 'Requires Remedies';
    recommendation = 'Score is under classical 18 Guna threshold. Detailed horoscope matching and planetary shanti pujas (especially for Nadi/Bhakoot dosha) are recommended before finalizing.';
  }

  const isManglikBoy = hash % 3 === 0;
  const isManglikGirl = hash % 4 === 0;
  let manglikStatus = 'Neither chart has Manglik Dosha.';
  if (isManglikBoy && isManglikGirl) {
    manglikStatus = 'Both partners are Manglik — Dosha is successfully neutralized (Dosha Samya / Cancellation).';
  } else if (isManglikBoy) {
    manglikStatus = 'Boy is Anshik Manglik. Kumbh Vivah or Hanuman Chalisa recitation recommended.';
  } else if (isManglikGirl) {
    manglikStatus = 'Girl is Anshik Manglik. Vishnu Pratima Vivah or Mangal Shanti recommended.';
  }

  const ashtakoota = [
    {
      attribute: '1. Varna (वर्ण)',
      description: 'Spiritual compatibility & mutual ego alignment',
      maxScore: 1,
      obtainedScore: varna,
      interpretation: varna === 1 ? 'Flawless harmony in intellectual and spiritual perspectives.' : 'Average compatibility.'
    },
    {
      attribute: '2. Vashya (वश्य)',
      description: 'Mutual attraction and mental control & respect',
      maxScore: 2,
      obtainedScore: vashya,
      interpretation: vashya >= 1.5 ? 'Excellent mutual respect and supportive influence.' : 'Moderate dynamic.'
    },
    {
      attribute: '3. Tara (तारा)',
      description: 'Birth star auspiciousness, destiny & longevity',
      maxScore: 3,
      obtainedScore: tara,
      interpretation: tara === 3 ? 'Auspicious birth star synchronization indicating long-term prosperity.' : 'Good synchronization.'
    },
    {
      attribute: '4. Yoni (योनि)',
      description: 'Physical affinity, intimacy & biological synergy',
      maxScore: 4,
      obtainedScore: yoni,
      interpretation: yoni >= 3 ? 'Harmonious physiological resonance and physical affinity.' : 'Balanced emotional compatibility.'
    },
    {
      attribute: '5. Graha Maitri (ग्रह मैत्री)',
      description: 'Mental friendship, psychological bonding & friendship',
      maxScore: 5,
      obtainedScore: grahaMaitri,
      interpretation: grahaMaitri >= 4 ? 'Planetary lords are intimate friends, ensuring cheerful conversation.' : 'Adequate planetary alliance.'
    },
    {
      attribute: '6. Gana (गण)',
      description: 'Temperament and behavioral temperament compatibility',
      maxScore: 6,
      obtainedScore: gana,
      interpretation: gana === 6 ? 'Synchronized temperaments (Deva/Manushya gana affinity).' : 'Difference in temperament solvable with patience.'
    },
    {
      attribute: '7. Bhakoot (भकूट)',
      description: 'Financial growth, family health & progeny happiness',
      maxScore: 7,
      obtainedScore: bhakoot,
      interpretation: bhakoot === 7 ? 'Prosperous moon rashi placement, blessing family with wealth.' : 'Bhakoot dosha requires Brihaspati puja.'
    },
    {
      attribute: '8. Nadi (नाड़ी)',
      description: 'Genetic compatibility, nervous system & healthy progeny',
      maxScore: 8,
      obtainedScore: nadi,
      interpretation: nadi === 8 ? 'Different nadis guarantee optimal genetic vitality and progeny.' : 'Same nadi detected; Mahamrityunjaya japa advised.'
    }
  ];

  return {
    boyName,
    girlName,
    boyRashi,
    girlRashi,
    boyNakshatra: 'Rohini (रोहिणी)',
    girlNakshatra: 'Uttara Phalguni (उत्तरा फाल्गुनी)',
    totalScore,
    maxScore: 36,
    percentage,
    verdict,
    recommendation,
    isManglikBoy,
    isManglikGirl,
    manglikStatus,
    ashtakoota
  };
}
