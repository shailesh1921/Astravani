import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Astrologer, ConsultationIntake } from '../types/astrotalk';
import { searchIndianCities, POPULAR_CITIES_QUICK } from '../data/indianCities';
import { cloudAuth } from '../services/cloudAuthService';
import { 
  X, Calendar, Clock, MapPin, Sparkles, User, ShieldCheck, 
  Compass, ChevronRight, Lock, CheckCircle2
} from 'lucide-react';

interface KundliIntakeModalProps {
  astrologer: Astrologer;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (intake: ConsultationIntake) => void;
  isCallMode?: boolean;
}

export const KundliIntakeModal: React.FC<KundliIntakeModalProps> = ({
  astrologer,
  isOpen,
  onClose,
  onSubmit,
  isCallMode = false
}) => {
  // Load saved profile or fallback to clean defaults
  const [formData, setFormData] = useState<ConsultationIntake>(() => {
    try {
      const saved = localStorage.getItem('astravani_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.name !== 'AstraVani Seeker') {
          return parsed;
        }
      }
    } catch (e) {}
    return {
      name: '',
      gender: 'Male',
      dob: '1998-05-15',
      tob: '12:00',
      pob: 'New Delhi, Delhi',
      topic: 'Career & Job',
      question: ''
    };
  });

  const [unknownTime, setUnknownTime] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [saveToAccount, setSaveToAccount] = useState(true);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Sync with cloud user saved profiles or name if logged in
  useEffect(() => {
    if (isOpen) {
      const user = cloudAuth.getCurrentUser();
      const list = cloudAuth.getSavedKundlis();
      if (list.length > 0 && (!formData.name || formData.name === '')) {
        const primary = list[0];
        setFormData(prev => ({
          ...prev,
          name: primary.name,
          gender: primary.gender,
          dob: primary.dob,
          tob: primary.tob,
          pob: primary.pob
        }));
        setCitySearch(primary.pob);
      } else if (user && (!formData.name || formData.name === '')) {
        setFormData(prev => ({
          ...prev,
          name: user.fullName || '',
          gender: user.gender || 'Male',
          dob: user.dob || '1998-05-15',
          tob: user.tob || '12:00',
          pob: user.pob || 'New Delhi, Delhi'
        }));
        setCitySearch(user.pob || 'New Delhi, Delhi');
      } else if (formData.pob) {
        setCitySearch(formData.pob);
      }
    }
  }, [isOpen]);

  // Click outside to close city dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter city suggestions using extensive All-India dataset
  const filteredCities = useMemo(() => {
    return searchIndianCities(citySearch, 10);
  }, [citySearch]);

  const handleCitySelect = (city: string) => {
    setFormData(prev => ({ ...prev, pob: city }));
    setCitySearch(city);
    setShowCityDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const finalData: ConsultationIntake = {
      ...formData,
      name: formData.name.trim(),
      tob: unknownTime ? '12:00' : (formData.tob || '12:00'),
      pob: (formData.pob || citySearch || 'New Delhi, Delhi').trim(),
      topic: formData.topic || 'Career & Job',
      question: ''
    };

    // Auto-save to localStorage for subsequent sessions
    try {
      localStorage.setItem('astravani_user_profile', JSON.stringify(finalData));
    } catch (e) {}

    if (saveToAccount && cloudAuth.isAuthenticated()) {
      try {
        const existing = cloudAuth.getSavedKundlis();
        const alreadyExists = existing.some(k => k.name.toLowerCase() === finalData.name.toLowerCase());
        if (!alreadyExists && finalData.name) {
          cloudAuth.saveKundli({
            name: finalData.name,
            relation: 'Self',
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl border border-amber-200/80 overflow-hidden relative flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slide-up sm:animate-none">
        
        {/* TOP HEADER: Verified Astrologer Profile Card */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white px-5 pt-4 pb-4 sm:p-5 flex flex-col shadow-sm flex-shrink-0">
          {/* Mobile Bottom-sheet Drag Handle */}
          <div className="w-12 h-1.5 bg-white/40 rounded-full mx-auto mb-2 sm:hidden" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={astrologer.avatarUrl}
                  alt={astrologer.name}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-white/90 shadow-md"
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
                  <span className="font-extrabold text-white bg-black/25 px-2 py-0.5 rounded-full">1st Min 100% Free ⚡</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 text-white transition cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TRUST BANNER: Why birth details are required */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-950 font-bold flex-shrink-0">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Enter your birth details so {astrologer.name.split(' ')[0]} can calculate your exact Janam Kundli.</span>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
            {/* Full Name */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Your Full Name <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name (e.g. Rahul Sharma)"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900 font-bold transition"
                  autoFocus
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Gender <span className="text-amber-600">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
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
                    {g === 'Male' ? '👨 Male' : g === 'Female' ? '👩 Female' : 'Other'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Date of Birth <span className="text-amber-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900 font-bold transition"
                  />
                </div>
              </div>

              {/* Time of Birth */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-800">
                    Time of Birth
                  </label>
                  <button
                    type="button"
                    onClick={() => setUnknownTime(!unknownTime)}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 transition cursor-pointer"
                  >
                    {unknownTime ? 'Enter Exact Time' : 'Don\'t know time?'}
                  </button>
                </div>

                {unknownTime ? (
                  <div className="py-2.5 px-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Surya Lagna & 12:00 PM will be used</span>
                  </div>
                ) : (
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="time"
                      value={formData.tob}
                      onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900 font-bold transition"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Place of Birth with All-India Dropdown & Autocomplete (Astrotalk Style) */}
            <div ref={cityDropdownRef} className="relative">
              <label className="block text-xs font-black text-slate-800 mb-1">
                Place of Birth (City / District) <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={citySearch}
                  onFocus={() => setShowCityDropdown(true)}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setFormData({ ...formData, pob: e.target.value });
                    setShowCityDropdown(true);
                  }}
                  placeholder="Search city (e.g. Varanasi, Lucknow, Delhi, Patna, Pune)..."
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900 font-bold transition"
                />

                {/* All-India Search Dropdown Menu */}
                {showCityDropdown && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                    <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      All-India Cities & Astrological Hubs ({filteredCities.length} matches)
                    </div>
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-amber-50 hover:text-amber-900 transition flex items-center justify-between border-b border-slate-50 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            <span>{city}</span>
                          </span>
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-slate-500 text-center">
                        No city found for "{citySearch}". You can keep typing custom city name.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick One-Tap Popular Indian Cities */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-black text-slate-400 uppercase flex-shrink-0">Popular:</span>
                {POPULAR_CITIES_QUICK.slice(0, 6).map((city) => {
                  const cityName = city.split(',')[0];
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition flex-shrink-0 cursor-pointer ${
                        formData.pob === city || citySearch === city
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      {cityName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Topic Selection */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Consultation Topic
              </label>
              <select
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value as any })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 text-slate-900 font-bold cursor-pointer"
              >
                <option value="Career & Job">💼 Career, Job & Promotion</option>
                <option value="Marriage & Kundli">💍 Marriage Timing & Kundli Milan</option>
                <option value="Love & Relationship">❤️ Love & Relationship Guidance</option>
                <option value="Business & Money">🪙 Wealth, Business & Finances</option>
                <option value="Health & Well-being">🌿 Health, Family & Mental Peace</option>
                <option value="General">✨ General Kundli Analysis & Remedies</option>
              </select>
            </div>

          </div>

          {/* Sticky Bottom Submit Button */}
          <div className="px-5 py-3.5 bg-white border-t border-slate-100 pb-safe flex-shrink-0 shadow-lg space-y-2">
            <button
              type="submit"
              className="btn-astrotalk w-full py-3.5 text-sm sm:text-base font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition transform active:scale-[0.99] rounded-2xl min-h-[48px]"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>
                {isCallMode
                  ? `⚡ Connect Call with ${astrologer.name.split(' ')[0]} (1st Min Free)`
                  : `⚡ Start Free Chat with ${astrologer.name.split(' ')[0]} (1st Min Free)`}
              </span>
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 pt-0.5">
              <span className="flex items-center gap-1 font-semibold">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                100% Confidential
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                Real Vedic Kundli Calculation
              </span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
