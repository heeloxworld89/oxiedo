// Build the demo tour's narration: one ElevenLabs call per line, cached by content.
//
//   node scripts/build-narration.mjs --dry-run      what would be generated, and what it costs
//   node scripts/build-narration.mjs                generate what is missing (needs .env)
//   node scripts/build-narration.mjs --max 4000     refuse to spend more than 4,000 characters
//
// OUTPUT:
//   public/black-box/voice/<hash>.mp3   one file per line; the hash covers the spoken words,
//                        the voice, the model and its settings, so any change re-voices that
//                        line only, and a browser's cached copy is always the right one
//   src/data/narration/demo.json, full.json   one manifest per cut: every line's file, its
//                        length, the subtitle as displayed, and each displayed word's start and
//                        end. Imported by the tour's code, so the manifest ships inside the same
//                        hashed bundle as the script that cues on its words — they cannot drift
//
// The per-character timings ElevenLabs returns are kept in scripts/narration/cache/, so the
// manifests can be rebuilt without the key or a single credit. The key is read from .env and
// is never printed, logged or written anywhere.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VOICE, parse, scripts } from './narration/lines.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public/black-box/voice');
const MANIFESTS = join(ROOT, 'src/data/narration');
const CACHE = join(ROOT, 'scripts/narration/cache');
const RUNS = join(ROOT, 'public/black-box/runs');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const MAX = Number(args[args.indexOf('--max') + 1]) || 4000;

export function loadScripts() {
	const bundles = {};
	for (const f of readdirSync(RUNS)) if (f.endsWith('.json')) bundles[f.slice(0, -5)] = JSON.parse(readFileSync(join(RUNS, f), 'utf8'));
	const chain = JSON.parse(readFileSync(join(ROOT, 'src/data/bounded-chain.json'), 'utf8')).chain;
	return scripts(bundles, chain);
}

export function hashLine(spoken) {
	const key = JSON.stringify({ spoken, voice: VOICE.id, model: VOICE.model, settings: VOICE.settings, format: VOICE.format });
	return createHash('sha256').update(key).digest('hex').slice(0, 16);
}

/** Seconds of audio in an mp3, measured by the system's own decoder. */
function duration(file) {
	const out = execFileSync('afinfo', [file], { encoding: 'utf8' });
	const m = out.match(/estimated duration:\s*([\d.]+)/);
	if (!m) throw new Error(`could not read the length of ${file}`);
	return Number(m[1]);
}

/** Carry the voice's per-character timings onto the subtitle's words. `alignment.characters`
 *  should spell the spoken text exactly; where the engine normalised something, the two are
 *  walked in step and any unmatched run inherits its neighbours' times. */
function wordTimes(parsed, alignment) {
	const { spoken, display, map } = parsed;
	const chars = alignment.characters;
	const t0 = alignment.character_start_times_seconds;
	const t1 = alignment.character_end_times_seconds;
	const at = new Array(spoken.length).fill(null); // spoken index → alignment index
	for (let i = 0, j = 0; i < spoken.length && j < chars.length;) {
		if (spoken[i] === chars[j]) { at[i++] = j++; continue; }
		// resync: look a short way ahead in either string for the next shared character
		let hop = null;
		for (let k = 1; k < 12 && !hop; k++) {
			if (j + k < chars.length && spoken[i] === chars[j + k]) hop = [0, k];
			else if (i + k < spoken.length && spoken[i + k] === chars[j]) hop = [k, 0];
		}
		if (!hop) { i++; j++; continue; }
		i += hop[0]; j += hop[1];
	}
	const start = (i) => { for (let k = i; k < at.length; k++) if (at[k] !== null) return t0[at[k]]; return t1[chars.length - 1]; };
	const end = (i) => { for (let k = i; k >= 0; k--) if (at[k] !== null) return t1[at[k]]; return 0; };

	const words = [];
	const re = /\S+/g;
	for (let m; (m = re.exec(display));) {
		const a = m.index;
		const b = a + m[0].length - 1;
		const s0 = map[a][0];
		const s1 = map[b][1] - 1;
		words.push({ w: m[0], t0: +start(s0).toFixed(3), t1: +end(s1).toFixed(3) });
	}
	for (let k = 1; k < words.length; k++) if (words[k].t0 < words[k - 1].t0) words[k].t0 = words[k - 1].t0;
	return words;
}

