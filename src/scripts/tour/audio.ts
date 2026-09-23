// THE TOUR'S SOUND: the narrator, and a quiet score under it.
//
// THE VOICE is pre-rendered (scripts/build-narration.mjs): one mp3 per line and a manifest
// per cut with every displayed word's start and end. Nothing is synthesised in the browser
// and no key ever reaches it. A line is started on the tour's clock and its length is
// taken from the manifest, so a silent run — the test harness at twelve times speed, or a
// reader with the sound off — keeps exactly the same timing as a voiced one.
//
// THE SCORE is generated, not a file: a slow pad of detuned saws through a moving filter
// and a synthetic room, a soft pulse for the test, a riser into the failure and one impact
// on it. No licence, no download, nothing to credit. It sits well under the voice and
// ducks further while a line is spoken.
//
// PAUSE is the AudioContext's own suspend(), called with the clock's pause, so the voice
// stops mid-word and resumes on the same syllable.

import type { Clock } from './clock';

export interface VoiceWord { w: string; t0: number; t1: number }
export interface VoiceLine { id: string; src: string; duration: number; text: string; words: VoiceWord[] }
export interface VoiceManifest { cut: string; lines: VoiceLine[]; total: number }

export interface Spoken {
	readonly line: VoiceLine;
	/** Resolves when the line has finished. */
	done: Promise<void>;
	/** Resolves when the `nth` occurrence of a displayed word starts (or ends). Matched on
	 *  letters and digits only, case-insensitive: at('opened'), at('85'). */
	at(word: string, edge?: 't0' | 't1', nth?: number): Promise<void>;
	/** Resolves `sec` seconds into the line. */
	after(sec: number): Promise<void>;
}

export interface SubtitleSink {
	show(line: VoiceLine, elapsed: () => number): void;
	release(id: string): void;
}

const norm = (w: string) => w.normalize('NFKD').replace(/[^\p{L}\p{N}.]/gu, '').replace(/\.$/, '').toLowerCase();

/* THE MANIFESTS SHIP INSIDE THE BUNDLE, NOT BESIDE IT. They used to be fetched from
   /black-box/voice/<cut>.json with cache: 'force-cache' — and a browser that had played the
   first recording kept that manifest after the script was rewritten: old subtitles, audio
   files that no longer existed, and a crash on the first cue word the new script had and the
   old one did not. Imported here, a manifest is hashed into the same build as the code that
   reads it, so the two can never disagree. The mp3s stay separate files: each is named by a
   hash of its own words, so a cached one is always the right one. */
const MANIFESTS: Record<string, () => Promise<{ default: unknown }>> = {
	demo: () => import('../../data/narration/demo.json'),
	full: () => import('../../data/narration/full.json'),
};

export async function loadManifest(cut: string): Promise<VoiceManifest> {
	const load = MANIFESTS[cut];
	if (!load) throw new Error(`no narration for the "${cut}" cut`);
	return (await load()).default as VoiceManifest;
}

export class Narrator {
	private buffers = new Map<string, AudioBuffer>();
	private playing = new Set<AudioBufferSourceNode>();

	constructor(
		private readonly clock: Clock,
		private readonly manifest: VoiceManifest,
		private readonly ac: AudioContext | null,
		private readonly out: AudioNode | null,
		private readonly subs: SubtitleSink,
		private readonly score: Score | null,
		/** Throw on a cue word the line does not contain. On for the test harness, so a
		 *  script that drifts from its narration fails the build; off for a reader, for
		 *  whom a late tag is better than a tour that stops. */
		private readonly strict = false,
	) {}

	get voiced(): boolean { return !!this.ac; }

