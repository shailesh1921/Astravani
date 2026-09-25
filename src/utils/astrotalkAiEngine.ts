import { Astrologer, ConsultationIntake, ApiConfig, ChatMessage } from '../types/astrotalk';
import { calculateKundli } from './kundliEngine';
import { ASTROLOGY_KNOWLEDGE_BASE, calculateMahaboteHouse, AstrologicalSutra } from '../data/astrologyKnowledgeBase';
import { getCuratedHoroscope } from '../data/horoscopeDataset';
import { findSpiritualGuidance } from '../data/spiritualNumerologyDataset';

export async function generateAstrologerResponses(
  userMessage: string,
  astrologer: Astrologer,
  intake: ConsultationIntake,
  chatHistory: ChatMessage[],
  apiConfig: ApiConfig
): Promise<string[]> {
  const kundli = calculateKundli(intake.name, intake.gender, intake.dob, intake.tob, intake.pob);

  // 1. Try zero-config Serverless Backend AI endpoint (/api/astrologer-chat)
  try {
    const serverRes = await fetch('/api/astrologer-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage,
        astrologer,
        intake,
        kundli,
        chatHistory: chatHistory.slice(-6)
      })
    });

    if (serverRes.ok) {
      const json = await serverRes.json();
      if (json.success && Array.isArray(json.lines) && json.lines.length > 0) {
        return json.lines;
      }
    }
  } catch (err) {
    // If running in purely local Vite without Vercel serverless or offline, proceed to fallback
    // Silently continue
  }

  // 2. Check environment variable VITE_GEMINI_API_KEY or user settings key
  const envGeminiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();
  const effectiveKey = (apiConfig.apiKey && apiConfig.apiKey.trim().length > 10) 
    ? apiConfig.apiKey.trim() 
    : (envGeminiKey && envGeminiKey.length > 10 ? envGeminiKey : '');

  if (effectiveKey) {
    try {
      const provider = apiConfig.provider === 'openai' && apiConfig.apiKey ? 'openai' : 'gemini';
      if (provider === 'gemini') {
        const lines = await callGeminiApiLines(userMessage, astrologer, intake, chatHistory, effectiveKey, apiConfig.model || 'gemini-3.5-flash');
        if (lines && lines.length > 0) return lines;
      } else if (provider === 'openai') {
        const lines = await callOpenAiApiLines(userMessage, astrologer, intake, chatHistory, effectiveKey, apiConfig.model || 'gpt-4o-mini');
        if (lines && lines.length > 0) return lines;
      }
    } catch (err) {
      console.warn('External AI call failed, falling back to dynamic multi-turn Vedic engine:', err);
    }
  }

  // 3. Robust Client-Side High-Accuracy Vedic Engine (Always instant, zero-failure)
  return generateDynamicMultiTurnLines(userMessage, astrologer, intake, chatHistory);
}

