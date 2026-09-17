// REPLAY ENGINE — the clock and the act state machine.
//
// Two mappings are deliberately kept apart, and confusing them is the bug this
// file exists to prevent:
//
//   · PLAYBACK is non-linear in epochs. Act 1 covers a hundred epochs in ten
//     seconds; act 2 covers five in eight. The failure has to be legible, and a
//     uniform clock makes it a blink. Only the camera speed varies — every value
//     rendered is the archived value for that epoch, untouched.
//
//   · THE SCRUBBER is linear in epochs, because a person dragging a handle
//     expects uniform travel.
//
// So: epochAt(t) is non-linear; timeAt(epoch) is its inverse; and the scrubber
// writes epochs directly without consulting the clock at all.

import type { Bundle } from './types';

export type Act = 'before' | 'event' | 'repair' | 'record';

export interface Segment { fromEpoch: number; toEpoch: number; seconds: number; act: Act }

export class ReplayEngine {
	readonly bundle: Bundle;
	readonly lastEpoch: number;
	readonly segments: Segment[];
	readonly totalSeconds: number;

	private t = 0;             // seconds into the timeline
	private playing = false;
	private rate = 1;
	private raf = 0;
	private lastFrame = 0;

	onFrame: ((epoch: number, act: Act) => void) | null = null;
	onEnd: (() => void) | null = null;

	constructor(bundle: Bundle) {
		this.bundle = bundle;
		this.lastEpoch = bundle.series.ormas.accuracy.length - 1;
		this.segments = this.buildSegments();
		this.totalSeconds = this.segments.reduce((a, s) => a + s.seconds, 0);
	}

	/** Act boundaries derive from the event, so a scenario whose alarm is slow to
	 *  fire (the weight explosion takes ~1,600 steps) still holds the camera
	 *  until the alarm has actually landed. */
	private buildSegments(): Segment[] {
		const ev = this.bundle.event;
		const last = this.lastEpoch;
		if (!ev) {
			return [{ fromEpoch: 0, toEpoch: last, seconds: 30, act: 'repair' }];
		}
		const spe = this.bundle.conditions.steps_per_epoch || 391;
		const detectedEpoch = ev.detected_step != null
			? Math.floor(ev.detected_step / spe)
			: ev.epoch;

		const holdFrom = Math.max(0, ev.epoch - 2);
		const holdTo = Math.min(last, Math.max(ev.epoch + 3, detectedEpoch + 2));

		const segs: Segment[] = [
			{ fromEpoch: 0, toEpoch: holdFrom, seconds: 10, act: 'before' },
			{ fromEpoch: holdFrom, toEpoch: holdTo, seconds: 9, act: 'event' },
			{ fromEpoch: holdTo, toEpoch: last, seconds: 20, act: 'repair' },
		];
		return segs.filter((s) => s.toEpoch > s.fromEpoch);
	}

	epochAt(t: number): number {
		let acc = 0;
		for (const s of this.segments) {
			if (t <= acc + s.seconds) {
				const f = s.seconds === 0 ? 1 : (t - acc) / s.seconds;
				return s.fromEpoch + f * (s.toEpoch - s.fromEpoch);
			}
			acc += s.seconds;
		}
		return this.lastEpoch;
	}

	timeAt(epoch: number): number {
		let acc = 0;
		for (const s of this.segments) {
			if (epoch <= s.toEpoch) {
				const span = s.toEpoch - s.fromEpoch;
				const f = span === 0 ? 1 : (epoch - s.fromEpoch) / span;
				return acc + Math.max(0, Math.min(1, f)) * s.seconds;
			}
			acc += s.seconds;
		}
		return this.totalSeconds;
	}

	actAt(epoch: number): Act {
		const ev = this.bundle.event;
		if (!ev) return 'repair';
		if (epoch >= this.lastEpoch) return 'record';
		for (const s of this.segments) {
			if (epoch <= s.toEpoch) return s.act;
		}
		return 'repair';
	}

	get epoch(): number { return this.epochAt(this.t); }
	get isPlaying(): boolean { return this.playing; }
	get progress(): number {
		return this.lastEpoch === 0 ? 0 : this.epoch / this.lastEpoch;
	}

	setRate(r: number): void { this.rate = r; }

	seekEpoch(epoch: number): void {
		const e = Math.max(0, Math.min(this.lastEpoch, epoch));
		this.t = this.timeAt(e);
		this.emit();
	}

	play(): void {
		if (this.playing) return;
		if (this.t >= this.totalSeconds) this.t = 0;
		this.playing = true;
		this.lastFrame = performance.now();
		const tick = (now: number) => {
			if (!this.playing) return;
			const dt = Math.min(0.1, (now - this.lastFrame) / 1000);
			this.lastFrame = now;
			this.t += dt * this.rate;
			if (this.t >= this.totalSeconds) {
				this.t = this.totalSeconds;
				this.playing = false;
				this.emit();
				this.onEnd?.();
				return;
			}
			this.emit();
			this.raf = requestAnimationFrame(tick);
		};
		this.raf = requestAnimationFrame(tick);
	}

	pause(): void {
		this.playing = false;
		if (this.raf) cancelAnimationFrame(this.raf);
		this.raf = 0;
	}

	toggle(): void { this.playing ? this.pause() : this.play(); }

	/** Jump to two epochs before the event and run. The most-used control. */
	replayFromEvent(): void {
		const ev = this.bundle.event;
		this.pause();
		this.seekEpoch(ev ? Math.max(0, ev.epoch - 3) : 0);
		this.play();
	}

	toEnd(): void {
		this.pause();
		this.t = this.totalSeconds;
		this.emit();
		this.onEnd?.();
	}

	destroy(): void { this.pause(); this.onFrame = null; this.onEnd = null; }

	private emit(): void {
		const e = this.epoch;
		this.onFrame?.(e, this.actAt(e));
	}
}
