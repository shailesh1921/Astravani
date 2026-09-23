import React, { useState } from 'react';
import { calculateKundli } from '../utils/kundliEngine';
import { KundliData, Astrologer } from '../types/astrotalk';
import { Sparkles, Calendar, Clock, MapPin, User, ShieldCheck, Gem, MessageSquare } from 'lucide-react';

interface FreeKundliViewProps {
  onConsultKundli: (astrologer?: Astrologer) => void;
}

export const FreeKundliView: React.FC<FreeKundliViewProps> = ({ onConsultKundli }) => {
  const [formData, setFormData] = useState({
    name: 'Aarav Mehta',
    gender: 'Male',
    dob: '1995-10-24',
    tob: '08:45',
    pob: 'Varanasi, Uttar Pradesh'
  });

  const [kundliResult, setKundliResult] = useState<KundliData | null>(() =>
    calculateKundli('Aarav Mehta', 'Male', '1995-10-24', '08:45', 'Varanasi, Uttar Pradesh')
  );

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = calculateKundli(formData.name, formData.gender, formData.dob, formData.tob, formData.pob);
    setKundliResult(result);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
          100% Free Janam Kundli
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Online Janam Kundli & Horoscope Analysis
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Generate accurate Vedic birth chart, Lagna, Rashi, Nakshatra, and current Vimshottari Mahadasha instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-at-card">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" />
            <span>Enter Birth Details</span>
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                      formData.gender === g
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time of Birth</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  required
                  value={formData.tob}
                  onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Birth Place</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.pob}
                  onChange={(e) => setFormData({ ...formData, pob: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-astrotalk w-full py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Janam Kundli</span>
            </button>
          </form>
        </div>

        {/* Right: Kundli Results Display */}
        {kundliResult && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Quick Attributes Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-at-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{kundliResult.name}</h3>
                  <p className="text-xs text-slate-500">
                    Born on {kundliResult.dob} at {kundliResult.tob} ({kundliResult.pob})
                  </p>
                </div>

                <button
                  onClick={() => onConsultKundli()}
                  className="btn-astrotalk px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Astrologer About Kundli</span>
                </button>
              </div>

              {/* 4 Key Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3">
                  <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">Ascendant (लग्न)</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{kundliResult.lagnaSign.split(' ')[0]}</span>
                </div>
                <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3">
                  <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">Moon Sign (राशि)</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{kundliResult.chandraRashi.split(' ')[0]}</span>
                </div>
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">Nakshatra (नक्षत्र)</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{kundliResult.nakshatra.split(' ')[0]}</span>
                </div>
                <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-3">
                  <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider block">Active Dasha (दशा)</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{kundliResult.mahadasha.split(' ')[0]}</span>
                </div>
              </div>
            </div>

            {/* North Indian Kundli Chart (Diamond SVG) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-at-card">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>Lagna Chart (लग्न कुण्डली - North Indian Style)</span>
                <span className="text-xs text-amber-600 font-semibold">Vedic Sidereal</span>
              </h4>

              <div className="max-w-md mx-auto aspect-square relative bg-[#FFFDF7] border-2 border-amber-500 rounded-xl p-2 shadow-inner">
                {/* SVG Geometric Lines for North Indian Diamond Chart */}
                <svg viewBox="0 0 300 300" className="w-full h-full stroke-amber-500 stroke-[1.5] fill-none">
                  {/* Outer box */}
                  <rect x="0" y="0" width="300" height="300" />
                  {/* Diagonals */}
                  <line x1="0" y1="0" x2="300" y2="300" />
                  <line x1="0" y1="300" x2="300" y2="0" />
                  {/* Diamond */}
                  <polygon points="150,0 300,150 150,300 0,150" />
                </svg>

                {/* House Content Overlays */}
                {/* House 1 (Top Center Diamond) */}
                <div className="absolute top-[25%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-[10px] font-bold text-amber-700 block">1 (Lagna)</span>
                  <span className="text-xs font-extrabold text-slate-900">{kundliResult.housePlacements[0]?.planets.join(', ') || '—'}</span>
                </div>

                {/* House 2 (Top Left Triangular) */}
                <div className="absolute top-[12%] left-[28%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-[9px] font-semibold text-slate-500 block">2</span>
                  <span className="text-[11px] font-bold text-slate-800">{kundliResult.housePlacements[1]?.planets.join(', ') || ''}</span>
                </div>

                {/* House 12 (Top Right Triangular) */}
                <div className="absolute top-[12%] right-[28%] translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-[9px] font-semibold text-slate-500 block">12</span>
                  <span className="text-[11px] font-bold text-slate-800">{kundliResult.housePlacements[11]?.planets.join(', ') || ''}</span>
                </div>

                {/* House 4 (Center Left Diamond) */}
                <div className="absolute top-[50%] left-[25%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-[10px] font-bold text-amber-700 block">4</span>
                  <span className="text-xs font-extrabold text-slate-900">{kundliResult.housePlacements[3]?.planets.join(', ') || '—'}</span>
                </div>

                {/* House 7 (Bottom Center Diamond) */}
                <div className="absolute bottom-[25%] left-[50%] -translate-x-1/2 translate-y-1/2 text-center pointer-events-none">
                  <span className="text-[10px] font-bold text-amber-700 block">7 (Kalatra)</span>
                  <span className="text-xs font-extrabold text-slate-900">{kundliResult.housePlacements[6]?.planets.join(', ') || '—'}</span>
                </div>

                {/* House 10 (Center Right Diamond) */}
                <div className="absolute top-[50%] right-[25%] translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-[10px] font-bold text-amber-700 block">10 (Karma)</span>
                  <span className="text-xs font-extrabold text-slate-900">{kundliResult.housePlacements[9]?.planets.join(', ') || '—'}</span>
                </div>
              </div>
            </div>

            {/* Planetary Positions Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-at-card overflow-x-auto">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Planetary Coordinates (ग्रह स्थिति)</h4>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                    <th className="pb-2">Planet</th>
                    <th className="pb-2">Rashi (Sign)</th>
                    <th className="pb-2">Degree</th>
                    <th className="pb-2">Nakshatra</th>
                    <th className="pb-2">House</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {kundliResult.planets.map((p) => (
                    <tr key={p.name} className="hover:bg-slate-50">
                      <td className="py-2 font-bold text-slate-900 flex items-center gap-1">
                        {p.name}
                        {p.isRetrograde && (
                          <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1 rounded">R</span>
                        )}
                      </td>
                      <td className="py-2">{p.rashi.split(' ')[0]}</td>
                      <td className="py-2 font-mono text-[11px]">{p.degree}</td>
                      <td className="py-2">{p.nakshatra.split(' ')[0]}</td>
                      <td className="py-2 font-bold text-amber-700">{p.house}th House</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Auspicious Remedies Pill */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Gem className="w-4 h-4 text-amber-600" />
                  <span>Recommended Auspicious Gemstone:</span>
                  <span className="font-extrabold text-amber-700">{kundliResult.luckyGemstone}</span>
                </div>
                <p className="text-xs text-slate-600">
                  Daily Chanting Mantra: <span className="font-semibold text-slate-800">{kundliResult.luckyMantra}</span>
                </p>
              </div>

              <button
                onClick={() => onConsultKundli()}
                className="btn-astrotalk px-5 py-2 text-xs font-bold flex-shrink-0 cursor-pointer shadow-sm"
              >
                Get Full Kundli Reading
              </button>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
