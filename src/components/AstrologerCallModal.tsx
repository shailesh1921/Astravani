import React, { useState, useEffect, useRef } from 'react';
import { Astrologer, ConsultationIntake } from '../types/astrotalk';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageSquare, ShieldCheck, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { sounds } from '../utils/audioEffects';

interface AstrologerCallModalProps {
  astrologer: Astrologer;
  intake: ConsultationIntake;
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onDeductWallet: (amount: number) => void;
  onOpenRecharge: () => void;
  onSwitchToChat: () => void;
}

export const AstrologerCallModal: React.FC<AstrologerCallModalProps> = ({
  astrologer,
  intake,
  isOpen,
  onClose,
  walletBalance,
  onDeductWallet,
  onOpenRecharge,
  onSwitchToChat,
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [callDuration, setCallDuration] = useState(0); // seconds
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechText, setSpeechText] = useState('');

  const durationTimerRef = useRef<any>(null);
  const billingTimerRef = useRef<any>(null);

  // Trigger speech synthesis for Pandit Ji's voice
  const speakAstrologerVoice = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    // Try finding Indian English or Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('hi') || v.name.includes('India')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Call lifecycle
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      clearInterval(durationTimerRef.current);
      clearInterval(billingTimerRef.current);
      setCallState('ringing');
      setCallDuration(0);
      return;
    }

    setCallState('ringing');
    setCallDuration(0);

    // Simulate connecting after 3.2 seconds
    const ringTimeout = setTimeout(() => {
      setCallState('connected');
      sounds.playSuccessChime();

      // Pandit Ji voice greeting
      const openingSpeech = `Pranaam ${intake.name} ji. Main ${astrologer.name} bol raha hoon. Aapke Janam Kundli ki graha sthiti maine khol li hai. Aapne ${intake.topic} ke baare me poochha hai. Surya aur Guru aapke anukool sthaan me hain. Bataiye, kya vishesh jaanna chahte hain?`;
      setSpeechText(openingSpeech);
      speakAstrologerVoice(openingSpeech);

      // Start call duration timer
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // Deduct wallet every 60 seconds
      billingTimerRef.current = setInterval(() => {
        onDeductWallet(astrologer.pricePerMin);
      }, 60000);

    }, 3200);

    return () => {
      clearTimeout(ringTimeout);
      clearInterval(durationTimerRef.current);
      clearInterval(billingTimerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  // Low balance auto-end
  useEffect(() => {
    if (callState === 'connected' && walletBalance < astrologer.pricePerMin) {
      sounds.playTick();
    }
  }, [walletBalance, callState]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearInterval(durationTimerRef.current);
    clearInterval(billingTimerRef.current);
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white relative max-h-[92dvh]">
        
        {/* Top Header Bar */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono uppercase tracking-wider text-[11px]">Vedic Call Line</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <span>₹{walletBalance} Balance</span>
          </div>
        </div>

        {/* Center Calling Area */}
        <div className="py-8 px-6 flex flex-col items-center text-center">
          
          {/* Avatar with Animated Pulsing Rings */}
          <div className="relative mb-6">
            {callState === 'ringing' && (
              <>
                <div className="absolute -inset-4 rounded-full border border-amber-500/30 animate-ping"></div>
                <div className="absolute -inset-2 rounded-full border-2 border-amber-500/50 animate-pulse"></div>
              </>
            )}
            
            {callState === 'connected' && isSpeaking && (
              <div className="absolute -inset-3 rounded-full border-2 border-emerald-500/50 animate-pulse"></div>
            )}

            <img
              src={astrologer.avatarUrl}
              alt={astrologer.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-amber-500 shadow-xl relative z-10"
            />

            <span className="absolute bottom-1 right-1 z-20 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] text-white">
              ✓
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white flex items-center gap-1.5">
            <span>{astrologer.name}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </h3>

          <p className="text-xs text-amber-300 font-medium mt-0.5">
            {astrologer.title} • ₹{astrologer.pricePerMin}/min
          </p>

          {/* Status / Duration */}
          <div className="mt-4">
            {callState === 'ringing' && (
              <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span>Calling Pandit Ji...</span>
              </div>
            )}

            {callState === 'connected' && (
              <div className="space-y-1">
                <div className="text-2xl font-mono font-bold text-white tracking-wider flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{formatTime(callDuration)}</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-medium">
                  {isSpeaking ? 'Pandit Ji is speaking...' : 'Call in Progress (Encrypted)'}
                </p>
              </div>
            )}

            {callState === 'ended' && (
              <div className="text-sm font-bold text-red-400">
                Call Ended
              </div>
            )}
          </div>

          {/* Live Transcript / Speech Subtitle */}
          {callState === 'connected' && speechText && (
            <div className="mt-5 p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs text-slate-300 text-left max-h-24 overflow-y-auto leading-relaxed">
              <span className="text-[10px] font-bold text-amber-400 block mb-1">LIVE VOICE TRANSCRIPT:</span>
              "{speechText}"
            </div>
          )}

          {/* Low Balance Warning */}
          {walletBalance < astrologer.pricePerMin * 2 && callState === 'connected' && (
            <div className="mt-4 p-2 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center gap-2 text-[11px] text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Low Balance: Under 2 mins remaining.</span>
              <button 
                onClick={onOpenRecharge}
                className="underline font-bold text-white ml-auto"
              >
                Recharge
              </button>
            </div>
          )}
        </div>

        {/* Audio Frequency Bars (Animated Waveform) */}
        {callState === 'connected' && (
          <div className="flex items-center justify-center gap-1.5 py-3 border-t border-slate-800 bg-slate-950/50">
            {[40, 80, 50, 95, 60, 85, 30, 75, 90, 45, 70, 35].map((height, i) => (
              <div
                key={i}
                style={{
                  height: isSpeaking ? `${height}%` : '20%',
                  maxHeight: '28px',
                  transition: 'height 0.15s ease'
                }}
                className={`w-1 rounded-full ${isSpeaking ? 'bg-amber-400' : 'bg-slate-700'}`}
              ></div>
            ))}
          </div>
        )}

        {/* Bottom Call Controls */}
        <div className="p-6 pb-safe bg-slate-950 border-t border-slate-800 flex items-center justify-around">
          
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${
              isMuted ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition transform hover:scale-105 cursor-pointer"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          {/* Switch to Chat Button */}
          <button
            onClick={() => {
              handleEndCall();
              onSwitchToChat();
            }}
            className="w-12 h-12 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Switch to Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

        </div>

      </div>
    </div>
  );
};
