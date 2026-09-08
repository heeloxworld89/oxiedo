// Sitemap, generated at build time from the same data the pages are, so a new market or
// application appears here without anyone remembering to add it.
//
// /press and /404 are excluded to match robots.txt and the `indexable={false}` on those pages —
// three places saying the same thing, which is one more than ideal but is how crawlers actually
// behave. If /press goes public, remove it from all three.
import type { APIRoute } from 'astro';
import { features } from '../data/features';
import { sectors } from '../data/sectors';

// Confirmed 2026-09-08. Mirrors SITE in src/layouts/Base.astro — change both together.
const SITE = 'https://oxiedo.com';

// priority is a hint, not a ranking factor. Ordered by how much of the argument each page carries.
const routes: Array<{ path: string; priority: number }> = [
	{ path: '/', priority: 1.0 },
	{ path: '/product', priority: 0.9 },
	{ path: '/technology', priority: 0.9 },
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

export const GET: APIRoute = () => {
	const today = new Date().toISOString().slice(0, 10);
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
	.map(
		(r) =>
			`\t<url>\n\t\t<loc>${SITE}${r.path}</loc>\n\t\t<lastmod>${today}</lastmod>\n\t\t<priority>${r.priority.toFixed(1)}</priority>\n\t</url>`,
	)
	.join('\n')}
</urlset>
`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
