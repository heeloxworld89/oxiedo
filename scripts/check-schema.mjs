// Structured-data guard. Runs against dist/ after a build, like check-replay-scoping.mjs.
//
// WHY THIS EXISTS. JSON-LD fails silently and expensively: the page renders, the build passes,
// nothing in the browser complains, and the only symptom is a search engine quietly declining
// to build an entity out of the site — which is invisible for months. Two real defects were
// found by hand on 2026-09-18 and neither would have been caught by anything else in the repo:
//
//   1. /faq emitted a SECOND <script type="application/ld+json"> block. Two blocks parse as two
//      unrelated entities, so 30 questions were tied to nothing — on the one page where the
//      markup was the point.
//   2. The SoftwareApplication node was declared twice, in index.astro and product.astro, and
//      the copies had already drifted. A crawler reconciling two descriptions of one name gets
//      one bad answer out of it.
//
// The checks below are exactly the two classes of failure that produced those.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

// fileURLToPath, not .pathname: the checkout lives under a directory with a space in
// its name, and .pathname hands back the percent-encoded form, which readdirSync cannot open.
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const SITE = 'https://oxiedo.com';

function pages(dir = DIST, out = []) {
	for (const e of readdirSync(dir)) {
		const p = join(dir, e);
		if (statSync(p).isDirectory()) pages(p, out);
		else if (e === 'index.html') out.push(p);
	}
	return out;
}

const failures = [];
const files = pages();
if (files.length === 0) failures.push('dist/ has no pages — run the build first');

// Nodes every page must carry, so that a reference to any of them resolves from anywhere.
const REQUIRED = ['Organization', 'WebSite', 'WebPage', 'ImageObject', 'SoftwareApplication', 'Person'];

let refCount = 0;
let trailCount = 0;

