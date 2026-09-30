// Build the link-preview cards (Open Graph / X), 1200×630 PNG, one per key page.
//
//   node scripts/build-og-cards.mjs      → public/og/*.png
//
// Rendered from HTML in the site's own fonts (public/fonts) and colours (tokens.css), so a card
// is the site, not a picture of a different brand. Filenames carry a version suffix: WhatsApp,
// X, LinkedIn and Slack cache a preview image by URL for days, and a new name is the only
// reliable way to make them fetch the new one. Bump OG_VERSION whenever the cards change, and
// keep it in step with OG_VERSION in src/layouts/Base.astro.
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

export const OG_VERSION = '2';
const root = resolve(new URL('..', import.meta.url).pathname);
const font = (f) => `data:font/woff2;base64,${readFileSync(resolve(root, 'public/fonts', f)).toString('base64')}`;

const cards = [
	{
		name: 'home',
		tag: 'Accepted · DeepMath 2026',
		title: 'AI that can see inside itself, and fix what it finds.',
		sub: 'ORMAS names the part of a neural network that broke while it trains, and repairs it.',
		stats: [['+70.3', 'points recovered after a layer was destroyed'], ['94.6%', 'kept after a new task, no replay'], ['383', 'controlled experiments']],
	},
	{
		name: 'black-box',
		tag: 'Live demo · a real training run',
		title: 'Watch a neural network heal itself.',
		sub: 'Two layers destroyed mid-training. ORMAS names both two steps later and repairs them.',
		stats: [['2 steps', 'to name the damage'], ['85', 'logged repairs'], ['80.3%', 'vs 10.0% for a standard network']],
	},
	{
		name: 'technology',
		tag: 'The research',
		title: 'The architecture, the evidence, and where it loses.',
		sub: 'Preprint on Zenodo. Stability analysis accepted at DeepMath 2026.',
		stats: [['383', 'controlled experiments'], ['4', 'architecture families'], ['3', 'published runs where it loses']],
	},
	{
		name: 'about',
		tag: 'The founder',
		title: 'Founded by Rokib Al Dhin Raadh.',
		sub: 'Founder & CEO of Oxiedo and the inventor of ORMAS. Sole author of the ORMAS preprint; stability analysis accepted at DeepMath 2026.',
		stats: [],
	},
	{
		name: 'invest',
		tag: 'Pre-seed',
		title: 'The round, the arithmetic, and the risks.',
		sub: 'A new kind of neural network, with every number sourced and every risk stated on one page.',
		stats: [['$1.5M', 'pre-seed'], ['18', 'months of runway'], ['6', 'milestones with acceptance criteria']],
	},
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// The network motif on the right: a small graph with one stage destroyed (red) and named and
// repaired (amber), which is the whole product in one picture.
const motif = `
<svg class="motif" viewBox="0 0 360 360" aria-hidden="true">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#E0A93B" stop-opacity=".55"/><stop offset="100%" stop-color="#E0A93B" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${(() => {
		const cols = [[60, [80, 180, 280]], [150, [60, 140, 220, 300]], [240, [80, 180, 280]], [320, [130, 230]]];
		let lines = '', dots = '';
		for (let c = 0; c < cols.length - 1; c++)
			for (const y1 of cols[c][1]) for (const y2 of cols[c + 1][1])
				lines += `<line x1="${cols[c][0]}" y1="${y1}" x2="${cols[c + 1][0]}" y2="${y2}" stroke="#A5A0FF" stroke-opacity=".22" stroke-width="1.2"/>`;
		cols.forEach(([x, ys], c) => ys.forEach((y, i) => {
			const hit = c === 1 && i === 1;
			if (hit) dots += `<circle cx="${x}" cy="${y}" r="34" fill="url(#glow)"/><circle cx="${x}" cy="${y}" r="11" fill="#E0A93B"/><circle cx="${x}" cy="${y}" r="18" fill="none" stroke="#E0A93B" stroke-width="2" stroke-dasharray="4 5"/>`;
			else dots += `<circle cx="${x}" cy="${y}" r="7" fill="#A5A0FF" fill-opacity=".85"/>`;
		}));
		return lines + dots;
	})()}
  <text x="150" y="104" text-anchor="middle" class="motif-label">named · repaired</text>
</svg>`;

const logo = `
<div class="logo">
  <svg viewBox="0 0 24 24" class="ring"><defs><linearGradient id="sw" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#A5A0FF"/><stop offset="50%" stop-color="#C79BFF"/><stop offset="100%" stop-color="#67E8F9"/></linearGradient></defs>
    <circle cx="12" cy="12" r="9.4" pathLength="100" fill="none" stroke="url(#sw)" stroke-width="3.4" stroke-linecap="round"
      stroke-dasharray="86 100" stroke-dashoffset="14" transform="rotate(-128 12 12)"/></svg>
  <span>XIEDO</span>
</div>`;

const page = (c) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Fraunces;src:url(${font('Fraunces-Variable.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:Jakarta;src:url(${font('PlusJakartaSans-Regular.woff2')}) format('woff2');font-weight:400}
@font-face{font-family:Jakarta;src:url(${font('PlusJakartaSans-SemiBold.woff2')}) format('woff2');font-weight:600}
@font-face{font-family:Mono;src:url(${font('JetBrainsMono-Regular.woff2')}) format('woff2');font-weight:400}
@font-face{font-family:Mono;src:url(${font('JetBrainsMono-Bold.woff2')}) format('woff2');font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px}
body{position:relative;overflow:hidden;color:#F3F1EA;font-family:Jakarta;
  background:radial-gradient(900px 520px at 88% 40%, #2A2D55 0%, rgba(22,24,43,0) 70%), #16182B}
body:before{content:"";position:absolute;left:0;top:0;bottom:0;width:10px;background:linear-gradient(180deg,#A5A0FF,#C79BFF 50%,#67E8F9)}
.wrap{position:absolute;left:84px;top:64px;right:84px;bottom:56px;display:flex;flex-direction:column}
.logo{display:flex;align-items:center;gap:9px;font-family:Mono;font-weight:700;font-size:30px;letter-spacing:.26em}
.logo .ring{width:27px;height:27px}
.tag{margin-top:32px;align-self:flex-start;font-family:Mono;font-size:19px;letter-spacing:.14em;text-transform:uppercase;
  color:#16182B;background:#A5A0FF;padding:7px 16px;border-radius:999px}
h1{margin-top:22px;font-family:Fraunces;font-weight:700;font-size:${c.title.length > 44 ? 56 : 68}px;line-height:1.06;letter-spacing:-.01em;max-width:${c.stats.length ? 760 : 820}px}
.sub{margin-top:16px;font-size:22px;line-height:1.4;color:rgba(243,241,234,.74);max-width:700px}
.stats{margin-top:auto;padding-top:22px;display:flex;gap:40px}
.stat{border-top:2px solid #A5A0FF;padding-top:12px;width:210px}
.stat b{display:block;font-family:Mono;font-weight:700;font-size:34px;color:#A5A0FF}
.stat span{display:block;margin-top:6px;font-size:17px;line-height:1.35;color:rgba(243,241,234,.72)}
.url{position:absolute;right:84px;bottom:56px;font-family:Mono;font-size:20px;letter-spacing:.08em;color:rgba(243,241,234,.62)}
.motif{position:absolute;right:56px;top:96px;width:360px;height:360px}
.motif-label{font-family:Mono;font-size:15px;letter-spacing:.1em;fill:#E0A93B;text-transform:uppercase}
</style></head><body>
${motif}
<div class="wrap">
  ${logo}
  <div class="tag">${esc(c.tag)}</div>
  <h1>${esc(c.title)}</h1>
  <p class="sub">${esc(c.sub)}</p>
  ${c.stats.length ? `<div class="stats">${c.stats.map(([f, l]) => `<div class="stat"><b>${esc(f)}</b><span>${esc(l)}</span></div>`).join('')}</div>` : ''}
</div>
<div class="url">oxiedo.com</div>
</body></html>`;

mkdirSync(resolve(root, 'public/og'), { recursive: true });
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const c of cards) {
	await tab.setContent(page(c), { waitUntil: 'load' });
	await tab.evaluate(() => document.fonts.ready);
	const out = resolve(root, `public/og/${c.name}-v${OG_VERSION}.png`);
	await tab.screenshot({ path: out, type: 'png' });
	console.log('  wrote', out.replace(root + '/', ''));
}
await browser.close();
