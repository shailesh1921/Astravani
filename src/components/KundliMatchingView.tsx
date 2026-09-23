import React, { useState } from 'react';
import { calculateGunaMilan } from '../utils/gunaMilanEngine';
import { GunaMilanResult, Astrologer } from '../types/astrotalk';
import { HeartHandshake, Sparkles, CheckCircle2, AlertTriangle, MessageSquare, ShieldCheck, Share2, Printer } from 'lucide-react';

interface KundliMatchingViewProps {
  onConsultMatch: (astrologer?: Astrologer) => void;
}

export const KundliMatchingView: React.FC<KundliMatchingViewProps> = ({ onConsultMatch }) => {
  const [boyData, setBoyData] = useState({
    name: 'Rohan Verma',
    dob: '1996-03-12',
    rashi: 'Leo (सिंह)'
  });

  const [girlData, setGirlData] = useState({
    name: 'Pooja Sharma',
    dob: '1998-09-18',
    rashi: 'Aries (मेष)'
  });

  const [matchingResult, setMatchingResult] = useState<GunaMilanResult | null>(() =>
    calculateGunaMilan('Rohan Verma', '1996-03-12', 'Leo (सिंह)', 'Pooja Sharma', '1998-09-18', 'Aries (मेष)')
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = calculateGunaMilan(
      boyData.name,
      boyData.dob,
      boyData.rashi,
      girlData.name,
      girlData.dob,
      girlData.rashi
    );
    setMatchingResult(result);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-bold text-pink-700 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full uppercase tracking-wider">
          Ashtakoota 36-Guna Milan
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Free Kundli Matching for Marriage
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Calculate 36 Guna compatibility, Manglik Dosha compatibility, and marital harmony based on Vedic Jyotish.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-at-card mb-8">
        <form onSubmit={handleCalculate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            
            {/* Boy's Details */}
            <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-blue-200/60 pb-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  ♂
                </span>
                <h3 className="text-sm font-bold text-blue-950">Groom's Details (वर विवरण)</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Boy's Full Name</label>
                <input
                  type="text"
                  required
                  value={boyData.name}
                  onChange={(e) => setBoyData({ ...boyData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Boy's Date of Birth</label>
                <input
                  type="date"
                  required
                  value={boyData.dob}
                  onChange={(e) => setBoyData({ ...boyData, dob: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Girl's Details */}
            <div className="bg-pink-50/40 border border-pink-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-pink-200/60 pb-2">
                <span className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold">
                  ♀
                </span>
                <h3 className="text-sm font-bold text-pink-950">Bride's Details (वधू विवरण)</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Girl's Full Name</label>
                <input
                  type="text"
                  required
                  value={girlData.name}
                  onChange={(e) => setGirlData({ ...girlData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Girl's Date of Birth</label>
                <input
                  type="date"
                  required
                  value={girlData.dob}
                  onChange={(e) => setGirlData({ ...girlData, dob: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-amber-500"
                />
              </div>
            </div>

          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="submit"
              className="btn-astrotalk px-8 py-3 text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Match Horoscopes (36 Guna Milan)</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {matchingResult && (
        <div className="space-y-6">
          
          {/* Main Score Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-at-card">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Couple Names & Circular Score */}
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-lg flex-shrink-0">
                  <div className="text-center">
                    <span className="text-3xl font-black leading-none block">{matchingResult.totalScore}</span>
                    <span className="text-[11px] font-bold opacity-90">/ 36 Gunas</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {matchingResult.boyName} & {matchingResult.girlName}
                    </h3>
                  </div>
                  <div className="inline-block mt-1">
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      matchingResult.totalScore >= 24
                        ? 'bg-emerald-100 text-emerald-800'
                        : matchingResult.totalScore >= 18
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {matchingResult.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 max-w-lg leading-relaxed">
                    {matchingResult.recommendation}
                  </p>
                </div>
              </div>

              {/* Consultation & Share CTAs */}
              <div className="flex flex-col sm:flex-row md:flex-col items-center md:items-end gap-2 flex-shrink-0">
                <button
                  onClick={() => onConsultMatch()}
                  className="btn-astrotalk px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md w-full sm:w-auto"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Talk to Marriage Astrologer</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `🚩 *AstraVani Kundli Milan Report*\n\n` +
                        `💍 *Match:* ${matchingResult.boyName} & ${matchingResult.girlName}\n` +
                        `⭐ *Guna Score:* ${matchingResult.totalScore} / 36 (${matchingResult.percentage}%)\n` +
                        `📜 *Verdict:* ${matchingResult.verdict}\n` +
                        `🛡️ *Manglik Status:* ${matchingResult.manglikStatus}\n\n` +
                        `✨ Check 36-Guna Marriage Compatibility free on AstraVani: https://astravani.in`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>WhatsApp Share</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3 h-3 text-slate-500" />
                    <span>Save PDF</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Manglik Dosha Status Pill */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Manglik Analysis:</span>
              <span className="text-slate-900 font-bold">{matchingResult.manglikStatus}</span>
            </div>
          </div>

          {/* Detailed 8 Ashtakoota Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-at-card">
            <h4 className="text-base font-bold text-slate-900 mb-4">
              Ashtakoota Milan Breakdown (अष्टकूट मिलान)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Guna Attribute</th>
                    <th className="pb-3">Significance</th>
                    <th className="pb-3">Max</th>
                    <th className="pb-3">Obtained</th>
                    <th className="pb-3">Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {matchingResult.ashtakoota.map((koot) => (
                    <tr key={koot.attribute} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-900">{koot.attribute}</td>
                      <td className="py-2.5 text-slate-500">{koot.description}</td>
                      <td className="py-2.5 font-bold">{koot.maxScore}</td>
                      <td className="py-2.5">
                        <span className={`font-extrabold px-2 py-0.5 rounded text-[11px] ${
                          koot.obtainedScore === koot.maxScore
                            ? 'bg-emerald-100 text-emerald-800'
                            : koot.obtainedScore > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {koot.obtainedScore}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600">{koot.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </section>
  );
};