// Astro escapes the crumb labels it renders; the schema strings are raw. Compare like for like.
const decode = (s) =>
	s
		.replace(/&#38;|&amp;/g, '&')
		.replace(/&#60;|&lt;/g, '<')
		.replace(/&#62;|&gt;/g, '>')
		.replace(/&#34;|&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'");

for (const file of files) {
	const route = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\/$/, '');
	const html = readFileSync(file, 'utf8');
	const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];

	// 1. EXACTLY ONE BLOCK. Not "at least one" — the whole point of the @graph is that a crawler
	//    can see the breadcrumb, the page and the company as one connected statement.
	if (blocks.length !== 1) {
		failures.push(`${route}: ${blocks.length} ld+json blocks, expected exactly 1`);
		continue;
	}

	let graph;
	try {
		graph = JSON.parse(blocks[0][1])['@graph'];
	} catch (err) {
		failures.push(`${route}: ld+json does not parse — ${err.message}`);
		continue;
	}
	if (!Array.isArray(graph)) {
		failures.push(`${route}: no @graph array`);
		continue;
	}

	const types = graph.flatMap((n) => (Array.isArray(n['@type']) ? n['@type'] : [n['@type']]));
	for (const t of REQUIRED) {
		if (!types.includes(t)) failures.push(`${route}: missing a ${t} node`);
	}

	// 2. NO DUPLICATE @id. Two nodes claiming one id is the drift failure above, caught at the
	//    point it happens rather than a month later.
	const ids = graph.map((n) => n['@id']).filter(Boolean);
	const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
	if (dupes.length) failures.push(`${route}: duplicate @id ${[...new Set(dupes)].join(', ')}`);

	// 3. EVERY REFERENCE RESOLVES. A bare {"@id": …} is a pointer; if no node in the graph
	//    defines it, it points at nothing. A nested definition is not enough — a consumer that
	//    flattens the graph before resolving (most do) drops it.
	const defined = new Set(ids);
	const refs = new Set();
	const walk = (o) => {
		if (Array.isArray(o)) return o.forEach(walk);
		if (o && typeof o === 'object') {
			const keys = Object.keys(o);
			if (keys.length === 1 && keys[0] === '@id') return refs.add(o['@id']);
			Object.values(o).forEach(walk);
		}
	};
	graph.forEach(walk);
	refCount += refs.size;
	for (const r of refs) {
		if (!defined.has(r)) failures.push(`${route}: @id reference "${r}" resolves to nothing`);
	}

	// 4. EVERY NODE IS TYPED AND ADDRESSABLE at the top level of the graph.
	for (const n of graph) {
		if (!n['@type']) failures.push(`${route}: a graph node has no @type`);
		if (!n['@id']) failures.push(`${route}: a ${n['@type']} node has no @id`);
	}

	// 5. THE PAGE NODE IS THIS PAGE. A copy-pasted @id pointing at another route is the quiet
	//    way a whole section of a site collapses into one entity.
	const expected = `${SITE}${route === '' ? '/' : route}#webpage`;
	const page = graph.find((n) => String(n['@type']).endsWith('WebPage'));
	if (page && page['@id'] !== expected) {
		failures.push(`${route}: WebPage @id is ${page['@id']}, expected ${expected}`);
	}

	// 6. THE VISIBLE TRAIL AND THE MARKED-UP TRAIL ARE THE SAME TRAIL.
	//
	//    This is the check that would have caught the worst of the three defects. Fourteen pages
	//    rendered a breadcrumb; only six declared a BreadcrumbList, because the two were separate
	//    props in separate shapes and nothing tied them together. Eight pages showed a reader a
	//    trail and told a crawler nothing — on a site whose only currently eligible rich result
	//    is the breadcrumb.
	//
	//    Compared by rendered label, in order, against the marked-up names, so the two cannot
	//    drift even by one renamed crumb.
	const nav = html.match(/<nav class="page-banner-trail" aria-label="Breadcrumb">([\s\S]*?)<\/nav>/);
	const crumbs = graph.find((n) => n['@type'] === 'BreadcrumbList');
	if (nav && !crumbs) {
		failures.push(`${route}: renders a breadcrumb trail but emits no BreadcrumbList`);
	} else if (nav && crumbs) {
		const shown = [...nav[1].matchAll(/<li>[\s\S]*?>([^<]+)<\/(?:a|span)>/g)].map((m) =>
			decode(m[1].trim()),
		);
		const marked = crumbs.itemListElement.map((i) => i.name);
		if (shown.join(' › ') !== marked.join(' › ')) {
			failures.push(
				`${route}: trail mismatch — page shows "${shown.join(' › ')}", ` +
					`markup says "${marked.join(' › ')}"`,
			);
		}
		trailCount += 1;
	} else if (!nav && crumbs) {
		failures.push(`${route}: emits a BreadcrumbList with no trail on the page to match it`);
	}
}

// ─── SITEMAP FRESHNESS ──────────────────────────────────────────────────────────────────────
//
// Every <lastmod> must be a real date, and it must be the SAME date the page's own
// dateModified claims. Two sources contradicting each other about when a page changed is
// worse than one: a crawler that catches the disagreement discounts both, which is the exact
// signal this was meant to restore. A missing entry in lastmod.json renders the literal string
// "undefined" into the XML, which is the failure this catches first.
const sitemapPath = join(DIST, 'sitemap.xml');
let sitemapRoutes = 0;
try {
	const xml = readFileSync(sitemapPath, 'utf8');
	for (const [, loc, mod] of xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]*)<\/lastmod>/g)) {
		sitemapRoutes += 1;
		if (!/^\d{4}-\d{2}-\d{2}$/.test(mod)) {
			failures.push(`sitemap: ${loc} has lastmod "${mod}" — not a date`);
			continue;
		}
		const route = loc.replace(SITE, '').replace(/\/$/, '');
		const file = join(DIST, route, 'index.html');
		let html;
		try {
			html = readFileSync(file, 'utf8');
		} catch {
			failures.push(`sitemap: ${loc} is listed but ${route || '/'} was not built`);
			continue;
		}
		const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
		const page = JSON.parse(block[1])['@graph'].find((n) => String(n['@type']).endsWith('WebPage'));
		if (page?.dateModified !== mod) {
			failures.push(
				`${route || '/'}: sitemap says lastmod ${mod}, WebPage says dateModified ${page?.dateModified}`,
			);
		}
	}
} catch (err) {
	failures.push(`sitemap: could not be read — ${err.message}`);
}

// A noindex page must not be in the sitemap. Submitting a URL and telling the crawler not to
// index it is a contradiction Search Console reports as an error.
for (const file of files) {
	const html = readFileSync(file, 'utf8');
	if (!/name="robots" content="noindex/.test(html)) continue;
	const route = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\/$/, '');
	const xml = readFileSync(sitemapPath, 'utf8');
	if (xml.includes(`<loc>${SITE}${route}</loc>`)) {
		failures.push(`${route}: is noindex but is listed in the sitemap`);
	}
}

if (failures.length) {
	console.error('schema check FAILED:');
	for (const f of failures) console.error('  ' + f);
	process.exit(1);
}
console.log(
	`  schema: ${files.length} pages, one @graph each, ${refCount} @id references all resolve`,
);
console.log(`  breadcrumbs: ${trailCount} rendered trails match their BreadcrumbList exactly`);
console.log(`  sitemap: ${sitemapRoutes} routes, every lastmod a real date matching its dateModified`);
