// THE DEMO TOUR, AS A SCRIPT — two cuts, each written for its own job.
//
//   demo  the thesis, one scenario, done in about a minute and a half: for a reviewer
//         deciding quickly whether this is real.
//   full  the same thesis, then all four scenarios, each with its own angle — the sudden
//         failure, the worst case, the quiet one, and the one we lose.
//
// THE VOICE DRIVES THE PICTURE. Every beat waits on a word of the narration (Spoken.at),
// so a cut and a zoom land on the syllable they illustrate, and the timing survives any
// change to the lines: re-voice a line and the picture moves with it. The words are in
// scripts/narration/lines.mjs, filled from the same bundles the console plays.
//
// EVERY FIGURE ON SCREEN IS THE CONSOLE'S OWN, or read from the bundle it is playing: the
// tags name the stages the run's own event record names, with its own diagnosis. The copy
// laws hold — no "you", no "I", nothing unbuilt, and the adverse run is shown as a loss.

import type { Bundle, ReplayHandle } from '../replay/types';
import type { Clock } from './clock';
import type { Spoken, Score } from './audio';
import type { Tag, TagSpec } from './overlay';
import type { Subject } from './camera';

export type Cut = 'demo' | 'full';

type Pt = { x: number; y: number };

/** What the director gives the script. Every await in here can throw TourAbort. */
export interface TourCtx {
	cut: Cut;
	clock: Clock;
	api: ReplayHandle;
	score: Score | null;
	el(sel: string): HTMLElement;
	all(sel: string): HTMLElement[];
	/** Start a narration line; the returned handle waits on its words. */
	say(id: string): Spoken;
	/** Seconds into line `id` at which `word` starts. */
	wordAt(id: string, word: string): number;
	/** Run a promise alongside the tour without awaiting it (an abort is swallowed). */
	bg(p: Promise<unknown>): void;
	/** The clips before the narrator (hook.ts), and whether this run has them. */
	hasHook: boolean;
	hook(): Promise<void>;
	/** A network training on screen under the narrator's line `id` (mesh.ts); the box shuts
	 *  on "nobody". trainingOut fades it as the console comes up. */
	training(id: string): Promise<void>;
	trainingOut(ms: number): Promise<void>;

	showCursor(at?: Pt): Promise<void>;
	move(t: HTMLElement | Pt, ax?: number, ay?: number): Promise<void>;
	/** Move to a control, ring it, press it (its real handler runs), let go. */
	press(t: HTMLElement, label?: string, action?: () => void): Promise<void>;
	/** Move to a control and ring it, without pressing. */
	hover(t: HTMLElement, label?: string, pad?: number): Promise<void>;
	letGo(): void;

	frame(subject: Subject, opts?: { max?: number; min?: number; pad?: number; ms?: number; dof?: boolean; dy?: number }): Promise<void>;
	wide(ms?: number): Promise<void>;
	drift(ms: number, ds?: number): Promise<void>;
	shake(): Promise<void>;
	flash(tone: 'warn' | 'amber'): void;
	rewindFx(on: boolean): void;

	tag(spec: TagSpec): Tag;
	clearTags(): void;
	kinetic(word: string, opts?: { sub?: string; over?: HTMLElement; ms?: number; tone?: 'amber' | 'fg' | 'warn'; scrim?: boolean }): Promise<void>;
	chapter(num: string | null, title?: string): void;
	reveal(ms?: number): Promise<void>;
	finale(): Promise<void>;

	box(which: 'sealed' | 'ormas' | 'both', from: number, to: number, ms: number): Promise<void>;
	breakdown(from: number, to: number, ms: number, stageId: number): Promise<void>;
	/** Turn the ORMAS drawing from one yaw to another over `ms` (radians of offset). */
	turn(from: number, to: number, ms: number, pitch?: number): Promise<void>;
	scenario(key: string): Promise<void>;
	seek(epoch: number): void;
	sweep(from: number, to: number, ms: number): Promise<void>;
	untilEpoch(e: number): Promise<void>;
	untilEnd(): Promise<void>;
	/** The epoch the run will be at `sec` seconds of tour time before it reaches `e`, at
	 *  the rate now pressed — for starting a line so a word lands on the event. */
	epochBefore(e: number, sec: number): number;
	wait(ms: number): Promise<void>;
	log(id: string, detail?: Record<string, unknown>): void;
}

