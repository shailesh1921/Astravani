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
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-amber-400 transition-all duration-300 flex flex-col justify-between relative group w-full font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          TOP SECTION: Circular Avatar (72px) + Info + (+ Follow) Button
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3.5 mb-3">
        
        {/* Round Avatar (72px) with pulsating Online Green Dot */}
        <div className="relative flex-shrink-0">
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-amber-300/80 shadow-xs bg-amber-50">
            <img
              src={astrologer.avatarUrl}
              alt={astrologer.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          {/* Green Online Dot */}
          <span className="absolute bottom-0 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white pulsing-online" />
        </div>

        {/* Astrologer Details & + Follow Button */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="text-base font-extrabold text-slate-900 truncate group-hover:text-amber-600 transition">
                  {astrologer.name}
                </h3>
                <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100 flex-shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 truncate font-medium">
                {astrologer.title}
              </p>
            </div>

            {/* "+ Follow" Pill Button (Astroyogi Style) */}
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 cursor-pointer flex-shrink-0 ${
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

          {/* Languages Spoken (Astroyogi Format) */}
          <p className="text-[11px] text-slate-500 truncate mt-1">
            🗣️ {astrologer.languages.join(', ')}
          </p>

          {/* Specialties Pills */}
          <p className="text-[11px] text-amber-900 font-semibold truncate mt-0.5">
            ✨ {astrologer.specialties.slice(0, 3).join(', ')}
          </p>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          MIDDLE: Rating + Experience + Voice Blessing
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-2 border-y border-slate-100 text-xs text-slate-600 mb-3">
        <div className="flex items-center gap-1.5 font-bold">
          <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{astrologer.rating}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal">
            ({(astrologer.ordersCount / 1000).toFixed(1)}k calls)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            {astrologer.experienceYears}+ Yrs Exp
          </span>

          {/* Voice Blessing Preview Audio Button */}
          <button
            onClick={handleToggleVoice}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 cursor-pointer ${
              isPlayingVoice
                ? 'bg-amber-100 border-amber-400 text-amber-900 animate-pulse'
                : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-600'
            }`}
            title="Listen to Pandit Ji's voice"
          >
            {isPlayingVoice ? <VolumeX className="w-3 h-3 text-amber-700" /> : <Volume2 className="w-3 h-3 text-amber-600" />}
            <span>{isPlayingVoice ? 'Playing...' : 'Voice'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM BAR: Pricing + Chat & Call Action Buttons
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 pt-1">
        
        {/* Pricing with 5 Min FREE Green Badge */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black text-slate-900">
              ₹{astrologer.pricePerMin}
            </span>
            <span className="text-[10px] text-slate-400">/min</span>
            <span className="text-[10px] text-slate-400 line-through">
              ₹{astrologer.originalPrice || astrologer.pricePerMin * 2}
            </span>
          </div>
          <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-md border border-emerald-200">
            First Min FREE
          </span>
        </div>

        {/* Action Buttons: Chat & Call */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          
          {/* Chat Button (Astroyogi Style: Soft Amber background) */}
          <button
            onClick={handleInitiateChat}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
            <span>Chat</span>
          </button>

          {/* Call Button (Astroyogi Style: Solid Bright Amber/Yellow CTA) */}
          <button
            onClick={handleInitiateCall}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-900" />
            <span>Call</span>
          </button>

        </div>

      </div>

    </div>
  );
};
