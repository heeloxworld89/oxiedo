// THE DIRECTOR — runs the demo tour on /black-box.
//
// It owns the page for the length of the tour and gives it back exactly as it found it:
//
//   · PRESENTATION MODE. The site's nav and the console's orientation stripe step away
//     (html[data-tour=running] in DemoTour.astro) so the console has the whole screen, as
//     an application does in a product film. The change happens behind a curtain, never
//     on camera.
//   · SOUND NEEDS A HAND. A browser will not play audio a page did not get a click for, so
//     the tour starts IN PLACE from the button that was pressed — no reload — and a shared
//     ?tour= link lands on a one-press start gate. The test harness (?tourspeed=N) and
//     ?mute=1 run silent and need neither.
//   · INPUT. A transparent shield takes the pointer; the keyboard is captured before any
//     page handler sees it. Space or a click pauses, Esc leaves, M mutes.
//   · TIME. One Clock (clock.ts) for every wait, so pause stops the picture and the voice
//     together, and Esc unwinds everything together.
//   · RESTORE. However it ends — finished, Esc, a navigation away, an error — the console
//     is put back: camera, boxes, overlays and sound cleared, the run paused at the first
//     epoch of the default scenario at 1×, the URL cleaned, the nav back.
//
// Test hooks, read by scripts/test-tour.mjs: window.__tourLog (every step with tour time;
// clicks carry where the cursor was against where the target was; lines carry their id
// and subtitle) and window.__tourState ('offer' | 'declined' | 'gate' | 'waiting' |
// 'running' | 'ended' | 'aborted' | 'error' | 'skipped').

import { Clock, TourAbort, minJerk, lerp } from './clock';
import { PresenterCursor } from './cursor';
import { ConsoleCamera } from './camera';
import { Narrator, Score, loadManifest, soundChain } from './audio';
import { Kinetic, Subtitles, Tags } from './overlay';
import { Hook, HOOK_ON } from './hook';
import { TrainingMesh } from './mesh';
import { runTour, type Cut, type TourCtx } from './script';
import type { ReplayHandle } from '../replay/types';

type LogEntry = { t: number; id: string; detail?: Record<string, unknown> };
type ReplayRoot = HTMLElement & { replayApi?: ReplayHandle };

declare global {
	interface Window {
		__tourLog?: LogEntry[];
		__tourState?: string;
		webkitAudioContext?: typeof AudioContext;
	}
}

const MIN_WIDTH = 1240;
const DEFAULT_SCENARIO = 'dead-layer-lesion';
let teardown: (() => void) | null = null;
let busy = false;

const asCut = (v: string | null | undefined): Cut | null =>
	v === 'full' ? 'full' : v === 'demo' || v === 'short' ? 'demo' : null;

/** Poll on animation frames, before the tour's own clock exists. */
function waitFor<T>(get: () => T | null | undefined, timeoutMs: number): Promise<T> {
	const start = performance.now();
	return new Promise((resolve, reject) => {
		const tick = () => {
			const v = get();
			if (v) return resolve(v);
			if (performance.now() - start > timeoutMs) return reject(new Error('timed out'));
			requestAnimationFrame(tick);
		};
		tick();
	});
}

const frames = (n = 2) => new Promise<void>((r) => {
	const step = (k: number) => (k <= 0 ? r() : requestAnimationFrame(() => step(k - 1)));
	step(n);
});
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

function coldOpenDone(): Promise<void> {
	const running = document.querySelector('[data-coldopen-root]:not([hidden])')
		|| document.documentElement.getAttribute('data-coldopen') === 'running';
	if (!running) return Promise.resolve();
	return new Promise((resolve) => document.addEventListener('coldopen:done', () => resolve(), { once: true }));
}

function cleanUrl(): void {
	const u = new URL(location.href);
	for (const k of ['tour', 'rec', 'tourspeed', 'mute']) u.searchParams.delete(k);
	history.replaceState(history.state, '', u);
}

/** An AudioContext made inside the click that asked for sound — the only moment a
 *  browser allows one to start. */
function audioFromGesture(): AudioContext | null {
	try {
		const AC = window.AudioContext || window.webkitAudioContext;
		if (!AC) return null;
		const ac = new AC({ latencyHint: 'playback' });
		void ac.resume();
		return ac;
	} catch {
		return null;
	}
}