async function voice(key, spoken) {
	const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE.id}/with-timestamps?output_format=${VOICE.format}`;
	for (let attempt = 1; ; attempt++) {
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'application/json' },
			body: JSON.stringify({ text: spoken, model_id: VOICE.model, voice_settings: VOICE.settings }),
		});
		if (res.ok) return res.json();
		const body = await res.text();
		if ((res.status === 429 || res.status >= 500) && attempt < 4) {
			await new Promise((r) => setTimeout(r, 1500 * attempt));
			continue;
		}
		throw new Error(`ElevenLabs ${res.status}: ${body.slice(0, 300)}`);
	}
}

function readKey() {
	const env = existsSync(join(ROOT, '.env')) ? readFileSync(join(ROOT, '.env'), 'utf8') : '';
	const key = (env.match(/^ELEVENLABS_API_KEY=(.+)$/m) || [])[1]?.trim();
	if (!key) throw new Error('no ELEVENLABS_API_KEY in .env');
	return key;
}

async function main() {
	const cuts = loadScripts();
	const lines = Object.entries(cuts).flatMap(([cut, list]) => list.map((l) => ({ cut, ...l, parsed: parse(l.text) })));
	for (const l of lines) l.hash = hashLine(l.parsed.spoken);

	const todo = [...new Map(lines.filter((l) => !existsSync(join(CACHE, `${l.hash}.json`)) || !existsSync(join(OUT, `${l.hash}.mp3`))).map((l) => [l.hash, l])).values()];
	const cost = todo.reduce((s, l) => s + l.parsed.spoken.length, 0);
	for (const [cut, list] of Object.entries(cuts)) {
		const words = list.reduce((s, l) => s + parse(l.text).spoken.split(/\s+/).length, 0);
		console.log(`${cut}: ${list.length} lines, ${words} spoken words`);
	}
	console.log(`to voice: ${todo.length} line(s), ${cost} characters${todo.length ? '' : ' — all cached'}`);

	if (DRY) {
		for (const l of todo) console.log(`  ${l.cut}/${l.id.padEnd(10)} ${l.parsed.spoken}`);
		return;
	}
	if (cost > MAX) throw new Error(`${cost} characters is over the --max guard of ${MAX}; raise it deliberately`);

	mkdirSync(OUT, { recursive: true });
	mkdirSync(CACHE, { recursive: true });
	if (todo.length) {
		const key = readKey();
		for (const l of todo) {
			process.stdout.write(`  voicing ${l.cut}/${l.id} … `);
			const r = await voice(key, l.parsed.spoken);
			writeFileSync(join(OUT, `${l.hash}.mp3`), Buffer.from(r.audio_base64, 'base64'));
			writeFileSync(join(CACHE, `${l.hash}.json`), JSON.stringify({ spoken: l.parsed.spoken, alignment: r.alignment }) + '\n');
			console.log('done');
		}
	}

	for (const [cut, list] of Object.entries(cuts)) {
		const manifest = {
			cut,
			voice: { name: VOICE.name, model: VOICE.model },
			lines: list.map((l) => {
				const parsed = parse(l.text);
				const hash = hashLine(parsed.spoken);
				const cached = JSON.parse(readFileSync(join(CACHE, `${hash}.json`), 'utf8'));
				if (cached.spoken !== parsed.spoken) throw new Error(`cache ${hash} does not match ${cut}/${l.id}`);
				return {
					id: l.id,
					src: `/black-box/voice/${hash}.mp3`,
					duration: +duration(join(OUT, `${hash}.mp3`)).toFixed(3),
					text: parsed.display,
					words: wordTimes(parsed, cached.alignment),
				};
			}),
		};
		manifest.total = +manifest.lines.reduce((s, l) => s + l.duration, 0).toFixed(3);
		mkdirSync(MANIFESTS, { recursive: true });
		writeFileSync(join(MANIFESTS, `${cut}.json`), JSON.stringify(manifest, null, '\t') + '\n');
		console.log(`${cut}.json: ${manifest.lines.length} lines, ${manifest.total.toFixed(1)} s of voice`);
	}

	// Audio for lines no script uses any more would ship with the site for nothing.
	const live = new Set(lines.map((l) => l.hash));
	let pruned = 0;
	for (const [dir, ext] of [[OUT, '.mp3'], [CACHE, '.json']]) {
		for (const f of readdirSync(dir)) {
			if (f.endsWith(ext) && /^[0-9a-f]{16}\./.test(f) && !live.has(f.slice(0, 16))) {
				unlinkSync(join(dir, f));
				pruned++;
			}
		}
	}
	if (pruned) console.log(`pruned ${pruned} file(s) no line uses any more`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main().catch((e) => { console.error(e.message); process.exit(1); });
}
