import React, { useState, useEffect, useRef } from 'react';
import { Astrologer } from '../types/astrotalk';
import { Star, ShieldCheck, MessageSquare, PhoneCall, Award, Volume2, VolumeX, Plus, Check } from 'lucide-react';
import { playPanditVoiceSample, stopPanditVoice } from '../utils/panditVoiceBlessing';
import { analytics } from '../services/analytics';

interface AstrologerCardProps {
  astrologer: Astrologer;
  onInitiateChat: (astrologer: Astrologer) => void;
  onInitiateCall: (astrologer: Astrologer) => void;
  smartTags?: string[];
}

export const AstrologerCard: React.FC<AstrologerCardProps> = ({
  astrologer,
  onInitiateChat,
  onInitiateCall,
  smartTags = []
}) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    return () => {
      stopPanditVoice();
    };
  }, []);

  // Track astrologer view when card mounts
  useEffect(() => {
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      analytics.trackAstrologerView({
        astrologer_id: astrologer.id,
        astrologer_name: astrologer.name,
        specialization: astrologer.specialties,
      });
    }
  }, [astrologer]);

  const handleToggleVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingVoice) {
      stopPanditVoice();
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      playPanditVoiceSample(astrologer.name, astrologer.voiceBlessingText, () => {
        setIsPlayingVoice(false);
      });
    }
  };

  const handleInitiateChat = () => {
    analytics.trackConsultationStart({
      astrologer_id: astrologer.id,
      mode: 'chat',
      is_free_trial: true,
    });
    onInitiateChat(astrologer);
  };

  const handleInitiateCall = () => {
    analytics.trackConsultationStart({
      astrologer_id: astrologer.id,
      mode: 'call',
      is_free_trial: true,
    });
    onInitiateCall(astrologer);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-amber-400 transition-all duration-300 flex flex-col justify-between relative group w-full max-w-full overflow-hidden font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          TOP SECTION: Circular Avatar + Info + (+ Follow) Button
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 sm:gap-3.5 mb-3">
        
        {/* Round Avatar (60px on small phones, 72px on sm+) with pulsating Online Green Dot */}
        <div className="relative flex-shrink-0">
          <div className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden border-2 border-amber-300/80 shadow-xs bg-amber-50">
            <img
              src={astrologer.avatarUrl}
              alt={astrologer.name}
              width={72}
              height={72}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          {/* Green Online Dot */}
          <span className="absolute bottom-0 right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white pulsing-online" />
        </div>

        {/* Astrologer Details & + Follow Button */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="text-[15px] sm:text-base font-extrabold text-slate-900 truncate group-hover:text-amber-600 transition leading-snug">
                  {astrologer.name}
                </h3>
                <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100 flex-shrink-0" />
              </div>
              <p className="text-xs text-slate-500 truncate font-medium mt-0.5">
                {astrologer.title}
              </p>
            </div>

            {/* "+ Follow" Pill Button (Astroyogi Style) */}
            <button
              type="button"
              onClick={() => setIsFollowing(!isFollowing)}
              className={`text-[11px] font-bold px-2.5 py-1.5 min-h-[34px] rounded-full border transition-all flex items-center gap-1 cursor-pointer flex-shrink-0 ${
                isFollowing
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'bg-white border-slate-300 hover:border-amber-400 text-slate-700 hover:text-amber-600'
              }`}
            >
              {isFollowing ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3 text-slate-500" />
                  <span>Follow</span>
                </>
              )}
            </button>
          </div>

          {/* Languages Spoken */}
          <p className="text-xs text-slate-500 truncate mt-1 leading-relaxed">
            🗣️ {astrologer.languages.join(', ')}
          </p>

          {/* Specialties Pills */}
          <p className="text-xs text-amber-900 font-semibold truncate mt-0.5 leading-relaxed">
            ✨ {astrologer.specialties.slice(0, 3).join(', ')}
          </p>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          MIDDLE: Rating + Experience + Voice Blessing
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-y border-slate-100 text-xs text-slate-600 mb-3">
        <div className="flex items-center gap-1.5 font-bold">
          <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{astrologer.rating}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            ({(astrologer.ordersCount / 1000).toFixed(1)}k)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>{astrologer.experienceYears}+ Yrs</span>
          </span>

          {/* Voice Blessing Preview Audio Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`text-[11px] font-bold px-2.5 py-1 min-h-[32px] rounded-full border transition flex items-center gap-1 cursor-pointer ${
              isPlayingVoice
                ? 'bg-amber-100 border-amber-400 text-amber-900 animate-pulse'
                : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-600'
            }`}
            title="Listen to Pandit Ji's voice"
          >
            {isPlayingVoice ? <VolumeX className="w-3.5 h-3.5 text-amber-700" /> : <Volume2 className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isPlayingVoice ? 'Playing' : 'Voice'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM BAR: Pricing + 44px+ Touch Target Chat & Call Buttons
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 pt-1">
        
        {/* Pricing with 5 Min FREE Green Badge */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-base sm:text-lg font-black text-slate-900">
              ₹{astrologer.pricePerMin}
            </span>
            <span className="text-[11px] text-slate-500">/min</span>
            <span className="text-[11px] text-slate-400 line-through">
              ₹{astrologer.originalPrice || astrologer.pricePerMin * 2}
            </span>
          </div>
          <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-200 mt-0.5">
            First Min FREE
          </span>
        </div>

        {/* Action Buttons: Chat & Call (Minimum 44px height for mobile ergonomics) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* Chat Button */}
          <button
            type="button"
            onClick={handleInitiateChat}
            className="bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-extrabold text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 min-h-[44px] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>Chat</span>
          </button>

          {/* Call Button */}
          <button
            type="button"
            onClick={handleInitiateCall}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 min-h-[44px] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <PhoneCall className="w-4 h-4 text-slate-900 flex-shrink-0" />
            <span>Call</span>
          </button>

        </div>

      </div>

    </div>
  );
};