export function bootDemoTour(): void {
	const host = document.querySelector<HTMLElement>('[data-demotour]');
	if (!host || host.dataset.dtReady === '1') return;
	host.dataset.dtReady = '1';
	const q = <T extends HTMLElement = HTMLElement>(s: string) => host.querySelector(s) as T;
	const html = document.documentElement;

	const launch = q('[data-dt-launch]');
	const showLauncher = () => {
		const t = html.getAttribute('data-tour');
		if (t === 'pending' || t === 'running' || t === 'gate' || t === 'offer') return;
		launch.hidden = false;
	};
	void coldOpenDone().then(showLauncher);

	const start = (cut: Cut, ac: AudioContext | null, speed = 1) => {
		if (busy) return;
		launch.hidden = true;
		void landAndRun(host, cut, speed, ac, showLauncher);
	};

	/* ── THE OFFER ─────────────────────────────────────────────────────────────
	   The first thing on an ordinary desktop landing (TourGate.astro stamps "offer"), and what
	   the corner button opens later. While it is open the guided read and autoplay wait: a
	   tour takes the page, and "no thanks" hands the console over. (coldOpenDone() below
	   resolves at once now that there is no title sequence; it stays so that a page which
	   ever has one again cannot be covered by the offer.) */
	const offer = q('[data-dt-offer]');
	let fromLanding = false;
	const onOfferKey = (e: KeyboardEvent) => {
		if (offer.hidden) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			decline();
		} else if (e.key === 'Tab') {
			// Keep focus inside the dialog while it is open.
			const f = [...offer.querySelectorAll<HTMLElement>('button')];
			const i = f.indexOf(document.activeElement as HTMLElement);
			const next = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i + 1) % f.length;
			e.preventDefault();
			f[next]?.focus();
		}
	};
	const openOffer = (landing: boolean) => {
		fromLanding = landing;
		launch.hidden = true;
		offer.hidden = false;
		window.__tourState = 'offer';
		requestAnimationFrame(() => offer.classList.add('is-on'));
		offer.querySelector<HTMLElement>('[data-dt-choose="demo"]')?.focus({ preventScroll: true });
		window.addEventListener('keydown', onOfferKey, true);
	};
	const closeOffer = () => {
		offer.classList.remove('is-on');
		offer.hidden = true;
		window.removeEventListener('keydown', onOfferKey, true);
	};
	const release = (choice: 'tour' | 'decline') => {
		if (!fromLanding) return;
		fromLanding = false;
		document.dispatchEvent(new CustomEvent('dt:offer', { detail: { choice } }));
	};
	const decline = () => {
		closeOffer();
		window.__tourState = 'declined';
		if (fromLanding) {
			html.removeAttribute('data-tour');
			release('decline');
			// Hand the console over: its guided read starts on exactly this event.
			if (!document.querySelector('[data-coldopen-root]:not([hidden])')) document.dispatchEvent(new CustomEvent('coldopen:done'));
		}
		void coldOpenDone().then(showLauncher);
	};
	host.querySelectorAll<HTMLButtonElement>('[data-dt-choose]').forEach((b) => {
		b.addEventListener('click', () => {
			// The AudioContext first, inside the click — the one moment a browser allows it.
			const ac = audioFromGesture();
			closeOffer();
			release('tour');
			start(asCut(b.dataset.dtChoose) ?? 'demo', ac);
		});
	});
	// "No thanks" and the close cross.
	host.querySelectorAll('[data-dt-decline]').forEach((b) => b.addEventListener('click', decline));
	q('[data-dt-open]').addEventListener('click', () => openOffer(false));

	const params = new URLSearchParams(location.search);
	const cut = asCut(params.get('tour'));
	if (html.getAttribute('data-tour') === 'offer') {
		// After the preloader, never over it.
		void coldOpenDone().then(() => {
			if (html.getAttribute('data-tour') === 'offer') openOffer(true);
		});
	} else if (html.getAttribute('data-tour') === 'pending' && cut) {
		const speed = Math.min(40, Math.max(1, Number(params.get('tourspeed')) || 1));
		if (speed > 1 || params.get('mute') === '1') start(cut, null, speed);
		else showGate(host, cut, (ac) => start(cut, ac), () => {
			html.removeAttribute('data-tour');
			html.removeAttribute('data-tour-rec');
			cleanUrl();
			window.__tourState = 'skipped';
			showLauncher();
		});
	}

	document.addEventListener('astro:before-swap', () => {
		teardown?.();
		teardown = null;
		window.removeEventListener('keydown', onOfferKey, true);
		delete host.dataset.dtReady;
	}, { once: true });
}

