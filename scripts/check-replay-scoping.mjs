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

console.log(`  replay scoping: ${injected.size} script-injected classes all reachable`);
console.log(`  anatomy styling: ${emitted.size} drawn classes all styled`);