/* ── shared pieces ──────────────────────────────────────────────────────────── */

const anchorOn = (ctx: TourCtx, which: 'sealed' | 'ormas', key: string) => () =>
	(which === 'ormas' ? ctx.api.ormas : ctx.api.sealed).anchor(key);

/** The stages the run's own event record says ORMAS named, and the diagnosis it gave. */
function named(b: Bundle): { ids: number[]; diag: string } {
	const ev = b.event;
	if (!ev) return { ids: [], diag: '' };
	return {
		ids: ev.detected_nodes?.length ? ev.detected_nodes : ev.nodes,
		diag: ev.detected_diagnosis ?? ev.type ?? '',
	};
}

/** A tag on each named stage of the ORMAS drawing, fanned out so two never collide. */
function tagStages(ctx: TourCtx, b: Bundle, tone: 'warn' | 'amber' = 'warn'): Tag[] {
	const { ids, diag } = named(b);
	return ids.map((id, i) => ctx.tag({
		at: anchorOn(ctx, 'ormas', `stage:${id}:top`),
		k: `layer ${id}`,
		v: diag,
		dx: ids.length > 1 && i === 0 ? -96 : 96,
		dy: -84,
		tone,
	}));
}

/** A bare ping on every stage — "every stage reports". */
function pingStages(ctx: TourCtx, b: Bundle, where: 'top' | 'bottom' = 'bottom'): Tag[] {
	return b.topology.nodes.map((n) => ctx.tag({ at: anchorOn(ctx, 'ormas', `stage:${n.id}:${where}`) }));
}

/** The first epoch at which every named stage reads as destroyed — where the demo opens. */
function firstDeadEpoch(b: Bundle): number | null {
	const { ids } = named(b);
	const ev = b.event;
	if (!ev) return null;
	const f = b.health.find((h) => h.epoch >= ev.epoch && ids.every((id) => h.nodes.find((n) => n.id === id)?.weight_norm === 0));
	return f ? f.epoch : null;
}

interface Stage {
	sealedPane: HTMLElement;
	openPane: HTMLElement;
	panes: HTMLElement;
	mSealed: HTMLElement;
	mOpen: HTMLElement;
	mCorr: HTMLElement;
	mLag: HTMLElement;
	ledger: HTMLElement;
	/** "What each one can answer, at this epoch" — the question-by-question table. */
	verdict: HTMLElement;
	chart: HTMLElement;
	play: HTMLElement;
	eventBtn: HTMLElement;
	rate: (r: number) => HTMLElement;
	tabs: HTMLElement[];
}

function stageOf(ctx: TourCtx): Stage {
	const metrics = ctx.all('.rp-metric');
	return {
		sealedPane: ctx.el('.rp-pane--sealed'),
		openPane: ctx.el('.rp-pane--open'),
		panes: ctx.el('.rp-panes'),
		mSealed: metrics[0],
		mOpen: metrics[1],
		mCorr: metrics[2],
		mLag: metrics[3],
		ledger: ctx.el('.rp-ledger'),
		verdict: ctx.el('.rp-verdict'),
		chart: ctx.el('.rp-chart'),
		play: ctx.el('[data-play]'),
		eventBtn: ctx.el('[data-replay-event]'),
		rate: (r) => ctx.el(`[data-rate="${r}"]`),
		tabs: ctx.all('[data-rail-scenario]'),
	};
}

const pressed = (el: HTMLElement) => el.getAttribute('aria-pressed') === 'true';

/* THE ANSWERS TABLE, ROW BY ROW. Whenever the voice says which layer broke, the camera goes
   to the table that answers exactly that — which component is failing, at which step, by how
   much, what was done about it — and the hand rings the row being spoken. Its rows, in order:
   0 which component · 1 which step · 2 how much · 3 what was done · 4 accuracy now. */
const ROW = { component: 0, step: 1, much: 2, done: 3, accuracy: 4 } as const;
async function pointRow(ctx: TourCtx, i: number): Promise<void> {
	const row = ctx.all('[data-verdict] tr')[i];
	if (row) await ctx.hover(row, undefined, 3);
}