/** The one-press start for a shared ?tour= link: sound needs the press. */
function showGate(host: HTMLElement, cut: Cut, go: (ac: AudioContext | null) => void, cancel: () => void): void {
	const gate = host.querySelector<HTMLElement>('[data-dt-gate]')!;
	const btn = gate.querySelector<HTMLButtonElement>('[data-dt-gate-play]')!;
	const sub = gate.querySelector<HTMLElement>('[data-dt-gate-sub]')!;
	// The same running times the offer shows; test-tour.mjs holds both to the measured runs.
	const time = host.querySelector<HTMLElement>(`[data-dt-time="${cut}"]`)?.textContent ?? '';
	sub.textContent = cut === 'full' ? `Sound on · the demo, then all four failures · ${time}` : `Sound on · ${time}`;
	document.documentElement.setAttribute('data-tour', 'gate');
	window.__tourState = 'gate';
	gate.hidden = false;
	requestAnimationFrame(() => gate.classList.add('is-on'));
	btn.focus({ preventScroll: true });
	const close = () => {
		gate.classList.remove('is-on');
		gate.hidden = true;
		window.removeEventListener('keydown', onKey, true);
	};
	const onKey = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
			cancel();
		}
	};
	window.addEventListener('keydown', onKey, true);
	btn.addEventListener('click', () => {
		const ac = audioFromGesture();
		close();
		go(ac);
	}, { once: true });
}

async function landAndRun(host: HTMLElement, cut: Cut, speed: number, ac: AudioContext | null, showLauncher: () => void): Promise<void> {
	busy = true;
	window.__tourLog = [];
	window.__tourState = 'waiting';
	const html = document.documentElement;
	const curtain = host.querySelector<HTMLElement>('[data-dt-curtain]')!;
	const note = host.querySelector<HTMLElement>('[data-dt-curtain-note]')!;
	const giveUp = (why: string) => {
		console.warn(`[tour] not started: ${why}`);
		html.removeAttribute('data-tour');
		html.removeAttribute('data-tour-rec');
		cleanUrl();
		curtain.classList.remove('is-on');
		window.setTimeout(() => { curtain.hidden = true; }, 400);
		window.__tourState = 'skipped';
		void ac?.close();
		busy = false;
		showLauncher();
	};

	// Esc is honoured from the first frame, including while the curtain is down and the
	// narration loads — not only once the tour has started.
	let cancelled = false;
	const onEarlyKey = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			e.preventDefault();
			cancelled = true;
		}
	};
	window.addEventListener('keydown', onEarlyKey, true);
	const stopEarly = () => window.removeEventListener('keydown', onEarlyKey, true);

	// The curtain comes down first: everything that follows changes the layout.
	html.setAttribute('data-tour', 'pending');
	curtain.hidden = false;
	await frames(1);
	curtain.classList.add('is-on');
	await sleep(speed > 1 ? 60 : 480);

	let root: ReplayRoot;
	let api: ReplayHandle;
	try {
		root = await waitFor(() => document.querySelector<ReplayRoot>('.rp.rp--app'), 15000);
		api = await waitFor(() => (root.replayApi?.bundle ? root.replayApi : null), 20000);
	} catch {
		stopEarly();
		return giveUp('the console did not load');
	}
	await coldOpenDone();
	if (window.innerWidth < MIN_WIDTH) {
		stopEarly();
		return giveUp('the window is narrower than the one-screen console');
	}

	// A guided read in progress steps aside for the tour.
	if (root.classList.contains('is-guided')) root.querySelector<HTMLElement>('[data-guide-skip]')?.click();

	// Presentation mode, then the console back to its first frame, all behind the curtain.
	html.setAttribute('data-tour', 'running');
	window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
	api.pause();
	if (api.bundle?.key !== DEFAULT_SCENARIO) {
		const tab = root.querySelector<HTMLElement>(`[data-rail-scenario="${DEFAULT_SCENARIO}"]`);
		if (tab) {
			const loaded = new Promise<void>((r) => {
				const on = (e: Event) => {
					if ((e as CustomEvent).detail?.key === DEFAULT_SCENARIO) {
						root.removeEventListener('replay:loaded', on);
						r();
					}
				};
				root.addEventListener('replay:loaded', on);
			});
			tab.click();
			await Promise.race([loaded, sleep(8000)]);
		}
	}
	const one = root.querySelector<HTMLElement>('[data-rate="1"]');
	if (one && one.getAttribute('aria-pressed') !== 'true') one.click();
	api.engine?.seekEpoch(0);
	api.sealed.setBox(1);
	api.ormas.setBox(1);

	let manifest;
	const slow = window.setTimeout(() => { note.hidden = false; }, 600);
	try {
		manifest = await loadManifest(cut);
	} catch (e) {
		window.clearTimeout(slow);
		console.error(e);
		stopEarly();
		api.sealed.setBox(null);
		api.ormas.setBox(null);
		return giveUp('the narration did not load');
	}
	await frames(3);
	stopEarly();
	if (cancelled) {
		window.clearTimeout(slow);
		note.hidden = true;
		api.sealed.setBox(null);
		api.ormas.setBox(null);
		return giveUp('left before it began');
	}
	await run(host, root, api, cut, speed, ac, manifest, () => {
		window.clearTimeout(slow);
		note.hidden = true;
	}, showLauncher);
	busy = false;
}

