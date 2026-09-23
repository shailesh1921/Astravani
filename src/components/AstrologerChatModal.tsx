import React, { useState, useEffect, useRef } from 'react';
import { Astrologer, ConsultationIntake, ChatMessage, ApiConfig } from '../types/astrotalk';
import { generateAstrologerResponses } from '../utils/astrotalkAiEngine';
import { calculateKundli } from '../utils/kundliEngine';
import { NorthIndianKundliChart } from './NorthIndianKundliChart';
import { 
  Send, PhoneOff, ShieldCheck, Clock, Wallet, Star, Sparkles, 
  Check, CheckCheck, ScrollText, Volume2, VolumeX, X, Paperclip, Mic,
  Share2, Printer, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AstrologerChatModalProps {
  astrologer: Astrologer;
  intake: ConsultationIntake;
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onDeductWallet: (amount: number) => void;
  onOpenRecharge: () => void;
  apiConfig: ApiConfig;
}

export const AstrologerChatModal: React.FC<AstrologerChatModalProps> = ({
  astrologer,
  intake,
  isOpen,
  onClose,
  walletBalance,
  onDeductWallet,
  onOpenRecharge,
  apiConfig
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [rating, setRating] = useState(5);
  const [totalCharged, setTotalCharged] = useState(0);
  const [showKundliDrawer, setShowKundliDrawer] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Pre-calculate user's Kundli for in-chat live chart drawer
  const userKundli = calculateKundli(
    intake.name,
    intake.gender,
    intake.dob,
    intake.tob || '12:00',
    intake.pob
  );

  // Play audio chime when message arrives
  const playChime = () => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.22);
    } catch (e) {
      // AudioContext muted/unsupported
    }
  };

  // Deliver sequential replies with realistic human typing cadence
  // (Not too fast, not too slow — ~2.2 to 3.5 seconds per line so user has time to read and never doubts)
  const deliverSequentialReplies = async (replies: string[]) => {
    for (let i = 0; i < replies.length; i++) {
      setIsTyping(true);
      
      // Believable typing duration based on character count (approx 2000ms - 3200ms)
      const typingDuration = Math.min(3400, Math.max(2200, replies[i].length * 45));
      await new Promise((r) => setTimeout(r, typingDuration));

      const newMsg: ChatMessage = {
        id: `astrologer-${Date.now()}-${i}`,
        sender: 'astrologer',
        text: replies[i],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, newMsg]);
      playChime();

      // Brief human pause between consecutive messages (1000ms - 1500ms)
      if (i < replies.length - 1) {
        setIsTyping(false);
        await new Promise((r) => setTimeout(r, 1100 + Math.random() * 400));
      }
    }
    setIsTyping(false);
  };

  // Initialize consultation chat session
  useEffect(() => {
    if (isOpen) {
      setSecondsElapsed(0);
      setIsSessionEnded(false);
      setTotalCharged(0);

      // Initial user question if provided in intake form
      const initialUserMsg: ChatMessage[] = intake.question && intake.question.trim().length > 2 ? [
        {
          id: 'user-first',
          sender: 'user',
          text: intake.question,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent'
        }
      ] : [];

      setMessages(initialUserMsg);

      // Human-like opening sequence (mirroring authentic Astrotalk live conversation)
      const firstName = intake.name.split(' ')[0] || intake.name;
      const openingLines = [
        `Main aapki kundli dekh raha hoon ${firstName} ji...`,
        `Apki lagan mai rashi dekhe to ${userKundli.lagnaSign.split(' ')[0]} hai`,
        `${userKundli.mahadasha.split(' ')[0]} ki dasha chal rahi hai abhi`,
        `Aapki life me samriddhi aur safalta ka shubh yog dikh raha hai`,
        `Bataiye ${firstName} ji, aap apne career, vivah ya kisi vishisht vishay par kya poochna chahte hain?`
      ];

      // Realistic 1.5s delay before pandit starts typing opening greeting
      const initTimer = setTimeout(() => {
        deliverSequentialReplies(openingLines);
      }, 1500);

      return () => clearTimeout(initTimer);
    }
  }, [isOpen]);

  // Session Timer and Per-Minute Wallet Deduction
  useEffect(() => {
    if (!isOpen || isSessionEnded) return;

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        // First 60 seconds (1 minute) is FREE promotional period!
        if (next > 60 && next % 60 === 0) {
          if (walletBalance >= astrologer.pricePerMin) {
            onDeductWallet(astrologer.pricePerMin);
            setTotalCharged((c) => c + astrologer.pricePerMin);
          } else {
            // Low balance notice
            setMessages((m) => [
              ...m,
              {
                id: `system-low-${Date.now()}`,
                sender: 'system',
                text: `⚠️ Your wallet balance is low (₹${walletBalance}). Please recharge to continue the session.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isSessionEnded, walletBalance, astrologer.pricePerMin]);

  // Auto scroll to bottom smoothly
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isTyping) return;

    const msgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: msgId,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent' // single checkmark first
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');

    // Step 1: Realistic "Message Seen" delay (1.2s -> turns to double blue tick)
    await new Promise((r) => setTimeout(r, 1200));
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, status: 'delivered' } : m))
    );

    // Step 2: Realistic "Pandit reading & reflecting" pause before typing starts (1.0s - 1.5s)
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 400));

    try {
      const replyLines = await generateAstrologerResponses(
        textToSend,
        astrologer,
        intake,
        [...messages, userMsg],
        apiConfig
      );

      // Step 3: Deliver messages one by one with WhatsApp typing animation & human pacing
      await deliverSequentialReplies(replyLines);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  const handleEndChat = () => {
    setIsSessionEnded(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Outer Shell: Astrotalk Container */}
      <div className="bg-white w-full sm:max-w-4xl h-full sm:h-[92vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300 relative">
        
        {/* TOP SIGNATURE ASTROTALK YELLOW BAR */}
        <div className="bg-[#FCD34D] border-b border-amber-300 px-4 py-3 flex items-center justify-between shadow-xs select-none flex-shrink-0">
          
          {/* Left: Astrotalk Icon + Info */}
          <div className="flex items-center gap-3">
            {/* Iconic Yellow Astrology Yantra Circle */}
            <div className="w-10 h-10 rounded-full bg-amber-400 border border-amber-600/30 flex items-center justify-center text-slate-950 shadow-inner flex-shrink-0">
              <span className="text-xl font-black">ॐ</span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-slate-950 tracking-tight">
                  {astrologer.name}
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-700 fill-emerald-100" />
              </div>

              {/* Status & WhatsApp-style typing indicator in header */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                {isTyping ? (
                  <span className="text-emerald-900 font-bold italic flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    typing...
                  </span>
                ) : (
                  <>
                    <span>
                      Duration: <strong className="font-mono text-slate-950">{formatTimer(secondsElapsed)} mins</strong>
                    </span>
                    <span>•</span>
                    <span className={isSessionEnded ? "text-red-700 font-bold" : "text-emerald-800 font-bold"}>
                      {isSessionEnded ? "Chat has ended." : "Chat is live"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Controls: Kundli Drawer, Sound, Wallet, End */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* In-Chat Kundli Snapshot Drawer Toggle */}
            <button
              onClick={() => setShowKundliDrawer(!showKundliDrawer)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/80 hover:bg-white text-slate-900 border border-amber-400/80 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Toggle Live Janam Kundli Drawer"
            >
              <ScrollText className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">View Kundli</span>
            </button>

            {/* Mute/Unmute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-slate-800 transition cursor-pointer"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-slate-800" />}
            </button>

            {/* Wallet Balance Pill */}
            <div 
              onClick={onOpenRecharge}
              className="hidden xs:flex items-center gap-1 bg-white/90 border border-amber-400 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 cursor-pointer hover:bg-white transition"
              title="Click to recharge wallet"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-600" />
              <span>₹{walletBalance}</span>
            </div>

            {/* End Chat Button */}
            {!isSessionEnded && (
              <button
                onClick={handleEndChat}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">End Chat</span>
              </button>
            )}

            {/* Close Modal button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-black/10 text-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

        </div>

        {/* Free Promo Banner */}
        {secondsElapsed < 60 && !isSessionEnded && (
          <div className="bg-amber-100 text-amber-950 px-4 py-1 text-center text-xs font-bold flex items-center justify-center gap-2 border-b border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>⚡ First 1 Minute is 100% FREE! Free time remaining: {60 - secondsElapsed}s</span>
          </div>
        )}

        {/* Low Balance Alert Banner */}
        {secondsElapsed >= 60 && walletBalance < astrologer.pricePerMin && !isSessionEnded && (
          <div className="bg-red-50 text-red-900 px-4 py-1.5 text-center text-xs font-bold flex items-center justify-between gap-2 border-b border-red-200 animate-in fade-in">
            <span className="flex items-center gap-1.5 text-left text-[11px] sm:text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>Low Balance: ₹{walletBalance} left (Less than 1 min). Please recharge to keep chat live.</span>
            </span>
            <button
              onClick={onOpenRecharge}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition shadow-xs cursor-pointer flex-shrink-0"
            >
              Recharge Now ⚡
            </button>
          </div>
        )}

        {/* MAIN BODY: Chat Canvas + Unique Kundli Slide Drawer */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* CHAT MESSAGES CANVAS with authentic astrological wallpaper */}
          <div 
            ref={chatContainerRef}
            className="flex-1 astrotalk-chat-bg overflow-y-auto p-4 sm:p-6 space-y-2.5 flex flex-col relative"
          >
            {/* System Info Banner */}
            <div className="flex justify-center my-1">
              <div className="bg-white/80 backdrop-blur-xs border border-amber-200 shadow-xs text-slate-700 text-[11px] px-3.5 py-1 rounded-full text-center font-medium">
                🔒 100% Private Consultation with {astrologer.name} • Birth Data Synced
              </div>
            </div>

            {/* Message Stream */}
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs px-3 py-1.5 rounded-xl max-w-md text-center font-medium shadow-xs">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2 animate-in fade-in duration-200`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] px-3.5 py-2 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'astrotalk-user-bubble'
                        : 'astrotalk-pandit-bubble'
                    }`}
                  >
                    <p className="text-slate-900">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 font-mono">
                      <span>{msg.timestamp}</span>
                      {isUser && (
                        msg.status === 'delivered' ? (
                          <span title="Delivered and read"><CheckCheck className="w-3.5 h-3.5 text-blue-500 inline" /></span>
                        ) : (
                          <span title="Sent"><Check className="w-3.5 h-3.5 text-slate-400 inline" /></span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* WHATSAPP-STYLE REALISTIC TYPING INDICATOR BUBBLE */}
            {isTyping && (
              <div className="flex items-center gap-2 animate-in fade-in duration-200">
                <div className="astrotalk-pandit-bubble px-4 py-2.5 flex items-center gap-3 shadow-xs">
                  {/* WhatsApp Bouncing 3-Dots */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:200ms]" />
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:400ms]" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium italic">
                    {astrologer.name.split(' ')[0]} is typing...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* UNIQUE IN-CHAT KUNDLI SLIDE DRAWER */}
          {showKundliDrawer && (
            <div className="w-72 sm:w-80 bg-white border-l border-slate-200 shadow-xl p-4 overflow-y-auto flex flex-col gap-4 animate-in slide-in-from-right duration-200 z-10">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <ScrollText className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-slate-900">Live Kundli Snapshot</h4>
                </div>
                <button
                  onClick={() => setShowKundliDrawer(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Birth Details */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 text-xs space-y-1">
                <p className="font-bold text-slate-900">{intake.name}</p>
                <p className="text-[11px] text-slate-600">{intake.dob} at {intake.tob || '12:00'}</p>
                <p className="text-[11px] text-slate-600 truncate">{intake.pob}</p>
              </div>

              {/* 4 Pillars */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <span className="text-[10px] text-slate-500 block">Lagna (लग्न)</span>
                  <span className="font-extrabold text-slate-900">{userKundli.lagnaSign.split(' ')[0]}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <span className="text-[10px] text-slate-500 block">Rashi (राशि)</span>
                  <span className="font-extrabold text-slate-900">{userKundli.chandraRashi.split(' ')[0]}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <span className="text-[10px] text-slate-500 block">Nakshatra</span>
                  <span className="font-extrabold text-slate-900">{userKundli.nakshatra.split(' ')[0]}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <span className="text-[10px] text-slate-500 block">Mahadasha</span>
                  <span className="font-extrabold text-amber-700">{userKundli.mahadasha.split(' ')[0]}</span>
                </div>
              </div>

              {/* Authentic North Indian Lagna Chart */}
              <div className="w-full">
                <NorthIndianKundliChart kundli={userKundli} />
              </div>

              {/* Gemstone Recommendation */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-slate-700">
                <span className="font-bold text-emerald-900 block">Auspicious Gemstone:</span>
                <span>{userKundli.luckyGemstone}</span>
              </div>

            </div>
          )}

        </div>

        {/* SIGNATURE ASTROTALK FLOATING CONTINUATION CARD */}
        <div className="bg-white/95 backdrop-blur-xs border-t border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 shadow-md flex-shrink-0">
          
          <div className="flex items-center gap-3">
            <img
              src={astrologer.avatarUrl}
              alt={astrologer.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-xs flex-shrink-0"
            />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                Hi <span className="font-bold capitalize">{intake.name.split(' ')[0]}</span>, lets continue this chat at price of ₹ {astrologer.pricePerMin}.0/min
              </p>
              <p className="text-[10px] text-slate-500">
                100% Private & Confidential • Verified Pandit
              </p>
            </div>
          </div>

          <button
            onClick={onOpenRecharge}
            className="bg-[#FCD34D] hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer flex-shrink-0"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Recharge / Continue</span>
          </button>

        </div>

        {/* QUICK QUESTION CHIPS */}
        {!isSessionEnded && (
          <div className="bg-[#EFE8DE] border-t border-slate-300/60 px-3 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
            {[
              'Ek baat bataiye meri shadi kab hogi?',
              'Career me promotion kab milega?',
              'Mere liye shubh ratna kaunsa hai?',
              'Kya meri kundli me manglik dosha hai?',
              'Vyavsay me safalta kab milegi?'
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                disabled={isTyping}
                className="flex-shrink-0 text-[11px] font-semibold bg-white hover:bg-amber-50 text-slate-800 border border-slate-300 px-3 py-1 rounded-full transition disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* BOTTOM INPUT BAR */}
        {!isSessionEnded ? (
          <div className="bg-[#F0F2F5] px-3 py-2 sm:px-4 sm:py-3 border-t border-slate-300 flex items-center gap-2 flex-shrink-0">
            
            <button 
              type="button" 
              onClick={() => setShowKundliDrawer(!showKundliDrawer)}
              className="text-slate-500 hover:text-amber-600 transition p-1"
              title="Attach birth chart notes"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Type your query to ${astrologer.name.split(' ')[0]}...`}
              disabled={isTyping}
              className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-amber-500 text-slate-900 placeholder-slate-400"
            />

            <button 
              type="button" 
              className="text-slate-400 hover:text-slate-600 transition p-1 hidden sm:block"
              title="Voice recording (simulated)"
            >
              <Mic className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition disabled:opacity-40 cursor-pointer shadow-sm flex-shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>

          </div>
        ) : (
          /* CONSULTATION SUMMARY / END REPORT CARD */
          <div className="p-6 bg-white border-t border-slate-200 text-center space-y-3 animate-in fade-in flex-shrink-0">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Consultation with {astrologer.name} Completed!
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Duration: <span className="font-bold text-slate-900">{formatTimer(secondsElapsed)} mins</span> • Total Billed: <span className="font-bold text-emerald-600">₹{totalCharged}</span>
            </p>

            {/* 5-Star Rating Picker */}
            <div className="flex justify-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="cursor-pointer transition hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Action Buttons: WhatsApp Share, Print Slip, Return */}
            <div className="pt-2 flex flex-wrap justify-center gap-2.5">
              <button
                onClick={() => {
                  const summaryText = `*AstraVani Consultation Summary*\nAstrologer: ${astrologer.name}\nClient: ${intake.name}\nLagna: ${userKundli.lagnaSign}\nRashi: ${userKundli.chandraRashi}\nLucky Gemstone: ${userKundli.luckyGemstone}\nDuration: ${formatTimer(secondsElapsed)} mins\nConsult online at https://astravani.in`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText)}`, '_blank');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share on WhatsApp</span>
              </button>

              <button
                onClick={() => window.print()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-300 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certified Slip</span>
              </button>

              <button
                onClick={onClose}
                className="btn-astrotalk px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