	/** Fetch and decode every line before the curtain lifts, so no line can start late on
	 *  a slow connection. ONE BAD FILE COSTS ONE LINE: a line whose audio fails is shown
	 *  as a subtitle and timed from the manifest, and every other line still speaks.
	 *  Returns how many lines have audio. Silent mode has nothing to fetch. */
	async preload(): Promise<number> {
		if (!this.ac) return 0;
		const ac = this.ac;
		await Promise.all(this.manifest.lines.map(async (l) => {
			try {
				const res = await fetch(l.src);
				if (!res.ok) throw new Error(`${res.status}`);
				this.buffers.set(l.id, await ac.decodeAudioData(await res.arrayBuffer()));
			} catch (e) {
				console.warn(`[tour] narration "${l.id}" did not load (${String(e)}); showing it as a subtitle only`);
			}
		}));
		return this.buffers.size;
	}

	line(id: string): VoiceLine {
		const l = this.manifest.lines.find((x) => x.id === id);
		if (!l) throw new Error(`tour: no narration line "${id}" in the ${this.manifest.cut} manifest`);
		return l;
	}

	say(id: string): Spoken {
		const line = this.line(id);
		const start = this.clock.t;
		const buf = this.buffers.get(id);
		if (this.ac && this.out && buf) {
			const src = this.ac.createBufferSource();
			src.buffer = buf;
			src.connect(this.out);
			src.onended = () => this.playing.delete(src);
			src.start();
			this.playing.add(src);
		}
		this.score?.duck(true);
		const elapsed = () => (this.clock.t - start) / 1000;
		this.subs.show(line, elapsed);
		const done = this.clock.wait(line.duration * 1000).then(() => {
			this.score?.duck(false);
			this.subs.release(line.id);
		});
		// An unobserved rejection on abort is expected; the director handles TourAbort.
		done.catch(() => {});
		return {
			line,
			done,
			at: (word, edge = 't0', nth = 1) => {
				const key = norm(word);
				let seen = 0;
				const w = line.words.find((x) => norm(x.w) === key && ++seen === nth);
				if (!w) {
					const msg = `tour: "${word}" is not in line ${id}`;
					if (this.strict) throw new Error(msg);
					console.warn(`[${msg}] — cueing at once instead`);
					return this.clock.wait(0);
				}
				return this.clock.until(() => elapsed() >= w[edge]);
			},
			after: (sec) => this.clock.until(() => elapsed() >= sec),
		};
	}

	stop(): void {
		for (const s of this.playing) {
			try { s.stop(); } catch { /* already stopped */ }
		}
		this.playing.clear();
	}
}

/* ── THE SCORE ──────────────────────────────────────────────────────────────── */

const CHORDS = {
	// D minor, add nine: the opening, the black box.
	dark: [73.42, 110.0, 174.61, 329.63],
	// B-flat major seven over F: tension, the test.
	tense: [58.27, 87.31, 146.83, 220.0],
	// F major seven: the box opened, and the close.
	open: [87.31, 130.81, 220.0, 329.63],
} as const;
export type ChordName = keyof typeof CHORDS;

export class Score {
	private readonly bus: GainNode;
	private readonly duckGain: GainNode;
	private readonly filter: BiquadFilterNode;
	private readonly verb: ConvolverNode;
	private readonly voices: Array<{ oscs: OscillatorNode[]; gain: GainNode }> = [];
	private readonly lfo: OscillatorNode;
	private pulseOn = false;
	private nextBeat = 0;
	private bpm = 76;
	private started = false;
	private noise: AudioBuffer;
	/** The upper layer: the chord two octaves up, so the score is heard on laptop speakers,
	 *  which reproduce almost nothing of a pad that lives below 200 Hz. */
	private readonly air: OscillatorNode[] = [];
	private heart = false;
	private heartBpm = 64;
	private nextHeart = 0;

