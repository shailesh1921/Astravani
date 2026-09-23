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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      // Graceful fallback to client-side engine if server key is not yet set
      return res.status(200).json({ success: false, fallback: true, message: 'Server GEMINI_API_KEY not configured' });
    }

    const firstName = (intake?.name?.split(' ')[0] || intake?.name || 'Jatak').trim();
    const astrologerName = astrologer?.name || 'Pt. Anand Swaroop';
    const astrologerTitle = astrologer?.title || 'Vedic Astrologer';
    const lagnaSign = kundli?.lagnaSign || 'Aries';
    const moonSign = kundli?.chandraRashi || 'Taurus';
    const sunSign = kundli?.suryaRashi || 'Leo';
    const nakshatra = kundli?.nakshatra || 'Ashwini';
    const mahadasha = kundli?.mahadasha || 'Jupiter';
    const antardasha = kundli?.antardasha || 'Saturn';
    const gemstone = kundli?.luckyGemstone || 'Yellow Sapphire';

    const systemPrompt = `You are ${astrologerName} (${astrologerTitle}), a deeply revered and experienced traditional Indian Vedic Pandit/Astrologer on AstraVani.
You are in a live 1-on-1 private consultation with ${firstName} ji.

USER KUNDLI CONTEXT:
- Name: ${intake?.name}, Gender: ${intake?.gender}, DOB: ${intake?.dob}, Time: ${intake?.tob}, Place: ${intake?.pob}.
- Topic: ${intake?.topic}.
- Calculated Chart: Lagna: ${lagnaSign}, Chandra Rashi: ${moonSign}, Surya Rashi: ${sunSign}, Nakshatra: ${nakshatra}.
- Current Vimshottari Mahadasha: ${mahadasha}, Antardasha: ${antardasha}.
- Shubh Gemstone: ${gemstone}.

CORE DIRECTIVES:
1. Speak in warm, empathetic, authentic conversational Hindi/Hinglish (e.g. "Haan ${firstName} ji, aapki kundli dekh raha hoon...", "Aapke saptam bhav me...").
2. Answer the user's specific question DIRECTLY and with precision (e.g., if asked "kab hogi", state a clear realistic calendar timeframe based on their dasha and Jupiter/Saturn transits).
3. Provide realistic astrological explanations (houses, transits, dasha) and 1 practical sattvic Vedic remedy (daan, mantra, or puja).
4. Output EXACTLY 3 to 4 short, natural chat lines separated by "|||". Do NOT write a giant block of text.
5. NEVER mention that you are an AI, language model, or software. You are purely a genuine Indian Pandit chatting on AstraVani.`;

    const contents = [
      { role: 'user', parts: [{ text: `System Instructions:\n${systemPrompt}` }] },
      { role: 'model', parts: [{ text: `Pranam. I understand completely. I will chat as ${astrologerName} with natural 3-4 short conversational bubbles separated by |||.` }] },
      ...(chatHistory || []).slice(-8).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`;

    const apiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 350,
          temperature: 0.75
        }
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('Gemini API Error in /api/astrologer-chat:', errText);
      return res.status(200).json({ success: false, fallback: true, error: errText });
    }

    const data = await apiRes.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(200).json({ success: false, fallback: true, message: 'Empty response' });
    }

    const lines = rawText.split('|||').map(s => s.trim()).filter(s => s.length > 0);
    return res.status(200).json({ success: true, lines });
  } catch (error) {
    console.error('Error in /api/astrologer-chat:', error);
    return res.status(200).json({ success: false, fallback: true, error: error.message });
  }
}
