// THE HOOK — the thirty seconds before the narrator speaks.
//
// Three people say it on camera: Geoffrey Hinton on 60 Minutes, Jacob Coxon on CNN, Elon Musk
// at SXSW. Hinton fades up in the middle; the CNN window arrives on the left and Musk's on the
// right, each speaking in turn with its words lit underneath as they are said. Around them the
// warnings pile up — real headlines drifting past, the earlier speakers still moving on muted
// screens, a training log racing behind — until it all tears and cuts to black, and the
// narrator says what the rest of the tour is about.
//
// NOTHING HERE IS INVENTED. The clips are the broadcasts, cut and cropped (build-clips.mjs);
// the captions are the words spoken; the headlines are verbatim, each with its outlet and date
// (data/hook-headlines.json); and the "code" behind them is the actual training log of the run
// the tour is about to replay, line by line from its bundle — epoch, step, accuracy, and each
// layer's health — so the one screen of numbers in the hook is as real as the console's.
//
// SOUND. Each clip's sound is its own file, played through the tour's AudioContext — which the
// visitor's click unlocked — so it plays in every browser and pauses, mutes and ducks with
// everything else. The pictures are muted <video>s held in step with that sound every frame.
// In the silent test harness nothing plays and the timing comes from the manifest, exactly as
// it does for the narration.

import clipsData from '../../data/narration/clips.json';
import headlinesData from '../../data/hook-headlines.json';
import type { Clock } from './clock';
import { Narrator, type Score, type Spoken, type SubtitleSink, type VoiceLine, type VoiceManifest } from './audio';
import { Subtitles } from './overlay';
import type { Bundle } from '../replay/types';

export interface ClipLine extends VoiceLine {
	video: { webm: string; mp4: string; poster: string; w: number; h: number };
	source: string;
	speakers: Array<{ at: number; name: string; role: string }>;
}
const CLIPS = (clipsData as { lines: ClipLine[] }).lines;
const HEADLINES = (headlinesData as { headlines: Array<{ outlet: string; date: string; text: string; quote?: boolean; recent?: boolean }> }).headlines;

/** Off with ?hook=0 — and the one switch to flip if the clips are ever withdrawn. */
export const HOOK_ON = true;

/** A small seeded generator, so every run of the hook is the same film. */
/** A screen rectangle, in CSS pixels. */
type Box = { left: number; top: number; right: number; bottom: number };

