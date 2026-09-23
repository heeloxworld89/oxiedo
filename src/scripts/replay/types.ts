// Shape of a replay bundle, as emitted by scripts/build-replay-bundle.py.
// Kept in one place so the renderer and the engine cannot disagree about it.

import type { ReplayEngine } from './engine';
import type { Anatomy } from './anatomy';

/** What the console exposes on its root element as `replayApi`, for the demo tour.
 *
 *  ONLY WHAT A CURSOR CANNOT CLICK. Play, the rates, the scenarios and the event
 *  button are pressed by the tour like a reader presses them, so their own handlers
 *  run. This handle covers the rest: turning a drawing, opening a stage, and a
 *  freeze-frame that keeps the Play label honest. */
export interface ReplayHandle {
	readonly bundle: Bundle | null;
	readonly engine: ReplayEngine | null;
	readonly sealed: Anatomy;
	readonly ormas: Anatomy;
	/** Pause or resume without a click, keeping the Play label in step. */
	pause(): void;
	play(): void;
	/** Multiplies the rate the buttons show. Test harness only; 1 everywhere else. */
	setTimeScale(k: number): void;
	/** Re-render both drawings and the chart at `k` times the device ratio, for a
	 *  console the tour's camera has zoomed by `k`. */
	setRenderScale(k: number): void;
	/** Stop both drawings while the console is covered, and resume them. */
	hold(on: boolean): void;
}

export interface Node { id: number; in: number; out: number; params: number }

export interface HealthNode {
	id: number;
	goodness: number | null;
	state: string | null;
	weight_norm: number | null;
	activation_norm: number | null;
}

export interface HealthFrame { epoch: number; nodes: HealthNode[] }

export interface Correction {
	step: number;
	epoch: number | null;
	node: number;
	diagnosis: string;
	goodness_before: number | null;
	loss_before: number | null;
	magnitude: number | null;
	ceiling: number | null;
}

export interface ReplayEvent {
	type: string | null;
	label: string;
	epoch: number;
	step: number;
	/** False when the step could not be confirmed against the trainer source.
	 *  The component must fall back to an epoch counter when this is false. */
	step_confirmed: boolean;
	nodes: number[];
	description: string;
	detected_step?: number;
	detected_lag_steps?: number;
	detected_nodes?: number[];
	detected_diagnosis?: string;
}

export interface Bundle {
	schema: number;
	key: string;
	title: string;
	subtitle: string;
	conditions: {
		dataset: string;
		seed: number | null;
		epochs: number;
		steps_per_epoch: number;
		architecture: string;
		params_ormas: number | null;
		params_baseline: number | null;
		hardware: string;
		run_id_ormas: string;
		run_id_baseline: string;
		archive_index: string;
	};
	topology: { nodes: Node[] };
	event: ReplayEvent | null;
	series: {
		ormas: { accuracy: number[]; corrections: number[] };
		/** corrections is null — not an empty array. A standard architecture does
		 *  not compute this quantity, and the panel renders that fact. */
		baseline: { accuracy: number[]; corrections: null };
	};
	health: HealthFrame[];
	corrections: Correction[];
	summary: Record<string, unknown>;
	record: Record<string, unknown>;
	caveats: string[];
}
