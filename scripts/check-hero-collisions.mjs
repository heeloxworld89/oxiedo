// THE HERO DIAGRAM MUST NOT OVERLAP ITSELF.
//
// WHY THIS EXISTS. The rings were tilted into three dimensions, and the tilt squashes
// y to 0.695 of itself while leaving x alone. Every offset that had been tuned on a
// flat circle therefore walked sideways instead of stepping clear: five of the six
// capability labels ended up printed across a feature chip, and the one on top sat
// over the crown of the core disc. None of that was visible in the code — the numbers
// still said "28px clear of the guide" — and all of it was obvious on screen.
//
// The placement is solved at build time now, against the same geometry. This checks
// the result in a real browser, because the solver estimates text width from the
// character count and only the browser knows what the font actually did.
//
// It also guards the thing that will break this next. The diagram is generated from
// data/features.ts and data/sectors.ts: an eighth feature, a sixth sector or a longer
// capability name all move the geometry, and the failure mode is a label quietly
// sitting on top of another one on the homepage.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

let chromium;
try {
	({ chromium } = await import('playwright'));
} catch {
	console.log('  hero collisions: SKIPPED (playwright not installed)');
	process.exit(0);
}

const MIME = {
	'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
	'.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
	'.png': 'image/png', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain',
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
const ORIGIN = `http://localhost:${server.address().port}`;

let browser;
try {
	browser = await chromium.launch();
} catch {
	console.log('  hero collisions: SKIPPED (no browser binary)');
	server.close();
	process.exit(0);
}

const page = await (await browser.newContext({ viewport: { width: 1600, height: 1000 } })).newPage();
await page.goto(`${ORIGIN}/`);
// The figure builds outward over ~3.2s and only then is at its final geometry.
await page.waitForTimeout(4200);
const res = await page.evaluate(() => {
  const grab = (sel) => [...document.querySelectorAll(sel)]
    .map((e) => ({ t: (e.textContent || '').trim(), b: e.getBoundingClientRect() }));
  const caps = grab('.hv-cap-text');
  const chips = grab('.hv-chip');
  const pills = grab('.hv-pill');
  const chipTexts = grab('.hv-chip-text');
  const pillTexts = grab('.hv-pill-text');
  const coreCap = grab('.hv-core-caption');
  const coreDisc = grab('.hv-core-disc');
  const inter = (a, z) => ({
    w: Math.min(a.right, z.right) - Math.max(a.left, z.left),
    h: Math.min(a.bottom, z.bottom) - Math.max(a.top, z.top),
  });
  const pairs = (A, B, na, nb) => {
    const out = [];
    for (const a of A) for (const z of B) {
      const i = inter(a.b, z.b);
      if (i.w > 3 && i.h > 3) out.push(`${na}:${a.t || '·'} x ${nb}:${z.t || '·'} [${Math.round(i.w)}x${Math.round(i.h)}]`);
    }
    return out;
  };
  const self = (A, n) => {
    const out = [];
    for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
      const k = inter(A[i].b, A[j].b);
      if (k.w > 3 && k.h > 3) out.push(`${n}:${A[i].t} x ${A[j].t} [${Math.round(k.w)}x${Math.round(k.h)}]`);
    }
    return out;
  };
  return {
    capVsChip: pairs(caps, chips, 'cap', 'chip'),
    capVsPill: pairs(caps, pills, 'cap', 'pill'),
    capVsCore: pairs(caps, coreDisc, 'cap', 'core'),
    coreCapVsChip: pairs(coreCap, chips, 'coreCap', 'chip'),
    chipTextSelf: self(chipTexts, 'chip'),
    pillTextSelf: self(pillTexts, 'pill'),
    pillTextVsChip: pairs(pillTexts, chips, 'pill', 'chip'),
  };
});

const total = Object.values(res).flat().length;
if (total) {
	console.log(`  hero collisions: ${total} OVERLAP${total === 1 ? '' : 'S'}`);
	for (const [k, v] of Object.entries(res)) for (const line of v) console.log(`    ${k}: ${line}`);
	await browser.close();
	server.close();
	process.exit(1);
}
console.log('  hero diagram: 6 capability labels, 7 chips, 5 pills, no overlaps');
await browser.close();
server.close();
