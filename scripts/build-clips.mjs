// Build the hook's clips from the source files in oxido/media (scripts/narration/clips.mjs).
//
//   node scripts/build-clips.mjs            encode what is missing or changed
//   node scripts/build-clips.mjs --force    re-encode everything
//
// OUTPUT
//   public/black-box/hook/<id>.webm   VP9, silent — Chrome, Edge, Firefox, and Safari 14.1+
//   public/black-box/hook/<id>.mp4    H.264, silent — every other Safari, and iOS
//   public/black-box/hook/<id>.mp3    the clip's sound, trimmed identically and brought to the
//                                     narrator's loudness; played through the tour's own audio
//                                     graph, so it pauses, mutes and ducks with everything else
//   public/black-box/hook/<id>.jpg    first frame, the poster while the video loads
//   src/data/narration/clips.json     per clip: files, size, length, the caption as displayed,
//                                     each word's start and end, and who is speaking when
//
// WHY THE SOUND IS A SEPARATE FILE. A browser plays a video's own sound only if play() was
// called inside the click — and the hook starts well after the click, behind the curtain.
// The tour's AudioContext was unlocked by that click, so sound played through it always
// plays. The picture is muted, which every browser allows, and is kept in step with the
// sound by the tour (hook.ts).
//
// Needs ffmpeg. The transcripts are read from scripts/narration/clips/<id>.stt.json; if one
// is missing it is made with ElevenLabs speech-to-text (key from .env, never printed).

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIPS, FILLERS, SOURCE_DIR, TARGET_LUFS } from './narration/clips.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, SOURCE_DIR);
const OUT = join(ROOT, 'public/black-box/hook');
const STT = join(ROOT, 'scripts/narration/clips');
const MANIFEST = join(ROOT, 'src/data/narration/clips.json');
const FORCE = process.argv.includes('--force');

const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'pipe', 'inherit'] });
const probe = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim());

async function transcribe(clip) {
	const cached = join(STT, `${clip.id}.stt.json`);
	if (existsSync(cached)) return JSON.parse(readFileSync(cached, 'utf8'));
	const env = readFileSync(join(ROOT, '.env'), 'utf8');
	const key = (env.match(/^ELEVENLABS_API_KEY=(.+)$/m) || [])[1]?.trim();
	if (!key) throw new Error(`no transcript for ${clip.id} and no ELEVENLABS_API_KEY in .env`);
	const fd = new FormData();
	fd.append('model_id', 'scribe_v1');
	fd.append('file', new Blob([readFileSync(join(SRC, clip.file))], { type: 'video/mp4' }), clip.file);
	fd.append('timestamps_granularity', 'word');
	fd.append('diarize', 'true');
	fd.append('language_code', 'en');
	const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': key }, body: fd });
	if (!res.ok) throw new Error(`speech-to-text ${clip.id}: ${res.status} ${(await res.text()).slice(0, 200)}`);
	const j = await res.json();
	mkdirSync(STT, { recursive: true });
	writeFileSync(cached, JSON.stringify(j, null, 1));
	return j;
}

