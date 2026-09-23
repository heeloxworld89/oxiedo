// Records the demo tour to a video file, hands-free.
//
//   npm run build && npm run record:tour            → recordings/oxiedo-tour-demo.webm
//   npm run build && node scripts/record-tour.mjs full
//
// A SILENT REFERENCE CAPTURE, NOT THE SUBMISSION. Playwright records no audio and at a modest
// bitrate — fine for reviewing timing and composition, not for the file a reviewer watches.
// For that: open /black-box?tour=demo&rec=1 in a full-screen 1920×1080 Chrome window, start
// Screen Studio (or OBS) capturing SYSTEM AUDIO at 60fps, press the start gate's Play, and
// stop on the end card. `rec=1` hides the keyboard hints; the system cursor is hidden for the
// whole tour either way. The narration and the score both play through the page.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync, renameSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const cut = process.argv[2] === 'full' ? 'full' : 'demo';
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const OUT = fileURLToPath(new URL('../recordings/', import.meta.url));
if (!existsSync(join(DIST, 'black-box/index.html'))) {
	console.error('  record: dist/ is missing /black-box — run `npm run build` first');
	process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const MIME = {
	'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
	'.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
	'.mp3': 'audio/mpeg',
};
const server = createServer((req, res) => {
	let p = join(DIST, decodeURIComponent(req.url.split('?')[0]));
	if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
	if (!existsSync(p)) p += '.html';
	if (!existsSync(p)) { res.writeHead(404); return res.end('not found'); }
	res.writeHead(200, { 'Content-Type': MIME[extname(p)] ?? 'application/octet-stream' });
	res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, r));
// mute=1: silent, so no start gate — the timing is identical to the voiced tour.
const url = `http://localhost:${server.address().port}/black-box?tour=${cut}&rec=1&mute=1`;

const size = { width: 1920, height: 1080 };
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: size, recordVideo: { dir: OUT, size } });
const page = await context.newPage();
console.log(`  record: ${cut} cut at ${size.width}×${size.height} — this runs in real time`);
const started = Date.now();
await page.goto(url);
await page.waitForFunction(() => window.__tourState && !['waiting', 'running'].includes(window.__tourState), null, {
	timeout: 10 * 60 * 1000,
	polling: 500,
});
// Hold on the end card, as a video would.
await page.waitForTimeout(3500);
const state = await page.evaluate(() => window.__tourState);
const video = page.video();
await context.close();
const raw = await video.path();
const file = join(OUT, `oxiedo-tour-${cut}.webm`);
renameSync(raw, file);
await browser.close();
server.close();
console.log(`  record: ${state} after ${((Date.now() - started) / 1000).toFixed(1)}s → ${file}`);
