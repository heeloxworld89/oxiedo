// The seven features of ORMAS.
//
// REWRITTEN 2026-09-07. This file was `solutions.ts` and described seven products, each with its
// own status, gate and price list. ORMAS is ONE product; these are the seven things it can be
// asked to do. Status, gate and pricing fields are gone — every feature is offered on the same
// terms, under one licence, by pre-booking.
//
// NAMES ARE THE PUBLIC ONES. Commercial Plan `03 §5` carries the authoritative internal <-> public
// map and states the rule outright: "Never use public names in the strategy corpus. Never use
// internal names in buyer-facing copy." The site had been using INTERNAL names for four of the
// seven — Label Audit, Model Change Record, Source Separator, Bounded Update Engine — which is
// why sector pages referenced "The Proofreader" and "The Separator" and nothing on the product
// pages matched. The public names are now the only ones used.
//
//   internal                  public                 (Commercial Plan 03 §5)
//   Label Audit            -> The Proofreader
//   Training Health Monitor-> The Warning Light
//   Model Change Record    -> The Diary
//   Source Separator       -> The Separator
//   Certified Deletion     -> Certified Deletion
//   Federated Node         -> The Federated Node
//   Bounded Update Engine  -> The Update Engine
//
// `capabilities` is the row from `03 §3` The Matrix — which of the six primitive capabilities the
// feature consumes. `industryNouns` is `03 §4` The Horizontality Proof: the same mechanism with
// the customer's own noun substituted, which is the evidence that one product serves every
// sector. `question` is from `00 §6` / `12 §1`.
//
// Prose in `problem`, `delivers` and `buyer` is carried over unchanged from the sourced copy in
// design/02_SOLUTIONS.md. Nothing here is invented.

// WHY buyerFor / buyerNot / buyerNote EXIST, 2026-09-07. The feature page renders "who it is
// for" as lists, because `buyer` was a single 405-character paragraph that already contained a
// list. The first version derived those lists by splitting the string on commas and semicolons.
// That mangled real copy: "ML teams fine-tuning models on scraped, aggregated, or third-party
// data" is ONE buyer whose description happens to contain commas, and it came out as three
// separate buyers — "ML teams fine-tuning models on scraped", "aggregated", "or third-party
// data". Same class of bug as the sector-figure split that produced a headline of "3" from
// "Llama 3 405B".
//
// So the split is done once, by hand, and stored. `buyer` is kept verbatim as the source of
// truth; these three fields are that same sentence divided at the points a person would divide
// it. No wording is added or changed.

export type Capability = 'ACCOUNT' | 'PROTECT' | 'REPAIR' | 'DETECT' | 'ISOLATE' | 'SUPPRESS';

export interface Feature {
	id: string;
	name: string;
	question: string;
	/** One sentence on what it actually does, in the buyer's language — used on the home page. */
	summary: string;
	/** What the customer has to provide or change. The ladder in Commercial Plan `04` is ordered by
	 *  exactly this, from "send a file" to "agree a bound with your regulator". */
	requires: string;
	problem: string;
	delivers: string;
	buyer: string;
	/** `buyer`, split by hand. See the note above the interface. */
	buyerFor: string[];
	buyerNot: string[];
	buyerNote: string | null;
	capabilities: Capability[];
	industryNouns: { industry: string; noun: string }[];
}