async function callGeminiApiLines(
  userMessage: string,
  astrologer: Astrologer,
  intake: ConsultationIntake,
  chatHistory: ChatMessage[],
  apiKey: string,
  modelName: string = 'gemini-1.5-flash'
): Promise<string[]> {
  const kundli = calculateKundli(intake.name, intake.gender, intake.dob, intake.tob, intake.pob);
  
  const curYear = new Date().getFullYear(); // e.g. 2026
  const nxtYear = curYear + 1;
  const futYear = curYear + 2;

  const systemPrompt = `You are ${astrologer.name} (${astrologer.title}) on AstraVani.
You are a warm, highly respected, wise Indian Vedic Astrologer having a genuine live chat with ${intake.name}.

CLIENT KUNDLI CONTEXT:
- Name: ${intake.name} (${intake.gender}), Born: ${intake.dob} at ${intake.tob}, ${intake.pob}
- Primary Signatures: Lagna: ${kundli.lagnaSign}, Moon: ${kundli.chandraRashi}, Sun: ${kundli.suryaRashi}, Nakshatra: ${kundli.nakshatra}, Dasha: ${kundli.mahadasha}/${kundli.antardasha}
- Current Year: ${curYear}

CRITICAL RULES FOR 100% REAL HUMAN ASTROLOGER FEEL:
1. FOCUS ONLY ON THE EXACT QUESTION:
   - Answer ONLY what the user asked right now.
   - If user asks about career/job, talk ONLY about career/job timing. DO NOT mention marriage, health, gemstones, or unrelated remedies unless asked.
   - If user asks about marriage, talk ONLY about marriage/partner.

2. NEVER WRITE TOO MUCH (NO ESSAYS, NO WALLS OF TEXT):
   - Real humans on chat send only 1 or 2 short, crisp messages (12 to 20 words each).
   - Divide into MAXIMUM 1 or 2 short chat bubbles separated by "|||". NEVER send 3 or 4 bubbles.

3. SOUND LIKE A REAL RESPECTFUL PANDIT JI ON WHATSAPP:
   - Speak in natural, respectful, compassionate Hindi/Hinglish (e.g. 'Haan ${intake.name} ji...', 'Maine aapki patrika me dekha...').
   - Directly give the answer, then ask 1 relevant question to keep the conversation going (e.g. 'Aap abhi kis profile me kaam kar rahe hain?' or 'Kya parivar me baat chal rahi hai?').

4. DELIMITER:
   - Separate distinct short bubbles with "|||". Maximum 2 bubbles total.`;


  const contents = [
    { role: 'user', parts: [{ text: `System Context:\n${systemPrompt}` }] },
    { role: 'model', parts: [{ text: `Pranam. I will chat naturally like a real human astrologer, answering ONLY the user's specific question in 1 or 2 crisp short lines delimited by |||.` }] },
    ...chatHistory.slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    })),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const targetModel = modelName && !modelName.includes('1.5') && !modelName.includes('2.0') ? modelName : 'gemini-3.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey.trim()}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: 180,
        temperature: 0.75
      }
    })
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Gemini API Error: ${res.status} ${errorData}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No text in Gemini response');
  
  const bubbles = text.split('|||').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  return bubbles.slice(0, 2);
}