	/* LOUD ENOUGH TO HEAR. It sat at 0.2, low-passed to a few hundred hertz, and ducked to
	   40% under every line — on a laptop at normal volume it was simply not there. */
	constructor(private readonly ac: AudioContext, dest: AudioNode, private readonly level = 0.55) {
		this.bus = ac.createGain();
		this.bus.gain.value = 0;
		this.duckGain = ac.createGain();
		this.duckGain.gain.value = 1;
		this.bus.connect(this.duckGain).connect(dest);

		this.verb = ac.createConvolver();
		this.verb.buffer = this.impulse(3.4, 2.4);
		const wet = ac.createGain();
		wet.gain.value = 0.55;
		this.verb.connect(wet).connect(this.bus);

		this.filter = ac.createBiquadFilter();
		this.filter.type = 'lowpass';
		this.filter.frequency.value = 950;
		this.filter.Q.value = 0.5;
		this.filter.connect(this.bus);
		this.filter.connect(this.verb);

		// A slow breath on the filter, so the pad is never quite still.
		this.lfo = ac.createOscillator();
		this.lfo.frequency.value = 0.055;
		const depth = ac.createGain();
		depth.gain.value = 220;
		this.lfo.connect(depth).connect(this.filter.frequency);

		this.noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
		const d = this.noise.getChannelData(0);
		for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

		for (const f of CHORDS.dark) {
			const gain = ac.createGain();
			gain.gain.value = 0.05;
			gain.connect(this.filter);
			const oscs = [-7, 7].map((cents) => {
				const o = ac.createOscillator();
				o.type = 'sawtooth';
				o.frequency.value = f;
				o.detune.value = cents;
				o.connect(gain);
				return o;
			});
			this.voices.push({ oscs, gain });
		}
		// The air layer: triangles two octaves up, trembling slowly, through a gentle band.
		const airBus = ac.createGain();
		airBus.gain.value = 0.55;
		const airHp = ac.createBiquadFilter();
		airHp.type = 'highpass';
		airHp.frequency.value = 500;
		airBus.connect(airHp);
		airHp.connect(this.bus);
		airHp.connect(this.verb);
		const trem = ac.createOscillator();
		trem.frequency.value = 0.35;
		const tremDepth = ac.createGain();
		tremDepth.gain.value = 0.25;
		trem.connect(tremDepth).connect(airBus.gain);
		this.air.push(trem);
		for (const f of CHORDS.dark) {
			const o = ac.createOscillator();
			o.type = 'triangle';
			o.frequency.value = f * 4;
			const g = ac.createGain();
			g.gain.value = 0.022;
			o.connect(g).connect(airBus);
			this.air.push(o);
		}
		// A sine an octave under the root, for weight without mud.
		const sub = ac.createOscillator();
		sub.type = 'sine';
		sub.frequency.value = CHORDS.dark[0] / 2;
		const subGain = ac.createGain();
		subGain.gain.value = 0.12;
		sub.connect(subGain).connect(this.bus);
		this.voices.push({ oscs: [sub], gain: subGain });
	}

	private impulse(seconds: number, decay: number): AudioBuffer {
		const len = Math.floor(this.ac.sampleRate * seconds);
		const b = this.ac.createBuffer(2, len, this.ac.sampleRate);
		for (let c = 0; c < 2; c++) {
			const ch = b.getChannelData(c);
			for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
		}
		return b;
	}

	start(fadeSec = 2.5): void {
		if (this.started) return;
		this.started = true;
		const t = this.ac.currentTime;
		for (const v of this.voices) for (const o of v.oscs) o.start(t);
		for (const o of this.air) o.start(t);
		this.lfo.start(t);
		this.bus.gain.setValueAtTime(0, t);
		this.bus.gain.linearRampToValueAtTime(this.level, t + fadeSec);
	}

	stop(fadeSec = 1.2): void {
		const t = this.ac.currentTime;
		this.bus.gain.cancelScheduledValues(t);
		this.bus.gain.setValueAtTime(this.bus.gain.value, t);
		this.bus.gain.linearRampToValueAtTime(0, t + fadeSec);
		this.pulseOn = false;
		this.heart = false;
	}