function rng(seed: number): () => number {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/* ── one clip window ─────────────────────────────────────────────────────────── */

class ClipWindow {
	readonly el: HTMLElement;
	readonly video: HTMLVideoElement;
	private readonly who: HTMLElement;
	private readonly role: HTMLElement;
	readonly subs: Subtitles;
	private start = -1;
	private live = false;
	private lastSeek = -Infinity;

	constructor(private readonly clock: Clock, host: HTMLElement, readonly line: ClipLine, private readonly realtime: boolean) {
		this.el = host.querySelector<HTMLElement>(`[data-dt-win="${line.id}"]`)!;
		this.video = this.el.querySelector('video')!;
		this.who = this.el.querySelector<HTMLElement>('[data-dt-who]')!;
		this.role = this.el.querySelector<HTMLElement>('[data-dt-role]')!;
		(this.el.querySelector('[data-dt-src]') as HTMLElement).textContent = line.source;
		this.subs = new Subtitles(clock, this.el.querySelector<HTMLElement>('[data-dt-win-cap]')!, this.el.querySelector<HTMLElement>('[data-dt-win-line]')!, 11);
		this.el.style.setProperty('--arn', (line.video.w / line.video.h).toFixed(4));
		const v = this.video;
		v.muted = true;
		v.playsInline = true;
		v.preload = 'auto';
		v.poster = line.video.poster;
		/* H.264 FIRST, WITH ITS CODEC NAMED. Chrome and Safari decode H.264 in hardware on
		   every Mac; VP9 is often decoded in software, and three software decodes next to the
		   console's own drawing is where the picture fell behind the sound. The codec string
		   lets a browser without H.264 (open-source Chromium) skip to the WebM cleanly. */
		const [a, b] = v.querySelectorAll('source');
		a.type = 'video/mp4; codecs="avc1.64001F"';
		a.src = line.video.mp4;
		b.type = 'video/webm; codecs="vp9"';
		b.src = line.video.webm;
		v.load();
		this.setSpeaker(0);
	}

	/** Resolves once enough of the picture is in to play through, or after `ms` anyway. */
	ready(ms: number): Promise<void> {
		const v = this.video;
		if (v.readyState >= 3) return Promise.resolve();
		return new Promise((res) => {
			const done = () => { v.removeEventListener('canplaythrough', done); res(); };
			v.addEventListener('canplaythrough', done);
			window.setTimeout(done, ms);
		});
	}

	private setSpeaker(i: number): void {
		const sp = this.line.speakers[i];
		if (!sp) return;
		this.who.textContent = sp.name;
		this.role.textContent = sp.role;
		this.role.hidden = !sp.role;
	}

	/** START THE PICTURE FIRST. A video asked to play takes a moment to present its first
	 *  frame — longer on a cold decoder — while a sound buffer starts on the instant. Started
	 *  together, the voice ran ahead and the picture spent seconds catching up: "the video
	 *  lags while the sound is already playing". So the picture is started first and the
	 *  sound waits for its first painted frame (at most 450 ms). */
	async prime(): Promise<void> {
		const v = this.video;
		if (!this.realtime) return;
		v.playbackRate = 1;
		if (v.currentTime > 0.05 && this.canSeek(0)) {
			try { v.currentTime = 0; } catch { /* not seekable yet */ }
		}
		const painted = new Promise<void>((res) => {
			const rvfc = (v as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }).requestVideoFrameCallback;
			if (typeof rvfc === 'function') rvfc.call(v, () => res());
			else v.addEventListener('playing', () => res(), { once: true });
		});
		void v.play().catch(() => {});
		await Promise.race([painted, new Promise((r) => window.setTimeout(r, 450))]);
	}

	/** The clip's sound has started: from here the picture follows it. */
	speak(): void {
		this.start = this.clock.t;
		this.live = true;
		this.video.loop = false;
		if (this.realtime && this.video.paused) void this.video.play().catch(() => {});
	}

	private canSeek(t: number): boolean {
		const r = this.video.seekable;
		for (let i = 0; i < r.length; i++) if (t >= r.start(i) && t <= r.end(i)) return true;
		return false;
	}

	/** After its turn the window keeps moving, muted and looping — one screen in the wall. */
	settle(): void {
		this.live = false;
		this.video.loop = true;
		this.video.playbackRate = 1;
		if (this.realtime && this.video.paused) void this.video.play().catch(() => {});
	}

	/** Every frame: speaker label, and the picture held to the sound. */
	tick(paused: boolean): void {
		const v = this.video;
		if (paused) {
			if (!v.paused) v.pause();
			return;
		}
		if (this.start < 0) return;
		if (this.realtime && v.paused && (this.live || v.loop)) void v.play().catch(() => {});
		if (!this.live) return;
		const t = (this.clock.t - this.start) / 1000;
		let k = 0;
		this.line.speakers.forEach((sp, i) => {
			const w = this.line.words[sp.at];
			// The same beat the caption turns its page on, so name and words change together.
			if (w && t >= w.t0 - 0.06) k = i;
		});
		this.setSpeaker(k);
		if (this.realtime && t < this.line.duration && v.readyState >= 2) {
			/* HELD TO THE SOUND, GENTLY. A small drift is closed by running the picture up to
			   8% fast or slow, which nobody sees; only a large one (a stall in decoding) is
			   corrected with a jump, at most once every 1.5 s, and only to a point the browser
			   says it can reach. The first version jumped on every frame the picture was more
			   than 0.15 s out — and from a server that does not serve byte ranges a video
			   cannot jump at all, so every jump landed back on zero and the picture never
			   moved: sound playing over a frozen first frame. */
			const drift = v.currentTime - t;
			const now = this.clock.t;
			if (Math.abs(drift) > 0.6 && now - this.lastSeek > 1500 && this.canSeek(t)) {
				this.lastSeek = now;
				v.playbackRate = 1;
				try { v.currentTime = t; } catch { /* seeking not ready */ }
			} else {
				const rate = Math.abs(drift) < 0.04 ? 1 : 1 - Math.max(-0.08, Math.min(0.08, drift * 0.4));
				if (Math.abs(v.playbackRate - rate) > 0.005) v.playbackRate = rate;
			}
		}
	}

	stop(): void {
		this.live = false;
		this.video.pause();
		this.video.loop = false;
		this.subs.hide();
	}
}

