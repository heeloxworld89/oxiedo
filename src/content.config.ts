// design/06_INSIGHTS.md. Typed schema for the insights collection. Zero posts exist at launch —
// the nine entries in design/06 are post BRIEFS (angle, hook, key arguments, word-count target)
// for future writing, not finished copy. Writing full 1,200–3,000-word articles from a brief
// would be authoring, not assembling — a Law 1 violation. The collection and feed are built
// empty on purpose; the empty state is deliberate, not broken.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const insights = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),
	schema: z.object({
		title: z.string(),
		teaser: z.string(),
		category: z.enum(['The Mechanism', 'The Market', 'The Evidence', 'The Company']),
		date: z.date(),
		readTime: z.string(),
	}),
});

export const collections = { insights };
