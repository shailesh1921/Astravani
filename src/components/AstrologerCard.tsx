import React, { useState, useEffect } from 'react';
import { Astrologer } from '../types/astrotalk';
import { Star, ShieldCheck, MessageSquare, PhoneCall, Award, Globe, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { playPanditVoiceSample, stopPanditVoice } from '../utils/panditVoiceBlessing';

interface AstrologerCardProps {
  astrologer: Astrologer;
  onInitiateChat: (astrologer: Astrologer) => void;
  onInitiateCall: (astrologer: Astrologer) => void;
}

export const AstrologerCard: React.FC<AstrologerCardProps> = ({
  astrologer,
  onInitiateChat,
  onInitiateCall
}) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  useEffect(() => {
    return () => {
      stopPanditVoice();
    };
  }, []);

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

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(245,158,11,0.08)] hover:border-amber-300 transition-all duration-300 flex flex-col justify-between relative group w-full max-w-full overflow-hidden">
      
      {/* Top Bar: LIVE Status & Golden Verified Badge */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-1.5">
          {astrologer.isOnline ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE NOW</span>
            </div>
          ) : (
            <div className="text-[10.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Available Soon
            </div>
          )}
        </div>

        {/* Golden Verified Acharya Seal */}
        <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-900 bg-gradient-to-r from-amber-50 to-amber-100/80 border border-amber-300/80 px-2.5 py-0.5 rounded-full shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>Verified Acharya</span>
        </div>
      </div>

      {/* Main Body: Portrait + Details */}
      <div className="flex gap-4 items-start mb-3 w-full">
        
        {/* Astrologer Portrait with Subtle Halo Glow */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-amber-300/80 shadow-sm bg-amber-50/50 flex-shrink-0">
            <img
              src={astrologer.avatarUrl}
              alt={astrologer.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Authentic Star Rating Badge */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-white border border-amber-300 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10 whitespace-nowrap">
            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span className="text-[11px] font-black text-slate-900">{astrologer.rating}</span>
          </div>
        </div>

        {/* Text Details & Specialization */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate group-hover:text-amber-600 transition">
              {astrologer.name}
            </h3>
          </div>

          <p className="text-xs text-slate-600 font-medium truncate mb-2">
            {astrologer.title}
          </p>

          {/* Clean Specialization Pills */}
          <div className="flex flex-wrap gap-1 mb-2">
            {astrologer.specialties.slice(0, 2).map((spec) => (
              <span
                key={spec}
                className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md"
              >
                {spec}
              </span>
            ))}
          </div>

          {/* Experience & Consultations Count */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              {astrologer.experienceYears} Yrs Exp.
            </span>
            <span>•</span>
            <span className="text-slate-500">
              {(astrologer.ordersCount / 1000).toFixed(1)}k+ talks
            </span>
          </div>

          {/* Voice Blessing Preview */}
          <div className="mt-2.5">
            <button
              onClick={handleToggleVoice}
              className={`text-[10.5px] font-extrabold px-2.5 py-1 rounded-full border transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                isPlayingVoice
                  ? 'bg-amber-100 border-amber-400 text-amber-900 animate-pulse'
                  : 'bg-stone-50 hover:bg-amber-50 border-slate-200 hover:border-amber-300 text-slate-700'
              }`}
              title="Listen to Pandit Ji's authentic voice blessing"
            >
              {isPlayingVoice ? (
                <>
                  <VolumeX className="w-3 h-3 text-amber-700" />
                  <span>Blessing Playing...</span>
                  <span className="flex items-end gap-0.5 h-3 ml-0.5">
                    <span className="w-1 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1 h-3 bg-amber-600 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-amber-600" />
                  <span>Listen Voice 🔊</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Verified User Review Quote Snippet */}
      {astrologer.reviews && astrologer.reviews.length > 0 && (
        <div className="my-2.5 px-3 py-1.5 bg-slate-50/80 rounded-xl border border-slate-200/60 text-[11px] text-slate-600 flex items-start gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-1 italic text-[10.5px]">
            "{astrologer.reviews[0].comment}" — <span className="font-bold text-slate-800 not-italic">{astrologer.reviews[0].userName}</span>
          </p>
        </div>
      )}

      {/* Pricing & High-Converting CTAs */}
      <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between gap-3 mt-1">
        
        {/* Pricing with 1st Min FREE Highlight */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black text-slate-900">
              ₹{astrologer.pricePerMin}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">/min</span>
            <span className="text-[11px] text-slate-400 line-through">
              ₹{astrologer.originalPrice}
            </span>
          </div>
          <div className="mt-0.5">
            <span className="text-[10px] font-black text-amber-950 bg-amber-300/90 border border-amber-400/80 px-2 py-0.5 rounded-full shadow-2xs inline-flex items-center gap-1">
              FREE (1st Min) ⚡
            </span>
          </div>
        </div>

        {/* High-Contrast Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onInitiateCall(astrologer)}
            className="px-3 py-2 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] active:scale-95 flex-shrink-0 shadow-2xs"
            title="Start Audio Consultation"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xs:inline">Voice</span> Call
          </button>

          <button
            onClick={() => onInitiateChat(astrologer)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] active:scale-95 shadow-sm shadow-amber-500/25 flex-shrink-0"
            title="Start 1-Tap Live Chat Consultation"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Start Chat</span>
          </button>
        </div>

      </div>

    </div>
  );
};
