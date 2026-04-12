/**
 * Procedural ambient music engine using Tone.js
 * Generates a dark ambient / space ambient soundscape inspired by
 * Stellardrone, Brian Eno's "Apollo," and Carbon Based Lifeforms.
 *
 * Zero download cost — everything is synthesized in real time.
 */
import * as Tone from "tone";

let initialized = false;
let playing = false;
let masterGain: Tone.Gain | null = null;
let fadeInterval: ReturnType<typeof setTimeout> | null = null;

// All nodes we need to clean up
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodes: Array<{ dispose(): void }> = [];

function track<T extends { dispose(): void }>(node: T): T {
  nodes.push(node);
  return node;
}

/** Deep sub-bass drone — the felt-not-heard foundation */
function createSubDrone(dest: Tone.Gain) {
  const synth = track(
    new Tone.FatOscillator({
      type: "sine",
      frequency: 55, // A1
      spread: 10,
      count: 3,
    })
  );
  const gain = track(new Tone.Gain(0.12));
  const filter = track(
    new Tone.Filter({ frequency: 120, type: "lowpass", rolloff: -24 })
  );

  // Very slow LFO on pitch for organic drift
  const lfo = track(
    new Tone.LFO({ frequency: 0.02, min: 53, max: 57, type: "sine" })
  );
  lfo.connect(synth.frequency);
  lfo.start();

  synth.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  synth.start();
}

/** Evolving pad — the harmonic bed */
function createPad(dest: Tone.Gain) {
  const reverb = track(new Tone.Reverb({ decay: 12, wet: 0.8 }));

  const voices = [
    { note: "A2", detune: -5 },
    { note: "E3", detune: 3 },
    { note: "A3", detune: -2 },
    { note: "C#4", detune: 7 },
  ];

  const padGain = track(new Tone.Gain(0.06));

  voices.forEach(({ note, detune }) => {
    const osc = track(
      new Tone.FatOscillator({
        type: "sawtooth",
        frequency: Tone.Frequency(note).toFrequency(),
        detune,
        spread: 20,
        count: 3,
      })
    );
    const filter = track(
      new Tone.Filter({ frequency: 800, type: "lowpass", rolloff: -24 })
    );
    const filterLfo = track(
      new Tone.LFO({
        frequency: 0.03 + Math.random() * 0.02,
        min: 400,
        max: 1200,
        type: "sine",
      })
    );
    filterLfo.connect(filter.frequency);
    filterLfo.start();

    osc.connect(filter);
    filter.connect(padGain);
    osc.start();
  });

  padGain.connect(reverb);
  reverb.connect(dest);
}

/** Shimmering high-frequency texture — distant stars */
function createShimmer(dest: Tone.Gain) {
  const delay = track(
    new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.4, wet: 0.5 })
  );
  const reverb = track(new Tone.Reverb({ decay: 18, wet: 0.9 }));
  const shimmerGain = track(new Tone.Gain(0.03));
  const filter = track(
    new Tone.Filter({ frequency: 3000, type: "highpass", rolloff: -12 })
  );

  // Granular-style random notes from a pentatonic scale
  const scale = ["A4", "C#5", "E5", "A5", "C#6", "E6"];
  const synth = track(
    new Tone.PolySynth(Tone.Synth, {
      maxPolyphony: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 2, decay: 3, sustain: 0.1, release: 4 },
    } as Partial<Tone.PolySynthOptions<Tone.Synth>>)
  );

  synth.connect(filter);
  filter.connect(delay);
  delay.connect(reverb);
  reverb.connect(shimmerGain);
  shimmerGain.connect(dest);

  // Schedule sporadic shimmer notes
  const loop = track(
    new Tone.Loop((time) => {
      if (!playing) return;
      const note = scale[Math.floor(Math.random() * scale.length)];
      synth.triggerAttackRelease(note, "4n", time, 0.05 + Math.random() * 0.05);
    }, "2n")
  );
  loop.humanize = "8n";
  loop.start(0);
}

/** Breath-like noise sweep — wind on an alien planet */
function createBreath(dest: Tone.Gain) {
  const noise = track(new Tone.Noise("pink"));
  const filter = track(
    new Tone.AutoFilter({
      frequency: 0.08,
      baseFrequency: 200,
      octaves: 3,
      type: "sine",
    })
  );
  const breathGain = track(new Tone.Gain(0.015));

  noise.connect(filter);
  filter.connect(breathGain);
  breathGain.connect(dest);
  noise.start();
  filter.start();
}

// ─── Public API ────────────────────────────────────────────────

/** Initialize the audio graph (call once). Does not start playback. */
export async function initAmbient() {
  if (initialized) return;
  initialized = true;

  await Tone.start();

  masterGain = track(new Tone.Gain(0));
  masterGain.toDestination();

  createSubDrone(masterGain);
  createPad(masterGain);
  createShimmer(masterGain);
  createBreath(masterGain);

  Tone.getTransport().start();
}

/** Fade in over `duration` ms. Resumes AudioContext if suspended. */
export function fadeIn(duration = 4000) {
  if (!masterGain) return;
  playing = true;

  if (fadeInterval) clearInterval(fadeInterval);

  const targetVolume = 0.7;
  const startVolume = masterGain.gain.value;
  const steps = 60;
  const stepTime = duration / steps;
  const delta = (targetVolume - startVolume) / steps;
  let step = 0;

  fadeInterval = setInterval(() => {
    step++;
    if (step >= steps || !masterGain) {
      if (masterGain) masterGain.gain.value = targetVolume;
      if (fadeInterval) clearInterval(fadeInterval);
      fadeInterval = null;
      return;
    }
    masterGain.gain.value = startVolume + delta * step;
  }, stepTime);
}

/** Fade out over `duration` ms. */
export function fadeOut(duration = 3000) {
  if (!masterGain) return;

  if (fadeInterval) clearInterval(fadeInterval);

  const startVolume = masterGain.gain.value;
  const steps = 60;
  const stepTime = duration / steps;
  const delta = startVolume / steps;
  let step = 0;

  fadeInterval = setInterval(() => {
    step++;
    if (step >= steps || !masterGain) {
      if (masterGain) masterGain.gain.value = 0;
      playing = false;
      if (fadeInterval) clearInterval(fadeInterval);
      fadeInterval = null;
      return;
    }
    masterGain.gain.value = startVolume - delta * step;
  }, stepTime);
}

export function isPlaying() {
  return playing;
}

/** Tear down the entire audio graph. */
export function dispose() {
  if (fadeInterval) clearInterval(fadeInterval);
  playing = false;
  Tone.getTransport().stop();
  nodes.forEach((n) => {
    try { n.dispose(); } catch { /* already disposed */ }
  });
  nodes.length = 0;
  masterGain = null;
  initialized = false;
}
