// WHAT THE TOUR DRAWS OVER THE CONSOLE: subtitles, leader-line tags and kinetic words.
//
// LESS TEXT, ANCHORED TO THINGS. The first version froze the frame under a card of
// figures; this one never stops the picture. A tag is three to seven words on a thin line
// to the exact thing being talked about — a stage, a number, a box — and it follows that
// thing every frame, through a zoom or a turn. The voice carries the explanation, the
// subtitle carries the voice, and the picture carries everything else.
//
// Every element here exists in DemoTour.astro's static markup, for the reason given there
// (scoped styles). The only elements made in script are the subtitle's word spans and the
// kinetic word's letter spans, and those are styled through :global() under a scoped parent.

import type { Clock } from './clock';
import type { SubtitleSink, VoiceLine } from './audio';

type Pt = { x: number; y: number };

/* ── subtitles ─────────────────────────────────────────────────────────────── */

export class Subtitles implements SubtitleSink {
	private stop: (() => void) | null = null;
	private owner: string | null = null;
	private hideTimer = 0;

	/** `maxWords`: a sentence longer than this is split at its last comma before the limit
	 *  (or at the limit plus four, whichever comes first) — for captions under a narrow
	 *  window, where a 23-word question would otherwise stack five lines deep. */
	constructor(
		private readonly clock: Clock,
		private readonly el: HTMLElement,
		private readonly lineEl: HTMLElement,
		private readonly maxWords = Infinity,
	) {}

	/** ONE SENTENCE AT A TIME. A whole line as a subtitle ran to three rows at 1440px, which
	 *  is a paragraph, not a caption. The line is split into its sentences (at a full stop,
	 *  a question mark or a spoken pause, never inside a figure like 79.9) and only the one
	 *  being spoken is on screen, its words lighting as they are said. A pause mark that
	 *  opens a sentence is timing, not text, and is not shown. */
	show(line: VoiceLine, elapsed: () => number): void {
		this.stop?.();
		window.clearTimeout(this.hideTimer);
		this.owner = line.id;
		const pages: number[][] = [[]];
		line.words.forEach((w, i) => {
			const page = pages[pages.length - 1];
			if (w.w === '…') {
				if (page.length) pages.push([]);
				return;
			}
			page.push(i);
			const last = i === line.words.length - 1;
			const sentence = /[.!?]$/.test(w.w) && !/^\d+\.\d/.test(w.w);
			const long = page.length >= this.maxWords && (/,$/.test(w.w) || page.length >= this.maxWords + 4);
			if ((sentence || long) && !last) pages.push([]);
		});
		const kept = pages.filter((p) => p.length);
		let shown = -1;
		let spans: HTMLSpanElement[] = [];
		const render = (k: number) => {
			shown = k;
			this.lineEl.textContent = '';
			spans = kept[k].map((wi, j) => {
				const s = document.createElement('span');
				s.textContent = line.words[wi].w;
				// Figures and the product's name carry the accent: the words a viewer should
				// be able to read back from a paused frame.
				if (/\d/.test(line.words[wi].w) || /^ORMAS\b/.test(line.words[wi].w)) s.className = 'is-key';
				this.lineEl.append(s);
				if (j < kept[k].length - 1) this.lineEl.append(' ');
				return s;
			});
		};
		render(0);
		this.el.hidden = false;
		requestAnimationFrame(() => this.el.classList.add('is-on'));
		this.stop = this.clock.every(() => {
			const t = elapsed();
			let k = shown;
			while (k + 1 < kept.length && t >= line.words[kept[k + 1][0]].t0 - 0.06) k++;
			if (k !== shown) render(k);
			kept[shown].forEach((wi, j) => {
				if (t >= line.words[wi].t0 - 0.03) spans[j].classList.add('is-said');
			});
		});
	}

