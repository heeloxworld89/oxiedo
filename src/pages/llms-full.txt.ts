// /llms-full.txt — the full text of the pages an answer engine is most likely to be asked about,
// in one plain file, for tools that read a whole site in one fetch rather than crawling it.
//
// Built from site-content/, the markdown mirror of the rendered pages that
// scripts/build-site-content.py regenerates on every content change. So it states exactly what the
// pages state, and nothing else. /llms.txt is the short index; this is the long form.
import type { APIRoute } from 'astro';

const SITE = 'https://oxiedo.com';
const pages = import.meta.glob('/site-content/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const ORDER = ['home', 'technology', 'black-box', 'about', 'press', 'product', 'licensing', 'data', 'invest', 'faq'];

export const GET: APIRoute = () => {
	const sections = ORDER.map((name) => pages[`/site-content/${name}.md`])
		.filter(Boolean)
		.map((md) => md.trim());
	const body = `# Oxiedo — full site text

> The complete text of oxiedo.com's main pages. The short index is ${SITE}/llms.txt. Oxiedo is the company; ORMAS is the neural network training architecture it builds, invented by its founder and CEO, Rokib Al Dhin Raadh. Preprint: https://doi.org/10.5281/zenodo.21730363

${sections.join('\n\n---\n\n')}
`;
	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
	});
};
