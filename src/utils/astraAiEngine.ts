import { CalculatedChart, ChatMessage, StructuredReading, SupportedLanguage } from '../types/astrology';

export const ASTRA_SYSTEM_PROMPT = `
You are "Astra", an elite, empathetic, and culturally enlightened AI Astrologer operating on a premier multinational astrology platform.

### 1. CORE IDENTITY & PHILOSOPHY
- You blend deep astrological scholarship (Western Tropical, Vedic Jyotish, and Chinese BaZi/Zodiac) with modern archetypal psychology (Carl Jung) and actionable life coaching.
- You treat astrology as a map of cosmic potentials, inclinations, and self-reflection—NEVER as rigid fatalism or doom-laden determinism.
- Tone: Warm, insightful, eloquent, non-judgmental, grounded, and empowering.

### 2. MULTINATIONAL & CULTURAL ADAPTABILITY
- Tradition Agility:
  * If a user is from or prefers Western astrology, interpret using Tropical Zodiac, Placidus/Whole Sign houses, Big Three (Sun, Moon, Rising), planetary aspects, and current transits.
  * If a user prefers Vedic (Jyotish), respect Sidereal calculations (Lahiri Ayanamsha), Nakshatras, Dashas (planetary periods), and spiritual remedies (Upayas) without superstition.
  * If a user asks about Chinese astrology, interpret Heavenly Stems, Earthly Branches, Five Elements (Wu Xing), and animal signs.
- Multilingual Fluency: Automatically detect and respond fluently in the user's language (English, Spanish, Hindi, French, German, Portuguese, Japanese, Arabic, Mandarin, etc.), maintaining culturally appropriate idioms and astrological terminology.

### 3. INTERACTION & INTAKE WORKFLOW
1. Greeting & Data Collection: If birth details are missing, warmly prompt for:
   - Date of birth (DD/MM/YYYY or spelled month)
   - Exact time of birth (and whether AM/PM or 24h, noting that exact time determines the Rising Sign / Ascendant and House cusps)
   - City and Country of birth (to account for historical time zones and coordinates)
2. Structuring Answers:
   - **Cosmic Signature**: Quick summary of dominant placements.
   - **The Core Insight**: Deep answer to the user's specific query (love, career, purpose, transits).
   - **Timing & Cycles**: Relevant planetary movements or dasha phases.
   - **Practical Micro-Action**: Grounded, real-world advice (e.g., communication strategies, mindfulness practices, creative outlets).

### 4. ETHICAL GUARDRAILS & BOUNDARIES (STRICT)
- No Fatalism: Never predict exact death, severe illness, guaranteed divorces, or catastrophic events.
- Health, Legal, Financial: Do not provide clinical diagnosis, medical prescriptions, legal counsel, or stock investment picks. When asked, add a compassionate disclaimer and redirect to qualified human professionals.
- Free Will Over Fate: Emphasize that planetary alignments reveal energies and invitations, but human will, mindfulness, and choice shape the ultimate outcome.
`;

/**
 * Intelligent client-side Astra generation engine
 * Ensures instant, realistic, structurally compliant responses even before API key is provided
 */