/* ── the hook ────────────────────────────────────────────────────────────────── */

export class Hook {
	private readonly stage: HTMLElement;
	private readonly news: HTMLElement;
	private readonly echoes: HTMLElement;
	private readonly code: HTMLCanvasElement;
	private readonly windows: Map<string, ClipWindow>;
	private readonly narrator: Narrator;
	private readonly stops: Array<() => void> = [];
	private intensity = 0;
	private readonly realtime: boolean;
	/** Clears the headline cards out of the way of a window that has just arrived or moved. */
	private makeRoom: () => void = () => {};
	/** From Musk on, headlines may cover the receded windows; `burst` of them go up at once. */
	private wallNews: (burst: number) => void = () => {};

	constructor(
		private readonly clock: Clock,
		host: HTMLElement,
		ac: AudioContext | null,
		out: AudioNode | null,
		private readonly score: Score | null,
		private readonly bundle: Bundle | null,
		private readonly log: (id: string, detail?: Record<string, unknown>) => void,
		strict: boolean,
	) {
		this.stage = host.querySelector<HTMLElement>('[data-dt-hook]')!;
		this.news = host.querySelector<HTMLElement>('[data-dt-hook-news]')!;
		this.echoes = host.querySelector<HTMLElement>('[data-dt-hook-echo]')!;
		this.code = host.querySelector<HTMLCanvasElement>('[data-dt-hook-code]')!;
		this.realtime = clock.speed === 1;
		this.windows = new Map(CLIPS.map((l) => [l.id, new ClipWindow(clock, host, l, this.realtime)]));
		const sink: SubtitleSink = {
			show: (line, elapsed) => this.windows.get(line.id)?.subs.show(line, elapsed),
			release: (id) => this.windows.get(id)?.subs.release(id),
		};
		const manifest: VoiceManifest = { cut: 'hook', lines: CLIPS, total: 0 };
		this.narrator = new Narrator(clock, manifest, ac, out, sink, score, strict);
	}

	static get lines(): number { return CLIPS.length; }

	/** Decode the sound and let the pictures buffer, before the curtain lifts. */
	async preload(): Promise<void> {
		await this.narrator.preload();
		if (this.realtime) await Promise.all([...this.windows.values()].map((w) => w.ready(6000)));
	}

	private every(fn: (t: number) => void): void {
		this.stops.push(this.clock.every(fn));
	}

	async play(say: (id: string, s: Spoken) => void): Promise<void> {
		const stage = this.stage;
		const [hinton, coxon, musk] = CLIPS.map((l) => this.windows.get(l.id)!);
		stage.hidden = false;
		stage.classList.remove('is-cut', 'is-glitch', 'is-peak', 'is-wall');
		await new Promise((r) => requestAnimationFrame(r));
		stage.classList.add('is-on');
		this.every(() => { for (const w of this.windows.values()) w.tick(this.clock.paused); });
		this.startCode();
		this.startNews();
		this.startEchoes();
		this.score?.start(2);
		this.score?.chord('dark', 0.5);
		this.score?.brightness(0.05, 0.5);

		// ── Hinton, alone, in the middle of the screen, the text storm around him ──
		this.score?.swell(0.45, 0.8);
		await this.clock.wait(450);
		this.score?.braam(0.9);
		hinton.el.classList.add('is-solo');
		this.enter(hinton);
		await this.clock.wait(300);
		this.score?.heartbeat(true, 58);
		const h = await this.speak(hinton, say);
		this.ramp(0.05, 0.3, hinton.line.duration * 1000);
		await h.after(hinton.line.duration - 1.25);
		this.score?.swell(0.55);
		await h.after(hinton.line.duration - 0.7);

		// ── CNN, to the right, as Hinton finishes — and Hinton makes room ────────
		hinton.el.classList.remove('is-solo');
		this.enter(coxon);
		this.score?.hit(0.45);
		this.score?.heartbeat(true, 76);
		await h.done;
		hinton.settle();
		this.recede(hinton);
		const c = await this.speak(coxon, say);
		this.ramp(0.3, 0.72, coxon.line.duration * 1000);
		await c.after(coxon.line.duration - 1.15);
		this.score?.swell(0.55);
		await c.after(coxon.line.duration - 0.6);

		// ── Musk, lower left ─────────────────────────────────────────────────────
		this.enter(musk);
		this.score?.hit(0.55);
		this.score?.heartbeat(true, 96);
		await c.done;
		coxon.settle();
		this.recede(coxon);
		stage.classList.add('is-wall');
		this.wallNews(3);
		const m = await this.speak(musk, say);
		this.ramp(0.72, 1, musk.line.duration * 1000);
		await m.after(musk.line.duration - 0.5);
		this.score?.riser(1.15);
		await m.done;
		musk.settle();

		// ── everything at once, then it tears ────────────────────────────────────
		stage.classList.add('is-peak');
		this.wallNews(16);
		await this.clock.wait(650);
		stage.classList.add('is-glitch');
		this.score?.heartbeat(false);
		this.score?.stutter(0.42);
		await this.clock.wait(420);
		this.score?.hit(1);
		this.score?.subdrop(1);
		stage.classList.add('is-cut');
		this.log('hook-cut');
		this.teardown();
		await this.clock.wait(650);
	}

