// AstraVani Authentic Pandit Audio Blessing & Voice Preview
// Synthesizes sacred temple bell chime followed by Pandit Ji's opening Sanskrit Mangal Shloka

let currentUtterance: SpeechSynthesisUtterance | null = null;
let audioCtx: AudioContext | null = null;

export function playTempleBell(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();

    const now = audioCtx.currentTime;

    // Harmonic bell frequencies (528Hz Solfeggio Love tone + 792Hz harmonic)
    [528, 792, 1056].forEach((freq, idx) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15 / (idx + 1), now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 2.3);
    });
  } catch (err) {
    console.warn('Audio Context bell failed:', err);
  }
}

export function playPanditVoiceSample(
  panditName: string,
  blessingText?: string,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  // Stop any ongoing speech
  stopPanditVoice();

  // Play bell chime
  playTempleBell();

  const defaultBlessing = `ॐ स्वस्ति न इन्द्रो वृद्धश्रवाः। कल्याणमस्तु। मैं ${panditName}, अष्टम-दशम भाव और जन्म कुंडली के सूक्ष्म विश्लेषण द्वारा आपका मार्ग प्रशस्त करूँगा। हर हर महादेव!`;
  const textToSpeak = blessingText || defaultBlessing;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  currentUtterance = utterance;

  // Find Hindi or Indian English voice
  const voices = window.speechSynthesis.getVoices();
  const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi') || v.lang.includes('IN'));
  if (hindiVoice) {
    utterance.voice = hindiVoice;
  }

  utterance.rate = 0.88; // Reverent, deliberate Pandit pace
  utterance.pitch = 0.95; // Warm, mature baritone tone

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopPanditVoice(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isPanditVoicePlaying(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