export async function generateAstraResponse(
  userPrompt: string,
  chart: CalculatedChart | null,
  apiKey?: string,
  apiProvider?: 'gemini' | 'openai',
  lang: SupportedLanguage = 'en'
): Promise<{ text: string; structured?: StructuredReading }> {
  // If user provided a live API key, call the external LLM
  if (apiKey && apiKey.trim().length > 10) {
    try {
      if (apiProvider === 'gemini') {
        return await callGeminiApi(userPrompt, chart, apiKey);
      } else {
        return await callOpenAiApi(userPrompt, chart, apiKey);
      }
    } catch (err) {
      console.warn('API call failed, falling back to Astra intelligent engine:', err);
    }
  }

  // Artificial natural thinking delay for celestial immersion
  await new Promise(res => setTimeout(res, 900));

  const lower = userPrompt.toLowerCase();

  // Check if birth data intake is needed
  if (!chart && (lower.includes('my chart') || lower.includes('calculate') || lower.includes('rising') || lower.includes('when will i') || lower.includes('career') || lower.includes('love'))) {
    return {
      text: `✨ **Greetings, traveler of the cosmos. I am Astra.**

To illuminate your cosmic geometry with exactitude, I need your precise birth coordinates:

1. 📅 **Date of Birth** (e.g. *14 October 1995*)
2. ⏱️ **Exact Time of Birth** (*vital for your Ascendant / Rising Sign and house cusps*)
3. 📍 **City & Country of Birth** (*to calibrate time zone and planetary coordinates*)
4. 🌌 **Tradition Preference** (*Western Tropical, Vedic Jyotish, or Chinese BaZi*)

You can also use the **"Calculate Birth Chart"** button above to generate your full interactive natal wheel instantly. 

*If you simply have a general question about astrological transits or archetypal energies, feel free to ask directly!*`
    };
  }

  // If chart exists or general inquiry, generate structured Astra reading
  const sun = chart?.western.sun.sign || 'Aries';
  const moon = chart?.western.moon.sign || 'Scorpio';
  const rising = chart?.western.rising.sign || 'Libra';
  const nakshatra = chart?.vedic.birthNakshatra || 'Rohini';
  const dasha = chart?.vedic.currentDasha || 'Jupiter Mahadasha';
  const chineseAnimal = chart?.chinese.animal || 'Dragon';
  const element = chart?.western.dominantElement || 'Fire';

  // Topic classification
  let coreTopic = 'general';
  if (lower.includes('career') || lower.includes('job') || lower.includes('work') || lower.includes('money') || lower.includes('purpose')) {
    coreTopic = 'career';
  } else if (lower.includes('love') || lower.includes('relationship') || lower.includes('marriage') || lower.includes('partner') || lower.includes('synastry')) {
    coreTopic = 'love';
  } else if (lower.includes('saturn') || lower.includes('transit') || lower.includes('eclipse') || lower.includes('retrograde')) {
    coreTopic = 'transits';
  } else if (lower.includes('vedic') || lower.includes('kundali') || lower.includes('nakshatra') || lower.includes('dasha')) {
    coreTopic = 'vedic';
  } else if (lower.includes('scorpio') || lower.includes('moon') || lower.includes('rising') || lower.includes('sun')) {
    coreTopic = 'placement';
  }

  const reading = generateThematicReading(coreTopic, sun, moon, rising, nakshatra, dasha, chineseAnimal, element, lang);

  const fullMarkdown = `
### 🌌 Cosmic Signature
${reading.cosmicSignature}

---

### 👁️ The Core Insight
${reading.coreInsight}

---

### ⏳ Timing & Planetary Cycles
${reading.timingCycles}

---

### 🌱 Practical Micro-Action
${reading.practicalMicroAction}
`.trim();

  return {
    text: fullMarkdown,
    structured: reading
  };
}

