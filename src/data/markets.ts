// LONG-FORM MARKET CONTENT — written 2026-09-07.
//
// WHY THIS FILE EXISTS. data/sectors.ts is an index: a name, an axis, a question, one cost line.
// That is enough for a card and nothing else, and it is what made the sector pages read as key
// points rather than as an argument. This file carries the argument.
//
// EVERY FIGURE IS SOURCED. Each market lists its sources at the bottom of its own page. Where a
// number comes from the ORMAS experiment programme it is labelled as measured on CIFAR-10/100,
// because a market page is exactly where an unqualified benchmark number would be misread.
//
// TWO CORRECTIONS THIS FILE MAKES TO THE REST OF THE SITE:
//   · SR 11-7 was superseded by SR 26-2 on 17 April 2026 (Fed / FDIC / OCC interagency). The site
//     cited SR 11-7 as current guidance in five places.
//   · The EU AI Act's high-risk obligations moved under the AI Omnibus, in force 27 July 2026:
//     Annex III to 2 December 2027, Annex I to 2 August 2028.

export interface Evidence {
	figure: string;
	unit: string;
	note: string;
}

export interface Named {
	title: string;
	body: string;
}

export interface Source {
	label: string;
	url: string;
}

export interface MarketDeep {
	/** the one-sentence version, for the top of the page */
	thesis: string;
	/** where the market actually is today, in prose */
	situation: string[];
	/** the numbers that make the problem real */
	evidence: Evidence[];
	/** what specifically breaks */
	failures: Named[];
	/** what the market uses now, and what it cannot do */
	incumbents: Named[];
	/** what ORMAS does about it, mechanically */
	mechanism: Named[];
	/** the obligation landscape, dated */
	regulatory: Named[];
	buyer: {
		title: string;
		sits: string;
		budget: string;
		trigger: string;
		quote: string;
	};
	/** what we will not claim in this market */
	limits: string[];
	/** the criterion this market should actually be evaluating on — Dunford's "teach the buyer
	 *  what matters". Stated once, early, because it reframes everything after it. */
	reframe: { claim: string; body: string };
	/** the objections we will actually face, answered without flinching. Acknowledge the real
	 *  concern first, then respond — a repeated objection is a messaging gap, not a nuisance. */
	objections: { q: string; a: string }[];
	/** B2B copy has to persuade a committee, not a reader. These are the lines the reader needs
	 *  in order to convince the four other people who have to say yes. */
	internalCase: { role: string; needs: string; line: string }[];
	/** proof assets: anything that reduces doubt. We have no customers; we have unusual artefacts,
	 *  and naming them concretely is what a six-figure evaluation runs on. */
	proof: string[];
	/** disqualification. Saying who this is not for raises trust and saves both sides a quarter. */
	notFor: string[];
	sources: Source[];
}