/** Two-pass loudness normalisation: measure, then correct to the narrator's level. */
function audio(clip, src, dest) {
	const trim = `atrim=${clip.start}:${clip.end},asetpts=PTS-STARTPTS,afade=t=in:d=0.06,afade=t=out:st=${(clip.end - clip.start - 0.06).toFixed(3)}:d=0.06`;
	// loudnorm reports on stderr; spawnSync would do, but a shell redirect keeps it one line.
	const log = execFileSync('sh', ['-c', `ffmpeg -hide_banner -i "${src}" -af "${trim},loudnorm=I=${TARGET_LUFS}:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1`], { encoding: 'utf8' });
	const m = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
	const second = `loudnorm=I=${TARGET_LUFS}:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
	ff(['-i', src, '-vn', '-af', `${trim},${second}`, '-ar', '44100', '-ac', '1', '-b:a', '128k', dest]);
}

function video(clip, src, base) {
	const crop = clip.crop ? `crop=${clip.crop.w}:${clip.crop.h}:${clip.crop.x}:${clip.crop.y},` : '';
	const vf = `trim=${clip.start}:${clip.end},setpts=PTS-STARTPTS,${crop}format=yuv420p`;
	ff(['-i', src, '-an', '-vf', vf, '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', `${base}.webm`]);
	ff(['-i', src, '-an', '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-profile:v', 'high', '-movflags', '+faststart', `${base}.mp4`]);
	ff(['-i', src, '-vf', `${crop.replace(/,$/, '') || 'null'}`, '-frames:v', '1', '-q:v', '4', `${base}.jpg`]);
}

/** The caption as shown: the spoken words, minus fillers, with the declared fixes. */
function captions(clip, stt) {
	const spoken = stt.words.filter((w) => w.type === 'word' && w.start >= clip.start && w.start < clip.end);
	const words = [];
	const speakers = [];
	const pending = [...clip.speakers];
	for (const w of spoken) {
		if (w.end > clip.end + 0.02) break;
		if (pending.length && w.text === pending[0].from) {
			const sp = pending.shift();
			speakers.push({ at: words.length, name: sp.name, role: sp.role });
		}
		if (FILLERS.has(w.text.toLowerCase())) continue;
		let text = clip.fix[w.text] ?? w.text;
		// A speaker's first shown word opens a sentence, even when a filler was dropped.
		if (speakers.length && speakers.at(-1).at === words.length) text = text[0].toUpperCase() + text.slice(1);
		words.push({ w: text, t0: +(w.start - clip.start).toFixed(3), t1: +(w.end - clip.start).toFixed(3) });
	}
	if (pending.length) throw new Error(`${clip.id}: speaker cue "${pending[0].from}" not found in the transcript`);
	return { words, speakers, text: words.map((w) => w.w).join(' ') };
}

async function main() {
	mkdirSync(OUT, { recursive: true });
	const lines = [];
	for (const clip of CLIPS) {
		const src = join(SRC, clip.file);
		if (!existsSync(src)) throw new Error(`source clip missing: ${src}`);
		const recipe = createHash('sha256').update(JSON.stringify({ clip, TARGET_LUFS, size: statSync(src).size })).digest('hex').slice(0, 12);
		const base = join(OUT, clip.id);
		const stamp = join(STT, `${clip.id}.recipe`);   // bookkeeping stays out of public/
		const fresh = !FORCE && existsSync(stamp) && readFileSync(stamp, 'utf8') === recipe
			&& ['webm', 'mp4', 'mp3', 'jpg'].every((e) => existsSync(`${base}.${e}`));
		if (!fresh) {
			process.stdout.write(`  encoding ${clip.id} … `);
			audio(clip, src, `${base}.mp3`);
			video(clip, src, base);
			writeFileSync(stamp, recipe);
			console.log('done');
		}
		const stt = await transcribe(clip);
		const cap = captions(clip, stt);
		const kb = (e) => Math.round(statSync(`${base}.${e}`).size / 1024);
		lines.push({
			id: clip.id,
			src: `/black-box/hook/${clip.id}.mp3?v=${recipe}`,
			video: {
				webm: `/black-box/hook/${clip.id}.webm?v=${recipe}`,
				mp4: `/black-box/hook/${clip.id}.mp4?v=${recipe}`,
				poster: `/black-box/hook/${clip.id}.jpg?v=${recipe}`,
				w: clip.crop?.w ?? 1024,
				h: clip.crop?.h ?? 576,
			},
			duration: +probe(`${base}.mp3`).toFixed(3),
			source: clip.source,
			text: cap.text,
			words: cap.words,
			speakers: cap.speakers,
		});
		console.log(`${clip.id}: ${lines.at(-1).duration.toFixed(2)} s · webm ${kb('webm')} KB · mp4 ${kb('mp4')} KB · mp3 ${kb('mp3')} KB`);
		console.log(`   ${cap.speakers.map((s) => `[${s.name}]`).join(' ')} ${cap.text}`);
	}
	const total = lines.reduce((s, l) => s + l.duration, 0);
	writeFileSync(MANIFEST, JSON.stringify({ lines, total: +total.toFixed(3) }, null, '\t') + '\n');
	console.log(`clips.json: ${lines.length} clips, ${total.toFixed(1)} s`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