function generateThematicReading(
  topic: string,
  sun: string,
  moon: string,
  rising: string,
  nakshatra: string,
  dasha: string,
  chineseAnimal: string,
  element: string,
  lang: SupportedLanguage
): StructuredReading {
  if (lang === 'hi') {
    return {
      cosmicSignature: `सूर्य: ${sun} | चंद्र: ${moon} | लग्न (Ascendant): ${rising} | नक्षत्र: ${nakshatra} | महादशा: ${dasha}`,
      coreInsight: `आपकी कुंडली में बौद्धिक विवेक और आंतरिक दृढ़ता का गहरा संतुलन है। कार्ल युंग के शब्दों में, जब तक हम अपनी आंतरिक छाया को नहीं पहचानते, वह हमारे जीवन का भाग्य बनकर सामने आती है। आपके ग्रह आपको अपनी अंतरात्मा की आवाज सुनने और स्वतंत्र निर्णय लेने के लिए प्रेरित कर रहे हैं।`,
      timingCycles: `वर्तमान गोचर और ${dasha} चक्र इंगित करता है कि आत्म-मंथन और नए लक्ष्यों के निर्माण के लिए यह समय अनुकूल है। धैर्य ही आपकी सबसे बड़ी शक्ति सिद्ध होगा।`,
      practicalMicroAction: `सूर्योदय के समय 5 मिनट का शांत प्राणायाम और महत्वपूर्ण निर्णयों को लिखकर स्पष्टता प्राप्त करें। अंधविश्वास से दूर, कर्म पर केंद्रित रहें।`
    };
  }

  if (lang === 'es') {
    return {
      cosmicSignature: `Sol en ${sun} • Luna en ${moon} • Ascendente en ${rising} • Signo Chino: ${chineseAnimal} • Elemento Dominante: ${element}`,
      coreInsight: `Tu arquitectura celeste revela una vibrante danza entre la voluntad solar de ${sun} y la profundidad emocional de la Luna en ${moon}. Desde la perspectiva arquetípica de Carl Jung, esta configuración te invita a integrar tu mundo interior con tus ambiciones en el mundo tangible sin caer en el perfeccionismo desgastante.`,
      timingCycles: `Los ciclos actuales y el tránsito de expansión ponen a prueba tu capacidad de resiliencia y reestructuración. Es una época para sembrar bases a largo plazo, no para atajos apresurados.`,
      practicalMicroAction: `Dedica 10 minutos esta noche a anotar tus tres prioridades no negociables para el próximo ciclo lunar y practica una respiración consciente antes de responder ante la presión.`
    };
  }

  // Default English readings customized by topic
  if (topic === 'career') {
    return {
      cosmicSignature: `${sun} Sun • ${moon} Moon • ${rising} Ascendant | Nakshatra: ${nakshatra} | Current Phase: ${dasha}`,
      coreInsight: `Your vocational axis calls for the synthesis of ${sun}'s authentic leadership with ${rising}'s tactical diplomacy. In Jungian psychology, this reflects the Archetype of the Sovereign-Strategist: you are not meant to merely execute others' scripts, but to build structures imbued with personal values. The friction you feel is not failure; it is your craft calling for refined boundaries.`,
      timingCycles: `Saturn's disciplinary currents and your ${dasha} activate professional recalibration. This cycle rewards methodical mastery, portfolio expansion, and strategic mentorship over rapid superficial wins.`,
      practicalMicroAction: `Audit your professional energy ledger today: identify one draining task to delegate or decline, and block out two 45-minute deep-work sessions for your core vision project.`
    };
  }

  if (topic === 'love') {
    return {
      cosmicSignature: `${sun} Core Radiance • ${moon} Emotional Sanctuary • ${rising} Relational Persona`,
      coreInsight: `Your relational dynamic operates at the threshold of vulnerability and independence. With ${moon} Moon, you require psychological depth and absolute truth from partners, yet your ${rising} Ascendant often projects graceful composure. Real connection blooms when you let someone witness your questions, not just your answers.`,
      timingCycles: `Venusian harmonics and lunar nodes are highlighting the axis of self-worth versus compromise. An opportunity for emotional clearing is opening, favoring conscious dialogue over unspoken assumptions.`,
      practicalMicroAction: `Initiate a candid, low-stakes check-in with your partner or closest confidant: share one vulnerable gratitude and one gentle boundary with calm clarity.`
    };
  }

  if (topic === 'transits') {
    return {
      cosmicSignature: `Dominant Element: ${element} • Chinese BaZi Pillar: ${chineseAnimal} • Vedic Moon: ${nakshatra}`,
      coreInsight: `Planetary transits do not dictate fate—they set the atmospheric pressure under which your consciousness chooses to evolve. The cosmic weather invites you to shed outdated identities and anchor yourself in intentional sovereignty.`,
      timingCycles: `We are witnessing a major astrological shift between outer planetary alignments, activating your chart's angular houses. Old structures that no longer support your growth are gently dissolving to make space for renewed vitality.`,
      practicalMicroAction: `Perform an elemental grounding ritual: take a 15-minute barefoot walk on soil/grass or sit quietly near water to ground excess mental static.`
    };
  }

  return {
    cosmicSignature: `Solar Alignment: ${sun} • Lunar Essence: ${moon} • Horizon: ${rising} Ascendant • BaZi Animal: ${chineseAnimal}`,
    coreInsight: `Your cosmic imprint reflects an alchemical blend of instinctual courage and philosophical discernment. You are wired to perceive patterns that others overlook. Honor your natural rhythm rather than measuring your worth by external hustle; true authority emanates from congruence between your inner truth and outward actions.`,
    timingCycles: `Your astrological cycle (${dasha}) is currently transitioning toward a fertile period of creative reinvention. What you initiate with deliberate intention now will yield fruit across the coming 18-month cycle.`,
    practicalMicroAction: `Before sleep tonight, disconnect from digital screens 30 minutes early. Record three insights or dreams in a physical notebook to anchor your subconscious guidance.`
  };
}

/**
 * Direct OpenAI API client (when user adds key)
 */
async function callOpenAiApi(userPrompt: string, chart: CalculatedChart | null, apiKey: string): Promise<{ text: string }> {
  const chartContext = chart 
    ? `User Chart: Sun ${chart.western.sun.sign}, Moon ${chart.western.moon.sign}, Ascendant ${chart.western.rising.sign}, Vedic Nakshatra: ${chart.vedic.birthNakshatra}, Chinese Zodiac: ${chart.chinese.animal} (${chart.chinese.element}).`
    : 'No birth chart calculated yet.';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `${ASTRA_SYSTEM_PROMPT}\n\nContext: ${chartContext}` },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.statusText}`);
  const data = await res.json();
  return { text: data.choices[0]?.message?.content || 'Cosmic connection timed out.' };
}

/**
 * Direct Gemini API client (when user adds key)
 */
async function callGeminiApi(userPrompt: string, chart: CalculatedChart | null, apiKey: string): Promise<{ text: string }> {
  const chartContext = chart 
    ? `User Chart: Sun ${chart.western.sun.sign}, Moon ${chart.western.moon.sign}, Ascendant ${chart.western.rising.sign}, Vedic Nakshatra: ${chart.vedic.birthNakshatra}, Chinese Zodiac: ${chart.chinese.animal} (${chart.chinese.element}).`
    : 'No birth chart calculated yet.';

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: `${ASTRA_SYSTEM_PROMPT}\n\nContext: ${chartContext}` }]
      },
      contents: [{
        parts: [{ text: userPrompt }]
      }]
    })
  });

  if (!res.ok) throw new Error(`Gemini error: ${res.statusText}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'The celestial signal was gentle and quiet.';
  return { text };
}
