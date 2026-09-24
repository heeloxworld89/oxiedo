// Sitemap, generated at build time from the same data the pages are, so a new market or
// application appears here without anyone remembering to add it.
//
// /404 is the only exclusion. /press was excluded until 2026-09-17 and is now indexable: it
// carries the fast facts a journalist or a grant reviewer looks for.
//
// changefreq is a hint Google has said it largely ignores, and it is here for the crawlers that
// do not: Bing and Yandex still read it, and it costs four bytes a row.
//
// lastmod WAS `new Date()` FOR ALL 26 URLS, so every page claimed to change on every deploy.
// Google ignores <lastmod> outright once it decides a site's values are unreliable, and
// "everything changed, again" is the textbook case — the signal was being spent for nothing.
// The dates now come from src/data/lastmod.json, resolved from git per route by
// scripts/build-lastmod.py and committed as data. A route's date moves when its own page file
// or the data module it renders from moves; a change to the layout, the nav or the footer is
// not a change to /licensing, and is deliberately not counted.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { features } from '../data/features';
import { sectors } from '../data/sectors';
import lastmod from '../data/lastmod.json';

// Confirmed 2026-09-08. Mirrors SITE in src/layouts/Base.astro — change both together.
const SITE = 'https://oxiedo.com';

// priority is a hint, not a ranking factor. Ordered by how much of the argument each page carries.
const routes: Array<{ path: string; priority: number }> = [
	{ path: '/', priority: 1.0 },
	{ path: '/product', priority: 0.9 },
	{ path: '/technology', priority: 0.9 },
	{ path: '/black-box', priority: 0.8 },
	{ path: '/sectors', priority: 0.8 },
	{ path: '/licensing', priority: 0.8 },
	{ path: '/invest', priority: 0.8 },
	{ path: '/faq', priority: 0.7 },
	{ path: '/data', priority: 0.7 },
	{ path: '/about', priority: 0.6 },
	{ path: '/careers', priority: 0.6 },
	{ path: '/contact', priority: 0.6 },
	{ path: '/insights', priority: 0.4 },
	...features.map((f) => ({ path: `/product/${f.id}`, priority: 0.7 })),
	...sectors.map((s) => ({ path: `/sectors/${s.id}`, priority: 0.7 })),
];

export const GET: APIRoute = async () => {
	// /insights is listed only once it has a post. Until then it is a page whose whole content
	// is a note saying there is no content, and asking Google to index that on a 26-page site
	// spends 4% of the index on nothing. It stays linked and crawlable; it is the indexing that
	// is withheld, by `indexable` on the page itself and by this condition here. Both restore
	// themselves when the first post lands — neither is a flag anyone has to remember to flip.
	const published = (await getCollection('insights')).length > 0;
	const listed = routes.filter((r) => r.path !== '/insights' || published);

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${listed
	.map(
		(r) =>
			`\t<url>\n\t\t<loc>${SITE}${r.path}</loc>\n\t\t<lastmod>${(lastmod as Record<string, string>)[r.path]}</lastmod>\n\t\t<changefreq>${r.priority >= 0.8 ? 'weekly' : 'monthly'}</changefreq>\n\t\t<priority>${r.priority.toFixed(1)}</priority>\n\t</url>`,
	)
	.join('\n')}
</urlset>
`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