	/** Under the voice the score steps back by about 6 dB — back, not away. */
	duck(on: boolean): void {
		this.duckGain.gain.setTargetAtTime(on ? 0.5 : 1, this.ac.currentTime, on ? 0.12 : 0.6);
	}

	chord(name: ChordName, glideSec = 2.4): void {
		const t = this.ac.currentTime;
		const fs = CHORDS[name];
		fs.forEach((f, i) => {
			for (const o of this.voices[i].oscs) o.frequency.setTargetAtTime(f, t, glideSec / 3);
		});
		const sub = this.voices[this.voices.length - 1].oscs[0];
		sub.frequency.setTargetAtTime(fs[0] / 2, t, glideSec / 3);
		fs.forEach((f, i) => this.air[i + 1]?.frequency.setTargetAtTime(f * 4, t, glideSec / 3));
	}

	/** How open the filter is, 0 (dark) to 1 (bright). */
	brightness(k: number, sec = 2): void {
		this.filter.frequency.setTargetAtTime(700 + k * 2600, this.ac.currentTime, sec / 3);
	}

	pulse(on: boolean, bpm = 76): void {
		this.bpm = bpm;
		if (on && !this.pulseOn) this.nextBeat = this.ac.currentTime + 0.1;
		this.pulseOn = on;
	}

	/** A heartbeat under the clips — lub-dub — quickening as the hook builds. */
	heartbeat(on: boolean, bpm = 64): void {
		this.heartBpm = bpm;
		if (on && !this.heart) this.nextHeart = this.ac.currentTime + 0.1;
		this.heart = on;
	}

	/** Called every frame by the director: schedules the pulse and heartbeat a little ahead. */
	tick(): void {
		const ahead = this.ac.currentTime + 0.25;
		if (this.pulseOn) {
			while (this.nextBeat < ahead) {
				this.kick(this.nextBeat, 0.42);
				this.nextBeat += 60 / this.bpm;
			}
		}
		if (this.heart) {
			while (this.nextHeart < ahead) {
				this.kick(this.nextHeart, 0.6);
				this.kick(this.nextHeart + 0.2, 0.38);
				this.nextHeart += 60 / this.heartBpm;
			}
		}
	}

	/** A kick with a click on top: the body is below what a laptop speaker plays, so the
	 *  attack and an octave-up partial are what carry it. */
	private kick(at: number, amp: number): void {
		const o = this.ac.createOscillator();
		o.type = 'sine';
		o.frequency.setValueAtTime(110, at);
		o.frequency.exponentialRampToValueAtTime(45, at + 0.16);
		const o2 = this.ac.createOscillator();
		o2.type = 'triangle';
		o2.frequency.setValueAtTime(220, at);
		o2.frequency.exponentialRampToValueAtTime(95, at + 0.12);
		const g = this.ac.createGain();
		g.gain.setValueAtTime(0.0001, at);
		g.gain.exponentialRampToValueAtTime(amp, at + 0.01);
		g.gain.exponentialRampToValueAtTime(0.0001, at + 0.42);
		const g2 = this.ac.createGain();
		g2.gain.setValueAtTime(0.0001, at);
		g2.gain.exponentialRampToValueAtTime(amp * 0.35, at + 0.008);
		g2.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
		o.connect(g).connect(this.bus);
		o2.connect(g2).connect(this.bus);
		const n = this.ac.createBufferSource();
		n.buffer = this.noise;
		const bp = this.ac.createBiquadFilter();
		bp.type = 'bandpass';
		bp.frequency.value = 3200;
		bp.Q.value = 0.8;
		const gn = this.ac.createGain();
		gn.gain.setValueAtTime(amp * 0.25, at);
		gn.gain.exponentialRampToValueAtTime(0.0001, at + 0.025);
		n.connect(bp).connect(gn).connect(this.bus);
		o.start(at); o.stop(at + 0.5);
		o2.start(at); o2.stop(at + 0.25);
		n.start(at, Math.random()); n.stop(at + 0.04);
	}