async function setRate(ctx: TourCtx, S: Stage, r: number): Promise<void> {
	if (!pressed(S.rate(r))) await ctx.press(S.rate(r), `${r}×`);
}

/** Run to just before the event at 4×, drop to 1×, and start `lineId` so that `word`
 *  lands on the event itself; the impact plays on it. Returns the line. */
async function intoTheEvent(ctx: TourCtx, S: Stage, b: Bundle, lineId: string, word: string, frameOn: Subject, after?: Promise<unknown>): Promise<Spoken> {
	const ev = b.event!;
	await ctx.hover(S.rate(1), '1×');
	/* TWENTY-TWO EPOCHS EARLY, WITH THE CURSOR ALREADY ON 1×. At 4× act one runs forty
	   epochs a second and the press itself takes a third of a second of dwell (about twelve
	   epochs), so the 1× lands near epoch 91 — clear of the event segment, which starts two
	   epochs before the event — and leaves as little silence as the line allows. */
	await ctx.untilEpoch(ev.epoch - 22);
	await ctx.press(S.rate(1), '1×');
	// Out of the shot: the camera is about to move the drawings under where the hand is.
	// Not on a control (resting on one reads as about to press it) and clear of subtitles.
	ctx.bg(ctx.move({ x: window.innerWidth * 0.975, y: window.innerHeight * 0.78 }));
	ctx.bg(ctx.frame(frameOn, { max: 1.35, ms: 1200 }));
	const lead = ctx.wordAt(lineId, word);
	const start = ctx.epochBefore(ev.epoch, lead);
	const eng = ctx.api.engine!;
	const riser = (eng.timeAt(ev.epoch) - eng.timeAt(eng.epoch)) / Math.max(1, ctx.clock.speed);
	if (riser > 0.6) ctx.score?.riser(riser);
	ctx.score?.pulse(false);
	await Promise.all([ctx.untilEpoch(start), after]);
	const line = ctx.say(lineId);
	await ctx.untilEpoch(ev.epoch);
	ctx.log('event', { epoch: ev.epoch });
	ctx.score?.hit();
	ctx.score?.braam(1);
	ctx.flash('warn');
	ctx.bg(ctx.shake());
	freezeOnDamage(ctx, b);
	return line;
}

/** HOLD THE DAMAGE ON SCREEN. At 1× the destroyed stages read as destroyed for under two
 *  seconds before the repairs begin, which is shorter than it takes to say what happened —
 *  so the run is paused just after ORMAS has named the fault, and resumed (resumeFast) on
 *  the word "repairs". A paused run is the console's own state: its Play button says so. */
function freezeOnDamage(ctx: TourCtx, b: Bundle): void {
	const ev = b.event;
	if (!ev) return;
	const spe = b.conditions.steps_per_epoch || 391;
	const named = ev.detected_step != null ? ev.detected_step / spe : ev.epoch;
	const at = Math.max(ev.epoch + 0.45, named + 0.15);
	ctx.bg(ctx.untilEpoch(at).then(() => {
		ctx.api.pause();
		ctx.log('hold', { epoch: at });
	}));
}

async function resumeFast(ctx: TourCtx, S: Stage): Promise<void> {
	// Pull back first: under a close frame the transport is off screen, and a press has
	// to be seen to land.
	ctx.bg(ctx.wide(800));
	await setRate(ctx, S, 16);
	if (!ctx.api.engine?.isPlaying) await ctx.press(S.play, 'Play');
}

