import React, { useState, useEffect, useMemo } from 'react';
import { Astrologer, ConsultationIntake, SavedKundli } from '../types/astrotalk';
import { calculateKundli } from '../utils/kundliEngine';
import { cloudAuth } from '../services/cloudAuthService';
import { 
  X, Calendar, Clock, MapPin, Sparkles, User, ShieldCheck, 
  HelpCircle, Compass, CheckCircle2, ChevronRight, BookmarkCheck,
  Search, Star, Award, Users
} from 'lucide-react';

interface KundliIntakeModalProps {
  astrologer: Astrologer;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (intake: ConsultationIntake) => void;
  isCallMode?: boolean;
}

const POPULAR_CITIES = [
  'New Delhi, India',
  'Mumbai, Maharashtra',
  'Bengaluru, Karnataka',
  'Lucknow, Uttar Pradesh',
  'Jaipur, Rajasthan',
  'Kolkata, West Bengal',
  'Pune, Maharashtra',
  'Ahmedabad, Gujarat',
  'Hyderabad, Telangana',
  'Chennai, Tamil Nadu',
  'Varanasi, Uttar Pradesh',
  'Patna, Bihar'
];

const TOPIC_PRESETS: Record<string, { label: string; questions: string[] }> = {
  'Career & Job': {
    label: 'Career, Job & Promotion Timing',
    questions: [
      'Mera career kab grow karega aur promotion kab milega?',
      'Government job ke yog hain ya private corporate better hai?',
      'Kya mujhe job switch karni chahiye ya business try karun?',
      'Videsh (Foreign) me job ya settlement ke yog kab hain?'
    ]
  },
  'Marriage & Kundli': {
    label: 'Marriage Timing & Kundli Milan',
    questions: [
      'Meri shaadi kab tak hogi aur jeevansathi kaisa milega?',
      'Love marriage hogi ya arranged marriage ke yog hain?',
      'Kya meri kundli me Manglik dosha ya shaadi me deri ka yog hai?',
      'Shadi ke baad mera vaivahik jeevan kaisa rahega?'
    ]
  },
  'Love & Relationship': {
    label: 'Love & Relationship Healing',
    questions: [
      'Kya humara rishta aage chal kar shaadi tak pahuchega?',
      'Kya mere partner ke sath misunderstanding door hogi?',
      'Mere partner ki sachhi feelings mere prati kya hain?',
      'Rishte me prem aur sthirta ke liye kya upay karun?'
    ]
  },
  'Business & Money': {
    label: 'Business Growth & Wealth Luck',
    questions: [
      'Naye business ya partnership me safalta kab milegi?',
      'Aarthik sthirta (wealth) aur karz mukti ke yog kab hain?',
      'Property ya share market me nivesh karna shubh rahega?',
      'Dhan labh ke liye kaunsa ratna ya puja anukool hai?'
    ]
  },
  'Health & Well-being': {
    label: 'Health & Energy Remedies',
    questions: [
      'Mansik shanti aur health ke liye kaunse grah ko shaant karein?',
      'Purani thakaan aur tanav se mukti kab milegi?',
      'Ghar me sakaratmak urja aur shanti ke liye kya vastu upay karun?'
    ]
  },
  'General': {
    label: 'General Horoscope & Life Path',
    questions: [
      'Aane wala varsh mere liye kaisa rahega?',
      'Meri kundli ka sabse shubh grah aur bhagya ratna kaunsa hai?',
      'Meri kundli ke anusaar mera life path aur destiny kya hai?'
    ]
  }
};