	/** THE BRAAM: a stack of detuned saws on a low fifth, the filter opening and closing on
	 *  it, through a little saturation and the room — the cinematic hit for a big moment. */
	braam(amp = 1, sec = 2.2): void {
		const t = this.ac.currentTime;
		const out = this.ac.createGain();
		out.gain.setValueAtTime(0.0001, t);
		out.gain.exponentialRampToValueAtTime(0.5 * amp, t + 0.04);
		out.gain.exponentialRampToValueAtTime(0.0001, t + sec);
		const lp = this.ac.createBiquadFilter();
		lp.type = 'lowpass';
		lp.Q.value = 3;
		lp.frequency.setValueAtTime(260, t);
		lp.frequency.exponentialRampToValueAtTime(2400, t + 0.18);
		lp.frequency.exponentialRampToValueAtTime(320, t + sec);
		const shaper = this.ac.createWaveShaper();
		const curve = new Float32Array(1024);
		for (let i = 0; i < curve.length; i++) { const x = (i / 511.5) - 1; curve[i] = Math.tanh(2.2 * x); }
		shaper.curve = curve;
		for (const [f, d, g] of [[55, -9, 0.3], [55, 9, 0.3], [82.4, 5, 0.22], [110, -5, 0.2], [220, 7, 0.1]] as Array<[number, number, number]>) {
			const o = this.ac.createOscillator();
			o.type = 'sawtooth';
			o.frequency.value = f;
			o.detune.value = d;
			const og = this.ac.createGain();
			og.gain.value = g;
			o.connect(og).connect(lp);
			o.start(t);
			o.stop(t + sec + 0.1);
		}
		lp.connect(shaper).connect(out);
		out.connect(this.bus);
		out.connect(this.verb);
	}

	/** A reverse swell into a moment: noise rising through an opening high-pass, and a tone
	 *  gliding up under it, cut dead at the end — the breath before a cut. */
	swell(sec = 0.8, amp = 1): void {
		const t = this.ac.currentTime;
		const n = this.ac.createBufferSource();
		n.buffer = this.noise;
		n.loop = true;
		const hp = this.ac.createBiquadFilter();
		hp.type = 'highpass';
		hp.frequency.setValueAtTime(4000, t);
		hp.frequency.exponentialRampToValueAtTime(700, t + sec);
		const g = this.ac.createGain();
		g.gain.setValueAtTime(0.0001, t);
		g.gain.exponentialRampToValueAtTime(0.22 * amp, t + sec);
		g.gain.linearRampToValueAtTime(0, t + sec + 0.03);
		n.connect(hp).connect(g);
		g.connect(this.bus);
		g.connect(this.verb);
		const o = this.ac.createOscillator();
		o.type = 'sine';
		o.frequency.setValueAtTime(260, t);
		o.frequency.exponentialRampToValueAtTime(880, t + sec);
		const og = this.ac.createGain();
		og.gain.setValueAtTime(0.0001, t);
		og.gain.exponentialRampToValueAtTime(0.06 * amp, t + sec);
		og.gain.linearRampToValueAtTime(0, t + sec + 0.03);
		o.connect(og).connect(this.bus);
		n.start(t); n.stop(t + sec + 0.05);
		o.start(t); o.stop(t + sec + 0.05);
	}