async function run(
	host: HTMLElement,
	root: ReplayRoot,
	api: ReplayHandle,
	cut: Cut,
	speed: number,
	ac: AudioContext | null,
	manifest: Awaited<ReturnType<typeof loadManifest>>,
	loaded: () => void,
	showLauncher: () => void,
): Promise<void> {
	const html = document.documentElement;
	const q = <T extends Element = HTMLElement>(s: string) => host.querySelector(s) as unknown as T;
	const log = (id: string, detail?: Record<string, unknown>) => {
		window.__tourLog?.push({ t: Math.round(clock.t), id, detail });
	};

	const clock = new Clock(speed);
	window.__tourState = 'running';
	root.classList.add('is-touring');
	api.setTimeScale(speed);

	// ── sound ────────────────────────────────────────────────────────────────────
	const voiced = !!ac && speed === 1;
	const chain = voiced ? soundChain(ac!) : null;
	const score = voiced ? new Score(ac!, chain!.music) : null;
	const subs = new Subtitles(clock, q('[data-dt-sub]'), q('[data-dt-sub-line]'));
	// Strict cueing for the test harness only: there a drifted script must fail the build.
	const strict = speed > 1;
	const narrator = new Narrator(clock, manifest, voiced ? ac : null, chain?.voice ?? null, subs, score, strict);
	const withAudio = await narrator.preload();
	if (voiced && withAudio === 0) console.warn('[tour] no narration audio loaded; running with subtitles only');
	// THE HOOK: the clips before the narrator. ?hook=0 leaves it out.
	const hookOn = HOOK_ON && new URLSearchParams(location.search).get('hook') !== '0';
	const hook = hookOn ? new Hook(clock, host, voiced ? ac : null, chain?.voice ?? null, score, api.bundle, log, strict) : null;
	await hook?.preload();
	const mesh = hook ? new TrainingMesh(clock, q<HTMLCanvasElement>('[data-dt-mesh]')) : null;
	loaded();
	if (score) clock.every(() => score.tick());
	// The picture follows the voice (clock.ts, followAudio). getOutputTimestamp gives a smooth
	// reading between the audio device's own ticks; currentTime alone steps in blocks.
	if (voiced && ac) {
		clock.followAudio(() => {
			if (ac.state !== 'running') return null;
			const ts = typeof ac.getOutputTimestamp === 'function' ? ac.getOutputTimestamp() : null;
			if (ts && ts.contextTime && ts.performanceTime) return ts.contextTime * 1000 + (performance.now() - ts.performanceTime);
			return ac.currentTime * 1000;
		});
	}

	// ── the pieces ───────────────────────────────────────────────────────────────
	const consoleEl = root.querySelector<HTMLElement>('.rp-console')!;
	const camera = new ConsoleCamera(clock, consoleEl, (s) => api.setRenderScale(s));
	const cursorEl = q('[data-dt-cursor]');
	const cursor = new PresenterCursor(clock, {
		root: cursorEl,
		ring: q('[data-dt-ring]'),
		label: q('[data-dt-clabel]'),
		wave: q('[data-dt-wave]'),
		trail: q<HTMLCanvasElement>('[data-dt-trail]'),
	});
	cursor.onPress = () => score?.click();
	const tags = new Tags(clock, host);
	const kinetic = new Kinetic(clock, q('[data-dt-kin]'), q('[data-dt-kin-word]'), q('[data-dt-kin-sub]'), q('[data-dt-kin-scrim]'));

	const shield = q('[data-dt-shield]');
	const curtain = q('[data-dt-curtain]');
	const chip = q('[data-dt-chip]');
	const chipNum = q('[data-dt-chip-num]');
	const chipTitle = q('[data-dt-chip-title]');
	const hair = q('[data-dt-hair]');
	const hairBar = q('[data-dt-progress]');
	const keys = q('[data-dt-keys]');
	const paused = q('[data-dt-paused]');
	const flashEl = q('[data-dt-flash]');
	const rew = q('[data-dt-rew]');
	const endEl = q('[data-dt-end]');
	const lines = q('[data-dt-lines]');

	const onResize = () => cursor.sizeTrail();
	window.addEventListener('resize', onResize);

	// ── input ────────────────────────────────────────────────────────────────────
	let isPaused = false;
	let engineWasPlaying = false;
	let ending = false;
	let muted = false;
	const togglePause = () => {
		if (ending) return;
		isPaused = !isPaused;
		clock.paused = isPaused;
		if (isPaused) {
			engineWasPlaying = api.engine?.isPlaying ?? false;
			api.pause();
			void ac?.suspend();
			paused.hidden = false;
		} else {
			paused.hidden = true;
			void ac?.resume();
			if (engineWasPlaying) api.play();
			engineWasPlaying = false;
		}
		log(isPaused ? 'pause' : 'resume');
	};
	const exit = () => {
		if (ending) return;
		log('exit');
		clock.abort();
	};
	const onKey = (e: KeyboardEvent) => {
		if (ending) return;
		// The browser's own shortcuts — reload, close, address bar, zoom — stay the reader's.
		if (e.metaKey || e.ctrlKey || e.altKey) return;
		e.preventDefault();
		e.stopImmediatePropagation();
		if (e.key === 'Escape') exit();
		else if (e.key === ' ' || e.code === 'Space') togglePause();
		else if ((e.key === 'm' || e.key === 'M') && chain) {
			muted = !muted;
			chain.master.gain.setTargetAtTime(muted ? 0 : 1, ac!.currentTime, 0.05);
			log(muted ? 'mute' : 'unmute');
		}
	};
	const block = (e: Event) => { if (!ending) e.preventDefault(); };
	const onShield = (e: Event) => { e.preventDefault(); togglePause(); };
	const onHidden = () => { if (document.hidden && !isPaused) togglePause(); };
	window.addEventListener('keydown', onKey, true);
	window.addEventListener('wheel', block, { passive: false });
	window.addEventListener('touchmove', block, { passive: false });
	shield.addEventListener('pointerdown', onShield);
	document.addEventListener('visibilitychange', onHidden);

	// ── the context the script runs against ─────────────────────────────────────
	const bg = (p: Promise<unknown>) => {
		p.catch((e) => {
			if (!(e instanceof TourAbort)) console.error('[tour] background step failed', e);
		});
	};
	let spoken = 0;
	const totalLines = manifest.lines.length + (hook ? Hook.lines : 0);
	const advance = () => {
		spoken++;
		hairBar.style.width = `${((spoken / totalLines) * 100).toFixed(2)}%`;
	};
	let flashN = 0;

	const ctx: TourCtx = {
		cut,
		clock,
		api,
		score,
		el(sel) {
			const el = root.querySelector<HTMLElement>(sel);
			if (!el) throw new Error(`tour: nothing on the console matches ${sel}`);
			return el;
		},
		all(sel) {
			return [...root.querySelectorAll<HTMLElement>(sel)];
		},
		hasHook: !!hook,
		async hook() {
			if (!hook) return;
			// The console is behind the curtain for all of this: stop drawing it.
			api.hold(true);
			await hook.play((id, s) => {
				advance();
				log('clip', { clip: id, text: s.line.text, duration: s.line.duration, audio: voiced && ac ? Math.round(ac.currentTime * 1000) : null });
			});
		},
		/* THE BRIDGE. A network trains on screen while the narrator names it, and a black box
		   shuts over it on "nobody". Each lever is pulled on the word it illustrates. */
		async training(id) {
			if (!mesh) return;
			log('mesh');
			mesh.start();
			score?.braam(0.55, 2.8);
			score?.pulse(true, 104);
			score?.brightness(0.35, 1.5);
			await clock.wait(450);
			const s = ctx.say(id);
			const cue = (word: string, fn: () => void) => ctx.bg(s.at(word).then(fn));
			cue('trained', () => mesh.set('tempo', 0.75, 1200));
			cue('billions', () => { mesh.set('push', 1, 2200); mesh.set('tempo', 1, 1500); });
			cue('adjusted', () => mesh.set('flare', 1, 600));
			await s.at('nobody');
			mesh.shut();
			log('mesh-shut');
			score?.pulse(false);
			score?.swell(0.8, 0.9);
			// The two halves meet 0.9 s after they start: the hit lands on the closing.
			window.setTimeout(() => { score?.braam(1, 2.6); score?.subdrop(0.9); }, 820 / Math.max(1, clock.speed));
			await s.done;
			await clock.wait(700);
		},
		async trainingOut(ms) {
			await mesh?.fadeOut(ms);
		},
		say(id) {
			const s = narrator.say(id);
			advance();
			// `audio`: the sound card's clock at the same moment, so a test can measure drift.
			log('line', { line: id, text: s.line.text, duration: s.line.duration, audio: voiced && ac ? Math.round(ac.currentTime * 1000) : null });
			return s;
		},
		wordAt(id, word) {
			const l = narrator.line(id);
			const k = word.toLowerCase();
			const w = l.words.find((x) => x.w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '') === k);
			if (!w) {
				if (strict) throw new Error(`tour: "${word}" is not in line ${id}`);
				console.warn(`[tour] "${word}" is not in line ${id}; timing from the line's start`);
				return 0;
			}
			return w.t0;
		},
		bg,
		async showCursor(at) {
			// Enters from the right, never over the subtitles at the foot of the frame.
			const p = at ?? { x: window.innerWidth * 0.86, y: window.innerHeight * 0.6 };
			cursor.placeAt(p.x, p.y);
			await cursor.show();
		},
		move: (t, ax, ay) => cursor.moveTo(t, ax, ay),
		async press(t, label, action) {
			/* RE-AIM FIRST. A control can move under a resting cursor (the event line pushes
			   the transport down; the camera moves everything), and a hand follows it. */
			await cursor.moveTo(t);
			cursor.magnet(t, label, t.matches('.rp-pane') ? 4 : 6);
			const r = t.getBoundingClientRect();
			const p = cursor.pos;
			log('click', {
				target: action ? 'open-box'
					: t.hasAttribute('data-rate') ? `rate ${t.getAttribute('data-rate')}`
					: t.hasAttribute('data-rail-scenario') ? t.getAttribute('data-rail-scenario')
					: t.hasAttribute('data-play') ? 'play'
					: t.hasAttribute('data-replay-event') ? 'replay from the event'
					: t.className,
				x: Math.round(p.x), y: Math.round(p.y),
				rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)],
				visible: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight,
			});
			await cursor.click(action ? undefined : t, action);
			await clock.wait(90);
			cursor.magnet(null);
		},
		async hover(t, label, pad) {
			await cursor.moveTo(t);
			cursor.magnet(t, label, pad);
		},
		letGo: () => cursor.magnet(null),
		async frame(subject, opts) {
			log('frame', { max: opts?.max });
			score?.whoosh(0.7);
			await camera.frame(subject, opts);
		},
		async wide(ms) {
			log('wide');
			await camera.reset(ms);
		},
		drift: (ms, ds) => camera.drift(ms, ds),
		shake: () => camera.shake(),
		flash(tone) {
			flashEl.dataset.tone = tone;
			flashEl.hidden = false;
			flashEl.classList.remove('is-on');
			void flashEl.offsetWidth;
			flashEl.classList.add('is-on');
			const n = ++flashN;
			window.setTimeout(() => { if (n === flashN) flashEl.hidden = true; }, 1200);
		},
		rewindFx(on) {
			root.classList.toggle('dt-rewinding', on);
			rew.hidden = !on;
		},
		tag(spec) {
			log('tag', { k: spec.k, v: spec.v });
			return tags.show(spec);
		},
		clearTags: () => tags.clear(),
		kinetic(word, opts = {}) {
			log('kinetic', { word });
			const over = opts.over;
			return kinetic.show(word, { ...opts, over: over ? () => over.getBoundingClientRect() : undefined });
		},
		chapter(num, title) {
			if (!title) {
				chip.classList.remove('is-on');
				return;
			}
			log('chapter', { num, title });
			chipNum.textContent = num ?? '';
			chipNum.hidden = !num;
			chipTitle.textContent = title;
			chip.hidden = false;
			chip.classList.remove('is-on');
			void chip.offsetWidth;
			chip.classList.add('is-on');
		},
		async reveal(ms = 900) {
			api.hold(false);
			score?.swell(ms / 1000 * 0.8, 0.7);
			window.setTimeout(() => score?.shimmer(), ms * 0.8 / Math.max(1, clock.speed));
			hair.hidden = false;
			await clock.tween(ms, (p) => { curtain.style.opacity = String(1 - p); });
			curtain.classList.remove('is-on');
			curtain.hidden = true;
			curtain.style.opacity = '';
		},
		async finale() {
			log('finale');
			tags.clear();
			const full = endEl.querySelector<HTMLElement>('[data-dt-full]');
			const short = endEl.querySelector<HTMLElement>('[data-dt-short]');
			if (full) full.hidden = cut === 'full';
			if (short) short.hidden = cut !== 'full';
			endEl.hidden = false;
			await new Promise((r) => requestAnimationFrame(r));
			endEl.classList.add('is-on');
			score?.chord('open', 3);
			score?.brightness(0.6, 3);
		},
		async box(which, from, to, ms) {
			log('box', { which, from, to });
			const targets = which === 'both' ? [api.sealed, api.ormas] : [which === 'ormas' ? api.ormas : api.sealed];
			// Light escapes only from a box being opened, never from one being shut.
			const glow = to > from ? 1 : 0;
			await clock.tween(ms, (p) => {
				const v = lerp(from, to, minJerk(p));
				for (const a of targets) a.setBox(v, 1, glow);
			});
		},
		async breakdown(from, to, ms, stageId) {
			log('breakdown', { from, to, stageId });
			await clock.tween(ms, (p) => api.ormas.setBreakdown(lerp(from, to, minJerk(p)), stageId));
			if (to <= from) api.ormas.steer(null);
		},
		async turn(from, to, ms, pitch = 0.05) {
			await clock.tween(ms, (p) => api.ormas.steer(lerp(from, to, minJerk(p)), pitch));
		},
		async scenario(key) {
			const btn = ctx.el(`[data-rail-scenario="${key}"]`);
			let ok = false;
			const onLoaded = (e: Event) => {
				if ((e as CustomEvent).detail?.key === key) ok = true;
			};
			root.addEventListener('replay:loaded', onLoaded);
			let waited = 0;
			try {
				await ctx.press(btn, 'Scenario');
				const t0 = clock.t;
				await clock.until(() => ok);
				waited = clock.t - t0;
			} finally {
				root.removeEventListener('replay:loaded', onLoaded);
			}
			// `wait`: tour time spent on the network. At test speed it is multiplied by the
			// speed, so the harness takes it back out when it checks the running time.
			log('scenario', { key, wait: Math.round(waited) });
		},
		seek(epoch) {
			api.engine?.seekEpoch(epoch);
		},
		async sweep(from, to, ms) {
			await clock.tween(ms, (p) => api.engine?.seekEpoch(lerp(from, to, minJerk(p))));
		},
		untilEpoch(e) {
			return clock.until(() => {
				const en = api.engine;
				return !en || en.epoch >= e || en.epoch >= en.lastEpoch;
			});
		},
		untilEnd() {
			return clock.until(() => {
				const en = api.engine;
				return !en || (en.epoch >= en.lastEpoch && !en.isPlaying);
			});
		},
		epochBefore(e, sec) {
			const en = api.engine;
			if (!en) return e;
			const on = root.querySelector('[data-rate][aria-pressed="true"]');
			const rate = Number(on?.getAttribute('data-rate')) || 1;
			return en.epochAt(Math.max(0, en.timeAt(e) - sec * rate));
		},
		wait: (ms) => clock.wait(ms),
		log,
	};

	// ── restore, however it ends ────────────────────────────────────────────────
	let result: 'ended' | 'aborted' | 'error' = 'ended';
	let restored = false;
	const restore = () => {
		if (restored) return;
		restored = true;
		ending = true;
		window.removeEventListener('keydown', onKey, true);
		window.removeEventListener('wheel', block);
		window.removeEventListener('touchmove', block);
		window.removeEventListener('resize', onResize);
		shield.removeEventListener('pointerdown', onShield);
		document.removeEventListener('visibilitychange', onHidden);
		clock.abort();

		narrator.stop();
		hook?.clear();
		mesh?.clear();
		if (score) score.stop(result === 'ended' ? 2.4 : 0.3);
		if (ac) window.setTimeout(() => void ac.close().catch(() => {}), result === 'ended' ? 2600 : 400);

		camera.clear();
		tags.reset();
		subs.hide();
		kinetic.clear();
		cursor.clear();
		api.ormas.setBreakdown(0);
		api.ormas.steer(null);
		api.sealed.steer(null);
		api.ormas.setBox(null);
		api.sealed.setBox(null);
		api.hold(false);
		api.pause();
		api.setTimeScale(1);
		const one = root.querySelector<HTMLElement>('[data-rate="1"]');
		if (one && one.getAttribute('aria-pressed') !== 'true') one.click();
		if (api.bundle && api.bundle.key !== DEFAULT_SCENARIO) {
			root.querySelector<HTMLElement>(`[data-rail-scenario="${DEFAULT_SCENARIO}"]`)?.click();
		} else {
			api.engine?.seekEpoch(0);
		}
		root.classList.remove('is-touring', 'dt-rewinding');
		window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

		for (const el of [shield, paused, cursorEl, chip, hair, keys, flashEl, rew, curtain]) {
			el.hidden = true;
			el.classList.remove('is-on');
		}
		hairBar.style.width = '0';
		lines.classList.remove('is-on');
		html.setAttribute('data-tour', 'done');
		html.removeAttribute('data-tour-rec');
		cleanUrl();
		window.__tourState = result;
		log('end', { result });
		teardown = null;
	};
	teardown = () => { result = 'aborted'; restore(); };

	try {
		shield.hidden = false;
		keys.hidden = false;
		curtain.hidden = false;
		curtain.classList.add('is-on');
		hair.hidden = false;
		log('start', { cut, speed, voiced, hook: !!hook, viewport: [window.innerWidth, window.innerHeight] });
		await runTour(ctx);
		await clock.wait(600);
	} catch (err) {
		if (err instanceof TourAbort) result = 'aborted';
		else {
			result = 'error';
			console.error('[tour] stopped', err);
		}
	}
	const finishedCut = cut;
	const wasEnded = result === 'ended';
	restore();

	if (wasEnded) {
		endEl.classList.add('is-live');
		const close = () => {
			endEl.classList.remove('is-on', 'is-live');
			window.setTimeout(() => { endEl.hidden = true; }, 420);
			window.removeEventListener('keydown', onEsc);
			showLauncher();
		};
		const again = (c: Cut) => {
			endEl.classList.remove('is-on', 'is-live');
			endEl.hidden = true;
			window.removeEventListener('keydown', onEsc);
			const next = audioFromGesture();
			void landAndRun(host, c, 1, next, showLauncher);
		};
		const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
		// Assigned, not added: the same card serves every run, and a listener left from a
		// previous one would start two tours from one press.
		const btn = (sel: string) => endEl.querySelector<HTMLElement>(sel);
		const set = (sel: string, fn: () => void) => { const b = btn(sel); if (b) b.onclick = fn; };
		set('[data-dt-close]', close);
		set('[data-dt-replay]', () => again(finishedCut));
		set('[data-dt-full]', () => again('full'));
		set('[data-dt-short]', () => again('demo'));
		window.addEventListener('keydown', onEsc);
		(endEl.querySelector('[data-dt-close]') as HTMLElement | null)?.focus({ preventScroll: true });
	} else {
		endEl.classList.remove('is-on', 'is-live');
		endEl.hidden = true;
		showLauncher();
	}
}
