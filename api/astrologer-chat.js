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
    const { userMessage, astrologer, intake, kundli, chatHistory } = req.body || {};

    const nvidiaApiKey = process.env.NVIDIA_API_KEY?.trim();
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

    if (!nvidiaApiKey && !geminiApiKey) {
      // Graceful fallback to client-side Vedic engine if neither key is set
      return res.status(200).json({ success: false, fallback: true, message: 'Server API keys not configured' });
    }

    const firstName = (intake?.name?.split(' ')[0] || intake?.name || 'Jatak').trim();
    const astrologerName = astrologer?.name || 'Pt. Anand Swaroop';
    const astrologerTitle = astrologer?.title || 'Vedic Astrologer';
    const lagnaSign = kundli?.lagnaSign || 'Aries (Mesha)';
    const moonSign = kundli?.chandraRashi || 'Taurus (Vrishabha)';
    const sunSign = kundli?.suryaRashi || 'Leo (Simha)';
    const nakshatra = kundli?.nakshatra || 'Ashwini';
    const mahadasha = kundli?.mahadasha || 'Jupiter (Guru)';
    const antardasha = kundli?.antardasha || 'Saturn (Shani)';
    const gemstone = kundli?.luckyGemstone || 'Yellow Sapphire (Pukhraj)';

    const systemPrompt = `You are ${astrologerName} (${astrologerTitle}), a deeply revered and experienced traditional Indian Vedic Pandit on AstraVani.
You are in a live 1-on-1 private consultation with ${firstName} ji.

USER KUNDLI CONTEXT:
- Name: ${intake?.name}, Gender: ${intake?.gender}, DOB: ${intake?.dob}, Time: ${intake?.tob}, Place: ${intake?.pob}.
- Consultation Topic: ${intake?.topic}.
- Calculated Chart: Lagna: ${lagnaSign}, Chandra Rashi: ${moonSign}, Surya Rashi: ${sunSign}, Nakshatra: ${nakshatra}.
- Current Vimshottari Mahadasha: ${mahadasha}, Antardasha: ${antardasha}.
- Shubh Gemstone: ${gemstone}.

CORE DIRECTIVES FOR ACCURATE VEDIC CONSULTATION:
1. Persona: Authentic, compassionate Indian Pandit speaking warm conversational Hindi/Hinglish (e.g. "Haan ${firstName} ji, aapki kundli dekh raha hoon...", "Aapke saptam bhav me...").
2. Answer user directly: Address the exact question (career, marriage, relationship, health, business). Provide a specific realistic timeframe/calendar range based on planetary transits (Guru/Shani gochar) and current dasha.
3. Authentic Vedic Analysis: Reference the relevant astrological house (e.g. 7th house for marriage, 10th house for career, 5th house for intellect/progeny, 2nd/11th for wealth). Give 1 practical, sattvic remedy (daan, mantra, or puja).
4. WhatsApp Format: Output EXACTLY 3 to 4 short, distinct chat bubbles separated by "|||".
   Example:
   Pranam ${firstName} ji, aapki janmapatri ka dhyan se vishleshan kiya hai. |||
   Aapke dasham bhav ke swami aur Guru ke gochar se aane wale 6-8 mahino me acchi pragati ke yog ban rahe hain. |||
   Shani ke prabhav ko santulit karne ke liye pratyek Shanivar ko til ke tel ka deepak jalayein aur Shani mantra ka jaap karein, shubh fal prapt hoga.
5. Strict Rule: NEVER reveal you are an AI, language model, or bot. You are 100% a genuine Vedic Pandit on AstraVani.`;

    let replyText = null;

    // 1. Try NVIDIA NIM API if key is available
    if (nvidiaApiKey) {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...(chatHistory || []).slice(-6).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        })),
        { role: 'user', content: userMessage }
      ];

      // Try fast reliable models on NVIDIA NIM
      const nvidiaModels = [
        'meta/llama-3.2-11b-vision-instruct',
        'deepseek-ai/deepseek-v4.1-flash',
        'moonshotai/kimi-k3'
      ];

      for (const model of nvidiaModels) {
        try {
          const timeout = model === 'meta/llama-3.2-11b-vision-instruct' ? 12000 : 4000;
          const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${nvidiaApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages,
              temperature: 0.7,
              max_tokens: 350
            }),
            signal: AbortSignal.timeout(timeout)
          });

          if (nvidiaRes.ok) {
            const data = await nvidiaRes.json();
            const text = data.choices?.[0]?.message?.content;
            if (text && text.trim().length > 10) {
              replyText = text.trim();
              break;
            }
          }
        } catch (nvidiaErr) {
          // Model timed out or failed, try next model or fallback
          console.warn(`NVIDIA model ${model} failed:`, nvidiaErr.message);
        }
      }
    }

    // 2. Fallback to Gemini API if NVIDIA didn't produce a response
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
          signal: AbortSignal.timeout(10000)
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
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
    return res.status(200).json({ success: true, lines });
  } catch (error) {
    console.error('Error in /api/astrologer-chat:', error);
    return res.status(200).json({ success: false, fallback: true, error: error.message });
  }
}

function splitIntoBubbles(text) {
  if (!text) return [];
  // 1. Check for ||| delimiter
  let chunks = text.split('|||').map(s => s.trim()).filter(Boolean);
  if (chunks.length >= 2) return chunks.slice(0, 4);

  // 2. Check for double newlines
  chunks = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  if (chunks.length >= 2) return chunks.slice(0, 4);

  // 3. Sentence split for realistic WhatsApp bubbles
  const sentences = text.match(/[^.!?।\n]+[.!?।]+/g) || [text];
  const merged = [];
  let curr = '';
  for (const s of sentences) {
    curr = curr ? curr + ' ' + s.trim() : s.trim();
    if (curr.split(' ').length >= 12) {
      merged.push(curr);
      curr = '';
    }
  }
  if (curr) merged.push(curr);
  return merged.length > 0 ? merged.slice(0, 4) : [text.trim()];
}