/** SEALED, then OPENED: both networks go into their boxes, and the cursor opens one. */
async function sealAndOpen(ctx: TourCtx, S: Stage, b: Bundle, lines: { sealed: string; frameWord: string; open: string; openWord: string; pushWord: string; pingWord: string }): Promise<void> {
	/* "A standard network LEARNS from one error signal…" — the walls go up as the reason is
	   given; "…when something inside it BREAKS" — the camera goes to the sealed one;
	   "nothing says WHERE" — the tag says so; "that's the BLACK box" — the title lands. */
	const sealed = ctx.say(lines.sealed);
	await sealed.at('learns');
	ctx.bg(ctx.box('both', 1, 0, 1300).then(() => ctx.score?.braam(0.7, 1.9)));
	await sealed.at(lines.frameWord);
	ctx.bg(ctx.frame(S.sealedPane, { max: 1.5, ms: 1100 }));
	await sealed.at('where');
	ctx.tag({ at: anchorOn(ctx, 'sealed', 'box'), k: 'which part?', v: 'no signal', tone: 'dim', dx: 96, dy: -58 });
	await sealed.at('black');
	ctx.clearTags();
	ctx.bg(ctx.kinetic('SEALED', { over: S.sealedPane, ms: 1500 }));
	await sealed.done;

	ctx.bg(ctx.frame(S.openPane, { max: 1.45, ms: 1100 }));
	await ctx.showCursor();
	await ctx.hover(S.openPane, 'Open', 4);
	ctx.bg(ctx.box('ormas', 0, 0.035, 500));
	const open = ctx.say(lines.open);
	await open.at(lines.openWord);
	await ctx.press(S.openPane, 'Open', () => {
		ctx.log('open-box');
		ctx.score?.shimmer();
		ctx.score?.chord('open');
		ctx.score?.brightness(0.45);
		ctx.bg(ctx.box('ormas', 0.035, 1, 2000));
		ctx.bg(ctx.kinetic('OPENED', { over: S.openPane, ms: 1400, tone: 'amber' }));
	});
	const r = S.openPane.getBoundingClientRect();
	ctx.bg(ctx.move({ x: r.right - 40, y: r.bottom - 24 }));
	await open.at(lines.pushWord);
	ctx.bg(ctx.frame(S.openPane, { max: 1.9, ms: 1500 }));
	await open.at(lines.pingWord);
	pingStages(ctx, b);
	await open.done;
	ctx.clearTags();
}

/* ── the opening, shared by both cuts ───────────────────────────────────────────
   THE FULL TOUR IS THE DEMO, CONTINUED. Both open the same way, word for word and shot for
   shot: the damage, the black box, opening it, the check taken apart, then the first failure
   run from start to repair. The demo closes there; the full tour turns to the other three. */