export const KundliIntakeModal: React.FC<KundliIntakeModalProps> = ({
  astrologer,
  isOpen,
  onClose,
  onSubmit,
  isCallMode = false
}) => {
  // Load saved profile or fallback to defaults
  const [formData, setFormData] = useState<ConsultationIntake>(() => {
    try {
      const saved = localStorage.getItem('astravani_user_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return {
      name: '',
      gender: 'Male',
      dob: '1998-05-15',
      tob: '14:30',
      pob: 'New Delhi, India',
      topic: 'Career & Job',
      question: ''
    };
  });

  const [activeProfileTab, setActiveProfileTab] = useState<'myself' | 'partner' | 'family'>('myself');
  const [unknownTime, setUnknownTime] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [savedKundlis, setSavedKundlis] = useState<SavedKundli[]>([]);
  const [selectedKundliId, setSelectedKundliId] = useState<string | null>(null);
  const [saveToAccount, setSaveToAccount] = useState(true);

  // Sync with cloud user saved profiles
  useEffect(() => {
    if (isOpen) {
      const list = cloudAuth.getSavedKundlis();
      setSavedKundlis(list);
      if (list.length > 0 && (!formData.name || formData.name === '')) {
        const primary = list[0];
        setSelectedKundliId(primary.id);
        setFormData(prev => ({
          ...prev,
          name: primary.name,
          gender: primary.gender,
          dob: primary.dob,
          tob: primary.tob,
          pob: primary.pob
        }));
      }
    }
  }, [isOpen]);

  const handleSelectSavedProfile = (kundli: SavedKundli) => {
    setSelectedKundliId(kundli.id);
    setFormData(prev => ({
      ...prev,
      name: kundli.name,
      gender: kundli.gender,
      dob: kundli.dob,
      tob: kundli.tob,
      pob: kundli.pob
    }));
  };

  // Filter city suggestions
  const filteredCities = useMemo(() => {
    if (!formData.pob) return POPULAR_CITIES.slice(0, 6);
    return POPULAR_CITIES.filter(c => 
      c.toLowerCase().includes(formData.pob.toLowerCase())
    );
  }, [formData.pob]);

  // Real-time calculation of Kundli signature for user feedback
  const calculatedChart = useMemo(() => {
    if (!formData.dob) return null;
    try {
      return calculateKundli(
        formData.name || 'Jatak',
        formData.gender,
        formData.dob,
        unknownTime ? '12:00' : (formData.tob || '12:00'),
        formData.pob || 'New Delhi, India'
      );
    } catch {
      return null;
    }
  }, [formData.name, formData.gender, formData.dob, formData.tob, formData.pob, unknownTime]);

  // Handle profile tab change
  const handleProfileTab = (tab: 'myself' | 'partner' | 'family') => {
    setActiveProfileTab(tab);
    try {
      const key = `astravani_profile_${tab}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setFormData(JSON.parse(saved));
      } else if (tab === 'partner') {
        setFormData(prev => ({
          ...prev,
          name: '',
          gender: prev.gender === 'Male' ? 'Female' : 'Male',
          topic: 'Marriage & Kundli',
          question: ''
        }));
      } else if (tab === 'family') {
        setFormData(prev => ({
          ...prev,
          name: '',
          topic: 'General',
          question: ''
        }));
      }
    } catch (e) {
      // ignore
    }
  };

  const handleCitySelect = (city: string) => {
    setFormData(prev => ({ ...prev, pob: city }));
    setShowCityDropdown(false);
  };

  const handleSelectQuestionChip = (q: string) => {
    setFormData(prev => ({ ...prev, question: q }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const finalData = {
      ...formData,
      tob: unknownTime ? '12:00' : formData.tob
    };

    // Auto-save to localStorage for next sessions
    try {
      localStorage.setItem('astravani_user_profile', JSON.stringify(finalData));
      localStorage.setItem(`astravani_profile_${activeProfileTab}`, JSON.stringify(finalData));
    } catch (e) {
      // ignore
    }

    if (saveToAccount && cloudAuth.isAuthenticated()) {
      try {
        const existing = cloudAuth.getSavedKundlis();
        const alreadyExists = existing.some(k => k.name.toLowerCase() === finalData.name.trim().toLowerCase());
        if (!alreadyExists && finalData.name.trim()) {
          cloudAuth.saveKundli({
            name: finalData.name.trim(),
            relation: activeProfileTab === 'partner' ? 'Spouse' : activeProfileTab === 'family' ? 'Other' : 'Self',
            gender: finalData.gender,
            dob: finalData.dob,
            tob: finalData.tob,
            pob: finalData.pob
          });
        }
      } catch (e) {}
    }

    onSubmit(finalData);
  };

  if (!isOpen) return null;

  const currentTopicData = TOPIC_PRESETS[formData.topic] || TOPIC_PRESETS['Career & Job'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-xl shadow-2xl border-t sm:border border-amber-200/60 overflow-hidden relative flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slide-up sm:animate-none">
        
        {/* TOP HEADER: Verified Astrologer Profile Card */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white px-4 pt-3 pb-4 sm:p-5 flex flex-col shadow-sm flex-shrink-0">
          {/* Mobile Bottom-sheet Drag Handle */}
          <div className="w-12 h-1.5 bg-white/40 rounded-full mx-auto mb-2.5 sm:hidden" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={astrologer.avatarUrl}
                  alt={astrologer.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-white/90 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full ring-2 ring-emerald-500/30 animate-pulse" title="Online Now" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base sm:text-lg font-black leading-tight text-white tracking-tight">{astrologer.name}</h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-200 fill-emerald-500/20" />
                </div>
                <p className="text-xs text-amber-100 font-medium flex items-center gap-2 mt-0.5">
                  <span>{isCallMode ? 'Audio Consultation' : 'Live Chat Consultation'}</span>
                  <span>•</span>
                  <span className="font-bold text-white bg-black/20 px-2 py-0.5 rounded-full">₹{astrologer.pricePerMin}/min</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 text-white transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PROMO & TRUST BAR */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-950 font-bold flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            First 1 Minute with {astrologer.name.split(' ')[0]} is 100% FREE!
          </span>
          <span className="bg-emerald-600 text-white text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shadow-2xs">
            Verified Pandit
          </span>
        </div>

        {/* QUICK PROFILE SWITCHER & SAVED FAMILY CHARTS */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 space-y-1.5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>Consultation For:</span>
            </span>
            <div className="flex gap-1.5">
              {[
                { id: 'myself', label: 'Myself' },
                { id: 'partner', label: 'Partner' },
                { id: 'family', label: 'Family / Child' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleProfileTab(tab.id as any)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    activeProfileTab === tab.id
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 1-Tap Saved Family Kundli Auto-Fill Bar */}
          {savedKundlis.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                Saved Charts:
              </span>
              {savedKundlis.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => handleSelectSavedProfile(k)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                    selectedKundliId === k.id
                      ? 'bg-amber-100 text-amber-900 border border-amber-400 shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <span>{k.relation === 'Self' ? '👤' : k.relation === 'Spouse' ? '💍' : '👶'}</span>
                  <span>{k.name} ({k.relation})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Full Name & Gender Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Verma"
                  className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Male', 'Female', 'Other'] as const).map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      formData.gender === g
                        ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date & Time of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date of Birth *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Time of Birth {unknownTime ? '(Surya Lagna Mode)' : '*'}
                </label>
                <button
                  type="button"
                  onClick={() => setUnknownTime(!unknownTime)}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 transition"
                >
                  {unknownTime ? 'Enter Exact Time' : 'Don\'t know time?'}
                </button>
              </div>

              {unknownTime ? (
                <div className="py-2 px-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Vedic Surya Lagna & Noon (12:00 PM) will be used automatically.</span>
                </div>
              ) : (
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="time"
                    value={formData.tob}
                    onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Place of Birth with Popular Quick Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Place of Birth (City, Country) *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.pob}
                onFocus={() => setShowCityDropdown(true)}
                onChange={(e) => {
                  setFormData({ ...formData, pob: e.target.value });
                  setShowCityDropdown(true);
                }}
                placeholder="Type or select city (e.g. New Delhi, Mumbai, Jaipur)..."
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900 font-medium"
              />

              {/* City Autocomplete Suggestions */}
              {showCityDropdown && filteredCities.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  {filteredCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-800 hover:bg-amber-50 hover:text-amber-900 transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        {city}
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular City Pills */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex-shrink-0">Popular:</span>
              {POPULAR_CITIES.slice(0, 5).map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition flex-shrink-0 cursor-pointer ${
                    formData.pob === city
                      ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {city.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Consultation Topic */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Primary Consultation Topic
            </label>
            <select
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value as any })}
              className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-900 font-semibold cursor-pointer"
            >
              <option value="Career & Job">💼 Career, Job & Promotion Timing</option>
              <option value="Marriage & Kundli">💍 Marriage Timing & Kundli Milan</option>
              <option value="Love & Relationship">❤️ Love & Relationship Healing</option>
              <option value="Business & Money">🪙 Business Growth & Wealth Luck</option>
              <option value="Health & Well-being">🌿 Health & Energy Remedies</option>
              <option value="General">✨ General Horoscope & Life Path</option>
            </select>
          </div>

          {/* One-Tap Suggested Question Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Your Specific Question (or choose a one-tap suggestion)
              </label>
              <span className="text-[10px] text-amber-700 font-bold">Tap to autofill</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {currentTopicData.questions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSelectQuestionChip(q)}
                  className={`text-[11px] font-semibold text-left px-2.5 py-1.5 rounded-lg border transition cursor-pointer min-h-[34px] flex items-center ${
                    formData.question === q
                      ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50/70 hover:border-amber-300'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="e.g. When will I switch to a higher paying job? Any remedies for peace?"
              className="w-full p-3 sm:p-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900"
            />
          </div>

          {/* Live Kundli Signature Badge (Visual Proof of Real Astrological Calculations) */}
          {calculatedChart && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-400/30 flex items-center justify-center text-amber-800 font-bold text-sm">
                  🔯
                </span>
                <div>
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
                    Calculated Kundli Signature
                  </span>
                  <p className="text-xs font-bold text-slate-900">
                    Lagna: {calculatedChart.lagnaSign.split(' ')[0]} • Rashi: {calculatedChart.chandraRashi.split(' ')[0]} • Nakshatra: {calculatedChart.nakshatra}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                Ready to Sync
              </span>
            </div>
          )}

          </div>

          {/* Action Button & Security Sticky Footer */}
          <div className="px-4 py-3 sm:px-6 bg-white border-t border-slate-100 pb-safe flex-shrink-0 shadow-lg space-y-2">
            
            {/* Auto-save profile option */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveToAccount}
                onChange={(e) => setSaveToAccount(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span className="text-[11px] font-semibold text-slate-700">
                Save this Kundli profile to my AstraVani account for 1-tap future consultations
              </span>
            </label>

            <button
              type="submit"
              className="btn-astrotalk w-full py-3.5 sm:py-3 text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition transform active:scale-[0.99] min-h-[48px]"
            >
              <span>{isCallMode ? '📞 Connect Call with Astrologer' : '💬 Start Live Chat (FREE 1st Min)'}</span>
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Confidential
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                Vedic Coordinates Synced
              </span>
              <span>•</span>
              <span>⚡ &lt; 15s</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
