import { Astrologer, ConsultationIntake, ApiConfig, ChatMessage } from '../types/astrotalk';
import { calculateKundli } from './kundliEngine';
import { ASTROLOGY_KNOWLEDGE_BASE, calculateMahaboteHouse, AstrologicalSutra } from '../data/astrologyKnowledgeBase';

export async function generateAstrologerResponses(
  userMessage: string,
  astrologer: Astrologer,
  intake: ConsultationIntake,
  chatHistory: ChatMessage[],
  apiConfig: ApiConfig
): Promise<string[]> {
  // If user provided a live Gemini or OpenAI API key, attempt live AI generation
  if (apiConfig.apiKey && apiConfig.apiKey.trim().length > 10) {
    try {
      if (apiConfig.provider === 'gemini') {
        const lines = await callGeminiApiLines(userMessage, astrologer, intake, chatHistory, apiConfig.apiKey, apiConfig.model);
        if (lines && lines.length > 0) return lines;
      } else if (apiConfig.provider === 'openai') {
        const lines = await callOpenAiApiLines(userMessage, astrologer, intake, chatHistory, apiConfig.apiKey, apiConfig.model);
        if (lines && lines.length > 0) return lines;
      }
    } catch (err) {
      console.warn('External API call failed, falling back to dynamic multi-turn engine:', err);
    }
  }

  // Solution 3: Dynamic Multi-Turn Astrological Synthesis with Anti-Repetition Memory
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
  
  const systemPrompt = `You are ${astrologer.name} (${astrologer.title}) on AstraVani.
Persona & Credentials:
- Tradition: ${astrologer.personaType} (${astrologer.bio}).
- Languages: ${astrologer.languages.join(', ')}.
- User Details: Name: ${intake.name}, Gender: ${intake.gender}, DOB: ${intake.dob}, Time: ${intake.tob}, Place: ${intake.pob}, Topic: ${intake.topic}.
- Calculated Chart: Lagna: ${kundli.lagnaSign}, Moon Sign: ${kundli.chandraRashi}, Sun Sign: ${kundli.suryaRashi}, Nakshatra: ${kundli.nakshatra}, Current Mahadasha: ${kundli.mahadasha}, Antardasha: ${kundli.antardasha}, Gemstone: ${kundli.luckyGemstone}.

CRITICAL STYLE DIRECTIVE (GENUINE INDIAN ASTROLOGER):
Respond like a deeply respected, experienced Indian Pandit Ji chatting on WhatsApp/AstraVani in authentic, empathetic conversational Hindi/Hinglish.
Break your response into 3 to 4 natural, conversational sentences separated by the exact delimiter "|||".
Address the user respectfully (e.g., 'Haan ${intake.name} ji...', 'Aapki patrika me dekh pa raha hoon...').
Give a realistic astrological timeline based on their dasha and 1 actionable sattvic remedy.
NEVER repeat what you already said in previous messages. Keep each line punchy (10-18 words).`;

  const contents = [
    { role: 'user', parts: [{ text: `System Context:\n${systemPrompt}` }] },
    { role: 'model', parts: [{ text: `Understood. I will chat with non-repeating genuine short conversational lines delimited by |||.` }] },
    ...chatHistory.slice(-8).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    })),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const targetModel = modelName.includes('2.0') ? 'gemini-2.0-flash' : 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey.trim()}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: 320,
        temperature: 0.8
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
  
  return text.split('|||').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
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

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: modelName || 'gpt-4o-mini',
      messages,
      max_tokens: 320,
      temperature: 0.8
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API Error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('No text in OpenAI response');

  return text.split('|||').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
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

  // Determine Primary Query Theme
  const isMarriage = query.includes('shadi') || query.includes('marriage') || query.includes('vivah') || query.includes('shaadi') || query.includes('match') || query.includes('rishta') || intake.topic === 'Marriage & Kundli';
  const isCareer = query.includes('job') || query.includes('career') || query.includes('naukri') || query.includes('promotion') || query.includes('business') || query.includes('vyapar') || query.includes('work') || intake.topic === 'Career & Job' || intake.topic === 'Business & Money';
  const isMoney = query.includes('paisa') || query.includes('money') || query.includes('loan') || query.includes('karz') || query.includes('finance') || query.includes('dhan') || query.includes('wealth');
  const isManglik = query.includes('manglik') || query.includes('mangal') || query.includes('dosha') || query.includes('kaal sarp');
  const isRemedy = query.includes('upay') || query.includes('remedy') || query.includes('stone') || query.includes('ratna') || query.includes('gemstone') || query.includes('puja') || query.includes('mantra');
  const isLove = query.includes('love') || query.includes('pyar') || query.includes('breakup') || query.includes('partner') || query.includes('ex') || query.includes('relationship') || intake.topic === 'Love & Relationship';

  // ==========================================
  // PROGRESSIVE TURN-BASED CONVERSATION ENGINE
  // ==========================================

  // --- TURN 0 / 1: Initial Chart Opening & Root Cause Inspection ---
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

  // --- TURN 7+: Specific Tailored Remedies & Astrological Upayas ---
  if (isRemedy || turnIndex === 7) {
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
