import React, { useState } from 'react';
import { KundliData } from '../types/astrotalk';

interface NorthIndianKundliChartProps {
  kundli: KundliData;
  className?: string;
}

const HOUSE_METADATA: Record<number, { nameHindi: string; nameEnglish: string; significance: string; karaka: string }> = {
  1: { nameHindi: 'प्रथम भाव (लग्न / तनु)', nameEnglish: '1st House (Lagna)', significance: 'Self, Personality, Health, Vitality & Life Direction', karaka: 'Sun (सूर्य)' },
  2: { nameHindi: 'द्वितीय भाव (धन / कुटुम्ब)', nameEnglish: '2nd House (Dhana)', significance: 'Accumulated Wealth, Family, Speech & Food habits', karaka: 'Jupiter (गुरु)' },
  3: { nameHindi: 'तृतीय भाव (सहज / पराक्रम)', nameEnglish: '3rd House (Sahaja)', significance: 'Courage, Younger Siblings, Short Travels & Skills', karaka: 'Mars (मंगल)' },
  4: { nameHindi: 'चतुर्थ भाव (सुख / मातृ)', nameEnglish: '4th House (Sukha)', significance: 'Mother, Home, Conveyance, Inner Peace & Assets', karaka: 'Moon (चन्द्र)' },
  5: { nameHindi: 'पंचम भाव (सुत / बुद्धि)', nameEnglish: '5th House (Putra)', significance: 'Intellect, Children, Romance, Mantras & Past Life Merits', karaka: 'Jupiter (गुरु)' },
  6: { nameHindi: 'षष्ठ भाव (रिपु / रोग)', nameEnglish: '6th House (Ripu)', significance: 'Daily Work, Health, Competitors & Debt Clearance', karaka: 'Mars / Saturn (शनि)' },
  7: { nameHindi: 'सप्तम भाव (जाया / विवाह)', nameEnglish: '7th House (Kalatra)', significance: 'Spouse, Marriage, Business Partnerships & Public Relations', karaka: 'Venus (शुक्र)' },
  8: { nameHindi: 'अष्टम भाव (आयु / रन्ध्र)', nameEnglish: '8th House (Ayu)', significance: 'Longevity, Sudden Transformations, Research & In-laws', karaka: 'Saturn (शनि)' },
  9: { nameHindi: 'नवम भाव (भाग्य / धर्म)', nameEnglish: '9th House (Bhagya)', significance: 'Good Fortune, Father, Guru, Pilgrimage & Higher Knowledge', karaka: 'Jupiter (गुरु)' },
  10: { nameHindi: 'दशम भाव (कर्म / राज्य)', nameEnglish: '10th House (Karma)', significance: 'Career, Fame, Executive Power, Govt Favor & Leadership', karaka: 'Sun / Mercury / Saturn' },
  11: { nameHindi: 'एकादश भाव (लाभ / आय)', nameEnglish: '11th House (Labha)', significance: 'Financial Gains, High Aspirations, Network & Elder Siblings', karaka: 'Jupiter (गुरु)' },
  12: { nameHindi: 'द्वादश भाव (व्यय / मोक्ष)', nameEnglish: '12th House (Vyaya)', significance: 'Foreign Travel/Settlement, Spiritual Moksha, Expenses & Meditation', karaka: 'Saturn / Ketu' }
};

