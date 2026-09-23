// THE TOUR'S CLOCK.
//
// Every wait, every tween and every "until the run reaches epoch 101" in the demo tour
// goes through this one object, for three reasons that are all the same reason:
//
//   · PAUSE has to stop everything at once. A tour built on setTimeout pauses the
//     thing the reader can see and keeps the timers running underneath, so it resumes
//     into the middle of a step it never showed.
//   · EXIT has to unwind everything at once. abort() rejects every pending wait with
//     TourAbort, the director's try/finally restores the console, and no orphaned
//     timer fires into a page that has moved on.
//   · THE TEST HARNESS runs the tour faster than real time. `speed` scales the clock,
//     so a four-minute tour is asserted in twenty seconds with every step still taken
//     in the same order and at the same relative moments.
//
// The clock advances on requestAnimationFrame. A backgrounded tab gets no frames, so
// the tour stops with it rather than skipping ahead — the same thing a video does.

export class TourAbort extends Error {
	constructor() {
		super('tour aborted');
		this.name = 'TourAbort';
	}
}

type Waiter = { check: () => boolean; resolve: () => void; reject: (e: unknown) => void };

export class Clock {
	/** Tour milliseconds per real millisecond. 1 for every reader. */
	readonly speed: number;
	paused = false;
	private aborted = false;
	private now = 0;
	private last = 0;
	private raf = 0;
	private waiters: Waiter[] = [];
	private frames = new Set<(t: number) => void>();
	/** The audio's own clock, when the tour is voiced (see followAudio). */
	private audio: (() => number | null) | null = null;
	private anchor: { a: number; c: number } | null = null;
	private lastAudio = NaN;
	private audioStale = 0;

	constructor(speed = 1) {
		this.speed = speed > 0 ? speed : 1;
		this.last = performance.now();
		this.raf = requestAnimationFrame(this.tick);
	}

	/** Tour time in milliseconds. Frozen while paused. */
	get t(): number { return this.now; }
	get isAborted(): boolean { return this.aborted; }

	/** THE VOICE IS THE MASTER CLOCK. Frames are timed by requestAnimationFrame, which a
	 *  busy machine drops and which this clock clamps; the narration plays in real time
	 *  regardless. Left alone the two drift apart — measured under a 4× CPU slowdown, the
	 *  subtitles and cuts fell 2.7 s behind the voice around the break, where the frames
	 *  are heaviest. So while the tour is voiced, tour time IS audio time since an anchor:
	 *  each frame sets the clock to where the audio has got to (smoothly interpolated by
	 *  the caller), never backwards, so a slow frame is a coarse step, never a delay.
	 *  `now()` returns milliseconds, or null while the audio is not running (a suspended
	 *  context), which drops the anchor and falls back to frame time. */
	followAudio(now: () => number | null): void {
		this.audio = now;
		this.anchor = null;
	}

	private tick = (ts: number): void => {
		if (this.aborted) return;
		// A long gap (a stalled tab, a debugger) is clamped so the tour cannot lurch
		// forward by seconds on the frame it comes back.
		let dt = Math.min(64, Math.max(0, ts - this.last));
		this.last = ts;
		if (this.audio && !this.paused) {
			let a = this.audio();
			/* A STALLED DEVICE MUST NOT STALL THE TOUR. An audio clock that reports "running"
			   but stops advancing — a Bluetooth headset reconnecting, a device going to sleep —
			   would freeze a clock slaved to it. After a quarter of a second without movement
			   it is ignored and frame time takes over; it is re-anchored when it moves again. */
			if (a !== null) {
				if (a === this.lastAudio) this.audioStale += dt;
				else this.audioStale = 0;
				this.lastAudio = a;
				if (this.audioStale > 250) a = null;
			}
			if (a === null) this.anchor = null;
			else if (!this.anchor) this.anchor = { a, c: this.now };
			else {
				// Where the audio says the tour should be; a stalled second (a debugger, a
				// backgrounded tab that was not paused) is still capped.
				const target = this.anchor.c + (a - this.anchor.a) * this.speed;
				dt = Math.max(0, Math.min(1000, target - this.now)) / this.speed;
			}
		} else if (this.paused) {
			this.anchor = null;
		}
		if (!this.paused) this.now += dt * this.speed;
		for (const f of [...this.frames]) f(this.now);
		const ready = this.waiters.filter((w) => w.check());
		if (ready.length) {
			this.waiters = this.waiters.filter((w) => !ready.includes(w));
			for (const w of ready) w.resolve();
		}
		this.raf = requestAnimationFrame(this.tick);
	};

	/** Resolves on the first frame `pred` holds. */
	until(pred: () => boolean): Promise<void> {
		if (this.aborted) return Promise.reject(new TourAbort());
		return new Promise((resolve, reject) => {
			this.waiters.push({ check: pred, resolve, reject });
		});
	}

	wait(ms: number): Promise<void> {
		const end = this.now + Math.max(0, ms);
		return this.until(() => this.now >= end);
	}

	/** Calls fn(p) every frame with p from 0 to 1 over `ms` of tour time, and fn(1) last. */
	tween(ms: number, fn: (p: number) => void): Promise<void> {
		if (this.aborted) return Promise.reject(new TourAbort());
		const start = this.now;
		const span = Math.max(0, ms);
		fn(0);
		if (span === 0) {
			fn(1);
			return Promise.resolve();
		}
		return new Promise((resolve, reject) => {
			const frame = (t: number) => {
				const p = Math.min(1, (t - start) / span);
				fn(p);
				if (p >= 1) {
					this.frames.delete(frame);
					resolve();
				}
			};
			this.frames.add(frame);
			// Registered as a waiter too, purely so abort() can reject it.
			this.waiters.push({
				check: () => !this.frames.has(frame),
				resolve: () => {},
				reject: (e) => {
					this.frames.delete(frame);
					reject(e);
				},
			});
		});
	}

	/** A callback on every frame until the returned function is called. */
	every(fn: (t: number) => void): () => void {
		this.frames.add(fn);
		return () => this.frames.delete(fn);
	}

	abort(): void {
		if (this.aborted) return;
		this.aborted = true;
		cancelAnimationFrame(this.raf);
		const err = new TourAbort();
		const pending = this.waiters;
		this.waiters = [];
		this.frames.clear();
		for (const w of pending) w.reject(err);
	}
}

/** Minimum-jerk position profile: zero velocity and acceleration at both ends. It is
 *  how a hand moves a pointer, which is why a path timed by it reads as a person and a
 *  path timed by an ease-in-out curve reads as a machine. */
export const minJerk = (t: number): number => {
	const x = t < 0 ? 0 : t > 1 ? 1 : t;
	return x * x * x * (10 - 15 * x + 6 * x * x);
};

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
