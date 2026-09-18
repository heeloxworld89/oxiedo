// Guard against a bug that cost two review rounds and was invisible in every
// automated check we had.
//
// Astro scopes a component's CSS by appending [data-astro-cid-…] to every part
// of a selector. Elements the component injects with innerHTML never carry that
// attribute, so a rule written normally against an injected class compiles to a
// selector that can never match. Nothing errors. The build is clean, the CSS
// audit is clean, and the element simply renders with browser defaults — which
// is how the ledger's questions ended up centred and the correction list ended
// up as unstyled monospace.
//
// The fix is to scope through a static ancestor and mark the injected
// descendant :global(). This script asserts that every class the component
// writes from script is reachable in the built stylesheet.

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const src = readFileSync(fileURLToPath(new URL('src/components/ReplayDemo.astro', root)), 'utf8');

// Classes that only ever appear inside a template literal in the script block —
// i.e. the ones the browser creates, which therefore carry no scoping attribute.
const scriptBlock = src.slice(src.indexOf('<script>'), src.indexOf('</script>'));
const injected = new Set();
for (const m of scriptBlock.matchAll(/class="([^"$]*(?:\$\{[^}]*\})?[^"]*)"/g)) {
	for (const cls of m[1].split(/\s+/)) {
		const c = cls.replace(/\$\{.*/, '').trim();
		if (c.startsWith('rp-')) injected.add(c);
	}
}

const cssDir = fileURLToPath(new URL('dist/_astro/', root));
const cssFile = readdirSync(cssDir).find((f) => f.startsWith('ReplayDemo') && f.endsWith('.css'));
if (!cssFile) {
	console.error('  replay scoping: built stylesheet not found — run `npm run build` first');
	process.exit(1);
}
const css = readFileSync(cssDir + cssFile, 'utf8');

const unreachable = [];
for (const cls of [...injected].sort()) {
	// A rule is unreachable when the class is required to carry a cid itself.
	const scoped = new RegExp(`\\.${cls}\\[data-astro-cid[^\\]]*\\]`);
	if (scoped.test(css)) unreachable.push(cls);
}

if (unreachable.length) {
	console.error(`\n  replay scoping: ${unreachable.length} class(es) styled but unreachable\n`);
	for (const c of unreachable) {
		console.error(`  ✗ .${c} — injected by script, but its rule demands [data-astro-cid]`);
		console.error(`      wrap it as  .<static-ancestor> :global(.${c}) { … }`);
	}
	console.error('');
	process.exit(1);
}

// ── second check: every class the SVG emits must actually be styled ──────────
//
// The scoping check above catches a rule that can never match. It does not
// catch a rule that was never written — and an SVG <text> with no font-size
// inherits the page's body size, then multiplies it by the viewBox scale. That
// shipped labels at roughly three times their intended size, colliding with
// everything, with a clean build and a clean CSS audit.

const anatomy = readFileSync(
	fileURLToPath(new URL('src/scripts/replay/anatomy.ts', root)), 'utf8');

const emitted = new Set();
for (const m of anatomy.matchAll(/class:\s*'([^']+)'/g)) {
	for (const c of m[1].split(/\s+/)) if (c.startsWith('an-')) emitted.add(c);
}

// Structural groups that legitimately carry no styling of their own.
const UNSTYLED_OK = new Set(['an-web']);

const unstyled = [...emitted]
	.filter((c) => !UNSTYLED_OK.has(c))
	.filter((c) => !new RegExp(`\\.${c}[\\s),{.]`).test(src))
	.sort();

if (unstyled.length) {
	console.error(`\n  anatomy styling: ${unstyled.length} class(es) drawn but never styled\n`);
	for (const c of unstyled) {
		console.error(`  ✗ .${c} — emitted by anatomy.ts with no rule in ReplayDemo.astro`);
	}
	console.error('      SVG text with no font-size inherits the page size and scales'
		+ ' with the viewBox.\n');
	process.exit(1);
}

// ── THE DOCK IS NOT INSIDE root ──────────────────────────────────────────────────────────
//
// While a guided read runs, the dock is re-parented to <body>: `.rp` sets
// container-type: inline-size, which makes it the containing block for fixed descendants, so
// a fixed card inside it is fixed to the component rather than the viewport.
//
// q() is bound to root. Every q('[data-guide-…]') therefore returns null the moment the dock
// moves, and TypeScript's `!` is a compile-time claim, not a runtime guard — the first
// assignment throws, the component dims, and no dock ever appears. That shipped: a blank grey
// screen with no way out of it. Lookups inside the dock go through gq(), which is bound to
// the element itself.
// Two are legitimately root-scoped and always will be:
//   [data-guide]        the initial capture of the dock, while it is still in the markup
//   [data-guide-start]  the button, which lives in .rp-controls and never moves
const ROOT_SCOPED_OK = new Set(['[data-guide]', '[data-guide-start]']);
const strayQ = [...src.matchAll(/(?<![\w$])q(?:<[^>]*>)?\(\s*'(\[data-guide[^']*\])'/g)]
	.filter((m) => !ROOT_SCOPED_OK.has(m[1]));
if (strayQ.length) {
	console.error(`\n  guide scoping: ${strayQ.length} lookup(s) use q() for a dock element\n`);
	for (const m of strayQ) {
		console.error(`  ✗ q('${m[1]}') — the dock is re-parented to <body>; use gq('${m[1]}')`);
	}
	console.error('      q() is bound to root and returns null once the dock has moved.\n');
	process.exit(1);
}

// ── EVERY gq() SELECTOR EXISTS IN THE DOCK ───────────────────────────────────────────────
//
// gq() is bound to the dock, so a selector that matches nothing inside it returns null just
// as surely as the root-scoped version did. Narrowing the binding fixed WHERE it looks; this
// checks WHAT it looks for. A renamed data attribute in the markup would otherwise put the
// dock straight back into the silent-null failure.
const dock = src.match(/<aside class="rp-guide"[\s\S]*?<\/aside>/);
if (!dock) {
	console.error('\n  guide markup: the .rp-guide dock is not in ReplayDemo.astro\n');
	process.exit(1);
}
const missing = [...src.matchAll(/(?<![\w$])gq(?:<[^>]*>)?\(\s*'\[([\w-]+)\]'/g)]
	.map((m) => m[1])
	.filter((attr, i, a) => a.indexOf(attr) === i)
	.filter((attr) => !new RegExp(`\\b${attr}\\b`).test(dock[0]));
if (missing.length) {
	console.error(`\n  guide markup: ${missing.length} gq() selector(s) match nothing in the dock\n`);
	for (const a of missing) console.error(`  ✗ gq('[${a}]') — no [${a}] inside <aside class="rp-guide">`);
	console.error('      gq() returns null and the next assignment throws mid-paint.\n');
	process.exit(1);
}

console.log(`  replay scoping: ${injected.size} script-injected classes all reachable`);
console.log(`  anatomy styling: ${emitted.size} drawn classes all styled`);
console.log(`  guide scoping: every dock lookup is bound to the dock, not to root`);