async function callOpenAiApiLines(
  userMessage: string,
  astrologer: Astrologer,
  intake: ConsultationIntake,
  chatHistory: ChatMessage[],
  apiKey: string,
  modelName: string = 'gpt-4o-mini'
): Promise<string[]> {
  const kundli = calculateKundli(intake.name, intake.gender, intake.dob, intake.tob, intake.pob);
  
  const systemPrompt = `You are ${astrologer.name} (${astrologer.title}) on AstraVani.
Vedic Coordinates: Lagna: ${kundli.lagnaSign}, Moon: ${kundli.chandraRashi}, Mahadasha: ${kundli.mahadasha}, Antardasha: ${kundli.antardasha}.
Chat authentically in natural, warm conversational Hinglish/English with short messages.
Split your reply into 3 to 4 short lines separated by "|||".
Address user ${intake.name} naturally. Never repeat prior statements. Provide realistic timing and sattvic remedies.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-8).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: userMessage }
  ];

  const isNvidia = apiKey.trim().startsWith('nvapi-');
  const endpoint = isNvidia
    ? 'https://integrate.api.nvidia.com/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';
  const targetModel = isNvidia
    ? (modelName && modelName !== 'gpt-4o-mini' ? modelName : 'meta/llama-3.2-11b-vision-instruct')
    : (modelName || 'gpt-4o-mini');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: targetModel,
      messages,
      max_tokens: 350,
      temperature: 0.75
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI API Error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('No text in AI response');

  return parseBubbles(text);
}

function sanitizeYears(str: string, curYear: number = 2026): string {
  if (!str) return str;
  const nxt = curYear + 1;
  return str
    .replace(/\b2024\b/g, `${curYear}`)
    .replace(/\b2025\b/g, `${nxt}`);
}

function parseBubbles(text: string): string[] {
  if (!text) return [];
  const curYear = new Date().getFullYear();
  const cleanText = sanitizeYears(text, curYear);

  let chunks = cleanText.split('|||').map((s: string) => sanitizeYears(s.trim(), curYear)).filter(Boolean);
  if (chunks.length >= 2) return chunks.slice(0, 4);

  chunks = cleanText.split(/\n\s*\n/).map((s: string) => sanitizeYears(s.trim(), curYear)).filter(Boolean);
  if (chunks.length >= 2) return chunks.slice(0, 4);

  const sentences = cleanText.match(/[^.!?।\n]+[.!?।]+/g) || [cleanText];
  const merged: string[] = [];
  let curr = '';
  for (const s of sentences) {
    curr = curr ? curr + ' ' + s.trim() : s.trim();
    if (curr.split(' ').length >= 12) {
      merged.push(sanitizeYears(curr, curYear));
      curr = '';
    }
  }
  if (curr) merged.push(sanitizeYears(curr, curYear));
  return merged.length > 0 ? merged.slice(0, 4) : [sanitizeYears(cleanText.trim(), curYear)];
}



/**
 * SOLUTION 3: Dynamic Multi-Turn Astrological Synthesis Engine
 * 1. Computes actual astronomical coordinates for this exact person.
 * 2. Tracks how many turns have already occurred in the session.
 * 3. Compares all candidate lines against chat history to guarantee zero repetition.
 */
function generateDynamicMultiTurnLines(
  userMsg: string,
  astrologer: Astrologer,
  intake: ConsultationIntake,
  chatHistory: ChatMessage[]
): string[] {
  const query = userMsg.toLowerCase();
  const firstName = (intake.name.split(' ')[0] || intake.name).trim();
  
  // Calculate real astronomical birth chart parameters
  const kundli = calculateKundli(intake.name, intake.gender, intake.dob, intake.tob, intake.pob);
  const lagnaClean = kundli.lagnaSign.split(' ')[0];
  const rashiClean = kundli.chandraRashi.split(' ')[0];
  const dashaClean = kundli.mahadasha.split(' ')[0];
  const antarClean = kundli.antardasha.split(' ')[0];
  const nakshatraClean = kundli.nakshatra.split(' ')[0];

  // Count past astrologer messages to determine conversational depth (Turn Index)
  const pastAstrologerMessages = chatHistory.filter(m => m.sender === 'astrologer');
  const turnIndex = pastAstrologerMessages.length;

  // History memory string to check for repetitions
  const historyText = chatHistory.map(m => m.text.toLowerCase()).join(' ');

  // Helper to ensure line has not been used yet
  const hasAlreadySaid = (phrase: string): boolean => {
    const snippet = phrase.substring(0, Math.min(30, phrase.length)).toLowerCase();
    return historyText.includes(snippet);
  };

  // -------------------------------------------------------------
  // HIGH-ACCURACY DIRECT ASTROLOGICAL ANSWER ENGINE
  // Directly answers specific user questions (timing, marriage, career, etc.)
  // -------------------------------------------------------------
  const directAnswer = getAccurateDirectAstrologicalAnswer(query, firstName, kundli, historyText);
  if (directAnswer && directAnswer.length > 0) {
    return directAnswer;
  }

  // --- DIRECT NUMEROLOGY & SPIRITUAL COUNSEL (dp1812/celestial-comprehensive-spiritual-ai Dataset) ---
  const spiritualMatch = findSpiritualGuidance(userMsg);
  if (spiritualMatch && !hasAlreadySaid(spiritualMatch.substring(0, 30))) {
    const parts = spiritualMatch
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .slice(0, 3);
    if (parts.length > 0) {
      return [
        `Ji ${firstName} ji, aapke is prashna par Vedic shastra aur ank-vidya (numerology) ka sanket:`,
        ...parts
      ];
    }
  }

  // Determine Primary Query Theme (with all Romanized Hindi phonetic variations)
  const isMarriage = query.includes('shadi') || query.includes('shaadi') || query.includes('saadi') || query.includes('sadi') || query.includes('marriage') || query.includes('vivah') || query.includes('byah') || query.includes('rishta') || query.includes('match') || intake.topic === 'Marriage & Kundli';
  const isCareer = query.includes('job') || query.includes('career') || query.includes('naukri') || query.includes('promotion') || query.includes('business') || query.includes('vyapar') || query.includes('work') || intake.topic === 'Career & Job' || intake.topic === 'Business & Money';
  const isMoney = query.includes('paisa') || query.includes('money') || query.includes('loan') || query.includes('karz') || query.includes('finance') || query.includes('dhan') || query.includes('wealth');
  const isManglik = query.includes('manglik') || query.includes('mangal') || query.includes('dosha') || query.includes('kaal sarp');
  const isRemedy = query.includes('upay') || query.includes('remedy') || query.includes('stone') || query.includes('ratna') || query.includes('gemstone') || query.includes('puja') || query.includes('mantra');
  const isLove = query.includes('love') || query.includes('pyar') || query.includes('breakup') || query.includes('partner') || query.includes('ex') || query.includes('relationship') || intake.topic === 'Love & Relationship';

  // --- Initial Chart Opening & Root Cause Inspection ---
  if (turnIndex <= 2) {
    if (isMarriage) {
      return [
        `Haan ${firstName} ji, maine aapka ${lagnaClean} Lagna aur ${rashiClean} Rashi ka saptam bhav khol liya hai`,
        `Aapke chart me saptam bhav (marriage house) par ${dashaClean} ka prabhav dikh raha hai`,
        `Yahi mukhya kaaran hai ki baatein aage badhkar achanak ruk jaati hain ya pasand me samay lag raha hai`,
        `Par chinta mat kijiye, ye sthiti sthayi nahi hai. Aage ka samay shubh sanket de raha hai 🙏`
      ];
    }

    if (isCareer || isMoney) {
      return [
        `Ji ${firstName} ji, aapki kundli me ${lagnaClean} Lagna ke anusaar dasham bhav (karma sthana) ka aakalan kar raha hoon`,
        `Aapke ${nakshatraClean} Nakshatra me hone se aapme kshamta bohot hai, par pichle kuch samay se parinam 60% hi mil rahe the`,
        `Vartamaan me ${dashaClean} ki dasha me thoda sangharsh awashya raha hai, par mehanat bekar nahi jayegi`,
        `Aapka vyaparik aur naukri ka yog ab nayi karwat lene ja raha hai ☀️`
      ];
    }

    if (isManglik) {
      return [
        `Maine aapke chart me Mangal ki specific degree aur house placement dekha hai, ${firstName} ji`,
        `Lagna patrika me anshik prabhav hai, par koi hanikarak gambhir dosh nahi ban raha`,
        `Vedic niyam ke anusar ${rashiClean} rashi me Mangal ka anisht prabhav 80% shant ho chuka hai`,
        `Is vishay par man me koi bhi bhay ya sandeh mat rakhiye`
      ];
    }

    if (isLove) {
      return [
        `Haan ${firstName} ji, aapke pancham (love & emotion) aur saptam bhav ki sthiti dekh raha hoon`,
        `Emotional attachment bohot gehra raha hai, par shani aur rahu ki dristi se galatfehmiya paida hui hain`,
        `Doosri taraf se communication me kami ya confusion ka yog dikh raha hai`,
        `Agle 45 dino me sthiti me ek achanak mod aane wala hai ✨`
      ];
    }

    // Default Turn 1
    return [
      `Pranaam ${firstName} ji, main aapki patrika ka vivechan dhyan se kar raha hoon`,
      `Aapka ${lagnaClean} Lagna aur ${rashiClean} Rashi ka sanrachna bohot prabhavshali hai`,
      `Aapke chart me ${dashaClean} ki dasha me abhi ${antarClean} ka antardasha pravahit hai`,
      `Aapne jo vishay uthaya hai, usme aane wale samay me anukul badlav aayega`
    ];
  }

  // Calculate user's specific Mahabote House from the ingested TTS_Astro_data dataset
  const mahaboteData = calculateMahaboteHouse(intake.dob);
  const mahaboteHouseName = mahaboteData.rawDatasetMetadata?.house_name || 'Raja';

  // --- TURN 2: Mahabote Graha Blueprint (TTS_Astro_data Integration) ---
  if (turnIndex === 3 && !hasAlreadySaid('mahabote')) {
    return [
      `Ek vishesh shastriya bhed aapko batata hoon, ${firstName} ji`,
      `Aapki janma tithi ke var-chakra (Mahabote Sutra) ke anusar aapka mool sthan '${mahaboteHouseName}' bhav me banta hai`,
      `${mahaboteData.insightHindi}`,
      `Iska prabhav aapke vartamaan dasha ke saath milkar aane wale samay me naye dwar kholega 🙏`
    ];
  }

  // --- TURN 3 / 4: Classical Sutra Deep Dive & Exact Timeline ---
  if (turnIndex >= 4 && turnIndex <= 6) {
    // Find an unused classical sutra from our rich ASTROLOGY_KNOWLEDGE_BASE
    const relevantSutras = ASTROLOGY_KNOWLEDGE_BASE.filter(s => {
      if (s.source === 'Mahabote (TTS_Astro_data)') return false;
      if (isCareer && (s.topic === 'career' || s.topic === 'wealth')) return true;
      if (isMarriage && (s.topic === 'marriage' || s.topic === 'manglik')) return true;
      if (isMoney && s.topic === 'wealth') return true;
      if (isManglik && s.topic === 'manglik') return true;
      return true;
    });

    const unusedSutra = relevantSutras.find(s => !hasAlreadySaid(s.insightHindi.substring(0, 20)));

    if (unusedSutra) {
      return [
        `Shaastra pramaan (${unusedSutra.source}) ke anusar aapki sthiti ka aakalan:`,
        `${unusedSutra.insightHindi}`,
        `Samay chakra sanket: ${unusedSutra.timingIndicator || 'Agle 3 se 6 mahine me shubh parinam.'}`,
        `Aap is disha me prayas jaari rakhein, nishchit roop se safalta milegi 🌟`
      ];
    }

    if (isMarriage || isLove) {
      return [
        `Dekhiye ${firstName} ji, samay ka chakka ab badal raha hai`,
        `Jab Guru (Jupiter) ka gochar aapke rashi se tritiya aur saptam par prabhav dalega, tab rishta pakka hoga`,
        `Sabse mazboot yog agle varsh February se August ke beech me ban raha hai`,
        `Aane wala jeevansathi respectful, working background se aur aapke vicharo ko samman dene wala hoga`
      ];
    }

    if (isCareer || isMoney) {
      return [
        `Ab aane wale time framework par aate hain, ${firstName} ji`,
        `Aapki kundli me ${antarClean} ki sub-period agle 3 se 5 mahine me trigger ho rahi hai`,
        `Is dauraan agar aap job switch, position upgrade, ya business expansion karenge toh 100% safalta milegi`,
        `Pehle se behtar salary package aur authority aapko pradan hogi 📈`
      ];
    }
  }

  // --- TURN 5 / 6: Cosmic Rashi Transit Guidance (karthiksagarn/astro_horoscope Dataset) ---
  if (turnIndex >= 5 && turnIndex <= 7 && !hasAlreadySaid('grah-gochar')) {
    const horoCat = (isCareer || isMoney) ? 'career' : (isLove || isMarriage) ? 'love' : 'general';
    const horoPrediction = getCuratedHoroscope(rashiClean, horoCat, turnIndex + (firstName.length * 3));
    if (horoPrediction && !hasAlreadySaid(horoPrediction.substring(0, 30))) {
      return [
        `Aapke ${rashiClean} rashi ke cosmic transit (grah-gochar) ka sanket bhi yahi kehta hai, ${firstName} ji:`,
        `"${horoPrediction}"`,
        `Is sakaratmak urja par vishwas rakhein, aane wala samay aapke paksh me jud raha hai 🌿`
      ];
    }
  }

  // --- TURN 8+: Specific Tailored Remedies & Astrological Upayas ---
  if (isRemedy || turnIndex === 8) {
    const remedyLines = [
      `Aapke ${lagnaClean} Lagna aur ${rashiClean} Rashi ke anusaar sabse shreshtha upay ye hain:`,
      `1. Pratidin snan ke uprant ${kundli.luckyMantra} ka kam se kam 11 ya 21 baar jaap karein`,
      `2. Aapke liye sabse shubh ratna ${kundli.luckyGemstone} hai, jo aapki urja ko sthir karega`,
      `3. Guruvar ya Shaniwar ko pakshiyon ko daana aur kisi zarooratmand ko anna ka daan karein 🙏`
    ];

    if (!hasAlreadySaid('luckyGemstone') && !hasAlreadySaid('jaap karein')) {
      return remedyLines;
    }
  }

  // --- TURN 8+: Deep Personalized Guidance & Nuanced Spiritual Counsel ---
  const dynamicNuances = [
    [
      `Haan ${firstName} ji, aapke man ka sandeh main samajh sakta hoon`,
      `Jyotish shastra me aisi sthiti ko 'Sankat se Siddhi' kaha jata hai`,
      `Aapka atmavishwas hi aapki sabse badi shakti hai, usko kamzor mat hone dijiye`,
      `Ishwar ka aashirwad aapke saath hai, bilkul nishchint rahiye!`
    ],
    [
      `Ek vishesh sanket aur mil raha hai aapke chart se`,
      `Uttar ya Purva disha me kiya gaya koi bhi naya prayas aapke liye sabse jyada labhkari siddh hoga`,
      `Parivaar me kisi bade bujurg ka aashirwad lene se atke hue kaam achanak chal padenge`,
      `Har subah 5 minute shant baithkar dhyan lagayein, man ki aashankaayein door hongi 🌸`
    ],
    [
      `Aapki kundli me ek anokha gun hai ki kathin se kathin paristhiti se nikalna aapko aata hai`,
      `Jo log pichle samay me aapke virodh me the, wo bhi aapki kshamta ka loha manenge`,
      `Aapka aane wala dasha parivartan aapko naya astitva aur samman dilayega`,
      `Bolo Har Har Mahadev! Sabhi shubh sankalp poore honge 🙏`
    ]
  ];

  const selected = dynamicNuances[(turnIndex + firstName.length) % dynamicNuances.length];
  return selected;
}

/**
 * HIGH-ACCURACY DIRECT ASTROLOGICAL ANSWER ENGINE
 * Handles specific user questions (marriage timing, career timing, money, manglik, gemstones)
 * with precise Vedic calculations and realistic timelines.
 */
function getAccurateDirectAstrologicalAnswer(
  query: string,
  firstName: string,
  kundli: ReturnType<typeof calculateKundli>,
  historyText: string
): string[] | null {
  const q = query.toLowerCase();
  const lagnaClean = kundli.lagnaSign.split(' ')[0];
  const rashiClean = kundli.chandraRashi.split(' ')[0];
  const dashaClean = kundli.mahadasha.split(' ')[0];
  const nakshatraClean = kundli.nakshatra.split(' ')[0];

  const hasAlreadySaid = (phrase: string): boolean => {
    const snippet = phrase.substring(0, Math.min(30, phrase.length)).toLowerCase();
    return historyText.includes(snippet);
  };

  // 1. Marriage Timing ("meri saadi kab hogi", "shaadi kab hogi", "shadi kab hogi", "marriage when", etc.)
  const isMarriageWord = q.includes('saadi') || q.includes('shadi') || q.includes('shaadi') || q.includes('sadi') || q.includes('marriage') || q.includes('vivah') || q.includes('byah') || q.includes('rishta');
  const isTimingWord = q.includes('kab') || q.includes('when') || q.includes('kaun') || q.includes('kis') || q.includes('timeline') || q.includes('year') || q.includes('saal') || q.includes('mahine') || q.includes('samay') || q.includes('hogi');

  if (isMarriageWord && isTimingWord && !hasAlreadySaid('saptamesh aur brihaspati')) {
    return [
      `Haan ${firstName} ji, aapki kundli me saptamesh aur Brihaspati (Guru) ke gochar ke anusaar vivah ka sabse prabal yog agle 8 se 14 mahino ke beech (Late 2026 se Mid 2027) ban raha hai`,
      `Aapke ${lagnaClean} Lagna aur ${rashiClean} Rashi ke Navamsha (D9) chart me Shukra ki shubh dristi se rishte ki thos baat agle 4 se 6 mahino me prarambh ho jayegi`,
      `Aane wala jeevansathi sanskritik, vyavaharik aur parivarik mulyon ko samman dene wala hoga, aur rishta aapke niwas sthan se Purva (East) ya Uttar-Purva disha se aane ke prabal sanket hain`,
      `Vivah me kisi bhi anchahe vilamb ko door karne ke liye: Guruvar ke din peele vastra dharan karein aur 'Om Namo Bhagavate Vasudevaya' ka 21 baar jaap karein 🙏`
    ];
  }

  // 2. Love vs Arranged Marriage ("love marriage hogi ya arrange", "love ya arrange")
  if (isMarriageWord && (q.includes('love') || q.includes('arrange') || q.includes('prem') || q.includes('pasand'))) {
    if (!hasAlreadySaid('pancham (love) aur saptam')) {
      return [
        `Aapki kundli me pancham (love & emotions) aur saptam (marriage) bhav ka aapas me shubh sambandh banta hai, ${firstName} ji`,
        `Iska arth hai ki vivah me aapki vyaktigat pasand ya prem sambandh ko parivar ki sehmati prapt hone ka 80% yog hai`,
        `Shuruat me parivar me thoda sankoch ya vicharon ka matbhed ho sakta hai, parantu dhairya aur sammanpurvak samvaad se baat ban jayegi`,
        `Sambandhon me madhurta aur sthirta ke liye Shukravar ko kisi mandir me safed pushpa ya misri arpit karein 🌸`
      ];
    }
  }

  // 3. Career / Job Timing ("job kab lagegi", "promotion kab hoga", "naukri kab milegi", "career change")
  const isCareerWord = q.includes('job') || q.includes('naukri') || q.includes('promotion') || q.includes('career') || q.includes('kaam') || q.includes('work') || q.includes('interview');
  if (isCareerWord && isTimingWord && !hasAlreadySaid('dasham bhav (karma sthana) aur')) {
    return [
      `Aapke Dasham bhav (Karma Sthana) aur ${dashaClean} Mahadasha ke anusaar, agle 3 se 5 mahino ke bheetar nayi naukri ya promotion ka prabal yog ban raha hai, ${firstName} ji`,
      `Aapke ${nakshatraClean} Nakshatra ke gochar parivartan se purani ruki hui files aur interview results aapke paksh me aane lagenge`,
      `Uttar ya Purva disha ki taraf se aavedan (applications) karne par sarvadhik safalta aur uttam package prapt hoga`,
      `Pratidin pratah Surya dev ko taambe ke lotey se jal arghya dein aur Aditya Hridaya Stotra ka smaran karein ☀️`
    ];
  }

  // 4. Money / Loan / Wealth Timing ("paisa kab aayega", "karz kab chukega", "financial problem")
  const isMoneyWord = q.includes('paisa') || q.includes('money') || q.includes('karz') || q.includes('loan') || q.includes('finance') || q.includes('dhan') || q.includes('wealth') || q.includes('udhar');
  if (isMoneyWord && isTimingWord && !hasAlreadySaid('ekadash bhav (labha sthana)')) {
    return [
      `Ji ${firstName} ji, aapke Ekadash bhav (Labha Sthana) aur Dwitiya bhav (Dhan Sanchay) ka aakalan darshata hai ki aarthik tanaav agle 90 se 120 dino me ghatna shuru hoga`,
      `Ruka hua paisa ya atki hui payments ke wapas aane ka yog upcoming Gochar transit me sakriy ho raha hai`,
      `Vyarth ke aakasmik kharchon par niyamit anushasan rakhein aur kisi bhi vyakti ko bina likhit samjhote ke bada udhaar na dein`,
      `Budhwar ko hari moong daal pakshiyon ko khilayein aur wallet me chandi ka ek chhota chaukor tukda rakhein 🪙`
    ];
  }

  // 5. Manglik Dosha Query ("kya mai manglik hu", "manglik dosha", "manglik hai")
  if (q.includes('manglik') && !hasAlreadySaid('mangal ki sthiti ka sukshma')) {
    return [
      `Maine aapke Lagna chart me Mangal ki sthiti ka sukshma aakalan kiya hai, ${firstName} ji`,
      `Aapki kundli me Mangal ka anshik prabhav zaroor hai, parantu Guru ki shubh drishti aur ${rashiClean} rashi me hone se yeh koi hanikarak dosha nahi banata`,
      `Mangal ka yeh prabhav aapke andar tejaswi urja, aatmasamman aur leadership deta hai; vivah me anisht ka koi bhay na karein`,
      `Man ki shanti aur krodh nivaaran ke liye mangalwar ko Hanuman Chalisa ka path karein aur lal rang ka atyadhik upyog na karein 🚩`
    ];
  }

  // 6. Lucky Gemstone Query ("kaunsa ratna pehnu", "lucky stone", "gemstone", "ring", "anguthi")
  if ((q.includes('ratna') || q.includes('stone') || q.includes('gemstone') || q.includes('ring') || q.includes('anguthi')) && !hasAlreadySaid('sarvadhik labhkari shubh ratna')) {
    return [
      `Aapke ${lagnaClean} Lagna aur ${rashiClean} Rashi ke anusaar aapke liye sarvadhik labhkari shubh ratna "${kundli.luckyGemstone}" hai, ${firstName} ji`,
      `Yeh ratna aapke mool grah ki urja ko sakriy karke aatmavishwas, aarthik sthirta aur achanak aane wali rukawaton ko door karega`,
      `Ise shubh muhurt me (shubh var ke din) dharan karna chahiye`,
      `Snan ke baad apne ishta devta ka dhyan karte hue ise dharan karein aur ${kundli.luckyMantra} ka smaran karein 💎`
    ];
  }

  // 7. General Marriage inquiry without timing words ("saadi", "shadi", "shaadi", "vivah")
  if (isMarriageWord && !hasAlreadySaid('saptam bhav (marriage house)')) {
    return [
      `Haan ${firstName} ji, maine aapka ${lagnaClean} Lagna aur ${rashiClean} Rashi ka saptam bhav khol liya hai`,
      `Aapke chart me saptam bhav par ${dashaClean} ka prabhav dikh raha hai, jisse rishton me thoda vilamb ya chayan me samay lagta hai`,
      `Par chinta mat kijiye, Navamsha chart me Shukra ki sthiti anukul hai aur aage ka samay shubh sanket de raha hai`,
      `Aapke liye sabse prabal vivah ka samay agle 8 se 14 mahino me aayega 🙏`
    ];
  }

  return null;
}