	private async speak(w: ClipWindow, say: (id: string, s: Spoken) => void): Promise<Spoken> {
		await w.prime();
		const s = this.narrator.say(w.line.id);
		w.speak();
		w.el.classList.add('is-speaking');
		say(w.line.id, s);
		s.done.then(() => w.el.classList.remove('is-speaking')).catch(() => {});
		return s;
	}

	/** Each window pops in where it sits — never sliding in from off screen, where it was
	 *  caught half in and half out of frame. */
	private enter(w: ClipWindow): void {
		w.el.hidden = false;
		w.el.classList.remove('is-back');
		void w.el.offsetWidth;
		w.el.classList.add('is-in');
		this.makeRoom();
		this.log('clip-in', { clip: w.line.id });
	}

	private recede(w: ClipWindow): void {
		w.el.classList.add('is-back');
	}

	/** Where the windows on screen — frame, and caption unless receded — will stand once
	 *  they have settled, so the headlines keep clear of them. Worked out from the layout,
	 *  not measured, because a measurement taken while a window grows or glides into place
	 *  gives where it is on the way. The centre is (--cx, --cy) — or the middle of the
	 *  screen while Hinton is alone — and the scale 1, 1.12 alone, 0.94 receded. The caption
	 *  is held at two lines' height whatever it shows now, since the next phrase may be
	 *  longer. `backToo: false` leaves out the receded windows (the peak's wall covers them). */
	private occupied(backToo = true): Box[] {
		const W = window.innerWidth;
		const H = window.innerHeight;
		const out: Box[] = [];
		for (const w of this.windows.values()) {
			const el = w.el;
			if (!el.classList.contains('is-in')) continue;
			const solo = el.classList.contains('is-solo');
			const back = el.classList.contains('is-back');
			if (back && !backToo) continue;
			const k = solo ? 1.12 : back ? 0.94 : 1;
			const cx = solo ? W / 2 : el.offsetLeft;
			const cy = solo ? H * 0.46 : el.offsetTop;
			const ow = el.offsetWidth;
			const oh = el.offsetHeight;
			// A child's box, from its layout offsets inside the window (which leave out its own
			// transform: a caption centred with translate(-50%) is shifted back by hand).
			const box = (x: number, y: number, w: number, h: number): Box => {
				const left = cx + (x - ow / 2) * k;
				const top = cy + (y - oh / 2) * k;
				return { left, top, right: left + w * k, bottom: top + h * k };
			};
			const frame = el.querySelector<HTMLElement>('.dt-win-frame')!;
			out.push(box(frame.offsetLeft, frame.offsetTop, frame.offsetWidth, frame.offsetHeight));
			const meta = el.querySelector<HTMLElement>('.dt-win-meta')!;
			if (back || !meta.offsetWidth) continue;
			const mw = meta.offsetWidth;
			const mh = meta.offsetHeight;
			const tall = Math.max(mh, 104);
			const cap = el.dataset.cap;
			if (cap === 'below') out.push(box(meta.offsetLeft - mw / 2, meta.offsetTop, mw, tall));
			else if (cap === 'right') out.push(box(meta.offsetLeft, meta.offsetTop - tall / 2, mw, tall));
			else out.push(box(meta.offsetLeft, meta.offsetTop + mh - tall, mw, tall));
		}
		return out;
	}

