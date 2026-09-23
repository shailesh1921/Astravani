import React, { useState } from 'react';
import { Astrologer, ConsultationIntake } from '../types/astrotalk';
import { X, Calendar, Clock, MapPin, Sparkles, User, ShieldCheck } from 'lucide-react';

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
  const [formData, setFormData] = useState<ConsultationIntake>({
    name: '',
    gender: 'Male',
    dob: '1998-05-15',
    tob: '14:30',
    pob: 'New Delhi, India',
    topic: 'Career & Job',
    question: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={astrologer.avatarUrl}
              alt={astrologer.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-white/80 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold leading-tight">{astrologer.name}</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
              </div>
              <p className="text-xs text-amber-100 font-medium">
                {isCallMode ? 'Audio Consultation Call' : 'Live Chat Consultation'} • ₹{astrologer.pricePerMin}/min
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Offer Sub-Banner */}
        <div className="bg-amber-50 border-b border-amber-200/70 px-4 py-2 flex items-center justify-between text-xs text-amber-900 font-semibold">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            First consultation with {astrologer.name.split(' ')[0]} is FREE (1 Min)!
          </span>
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            Verified Guru
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Gender
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Male', 'Female', 'Other'] as const).map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setFormData({ ...formData, gender: g })}
                  className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                    formData.gender === g
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Time of Birth (Approx)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="time"
                  value={formData.tob}
                  onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Place of Birth */}
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
                onChange={(e) => setFormData({ ...formData, pob: e.target.value })}
                placeholder="e.g. Mumbai, Maharashtra"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Primary Topic */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Primary Consultation Topic
            </label>
            <select
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value as any })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 font-medium"
            >
              <option value="Career & Job">Career, Job & Promotion Timing</option>
              <option value="Marriage & Kundli">Marriage Timing & Kundli Milan</option>
              <option value="Love & Relationship">Love & Relationship Healing</option>
              <option value="Business & Money">Business Growth & Wealth Luck</option>
              <option value="Health & Well-being">Health & Energy Remedies</option>
              <option value="General">General Horoscope & Life Path</option>
            </select>
          </div>

          {/* Initial Question (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Question for {astrologer.name.split(' ')[0]} (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="e.g. When will I switch to a higher paying job? Any remedies for peace?"
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="btn-astrotalk w-full py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>{isCallMode ? '📞 Connect Call with Astrologer' : '💬 Start Live Chat (FREE 1st Min)'}</span>
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              🔒 100% Privacy Protected. Your birth coordinates are securely analyzed.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
};
