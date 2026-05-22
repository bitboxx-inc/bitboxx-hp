// Tiny Web Audio toolkit for the hero mini-game. No external library —
// all sounds are short oscillator sweeps mixed through a master gain so
// nothing blows past a reasonable volume. The first call resumes the
// shared AudioContext, which browsers require to happen inside a user
// gesture; subsequent calls reuse it.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
};

const tone = (opts: {
  freqStart: number;
  freqEnd?: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
}) => {
  const c = getCtx();
  if (!c || !master) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  const now = c.currentTime;
  const attack = opts.attack ?? 0.005;
  const gain = opts.gain ?? 0.4;
  osc.type = opts.type ?? 'square';
  osc.frequency.setValueAtTime(opts.freqStart, now);
  if (opts.freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, opts.freqEnd),
      now + opts.duration
    );
  }
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + attack);
  g.gain.exponentialRampToValueAtTime(0.001, now + opts.duration);
  osc.connect(g);
  g.connect(master);
  osc.start(now);
  osc.stop(now + opts.duration + 0.05);
};

const noiseBurst = (opts: { duration: number; gain?: number; highpass?: number }) => {
  const c = getCtx();
  if (!c || !master) return;
  const bufferSize = Math.max(1, Math.floor(c.sampleRate * opts.duration));
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const g = c.createGain();
  const now = c.currentTime;
  g.gain.setValueAtTime(opts.gain ?? 0.3, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + opts.duration);
  if (opts.highpass) {
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = opts.highpass;
    src.connect(f);
    f.connect(g);
  } else {
    src.connect(g);
  }
  g.connect(master);
  src.start(now);
  src.stop(now + opts.duration + 0.02);
};

export const sfx = {
  /** Quick downward sawtooth — laser shot. */
  laser: () =>
    tone({ freqStart: 1400, freqEnd: 380, duration: 0.07, type: 'sawtooth', gain: 0.22 }),
  /** Mid-pitch impact thud — cube destroyed. */
  hit: () =>
    tone({ freqStart: 420, freqEnd: 80, duration: 0.14, type: 'square', gain: 0.32 }),
  /** Crunchy noise — player took damage. */
  damage: () => {
    tone({ freqStart: 220, freqEnd: 70, duration: 0.28, type: 'sawtooth', gain: 0.3 });
    noiseBurst({ duration: 0.18, gain: 0.32, highpass: 600 });
  },
  /** Rising warble — boss appears. */
  bossSpawn: () =>
    tone({ freqStart: 90, freqEnd: 360, duration: 0.55, type: 'sawtooth', gain: 0.34 }),
  /** Big falling sweep — boss down. */
  bossDefeat: () => {
    tone({ freqStart: 600, freqEnd: 70, duration: 0.5, type: 'sawtooth', gain: 0.36 });
    noiseBurst({ duration: 0.35, gain: 0.32, highpass: 200 });
  },
  /** Doom slide — HP hit zero. */
  gameOver: () =>
    tone({ freqStart: 220, freqEnd: 40, duration: 0.95, type: 'sawtooth', gain: 0.38 }),
  /** Ready-up chirp / round start. */
  start: () => {
    tone({ freqStart: 440, freqEnd: 660, duration: 0.08, type: 'triangle', gain: 0.28 });
    setTimeout(() =>
      tone({ freqStart: 660, freqEnd: 990, duration: 0.1, type: 'triangle', gain: 0.28 }),
    90);
  },
  /** Ascending chirp per consecutive mascot tap (0-indexed level). */
  tap: (level: number) => {
    const base = 260 + level * 100;
    tone({ freqStart: base, freqEnd: base * 1.45, duration: 0.11, type: 'triangle', gain: 0.22 });
  },
  /** Open AudioContext from a user gesture — call once on first click. */
  init: () => { getCtx(); }
};