	/** Glitch: short gated bursts of bright noise and a square, stuttering. */
	stutter(sec = 0.42): void {
		const t = this.ac.currentTime;
		const n = this.ac.createBufferSource();
		n.buffer = this.noise;
		n.loop = true;
		const bp = this.ac.createBiquadFilter();
		bp.type = 'bandpass';
		bp.frequency.value = 1800;
		bp.Q.value = 0.7;
		const sq = this.ac.createOscillator();
		sq.type = 'square';
		sq.frequency.value = 180;
		const g = this.ac.createGain();
		g.gain.value = 0;
		const gates = Math.round(sec / 0.05);
		for (let i = 0; i < gates; i++) {
			const at = t + i * 0.05;
			const on = (i * 7) % 3 !== 0;
			g.gain.setValueAtTime(on ? 0.16 : 0, at);
			sq.frequency.setValueAtTime(120 + ((i * 53) % 7) * 60, at);
		}
		g.gain.setValueAtTime(0, t + sec);
		n.connect(bp).connect(g);
		const sg = this.ac.createGain();
		sg.gain.value = 0.35;
		sq.connect(sg).connect(g);
		g.connect(this.bus);
		n.start(t); n.stop(t + sec + 0.05);
		sq.start(t); sq.stop(t + sec + 0.05);
	}

	/** A sub-drop with a click and an octave on top, so it lands on small speakers too. */
	subdrop(amp = 1): void {
		const t = this.ac.currentTime;
		for (const [f0, f1, g0, dur] of [[160, 38, 0.8, 1.5], [320, 80, 0.22, 0.6]] as Array<[number, number, number, number]>) {
			const o = this.ac.createOscillator();
			o.type = 'sine';
			o.frequency.setValueAtTime(f0, t);
			o.frequency.exponentialRampToValueAtTime(f1, t + dur);
			const g = this.ac.createGain();
			g.gain.setValueAtTime(0.0001, t);
			g.gain.exponentialRampToValueAtTime(g0 * amp, t + 0.012);
			g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
			o.connect(g).connect(this.bus);
			o.start(t); o.stop(t + dur + 0.05);
		}
		this.kick(t, 0.5 * amp);
	}

	/** Filtered noise sweeping upward over `sec`, with a saw climbing under it, into the
	 *  moment of failure. */
	riser(sec: number): void {
		const t0 = this.ac.currentTime;
		const saw = this.ac.createOscillator();
		saw.type = 'sawtooth';
		saw.frequency.setValueAtTime(110, t0);
		saw.frequency.exponentialRampToValueAtTime(440, t0 + sec);
		const sl = this.ac.createBiquadFilter();
		sl.type = 'lowpass';
		sl.frequency.setValueAtTime(400, t0);
		sl.frequency.exponentialRampToValueAtTime(3000, t0 + sec);
		const sg = this.ac.createGain();
		sg.gain.setValueAtTime(0.0001, t0);
		sg.gain.exponentialRampToValueAtTime(0.06, t0 + sec);
		sg.gain.linearRampToValueAtTime(0, t0 + sec + 0.05);
		saw.connect(sl).connect(sg).connect(this.bus);
		saw.start(t0); saw.stop(t0 + sec + 0.1);
		const t = this.ac.currentTime;
		const src = this.ac.createBufferSource();
		src.buffer = this.noise;
		src.loop = true;
		const bp = this.ac.createBiquadFilter();
		bp.type = 'bandpass';
		bp.Q.value = 1.4;
		bp.frequency.setValueAtTime(280, t);
		bp.frequency.exponentialRampToValueAtTime(3600, t + sec);
		const g = this.ac.createGain();
		g.gain.setValueAtTime(0.0001, t);
		g.gain.exponentialRampToValueAtTime(0.24, t + sec);
		g.gain.linearRampToValueAtTime(0, t + sec + 0.06);
		src.connect(bp).connect(g);
		g.connect(this.bus);
		g.connect(this.verb);
		src.start(t);
		src.stop(t + sec + 0.1);
	}

