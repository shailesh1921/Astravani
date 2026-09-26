import React, { useState, useEffect, useRef } from 'react';
import { Astrologer, ConsultationIntake } from '../types/astrotalk';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageSquare, ShieldCheck, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { sounds } from '../utils/audioEffects';
import { cloudAuth } from '../services/cloudAuthService';

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
  const [hasPaidToContinue, setHasPaidToContinue] = useState(false);
  const [showRechargePopup, setShowRechargePopup] = useState(false);

  const durationTimerRef = useRef<any>(null);
  const billingTimerRef = useRef<any>(null);

  const [audioFailed, setAudioFailed] = useState(false);

  // Trigger speech synthesis for Pandit Ji's voice with iOS/Android safety guards
  const speakAstrologerVoice = (text: string) => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setAudioFailed(true);
        return;
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      // Watchdog timer: If utterance doesn't fire onstart within 3.5s, trigger audio fallback
      const watchdog = setTimeout(() => {
        if (!isSpeaking) {
          setAudioFailed(true);
        }
      }, 3500);

      // Try finding Indian English or Hindi voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('hi') || v.name.includes('India')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => {
        clearTimeout(watchdog);
        setIsSpeaking(true);
        setAudioFailed(false);
      };
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        clearTimeout(watchdog);
        setIsSpeaking(false);
        setAudioFailed(true);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setAudioFailed(true);
    }
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
      setHasPaidToContinue(false);
      setShowRechargePopup(false);
      return;
    }

    setCallDuration(0);
    setHasPaidToContinue(walletBalance >= astrologer.pricePerMin);

    // STRICT ZERO-BALANCE CHECK: If balance is insufficient, pop recharge immediately and do not connect call
    if (walletBalance < astrologer.pricePerMin) {
      setCallState('ringing');
      setShowRechargePopup(true);
      return;
    }

    setShowRechargePopup(false);
    setCallState('ringing');

    // Simulate connecting after 3.2 seconds
    const ringTimeout = setTimeout(() => {
      setCallState('connected');
      sounds.playSuccessChime();

      // Pandit Ji voice greeting
      const openingSpeech = `Pranaam ${intake.name} ji. Main ${astrologer.name} bol raha hoon. Aapke Janam Kundli ki graha sthiti maine khol li hai. Aapne ${intake.topic} ke baare me poochha hai. Surya aur Guru aapke anukool sthaan me hain. Bataiye, kya vishesh jaanna chahte hain?`;
      setSpeechText(openingSpeech);
      speakAstrologerVoice(openingSpeech);

      // Start call duration timer: real-time duration and live deduction
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => {
          if (walletBalance < astrologer.pricePerMin) {
            setShowRechargePopup(true);
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            return prev;
          }

          return prev + 1;
        });
      }, 1000);

      // Deduct wallet every 60 seconds of active consultation
      billingTimerRef.current = setInterval(() => {
        if (walletBalance >= astrologer.pricePerMin) {
          onDeductWallet(astrologer.pricePerMin);
        } else {
          setShowRechargePopup(true);
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
        }
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
  }, [isOpen, walletBalance, astrologer.pricePerMin]);

  // When user recharges wallet and balance becomes sufficient during call, auto-unpause
  useEffect(() => {
    if (walletBalance >= astrologer.pricePerMin && showRechargePopup) {
      setHasPaidToContinue(true);
      setShowRechargePopup(false);
    }
  }, [walletBalance, astrologer.pricePerMin, showRechargePopup]);

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

    if (callDuration > 0) {
      try {
        const cost = Math.max(0, Math.floor(callDuration / 60) * astrologer.pricePerMin);
        cloudAuth.saveConsultation({
          astrologerId: astrologer.id,
          astrologerName: astrologer.name,
          astrologerAvatar: astrologer.avatarUrl,
          astrologerTitle: astrologer.title,
          mode: 'call',
          durationSeconds: callDuration,
          amountDeducted: cost,
          status: 'completed',
          startedAt: new Date(Date.now() - callDuration * 1000).toISOString(),
          endedAt: new Date().toISOString(),
          topic: intake.topic,
          intake,
          messages: [
            {
              id: `call-log-${Date.now()}`,
              sender: 'system',
              text: `Audio consultation with ${astrologer.name}. Duration: ${Math.floor(callDuration / 60)}m ${callDuration % 60}s.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        });
      } catch (e) {
        console.error('Failed to save call consultation:', e);
      }
    }

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

          {/* Audio Fallback & Switch to Chat Helper */}
          {callState === 'connected' && (
            <div className="mt-2.5 flex items-center justify-between bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 text-xs">
              <span className="text-slate-300 text-[11px] flex items-center gap-1.5">
                {audioFailed ? (
                  <span className="text-amber-400 font-semibold">⚠️ Audio muted by phone browser</span>
                ) : (
                  <span>Prefer reading quietly?</span>
                )}
              </span>
              <button
                onClick={() => {
                  handleEndCall();
                  onSwitchToChat();
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Switch to Chat</span>
              </button>
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

        {/* 1-MINUTE FREE TRIAL ENDED RECHARGE POPUP MODAL */}
        {showRechargePopup && callState !== 'ended' && (
          <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border-2 border-amber-400 overflow-hidden animate-in zoom-in-95 duration-200 text-center">
              
              {/* Header Gradient */}
              <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 p-5 text-slate-950 relative">
                <div className="w-14 h-14 rounded-full bg-white/95 border-2 border-amber-600 flex items-center justify-center mx-auto shadow-md mb-2">
                  <span className="text-2xl font-black text-amber-700">ॐ</span>
                </div>
                <span className="bg-red-600 text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider animate-pulse inline-block mb-1 shadow-xs">
                  Free 1-Minute Trial Completed
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-950">
                  Recharge Wallet to Continue Call
                </h3>
                <p className="text-xs text-slate-800 font-semibold mt-0.5">
                  Resume voice consultation with {astrologer.name}
                </p>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-4">
                
                {/* Astrologer Card Snippet */}
                <div className="flex items-center gap-3 bg-amber-50/70 border border-amber-200 rounded-2xl p-3 text-left">
                  <img
                    src={astrologer.avatarUrl}
                    alt={astrologer.name}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-400 shadow-xs flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {astrologer.name}
                      </h4>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{astrologer.title}</p>
                    <p className="text-xs font-extrabold text-amber-700">
                      Call Rate: ₹{astrologer.pricePerMin}/min
                    </p>
                  </div>
                </div>

                {/* Balance & Price Status */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[11px] font-semibold text-slate-500 block">Your Current Balance</span>
                    <span className={`text-base font-black font-mono ${walletBalance >= astrologer.pricePerMin ? 'text-emerald-600' : 'text-red-600'}`}>
                      ₹{walletBalance}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-500 block">Required per min</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      ₹{astrologer.pricePerMin}
                    </span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2.5 pt-1">
                  {walletBalance >= astrologer.pricePerMin ? (
                    <>
                      <button
                        onClick={() => {
                          onDeductWallet(astrologer.pricePerMin);
                          setHasPaidToContinue(true);
                          setShowRechargePopup(false);
                          const resumeSpeech = `Dhanyawaad ${intake.name} ji. Chaliye aapke agle prashna par charcha jaari rakhte hain.`;
                          setSpeechText(resumeSpeech);
                          speakAstrologerVoice(resumeSpeech);
                        }}
                        className="w-full btn-astrotalk py-3.5 px-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer transition active:scale-95"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Continue Call (₹{astrologer.pricePerMin}/min)</span>
                      </button>

                      <button
                        onClick={onOpenRecharge}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Recharge More Balance</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={onOpenRecharge}
                      className="w-full btn-astrotalk py-3.5 px-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer transition active:scale-95"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Recharge Wallet & Continue Call ⚡</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowRechargePopup(false);
                      handleEndCall();
                    }}
                    className="w-full text-slate-500 hover:text-slate-800 text-xs font-semibold py-1.5 transition cursor-pointer"
                  >
                    No thanks, End Call
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100% Secure Audio Channel • Certified Vedic Guru</span>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