async function opening(ctx: TourCtx, S: Stage): Promise<void> {
	const b = ctx.api.bundle!;
	const ev = b.event!;
	const stage = b.topology.nodes[Math.min(1, b.topology.nodes.length - 1)].id;

	// ── 0 · the warnings, then what sits under all of them ─────────────────────
	if (ctx.hasHook) {
		ctx.log('beat:warnings');
		await ctx.hook();
		ctx.score?.start(1);
		ctx.score?.chord('dark');
		ctx.log('beat:training');
		await ctx.training('training');
	}

	// ── 1 · open on the damage ─────────────────────────────────────────────────
	ctx.log('beat:hook');
	const hookEpoch = (firstDeadEpoch(b) ?? ev.epoch) + 0.3;
	ctx.seek(hookEpoch);
	await ctx.frame(S.openPane, { max: 1.9, ms: 0 });
	ctx.score?.start(3);
	// The shut box dissolves as the console comes up behind it: one box closes, the tour
	// opens another — a real one.
	if (ctx.hasHook) ctx.bg(ctx.trainingOut(1000));
	await ctx.reveal(1000);
	const hook = ctx.say('hook');
	ctx.bg(ctx.drift(hook.line.duration * 1000, 0.07));
	await hook.at('which');
	tagStages(ctx, b);
	await hook.done;
	await ctx.wait(200);
	ctx.clearTags();

	// ── 2 · rewind, and seal ───────────────────────────────────────────────────
	ctx.log('beat:sealed');
	ctx.rewindFx(true);
	ctx.score?.whoosh(1.3);
	ctx.bg(ctx.sweep(hookEpoch, 0, 1500).then(() => ctx.rewindFx(false)));
	ctx.bg(ctx.wide(1500));
	ctx.score?.chord('dark');

	// ── 3 · open it ────────────────────────────────────────────────────────────
	await sealAndOpen(ctx, S, b, {
		sealed: 'sealed', frameWord: 'breaks',
		open: 'open', openWord: 'opened', pushWord: 'every', pingWord: 'health',
	});

	// ── 4 · inside a stage ─────────────────────────────────────────────────────
	ctx.log('beat:inside');
	const inside = ctx.say('inside');
	ctx.bg(ctx.frame(S.openPane, { max: 2.2, ms: 1200 }));
	await inside.at('apart');
	ctx.bg(ctx.breakdown(0, 1, 4200, stage));
	ctx.bg(ctx.turn(0.24, 0.02, inside.line.duration * 1000, 0.08));
	// "…each CHECK belongs to its own layer": the check is the small loss at the chain's end.
	await inside.at('belongs');
	ctx.tag({ at: anchorOn(ctx, 'ormas', 'loss') });
	ctx.tag({ at: anchorOn(ctx, 'ormas', `stage:${stage}`) });
	await inside.done;
	ctx.clearTags();
	ctx.bg(ctx.wide(1100));
	await ctx.breakdown(1, 0, 1100, stage);

	// ── 5 · the test ───────────────────────────────────────────────────────────
	ctx.log('beat:test');
	if (ctx.cut === 'full') ctx.chapter('01', 'Sudden failure');
	ctx.score?.chord('tense');
	ctx.score?.brightness(0.3);
	/* THE RUN PLAYS UNDER THE LINE. 4× is set as the line starts and Play is pressed on
	   "same data", so the epochs fly while the two networks are named, and the hand-off to
	   1× happens before the line is over — no dead air between the test and the break. */
	const test = ctx.say('test');
	await setRate(ctx, S, 4);
	ctx.bg(test.at('standard').then(() => {
		ctx.tag({ at: anchorOn(ctx, 'sealed', 'box'), v: 'standard', tone: 'dim', dx: -80, dy: -60 });
	}));
	ctx.bg(test.at('ormas').then(() => {
		ctx.tag({ at: anchorOn(ctx, 'ormas', `stage:${stage}:top`), v: 'ORMAS', tone: 'amber', dx: 80, dy: -50 });
	}));
	await test.at('same');
	await ctx.press(S.play, 'Play');
	ctx.score?.pulse(true, 84);

	// ── 6 · the break ──────────────────────────────────────────────────────────
	ctx.log('beat:break');
	const testOver = test.done.then(() => ctx.clearTags());
	testOver.catch(() => {}); // an Esc mid-line is handled where the tour unwinds
	const br1 = await intoTheEvent(ctx, S, b, 'break-1', 'destroy', S.panes, testOver);
	await br1.done;
	const br2 = ctx.say('break-2');
	ctx.bg(ctx.frame([S.sealedPane, S.mSealed], { max: 1.7, ms: 1000 }));
	await br2.at('guessing');
	ctx.tag({ at: () => {
		const v = S.mSealed.querySelector('.rp-metric-value')?.getBoundingClientRect();
		return v ? { x: v.right + 8, y: v.top + v.height / 2 } : null;
	}, tone: 'warn' });
	await br2.at('say');
	ctx.tag({ at: anchorOn(ctx, 'sealed', 'box'), k: 'which part?', v: 'no signal', tone: 'dim', dx: 96, dy: -58 });
	await br2.done;
	ctx.clearTags();
	const br3 = ctx.say('break-3');
	ctx.bg(ctx.frame(S.verdict, { max: 1.9, ms: 1000 }));
	await br3.at('names');
	await pointRow(ctx, ROW.component);
	await br3.at('steps');
	await pointRow(ctx, ROW.step);
	await br3.done;
	ctx.letGo();

	// ── 7 · the repair ─────────────────────────────────────────────────────────
	ctx.log('beat:repair');
	ctx.score?.chord('open');
	const rep = ctx.say('repair');
	await resumeFast(ctx, S);
	ctx.bg(ctx.frame(S.verdict, { max: 1.9, ms: 1100 }));
	// "…which layer, which step, how much. 85 changes…" — each row as it is named.
	await rep.at('layer');
	await pointRow(ctx, ROW.component);
	await rep.at('step');
	await pointRow(ctx, ROW.step);
	await rep.at('much');
	await pointRow(ctx, ROW.much);
	await rep.at('85');
	await pointRow(ctx, ROW.done);
	await rep.done;
	ctx.letGo();
	await ctx.untilEnd();
}