export const NorthIndianKundliChart: React.FC<NorthIndianKundliChartProps> = ({ kundli, className = '' }) => {
  const [selectedHouse, setSelectedHouse] = useState<number>(1);

  // Map zodiac sign name to 1-based index (Aries = 1, Pisces = 12)
  const SIGN_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const lagnaClean = kundli.lagnaSign.split(' ')[0];
  const lagnaIndex = SIGN_NAMES.findIndex(s => s.toLowerCase() === lagnaClean.toLowerCase());
  const baseLagnaNum = lagnaIndex >= 0 ? lagnaIndex + 1 : 1;

  // Sign number for each house: (baseLagnaNum + house - 2) % 12 + 1
  const getSignNumForHouse = (h: number): number => {
    return ((baseLagnaNum + h - 2) % 12) + 1;
  };

  // Get planets in a specific house
  const getPlanetsInHouse = (h: number): string[] => {
    return kundli.planets
      .filter(p => p.house === h)
      .map(p => {
        const shortName = p.name.split(' ')[0];
        const hindi = p.name.includes('सूर्य') ? 'सू' :
                      p.name.includes('चन्द्र') ? 'चं' :
                      p.name.includes('मंगल') ? 'मं' :
                      p.name.includes('बुध') ? 'बु' :
                      p.name.includes('गुरु') ? 'गु' :
                      p.name.includes('शुक्र') ? 'शु' :
                      p.name.includes('शनि') ? 'श' :
                      p.name.includes('राहु') ? 'रा' :
                      p.name.includes('केतु') ? 'के' : shortName.substring(0, 2);
        return `${hindi}`;
      });
  };

  // House coordinates for labels and planet chips (center points)
  const housePoints: Record<number, { cx: number; cy: number; signX: number; signY: number }> = {
    1:  { cx: 200, cy: 110, signX: 200, signY: 55 },
    2:  { cx: 100, cy: 45,  signX: 135, signY: 28 },
    3:  { cx: 45,  cy: 100, signX: 28,  signY: 135 },
    4:  { cx: 110, cy: 200, signX: 55,  signY: 200 },
    5:  { cx: 45,  cy: 300, signX: 28,  signY: 265 },
    6:  { cx: 100, cy: 355, signX: 135, signY: 372 },
    7:  { cx: 200, cy: 290, signX: 200, signY: 345 },
    8:  { cx: 300, cy: 355, signX: 265, signY: 372 },
    9:  { cx: 355, cy: 300, signX: 372, signY: 265 },
    10: { cx: 290, cy: 200, signX: 345, signY: 200 },
    11: { cx: 355, cy: 100, signX: 372, signY: 135 },
    12: { cx: 300, cy: 45,  signX: 265, signY: 28 }
  };

  const selectedMeta = HOUSE_METADATA[selectedHouse] || HOUSE_METADATA[1];
  const selectedSignNum = getSignNumForHouse(selectedHouse);
  const selectedSignName = SIGN_NAMES[selectedSignNum - 1];
  const selectedPlanets = kundli.planets.filter(p => p.house === selectedHouse);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Title & Lagna Info */}
      <div className="flex items-center justify-between w-full max-w-[420px] mb-2 px-1 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-amber-900">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span>लग्न चक्र (Lagna Chart - D1)</span>
        </div>
        <div className="text-amber-800 font-medium">
          Lagna: <span className="font-bold text-amber-950">{kundli.lagnaSign}</span>
        </div>
      </div>

      {/* Vedic Diamond SVG */}
      <div className="relative w-full max-w-[420px] aspect-square bg-[#fffdf8] rounded-2xl p-2 border-2 border-amber-300 shadow-md">
        <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-sm font-sans">
          {/* Background fill */}
          <rect x="0" y="0" width="400" height="400" fill="#fefbf3" />

          {/* Outer Boundary */}
          <rect x="4" y="4" width="392" height="392" fill="none" stroke="#d97706" strokeWidth="3" rx="4" />

          {/* Diagonal Lines */}
          <line x1="4" y1="4" x2="396" y2="396" stroke="#b45309" strokeWidth="1.8" />
          <line x1="396" y1="4" x2="4" y2="396" stroke="#b45309" strokeWidth="1.8" />

          {/* Inner Diamond */}
          <polygon points="200,4 396,200 200,396 4,200" fill="none" stroke="#b45309" strokeWidth="2.2" />

          {/* Central Cross to complete 12 houses */}
          <line x1="100" y1="100" x2="300" y2="300" stroke="#d97706" strokeWidth="1" strokeDasharray="2,2" opacity="0.3" />
          <line x1="300" y1="100" x2="100" y2="300" stroke="#d97706" strokeWidth="1" strokeDasharray="2,2" opacity="0.3" />

          {/* Render All 12 Houses */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
            const { cx, cy, signX, signY } = housePoints[h];
            const signNum = getSignNumForHouse(h);
            const planets = getPlanetsInHouse(h);
            const isSelected = selectedHouse === h;

            return (
              <g 
                key={h} 
                className="cursor-pointer group"
                onClick={() => setSelectedHouse(h)}
              >
                {/* Active Highlight Glow Circle */}
                {isSelected && (
                  <circle cx={cx} cy={cy} r="32" fill="#fef3c7" opacity="0.85" />
                )}

                {/* Sign Number */}
                <text
                  x={signX}
                  y={signY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#b45309"
                  className="font-mono"
                >
                  {signNum}
                </text>

                {/* House Identifier (small hover text) */}
                <text
                  x={cx}
                  y={cy - (planets.length > 0 ? 14 : 0)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fontWeight="600"
                  fill={isSelected ? '#92400e' : '#78716c'}
                  opacity={isSelected ? 1 : 0.8}
                >
                  H{h}
                </text>

                {/* Planets Placed in House */}
                {planets.length > 0 && (
                  <g>
                    <rect
                      x={cx - (planets.length * 9)}
                      y={cy + 2}
                      width={planets.length * 18}
                      height="16"
                      rx="8"
                      fill={isSelected ? '#d97706' : '#f59e0b'}
                    />
                    <text
                      x={cx}
                      y={cy + 11}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="9"
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      {planets.join(' ')}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Traditional Center Emblem */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-amber-100/90 border border-amber-400 flex items-center justify-center shadow-inner">
            <span className="text-amber-900 font-bold text-xs">ॐ</span>
          </div>
        </div>
      </div>

      {/* Interactive House Details Card */}
      <div className="w-full max-w-[420px] mt-2.5 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs">
        <div className="flex items-center justify-between font-bold text-amber-950 mb-1">
          <div className="flex items-center gap-1">
            <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-[10px]">House {selectedHouse}</span>
            <span>{selectedMeta.nameHindi}</span>
          </div>
          <span className="text-amber-800 font-normal">Sign: <b>{selectedSignName} ({selectedSignNum})</b></span>
        </div>
        <p className="text-stone-700 leading-relaxed mb-1">{selectedMeta.significance}</p>
        <div className="flex items-center justify-between text-[11px] text-amber-900 border-t border-amber-200/60 pt-1">
          <span>Karaka: <b>{selectedMeta.karaka}</b></span>
          <span>Planets: <b>{selectedPlanets.length > 0 ? selectedPlanets.map(p => p.name).join(', ') : 'None (शून्य)'}</b></span>
        </div>
      </div>
    </div>
  );
};
