import React, { useState } from 'react';
import { HOROSCOPES_DATA } from '../data/horoscopesData';
import { HoroscopeSign, Astrologer } from '../types/astrotalk';
import { Heart, Briefcase, Activity, Sparkles, MessageSquare } from 'lucide-react';

interface DailyHoroscopeViewProps {
  onConsultSign: (astrologer?: Astrologer) => void;
}

export const DailyHoroscopeView: React.FC<DailyHoroscopeViewProps> = ({ onConsultSign }) => {
  const [selectedSignId, setSelectedSignId] = useState<string>('aries');
  const [timeframe, setTimeframe] = useState<'today' | 'tomorrow' | 'year2026'>('today');

  const currentSign: HoroscopeSign =
    HOROSCOPES_DATA.find((s) => s.id === selectedSignId) || HOROSCOPES_DATA[0];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 w-full overflow-hidden">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
          Daily Rashifal & Astrology
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Today's Horoscope & Cosmic Transits
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select your Moon/Sun sign to discover today's auspicious timings, love predictions, and career roadmap.
        </p>

        {/* Timeframe Pills */}
        <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 mt-4 shadow-xs">
          {[
            { id: 'today', label: 'Today (आज)' },
            { id: 'tomorrow', label: 'Tomorrow (कल)' },
            { id: 'year2026', label: 'Year 2026 Forecast' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeframe === t.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 12 Signs Icon Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 mb-8">
        {HOROSCOPES_DATA.map((sign) => {
          const isSelected = sign.id === selectedSignId;
          return (
            <button
              key={sign.id}
              onClick={() => setSelectedSignId(sign.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition text-center cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-105'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/40'
              }`}
            >
              <span className="text-xl sm:text-2xl mb-1">{sign.icon}</span>
              <span className="text-[11px] font-bold leading-tight truncate w-full">{sign.nameEn}</span>
              <span className={`text-[9px] truncate w-full ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                {sign.nameHi.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Sign Detailed Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-at-card">
        
        {/* Sign Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-3xl shadow-xs flex-shrink-0">
              {currentSign.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-extrabold text-slate-900">{currentSign.nameEn}</h3>
                <span className="text-sm font-semibold text-slate-500">({currentSign.nameHi})</span>
              </div>
              <p className="text-xs text-slate-500">
                {currentSign.dates} • Element: {currentSign.element} • Ruling Planet: {currentSign.ruler}
              </p>
            </div>
          </div>

          <button
            onClick={() => onConsultSign()}
            className="btn-astrotalk px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Consult {currentSign.nameEn} Astrologer</span>
          </button>
        </div>

        {/* Lucky Numbers & Colors Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Lucky Number</span>
            <span className="text-base font-extrabold text-amber-600 mt-0.5 block">{currentSign.luckyNumber}</span>
          </div>
          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Lucky Color</span>
            <span className="text-sm font-extrabold text-emerald-800 mt-0.5 block">{currentSign.luckyColor}</span>
          </div>
          <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Auspicious Time (शुभ मुहूर्त)</span>
            <span className="text-xs font-extrabold text-blue-900 mt-0.5 block">{currentSign.luckyTime}</span>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-5">
          
          {/* Overview */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Overall Day's Cosmic Influence</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {currentSign.overview}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Love */}
            <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-4">
              <h5 className="text-xs font-bold text-rose-950 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Love & Relationships</span>
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">{currentSign.love}</p>
            </div>

            {/* Career */}
            <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4">
              <h5 className="text-xs font-bold text-blue-950 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                <span>Career, Business & Money</span>
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">{currentSign.career}</p>
            </div>

            {/* Health */}
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4">
              <h5 className="text-xs font-bold text-emerald-950 mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>Health, Vitality & Energy</span>
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">{currentSign.health}</p>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
