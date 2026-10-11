import React, { useState } from 'react';
import { calculateKundli } from '../utils/kundliEngine';
import { NorthIndianKundliChart } from './NorthIndianKundliChart';
import { KundliData, Astrologer, ConsultationIntake } from '../types/astrotalk';
import { Sparkles, Calendar, Clock, MapPin, User, ShieldCheck, Gem, MessageSquare, Share2, Printer, AlertTriangle, Zap, Award, Star } from 'lucide-react';
import { analytics } from '../services/analytics';
import { ASTROLOGERS_DATA } from '../data/astrologersData';

interface FreeKundliViewProps {
  onConsultKundli: (astrologer?: Astrologer, intakeData?: Partial<ConsultationIntake>, sourceTool?: 'kundli' | 'matching' | 'horoscope' | 'blog' | 'dosh', dosh?: string) => void;
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
    
    // Track kundli generation
    analytics.trackKundliGenerate({
      has_dob: !!formData.dob,
      has_tob: !!formData.tob,
      has_pob: !!formData.pob,
    });
  };

  const handleConsultClick = (intakeData?: Partial<ConsultationIntake>) => {
    analytics.trackFreeToolToConsult({ tool: 'kundli' });
    const dosh = kundliResult?.mahadasha?.toLowerCase().includes('shani') ? 'shani sade sati' :
                 kundliResult?.mahadasha?.toLowerCase().includes('mangal') ? 'manglik' :
                 kundliResult?.mahadasha?.toLowerCase().includes('rahu') ? 'rahu mahadasha' :
                 kundliResult?.mahadasha?.toLowerCase().includes('ketu') ? 'ketu mahadasha' : null;
    onConsultKundli(undefined, intakeData, 'kundli', dosh || undefined);
  };

  // Find best specialist for detected dosh/issues
  const findSpecialist = (kundli: KundliData): Astrologer | null => {
    const specialties = kundli.mahadasha.toLowerCase();
    const hasShani = specialties.includes('shani') || specialties.includes('sade sati');
    const hasMangal = specialties.includes('mangal') || specialties.includes('manglik');
    const hasRahu = specialties.includes('rahu');
    const hasKetu = specialties.includes('ketu');

    // Priority: Shani Sade Sati → Manglik → Kaal Sarp → General Vedic
    if (hasShani) {
      return ASTROLOGERS_DATA.find(a => 
        a.specialties.some(s => s.toLowerCase().includes('sade sati') || s.toLowerCase().includes('shani'))
      ) || ASTROLOGERS_DATA[0];
    }
    if (hasMangal) {
      return ASTROLOGERS_DATA.find(a => 
        a.specialties.some(s => s.toLowerCase().includes('manglik') || s.toLowerCase().includes('mangal'))
      ) || ASTROLOGERS_DATA[0];
    }
    if (hasRahu || hasKetu) {
      return ASTROLOGERS_DATA.find(a => 
        a.specialties.some(s => s.toLowerCase().includes('rahu') || s.toLowerCase().includes('mahadasha'))
      ) || ASTROLOGERS_DATA[0];
    }
    // Default to top Vedic expert
    return ASTROLOGERS_DATA.find(a => a.personaType === 'vedic') || ASTROLOGERS_DATA[0];
  };

  const specialist = kundliResult ? findSpecialist(kundliResult) : null;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 w-full overflow-hidden">
      
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
                  onClick={() => handleConsultClick()}
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

            {/* North Indian Kundli Chart (Authentic Vedic Diamond SVG) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-at-card flex flex-col items-center">
              <NorthIndianKundliChart kundli={kundliResult} className="w-full" />
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

            {/* HIGH-CONVERTING WORKFLOW HOOK: Specialist Match for Detected Dosh */}
            {specialist && (
              <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-red-500/10 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm my-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>Vedic Dosh Alert</span>
                      <span>•</span>
                      <span>Grah Dosh & Mahadasha Analysis</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                      Aapki Kundli me <span className="text-amber-700">{kundliResult.mahadasha} Mahadasha</span> aur Shani / Mangal ki sthiti ka vishesh prabhav hai
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Kariyar me rukawat, vivah me vilamb, ya health/finance ke sawal par Vedic Acharya se direct paramarsh lein aur shanti upay jaanein.
                    </p>
                  </div>

                  {/* Specialist Match Card */}
                  <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-amber-200 rounded-2xl p-3 shadow-lg flex-shrink-0 min-w-[280px]">
                    <img 
                      src={specialist.avatarUrl} 
                      alt={specialist.name} 
                      className="w-14 h-14 rounded-xl border-2 border-amber-300 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Your Matched Specialist</p>
                      <h4 className="font-extrabold text-slate-900 truncate">{specialist.name}</h4>
                      <p className="text-xs text-slate-600 truncate">{specialist.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {specialist.expertiseBadges.slice(0, 2).map((badge) => (
                          <span key={badge} className="text-[9px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">
                            {badge}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span className="font-bold text-slate-900">{specialist.rating}</span>
                        <span className="text-slate-500">({(specialist.reviewsCount/1000).toFixed(1)}k+ reviews)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConsultClick({
                      name: kundliResult.name,
                      gender: kundliResult.gender as any,
                      dob: formData.dob,
                      tob: formData.tob,
                      pob: kundliResult.pob,
                      topic: 'Marriage & Kundli',
                      question: `Namaste Pandit Ji, meri Janam Kundli me ${kundliResult.mahadasha} Mahadasha aur Shani/Mangal grah dosha ke prabhav aur upay batayein.`
                    })}
                    className="btn-astrotalk px-5 py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-transform active:scale-95 flex-shrink-0 rounded-xl"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-200" />
                    <span>Claim 1-Min Free Talk with {specialist.name.split(' ')[0]} ⚡</span>
                  </button>
                </div>
              </div>
            )}

            {/* Social Proof Strip */}
            {kundliResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-bold text-slate-900">1,247</span>
                    <span>people consulted for</span>
                    <span className="font-bold text-amber-700">{kundliResult.mahadasha.split(' ')[0]} Dosh</span>
                    <span>this month</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-bold text-slate-900">98%</span>
                    <span>satisfaction rate</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-bold text-emerald-700">\u003c60s</span>
                    <span>avg connect time</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar: WhatsApp Share, Print PDF, and Consult Astrologer */}
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

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `🚩 *AstraVani Vedic Janam Kundli Report*\n\n` +
                      `👤 *Name:* ${kundliResult.name}\n` +
                      `♈ *Lagna (Ascendant):* ${kundliResult.lagnaSign}\n` +
                      `🌙 *Moon Sign (Chandra Rashi):* ${kundliResult.chandraRashi}\n` +
                      `☀️ *Sun Sign (Surya Rashi):* ${kundliResult.suryaRashi}\n` +
                      `⭐ *Nakshatra:* ${kundliResult.nakshatra} (Pada ${kundliResult.nakshatraPada})\n` +
                      `🪐 *Current Mahadasha:* ${kundliResult.mahadasha}\n` +
                      `💎 *Lucky Gemstone:* ${kundliResult.luckyGemstone}\n\n` +
                      `✨ Check your authentic Janam Kundli & Chat with Astrologers at: https://astravani.in`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Save PDF</span>
                </button>

                <button
                  onClick={() => handleConsultClick()}
                  className="btn-astrotalk px-4 py-2 text-xs font-bold flex-shrink-0 cursor-pointer shadow-sm"
                >
                  Consult Astrologer
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};