	/** Intensity drives the log's speed, the headline rate and the wall's density. */
	private ramp(from: number, to: number, ms: number): void {
		void this.clock.tween(ms, (p) => { this.intensity = from + (to - from) * p; }).catch(() => {});
	}

	/* ── the training log behind everything ───────────────────────────────────
	   DRAWN ONCE, SLID BEHIND. Setting two screens of monospace text every frame was the
	   single heaviest thing in the hook. The log is typeset once into a strip and each frame
	   only copies a slice of it; columns are spaced by the width of the longest line, so they
	   never print through each other. */
	private startCode(): void {
		const cv = this.code;
		const ctx = cv.getContext('2d');
		if (!ctx) return;
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		const W = window.innerWidth;
		const H = window.innerHeight;
		cv.width = Math.round(W * dpr);
		cv.height = Math.round(H * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const lines = logLines(this.bundle);
		const LH = 17;
		const FONT = '500 11.5px ui-monospace, SFMono-Regular, Menlo, monospace';
		const strip = document.createElement('canvas');
		const sctx = strip.getContext('2d');
		if (!sctx) return;
		sctx.font = FONT;
		const colW = Math.ceil(Math.max(...lines.map((l) => sctx.measureText(l).width))) + 36;
		strip.width = colW;
		strip.height = lines.length * LH;
		sctx.font = FONT;
		sctx.textBaseline = 'top';
		lines.forEach((l, i) => {
			const bad = /destroyed|0\.1000/.test(l);
			sctx.fillStyle = bad ? 'rgb(224,100,95)' : 'rgb(169,174,196)';
			sctx.fillText(l, 0, i * LH);
		});
		const cols = Math.ceil(W / colW) + 1;
		const total = strip.height;
		let offset = 0;
		let last = this.clock.t;
		this.every((t) => {
			const dt = Math.max(0, t - last) / 1000;
			last = t;
			// From a crawl to a torrent: 18 to 520 px a second across the hook.
			offset += dt * (18 + 500 * this.intensity * this.intensity);
			ctx.clearRect(0, 0, W, H);
			ctx.globalAlpha = 0.07 + 0.16 * this.intensity;
			for (let c = 0; c < cols; c++) {
				const y = (offset * (0.8 + 0.25 * c) + c * 311) % total;
				const x = c * colW + 18 - colW * 0.35;
				ctx.drawImage(strip, x, -y);
				if (total - y < H) ctx.drawImage(strip, x, total - y);
			}
			ctx.globalAlpha = 1;
		});
	}

	/* ── the headlines and the quotes ────────────────────────────────────────
	   ORDERLY, AND NEVER ON TOP OF EACH OTHER. Cards stand upright, their left edges on the
	   lines of a twelve-column grid, and all rise together at the same slow speed — so no two
	   can drift into each other. A card goes up only where it clears every other card and
	   every window and caption for its whole rise; where nothing is free it waits for the
	   next turn, so the screen fills up and never piles up. When a window arrives or moves,
	   the cards in its way fade out to make room. From Musk on they may cover the receded
	   windows, and at the peak a wall of them goes up at once — still one clear of the
	   next. The most recent (2025–26) come first. */
	private startNews(): void {
		const rand = rng(7);
		const recent = HEADLINES.filter((h) => h.recent);
		const older = HEADLINES.filter((h) => !h.recent);
		const shuffle = <T,>(xs: T[]) => xs.map((x) => ({ x, k: rand() })).sort((a, b) => a.k - b.k).map((o) => o.x);
		const r1 = shuffle(recent);
		const o1 = shuffle(older);
		// Two recent for every older one, until the recent run out.
		const order: typeof HEADLINES = [];
		while (r1.length || o1.length) {
			if (r1.length) order.push(r1.shift()!);
			if (r1.length) order.push(r1.shift()!);
			if (o1.length) order.push(o1.shift()!);
		}
		const W = window.innerWidth;
		const H = window.innerHeight;
		const RISE = 7; // px a second, the same for every card
		const EDGE = 16;
		const col = (W - 2 * EDGE) / 12;
		// The first card once Hinton has landed in the middle (he pops in at 0.45 s and grows
		// for 0.62 s), so none is placed where he is about to be.
		let next = this.clock.t + 1150;
		let i = 0;
		type Card = { el: HTMLElement; born: number; life: number; x: number; y: number; w: number; h: number; gone?: number };
		const live: Card[] = [];
		const hits = (a: Box, b: Box, pad: number) =>
			a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;
		// Where a card stands at t, and the whole of the rise it has left.
		const at = (c: Card, t: number): Box => {
			const y = c.y - (RISE * (t - c.born)) / 1000;
			return { left: c.x, top: y, right: c.x + c.w, bottom: y + c.h };
		};
		const rest = (c: Card, t: number): Box => {
			const b = at(c, t);
			return { ...b, top: b.top - (RISE * Math.max(0, c.born + c.life - t)) / 1000 };
		};
		this.makeRoom = () => {
			const t = this.clock.t;
			const busy = this.occupied();
			for (const c of live) if (c.gone === undefined && busy.some((r) => hits(rest(c, t), r, 12))) c.gone = t;
		};
		let peak = false;
		let wall = 0;
		this.wallNews = (burst) => {
			peak = true;
			wall = burst;
		};
		// One card, born at `born` (a burst staggers them), where it clears everything.
		const place = (t: number, born: number): boolean => {
			const h = order[i % order.length];
			const el = document.createElement('div');
			el.className = `dt-news${h.quote ? ' is-quote' : ''}`;
			const src = document.createElement('small');
			src.textContent = `${h.outlet} · ${h.date}`;
			const txt = document.createElement('p');
			txt.textContent = h.quote ? `“${h.text}”` : h.text;
			el.append(txt, src);
			// Two sizes, and a narrow column for the strips beside a window.
			const big = rand() < 0.45;
			el.style.setProperty('--depth', big ? '1' : '0.62');
			this.news.append(el);
			const life = 5600 + rand() * 1800;
			const drop = (RISE * life) / 1000;
			const busy = this.occupied(!peak);
			let spot: Card | null = null;
			const widths = [big ? 330 + rand() * 40 : 250 + rand() * 30, 180];
			for (const [n, want] of widths.entries()) {
				const spanCols = Math.max(2, Math.round(Math.min(want, W * 0.3) / col));
				el.classList.toggle('is-narrow', n > 0);
				el.style.width = `${Math.round(spanCols * col - 14)}px`;
				const bw = el.offsetWidth;
				const bh = el.offsetHeight;
				for (let k = 0; k < 60 && !spot; k++) {
					const x = EDGE + Math.floor(rand() * (13 - spanCols)) * col;
					const y = Math.round((EDGE + drop + rand() * (H - 2 * EDGE - drop - bh)) / 8) * 8;
					const c: Card = { el, born, life, x, y, w: bw, h: bh };
					if (busy.some((r) => hits(rest(c, t), r, 16))) continue;
					if (live.some((o) => hits(at(c, t), at(o, t), 22))) continue;
					spot = c;
				}
				if (spot) break;
			}
			if (!spot) {
				el.remove();
				return false;
			}
			i++;
			live.push(spot);
			return true;
		};
		this.every((t) => {
			if (wall > 0) {
				for (let k = 0; k < wall; k++) place(t, t + k * 40);
				wall = 0;
			} else if (t >= next) {
				// From one every 0.55 s to one every 0.22 s as the warnings pile up.
				next = t + 550 - 330 * this.intensity;
				place(t, t);
			}
			for (let k = live.length - 1; k >= 0; k--) {
				const n = live[k];
				const p = (t - n.born) / n.life;
				const out = n.gone === undefined ? 1 : 1 - (t - n.gone) / 300;
				if (p >= 1 || out <= 0) {
					n.el.remove();
					live.splice(k, 1);
					continue;
				}
				const b = at(n, t);
				const fade = Math.max(0, Math.min(1, p / 0.07, (1 - p) / 0.15) * out);
				n.el.style.transform = `translate3d(${b.left.toFixed(1)}px, ${b.top.toFixed(1)}px, 0)`;
				n.el.style.opacity = fade.toFixed(3);
			}
		});
		this.stops.push(() => {
			for (const n of live) n.el.remove();
			live.length = 0;
			this.makeRoom = () => {};
			this.wallNews = () => {};
		});
	}

	/* ── the wall: every speaker, still moving, on small muted screens ────────
	   ONE READ PER VIDEO. Copying a video frame onto a canvas is a trip through the decoder's
	   memory; eight tiles each reading their own copy thirty times a second was eight of
	   those trips a frame. Each source is read once, into a small buffer, a few times a
	   second, and the tiles copy the buffer — canvas to canvas, which is cheap. */
	private startEchoes(): void {
		const rand = rng(23);
		const W = window.innerWidth;
		const H = window.innerHeight;
		const vids = CLIPS.map((l) => this.windows.get(l.id)!);
		const buffers = vids.map((src) => {
			const cv = document.createElement('canvas');
			cv.width = 160;
			cv.height = Math.round(160 * src.line.video.h / src.line.video.w);
			return { src, cv, ctx: cv.getContext('2d') };
		});
		type Tile = { cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; buf: (typeof buffers)[number]; x: number; y: number; dx: number; dy: number; at: number };
		const tiles: Tile[] = [];
		const spots = [[0.02, 0.05], [0.9, 0.04], [0.02, 0.42], [0.62, 0.86], [0.46, 0.02], [0.9, 0.84]];
		spots.forEach(([fx, fy], i) => {
			const buf = buffers[i % buffers.length];
			const h = 64 + rand() * 50;
			const cv = document.createElement('canvas');
			cv.className = 'dt-echo';
			cv.width = Math.round(h * buf.src.line.video.w / buf.src.line.video.h);
			cv.height = Math.round(h);
			const ctx = cv.getContext('2d');
			if (!ctx) return;
			this.echoes.append(cv);
			tiles.push({ cv, ctx, buf, x: fx * W, y: fy * H, dx: (rand() - 0.5) * 14, dy: (rand() - 0.5) * 10, at: 0.18 + i * 0.12 });
		});
		let frame = 0;
		this.every((t) => {
			frame++;
			const read = frame % 6 === 0;
			if (read) {
				for (const b of buffers) {
					if (b.ctx && b.src.video.readyState >= 2 && b.src.el.classList.contains('is-in')) b.ctx.drawImage(b.src.video, 0, 0, b.cv.width, b.cv.height);
				}
			}
			for (const tl of tiles) {
				const on = this.intensity >= tl.at && tl.buf.src.el.classList.contains('is-in');
				if (tl.cv.classList.contains('is-on') !== on) tl.cv.classList.toggle('is-on', on);
				if (!on) continue;
				if (read) tl.ctx.drawImage(tl.buf.cv, 0, 0, tl.cv.width, tl.cv.height);
				const s = t / 1000;
				tl.cv.style.transform = `translate3d(${(tl.x + tl.dx * s).toFixed(1)}px, ${(tl.y + tl.dy * s).toFixed(1)}px, 0)`;
			}
		});
		this.stops.push(() => { for (const tl of tiles) tl.cv.remove(); });
	}

	private teardown(): void {
		for (const s of this.stops.splice(0)) s();
		for (const w of this.windows.values()) w.stop();
		const ctx = this.code.getContext('2d');
		ctx?.clearRect(0, 0, this.code.width, this.code.height);
	}

	/** Gone, at once — the end of the hook, or an Esc in the middle of it. */
	clear(): void {
		this.teardown();
		this.narrator.stop();
		this.stage.classList.remove('is-on', 'is-peak', 'is-glitch', 'is-cut', 'is-wall');
		this.stage.hidden = true;
		for (const w of this.windows.values()) {
			w.el.hidden = true;
			w.el.classList.remove('is-in', 'is-back', 'is-speaking');
		}
	}
}

/** The run's own training log, as lines — the text racing behind the hook. */
function logLines(b: Bundle | null): string[] {
	if (!b) return ['epoch — · waiting for the archived run'];
	const out: string[] = [];
	const spe = b.conditions.steps_per_epoch || 391;
	const acc = b.series.ormas.accuracy;
	const corr = b.series.ormas.corrections;   // per epoch; the log shows the running total
	let total = 0;
	for (let e = 0; e < acc.length; e++) {
		total += corr?.[e] ?? 0;
		const h = b.health.find((f) => f.epoch === e);
		const nodes = (h?.nodes ?? []).map((n) => (n.weight_norm === 0
			? `L${n.id} destroyed wn 0.00`
			: `L${n.id} ${n.state ?? '—'} ${(n.goodness ?? 0).toFixed(2)}`)).join('  ');
		out.push(`[epoch ${String(e).padStart(3, ' ')} | step ${(e * spe).toLocaleString('en-GB').padStart(6, ' ')}]  acc ${acc[e].toFixed(4)}  ${nodes}  corrections ${total}`);
	}
	return out;
}
