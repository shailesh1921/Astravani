import React, { useState, useMemo } from 'react';
import {
  Search, AlertTriangle, Sparkles, MessageSquare, X, ChevronRight, Clock,
  Users, CheckCircle2, Share2, BookOpen, Filter, TrendingUp, Flame
} from 'lucide-react';
import { DOSH_ENCYCLOPEDIA, DOSH_CATEGORY_LABELS, DoshEntry } from '../data/doshEncyclopedia';
import { analytics } from '../services/analytics';
import { isVariant } from '../services/growthExperiments';

interface DoshEncyclopediaViewProps {
  onConsultDosh: (doshName: string, question: string) => void;
  onOpenKundli: () => void;
}

export const DoshEncyclopediaView: React.FC<DoshEncyclopediaViewProps> = ({
  onConsultDosh,
  onOpenKundli
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | DoshEntry['category']>('all');
  const [selectedDosh, setSelectedDosh] = useState<DoshEntry | null>(null);

  const categories: Array<{ id: 'all' | DoshEntry['category']; label: string; icon: string }> = [
    { id: 'all', label: 'All Dosh', icon: '🔯' },
    { id: 'dosh', label: DOSH_CATEGORY_LABELS.dosh.label, icon: DOSH_CATEGORY_LABELS.dosh.icon },
    { id: 'dasha', label: DOSH_CATEGORY_LABELS.dasha.label, icon: DOSH_CATEGORY_LABELS.dasha.icon },
    { id: 'yoga', label: DOSH_CATEGORY_LABELS.yoga.label, icon: DOSH_CATEGORY_LABELS.yoga.icon },
    { id: 'nakshatra', label: DOSH_CATEGORY_LABELS.nakshatra.label, icon: DOSH_CATEGORY_LABELS.nakshatra.icon }
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOSH_ENCYCLOPEDIA.filter(d => {
      const matchesCategory = activeCategory === 'all' || d.category === activeCategory;
      const matchesQuery = !q ||
        d.nameEn.toLowerCase().includes(q) ||
        d.nameHi.includes(query.trim()) ||
        d.shortSummary.toLowerCase().includes(q) ||
        d.detailedSummary.toLowerCase().includes(q) ||
        d.keywordTags.some(t => t.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  const handleOpenDosh = (dosh: DoshEntry) => {
    setSelectedDosh(dosh);
    analytics.trackEvent('dosh_view', {
      dosh_id: dosh.id,
      dosh_name: dosh.nameEn,
      category: dosh.category
    });
  };

  const handleConsult = (dosh: DoshEntry) => {
    analytics.trackFreeToolToConsult({
      tool: `dosh_${dosh.id}`
    });
    onConsultDosh(      dosh.nameEn,
      `Namaste Pandit Ji, meri kundli me ${dosh.nameEn} (${dosh.nameHi}) ka prabhav hai. Kya iski sthiti bani hui hai, aur iske shanti ke liye kaunsa upay sabse prabhavi rahega?`
    );
    setSelectedDosh(null);
  };

  const totalSearchVolume = DOSH_ENCYCLOPEDIA.reduce((sum, d) => sum + d.searchVolumeEstimate, 0);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 w-full overflow-hidden">

      {/* SEO Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
          Vedic Dosh Encyclopedia
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2">
          Grah Dosh, Yoga &amp; Shanti Upay
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          Authentic classical references on Manglik, Kaal Sarp, Sade Sati, Pitra Dosh and 8 more afflictions —
          with complete causes, symptoms and Vedic remedies sourced from Brihat Parashara, Phaladeepika and Lal Kitab.
        </p>
        <div className="inline-flex items-center gap-2 mt-3 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-bold text-slate-700">
            {DOSH_ENCYCLOPEDIA.length} declassified dosh • {(totalSearchVolume / 1000).toFixed(0)}k+ monthly searches covered
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs">
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim()) {
                analytics.trackSearch({ query: e.target.value, results_count: filtered.length, source: 'dosh_encyclopedia' });
              }
            }}
            placeholder="Search a dosh — e.g. Manglik, Kaal Sarp, Sade Sati, Pitra..."
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-amber-300'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dosh Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(dosh => {
            const catMeta = DOSH_CATEGORY_LABELS[dosh.category];
            return (
              <button
                key={dosh.id}
                onClick={() => handleOpenDosh(dosh)}
                className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-amber-300 hover:shadow-[0_8px_24px_rgba(245,158,11,0.08)] transition-all group cursor-pointer flex flex-col"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>{catMeta.icon}</span>
                    {catMeta.label}
                  </span>
                  {dosh.urgency === 'high' && (
                    <span className="text-[9px] font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5" />
                      HIGH IMPACT
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition leading-tight">
                  {dosh.nameEn}
                </h3>
                <p className="text-xs font-bold text-amber-700 mb-2">{dosh.nameHi}</p>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3 flex-1">
                  {dosh.shortSummary}
                </p>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {dosh.remedies.length} remedies
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                    Read more <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Dosh Matches "{query}"</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching Manglik, Kaal Sarp, Sade Sati, Pitra Dosh, Angarak or Guru Chandal.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <button
              onClick={() => { setQuery(''); setActiveCategory('all'); }}
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              Clear Search
            </button>
            <button
              onClick={onOpenKundli}
              className="btn-astrotalk px-4 py-2 text-xs font-bold cursor-pointer"
            >
              Check in My Kundli
            </button>
          </div>
        </div>
      )}

      {/* Dosh Detail Modal */}
      {selectedDosh && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-2xl shadow-2xl border border-amber-200/60 overflow-hidden relative flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slide-up">

            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white px-4 pt-3 pb-4 sm:p-5 flex items-start justify-between gap-3 flex-shrink-0">
              <div className="flex-1 min-w-0">
                {/* Mobile drag handle */}
                <div className="w-12 h-1.5 bg-white/40 rounded-full mx-auto mb-2.5 sm:hidden" />
                <span className="text-[10px] font-bold text-amber-100 uppercase tracking-wider">
                  {DOSH_CATEGORY_LABELS[selectedDosh.category].label}
                </span>
                <h3 className="text-lg sm:text-2xl font-black leading-tight mt-0.5">{selectedDosh.nameEn}</h3>
                <p className="text-sm font-bold text-amber-100">{selectedDosh.nameHi}</p>
              </div>
              <button
                onClick={() => setSelectedDosh(null)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center flex-shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

              {/* Detailed Summary */}
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  Classical Definition
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedDosh.detailedSummary}
                </p>
              </div>

              {/* Causes */}
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  What Causes It
                </h4>
                <ul className="space-y-1.5">
                  {selectedDosh.causes.map((cause, i) => (
                    <li key={i} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Symptoms */}
              <div className="bg-red-50/60 border border-red-100 rounded-xl p-4">
                <h4 className="text-sm font-extrabold text-red-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Common Symptoms
                </h4>
                <ul className="space-y-1.5">
                  {selectedDosh.symptoms.map((symptom, i) => (
                    <li key={i} className="text-xs text-red-950 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Remedies */}
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Vedic Remedies &amp; Shanti Upay ({selectedDosh.remedies.length})
                </h4>
                <div className="space-y-2">
                  {selectedDosh.remedies.map((remedy, i) => (
                    <div key={i} className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
                      <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {remedy.type}
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed mt-1.5">{remedy.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Planetary Association */}
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-2">Governing Planets</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDosh.relatedPlanets.map(p => (
                    <span key={p} className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Proof */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-bold text-slate-900">{selectedDosh.consultVolumeLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold text-slate-900">97%</span>
                    <span>found remedies effective</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer CTAs */}
            <div className="px-4 py-3 sm:px-6 bg-white border-t border-slate-100 pb-safe flex-shrink-0 shadow-lg space-y-2">
              <button
                onClick={() => handleConsult(selectedDosh)}
                className="btn-astrotalk w-full py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99] min-h-[48px]"
              >
                <MessageSquare className="w-4 h-4 text-amber-200" />
                <span>⚡ Get a Personal {selectedDosh.nameEn} Analysis (1st Min Free)</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const text = `🕉️ *${selectedDosh.nameEn} (${selectedDosh.nameHi}) — AstraVani Encyclopedia*\n\n${selectedDosh.shortSummary}\n\n✨ Visit for remedies: https://astravani.in`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  WhatsApp Share
                </button>
                <button
                  onClick={() => { setSelectedDosh(null); onOpenKundli(); }}
                  className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Check My Kundli
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
