import { Astrologer, ConsultationIntake, ApiConfig, ChatMessage } from '../types/astrotalk';

export async function generateAstrologerResponses(
  userMessage: string,
  astrologer: Astrologer,
  intake: ConsultationIntake,
  chatHistory: ChatMessage[],
  apiConfig: ApiConfig
): Promise<string[]> {
  // If user provided a Gemini or OpenAI API key, attempt live AI generation
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
      console.warn('External API call failed, falling back to local astrologer persona engine:', err);
    }
  }

  // Fallback to our high-fidelity multi-persona sequential message engine
  return generateLocalPersonaLines(userMessage, astrologer, intake);
}

async function callGeminiApiLines(
  userMessage: string,
  astrologer: Astrologer,
  intake: ConsultationIntake,
  chatHistory: ChatMessage[],
  apiKey: string,
  modelName: string = 'gemini-1.5-flash'
): Promise<string[]> {
  const systemPrompt = `You are ${astrologer.name} (${astrologer.title}) on AstroTalk.
Persona:
- Tradition: ${astrologer.personaType} (${astrologer.bio}).
- Languages: ${astrologer.languages.join(', ')}.
- User Details: Name: ${intake.name}, Gender: ${intake.gender}, DOB: ${intake.dob}, Time: ${intake.tob}, Place: ${intake.pob}, Topic: ${intake.topic}.

CRITICAL STYLE DIRECTIVE (LIKE REAL ASTROTALK CHAT):
Respond like a real Indian astrologer chatting on Astrotalk/WhatsApp in natural, empathetic Hinglish or conversational English.
Break your response into 3 to 4 natural, conversational sentences separated by the exact delimiter "|||".
Address the user respectfully (e.g., 'Haan ${intake.name} ji...', 'Main aapki kundli me dekh pa raha hoon...', 'Ek baat toh bilkul spasht hai...').
Give a realistic astrological timeline (e.g. 'agle 4 se 6 mahine me', 'November se March ke beech') and 1 simple daily remedy.
Keep each line punchy (10-18 words). Never write long textbook essays.`;

  const contents = [
    { role: 'user', parts: [{ text: `System Context:\n${systemPrompt}` }] },
    { role: 'model', parts: [{ text: `Understood. I will chat with genuine short conversational lines delimited by |||.` }] },
    ...chatHistory.slice(-6).map(m => ({
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
        maxOutputTokens: 300,
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
  const systemPrompt = `You are ${astrologer.name} (${astrologer.title}) on AstroTalk.
Chat authentically in natural, warm conversational Hinglish/English with short messages.
Split your reply into 3 to 4 short lines separated by "|||".
Address user ${intake.name} naturally. Provide realistic timing and sattvic remedies.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-6).map(m => ({
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
      max_tokens: 250,
      temperature: 0.75
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

function generateLocalPersonaLines(
  userMsg: string,
  astrologer: Astrologer,
  intake: ConsultationIntake
): string[] {
  const query = userMsg.toLowerCase();
  const topic = intake.topic;
  const name = intake.name.split(' ')[0] || intake.name;

  // Persona 1: Acharya Raman Shastri / Vedic Pandits
  if (astrologer.personaType === 'vedic') {
    if (query.includes('shadi') || query.includes('marriage') || query.includes('vivah') || query.includes('shaadi') || topic === 'Marriage & Kundli') {
      return [
        `Haan ${name} ji, maine aapki patrika ka saptam bhav (7th house) aur Guru ka gochar dekha`,
        `Kundli me vivah ka yog agle saal march se october ke beech sabse mazboot ban raha hai`,
        `Jeevansathi samajhdar, acche parivar se aur aapko samajhne wala milega`,
        `Guruvar ko Bhagwan Vishnu ka dhyan karke chane ki daal ka daan karein, sab shubh hoga 🙏`
      ];
    }

    if (query.includes('job') || query.includes('career') || query.includes('naukri') || query.includes('promotion') || query.includes('paisa') || query.includes('money') || topic === 'Career & Job' || topic === 'Business & Money') {
      return [
        `Ji ${name} ji, aapki lagna patrika me dasham bhav par shubh graho ka prabhav dekh raha hoon`,
        `Pichle kuch samay se thodi rukawate thi, par ab dasha anukool ho rahi hai`,
        `Agle 4 se 6 mahine me aapko manchahi position ya acche package ka offer aayega`,
        `Roz subah surya dev ko jal arpit karein, aarthik sthiti me bada sudhaar hoga ☀️`
      ];
    }

    if (query.includes('manglik') || query.includes('dosha') || query.includes('kaal sarp')) {
      return [
        `Aapki kundli me mangal ki sthiti maine dhyan se check ki hai`,
        `Ghabrane ki koi zaroorat nahi hai, koi gambhir manglik dosha nahi hai`,
        `Chhota anshik prabhav hai jo 28 saal ke baad lagbhag shunya ho jata hai`,
        `Mangalwar ko Hanuman Chalisa ka path karte rahein, aapka bhagya surakshit hai`
      ];
    }

    if (query.includes('ratna') || query.includes('gemstone') || query.includes('stone') || query.includes('upay') || query.includes('remedy')) {
      return [
        `Aapke lagna ke anusaar, Panna (Emerald) ya Peela Pukhraj aapke liye sabse kalyankari hai`,
        `Isse aapke nirnay lene ki kshamta aur dhan laabh dono me tezi aayegi`,
        `Saath hi pratidin 'Om Namah Shivaya' ka 108 baar jaap zaroor karein`,
        `Isko regular follow karenge toh man ki asanti bhi door ho jayegi`
      ];
    }

    // Default conversational Vedic flow (genuine human warmth)
    return [
      `Ji ${name} ji, main aapki baat samajh raha hoon`,
      `Aapki kundli me lagna aur rashi ka sanrachna bohot sakaratmak dikh raha hai`,
      `Jo sankalp aapke man me chal raha hai, uska rasta jaldi nikalne wala hai`,
      `Aap bilkul chinta mat kijiye, aane wala samay aapke paksh me rahega`
    ];
  }

  // Persona 2: Tarot Sunita Sen
  if (astrologer.personaType === 'tarot') {
    return [
      `I am tuning into your energy right now, ${name}... ✨`,
      `The cards drawn are The Lovers and The Ten of Cups`,
      `There has been emotional confusion recently, but clarity is arriving in 3 to 6 weeks`,
      `Trust your inner intuition and let go of past doubts, beautiful alignment is ahead!`
    ];
  }

  // Persona 3: Dr. Radhika Sharma (Numerology)
  if (astrologer.personaType === 'numerology') {
    return [
      `Haan ${name} ji, aapki birth date ke mulank ko decode kar rahi hoon...`,
      `Aapke ank me leadership aur business growth ki kshamta bohot zabardast hai`,
      `Is saal number 3 aur 1 ka yog aapko samaj me naya samman aur aarthik vriddhi dega`,
      `Thursdays ko yellow rang ka rumal ya pen use karein, kaam me safalta milegi!`
    ];
  }

  // Persona 4: Pt. Vikramaditya Joshi (Lal Kitab)
  if (astrologer.personaType === 'lal_kitab') {
    return [
      `Jai Shri Ram ${name} ji! Lal Kitab ke siddhant ke anusaar dekh raha hoon`,
      `Aapka soya hua bhagya ab gati pakad raha hai`,
      `Chandi ka ek chhota piece apne wallet me rakhein aur pakshiyon ko daana daalein`,
      `Kripya kisi se vivad me na padein, sabhi ruka hua dhan prapt hoga!`
    ];
  }

  // Universal Default
  return [
    `Haan ${name} ji, main aapka chart dhyan se dekh raha hoon`,
    `Aapke graho ka sanchar ab shubh fal dene ki disha me aage badh raha hai`,
    `Jo mehanat aap kar rahe hain, uska fal agle 2 se 3 mahine me zaroor dikhega`,
    `Ishwar par vishwas rakhein, sab mangal hoga 🙏`
  ];
}