// ORDER IS THE LADDER, Commercial Plan `04 §3`: ordered by how hard it is for a customer to say
// yes, not by how impressive the capability is. The Proofreader asks for a file and never touches
// their model; the Update Engine asks for a limit agreed with their regulator before they begin.
// A reader deciding where to start is told by the order itself, so it must not be shuffled.
export const features: Feature[] = [
	{
		id: 'proofreader',
		name: 'The Proofreader',
		question: 'Which samples are damaging which component?',
		summary:
			'Attaches to a model you have already trained, without modifying it, and returns a ranked list of the labels it believes are wrong — kept separate from the ones that are merely difficult. Broken down by class, and by source where your data carries it.',
		requires: 'A model file and a sample of your labels',
		problem:
			'Bad labels in training data cause silent model degradation. Retraining a model merely to find and fix those errors costs between $100,000 and $500,000. The Proofreader finds them before you retrain.',
		delivers:
			'Attaches diagnostic readouts directly to a frozen model checkpoint. It returns a precise map of which labels in your dataset are objectively wrong and which are merely hard for the network to learn. The underlying model does not change; only the diagnostic insight is extracted.',
		buyer:
			'Data leads, research informatics directors, and ML teams fine-tuning models on scraped, aggregated, or third-party data.',
		buyerFor: ['Data leads', 'Research informatics directors', 'ML teams fine-tuning models on scraped, aggregated, or third-party data'],
		buyerNot: [],
		buyerNote: null,
		capabilities: ['DETECT'],
		industryNouns: [
			{ industry: 'Medical', noun: 'mislabelled scans' },
			{ industry: 'Finance', noun: 'mislabelled events' },
			{ industry: 'Biotech', noun: 'mis-annotated assays' },
			{ industry: 'AI lab', noun: 'web-scrape noise' },
			{ industry: 'SaaS', noun: 'mislabelled tickets' },
		],
	},
	{
		id: 'warning-light',
		name: 'The Warning Light',
		question: 'Is this run failing, and where?',
		summary:
			'Watches every component of a model while it trains and raises an alarm when one crosses its own baseline — naming the component, not just the run. The operator rolls back hundreds of steps instead of thousands.',
		requires: 'One line around your training loop',
		problem:
			'Silent mid-training collapse costs $16,000–$24,000 in recovery compute per incident. Standard monitoring tells you a run has failed. The Warning Light isolates the collapse to a named component — not just a failed run.',
		delivers:
			'A precise, per-component health signal emitted continuously during training. It names which node is failing, not just that the run is failing. Measured: Node 1, oscillation severity 7.674, detected at step 39,553, within one epoch. When a divergence occurs, the operator rolls back 200 steps, not 20,000.',
		buyer:
			'Who this is for: teams where a single failed run exceeds $50,000 in compute; organisations running large fine-tunes without dedicated infrastructure research teams; anyone who has experienced a silent divergence and had no signal it was coming until the loss spiked. Who this is NOT for: frontier labs who can build their own custom internal tooling; teams whose training runs cost less than $10,000 each.',
		buyerFor: ['teams where a single failed run exceeds $50,000 in compute', 'organisations running large fine-tunes without dedicated infrastructure research teams', 'anyone who has experienced a silent divergence and had no signal it was coming until the loss spiked'],
		buyerNot: ['frontier labs who can build their own custom internal tooling', 'teams whose training runs cost less than $10,000 each'],
		buyerNote: null,
		capabilities: ['ACCOUNT'],
		industryNouns: [
			{ industry: 'AI lab', noun: 'a $200M run failing silently' },
			{ industry: 'SaaS', noun: 'a fine-tune failing' },
		],
	},
	{
		id: 'diary',
		name: 'The Diary',
		question: 'What did the model do to itself, and when?',
		summary:
			'Produces a signed, timestamped record of every modification made during training: the component, the diagnosis, the treatment, the step, and the limit it stayed inside. Diffable against the last version you approved.',
		requires: 'Training on the architecture',
		problem:
			'Regulators and auditors now demand a per-component record of every modification a model made to itself during training. Writing that record after the fact is testimony, not evidence. It will not survive a hostile regulatory review.',
		delivers:
			'Emits a signed, regulator-legible record of every structural modification made during training. It documents exactly which component changed, what diagnosis triggered it, what treatment was applied, at what step, and within what declared bound. This is generated natively during training. It is not written after the fact.',
		buyer:
			'Regulated medical device teams, medical AI governance boards, financial model risk managers, and EU AI Act compliance counsel. Typically triggered by a failed audit or an impending regulatory deadline.',
		buyerFor: ['Regulated medical device teams', 'Medical AI governance boards', 'Financial model risk managers', 'EU AI Act compliance counsel'],
		buyerNot: [],
		buyerNote: 'Typically triggered by a failed audit or an impending regulatory deadline.',
		capabilities: ['ACCOUNT', 'PROTECT', 'REPAIR'],
		industryNouns: [
			{ industry: 'Medical', noun: 'PCCP submission' },
			{ industry: 'Finance', noun: 'model-risk validation' },
			{ industry: 'Biotech', noun: 'study documentation' },
			{ industry: 'AI lab', noun: 'model card' },
			{ industry: 'SaaS', noun: 'AI Act Annex IV' },
		],
	},
	{
		id: 'separator',
		name: 'The Separator',
		question: 'Which part of this is the source, not the signal?',
		summary:
			'Separates what a model learned about the world from what it learned about where the data came from. You ship one model that works anywhere, a named removable part for each source, and a record of which data justified each one.',
		requires: 'Training on the architecture, with source labels',
		problem:
			'Multi-source training creates a model no one can fully account for. A scanner hardware change, a new site protocol, or a divergent data batch shifts the model\'s behaviour, and no one can say by how much or trace it to which specific component.',
		delivers:
			'Delivers three distinct objects: a source-invariant core model, bounded named source components, and a definitive separation record. Each data source\'s contribution is explicitly named, mathematically bounded, and entirely removable without retraining.',
		buyer:
			'Medical imaging consortiums, pathology labs, regulated finance institutions, biotech firms, and multi-tenant AI operators. Funded via governance and risk budgets.',
		buyerFor: ['Medical imaging consortiums', 'Pathology labs', 'Regulated finance institutions', 'Biotech firms', 'Multi-tenant AI operators'],
		buyerNot: [],
		buyerNote: 'Funded via governance and risk budgets.',
		capabilities: ['ACCOUNT', 'DETECT', 'ISOLATE', 'SUPPRESS'],
		industryNouns: [
			{ industry: 'Medical', noun: 'site — the hospital' },
			{ industry: 'Finance', noun: 'region or desk' },
			{ industry: 'Biotech', noun: 'batch — the assay run' },
			{ industry: 'AI lab', noun: 'source — the corpus' },
			{ industry: 'SaaS', noun: 'tenant — the customer' },
		],
	},
	{
		id: 'certified-deletion',
		name: 'Certified Deletion',
		question: 'What data is in here, and can I remove it?',
		summary:
			"Removes a named source's contribution and issues a signed certificate of exactly what was removed, with a bounded statement of what changed. No retraining.",
		requires: 'The Separator, plus your deletion policy',
		problem:
			'GDPR Article 17 is enforced. A data licence terminates. A contributor requests removal. A regulator asks exactly what data is in your model. Currently, the only legally compliant answer is to retrain the model from scratch, costing $100,000–$500,000 per incident.',
		delivers:
			'Routes the memorisable portion of each source\'s training signal into named, bounded, deletable structures. Removing the specific structure cleanly removes the source-specific capacity. Hands the requester a cryptographically signed deletion certificate alongside a mathematically bounded statement of residual influence.',
		buyer:
			'Any institution that trains on data it does not own outright and carries a strict deletion obligation. Funded via compliance budgets.',
		buyerFor: ['Any institution that trains on data it does not own outright and carries a strict deletion obligation'],
		buyerNot: [],
		buyerNote: 'Funded via compliance budgets.',
		capabilities: ['ACCOUNT', 'DETECT', 'ISOLATE', 'SUPPRESS'],
		industryNouns: [
			{ industry: 'Medical', noun: 'contributor withdrawal' },
			{ industry: 'Finance', noun: 'client data rights' },
			{ industry: 'Biotech', noun: 'licensed compound data' },
			{ industry: 'AI lab', noun: 'opt-out corpus' },
			{ industry: 'SaaS', noun: 'termination clause' },
		],
	},
	{
		id: 'federated-node',
		name: 'The Federated Node',
		question: 'Can we train together without pooling the data?',
		summary:
			"Runs inside a federation you already have. Each party's contribution is recorded before the averaging step destroys it — so when a round drops six points, you can say which site.",
		requires: 'A federation that already exists',
		problem:
			'Federated training destroys attribution. By the time the shared model aggregates at the central server, no participating party can say what their specific data contributed to the global model — or prove they have the ability to remove it.',
		delivers:
			'Runs The Separator across N participating parties. Only the shared, invariant knowledge aggregates. Each party\'s source-specific capacity stays local, securely named, bounded, and completely removable. Provides a definitive per-party attribution record before aggregation occurs.',
		buyer:
			'Research consortia coordinators, multi-site clinical AI programmes, and privacy-first data collectives. Primarily grant-funded.',
		buyerFor: ['Research consortia coordinators', 'Multi-site clinical AI programmes', 'Privacy-first data collectives'],
		buyerNot: [],
		buyerNote: 'Primarily grant-funded.',
		capabilities: ['ACCOUNT', 'DETECT', 'ISOLATE', 'SUPPRESS'],
		industryNouns: [
			{ industry: 'Medical', noun: 'multi-hospital consortium' },
			{ industry: 'Finance', noun: 'interbank consortium' },
			{ industry: 'Biotech', noun: 'pharma–academic pool' },
			{ industry: 'AI lab', noun: 'multi-org data pool' },
		],
	},
	{
		id: 'update-engine',
		name: 'The Update Engine',
		question: 'What is this model allowed to change about itself?',
		summary:
			'Retrains a deployed model inside a limit declared and signed beforehand, and produces the evidence that every change stayed inside it. Built to the shape of a predetermined change control plan.',
		requires: 'A limit agreed with your reviewer before you begin',
		problem:
			'A deployed medical AI model is actively decaying in the field. Reapproval of a new model costs more than the original development. So it stays deployed, degrading, until it fails an audit. The FDA\'s Predetermined Change Control Plan (PCCP) framework creates an approved path — but only if the model\'s changes can be declared, bounded, and evidenced in advance.',
		delivers:
			'Supervises model retraining strictly inside a declared, cryptographically signed bound. Produces a continuous, immutable record demonstrating that every internal modification stayed inside the declared regulatory limit. Built precisely to the FDA PCCP framework specifications.',
		buyer:
			'Regulated clinical AI deployers facing model decay with no viable change-control path. Primary territory: Europe first (EU AI Act, Health Data Space mandate March 2029).',
		buyerFor: ['Regulated clinical AI deployers facing model decay with no viable change-control path'],
		buyerNot: [],
		buyerNote: 'Primary territory: Europe first (EU AI Act, Health Data Space mandate March 2029).',
		capabilities: ['ACCOUNT', 'PROTECT', 'REPAIR'],
		industryNouns: [
			{ industry: 'Medical', noun: 'supervised retraining' },
			{ industry: 'Finance', noun: 'model recalibration' },
			{ industry: 'Biotech', noun: 'assay-batch update' },
			{ industry: 'AI lab', noun: 'scheduled refresh' },
		],
	},
];