	/** The line has ended. It stays up for a breath, unless the next line replaces it. */
	release(id: string): void {
		if (this.owner !== id) return;
		this.stop?.();
		this.stop = null;
		this.lineEl.querySelectorAll('span').forEach((s) => s.classList.add('is-said'));
		this.hideTimer = window.setTimeout(() => {
			if (this.owner === id) this.clear();
		}, 900 / Math.max(1, this.clock.speed));
	}

	clear(): void {
		this.stop?.();
		this.stop = null;
		this.owner = null;
		this.el.classList.remove('is-on');
	}

	hide(): void {
		this.clear();
		this.el.hidden = true;
	}
}

/* ── leader-line tags ───────────────────────────────────────────────────────── */

export interface TagSpec {
	/** The point the line starts from, read every frame. null hides the tag for that frame. */
	at: () => Pt | null;
	/** Small caps above the value, optional. */
	k?: string;
	/** The value. Empty for a bare ping on the point. */
	v?: string;
	/** Where the label sits relative to the point, in screen pixels. */
	dx?: number;
	dy?: number;
	tone?: 'amber' | 'warn' | 'dim' | 'fg';
}

export interface Tag { hide(): void }

interface Slot {
	el: HTMLElement;
	k: HTMLElement;
	v: HTMLElement;
	g: SVGGElement;
	path: SVGPathElement;
	dot: SVGCircleElement;
	ring: SVGCircleElement;
	busy: boolean;
	stop: (() => void) | null;
	/** Bumped on every show, so a fade-out still pending from the last use of the slot
	 *  cannot hide the tag that has since taken it. */
	gen: number;
}

export class Tags {
	private slots: Slot[];

	constructor(private readonly clock: Clock, host: HTMLElement) {
		const els = [...host.querySelectorAll<HTMLElement>('[data-dt-tag]')];
		const gs = [...host.querySelectorAll<SVGGElement>('[data-dt-lead]')];
		this.slots = els.map((el, i) => ({
			el,
			k: el.querySelector('[data-dt-tag-k]') as HTMLElement,
			v: el.querySelector('[data-dt-tag-v]') as HTMLElement,
			g: gs[i],
			path: gs[i].querySelector('path') as SVGPathElement,
			dot: gs[i].querySelector('[data-dt-dot]') as SVGCircleElement,
			ring: gs[i].querySelector('[data-dt-ring]') as SVGCircleElement,
			busy: false,
			stop: null,
			gen: 0,
		}));
	}

	show(spec: TagSpec): Tag {
		const slot = this.slots.find((s) => !s.busy) ?? this.slots[0];
		this.release(slot, true);
		slot.busy = true;
		const gen = ++slot.gen;
		const dx = spec.dx ?? 70;
		const dy = spec.dy ?? -56;
		const bare = !spec.v;
		slot.k.textContent = spec.k ?? '';
		slot.k.hidden = !spec.k;
		slot.v.textContent = spec.v ?? '';
		slot.el.hidden = bare;
		slot.el.dataset.tone = spec.tone ?? 'amber';
		slot.g.dataset.tone = spec.tone ?? 'amber';
		slot.g.classList.toggle('is-bare', bare);
		slot.el.classList.toggle('is-left', dx < 0);

		const place = () => {
			const p = spec.at();
			if (!p) {
				slot.g.style.opacity = '0';
				slot.el.style.opacity = '0';
				return;
			}
			slot.g.style.opacity = '';
			slot.el.style.opacity = '';
			slot.dot.setAttribute('cx', p.x.toFixed(1));
			slot.dot.setAttribute('cy', p.y.toFixed(1));
			slot.ring.setAttribute('cx', p.x.toFixed(1));
			slot.ring.setAttribute('cy', p.y.toFixed(1));
			if (bare) {
				slot.path.setAttribute('d', '');
				return;
			}
			// An elbow: a short diagonal off the point, then level into the label.
			const ex = p.x + dx * 0.4;
			const ey = p.y + dy;
			const lx = p.x + dx;
			slot.path.setAttribute('d', `M${p.x.toFixed(1)} ${p.y.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)} L${lx.toFixed(1)} ${ey.toFixed(1)}`);
			const w = slot.el.offsetWidth;
			const h = slot.el.offsetHeight;
			const left = dx < 0 ? lx - w - 6 : lx + 6;
			slot.el.style.transform = `translate3d(${left.toFixed(1)}px, ${(ey - h / 2).toFixed(1)}px, 0)`;
		};
		place();
		slot.stop = this.clock.every(place);
		requestAnimationFrame(() => {
			slot.g.classList.add('is-on');
			slot.el.classList.add('is-on');
		});
		return { hide: () => { if (slot.gen === gen) this.release(slot); } };
	}