/* ── the demo ───────────────────────────────────────────────────────────────── */

async function demo(ctx: TourCtx): Promise<void> {
	const S = stageOf(ctx);
	await opening(ctx, S);

	// ── 8 · the close ──────────────────────────────────────────────────────────
	ctx.log('beat:close');
	/* "It TELLS us what broke" — the named layers; "it REPAIRS it" — the accuracy back;
	   "it KEEPS the record" — the ledger. Three claims, three shots. */
	/* All three on the finished run as it stands — no scrubbing back, which read as the
	   numbers glitching: "tells" frames the console's own verdict, which layer and how many
	   steps; "repairs" the accuracy it climbed back to beside the one that never did. */
	const close = ctx.say('close');
	ctx.bg(ctx.frame(S.verdict, { max: 1.9, ms: 900 }));
	await close.at('tells');
	await pointRow(ctx, ROW.component);
	await close.at('repairs');
	ctx.letGo();
	ctx.bg(ctx.frame([S.mOpen, S.mSealed], { max: 1.9, ms: 900 }));
	await close.at('keeps');
	ctx.bg(ctx.frame(S.ledger, { max: 1.7, ms: 900 }));
	await close.at('thats');
	ctx.bg(ctx.wide(1500));
	await close.at('ormas');
	ctx.bg(ctx.finale());
	await close.done;
}

/* ── the full tour ──────────────────────────────────────────────────────────── */

const SCENARIOS = ['dead-layer-lesion', 'full-hierarchy', 'label-noise', 'adversarial'] as const;

