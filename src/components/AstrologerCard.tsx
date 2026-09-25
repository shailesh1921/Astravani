import React, { useState } from 'react';
import { Astrologer } from '../types/astrotalk';
import { Star, ShieldCheck, MessageSquare, PhoneCall, Award, Globe, Volume2, VolumeX } from 'lucide-react';
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
    <div className="at-card p-3.5 sm:p-5 flex flex-col justify-between relative group hover:border-amber-400 w-full max-w-full overflow-hidden">
      
      {/* Top Meta: Verified & Orders */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Verified Astrologer</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          {(astrologer.ordersCount / 1000).toFixed(1)}k orders
        </span>
      </div>

      {/* Main Body: Avatar + Details */}
      <div className="flex gap-3 sm:gap-4 items-start mb-2 w-full overflow-hidden">
        
        {/* Avatar with Status & Rating (Strictly sized for mobile and desktop) */}
        <div className="relative flex-shrink-0 w-20 h-20 sm:w-20 sm:h-20">
          <div className="w-20 h-20 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-200 shadow-xs bg-slate-100 flex-shrink-0">
            <img
              src={astrologer.avatarUrl}
              alt={astrologer.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          
          {/* Online Indicator */}
          {astrologer.isOnline && (
            <span 
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white pulsing-online"
              title="Online Now"
            />
          )}

          {/* Rating Pill */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-amber-300 px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-10 whitespace-nowrap">
            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span className="text-[10px] font-bold text-slate-900">{astrologer.rating}</span>
          </div>
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-amber-600 transition">
            {astrologer.name}
          </h3>
          <p className="text-xs text-slate-600 font-medium truncate mb-1">
            {astrologer.title}
          </p>

          {/* Specialties */}
          <p className="text-[11px] text-slate-500 truncate mb-1">
            <span className="font-semibold text-slate-700">Skills:</span> {astrologer.specialties.join(', ')}
          </p>

          {/* Languages & Experience */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
            <span className="flex items-center gap-0.5">
              <Globe className="w-3 h-3 text-slate-400" />
              {astrologer.languages.slice(0, 2).join(', ')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5 text-amber-700 font-medium">
              <Award className="w-3 h-3 text-amber-500" />
              {astrologer.experienceYears} Yrs Exp.
            </span>
          </div>

          {/* Voice Sample Preview Button */}
          <div className="mt-2">
            <button
              onClick={handleToggleVoice}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                isPlayingVoice
                  ? 'bg-amber-100 border-amber-400 text-amber-900 animate-pulse'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800'
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

      {/* Verified Review Snippet */}
      {astrologer.reviews && astrologer.reviews.length > 0 && (
        <div className="my-2 px-2.5 py-1.5 bg-amber-50/60 rounded-xl border border-amber-200/70 text-[11px] text-stone-600 flex items-start gap-1.5">
          <Star className="w-3 h-3 text-amber-500 fill-amber-400 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-1 italic text-[10.5px]">
            "{astrologer.reviews[0].comment}" — <span className="font-bold text-stone-800 not-italic">{astrologer.reviews[0].userName} ({astrologer.reviews[0].city})</span>
          </p>
        </div>
      )}

      {/* Pricing and Action CTAs */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
        
        {/* Pricing */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-900">
              ₹{astrologer.pricePerMin}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">/min</span>
            <span className="text-[10px] text-slate-400 line-through">
              ₹{astrologer.originalPrice}
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            1st Min FREE ⚡
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onInitiateCall(astrologer)}
            className="px-3.5 py-2 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] active:scale-95"
            title="Start Audio Consultation"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Call</span>
          </button>

          <button
            onClick={() => onInitiateChat(astrologer)}
            className="btn-astrotalk px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] active:scale-95 shadow-xs"
            title="Start Live Chat Consultation"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
        </div>

      </div>

    </div>
  );
};
