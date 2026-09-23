import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Key, 
  Minimize2, 
  Maximize2, 
  User,
  ArrowRight
} from 'lucide-react';
import { CalculatedChart, ChatMessage, SupportedLanguage } from '../types/astrology';
import { generateAstraResponse } from '../utils/astraAiEngine';

interface AstraChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  chart: CalculatedChart | null;
  onOpenChartModal: () => void;
  language: SupportedLanguage;
}

const STARTER_PROMPTS = [
  "How does my Moon placement process stress and pressure?",
  "Interpret my upcoming Saturn transit & career structure.",
  "Evaluate compatibility between Scorpio and Pisces.",
  "Vedic analysis: Nakshatra disposition and Dasha timeline."
];

export const AstraChatWidget: React.FC<AstraChatWidgetProps> = ({
  isOpen,
  onClose,
  chart,
  onOpenChartModal,
  language
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'astra',
      text: `Greetings. I am Astra.

I synthesize astronomical ephemeris across Western Hellenistic, Vedic Parashari, and Imperial Chinese BaZi lineages with Jungian archetypal psychology.

My function is to illuminate psychological potential, personal agency, and temporal cycles—free from deterministic superstition or fatalism.

How may I assist your inquiry into the celestial coordinates today?`,
      timestamp: 'Now'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState<'gemini' | 'openai'>('gemini');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const userText = textToSend || input;
    if (!userText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await generateAstraResponse(
        userText,
        chart,
        apiKey,
        apiProvider,
        language
      );

      const astraMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'astra',
        text: response.text,
        structuredReading: response.structured,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, astraMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'astra',
          text: 'Signal interrupted. Please re-submit your inquiry.',
          timestamp: 'Now'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-200 flex flex-col ${
        isExpanded
          ? 'inset-4 sm:inset-10 rounded-none'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[480px] h-[640px] max-h-[85vh] rounded-none'
      } bg-[#FFFFFF] border-2 border-[#0F172A] shadow-2xl`}
    >
      {/* Terminal Header */}
      <div className="px-5 py-4 bg-[#0F172A] text-white flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF552E] flex items-center justify-center font-bold text-white text-xs">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-sm">
                Astra AI Terminal
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#1E293B] text-[#FF552E] font-bold">
                v2.4
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>{chart ? `Synced: ${chart.birthDetails.name}` : 'Awaiting Coordinates'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#94A3B8]">
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Custom API Engine (Optional)"
            className="p-1.5 hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <Key className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Restore window size' : 'Expand window'}
            className="p-1.5 hover:text-white hover:bg-[#1E293B] transition-colors hidden sm:block"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 hover:text-[#FF552E] hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Settings Drawer */}
      {showSettings && (
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-mono space-y-3">
          <div className="flex items-center justify-between text-[#0F172A] font-bold">
            <span>LLM Backend Provider (Optional)</span>
            <span className="text-[10px] text-[#FF552E]">Default: Astra Engine</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setApiProvider('gemini')}
              className={`flex-1 py-1.5 border text-center transition-colors font-bold ${
                apiProvider === 'gemini' ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'border-[#CBD5E1] text-[#475569] bg-white'
              }`}
            >
              Google Gemini
            </button>
            <button
              onClick={() => setApiProvider('openai')}
              className={`flex-1 py-1.5 border text-center transition-colors font-bold ${
                apiProvider === 'openai' ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'border-[#CBD5E1] text-[#475569] bg-white'
              }`}
            >
              OpenAI
            </button>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter ${apiProvider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'} (Stored locally)`}
            className="w-full px-3 py-2 bg-white border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] font-mono text-xs"
          />
        </div>
      )}

      {/* Chart Sync Alert */}
      {!chart && (
        <div className="px-4 py-2 bg-[#F4EFE6] border-b border-[#E5DFD3] flex items-center justify-between text-xs font-mono text-[#0F172A] font-bold">
          <span>Natal coordinates not calibrated yet.</span>
          <button
            onClick={onOpenChartModal}
            className="underline hover:text-[#FF552E] uppercase"
          >
            Enter Coordinates
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-[#F8FAFC]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'astra' && (
              <div className="w-6 h-6 bg-[#0F172A] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">
                A
              </div>
            )}

            <div
              className={`max-w-[88%] p-4 text-xs leading-relaxed space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-[#FF552E] text-white font-medium ml-auto shadow-md'
                  : 'bg-[#FFFFFF] border border-[#CBD5E1] text-[#0F172A] shadow-sm'
              }`}
            >
              {/* Structured 4-Part Reading */}
              {msg.structuredReading ? (
                <div className="space-y-4">
                  
                  {/* Cosmic Signature */}
                  <div className="p-3 bg-[#F1F5F9] border-l-4 border-[#0F172A] font-mono text-xs">
                    <span className="text-[#FF552E] font-bold uppercase tracking-wider block mb-1">
                      I. Cosmic Signature & Dominant Placements
                    </span>
                    <p className="text-[#334155] leading-relaxed">{msg.structuredReading.cosmicSignature}</p>
                  </div>

                  {/* Core Insight */}
                  <div className="space-y-1">
                    <span className="font-bold text-[#0F172A] uppercase tracking-wider text-xs block">
                      II. The Core Insight (Archetypal Analysis)
                    </span>
                    <p className="text-[#475569] leading-relaxed">{msg.structuredReading.coreInsight}</p>
                  </div>

                  {/* Timing & Cycles */}
                  <div className="border-t border-[#E2E8F0] pt-3 space-y-1">
                    <span className="font-bold text-[#FF552E] uppercase tracking-wider text-xs block">
                      III. Temporal Cycles & Transit Pressures
                    </span>
                    <p className="text-[#475569] leading-relaxed">{msg.structuredReading.timingCycles}</p>
                  </div>

                  {/* Practical Micro-Action */}
                  <div className="border-t border-[#E2E8F0] pt-3 p-3 bg-[#F4EFE6] border border-[#E5DFD3]">
                    <span className="font-mono font-bold text-[#0F172A] uppercase tracking-wider text-xs block mb-1">
                      IV. Practical Micro-Action
                    </span>
                    <p className="text-[#334155] leading-relaxed">{msg.structuredReading.practicalMicroAction}</p>
                  </div>

                </div>
              ) : (
                <div className="whitespace-pre-line text-[#0F172A]">{msg.text}</div>
              )}

              <div
                className={`text-[9px] font-mono text-right ${
                  msg.sender === 'user' ? 'text-white/80' : 'text-[#94A3B8]'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-6 h-6 bg-[#0F172A] text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 items-center text-xs font-mono font-bold text-[#FF552E]">
            <span className="animate-spin text-sm">✦</span>
            <span>Calculating ephemeris parameters...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Inquiry Starters */}
      <div className="px-4 py-2 border-t border-[#E2E8F0] bg-[#FFFFFF] flex gap-2 overflow-x-auto no-scrollbar font-mono">
        {STARTER_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-[11px] whitespace-nowrap px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0F172A] font-semibold transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-[#FFFFFF] border-t border-[#E2E8F0]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about transits, career timing, synastry, or Dasha..."
            className="flex-1 px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] placeholder-[#94A3B8] font-sans focus:outline-none focus:border-[#FF552E]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-[#FF552E] hover:bg-[#E6441D] text-white transition-colors disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#64748B] px-1 font-semibold">
          <span>✦ Zero fatalism • Empowering free agency</span>
          <span>Astra v2.4</span>
        </div>
      </div>
    </div>
  );
};
