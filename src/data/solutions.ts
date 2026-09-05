// The seven solutions. Re-verified in full against design/02_SOLUTIONS.md at task 2.2 —
// the version created early at task 1.10 (for LadderSchematic) was a preliminary stub with
// incomplete pricing tiers and no prose content. Every field below is sourced to the section
// cited in copyRef. Nothing is invented; where design/02 gives a paragraph verbatim, it is
// reproduced verbatim.

export type SolutionStatus = 'available' | 'inbuild' | 'upcoming';

export interface Gate {
	name: string;
	cost: string;
	status: string;
	ifItFails: string;
}

export interface PriceTier {
	label: string;
	amount: string;
}

export interface Solution {
	id: string;
	name: string;
	status: SolutionStatus;
	problem: string;
	delivers: string;
	buyerQualification: string;
	pricing: PriceTier[];
	pricingNote: string;
	gate: Gate | null;
	cta: { label: string; href: string };
	copyRef: string;
}

export const solutions: Solution[] = [
	{
		id: 'warning-light',
		name: 'The Warning Light',
		status: 'available',
		problem:
			'Silent mid-training collapse costs $16,000–$24,000 in recovery compute per incident. Standard monitoring tells you a run has failed. The Warning Light isolates the collapse to a named component — not just a failed run.',
		delivers:
			'A precise, per-component health signal emitted continuously during training. It names which node is failing, not just that the run is failing. Measured: Node 1, oscillation severity 7.674, detected at step 39,553, within one epoch. When a divergence occurs, the operator rolls back 200 steps, not 20,000.',
		buyerQualification:
			'Who this is for: teams where a single failed run exceeds $50,000 in compute; organisations running large fine-tunes without dedicated infrastructure research teams; anyone who has experienced a silent divergence and had no signal it was coming until the loss spiked. Who this is NOT for: frontier labs who can build their own custom internal tooling; teams whose training runs cost less than $10,000 each.',
		pricing: [
			{ label: 'Per-run', amount: '$10,000–$50,000' },
			{ label: 'Annual, per-team', amount: '$75,000–$250,000' },
			{ label: 'Enterprise / platform', amount: '$300,000–$1,000,000' },
			{ label: 'Research collaboration', amount: 'Near-zero' },
		],
		pricingNote: 'Designed; not yet tested against real customers.',
		gate: null,
		cta: { label: 'Book a session', href: '/contact' },
		copyRef: 'design/02_SOLUTIONS.md §Section 2',
	},
	{
		id: 'label-audit',
		name: 'The Label Audit',
		status: 'inbuild',
		problem:
			'Bad labels in training data cause silent model degradation. Retraining a model merely to find and fix those errors costs between $100,000 and $500,000. The Label Audit finds them before you retrain.',
		delivers:
			'Attaches diagnostic readouts directly to a frozen model checkpoint. It returns a precise map of which labels in your dataset are objectively wrong and which are merely hard for the network to learn. The underlying model does not change; only the diagnostic insight is extracted.',
		buyerQualification:
			'Data leads, research informatics directors, and ML teams fine-tuning models on scraped, aggregated, or third-party data.',
		pricing: [{ label: 'Per engagement', amount: '$25,000–$75,000' }],
		pricingNote: 'Designed; not yet tested against real customers.',
		gate: {
			name: 'Frozen-model wrapper viability',
			cost: '~1 GPU-day',
			status: 'not started',
			ifItFails: 'Native-training mode only — stronger signal, higher friction.',
		},
		cta: { label: 'Pre-book a conversation', href: '/contact' },
		copyRef: 'design/02_SOLUTIONS.md §Section 4',
	},
	{
		id: 'model-change-record',
		name: 'The Model Change Record (The Diary)',
		status: 'inbuild',
		problem:
			'Regulators and auditors now demand a per-component record of every modification a model made to itself during training. Writing that record after the fact is testimony, not evidence. It will not survive a hostile regulatory review.',
		delivers:
			'Emits a signed, regulator-legible record of every structural modification made during training. It documents exactly which component changed, what diagnosis triggered it, what treatment was applied, at what step, and within what declared bound. This is generated natively during training. It is not written after the fact.',
		buyerQualification:
			'Regulated medical device teams, medical AI governance boards, financial model risk managers, and EU AI Act compliance counsel. Typically triggered by a failed audit or an impending regulatory deadline.',
		pricing: [{ label: 'Per engagement', amount: '$50,000–$150,000' }],
		pricingNote: 'Designed; not yet tested against real customers.',
		gate: {
			name: 'Four known defects closed + regulatory review',
			cost: 'days of work',
			status: 'not started',
			ifItFails: 'None — the defects are fixable.',
		},
		cta: { label: 'Pre-book a conversation', href: '/contact' },
		copyRef: 'design/02_SOLUTIONS.md §Section 5',
	},
	{
		id: 'source-separator',
		name: 'The Source Separator',
		status: 'upcoming',
		problem:
			"Multi-source training creates a model no one can fully account for. A scanner hardware change, a new site protocol, or a divergent data batch shifts the model's behaviour, and no one can say by how much or trace it to which specific component.",
		delivers:
			"Delivers three distinct objects: a source-invariant core model, bounded named source components, and a definitive separation record. Each data source's contribution is explicitly named, mathematically bounded, and entirely removable without retraining.",
		buyerQualification:
			'Medical imaging consortiums, pathology labs, regulated finance institutions, biotech firms, and multi-tenant AI operators. Funded via governance and risk budgets.',
		pricing: [{ label: 'Per year, on-premise', amount: '$150,000–$400,000' }],
		pricingNote: 'Designed; not yet tested against real customers.',
		gate: {
			name: 'The separation study',
			cost: '~20 GPU-hr',
			status: 'not started',
			ifItFails: 'Four products close. Three survive.',
		},
		cta: { label: 'Pre-book a conversation', href: '/contact' },
		copyRef: 'design/02_SOLUTIONS.md §Section 6',
	},
	{
		id: 'certified-deletion',
		name: 'Certified Deletion',
		status: 'upcoming',
		problem:
			'GDPR Article 17 is enforced. A data licence terminates. A contributor requests removal. A regulator asks exactly what data is in your model. Currently, the only legally compliant answer is to retrain the model from scratch, costing $100,000–$500,000 per incident.',
		delivers:
			"Routes the memorisable portion of each source's training signal into named, bounded, deletable structures. Removing the specific structure cleanly removes the source-specific capacity. Hands the requester a cryptographically signed deletion certificate alongside a mathematically bounded statement of residual influence.",
		buyerQualification:
			'Any institution that trains on data it does not own outright and carries a strict deletion obligation. Funded via compliance budgets.',
		pricing: [
			{ label: 'Assessment (one-off)', amount: '$15,000–$40,000' },
			{ label: 'Deployment licence, per year', amount: '$150,000–$400,000' },
			{ label: 'Enterprise portfolio', amount: '$500,000–$1,500,000' },
			{ label: 'Plus per-certificate metered fees', amount: '—' },
		],
		pricingNote: 'Designed; not yet tested against real customers.',
		gate: {
			name: 'Separation study + legal opinion on what may be certified (GDPR Article 17)',
			cost: 'one consultation',
			status: 'not started',
			ifItFails: 'The product becomes a strong story rather than a certifiable one.',
		},
		cta: { label: 'Pre-book a conversation', href: '/contact' },
		copyRef: 'design/02_SOLUTIONS.md §Section 7',
	},
	{
		id: 'federated-node',
		name: 'The Federated Node',
		status: 'upcoming',
		problem:
			'Federated training destroys attribution. By the time the shared model aggregates at the central server, no participating party can say what their specific data contributed to the global model — or prove they have the ability to remove it.',
		delivers:
			"Runs the Source Separator across N participating parties. Only the shared, invariant knowledge aggregates. Each party's source-specific capacity stays local, securely named, bounded, and completely removable. Provides a definitive per-party attribution record before aggregation occurs.",
		buyerQualification:
			'Research consortia coordinators, multi-site clinical AI programmes, and privacy-first data collectives. Primarily grant-funded.',
		pricing: [{ label: 'Per federation', amount: '$60,000–$120,000' }],
		pricingNote: 'Designed; not yet tested against real customers.',
		gate: {
			name: 'Separation study + formal privacy analysis',
			cost: 'analysis, no GPU',
			status: 'not started',
			ifItFails: 'Blocks every consortium conversation.',
		},
		cta: { label: 'Pre-book a conversation', href: '/contact' },
		copyRef: 'design/02_SOLUTIONS.md §Section 8',
	},
	{
		id: 'bounded-update-engine',
		name: 'The Bounded Update Engine',
		status: 'upcoming',
		problem:
			"A deployed medical AI model is actively decaying in the field. Reapproval of a new model costs more than the original development. So it stays deployed, degrading, until it fails an audit. The FDA's Predetermined Change Control Plan (PCCP) framework creates an approved path — but only if the model's changes can be declared, bounded, and evidenced in advance.",
		delivers:
			'Supervises model retraining strictly inside a declared, cryptographically signed bound. Produces a continuous, immutable record demonstrating that every internal modification stayed inside the declared regulatory limit. Built precisely to the FDA PCCP framework specifications.',
		buyerQualification:
			'Regulated clinical AI deployers facing model decay with no viable change-control path. Primary territory: Europe first (EU AI Act, Health Data Space mandate March 2029).',
		pricing: [{ label: 'Per engagement', amount: '$200,000–$500,000' }],
		pricingNote: 'Designed; not yet tested against real customers.',
		gate: {
			name: "A regulatory consultant's read",
			cost: 'one engagement',
			status: 'not started',
			ifItFails: 'Long lead time — start it now, it gates the largest prize.',
		},
		cta: { label: 'Pre-book a conversation', href: '/contact' },
		copyRef: 'design/02_SOLUTIONS.md §Section 9',
	},
];
