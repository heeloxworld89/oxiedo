// The five sectors. Sourced from design/03_SECTORS.md in full. Comparison-matrix rows use
// ui_ux/03 §2's own template sentence, adapted per sector with that sector's noun — the task's
// explicit instruction ("repeated per sector with that sector's own vocabulary"), not five
// invented narratives. Only four nouns are given (site/region/batch/corpus) for five sectors;
// Defense has none assigned, so "environment" is used — drawn from that sector's own repeated
// vocabulary ("conditions actively degrade", "degrading environment"), not invented.

// NAMING: features are referenced by id and rendered from data/features.ts, which uses the
// PUBLIC names from Commercial Plan `03 §5`. The earlier note here about inferring
// "Proofreader -> Label Audit" is superseded — `03 §5` carries the authoritative map and the
// inference turned out to be correct.

export interface Sector {
	id: string;
	name: string;
	/** `12 §1` — which of the three axes this market segments on */
	axis: 'INDUSTRY' | 'OBLIGATION' | 'SCALE';
	/** `12 §1` — the question this market is actually asking */
	question: string;
	cost: string;
	changes: string;
	comparisonNoun: string;
	comparisonLeft: string;
	comparisonRight: string;
	buyerTitle: string;
	buyerQuote: string;
	budget: string;
	figures: { label: string; external: boolean }[];
	/** feature ids that serve this market — `12 §3` "Where Each Product Lands" */
	features: string[];
	/** the feature marked "primary" for this market in `12 §3` */
	primaryFeature: string;
}

export const sectors: Sector[] = [
	{
		id: 'ai-training',
		name: 'AI Training',
		axis: 'SCALE',
		question: 'Is this run failing, and where?',
		cost: 'Mid-training collapse on a large run is the most expensive invisible problem in ML infrastructure. The industry currently has no per-component signal to detect it before it completes.',
		changes: 'The Warning Light supplies that signal: per component, every step, while the run is still recoverable.',
		comparisonNoun: 'corpus',
		comparisonLeft: 'the loss spiked at step 40,200',
		comparisonRight: 'node 1 diverged at step 39,553',
		buyerTitle: 'Infrastructure lead, large fine-tune or domain build',
		buyerQuote:
			'HuggingFace hosts 1.2M models. The teams behind them — running large fine-tunes, continued pretraining, and domain builds with real compute costs and no infrastructure team — are the market.',
		budget: 'A 2-hour recovery costs $16,000–$24,000 in wasted compute alone.',
		figures: [
			{ label: 'Frontier training runs: $200M–$500M each', external: true },
			{ label: 'Llama 3 405B: 419 unexpected interruptions, one 54-day run', external: true },
			{ label: '$16,000–$24,000 wasted per 2-hour recovery', external: true },
		],
		features: ['warning-light', 'proofreader', 'separator'],
		primaryFeature: 'warning-light',
	},
	{
		id: 'regulated-finance',
		name: 'Regulated Finance',
		axis: 'INDUSTRY',
		question: 'What changed, and can a validator verify it?',
		cost: 'A model that cannot be audited at the component level cannot be validated under SR 26-2, the interagency model risk guidance that replaced SR 11-7 in April 2026. A model that cannot be validated cannot be deployed. A model that cannot be deployed is the entire project cost, written off.',
		changes: "Where attribution is available per component, validation can be conducted the same way. The record answers SR 26-2's validation and change-control expectations with evidence rather than with a memo.",
		comparisonNoun: 'region',
		comparisonLeft: 'the model forgets the 2021 regime while learning 2024',
		comparisonRight: 'regime conflict detected in region 2021 → 2024, before deployment',
		buyerTitle: 'The validator — not the quant, not the CTO',
		buyerQuote:
			'The person whose job is to be unconvinced, who currently has no solution for verifying a claim about what a model changed, and who is measured on finding what the model team missed.',
		budget: '$200,000–$500,000 annually. Compare: one quant\'s comp, or a fraction of one bad drawdown.',
		figures: [{ label: '94.6% regime-shift retention. Baseline: 47.3%.', external: false }],
		features: ['diary', 'proofreader', 'separator', 'update-engine', 'certified-deletion', 'federated-node'],
		primaryFeature: 'diary',
	},
	{
		id: 'medical-ai',
		name: 'Medical AI',
		axis: 'INDUSTRY',
		question: 'Which site caused this, and can we show it?',
		cost: 'Clinical AI that fails a CE marking audit delays market entry by 12–36 months. The audit requires documented evidence of training governance. That documentation does not exist for standard networks.',
		changes: 'Each site\'s contribution is recorded before the averaging step destroys it. When a round drops six points, the record says which site, and on what evidence.',
		comparisonNoun: 'site',
		comparisonLeft: 'round 41 dropped six points, cause unknown',
		comparisonRight: 'site 4 diverged at round 39, cause attributed',
		buyerTitle: 'Consortium coordinator, lead-site research informatics',
		buyerQuote: "Round 41 dropped six points and we can't tell which site.",
		budget: '$1M–$10M grant-scoped (Segment B). $200k–$1.5M for regulated clinical (Segment A).',
		figures: [{ label: 'Top-20 pharma R&D: $145.5B', external: true }],
		features: ['federated-node', 'proofreader', 'diary', 'separator', 'update-engine', 'certified-deletion'],
		primaryFeature: 'federated-node',
	},
	{
		id: 'data-obligation',
		name: 'Data Obligation',
		axis: 'OBLIGATION',
		question: 'What data is in here, and can I remove it?',
		cost: 'They trained on data they do not own outright. They signed a contract promising to delete it. The model was trained. The contract was terminated. The model still knows. The only compliant path is retrain from scratch: $100,000–$500,000.',
		changes: 'Certified Deletion routes the memorisable contribution into a named, removable structure, and hands the requester a signed certificate.',
		comparisonNoun: 'batch',
		comparisonLeft: 'the data licence terminated; the model is unchanged',
		comparisonRight: 'batch 12\'s contribution is named, bounded, and removable',
		buyerTitle: 'General counsel or data protection officer, vertical SaaS / HR tech / legal tech',
		buyerQuote: 'The compliance industry has named the solution category — "unlearning-ready architectures" — before any supply exists.',
		budget: 'Retrain from scratch costs $100,000–$500,000, plus downtime, plus revalidation.',
		figures: [{ label: 'Retrain-from-scratch cost: $100,000–$500,000', external: true }],
		features: ['certified-deletion', 'proofreader', 'separator', 'diary', 'federated-node'],
		primaryFeature: 'certified-deletion',
	},
	{
		id: 'defense-safety-critical',
		name: 'Defense & Safety-Critical',
		axis: 'INDUSTRY',
		question: 'What did the system do to itself in the field?',
		cost: 'An autonomous system operating where conditions actively degrade — jamming, spoofing, sensor degradation, physical damage, radiation — faces a problem no frozen model solves.',
		changes: 'Degrading to 80.3% rather than collapsing permanently to 10% is a different safety category, and every modification the system made to itself is bounded, timestamped and reviewable afterwards.',
		comparisonNoun: 'environment',
		comparisonLeft: 'the system fails silently as the environment degrades',
		comparisonRight: 'the degrading environment produces a bounded, timestamped record of every self-modification',
		buyerTitle: 'Research partnership lead, national lab or university defense group',
		buyerQuote:
			'A native, bounded, timestamped record of every self-modification is a genuine contribution regardless of who commercialises it.',
		budget: 'Multi-year horizon, contingent on test-time robustness results.',
		figures: [],
		features: ['diary', 'update-engine', 'proofreader', 'separator'],
		primaryFeature: 'diary',
	},
];