	private release(slot: Slot, now = false): void {
		if (!slot.busy) return;
		slot.g.classList.remove('is-on');
		slot.el.classList.remove('is-on');
		const stop = slot.stop;
		slot.stop = null;
		const gen = slot.gen;
		const finish = () => {
			stop?.();
			if (slot.gen !== gen) return;
			slot.el.hidden = true;
			slot.busy = false;
		};
		if (now) finish();
		else window.setTimeout(finish, 320 / Math.max(1, this.clock.speed));
	}

	clear(): void {
		for (const s of this.slots) this.release(s);
	}

	reset(): void {
		for (const s of this.slots) {
			s.gen++;
			s.stop?.();
			s.stop = null;
			s.busy = false;
			s.g.classList.remove('is-on');
			s.el.classList.remove('is-on');
			s.el.hidden = true;
		}
	}
}

/* ── kinetic words ─────────────────────────────────────────────────────────── */

export class Kinetic {
	constructor(
		private readonly clock: Clock,
		private readonly el: HTMLElement,
		private readonly wordEl: HTMLElement,
		private readonly subEl: HTMLElement,
		private readonly scrim: HTMLElement,
	) {}

	/** One word, huge and tracked out, over `over` (or the middle of the screen); it
	 *  assembles letter by letter, holds, and dissolves. Does not block the tour. */
	async show(word: string, opts: { sub?: string; over?: () => DOMRect | null; ms?: number; tone?: 'amber' | 'fg' | 'warn'; scrim?: boolean } = {}): Promise<void> {
		const ms = opts.ms ?? 1600;
		this.wordEl.textContent = '';
		[...word].forEach((ch, i) => {
			const s = document.createElement('span');
			s.textContent = ch === ' ' ? ' ' : ch;
			s.style.transitionDelay = `${(i * 34) / Math.max(1, this.clock.speed)}ms`;
			this.wordEl.append(s);
		});
		this.subEl.textContent = opts.sub ?? '';
		this.subEl.hidden = !opts.sub;
		this.el.dataset.tone = opts.tone ?? 'fg';
		const r = opts.over?.() ?? null;
		const cx = r ? r.left + r.width / 2 : window.innerWidth / 2;
		const cy = r ? r.top + r.height / 2 : window.innerHeight / 2;
		this.el.style.left = `${cx.toFixed(1)}px`;
		this.el.style.top = `${cy.toFixed(1)}px`;
		this.el.hidden = false;
		this.el.classList.remove('is-out');
		await new Promise((res) => requestAnimationFrame(res));
		this.el.classList.add('is-on');
		if (opts.scrim) this.scrim.classList.add('is-on');
		await this.clock.wait(ms);
		this.el.classList.add('is-out');
		this.scrim.classList.remove('is-on');
		await this.clock.wait(480);
		this.el.classList.remove('is-on', 'is-out');
		this.el.hidden = true;
	}

	clear(): void {
		this.el.classList.remove('is-on', 'is-out');
		this.el.hidden = true;
		this.scrim.classList.remove('is-on');
	}
}

/* ── helpers for anchors ───────────────────────────────────────────────────── */

/** A point on an element's box, read live: (0.5, 0.5) is its centre. */
export const onEl = (el: Element, ax = 0.5, ay = 0.5) => (): Pt | null => {
	const r = el.getBoundingClientRect();
	if (!r.width && !r.height) return null;
	return { x: r.left + r.width * ax, y: r.top + r.height * ay };
};
