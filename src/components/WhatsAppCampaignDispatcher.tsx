import React, { useState, useEffect } from 'react';
import { 
  Send, Users, MessageSquare, CheckCircle2, Clock, 
  Sparkles, ShieldCheck, Download, Trash2, Copy, Check, 
  AlertTriangle, ArrowRight, Play, RefreshCw, FileText
} from 'lucide-react';

export interface CampaignContact {
  id: string;
  phone: string;
  name: string;
  topic?: string;
  status: 'pending' | 'sent' | 'skipped';
  sentAt?: string;
}

const PRESET_TEMPLATES = [
  {
    id: 'free_consultation',
    name: '🎁 1st Consultation FREE (Highest Conversion)',
    subject: 'Free 5-Min Welcome Offer',
    content: `🕉️ Pranam {name} ji! 

AstraVani (India's Sacred Vedic Platform) par aapka hardik swagat hai. 

✨ Hamare 4,500+ Verified Jyotishacharyas se apni Kundli, Career, ya Marriage par satik guidance lein:
🎁 Aapki First Consultation (5 Mins) 100% FREE hai!

👉 Abhi live connect karein:
{link}

🔒 100% Private & Confidential. Koi credit card ki zarurat nahi hai. Shubh din! 🙏`
  },
  {
    id: 'kundli_milan',
    name: '💍 Kundli Milan & Marriage Timing',
    subject: 'Vivah Yog & Compatibility',
    content: `🕉️ Namaste {name} ji! 

Kya vivah me deri ho rahi hai ya sahi rishta nahi mil raha? 

💍 AstraVani par 36 Guna Kundli Milan aur Manglik Dosh ki satik jaanch karein.
🎁 First 5 Mins 100% FREE consultation with Marriage Specialists!

👉 Kundli Milan check karein:
{link}

Pranam! Shubh Vivah Yog banein 🙏`
  },
  {
    id: 'career_growth',
    name: '💼 Career & Promotion Timing',
    subject: 'Career & Business Guidance',
    content: `🕉️ Namaste {name} ji! 

Career me stagnation, job switch me dikkat, ya business growth me rukawat? 

💼 Apni Kundli ki Mahadasha aur Shubh Muhurat timing jaaniye top Vedic Gurus se.
🎁 First 5 Mins 100% FREE!

👉 Career guidance lein:
{link}

AstraVani Jyotish Seva 🙏`
  },
  {
    id: 'free_kundli',
    name: '📜 Free Janam Kundli by Date of Birth',
    subject: 'Complete Vedic Birth Chart',
    content: `🕉️ Pranam {name} ji! 

Apni Janam Kundli, Lagna Chart, Navamsha, aur Dosh report (Kaal Sarp, Sade Sati) bilkul FREE prapt karein. 

📜 100% Free Janam Kundli Report:
👉 Direct Download karein:
{link}

AstraVani Vedic Trust 🙏`
  }
];

const SAMPLE_CONTACTS_TEXT = `9876543210, Rahul Sharma, Career
9811223344, Pooja Verma, Marriage
9988776655, Amit Patel, Kundli
9822334455, Neha Gupta, General
9711223344, Vikram Singh, Career`;