	/** The impact: a falling sub and a burst of dark noise, with the room behind them. */
	hit(amp = 1): void {
		const t = this.ac.currentTime;
		const o = this.ac.createOscillator();
		o.type = 'sine';
		o.frequency.setValueAtTime(78, t);
		o.frequency.exponentialRampToValueAtTime(27, t + 1.1);
		const g = this.ac.createGain();
		g.gain.setValueAtTime(0.0001, t);
		g.gain.exponentialRampToValueAtTime(0.95 * amp, t + 0.01);
		g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
		o.connect(g).connect(this.bus);
		o.start(t);
		o.stop(t + 1.9);

		const n = this.ac.createBufferSource();
		n.buffer = this.noise;
		const lp = this.ac.createBiquadFilter();
		lp.type = 'lowpass';
		lp.frequency.setValueAtTime(1600, t);
		lp.frequency.exponentialRampToValueAtTime(160, t + 1.2);
		const ng = this.ac.createGain();
		ng.gain.setValueAtTime(0.5 * amp, t);
		ng.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
		n.connect(lp).connect(ng);
		ng.connect(this.bus);
		ng.connect(this.verb);
		n.start(t);
		n.stop(t + 1.4);
	}

	/** A soft low thud — the box closing. */
	thud(): void {
		const t = this.ac.currentTime;
		this.kick(t, 0.5);
	}

	/** A rising shimmer of three partials — the box opening. */
	shimmer(): void {
		const t = this.ac.currentTime;
		[698.46, 880.0, 1046.5, 1318.5].forEach((f, i) => {
			const o = this.ac.createOscillator();
			o.type = 'sine';
			o.frequency.value = f;
			const g = this.ac.createGain();
			const at = t + i * 0.09;
			g.gain.setValueAtTime(0.0001, at);
			g.gain.exponentialRampToValueAtTime(0.05, at + 0.35);
			g.gain.exponentialRampToValueAtTime(0.0001, at + 2.6);
			o.connect(g);
			g.connect(this.verb);
			g.connect(this.bus);
			o.start(at);
			o.stop(at + 2.7);
		});
	}

	/** The cursor's press: a short, quiet tick. */
	click(): void {
		const t = this.ac.currentTime;
		const o = this.ac.createOscillator();
		o.type = 'triangle';
		o.frequency.setValueAtTime(2100, t);
		o.frequency.exponentialRampToValueAtTime(900, t + 0.03);
		const g = this.ac.createGain();
		g.gain.setValueAtTime(0.0001, t);
		g.gain.exponentialRampToValueAtTime(0.09, t + 0.004);
		g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
		o.connect(g).connect(this.duckGain);
		o.start(t);
		o.stop(t + 0.08);
	}

	/** Air moving past — the camera travelling a long way. */
	whoosh(sec = 0.8): void {
		const t = this.ac.currentTime;
		const n = this.ac.createBufferSource();
		n.buffer = this.noise;
		const bp = this.ac.createBiquadFilter();
		bp.type = 'bandpass';
		bp.Q.value = 0.9;
		bp.frequency.setValueAtTime(400, t);
		bp.frequency.exponentialRampToValueAtTime(1800, t + sec * 0.5);
		bp.frequency.exponentialRampToValueAtTime(500, t + sec);
		const g = this.ac.createGain();
		g.gain.setValueAtTime(0.0001, t);
		g.gain.exponentialRampToValueAtTime(0.06, t + sec * 0.45);
		g.gain.exponentialRampToValueAtTime(0.0001, t + sec);
		n.connect(bp).connect(g).connect(this.bus);
		n.start(t);
		n.stop(t + sec + 0.05);
	}
}

/** One output chain for everything: a gentle limiter so an impact under a voice line
 *  can never clip. */
export function soundChain(ac: AudioContext): { voice: GainNode; music: GainNode; master: GainNode } {
	const master = ac.createGain();
	master.gain.value = 1;
	const comp = ac.createDynamicsCompressor();
	comp.threshold.value = -12;
	comp.knee.value = 8;
	comp.ratio.value = 3;
	comp.attack.value = 0.004;
	comp.release.value = 0.25;
	master.connect(comp).connect(ac.destination);
	const voice = ac.createGain();
	voice.gain.value = 1;
	voice.connect(master);
	const music = ac.createGain();
	music.gain.value = 1;
	music.connect(master);
	return { voice, music, master };
}