export const markets: Record<string, MarketDeep> = {
	'ai-training': {
		thesis:
			'A training run is the most expensive thing most AI organisations own, and it is supervised by the one instrument that cannot see inside it.',
		situation: [
			'The economics of this market are unusual: the buyer does not need to be convinced the problem exists. They lost money to it recently, they can name the run, and they can find the invoice. What they have never had is an instrument that tells them anything smaller than "the run is in trouble."',
			'The standard operating picture for a large training job is a loss curve on a dashboard, a gradient-norm chart beside it, and checkpointing at some interval chosen as a compromise between storage cost and how much work is acceptable to lose. When something goes wrong, all three report the same thing at the same time: something went wrong. None of them names which part, or when it started.',
			'That gap is not a tooling oversight. In a standard network every error signal reaches every parameter on every step, so there is no component whose behaviour can be isolated from the aggregate. The information required to answer "which part?" is not being withheld. It was never separable.',
		],
		evidence: [
			{
				figure: '419',
				unit: 'unexpected interruptions in a single 54-day run',
				note: 'Meta\'s Llama 3 405B pre-training, on 16,384 H100s. Roughly one failure every three hours. Faulty GPUs caused 148 of them; HBM3 memory another 72.',
			},
			{
				figure: '$15M',
				unit: 'of compute wasted on that one run',
				note: 'At 30-minute checkpointing, a single failure at that scale forces roughly 4,096 GPU-hours of work to be repeated. Multiplied across 419 failures.',
			},
			{
				figure: '20+',
				unit: 'loss spikes in one 540B-parameter run',
				note: 'Each requiring a checkpoint rewind and several hundred skipped batches. The published mitigation is to restart about 100 steps before the spike and skip 200–500 batches.',
			},
			{
				figure: '129.3 MWh',
				unit: 'of additional energy on a 65B run',
				note: 'Plus thirty additional days, spent entirely on recovering from loss spikes rather than on training.',
			},
		],
		failures: [
			{
				title: 'The instrument reports the symptom, and only after the fact',
				body: 'A loss curve is an aggregate over every parameter in the model. By construction it cannot move until enough components have degraded to shift the average, which means the first observable evidence of a problem arrives after the problem has been training itself into the weights for some time. The published characterisation of this is blunt: a run may already have entered an unstable state while training silently continues for thousands of steps before symptoms become visible.',
			},
			{
				title: 'Recovery discards work that was never damaged',
				body: 'Because nothing identifies which component failed, the only safe response is to discard everything since the last checkpoint. A rollback of twenty thousand steps throws away twenty thousand steps of legitimate learning in order to undo the few hundred that were harmful. The cost of the remedy is set by checkpoint interval, not by the size of the fault.',
			},
			{
				title: 'The cause is not reliably reproducible',
				body: 'Loss spikes are hypothesised to arise from rare interactions between the optimiser state and specific input batches, a combination that is fragile, hard to predict, and difficult to reproduce deliberately. Post-mortem analysis of an aggregate signal cannot distinguish a benign spike that would have recovered on its own from a malignant one that leads to irreversible divergence.',
			},
			{
				title: 'The failure is invisible until it is expensive',
				body: 'Silent degradation is worse than a crash. A crashed job restarts. A job that keeps running while quietly getting worse consumes its full compute budget and produces a model that has to be thrown away — which is the mechanism behind the industry estimate that a large share of frontier compute goes to experiments that never ship anything.',
			},
		],
		incumbents: [
			{
				title: 'Loss and gradient-norm dashboards',
				body: 'Genuinely useful, and the right tool for tracking whether a run is converging. They are aggregate statistics computed over the whole model, so their smallest addressable unit is the run itself.',
			},
			{
				title: 'Checkpointing and automated restart',
				body: 'Solves crash recovery, which is a real and different problem. It states how to resume, never what to fix, and its cost model is set by interval rather than by fault size.',
			},
			{
				title: 'Experiment trackers',
				body: 'Weights & Biases and MLflow record what happened to a run: loss, accuracy, learning rate, utilisation, artefacts. Excellent at that job. They observe the training process from outside it, so they cannot record events that were never emitted in the first place.',
			},
			{
				title: 'Gradient clipping and spike mitigation',
				body: 'Adaptive clipping methods reduce the incidence of spikes. They suppress the symptom without localising the cause, and a suppressed spike still leaves the component involved unnamed.',
			},
		],
		mechanism: [
			{
				title: 'Health is a property each component emits, not a statistic computed about it',
				body: 'Every component carries its own bounded learning path, so it produces a health signal as a byproduct of the arithmetic the network is already doing. The signal exists at every step for every component. Nothing samples it, and no observer computes it from outside.',
			},
			{
				title: 'The alarm names a component, a step and a magnitude',
				body: 'Instead of "the loss moved at step 40,200", the record reads: node 1, oscillating, magnitude 7.674, step 39,553. That is an object an operator can act on. In the measured case, fault localisation to a specific component happened within a single epoch of the fault occurring.',
			},
			{
				title: 'Eight named conditions, each with a declared ceiling',
				body: 'A component can go dead, oscillate, saturate, stagnate, explode, lose confidence, lose gradient, or fail unclassified. Each has a name, a trigger condition, and a declared limit on how much may be changed in response — stated as a fraction of that component\'s own weight rather than as a global constant.',
			},
			{
				title: 'Read-only is a supported mode, and it is where most teams start',
				body: 'The diagnostics run with corrections switched off entirely. The full signal is emitted and the architecture touches nothing. Nobody sensible lets an unproven system modify weights inside a run costing hundreds of thousands of dollars, and the product does not ask them to.',
			},
		],
		regulatory: [],
		buyer: {
			title: 'The person who owns the training run',
			sits: 'Infrastructure or research engineering, inside a team doing large fine-tunes, continued pre-training, or a domain-specific build.',
			budget: 'Compute. Not governance, not compliance. It is the same budget line the failed run came out of.',
			trigger: 'A run that died, or degraded silently, and could not be explained afterwards.',
			quote: 'We lost four days and we still do not know what happened at step forty thousand.',
		},
		limits: [
			'Every published ORMAS result is on CIFAR-10 or CIFAR-100. No frontier-scale run has been instrumented.',
			'The architecture has been demonstrated on fully-connected, CNN and ResNet families. Transformers are a stated generalisation target, not a demonstrated result.',
			'Our evidence for the health signal comes from corruption-driven failure. Whether it transfers cleanly to optimiser-driven instability is an open question, and a frontier engineer will raise it inside five minutes.',
		],
		reframe: {
			claim: 'The question is not whether a failing run can be detected. It is how small a fault can be detected, and how early.',
			body: 'Every tool in this category answers at the level of the run. Compare them on resolution instead: what is the smallest unit the instrument can name, and how long after the fault does it name it? A loss curve resolves to the whole model, after the aggregate moves. This resolves to a component, at the step it happened.',
		},
		objections: [
			{
				q: 'We already have monitoring. Why would we add another dashboard?',
				a: 'Nobody should, and we do not ship one. The alarm exports to wherever the team already looks: JSONL, a webhook, or the existing experiment tracker. Nobody adopts a second place to look, and a product that requires them to is a product that gets switched off in month two. What changes is not where the team looks, but what is in the alert: a component name and a step number instead of a curve.',
			},
			{
				q: 'What does the instrumentation cost us in throughput?',
				a: 'The honest answer is that the full system carries a measured overhead of 1.35× on a graph backbone, and that most of it is gradient surgery that monitoring does not need. The read-only path runs none of that. Its wall-clock cost has been characterised as negligible in the technical account and has not been separately benchmarked, so it is a measurement we will run against the customer configuration rather than quote.',
			},
			{
				q: 'This has never been run on a transformer.',
				a: 'Correct, and ten minutes of reading would establish it, so we state it first. The architecture is demonstrated on fully-connected, CNN and ResNet families. The monitoring half of a transformer port is the cheap half, a local readout on intermediate activations already demonstrated on a non-graph backbone. The correction half is the expensive one, and it is not the half anyone wants on a run that size.',
			},
			{
				q: 'Our failures are hardware, not model pathology. Half of Llama 3\'s were GPUs.',
				a: 'Also correct, and a monitor does not fix a dead GPU. The distinction that matters is between a job that crashes and a job that keeps running while getting worse. A crash is detected by the orchestrator in seconds. Silent degradation is the one that consumes the full budget and produces a model that gets thrown away, and it is the one nothing currently catches.',
			},
		],
		internalCase: [
			{
				role: 'The person who signs',
				needs: 'A number they can defend',
				line: 'One avoided incident at two hours of recovery is $16,000–$24,000. The licence is priced against that, and the arithmetic does not require believing anything we say.',
			},
			{
				role: 'The infrastructure lead',
				needs: 'To know it will not become their problem',
				line: 'One line around the training loop. A context manager or callback, never a required base class, and read-only by default so nothing touches weights.',
			},
			{
				role: 'The research lead',
				needs: 'To know the mechanism is real',
				line: '383 controlled experiments across four architecture families, the full technical account, and 67 archived run records reproducible from seed. Send them the technical account, not the deck.',
			},
			{
				role: 'Security',
				needs: 'To know nothing leaves',
				line: 'Runs inside the customer environment. No hosted tier, no metering, no telemetry egress.',
			},
		],
		proof: [
			'The full technical account, with the reproducibility checklist',
			'67 archived run records, each reproducible from seed',
			'A worked example of the alarm output: component, diagnosis, step, magnitude',
			'The read-only configuration, so the first engagement modifies nothing',
			'Evaluation access under the research licence, so the team can run the mechanism before any contract exists',
		],
		notFor: [
			'Teams whose runs cost less than about $10,000. The arithmetic does not work, and we say so.',
			'The dozen frontier labs who build their own infrastructure. A research partnership serves both sides better than a licence fee.',
			'Anyone looking for a replacement for their experiment tracker. This is not that, and it composes with whichever tracker is already in place.',
		],
		sources: [
			{ label: 'Meta · Llama 3 training interruptions (Tom\'s Hardware)', url: 'https://www.tomshardware.com/tech-industry/artificial-intelligence/faulty-nvidia-h100-gpus-and-hbm3-memory-caused-half-of-the-failures-during-llama-3-training-one-failure-every-three-hours-for-metas-16384-gpu-training-cluster' },
			{ label: 'Llama 3 interruption breakdown (Data Center Dynamics)', url: 'https://www.datacenterdynamics.com/en/news/meta-report-details-hundreds-of-gpu-and-hbm3-related-interruptions-to-llama-3-training-run/' },
			{ label: 'ZClip · adaptive spike mitigation for LLM pre-training', url: 'https://arxiv.org/html/2504.02507' },
			{ label: 'PaLM · loss spikes and checkpoint rewind', url: 'https://arxiv.org/pdf/2204.02311' },
			{ label: 'Characterization of LLM development in the datacenter', url: 'https://arxiv.org/pdf/2403.07648' },
		],
	},

	'regulated-finance': {
		thesis:
			'Every quantitative firm is already paying for catastrophic forgetting in cash, and booking it as a cost of doing business rather than as the architectural defect it is.',
		situation: [
			'A model is trained through one market regime. The regime turns. The model degrades at exactly the moment its output matters most, so the firm retrains on the new regime, and the retraining quietly destroys what the model knew about the old one. Then the old regime returns.',
			'The industry response is to retrain on a schedule and absorb the difference. That is a rational response to a constraint nobody has been able to remove, and it is worth being precise about what the constraint is: it is not a tuning problem, and no amount of hyperparameter search resolves it. It is catastrophic forgetting, and it is a property of how gradient descent updates a shared parameter space.',
			'Meanwhile the supervisory picture changed. On 17 April 2026 the Federal Reserve, FDIC and OCC jointly issued SR 26-2, superseding the SR 11-7 framework that had governed model risk management since 2011. The core disciplines survive — inventory, independent validation, board-level governance, documented change control — but expectations are now explicitly scaled to materiality and to each institution\'s own model risk profile.',
		],
		evidence: [
			{
				figure: '47.3%',
				unit: 'of prior-regime knowledge surviving a retrain',
				note: 'A parameter-matched standard network, retrained on a second task with no replay buffer and no task identifier. ORMAS retained 94.6% under identical conditions. Measured on CIFAR-10/100, three seeds.',
			},
			{
				figure: '4.5×',
				unit: 'reduction in final-epoch weight variance',
				note: '0.19 against 0.86 for the parameter-matched baseline, with a stability characterisation attached rather than asserted. Measured on CIFAR-10/100.',
			},
			{
				figure: 'Apr 2026',
				unit: 'SR 26-2 supersedes SR 11-7',
				note: 'Interagency guidance from the Federal Reserve, FDIC and OCC. Validation, inventory and change-control obligations are retained and re-scoped to materiality.',
			},
		],
		failures: [
			{
				title: 'The retrain is the loss event',
				body: 'Every scheduled retrain on new data degrades performance on the regimes already learned. The firm is not choosing between a stale model and a current one; it is choosing which regime to be wrong about. Over a full cycle the same knowledge is bought more than once.',
			},
			{
				title: 'A model that cannot be audited per component cannot be validated',
				body: 'Independent validation requires that a reviewer be able to interrogate what a model does and why. When the smallest addressable unit is the whole model, the validator is reduced to testing inputs against outputs and reading a document about the process. That is assessment, not verification.',
			},
			{
				title: 'The validator is adversarial by design, and currently has no instrument',
				body: 'Model risk functions are measured on finding what the model team missed. They are the least persuadable audience in the institution and the correct one to design for. What they lack is not diligence but any mechanism for checking a claim about what a model changed during training.',
			},
			{
				title: 'A failed validation writes off the whole programme',
				body: 'A model that does not clear validation does not deploy. The development cost, the data work and the opportunity are written off together, and the second attempt starts with a governance function that has already said no once.',
			},
		],
		incumbents: [
			{
				title: 'Rolling-window retraining',
				body: 'The standard practice, and a deliberate trade: recency is bought by discarding history. It works, and it structurally guarantees that the institution keeps paying for knowledge it has already acquired.',
			},
			{
				title: 'Champion–challenger frameworks',
				body: 'Compares two models\' outputs to decide which to promote. It answers which model performs better; it says nothing about what changed inside either of them, which is the question a validator asks.',
			},
			{
				title: 'Post-hoc explainability',
				body: 'SHAP and its relatives explain individual predictions of a finished model. Genuinely useful for adverse-action reasoning and feature attribution. They operate on a trained artefact, so they cannot describe the training process that produced it.',
			},
			{
				title: 'Model documentation and validation memos',
				body: 'The current answer to a change-control obligation is a written account of intentions, produced after the fact by the team whose work is under review. A reviewer can audit that document. They cannot verify it against anything.',
			},
		],
		mechanism: [
			{
				title: 'Retention without a replay buffer',
				body: 'Under sequential task shift with no replay buffer and no task identifier, the architecture retained 94.6% of prior-task performance against 47.3% for a parameter-matched baseline. The mechanism is gradient conflict resolution: competing objectives are separated into distinct components rather than averaged into shared weights.',
			},
			{
				title: 'A record the validator can verify instead of read',
				body: 'Every modification made during training is emitted with its component, diagnosis, step, magnitude, the declared limit it stayed inside, and the residual left after the conservation constraint. Signed, hashed, and comparable line by line against the version last approved.',
			},
			{
				title: 'A declared bound table, before the run rather than after it',
				body: 'Eight named modification types, each with its own ceiling expressed as a fraction of the component\'s weight, each with its observed frequency across the archived runs. A reviewer is handed the declaration and the empirical distribution together.',
			},
			{
				title: 'Variance as a governance property',
				body: 'Final-epoch weight variance of 0.19 against 0.86 is a 4.5× reduction with a stability argument attached. For a model risk function, lower parameter volatility with a characterisation of why is a better artefact than a validation memo asserting the same thing.',
			},
		],
		regulatory: [
			{
				title: 'SR 26-2 · from 17 April 2026',
				body: 'Interagency supervisory guidance on model risk management from the Federal Reserve, FDIC and OCC, superseding SR 11-7. Retains model inventory, independent validation, and documented governance, with expectations scaled to materiality and institutional risk profile.',
			},
			{
				title: 'SS1/23 · Bank of England',
				body: 'The UK model risk management principles for banks, covering identification, governance, development, validation and monitoring. The same structural requirement: a change to a model must be evidenced, not described.',
			},
			{
				title: 'EU AI Act · Article 12',
				body: 'Requires high-risk systems to allow automatic recording of events across their lifetime, with deployers retaining logs for at least six months under Article 26. Credit scoring and creditworthiness assessment fall within Annex III. Under the AI Omnibus, in force 27 July 2026, Annex III obligations apply from 2 December 2027.',
			},
		],
		buyer: {
			title: 'The validator, not the quant and not the CTO',
			sits: 'Model risk management, or an independent validation function reporting outside the model development line.',
			budget: 'Governance and model risk. Being expanded, in most institutions, while other budgets are not.',
			trigger: 'A validation that returned findings, or a supervisory examination that asked for evidence of change control.',
			quote: 'I can see what the model does. I cannot verify anything the team tells me about how it got there.',
		},
		limits: [
			'Non-stationarity is not the same as sequential task shift. The experiment has clean, labelled task boundaries; markets do not. Regime boundaries are latent and contested, and "conflict fired" has not been established to be the same event as "the regime turned".',
			'Every result is on CIFAR-10/100. No market data has been used, and the equivalent result on public price history has not yet been produced.',
			'Backtest discipline decides credibility in this market before mechanism does. A clean protocol with a dull architecture beats the reverse.',
		],
		reframe: {
			claim: 'The question a validator is asking is not whether the model is good. It is whether anything the model team told them can be checked.',
			body: 'Model risk functions are not evaluating performance; the model team already did that. They are evaluating whether the assertions in the documentation can be independently verified. Every incumbent answer produces a document written after the fact by the party under review. Compare on verifiability and the field narrows to one.',
		},
		objections: [
			{
				q: 'Changing our training architecture is a two-year programme.',
				a: 'For the full deployment, that is a fair estimate and we will not pretend otherwise. It is also not where anyone starts. The entry point attaches to an already-trained model, does not modify it, and runs on a selected sample. The first engagement therefore needs no change to the stack, no security review of a training pipeline, and no architecture decision.',
			},
			{
				q: 'SR 26-2 is more proportionate than SR 11-7. Does this still matter?',
				a: 'Proportionality changed how expectations scale; it did not remove independent validation, model inventory or documented change control. For a material model the disciplines are intact, and the practical effect of a more tailored regime is that the burden of proof shifts onto the institution to justify its own scoping — which is easier to do with evidence than with a memo.',
			},
			{
				q: 'Our models are gradient-boosted trees, not neural networks.',
				a: 'Then this is not relevant today, and that is a straight answer rather than a soft one. The mechanism is a property of how a neural network trains. Where it becomes relevant is the part of the book moving to deep models, which in most institutions is the part with the least mature governance and the most supervisory attention.',
			},
			{
				q: 'Everything you have shown me is CIFAR-10.',
				a: 'Yes. No market data has touched this system. The relevant point is that regime-change behaviour can be demonstrated on public price history without anyone\'s permission, which makes this the cheapest market in which to produce a non-benchmark result. We would rather run that jointly, on the institution\'s own definition of a regime, than assert it.',
			},
		],
		internalCase: [
			{
				role: 'Head of model risk',
				needs: 'Something a validator can test',
				line: 'A signed, per-modification record with a declared bound table, diffable against the version last approved. Not a memo about the process, but the record of it.',
			},
			{
				role: 'The validator',
				needs: 'To be able to falsify a claim',
				line: 'Eight named modification types with individual ceilings and their observed frequencies across 67 runs. They are handed the declaration and the empirical distribution together.',
			},
			{
				role: 'Head of research',
				needs: 'To know it does not cost performance',
				line: '94.6% prior-regime retention against 47.3%, and 4.5× lower final-epoch weight variance, with a stability characterisation attached.',
			},
			{
				role: 'Technology risk',
				needs: 'Data residency',
				line: 'On-premise or in the customer environment. Position, client and trading data never move.',
			},
		],
		proof: [
			'The bound table: eight modification types, individual ceilings, observed frequencies',
			'A sample modification record, signed and hashed, with the diff format',
			'The full technical account and 383 reproducible experiment runs',
			'A regime-change demonstration on public price history, run on the institution\'s own definition of a regime',
			'The Artifact Survival Clause: the records outlive the contract, with a frozen reader retained permanently',
		],
		notFor: [
			'Institutions whose material models are entirely classical. The mechanism is specific to neural network training.',
			'Anyone who needs a validated deployment reference today. There is not one, and we will not manufacture the impression of one.',
			'Teams looking for an accuracy uplift. The claim is verifiability; the accuracy comparison is evidence that the mechanism works, not a selling point.',
		],
		sources: [
			{ label: 'Federal Reserve · SR 26-2 supervisory letter', url: 'https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm' },
			{ label: 'SR 11-7 vs SR 26-2 · what changed', url: 'https://www.sia-partners.com/en/insights/publications/sr-11-7-vs-sr-26-2-model-risk-management-modernization' },
			{ label: 'EU AI Act · Article 12, record-keeping', url: 'https://artificialintelligenceact.eu/article/12/' },
		],
	},

	'medical-ai': {
		thesis:
			'Regulators opened a door for models that change after approval. Almost nobody can walk through it, because walking through it requires evidence of what the training did, and no clinical architecture produces any.',
		situation: [
			'A clinical model is a clinician who trained brilliantly and then had their memory frozen on graduation day. It will never learn anything from the institution, because teaching it something about the local patient population would cost it something it knows about everyone else\'s. That is not a policy choice. It is how the machinery works.',
			'The scale of the deployed population is now substantial: cumulative FDA authorisations of AI-enabled devices passed 1,250 by July 2025 and stood at 1,451 by the end of that year, up from 950 in August 2024. The scale of the population permitted to change after authorisation is not. Roughly 8% of new AI device authorisations in the 2024–25 window included an authorised Predetermined Change Control Plan. The overwhelming majority are locked models with no ability to learn after launch.',
			'The FDA finalised its PCCP guidance in August 2025, and the mechanism is genuinely permissive: a sponsor states in advance exactly what the algorithm may change, how it will be validated, and how the change will be controlled, and may then modify the device without a new marketing submission. The constraint is not regulatory appetite. It is that producing that evidence requires an architecture that knows what it changed, and standard architectures do not.',
		],
		evidence: [
			{
				figure: '1,451',
				unit: 'AI-enabled devices authorised by end-2025',
				note: 'Up from 950 in August 2024. The deployed clinical AI population is large and growing quickly.',
			},
			{
				figure: '~8%',
				unit: 'of new authorisations carrying a PCCP',
				note: 'Across the 2024–25 window. The rest are locked at authorisation and cannot be updated without a new submission.',
			},
			{
				figure: '94.6%',
				unit: 'prior-task retention with no replay buffer',
				note: 'Against 47.3% for a parameter-matched baseline, under sequential shift with no task identifier. This is the mechanism behind the freeze. Measured on CIFAR-10/100.',
			},
			{
				figure: 'Mar 2029',
				unit: 'EHDS secondary-use provisions apply',
				note: 'Genetic and clinical-trial data from March 2031. Institutions select training infrastructure roughly three years ahead, which places that decision now.',
			},
		],
		failures: [
			{
				title: 'The model is frozen because updating it is not safe',
				body: 'Training on the local population degrades what the model knew about the populations it was validated on. Without a mechanism that separates the two, any local update is a silent trade against the evidence base the authorisation rests on. Freezing is the conservative and correct response to that, and it is why deployed models decay.',
			},
			{
				title: 'Site shift arrives with no instrument to measure it',
				body: 'A model validated at one institution is deployed at another and performance drops. Nobody can say how much of the drop is genuinely different patients and how much is the model having learned the first site\'s scanner, reconstruction kernel, protocol or case mix. The deployment is then abandoned or accepted on faith, and neither is a decision anyone wants to defend.',
			},
			{
				title: 'Federated averaging destroys attribution by construction',
				body: 'Several institutions train a shared model without pooling data. Round forty-one drops six points. No participant can identify which site caused it, because averaging is a lossy operation performed before anybody looks. The coordinator\'s options are to roll back or to guess.',
			},
			{
				title: 'The largest cost is invisible and uncounted',
				body: 'Nobody counts the deployments never attempted because no one could write a defensible change-control plan. That population does not appear in any market figure, because every published number measures devices that got past the gate.',
			},
		],
		incumbents: [
			{
				title: 'Locking the model at authorisation',
				body: 'The prevailing approach, and a coherent one given the constraints. It converts an unmanageable risk into a managed decay curve, and the decay is invisible until an outcome review finds it.',
			},
			{
				title: 'Post-hoc explainability for the submission',
				body: 'Saliency maps and attribution methods included in a submission dossier. They explain individual predictions of a finished model, which is a different question from what the training did, and they are reconstructions produced by a separate procedure that can itself be wrong.',
			},
			{
				title: 'Domain adaptation and harmonisation',
				body: 'Real techniques that genuinely reduce site effects, and worth using. What they leave behind is one model and a hope. Nothing is named, nothing is removable, and no reviewer can be shown which part of the model was the site.',
			},
			{
				title: 'A validation report asserting generalisation',
				body: 'The current artefact. It holds until the scanner is replaced, the protocol changes, the population shifts, or a new site is added, and there is no instrument that says which of those happened.',
			},
		],
		mechanism: [
			{
				title: 'Retraining inside a limit declared in advance',
				body: 'A PCCP asks three questions: what types of modification may the algorithm undergo, how is it validated that it stayed inside them, and how is the change controlled. The bound table answers the first with eight named modification types and their individual ceilings. The record answers the second, per modification, as training happens. The diff against the approved version answers the third.',
			},
			{
				title: 'The site becomes a named, removable object',
				body: 'What the model learned about each contributing institution is separated from what it learned about the disease, bound to a record of exactly which data justified it, and removable. What deploys is a source-invariant model, plus a named component per site, plus the evidence tying each one to its data.',
			},
			{
				title: 'Attribution before the averaging step',
				body: 'In a federation, each participant runs the separation locally and only the shared component aggregates. Per-party attribution is recorded before the aggregation destroys it, so when round forty-one drops six points, the record says which site, and on what evidence.',
			},
			{
				title: 'Evidence of what training did, not a description of it',
				body: 'Node 1, diagnosed oscillating at step 39,553, magnitude 7.674, treated with bounded dampening at 0.10 of the weight norm, conservation residual 0.0, tensor attached. A reviewer can audit a document about a process. They can verify a log of what the process did.',
			},
		],
		regulatory: [
			{
				title: 'FDA PCCP · final guidance August 2025',
				body: 'Allows authorised modification of an AI-enabled device without a new marketing submission, provided the modifications, their validation methodology and their impact assessment are declared in advance. Roughly 8% of new authorisations currently carry one.',
			},
			{
				title: 'EU AI Act · Article 12, Annex I from 2 August 2028',
				body: 'Medical devices are high-risk AI systems embedded in regulated products. Automatic event recording across the system lifetime is required. Under the AI Omnibus, in force 27 July 2026, the Annex I transition runs to 2 August 2028.',
			},
			{
				title: 'European Health Data Space · Regulation (EU) 2025/327',
				body: 'Secondary-use provisions apply from 25 March 2029, extending to genetic and clinical-trial data in March 2031. Results of secondary use must be published in anonymised form within eighteen months, and non-compliance can mean exclusion from data access for up to five years.',
			},
		],
		buyer: {
			title: 'Three different people, in a deliberate order',
			sits: 'A consortium coordinator or lead-site research informatics first. A VP Research or Head of Platform in discovery second. A Head of Regulatory Affairs or the chair of an AI governance committee last.',
			budget: 'Grant and project-scoped for consortia. R&D for discovery. Governance and model risk for regulated clinical, which is the budget line currently being created while capital budgets are cut.',
			trigger: 'A federated round nobody can explain, an eighteen-month assay history the model no longer represents, or a governance committee that rejected a model and released the budget to rebuild it.',
			quote: 'Round forty-one dropped six points and we cannot tell which site.',
		},
		limits: [
			'No clinical, biological or patient data has ever touched this system. Every result is CIFAR-10 or CIFAR-100, and this is the binding constraint on the entire programme.',
			'No regulator has seen this architecture. The mapping onto the PCCP framework is our own reading of published guidance, made by people who have never filed one.',
			'Every result is on tens of thousands of examples. A discovery assay batch is thirty to forty compounds, and whether the signal survives at that scale is untested.',
			'Nothing here is autonomous field adaptation. Every modification happens during supervised retraining, under review, before release.',
		],
		reframe: {
			claim: 'Access is granted on auditability, not on accuracy. It has never been granted on accuracy.',
			body: 'The most common misreading in this market is that a better model opens the door. It does not. The gate is whether an institution can account, per decision and per change, for what the model did and why. Every current architecture answers that after the fact, by a separate procedure that can itself be wrong. The comparison that matters is what can be filed, not what can be scored.',
		},
		objections: [
			{
				q: 'Nobody replaces their training stack to get a report.',
				a: 'Nobody should, and the entry point does not ask for it. The first engagement attaches to an existing checkpoint, changes nothing about it, and runs on a selected sample. What it returns, which labels are wrong broken down by contributing site, is useful on its own and requires no architectural decision at all.',
			},
			{
				q: 'Has a regulator ever accepted this?',
				a: 'No. Nobody has filed anything, and our mapping onto the PCCP framework is our own reading of published guidance made by people who have never submitted one. We would rather state that than let it be discovered. What we can say is that the framework asks three questions, what may change, how it is validated and how it is controlled, and that the bound table, the record and the diff are direct answers to those three.',
			},
			{
				q: 'Our data cannot leave the institution, and our IG office will ask about the telemetry.',
				a: 'It runs inside the customer environment; there is no hosted tier and nothing egresses. The sharper question an information governance office will ask is whether the telemetry itself is non-identifying, and the honest answer is that a formal privacy analysis has not been completed. We would want that done before an engagement, not after.',
			},
			{
				q: 'This has only ever been run on CIFAR-10.',
				a: 'Every result, without exception. No clinical, biological or patient data has ever touched this system, and that is the single largest gap in the programme rather than a detail. It is also why the first conversations we want are with consortia and discovery groups, where a real dataset can be worked on as a research partnership rather than a purchase.',
			},
		],
		internalCase: [
			{
				role: 'Head of regulatory affairs',
				needs: 'Something that maps onto a submission',
				line: 'A declared modification set with per-type ceilings, a per-modification record emitted during training, and a diff against the approved version. Those are the three things a change control plan asks for.',
			},
			{
				role: 'The AI governance committee',
				needs: 'To approve without guessing',
				line: 'They stop reading an assertion that the process was followed and start reading evidence of what the process did, with the tensor attached.',
			},
			{
				role: 'Research informatics',
				needs: 'To know which site caused it',
				line: 'Attribution recorded per party before the aggregation step destroys it. When a federated round drops six points, the record names the site.',
			},
			{
				role: 'Information governance',
				needs: 'Data residency and a privacy position',
				line: 'On-premise, no egress. And we will say plainly that the formal privacy analysis of the telemetry is outstanding rather than claim it is done.',
			},
		],
		proof: [
			'The full technical account, the supplementary material and the reproducibility checklist',
			'The bound table: eight modification types, ceilings, and observed frequencies across 67 runs',
			'A worked modification record, in the format a reviewer would receive',
			'A label audit on a nominated dataset, returning results broken down by contributing site',
			'Evaluation access for their own team, under a short agreement, before any contract exists',
		],
		notFor: [
			'Anyone who needs a cleared reference deployment today. There is not one.',
			'Programmes where the model is genuinely static and the population genuinely is not shifting. Where freezing works, freezing is cheaper.',
			'Discovery groups working at very small n. Every result is on tens of thousands of examples, and whether the signal survives at thirty compounds is untested, and we would run that sweep before a meeting, not after.',
		],
		sources: [
			{ label: 'FDA · PCCP marketing submission recommendations', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/marketing-submission-recommendations-predetermined-change-control-plan-artificial-intelligence' },
			{ label: 'AI in FDA-authorized devices · taxonomy across 1,016 authorizations (npj Digital Medicine)', url: 'https://www.nature.com/articles/s41746-025-01800-1' },
			{ label: 'FDA experience with Predetermined Change Control Plans', url: 'https://www.medrxiv.org/content/10.1101/2025.08.26.25334477.full.pdf' },
			{ label: 'European Health Data Space · Regulation (EU) 2025/327', url: 'https://www.ey.com/en_gr/technical/tax/tax-alerts/regulation-2025-327-establishing-ehds' },
		],
	},

	'data-obligation': {
		thesis:
			'The obligation to delete training data from a model is already contractual and already enforceable. The prevailing industry response is to disclose that it cannot be done.',
		situation: [
			'This is not an industry. It is a duty, and it cuts across every industry and includes companies in none of them. A hospital under a data-use agreement, a SaaS vendor with a termination clause, and a bank holding client records have the same problem and it has nothing to do with what they sell.',
			'The qualifying test is three properties held at once: the organisation trains or fine-tunes on data it does not own outright; it carries a deletion obligation that is contractual, regulatory or both; and it is large enough that this is somebody\'s actual job. Contractual requirements increasingly name the artefacts explicitly — models, weights, embeddings, training artefacts and derived datasets — and require written attestation.',
			'The technical position is well documented and unflattering. Exact unlearning means retraining from scratch, which is prohibitively expensive at any serious scale. Everything else shipping is approximate: weights that resemble what retraining would have produced. The field is currently having a credibility reckoning about its own approximations, including a position paper arguing the term "machine unlearning" is overused. Arriving in that moment with a structural answer rather than a better approximation is the position.',
		],
		evidence: [
			{
				figure: '$100k–$500k+',
				unit: 'to retrain a custom domain model from scratch',
				note: 'The only exactly compliant remedy. Plus service downtime, plus revalidation, and at frontier scale it is not done at all.',
			},
			{
				figure: '6–21%',
				unit: 'label error rates found in real datasets',
				note: 'Across published audits, with at least 3.3% average across ten commonly-used benchmarks and at least 6% of the ImageNet validation set. The same detection signal that finds these finds memorised and atypical data.',
			},
			{
				figure: 'Recurring',
				unit: 'the obligation, not the incident',
				note: 'Every new contract with a deletion clause is another metered event. The cost scales with the customer\'s contract count rather than with any decision they make about infrastructure.',
			},
		],
		failures: [
			{
				title: 'There is no object to delete',
				body: 'When a model trains, a source\'s contribution is distributed across billions of coefficients in ways that were never separable. Deleting a row from the training set does nothing to the trained artefact. The clause is enforceable, the obligation is real, and the mechanism to satisfy it does not exist in a standard architecture.',
			},
			{
				title: 'The compliant remedy costs more than the deal',
				body: 'Retraining from scratch is the only method that unambiguously satisfies an erasure obligation. For most institutions the cost of honouring one request exceeds the value of the contract that created it, which means the obligation is signed and then not met.',
			},
			{
				title: 'Best practice is currently to disclose the failure',
				body: 'Vendor guidance now advises disclosing where deletion is not feasible because data has already been incorporated into model weights. That is honest, and it is an admission that an entire category of contractual commitment is routinely unenforceable in practice.',
			},
			{
				title: 'It propagates through procurement, all at once',
				body: 'The moment one buyer in a sector demands attestation, every vendor in that sector needs an answer. Compliance requirements move through supply chains faster than product roadmaps, and the vendors who cannot produce an answer start looking on the same day.',
			},
		],
		incumbents: [
			{
				title: 'Retraining from scratch',
				body: 'The gold standard, and the only exact method. Six figures per request, plus downtime and revalidation, and structurally unavailable at large scale.',
			},
			{
				title: 'Sharded training such as SISA',
				body: 'Splits the training set into disjoint shards and retrains only the affected one, cutting cost by roughly a factor of the shard count. Genuine engineering, and it constrains the architecture and the data pipeline before any request arrives.',
			},
			{
				title: 'Approximate unlearning',
				body: 'Influence functions, gradient rollback and their descendants produce weights that resemble what retraining would have produced. Recent work reports roughly half the cost of retraining. Every one of these describes itself as approximate, and a regulator asking for an attestation is not asking for a resemblance.',
			},
			{
				title: 'Deleting from the data lake and hoping',
				body: 'Common, and it satisfies the letter of a database-oriented reading of the obligation while leaving the trained model exactly as it was. It is the gap between what was deleted and what still knows that creates the exposure.',
			},
		],
		mechanism: [
			{
				title: 'Route the memorisable part into a structure that can be removed',
				body: 'Data that is redundant with the rest of the corpus was never the exposure: the model would have learned the same thing from a thousand other examples. Data that is unique, atypical or in tension with the corpus cannot be generalised, so it is memorised — and memorisation is what creates the exposure. The detection signal fires on exactly that population.',
			},
			{
				title: 'Bind the structure to the data that justified it',
				body: 'Each isolated component carries a hash of the specific sample set that caused it to be allocated. The binding is recorded when it happens, not reconstructed afterwards, which is what makes a certificate mean something.',
			},
			{
				title: 'Delete the structure, sign what left',
				body: 'Removal takes out the source-specific capacity and produces a signed record of precisely what was removed, together with a bounded statement of what changed in the remaining model. No retraining. The cost stops scaling with the size of the model and starts scaling with the size of the request.',
			},
			{
				title: 'The claim stays narrow, deliberately and permanently',
				body: 'We route the memorisable portion of the training signal into named, bounded, deletable structures; deleting the structure removes the source-specific capacity; and a signed record of what was removed is issued, plus a bounded statement of what changed. We do not say the data is gone, we do not claim no trace remains, and we do not call it exact unlearning.',
			},
		],
		regulatory: [
			{
				title: 'GDPR · Article 17',
				body: 'The right to erasure, now being read against trained models rather than only against databases. The question a supervisory authority asks is whether a person\'s contribution can be removed, and the honest answer from most vendors is currently no.',
			},
			{
				title: 'Contractual deletion and attestation clauses',
				body: 'Increasingly explicit about scope: models, model weights, embeddings, training artefacts and derived datasets containing customer data, on termination, with written attestation. These are negotiated commercially and enforced commercially, without waiting for a regulator.',
			},
			{
				title: 'Unlearning-ready architectures',
				body: 'The compliance industry named this category and forecast it becoming a requirement before any supply side existed. A named category with anticipated regulation and nothing to buy is a rarer situation than a large addressable market.',
			},
		],
		buyer: {
			title: 'General counsel, or the data protection officer',
			sits: 'Legal, privacy or compliance, in vertical SaaS with AI features, HR and recruiting technology, legal technology, healthcare AI, or any financial services model team handling client data.',
			budget: 'Compliance. Already exists, and does not need to be argued for.',
			trigger: 'An enumerable event: a contract signed with a deletion-and-attestation clause, an erasure request touching a trained model, a data licence terminating, an acquisition where data rights do not transfer, or a competitor being asked and unable to answer.',
			quote: 'We signed the clause. Legal is now asking me how we actually do it.',
		},
		limits: [
			'This is not proof that a source\'s data never influenced the model. Deleting a bound component removes the source-specific capacity; it does not prove no trace remains in the shared model.',
			'This is not exact unlearning, and it is not a claim to be more private than shared weights. Whether bound capacity has a smaller leakage surface is an empirical question we have designed and not run.',
			'"Provably low-impact" is currently an argument rather than a proof. Establishing a bound on the residual influence of removed-but-redundant data is a genuine open research problem.',
			'No data-protection lawyer has yet told us what may be certified, and in what words. Until that answer exists this is a strong story rather than a certifiable product.',
		],
		reframe: {
			claim: 'Stop asking whether a vendor can delete the data. Ask what they will put in writing, and what happens if it is tested.',
			body: 'Every answer in this category is approximate, and most of them say so in their own documentation. The useful comparison is not which approximation is closest, but which supplier will sign a statement about what was removed and stand behind the wording. That question narrows the field faster than any technical evaluation, and it is the question counsel is actually asking.',
		},
		objections: [
			{
				q: 'Our lawyers will not accept anything short of deletion.',
				a: 'Then they are right, and they should not accept what is currently on the market either, because none of it is deletion. What we would put in writing is narrower and harder to attack: the memorisable portion of a source\'s signal is routed into a named, bounded structure; removing that structure removes the source-specific capacity; and a signed record of what was removed is issued, with a bounded statement of what changed. We do not say the data is gone.',
			},
			{
				q: 'How is this different from the approximate unlearning methods already published?',
				a: 'Those operate after the fact on a model that was trained without any separation, and they produce weights that resemble what retraining would have produced. Resemblance is the whole problem. This separates during training, so there is an object bound to a recorded sample set before any request arrives. The difference is not accuracy of the approximation; it is that there is something to point at.',
			},
			{
				q: 'What happens to data that was not memorised?',
				a: 'It stays, and that is the argument rather than an evasion. Data redundant with the rest of the corpus was never the exposure, because the model would have learned the same thing from a thousand other examples, and nobody\'s privacy is violated by a fact learned everywhere. What creates exposure is data unique enough that the model had to memorise it, and that is exactly the population the detector fires on.',
			},
			{
				q: 'Has a data protection authority signed off on this wording?',
				a: 'No, and no data protection lawyer has yet told us what may be certified or in what words. That consultation gates this product more tightly than the engineering does. A certificate whose wording has not been checked is worse than no certificate, because it creates liability instead of removing it.',
			},
		],
		internalCase: [
			{
				role: 'General counsel',
				needs: 'Wording they can defend',
				line: 'A narrow, specific statement about what was removed, with a bounded statement of residual effect, rather than a claim that will not survive being tested.',
			},
			{
				role: 'The data protection officer',
				needs: 'An answer to an erasure request that touches a model',
				line: 'A named structure bound to a recorded sample set, removed on request, with a signed record of what left.',
			},
			{
				role: 'The CFO or commercial owner',
				needs: 'The cost comparison',
				line: 'Retraining from scratch is $100,000–$500,000 per request and the obligation recurs. The cost stops scaling with the model and starts scaling with the request.',
			},
			{
				role: 'Sales',
				needs: 'To stop losing deals on a clause',
				line: 'An answer to the deletion-and-attestation clause that increasingly appears in enterprise contracts, at the point where a competitor has to disclose that they cannot comply.',
			},
		],
		proof: [
			'The exact wording we would put in a certificate, before any engagement',
			'The scope statement: what is claimed, and the four things we explicitly will not say',
			'The binding record format: a hash of the sample set that justified each removable structure',
			'The full technical account and the reproducible experiment programme',
			'A written position on residual influence, including the parts that are argument rather than proof',
		],
		notFor: [
			'Anyone who wants to be told their data is gone. We will not say it, and a supplier who does is selling a liability.',
			'Organisations that train only on data they own outright. The obligation does not attach, and this is a cost with no matching risk.',
			'Deployments that need a certificate this quarter. The legal opinion that governs the wording has not been obtained yet, and we would not issue one before it is.',
		],
		sources: [
			{ label: 'Machine unlearning doesn\'t do what you think · lessons for policy and research', url: 'https://arxiv.org/pdf/2412.06966' },
			{ label: 'Unlearning at scale · the right to be forgotten in LLMs', url: 'https://arxiv.org/pdf/2508.12220' },
			{ label: 'Algorithms that forget · machine unlearning and the right to erasure', url: 'https://www.sciencedirect.com/science/article/pii/S026736492300095X' },
			{ label: 'Pervasive label errors in test sets destabilize ML benchmarks', url: 'https://arxiv.org/abs/2103.14749' },
		],
	},

	'defense-safety-critical': {
		thesis:
			'An autonomous system meets conditions that degrade at exactly the moment it matters most, and the question after an incident is never what the model predicted. It is what the system did to itself, and whether anyone can say.',
		situation: [
			'Jamming, spoofing, sensor damage, radiation-induced corruption. The data stops resembling the training distribution precisely when the system is doing the thing it was built for, and the prevailing engineering answer is to train harder on simulated corruption and hope the real thing resembles the simulation.',
			'The assurance apparatus is being built now and is visibly incomplete. The Department of Defense CDAO\'s own AI assurance page remains a placeholder. An updated DOT&E manual identifies tracking of system safety and unexpected behaviour for AI-enabled and autonomous systems as a major shift under assessment. In March 2026 the Pentagon and intelligence community went to industry asking for an evaluation harness to standardise AI system testing, and in January 2026 the Army contracted specifically to assess AI\'s unpredictable behaviours.',
			'What those procurements have in common is that they are all asking for the same missing thing: a way to see what an autonomous system did internally, under stress, in a form somebody can review afterwards. Testing under denied, degraded, intermittent and limited conditions is now an explicit requirement, and the instrument for recording what happens inside the model during those conditions does not exist.',
		],
		evidence: [
			{
				figure: '10.0%',
				unit: 'where a standard network sits after structural damage',
				note: 'Chance level, on every independent initialisation, permanently. A zeroed layer produces constant activations and exactly one-over-classes accuracy regardless of seed. Measured on CIFAR-10.',
			},
			{
				figure: '80.3%',
				unit: 'recovery from the same damage',
				note: 'Diagnosed within one epoch and repaired through 85 individually attributed structural corrections. A system that degrades to eighty rather than ten is in a different safety category.',
			},
			{
				figure: '70.8%',
				unit: 'recovery from simultaneous full-hierarchy damage',
				note: 'Every convolutional stage zeroed at once, not one layer. The baseline collapses permanently. Measured on CIFAR-10.',
			},
			{
				figure: '−1.0 pp',
				unit: 'against baseline under adversarial weight injection',
				note: 'A known structural blind spot, published rather than buried. Adversarially crafted perturbations maintain nominal activation statistics while degrading decision boundaries, which evades exactly what this architecture monitors. There is no current mitigation.',
			},
		],
		failures: [
			{
				title: 'Degradation is binary, and the fallback is not the mission',
				body: 'The prevailing design pattern is that the system works or it hands control back to a classical controller. There is no graceful middle, so a partial internal failure is treated the same as a total one, and capability is surrendered long before it has actually been lost.',
			},
			{
				title: 'An unexplained self-modification ends the programme',
				body: 'Software entering a controlled environment must be accountable for its own behaviour and auditable after the fact. "The model updated itself and we cannot say how" is not a finding that gets remediated. It is a finding that ends the deployment, and it is the correct response given the alternative.',
			},
			{
				title: 'Test and evaluation cannot reach the failure states',
				body: 'Assurance requires exploring the operational space and the failure states within it. When the smallest observable unit is the system\'s output, a test campaign can establish that a system failed under a condition without establishing anything about why, which means the finding cannot be generalised to conditions not tested.',
			},
			{
				title: 'Bit flips are continuous, not exceptional',
				body: 'In space and high-radiation environments, corruption of stored parameters is a constant background process rather than an incident. A model with no mechanism for noticing internal damage degrades silently and continuously.',
			},
		],
		incumbents: [
			{
				title: 'Simulated corruption during training',
				body: 'Augmentation with synthetic jamming, noise and sensor faults. It improves robustness to the corruptions anticipated, and the operational problem is the ones that were not.',
			},
			{
				title: 'Redundancy and voting',
				body: 'Multiple models or sensors with a voting scheme. Effective against independent failures and considerably less so against correlated ones, and it multiplies the compute budget without producing any account of what went wrong inside any single model.',
			},
			{
				title: 'Runtime monitors and out-of-distribution detection',
				body: 'Watch the inputs or the outputs and raise a flag when they look unfamiliar. Genuinely useful, and they observe the system from outside, so they detect that something is wrong without localising it to anything.',
			},
			{
				title: 'Freeze and certify',
				body: 'The current answer for anything safety-critical: fix the weights, certify that artefact, and accept that it cannot adapt. Coherent, and it puts the entire burden on pre-deployment test coverage.',
			},
		],
		mechanism: [
			{
				title: 'Graceful degradation as a measured property',
				body: 'A layer was destroyed mid-training on a network that had reached 85.1%. The parameter-matched baseline sat at chance level permanently, on every seed. This architecture diagnosed the failure within one epoch and recovered to 80.3% through 85 individually attributed corrections. Under simultaneous damage to every convolutional stage it recovered to 70.8%.',
			},
			{
				title: 'A bounded, timestamped record of every self-modification',
				body: 'This is the artefact the assurance community is currently asking industry to build. Which component, what diagnosis, what magnitude, which declared ceiling, what residual — emitted as the system trains, signed, and reviewable long after the fact.',
			},
			{
				title: 'Nothing changes by more than a declared amount',
				body: 'Every correction is capped as a fraction of the component\'s own weight, balanced so it removes nothing on net, and logged with what was left over. Unbounded self-modification is what makes an autonomous system unacceptable in a controlled environment; a declared ceiling is what makes review tractable.',
			},
			{
				title: 'Read-only, if that is the only acceptable posture',
				body: 'The full diagnostic signal with corrections disabled. For a programme that will not authorise any autonomous weight modification — which is most of them, correctly — the record alone is the deliverable.',
			},
		],
		regulatory: [
			{
				title: 'DoD test and evaluation · under active revision',
				body: 'An updated DOT&E manual identifies tracking of system safety and unexpected behaviour for AI-enabled and autonomous systems as a major shift being assessed. The CDAO\'s AI assurance guidance is not yet published.',
			},
			{
				title: 'DDIL testing requirements',
				body: 'Programmes now require assessment of resilience in denied, degraded, intermittent and limited environments, in controlled and reproducible conditions. In March 2026 the Pentagon and intelligence community solicited industry for an evaluation harness to standardise this.',
			},
			{
				title: 'Accountability as an entry condition',
				body: 'Software entering a classified or controlled environment must be accountable for its own behaviour and auditable after the fact. The record is not a feature in this market. It is the condition of being allowed in the building.',
			},
		],
		buyer: {
			title: 'A research partnership lead, not a procurement officer',
			sits: 'A national laboratory, a university defense research group, or a cleared integrator holding the clearance and doing the integration.',
			budget: 'Research programme funding. Direct enterprise sale is realistically a multi-year horizon.',
			trigger: 'A test campaign that produced a failure nobody could explain, or an assurance case that could not be closed.',
			quote: 'We can show it failed. We cannot show why, so we cannot argue it will not fail that way again.',
		},
		limits: [
			'The measured evidence is for the wrong phase of the problem, and this must lead any conversation in this market. Failures are detected and repaired DURING TRAINING, where gradients and labels exist. This market\'s problem is at test time, in the field, where neither does.',
			'Test-time distribution shift is an unrun extension. No experiment in the current programme addresses it.',
			'Adversarial weight injection is a known blind spot where this architecture measures 1.0 pp worse than baseline, with no current mitigation. In a market whose defining concern is an adversary, this is the first thing a technical evaluator will find, and it should be the first thing they are told.',
			'Nothing here has been run on sensor data, and no defense or classified data has ever touched this system.',
		],
		reframe: {
			claim: 'The assurance question is not whether the system performs. It is whether anything it did to itself can be reconstructed afterwards by someone who was not there.',
			body: 'A test campaign that shows a system failed under a condition has established one data point. A campaign that shows why it failed has established something that generalises to conditions nobody tested. That difference is the whole value of an assurance case, and it is unavailable when the smallest observable unit is the system output.',
		},
		objections: [
			{
				q: 'Your evidence is training-time. Our problem is in the field.',
				a: 'That is the correct objection and it should be the first thing said in the room, not extracted from us in the second meeting. Failures here are detected and repaired during training, where gradients and labels exist. At inference there are neither. Test-time distribution shift is an unrun extension, and no experiment in the current programme addresses it. What transfers today is the record and the graceful-degradation property; what does not is the detection mechanism at inference.',
			},
			{
				q: 'You are 1 percentage point worse under adversarial weight injection.',
				a: 'We are, it is published rather than buried, and there is no current mitigation. Adversarially crafted perturbations maintain nominal activation statistics while degrading decision boundaries, which evades precisely what this monitors. In a domain defined by an adversary that is a serious finding, and it is the reason this market is positioned last rather than first.',
			},
			{
				q: 'Nothing autonomous is going into our system.',
				a: 'Nor should it, and the read-only configuration exists for exactly that posture. Corrections disabled entirely, full diagnostic record retained. For most programmes the record alone is the deliverable and the correction capability is something to evaluate in a laboratory for several years first.',
			},
			{
				q: 'Who has accredited this?',
				a: 'Nobody. No defence or classified data has touched it, no clearance is held, and the company is not US-domiciled, which is a real constraint on direct programme work rather than a detail to work around. The realistic shapes here are a research partnership with a national laboratory or university group, or an IP licence to an integrator who holds the clearance.',
			},
		],
		internalCase: [
			{
				role: 'The assurance lead',
				needs: 'An artefact that closes a case',
				line: 'A bounded, timestamped record of every self-modification, which is the artefact the community is currently going to industry to procure.',
			},
			{
				role: 'Test and evaluation',
				needs: 'To explain a failure, not just observe it',
				line: 'A failure with a named component, a step and a magnitude generalises to untested conditions. A failure observed only at the output does not.',
			},
			{
				role: 'The safety engineer',
				needs: 'A bound they can declare',
				line: 'Every modification capped as a fraction of the component\'s own weight, balanced to net zero, logged with the residual. Unbounded self-modification is what makes a system unacceptable; a declared ceiling makes review tractable.',
			},
			{
				role: 'The programme manager',
				needs: 'A path that does not require clearance on day one',
				line: 'Fundamental research needs none. The dual-use civilian route — industrial autonomy, robotics — builds the same evidence base without the overhead.',
			},
		],
		proof: [
			'The lesion experiments in full: single-layer and simultaneous full-hierarchy, with error bars and seeds',
			'The adverse result, unprompted: the 1.0 pp adversarial deficit and its mechanism',
			'The bound table and a worked self-modification record',
			'The read-only configuration, in which nothing is modified at all',
			'Evaluation access to the mechanism itself, inspectable without a contract or a clearance',
		],
		notFor: [
			'Any programme that needs a test-time robustness result today. It does not exist, and the honest position is that this market is a well-researched hypothesis.',
			'Adversarial-robustness requirements. We measure worse than baseline there and would be the wrong supplier.',
			'Anything requiring a cleared vendor now. The realistic entry is fundamental research or an IP licence to an integrator who holds the clearance.',
		],
		sources: [
			{ label: 'Army assesses AI\'s unpredictable behaviors (DefenseScoop, Jan 2026)', url: 'https://defensescoop.com/2026/01/12/army-contract-ai-behavior-risk-evaluation/' },
			{ label: 'Pentagon and IC seek an AI evaluation harness (DefenseScoop, Mar 2026)', url: 'https://defensescoop.com/2026/03/11/ai-system-testing-dod-intelligence-agencies/' },
			{ label: 'A framework for the assurance of AI-enabled systems', url: 'https://arxiv.org/pdf/2504.16937' },
			{ label: 'Test & evaluation of AI-enabled and autonomous systems', url: 'https://testscience.org/wp-content/uploads/formidable/20/Autonomy-Lit-Review.pdf' },
		],
	},
};