export const WhatsAppCampaignDispatcher: React.FC = () => {
  const [rawInput, setRawInput] = useState('');
  const [contacts, setContacts] = useState<CampaignContact[]>(() => {
    try {
      const saved = localStorage.getItem('astravani_wa_campaign_contacts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState(PRESET_TEMPLATES[0].id);
  const [customContent, setCustomContent] = useState('');
  const [campaignTag, setCampaignTag] = useState('wa_campaign');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'import' | 'templates' | 'guidelines'>('queue');

  // Persist contacts in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('astravani_wa_campaign_contacts', JSON.stringify(contacts));
    } catch (e) {}
  }, [contacts]);

  // Clean phone number: remove spaces, symbols, ensure 91 country code for India
  const formatPhoneNumber = (raw: string): string => {
    let cleaned = raw.replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      cleaned = '91' + cleaned.substring(1);
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      // Already clean Indian number
    }
    return cleaned;
  };

  // Parse bulk text into contacts
  const handleParseContacts = () => {
    if (!rawInput.trim()) return;

    const lines = rawInput.split('\n');
    const parsed: CampaignContact[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parts = trimmed.split(/[,;\t]/).map(p => p.trim());
      const phone = formatPhoneNumber(parts[0] || '');
      const name = parts[1] || 'Seeker';
      const topic = parts[2] || 'General';

      if (phone.length >= 10) {
        parsed.push({
          id: `c_${Date.now()}_${index}`,
          phone,
          name,
          topic,
          status: 'pending'
        });
      }
    });

    if (parsed.length > 0) {
      setContacts(prev => [...prev, ...parsed]);
      setRawInput('');
      setActiveTab('queue');
    }
  };

  const handleLoadSample = () => {
    setRawInput(SAMPLE_CONTACTS_TEXT);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all contacts from the queue?')) {
      setContacts([]);
      localStorage.removeItem('astravani_wa_campaign_contacts');
    }
  };

  // Build personalized message content
  const getPersonalizedMessage = (contact: CampaignContact): string => {
    const template = PRESET_TEMPLATES.find(t => t.id === selectedTemplateId);
    let raw = customContent || template?.content || PRESET_TEMPLATES[0].content;

    let targetLink = 'https://astravani.in/?ref=' + campaignTag;
    if (selectedTemplateId === 'kundli_milan') {
      targetLink = 'https://astravani.in/?tab=matching&ref=' + campaignTag;
    } else if (selectedTemplateId === 'free_kundli') {
      targetLink = 'https://astravani.in/?tab=kundli&ref=' + campaignTag;
    }

    return raw
      .replace(/{name}/g, contact.name)
      .replace(/{topic}/g, contact.topic || 'Astrology')
      .replace(/{link}/g, targetLink);
  };

  // Open WhatsApp Web / App directly with message pre-filled
  const handleDispatchContact = (contact: CampaignContact) => {
    const text = getPersonalizedMessage(contact);
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${contact.phone}?text=${encodedText}`;

    // Mark as sent
    setContacts(prev => prev.map(c => 
      c.id === contact.id ? { ...c, status: 'sent', sentAt: new Date().toLocaleTimeString() } : c
    ));

    // Open WhatsApp in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSkipContact = (contactId: string) => {
    setContacts(prev => prev.map(c => 
      c.id === contactId ? { ...c, status: 'skipped' } : c
    ));
  };

  const handleResetStatus = (contactId: string) => {
    setContacts(prev => prev.map(c => 
      c.id === contactId ? { ...c, status: 'pending', sentAt: undefined } : c
    ));
  };

  const handleCopyText = (contact: CampaignContact) => {
    const text = getPersonalizedMessage(contact);
    navigator.clipboard.writeText(text);
    setCopiedId(contact.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Stats
  const totalCount = contacts.length;
  const sentCount = contacts.filter(c => c.status === 'sent').length;
  const pendingCount = contacts.filter(c => c.status === 'pending').length;
  const skippedCount = contacts.filter(c => c.status === 'skipped').length;
  const progressPercent = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;

  // Next pending contact
  const nextContact = contacts.find(c => c.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          HEADER BANNER
      ─────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/30">
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>100% Ban-Safe • 1-Click WhatsApp Direct • Zero Setup</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <span>AstraVani WhatsApp Campaign Dispatcher</span>
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 max-w-xl">
              Paste customer numbers, choose high-converting Vedic templates, and send personalized invitations directly via WhatsApp without risking account bans.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-slate-950/30 p-3 rounded-2xl border border-white/20">
            <div className="text-center px-3 border-r border-white/20">
              <span className="block text-xl sm:text-2xl font-black text-white">{totalCount}</span>
              <span className="text-[10px] uppercase font-bold text-emerald-200">Total Leads</span>
            </div>
            <div className="text-center px-3 border-r border-white/20">
              <span className="block text-xl sm:text-2xl font-black text-emerald-300">{sentCount}</span>
              <span className="text-[10px] uppercase font-bold text-emerald-200">Sent ✅</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-xl sm:text-2xl font-black text-amber-300">{pendingCount}</span>
              <span className="text-[10px] uppercase font-bold text-emerald-200">Queue ⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          NAVIGATION TABS
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer min-h-[44px] ${
            activeTab === 'queue'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Dispatch Queue ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer min-h-[44px] ${
            activeTab === 'import'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Import Leads / Paste Numbers</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer min-h-[44px] ${
            activeTab === 'templates'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Message Template & Preview</span>
        </button>

        <button
          onClick={() => setActiveTab('guidelines')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer min-h-[44px] ${
            activeTab === 'guidelines'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Ban-Safe Guidelines</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: DISPATCH QUEUE
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          
          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Campaign Progress: {sentCount} of {totalCount} sent</span>
                <span className="text-emerald-600 font-black">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Next Up Priority Dispatch Hero Card */}
          {nextContact ? (
            <div className="bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/80 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    👉 Next In Queue
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    {nextContact.name} ({nextContact.topic || 'General'})
                  </h3>
                  <p className="text-sm font-mono text-slate-600 mt-0.5 font-bold">
                    📱 +{nextContact.phone}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Template Active: <strong className="text-slate-800">{PRESET_TEMPLATES.find(t => t.id === selectedTemplateId)?.name}</strong>
                  </p>
                </div>

                {/* 1-Click Dispatch Action Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleDispatchContact(nextContact)}
                    className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-emerald-600/30 transition flex items-center justify-center gap-2.5 cursor-pointer min-h-[52px]"
                  >
                    <Send className="w-5 h-5" />
                    <span>🚀 Send to {nextContact.name} on WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSkipContact(nextContact.id)}
                    className="px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition cursor-pointer min-h-[52px]"
                  >
                    Skip ⏭️
                  </button>
                </div>
              </div>

              {/* Message Preview Snippet */}
              <div className="mt-5 p-4 bg-white/90 rounded-2xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                {getPersonalizedMessage(nextContact)}
              </div>
            </div>
          ) : totalCount > 0 ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-xl font-black text-emerald-900">Campaign Completed! 🎉</h3>
              <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                All {totalCount} leads have been contacted or processed. You can import new leads or reset the queue anytime.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-black text-slate-800">No Contacts in Queue Yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Paste your customer phone numbers to begin your WhatsApp campaign.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('import')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer inline-flex items-center gap-2"
              >
                <span>Import Contacts Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Full Queue Table */}
          {contacts.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-sm">
                  Contacts List ({contacts.length})
                </h4>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {contacts.map((contact, idx) => (
                  <div key={contact.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 text-center text-xs text-slate-400 font-mono">{idx + 1}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900 truncate">{contact.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">+{contact.phone}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Interest: {contact.topic || 'General'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {contact.status === 'sent' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Sent {contact.sentAt}</span>
                        </span>
                      )}

                      {contact.status === 'skipped' && (
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          Skipped
                        </span>
                      )}

                      {contact.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleDispatchContact(contact)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyText(contact)}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
                        title="Copy message text"
                      >
                        {copiedId === contact.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {contact.status !== 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleResetStatus(contact.id)}
                          className="text-slate-400 hover:text-amber-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                          title="Reset status to pending"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: IMPORT CONTACTS
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'import' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Paste Customer Phone Numbers</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste one contact per line in format: <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700">Phone, Name, Topic</code>
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 5 Sample Leads</span>
            </button>
          </div>

          <textarea
            rows={8}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="9876543210, Rahul Sharma, Career&#10;9811223344, Priya Verma, Marriage&#10;9988776655, Amit Patel, Kundli&#10;9877665544, Anjali Gupta, Love"
            className="w-full p-4 border border-slate-300 rounded-2xl text-xs sm:text-sm font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-500">
              💡 Supports 10-digit Indian numbers (auto-adds +91), spaces, or commas.
            </span>
            <button
              type="button"
              onClick={handleParseContacts}
              disabled={!rawInput.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Users className="w-4 h-4" />
              <span>Import &amp; Add to Queue</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: TEMPLATES & LIVE WHATSAPP PREVIEW
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Template Selector */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Choose Message Template</h3>
            
            <div className="space-y-3">
              {PRESET_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => { setSelectedTemplateId(tmpl.id); setCustomContent(''); }}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{tmpl.name}</span>
                    {selectedTemplateId === tmpl.id && (
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{tmpl.subject}</p>
                </div>
              ))}
            </div>

            {/* Campaign Referral Tracking Tag */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campaign Tracking Tag (Appended to website links):
              </label>
              <input
                type="text"
                value={campaignTag}
                onChange={(e) => setCampaignTag(e.target.value)}
                placeholder="wa_october_leads"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Right: Live WhatsApp Chat Simulator Preview */}
          <div className="lg:col-span-5">
            <h3 className="text-lg font-black text-slate-900 mb-4">Live WhatsApp Preview</h3>
            
            {/* Phone Screen Mockup */}
            <div className="bg-[#EFE8DE] rounded-3xl border-4 border-slate-800 shadow-xl overflow-hidden max-w-sm mx-auto">
              
              {/* WhatsApp App Bar */}
              <div className="bg-[#075E54] text-white p-3 flex items-center gap-2.5 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  AV
                </div>
                <div>
                  <h5 className="font-bold text-xs leading-none">AstraVani Official 🕉️</h5>
                  <span className="text-[10px] text-emerald-200">Online</span>
                </div>
              </div>

              {/* Chat Message Bubble */}
              <div className="p-4 space-y-3 min-h-[300px]">
                <div className="bg-white rounded-2xl rounded-tl-none p-3.5 shadow-sm text-xs text-slate-800 leading-relaxed max-w-[92%] relative">
                  <p className="whitespace-pre-wrap font-sans">
                    {getPersonalizedMessage({ id: 'preview', phone: '919876543210', name: 'Rahul', status: 'pending' })}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-1.5 font-mono">
                    <span>12:05 PM</span>
                    <span className="text-emerald-500 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: BAN-SAFE GUIDELINES
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'guidelines' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">WhatsApp Number Protection Rules</h3>
              <p className="text-xs text-slate-500">How to keep your WhatsApp Business account 100% safe from Meta bans.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-700">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <h5 className="font-bold text-emerald-900 text-sm mb-1">✅ 1. Batch Sending Rule</h5>
              <p>Send in batches of <strong>25 to 35 messages per hour</strong>. Never send 200 messages in 10 minutes from a brand-new number.</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <h5 className="font-bold text-emerald-900 text-sm mb-1">✅ 2. Always Offer 100% Free Value First</h5>
              <p>Indian users respond warmly to <strong>"First 5 Mins FREE"</strong> or <strong>"Free Janam Kundli Report"</strong>. They never report messages that provide free spiritual help.</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <h5 className="font-bold text-emerald-900 text-sm mb-1">✅ 3. Personalization Prevents Spam Detection</h5>
              <p>Our tool automatically puts their name (e.g. <em>"Pranam Rahul ji"</em>) in every message so WhatsApp filters see unique individual chats, not identical spam.</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <h5 className="font-bold text-emerald-900 text-sm mb-1">✅ 4. Respect Replies</h5>
              <p>If someone replies <em>"Not interested"</em>, simply skip them. When people engage in conversation with you, Meta boosts your number's Trust Score.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WhatsAppCampaignDispatcher;