async function full(ctx: TourCtx): Promise<void> {
	const S = stageOf(ctx);
	await opening(ctx, S);

	// ── the bridge: three more, named as the hand finds each one ───────────────
	ctx.log('beat:bridge');
	ctx.bg(ctx.wide(1000));
	const bridge = ctx.say('bridge');
	const tab = (key: string) => S.tabs.find((t) => t.getAttribute('data-rail-scenario') === key)!;
	await bridge.at('worst');
	await ctx.hover(tab('full-hierarchy'), undefined, 4);
	await bridge.at('quiet');
	await ctx.hover(tab('label-noise'), undefined, 4);
	await bridge.at('lose');
	await ctx.hover(tab('adversarial'), undefined, 4);
	await bridge.done;
	ctx.letGo();

	// ── 6 · scenario two: the worst case ───────────────────────────────────────
	{
		ctx.log('beat:s2');
		ctx.chapter('02', 'The worst case');
		ctx.bg(ctx.wide(900));
		await ctx.scenario('full-hierarchy');
		const b = ctx.api.bundle!;
		ctx.score?.chord('tense');
		const t = ctx.say('s2-title');
		ctx.score?.braam(0.8);
		await ctx.kinetic('THE WORST CASE', { sub: 'Scenario 2 of 4', ms: 1500, scrim: true });
		await t.done;
		await setRate(ctx, S, 1);
		const ev = b.event!;
		await ctx.press(S.eventBtn, 'Replay the event');
		ctx.bg(ctx.frame(S.openPane, { max: 1.6, ms: 1200 }));
		const lead = ctx.wordAt('s2-break', 'destroyed');
		await ctx.untilEpoch(ctx.epochBefore(ev.epoch, lead));
		const br = ctx.say('s2-break');
		await ctx.untilEpoch(ev.epoch);
		ctx.log('event', { epoch: ev.epoch });
		ctx.score?.hit();
		ctx.score?.braam(1);
		ctx.flash('warn');
		ctx.bg(ctx.shake());
		freezeOnDamage(ctx, b);
		await br.done;
		const rep = ctx.say('s2-repair');
		ctx.bg(ctx.frame(S.verdict, { max: 1.9, ms: 1000 }));
		await rep.at('finds');
		await pointRow(ctx, ROW.component);
		await rep.at('steps');
		await pointRow(ctx, ROW.step);
		await rep.at('climbs');
		ctx.letGo();
		ctx.score?.chord('open');
		await resumeFast(ctx, S);
		ctx.bg(ctx.frame([S.mOpen, S.mSealed], { max: 1.9, ms: 1000 }));
		await rep.at('standard');
		ctx.bg(ctx.frame(S.chart, { max: 1.7, ms: 1100 }));
		await ctx.untilEnd();
		await rep.done;
	}

	// ── 7 · scenario three: the quiet one ──────────────────────────────────────
	{
		ctx.log('beat:s3');
		ctx.chapter('03', 'The quiet one');
		ctx.bg(ctx.wide(900));
		await ctx.scenario('label-noise');
		ctx.score?.chord('dark');
		const t = ctx.say('s3-title');
		ctx.score?.braam(0.8);
		await ctx.kinetic('THE QUIET ONE', { sub: 'Scenario 3 of 4', ms: 1500, scrim: true });
		await t.done;
		await setRate(ctx, S, 4);
		const setup = ctx.say('s3-setup');
		await ctx.press(S.play, 'Play');
		await setup.at('wrong');
		ctx.bg(ctx.frame(S.chart, { max: 1.7, ms: 1200 }));
		await setup.done;
		const hold = ctx.say('s3-hold');
		await hold.at('ormas');
		ctx.bg(ctx.frame([S.mOpen, S.mSealed], { max: 1.9, ms: 1000 }));
		await hold.at('record');
		ctx.bg(ctx.frame(S.ledger, { max: 1.7, ms: 1000 }));
		await hold.done;
		await ctx.press(S.rate(16), '16×');
		await ctx.untilEnd();
	}

	// ── 8 · scenario four: the one we lose ─────────────────────────────────────
	{
		ctx.log('beat:s4');
		ctx.chapter('04', 'The one we lose');
		ctx.bg(ctx.wide(900));
		await ctx.scenario('adversarial');
		const b = ctx.api.bundle!;
		ctx.score?.chord('dark');
		ctx.score?.brightness(0.2);
		const t = ctx.say('s4-title');
		ctx.score?.braam(0.8);
		await ctx.kinetic('THE ONE WE LOSE', { sub: 'Scenario 4 of 4', ms: 1500, tone: 'warn', scrim: true });
		await t.done;
		await setRate(ctx, S, 4);
		const setup = ctx.say('s4-setup');
		await ctx.press(S.eventBtn, 'Replay the event');
		freezeOnDamage(ctx, b);
		ctx.bg(ctx.frame(S.openPane, { max: 1.6, ms: 1200 }));
		await setup.done;
		const res = ctx.say('s4-result');
		ctx.bg(ctx.frame(S.verdict, { max: 1.9, ms: 1000 }));
		await res.at('flags');
		await pointRow(ctx, ROW.component);
		await res.at('20');
		await pointRow(ctx, ROW.step);
		await res.at('finishes');
		ctx.letGo();
		await resumeFast(ctx, S);
		ctx.bg(ctx.frame([S.mOpen, S.mSealed], { max: 1.9, ms: 1000 }));
		await ctx.untilEnd();
		await res.at('behind');
		ctx.tag({ at: () => {
			const v = S.mOpen.querySelector('.rp-metric-value')?.getBoundingClientRect();
			return v ? { x: v.right + 6, y: v.top + v.height / 2 } : null;
		}, tone: 'warn' });
		await res.done;
		ctx.clearTags();
		const why = ctx.say('s4-why');
		ctx.bg(ctx.wide(1400));
		await why.done;
	}

	// ── 9 · the close ──────────────────────────────────────────────────────────
	ctx.log('beat:close');
	ctx.chapter(null, 'The record');
	ctx.score?.chord('open');
	ctx.score?.brightness(0.5);
	const close = ctx.say('close');
	ctx.bg(ctx.frame(S.ledger, { max: 1.6, ms: 1300 }));
	await close.at('thats');
	ctx.bg(ctx.wide(1500));
	await close.at('ormas');
	ctx.bg(ctx.finale());
	await close.done;
}

export const SCENARIO_KEYS = SCENARIOS;

export async function runTour(ctx: TourCtx): Promise<void> {
	if (ctx.cut === 'demo') await demo(ctx);
	else await full(ctx);
}
