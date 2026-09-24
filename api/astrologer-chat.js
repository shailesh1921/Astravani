export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userMessage, astrologer, intake, kundli, chatHistory, language } = req.body || {};

    const diffGemmaKey = process.env.NVIDIA_DIFFUSIONGEMMA_API_KEY?.trim();
    const multiLangKey = process.env.NVIDIA_MULTILINGUAL_API_KEY?.trim();
    const nvidiaKey = process.env.NVIDIA_API_KEY?.trim();
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

    if (!diffGemmaKey && !multiLangKey && !nvidiaKey && !geminiApiKey) {
      // Graceful fallback to client-side Vedic engine if no server keys are set
      return res.status(200).json({ success: false, fallback: true, message: 'Server API keys not configured' });
    }

    const firstName = (intake?.name?.split(' ')[0] || intake?.name || 'Jatak').trim();
    const astrologerName = astrologer?.name || 'Pt. Anand Swaroop';
    const astrologerTitle = astrologer?.title || 'Vedic Astrologer';
    const astrologerLangs = (astrologer?.languages || ['Hindi', 'English']).join(', ');
    const lagnaSign = kundli?.lagnaSign || 'Aries (Mesha)';
    const moonSign = kundli?.chandraRashi || 'Taurus (Vrishabha)';
    const sunSign = kundli?.suryaRashi || 'Leo (Simha)';
    const nakshatra = kundli?.nakshatra || 'Ashwini';
    const mahadasha = kundli?.mahadasha || 'Jupiter (Guru)';
    const antardasha = kundli?.antardasha || 'Saturn (Shani)';
    const gemstone = kundli?.luckyGemstone || 'Yellow Sapphire (Pukhraj)';

    const now = new Date();
    const currentYear = now.getFullYear(); // e.g. 2026
    const nextYear = currentYear + 1; // 2027
    const futureYear = currentYear + 2; // 2028
    const currentDateStr = now.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });

    const systemPrompt = `You are ${astrologerName} (${astrologerTitle}), a deeply revered traditional Indian Vedic Pandit on AstraVani.
Fluent in: ${astrologerLangs}. You are in a live 1-on-1 private consultation with ${firstName} ji.

USER KUNDLI CONTEXT:
- Name: ${intake?.name}, Gender: ${intake?.gender}, DOB: ${intake?.dob}, Time: ${intake?.tob}, Place: ${intake?.pob}.
- Consultation Topic: ${intake?.topic || 'General Guidance'}.
- Calculated Chart: Lagna: ${lagnaSign}, Chandra Rashi: ${moonSign}, Surya Rashi: ${sunSign}, Nakshatra: ${nakshatra}.
- Current Vimshottari Mahadasha: ${mahadasha}, Antardasha: ${antardasha}.
- Shubh Gemstone: ${gemstone}.

CRITICAL GROUND-TRUTH CALENDAR DIRECTIVE:
- TODAY'S REAL CALENDAR DATE IS: ${currentDateStr} (Year: ${currentYear}).
- ANY FUTURE PREDICTION MUST STRICTLY BE FOR LATE ${currentYear}, ${nextYear}, or ${futureYear} (e.g. "aane wale 6-8 mahino me (early ${nextYear})", "late ${currentYear} se ${nextYear} ke madhya tak").
- ABSOLUTELY FORBIDDEN: NEVER mention 2023, 2024, or 2025 as the future! Mentioning 2024 or 2025 as future destroys client trust.

CORE DIRECTIVES FOR ACCURATE VEDIC CONSULTATION:
1. Language & Persona: Authentic, compassionate Indian Pandit speaking warm conversational Hindi/Hinglish (or the user's language if they ask in Tamil, Telugu, Gujarati, Bengali, Marathi, or English). Address them respectfully as "${firstName} ji".
2. Direct Answer & Realistic Timeline: Answer the specific question directly (career, job, marriage, business, finances, health). State a clear, realistic timeframe (e.g., "aane wale 6-8 mahino me (early ${nextYear})", "late ${currentYear} se ${nextYear} tak") based on planetary transits (Guru/Shani gochar) and current dasha.
3. Authentic Vedic Analysis: Reference the relevant astrological house (e.g. 7th house for marriage, 10th house for career, 5th house for intellect/education, 2nd/11th for wealth). Give 1 practical, sattvic Vedic remedy (daan, mantra, or puja).
4. WhatsApp Format: Output EXACTLY 3 to 4 short, distinct chat bubbles separated by "|||".
   Example:
   Pranam ${firstName} ji, aapki janmapatri ka dhyan se vishleshan kiya hai. |||
   Aapke dasham bhav ke swami aur Guru ke gochar se aane wale 6-8 mahino me (${nextYear} ke prarambh me) acchi pragati ke yog ban rahe hain. |||
   Shani ke prabhav ko santulit karne ke liye pratyek Shanivar ko til ke tel ka deepak jalayein aur Shani mantra ka jaap karein, shubh fal prapt hoga.
5. Strict Rule: NEVER reveal you are an AI, language model, or bot. You are 100% a genuine Vedic Pandit on AstraVani.`;


    // Multi-key, multi-model failover cascade
    const cascade = [
      // 1. Google DiffusionGemma (High-Accuracy Astrologer)
      {
        name: 'diffusiongemma',
        key: diffGemmaKey || nvidiaKey,
        model: 'google/diffusiongemma-26b-a4b-it',
        timeout: 5000
      },
      // 2. Meta LLaMA 3.2 11B (Ultra-fast ~800ms)
      {
        name: 'llama-3.2-11b',
        key: nvidiaKey || multiLangKey || diffGemmaKey,
        model: 'meta/llama-3.2-11b-vision-instruct',
        timeout: 6000
      },
      // 3. Multilingual Model (Regional languages)
      {
        name: 'multilingual-llama',
        key: multiLangKey || nvidiaKey,
        model: 'meta/llama-3.2-11b-vision-instruct',
        timeout: 6000
      },
      // 4. DeepSeek Flash (fast probe)
      {
        name: 'deepseek-flash',
        key: nvidiaKey,
        model: 'deepseek-ai/deepseek-v4.1-flash',
        timeout: 3000
      },
      // 5. Moonshot Kimi K3 (fast probe)
      {
        name: 'kimi-k3',
        key: nvidiaKey,
        model: 'moonshotai/kimi-k3',
        timeout: 3000
      }
    ].filter(item => Boolean(item.key));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      })),
      { role: 'user', content: userMessage }
    ];

    let replyText = null;
    let modelUsed = null;

    // Execute cascade across all NVIDIA NIM keys & models
    for (const c of cascade) {
      try {
        const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${c.key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: c.model,
            messages,
            temperature: 0.7,
            max_tokens: 350
          }),
          signal: AbortSignal.timeout(c.timeout)
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content && content.length > 10) {
            replyText = content;
            modelUsed = c.name;
            break;
          }
        } else {
          console.warn(`Cascade step ${c.name} failed with HTTP ${res.status}`);
        }
      } catch (err) {
        console.warn(`Cascade step ${c.name} skipped:`, err.message);
      }
    }

    // Fallback to Gemini 2.0 Flash if all NVIDIA models failed
    if (!replyText && geminiApiKey) {
      try {
        const contents = [
          { role: 'user', parts: [{ text: `System Instructions:\n${systemPrompt}` }] },
          { role: 'model', parts: [{ text: `Pranam. I understand completely. I will reply as ${astrologerName} with 3-4 natural conversational bubbles separated by |||.` }] },
          ...(chatHistory || []).slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ];

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              maxOutputTokens: 350,
              temperature: 0.75
            }
          }),
          signal: AbortSignal.timeout(6000)
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          modelUsed = 'gemini-2.0-flash';
        }
      } catch (geminiErr) {
        console.warn('Gemini API fallback error:', geminiErr.message);
      }
    }

    if (!replyText) {
      return res.status(200).json({ success: false, fallback: true, message: 'All AI models timed out or failed' });
    }

    // Parse into distinct WhatsApp bubbles
    const lines = splitIntoBubbles(replyText);
    return res.status(200).json({ success: true, lines, modelUsed });
  } catch (error) {
    console.error('Error in /api/astrologer-chat:', error);
    return res.status(200).json({ success: false, fallback: true, error: error.message });
  }
}

function sanitizeYears(str, curYear = 2026) {
  if (!str) return str;
  const nxt = curYear + 1;
  return str
    .replace(/\b2024\b/g, `${curYear}`)
    .replace(/\b2025\b/g, `${nxt}`);
}

function splitIntoBubbles(text) {
  if (!text) return [];
  const curYear = new Date().getFullYear();
  const cleanText = sanitizeYears(text, curYear);

  // 1. Check for ||| delimiter
  let chunks = cleanText.split('|||').map(s => sanitizeYears(s.trim(), curYear)).filter(Boolean);
  if (chunks.length >= 2) return chunks.slice(0, 4);

  // 2. Check for double newlines
  chunks = cleanText.split(/\n\s*\n/).map(s => sanitizeYears(s.trim(), curYear)).filter(Boolean);
  if (chunks.length >= 2) return chunks.slice(0, 4);

  // 3. Sentence split for realistic WhatsApp bubbles
  const sentences = cleanText.match(/[^.!?।\n]+[.!?।]+/g) || [cleanText];
  const merged = [];
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

