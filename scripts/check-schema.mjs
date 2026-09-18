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
}

if (failures.length) {
	console.error('schema check FAILED:');
	for (const f of failures) console.error('  ' + f);
	process.exit(1);
}
console.log(`  schema: ${files.length} pages, one @graph each, ${refCount} @id references all resolve`);
