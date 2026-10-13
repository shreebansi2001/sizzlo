// ==============================================================
// Web Audio API: Zomato / Swiggy-Style Order Notification Chime
// ==============================================================
let sharedAudioCtx: AudioContext | null = null;

export const getUnlockedAudioContext = (): AudioContext | null => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (err) {
    console.warn('AudioContext init error:', err);
    return null;
  }
};

// Global unlock on any user gesture across the document
if (typeof window !== 'undefined') {
  const unlock = () => {
    try {
      const ctx = getUnlockedAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch (_) {}
  };
  ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(evt => {
    window.addEventListener(evt, unlock, { passive: true });
  });
}

export const playZomatoAlertSound = () => {
  try {
    const ctx = getUnlockedAudioContext();
    if (!ctx) return;

    const executeTones = (activeCtx: AudioContext) => {
      try {
        const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.6) => {
          const osc = activeCtx.createOscillator();
          const gain = activeCtx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(gainVal, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          osc.connect(gain);
          gain.connect(activeCtx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };

        const now = activeCtx.currentTime;
        // Signature Zomato / Swiggy restaurant order chime:
        // Chime 1: Rising 3-note arpeggio (D5 -> A5 -> D6)
        playTone(587.33, now, 0.15, 'sine', 0.65);
        playTone(880.00, now + 0.15, 0.15, 'sine', 0.7);
        playTone(1174.66, now + 0.30, 0.40, 'triangle', 0.8);

        // Chime 2 repeat (after 0.35s gap)
        playTone(587.33, now + 0.70, 0.15, 'sine', 0.65);
        playTone(880.00, now + 0.85, 0.15, 'sine', 0.7);
        playTone(1174.66, now + 1.00, 0.55, 'triangle', 0.85);
      } catch (err) {
        console.error('Tone generation error:', err);
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => executeTones(ctx)).catch(() => {});
    } else {
      executeTones(ctx);
    }
  } catch (err) {
    console.error('Audio alert playback error:', err);
  }
};
