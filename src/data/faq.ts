// FAQ — the whole question set, in one place.
//
// WHY THIS IS A DATA FILE. Three things consume it: the page, the client-side search index, and
// the FAQPage JSON-LD block. Keeping the questions in the markup meant the JSON-LD had to be
// hand-maintained beside them, which is how structured data silently stops matching the page.
//
// WHAT WAS REMOVED FROM THE OLD PAGE, all of it deliberately:
//   · "Three slots are available per quarter" — invented scarcity, and the kind a procurement
//     officer tests by asking which three. Nothing on this site invents pressure any more.
//   · A $500k–$1.5M range, which contradicted /licensing's stated position of no price list.
//   · "Six pre-bookable solutions" and "the features are sold separately" — the superseded model.
//     There is one product; the seven are applications of it.
//   · "The Charter Partnership Programme is how ORMAS is acquired that are in build or in active
//     development" — a sentence with a clause missing, live on the site.
//
// REGISTER. Nothing here hedges a result that holds, and nothing here overstates one that does
// not. The adversarial deficit, the absence of customers and the CIFAR-only evidence base are
// stated plainly in their own answers, because a buyer who finds them later stops reading, and
// because being exact about a limit is the position rather than a caveat on it.

export type FaqCategoryId =
	| 'product'
	| 'evidence'
	| 'deploy'
	| 'data'
	| 'compliance'
	| 'commercial'
	| 'company';

export interface FaqCategory {
	id: FaqCategoryId;
	label: string;
	/** Shown under the filter chip when that category is the active one. */
	blurb: string;
}

export interface FaqItem {
	id: string;
	cat: FaqCategoryId;
	q: string;
	/** Paragraphs. Plain text — the JSON-LD joins them, so no markup here. */
	a: string[];
	link?: { href: string; label: string };
}

// Ordered the way an evaluation runs: what is it, is it true, how does it run, what leaves the
// building, what does it satisfy, what does it cost, who are you.
export const faqCategories: FaqCategory[] = [
	{ id: 'product', label: 'What it is', blurb: 'The one-line thesis, the architecture behind it, and what it is not.' },
	{ id: 'evidence', label: 'Evidence & limits', blurb: 'The results, the benchmarks they were measured on, and where it loses.' },
	{ id: 'deploy', label: 'Running it', blurb: 'Where it executes, what it costs to run, and what integration involves.' },
	{ id: 'data', label: 'Data, IP & security', blurb: 'What we receive, who owns what, and what happens to the records.' },
	{ id: 'compliance', label: 'Compliance', blurb: 'The frameworks an evaluator will hold this against, answered individually.' },
	{ id: 'commercial', label: 'Licence & commercial', blurb: 'The licence, what is free, what is not, and how terms are agreed.' },
	{ id: 'company', label: 'The company', blurb: 'Who is behind it, how it is funded, and what happens if it fails.' },
];

export const faqs: FaqItem[] = [
	// ---------------------------------------------------------------- WHAT IT IS
	{
		id: 'one-sentence',
		cat: 'product',
		q: 'What does Oxiedo do, in one sentence?',
		a: [
			'The most valuable data in the world is locked up, and ORMAS is the architecture that opens it.',
			'The longer version runs like this. Data is the asset in every market that matters now, and the best of it sits unused behind regulation and contract. It sits there because training on it means handing it to a model that afterwards cannot say what it did with it, and no custodian signs that. ORMAS makes a network keep a true account of what it took from every source as it trains. The account is the thing a custodian needs in order to release anything.',
			'Everything else on this site is a consequence of that sentence. The architecture is the mechanism. The seven features are jobs done with data. The five sectors are where locked data is worth the most.',
		],
		link: { href: '/', label: 'The thesis on one page' },
	},
	{
		id: 'unlock-regulated-data',
		cat: 'product',
		q: 'How does transparency unlock data that regulation currently blocks?',
		a: [
			'Regulation rarely bans training outright. It requires that the holder of the data can say what happened to it, keep it inside a stated boundary, and remove it on request with something a third party can check. Standard architectures fail all three, so the safe answer for a custodian is no.',
			'An ORMAS-trained model changes what can be answered. What the model took from a given source is a named part rather than a diffuse influence spread over every parameter. That part can be shown to an auditor, bounded, and removed on instruction with a signed certificate of what was removed. The refusal that follows from the honest answer stops following.',
			'The consequence is commercial rather than academic. A data holder who can be given those answers can license data they will not license today, and the institution that can generate the answers is the one they license it to first.',
		],
		link: { href: '/sectors', label: 'Where that data sits' },
	},
	{
		id: 'is-this-a-data-product',
		cat: 'product',
		q: 'Is ORMAS a data product or a machine learning product?',
		a: [
			'It is software that trains neural networks, so the delivery is machine learning. The commercial goal is data. Those are not in tension. The architecture exists because a data problem had no solution that did not start inside the training procedure.',
			'No data is bought, sold, brokered or hosted here. ORMAS runs on customer infrastructure beside data that never moves. What is sold is the ability to use data that could not previously be used.',
		],
	},
	{
		id: 'seven-separate-products',
		cat: 'product',
		q: 'Are the seven applications seven separate products?',
		a: [
			'No. There is one product, one architecture and one licence. The seven are features of it, each being the same mechanism asked to do a different job with data.',
			'They carry plain names such as The Proofreader and The Diary rather than mechanism names, because the person who signs for a deployment owns the data problem and not the mathematics that solves it. Naming a feature after the job makes it obvious which one answers a question already on the table.',
			'Nothing is priced per feature. A licensee enables what the deployment requires, and the scope goes into the contract rather than onto a meter.',
		],
		link: { href: '/product', label: 'The seven features' },
	},
	{
		id: 'why-five-sectors',
		cat: 'product',
		q: 'Why five sectors? Does that mean five different solutions?',
		a: [
			'It means the opposite. Every sector that holds data has this problem, and one mechanism answers it in all of them. The five are named because the cost of the missing account is already sitting on somebody\u2019s books there in figures that can be checked, not because five separate things are being built.',
			'What differs between the five is the obligation driving the purchase, the person who signs, and how long the sale takes. The record, the architecture and the licence are identical.',
			'Sectors outside the five are reached by the same licence on the same terms.',
		],
		link: { href: '/sectors', label: 'The five sectors' },
	},
	{
		id: 'what-is-ormas',
		cat: 'product',
		q: 'What is ORMAS?',
		a: [
			'A neural network training architecture that produces a causal account of its own behaviour as a physical consequence of how it learns.',
			'Every node in an ORMAS network carries a bounded local gradient chain of four operations, through a shared 4,715-parameter bottleneck. Because that chain is bounded, the contribution of each node to the loss is not estimated after training, it is read directly off the backward pass. Attribution stops being an interpretation of the model and becomes a measurement taken from it.',
			'The practical consequence is that a model trained under ORMAS arrives with a record of what it did, which component was responsible, and what changed. The record is produced during training, not reconstructed afterwards.',
		],
		link: { href: '/technology', label: 'The architecture in full' },
	},
	{
		id: 'not-interpretability',
		cat: 'product',
		q: 'Is this interpretability? How is it different from SHAP, LIME or attention maps?',
		a: [
			'Those methods build a second, simpler model of a first model and report what the approximation says. They are estimates of a system from outside it, they disagree with each other on the same input, and their output is not stable enough to put in front of a regulator who is entitled to ask how the number was produced.',
			'ORMAS does not approximate. The attribution is a quantity the network computes about itself while training, bounded by construction. There is no surrogate, no sampling, and no post-hoc reconstruction that could be run a second time and return a different answer.',
			'The distinction matters commercially rather than philosophically: an approximation is an opinion about a model, and an opinion cannot be entered as evidence.',
		],
	},
	{
		id: 'vs-observability',
		cat: 'product',
		q: 'How is this different from Weights & Biases, MLflow, Arize or our own observability stack?',
		a: [
			'Those tools record what a training run reported about itself. They are excellent at it, and ORMAS does not replace them.',
			'What they cannot do is answer a causal question, because the information required to answer it was never produced. A loss curve reports that the run degraded at step 40,000. It cannot name the component that caused the degradation, because a standard architecture does not compute that quantity at any point.',
			'ORMAS produces the quantity. An observability platform is then the natural place to put it.',
		],
	},
	{
		id: 'what-kind-of-thing',
		cat: 'product',
		q: 'Is it a model, a library, a wrapper, or a training method?',
		a: [
			'A training architecture, delivered as software that runs in the customer environment. The customer brings the task, the data and the compute; ORMAS determines how the network is structured and how the backward pass is instrumented.',
			'It is not a pre-trained model, and it is not a monitoring layer bolted onto one. The property it delivers cannot be added to a network after training, which is the entire reason it has to sit at the architecture level.',
		],
	},
	{
		id: 'seven-applications',
		cat: 'product',
		q: 'Which of the seven features should a first deployment start with?',
		a: [
			'The order they appear in on the product page is the recommendation. They are ordered by how hard each one is to say yes to, from sending a single file through to agreeing a bound with a regulator before training begins.',
			'The first, The Proofreader, attaches to a model already trained and never modifies it, which is why it is the usual place to start. The last, The Update Engine, asks for a limit signed off in advance. Most institutions want to watch the telemetry for a full cycle before letting anything touch a model, and the read-only mode exists for exactly that.',
		],
		link: { href: '/product', label: 'The seven features' },
	},
	{
		id: 'three-signals',
		cat: 'product',
		q: 'What are the three signals?',
		a: [
			'Global backpropagation, a per-node local loss, and health-gated self-correction. Standard training has the first. The second is what makes each node individually accountable rather than accountable only as part of an aggregate. The third lets the network act on what the second tells it, under a gate that decides whether intervention is warranted.',
			'The five telemetry layers are what those signals emit, from system-level health down to per-parameter attribution.',
		],
		link: { href: '/technology', label: 'The signals and telemetry layers' },
	},
	{
		id: 'second-model',
		cat: 'product',
		q: 'Does the account depend on a second model or a judge?',
		a: [
			'No. Nothing in the record is generated by another network, scored by a critic, or produced by any component that could itself be wrong in an unbounded way. The record is arithmetic performed during the backward pass.',
			'This is the property that survives the question an auditor eventually asks, which is what validates the validator.',
		],
	},
	{
		id: 'bounded-meaning',
		cat: 'product',
		q: 'What does "bounded" actually mean here?',
		a: [
			'That the local gradient chain for any node is four operations long, LayerNorm then Linear then PReLU then Linear, and cannot grow with the depth or width of the surrounding network.',
			'An unbounded chain is why attribution in a standard deep network is intractable: the causal path from a parameter to the loss runs through the entire remaining architecture. Fixing the length of that path is what converts attribution from an estimation problem into a measurement.',
		],
	},

	// ---------------------------------------------------------------- EVIDENCE
	{
		id: 'evidence-base',
		cat: 'evidence',
		q: 'What is the evidence that this works?',
		a: [
			'383 controlled experiments across four architecture families, 67 archived runs reproducible from seed, and 16,316 lines of instrumentation across 85 files. The architecture and every experiment behind it are released in full on publication.',
			'The headline result is recovery: +70.3 percentage points from catastrophic structural collapse, in conditions where a parameter-matched baseline is permanently dead rather than merely degraded.',
			'Every run regenerates from seed. The claim is not that the numbers deserve belief on our word; it is that any reader with the seed can produce them independently.',
		],
		link: { href: '/technology', label: 'The results in full' },
	},
	{
		id: 'benchmarks',
		cat: 'evidence',
		q: 'What benchmarks were these measured on?',
		a: [
			'CIFAR-10 and CIFAR-100. That is the honest scope of the published evidence and it is stated on every page where a result appears.',
			'No clinical, biological, financial or defence data has ever touched this system. The mechanism is domain-independent by construction, operating on the backward pass rather than on the semantics of the input. But a mechanism being domain-independent is an argument, and an argument is not a result.',
			'Closing that gap is what the dataset partnership on the careers page exists to do, and it is the single largest thing standing between the result and the fields it was built for.',
		],
	},
	{
		id: 'peer-review',
		cat: 'evidence',
		q: 'Has this been independently verified?',
		a: [
			'Not yet by a third party, and that is stated plainly rather than left to be discovered. The architecture is not public today, and the commitment to release it in full is written into the licence rather than promised.',
			'What is available now, to an investor or an evaluating institution under a short agreement, is the full experimental archive: 383 runs, each regenerating from seed, including the ones that failed. External verification is a meaningful signal and it is not yet held. Seeded reproducibility is the stronger one, because it does not depend on anyone taking our word for a number.',
		],
	},
	{
		id: 'where-it-loses',
		cat: 'evidence',
		q: 'Where does ORMAS lose?',
		a: [
			'Under adversarial weight injection, it performs 1.0 percentage point worse than a parameter-matched baseline. That is the one adverse result in the programme and it is published on the technology page and named in every market where it bears on the decision.',
			'It is a real deficit and it is small. It sits alongside a +70.3 pp recovery advantage under structural collapse, and any evaluator weighing the two should weigh them against the failure mode their own systems actually encounter.',
		],
	},
	{
		id: 'not-established',
		cat: 'evidence',
		q: 'What has not been established?',
		a: [
			'Behaviour at frontier scale, behaviour on any regulated dataset, and behaviour in production over time. There is no deployment, no pilot and no customer, so none of the three has been observed.',
			'The technology page carries a section listing exactly this, written before anyone asked for it.',
		],
		link: { href: '/technology', label: 'What is not established' },
	},
	{
		id: 'scale',
		cat: 'evidence',
		q: 'Does it scale to large models?',
		a: [
			'The bottleneck is 4,715 parameters and is shared, so the instrumentation cost does not grow with model size the way the model does. The architecture has no scale-dependent term in it.',
			'That is the structural argument, and it is a good one. It is not the same as having run it at frontier scale, which has not been done and is listed among the things a first partner would establish.',
		],
	},
	{
		id: 'falsify',
		cat: 'evidence',
		q: 'What would prove this wrong?',
		a: [
			'Under 30 GPU-hours on a single card. The remaining research programme is designed so that its central claims can be falsified cheaply and quickly, and the experiment that would do it is specified rather than described.',
			'A programme that cannot be killed inexpensively is not a research programme. Any serious technical evaluator should ask for that specification, and it is provided on request.',
		],
	},
	{
		id: 'kill-suite',
		cat: 'evidence',
		q: 'You mention an adversarial test suite that the earlier version failed. What was it?',
		a: [
			'42 runs across two backbone types, with an explicit pass/fail list written in advance. The earlier architecture failed four of them outright: it lost to a plain CNN at every noise level tested, recovered worse under weight-perturbation shock, never triggered its correction mechanism across the full set, and produced ablation arms indistinguishable from the full system.',
			'The logs were kept rather than deleted. The trainer was rewritten, the architecture reconstructed, and the suite that broke the first version became the standard the second had to clear.',
			'The evidence base is adversarial rather than confirmatory, which is the answer to anyone asking whether the results were selected after the fact.',
		],
	},

	// ---------------------------------------------------------------- RUNNING IT
	{
		id: 'where-it-runs',
		cat: 'deploy',
		q: 'Where does it run?',
		a: [
			'Inside the customer environment, on existing hardware, against the data. On-premise, in their own cloud tenancy, or in an air-gapped enclave.',
			'There is no hosted service, no inference endpoint and no control plane operated by us. The software has no outbound route, which is an architectural property rather than a policy commitment: a policy can be broken and a system with no network path cannot be.',
		],
		link: { href: '/data', label: 'The full data position' },
	},
	{
		id: 'phone-home',
		cat: 'deploy',
		q: 'Does it need to contact you to run? Licence checks, telemetry, updates?',
		a: [
			'No. Not for licence validation, not for telemetry, not for updates. It runs with no connection outward from the network.',
			'This is the first question every security reviewer in a regulated environment asks, and the answer determines whether the rest of the review happens at all.',
		],
	},
	{
		id: 'frameworks',
		cat: 'deploy',
		q: 'What frameworks and hardware does it need?',
		a: [
			'It is a PyTorch architecture and runs on standard NVIDIA accelerators. It requires no specialised silicon, no custom kernels and no changes to the scheduler or orchestration layer.',
			'Integration is a change to how the network is defined and trained, not a change to the platform.',
		],
	},
	{
		id: 'existing-models',
		cat: 'deploy',
		q: 'Can we apply this to models we have already trained?',
		a: [
			'Not retroactively, and this is the honest constraint at the centre of the product. The account is generated during training. A model already trained under a standard architecture never produced the quantity, and nothing can recover it afterwards. That is precisely the problem ORMAS exists to solve, so it would be incoherent to claim otherwise.',
			'What applies to an existing model is assessment: a trained checkpoint can be examined and reported on. Forward from that, models trained under ORMAS carry the record natively.',
		],
	},
	{
		id: 'overhead',
		cat: 'deploy',
		q: 'What does the instrumentation cost in compute?',
		a: [
			'The bottleneck is 4,715 shared parameters and the local chain is fixed at four operations, so the overhead is a bounded constant rather than a proportion of the model.',
			'Set against it is the cost of the failure it prevents. A frontier run that dies at 60 percent and is restarted blind burns thousands of GPU-hours to reach the same checkpoint twice. The telemetry is not a tax on training; it is what stops an organisation paying for the same training more than once.',
		],
	},
	{
		id: 'read-only',
		cat: 'deploy',
		q: 'Does it modify weights? Can we stop it doing that?',
		a: [
			'Read-only is the default posture, not a reduced tier. In that mode the network produces the full five layers of telemetry and changes nothing about itself.',
			'Self-correction is enabled deliberately, by the licensee, once the telemetry has earned that decision. Nobody sensible allows an unproven system to modify weights inside a run that costs six figures, and the product does not ask them to.',
		],
	},
	{
		id: 'integration-effort',
		cat: 'deploy',
		q: 'What does integration actually involve on our side?',
		a: [
			'Defining the network under the ORMAS architecture and routing the telemetry it emits into wherever run records are already kept. The second part is usually the shorter one.',
			'The people who need to be in the room are the team that owns model training and whoever owns evidence retention. It is not a platform migration.',
		],
	},

	// ---------------------------------------------------------------- DATA, IP & SECURITY
	{
		id: 'what-you-receive',
		cat: 'data',
		q: 'What data do you receive?',
		a: [
			'Under a deployment licence, none. Not the training data, not the weights, not the telemetry, not the records. The software runs with no outbound route, so there is no transfer to govern.',
			'This changes the legal analysis rather than merely softening it: where we do not receive, store, transmit or access personal data, no processing occurs on our behalf and no Article 28 relationship arises in respect of it.',
			'The exception is an evaluation sent to us deliberately, which is a different mode with its own terms and a data processing agreement executed before anything moves.',
		],
		link: { href: '/data', label: 'The three modes, separated in law' },
	},
	{
		id: 'train-on-our-data',
		cat: 'data',
		q: 'Do you train on our data or use it to improve your product?',
		a: [
			'No, and under a deployment licence the question does not arise, because we never hold it. There is no telemetry channel, no opt-out to configure, and no setting to get wrong.',
			'Where an evaluation places data with us temporarily, its use is limited to that evaluation in writing, and it is returned or destroyed on completion.',
		],
	},
	{
		id: 'who-owns-models',
		cat: 'data',
		q: 'Who owns the models we train and the records they produce?',
		a: [
			'The licensee does, without qualification: the weights, the training data, the telemetry and the compliance records. We claim no interest in the outputs of a licensed deployment and no right to inspect them.',
			'The licence covers the architecture. It does not reach what is built with it.',
		],
	},
	{
		id: 'records-after-contract',
		cat: 'data',
		q: 'If our licence ends, can we still read the records we already produced?',
		a: [
			'Yes, permanently. Records are written in a documented, open format that does not require our software to interpret, and they live in customer storage rather than ours.',
			'A compliance record that becomes unreadable when a commercial relationship ends is not a compliance record. Retention obligations outlive vendor contracts routinely. The EU AI Act alone requires logs to be kept for at least six months, and sector rules run to years, so artefact survival is written into the licence rather than left to goodwill.',
		],
		link: { href: '/licensing', label: 'Artefact survival in the licence' },
	},
	{
		id: 'escrow',
		cat: 'data',
		q: 'Is source code escrow available?',
		a: [
			'Yes, and alongside it the licence carries a release commitment: the mechanism is published in full on release, irrevocably. That is a stronger position than escrow, because the architecture cannot become unavailable to a licensee once released, and escrow covers the implementation until then.',
			'Escrow covers the production implementation and the assurance work around it, and is agreed in the contract.',
		],
	},
	{
		id: 'security-posture',
		cat: 'data',
		q: 'What is your security posture as a supplier?',
		a: [
			'Under a deployment licence we are a software supplier rather than a service provider. There is no outbound connectivity to review, no data residency question, no standing credentials to any customer environment and no subprocessor touching the data, because none of it moves.',
			'That is a materially smaller third-party risk surface than a hosted vendor presents, and most of a standard questionnaire resolves to "not applicable" for a structural reason rather than an asserted one.',
		],
	},
	{
		id: 'copy-the-mechanism',
		cat: 'data',
		q: 'You are going to publish the mechanism. What stops a competitor building it?',
		a: [
			'Nothing will stop them reproducing it once it is out, and that is intentional: a result nobody can check is worth nothing in the fields this sells into.',
			'What a reimplementation does not come with is the calibration behind the bound, the adversarial suite the architecture was hardened against, the archived experimental record, or a counterparty who will stand behind a number in the filing. Institutions under obligation are not buying source code. They are buying somebody who is accountable for it.',
		],
	},

	// ---------------------------------------------------------------- COMPLIANCE
	{
		id: 'makes-us-compliant',
		cat: 'compliance',
		q: 'Does this make us compliant?',
		a: [
			'No, and any vendor claiming otherwise is selling a problem rather than a product. Compliance is a determination made by the deploying organisation and accepted by the regulator, about its system, its use case and its controls.',
			'What ORMAS produces is the evidence such a determination requires and which most organisations currently cannot generate: a causal record of what the model did, which component was responsible, and what changed. The evidence has been the missing input, not the paperwork around it.',
		],
	},
	{
		id: 'eu-ai-act',
		cat: 'compliance',
		q: 'How does this bear on the EU AI Act?',
		a: [
			'Article 12 requires high-risk systems to technically allow automatic recording of events across their lifetime, sufficient to identify risk and substantial modification, support post-market monitoring, and monitor operation. Article 19 requires providers to retain those logs for at least six months, and longer where the intended purpose demands it.',
			'The obligation is on the system to be capable of producing such a record. Standard architectures satisfy it with operational logs that capture what happened without capturing what caused it, which meets the letter for many systems while leaving the provider unable to answer the substantial-modification question when it is actually asked.',
			'ORMAS produces a per-component causal record natively, which is a materially stronger position under the same article. Under the Omnibus timetable, Annex III obligations apply from 2 December 2027 and Annex I from 2 August 2028.',
		],
	},
	{
		id: 'iso-42001',
		cat: 'compliance',
		q: 'Does it help with ISO/IEC 42001?',
		a: [
			'Directly, in three of its clauses. 42001 asks for documented operational information (7.5), controlled development with version records for traceability and reproducibility (8.3), and monitoring and measurement that supports audit and incident analysis (9.1). Model and dataset lineage sit underneath all three.',
			'Those clauses describe evidence an organisation must be able to produce. ORMAS produces it as a by-product of training rather than as a documentation exercise performed alongside it.',
			'Oxiedo does not hold 42001 certification, and a certification held by us would not transfer to a customer in any case. The relevance is to the customer\'s management system, not ours.',
		],
	},
	{
		id: 'nist-ai-rmf',
		cat: 'compliance',
		q: 'How does this map to the NIST AI Risk Management Framework?',
		a: [
			'Most usefully to MEASURE, which is the function organisations struggle to evidence because it requires quantities they do not compute. MAP and GOVERN are largely organisational; MEASURE asks what the system actually did and on what evidence.',
			'Per-component attribution and the five telemetry layers are measurement functions in the framework sense. They also feed MANAGE, in that a named failing component is actionable where an aggregate degradation signal is not.',
		],
	},
	{
		id: 'gdpr-position',
		cat: 'compliance',
		q: 'Under GDPR, are you a controller or a processor?',
		a: [
			'Under a deployment licence, neither, in respect of the data. The customer remains the controller. A processor is a party that processes personal data on behalf of a controller, and where we do not receive, store, transmit or access it, no such processing occurs.',
			'For an evaluation sent to us, we are the customer\'s processor and a DPA is executed before any transfer. For this website, we are the controller of what is submitted through it.',
			'Oxiedo is not yet separately incorporated; a Delaware C-corporation is being formed. Until it completes, the controller for anything submitted through this site is the UK-registered company through which we currently contract, and UK GDPR and the Data Protection Act 2018 apply to it as home law. EU GDPR applies under Article 3(2) for data subjects in the Union. That entity is named in full in any agreement and before any data is transferred to us.',
		],
		link: { href: '/data', label: 'Positions under GDPR and HIPAA' },
	},
	{
		id: 'hipaa',
		cat: 'compliance',
		q: 'Do we need a business associate agreement?',
		a: [
			'Under a deployment licence, no. A business associate is an entity that creates, receives, maintains or transmits protected health information on behalf of a covered entity. In that mode we do none of those four things, and the four verbs are the whole test.',
			'Where an evaluation involves PHI, we execute a BAA before any transfer.',
		],
	},
	{
		id: 'fda-pccp',
		cat: 'compliance',
		q: 'How does this relate to an FDA predetermined change control plan?',
		a: [
			'A PCCP requires a manufacturer to specify in advance what modifications a device may undergo, the methods used to implement them, and the evidence that each stays inside the authorised envelope. The hard part in practice is the third.',
			'A model that modifies itself and records each change against a declared bound produces exactly the artefact that requirement describes. Of the 1,451 FDA-cleared AI-enabled devices at the end of 2025, roughly 8 percent carry a PCCP. The constraint has been the ability to evidence adherence, not willingness to file.',
			'Oxiedo makes no regulatory submission on a customer\'s behalf and holds no clearance. The submission and its contents remain the customer\'s.',
		],
		link: { href: '/sectors/medical-ai', label: 'The medical AI position' },
	},
	{
		id: 'model-risk',
		cat: 'compliance',
		q: 'How does this sit with model risk management supervision?',
		a: [
			'SR 26-2, effective 17 April 2026, supersedes SR 11-7 as the interagency model risk guidance. The requirement an institution has always struggled with is effective challenge: independent validation with sufficient information to actually challenge a model rather than review documentation about it.',
			'A validator who can see per-component attribution and a change record is performing effective challenge. A validator handed a loss curve and a model card is performing a document review, and examiners have been increasingly explicit about the difference.',
		],
		link: { href: '/sectors/regulated-finance', label: 'The finance position' },
	},
	{
		id: 'soc2',
		cat: 'compliance',
		q: 'Do you hold SOC 2 or ISO 27001?',
		a: [
			'Neither, and both are planned once first engagements fund the audit. Claiming otherwise would be the fastest way to fail a diligence process that verifies certificates directly.',
			'What is worth weighing is what those attestations cover. Both assess controls over data a vendor holds. Under a deployment licence we hold no customer data, which is why most of a security questionnaire resolves structurally rather than by attestation.',
		],
		link: { href: '/data', label: 'What is held and what is not' },
	},
	{
		id: 'regulator-accept',
		cat: 'compliance',
		q: 'Will a regulator accept these records?',
		a: [
			'No regulator pre-certifies an evidence format, and any vendor promising acceptance is describing something that does not exist.',
			'What can be said precisely: the records are per-component, causally grounded, immutable once written, and readable without our software. Those are the properties that make evidence admissible in a supervisory process. The determination remains the regulator’s, and the records are built to survive it rather than to anticipate it.',
		],
	},

	// ---------------------------------------------------------------- LICENCE & COMMERCIAL
	{
		id: 'licence-model',
		cat: 'commercial',
		q: 'What licence is this under?',
		a: [
			'A research licence. Free for research, teaching and evaluation, including commercial evaluation, from the moment the release lands. Production use is licensed separately.',
			'It is not an open source licence and is not described as one. Open source has a specific meaning and this does not meet it: the restriction on production use is the entire point.',
		],
		link: { href: '/licensing', label: 'The licence in full' },
	},
	{
		id: 'free-scope',
		cat: 'commercial',
		q: 'What exactly can we do for free?',
		a: [
			'Read the architecture, reproduce every experiment, teach from it, publish on it, and evaluate it against their own workload, including inside a commercial organisation deciding whether to buy. Evaluation access is available now under a short agreement; everything else follows the release.',
			'What the free licence does not carry is production deployment, the calibrated bound, the assurance work, or a counterparty. An open licence has no counterparty: it cannot be named in a filing, it cannot stand behind a declaration, and there is nobody to hold to it.',
		],
	},
	{
		id: 'academic-use',
		cat: 'commercial',
		q: 'We are a university lab. Is there anything to sign?',
		a: [
			'Nothing, once the release is out: no registration, no seat count, no notification to us. Findings may be published freely, including results that contradict ours. Before then, ask and evaluation access is granted.',
			'A mechanism researchers must ask permission to examine is not published in any meaningful sense, which is why the release carries no gate at all.',
		],
	},
	{
		id: 'pricing',
		cat: 'commercial',
		q: 'What does a deployment licence cost?',
		a: [
			'There is no price list. The figure is agreed per institution against scale of deployment and the assurance work involved, and written into the contract.',
			'This is not evasion. A published number would be wrong for nearly every reader of it, and the variable that matters, what a failure in the customer environment costs, is one the customer can calculate before the first conversation and we cannot calculate at all.',
		],
	},
	{
		id: 'pre-booking',
		cat: 'commercial',
		q: 'What does pre-booking mean?',
		a: [
			'Agreeing deployment terms now, ahead of general availability, and shaping the integration around the customer environment while that is still possible.',
			'Early partners influence what the production system prioritises, because the requirements are still open. There is no artificial limit on how many are accepted and no countdown attached to it.',
		],
		link: { href: '/contact', label: 'Start a conversation' },
	},
	{
		id: 'evaluate-first',
		cat: 'commercial',
		q: 'Can we evaluate before committing?',
		a: [
			'Yes, and it is the expected path. Evaluation access is available now under a short agreement, and free and unrestricted once the research release is out. Either way it runs entirely in the customer environment against the workload, with nothing reaching us.',
			'Where a customer would rather we assessed a checkpoint directly, that is a scoped evaluation with a DPA executed first.',
		],
	},
	{
		id: 'support',
		cat: 'commercial',
		q: 'What support comes with a licence?',
		a: [
			'Direct engineering access to the people who built the architecture. There is no support tier structure and no account management layer in between.',
			'We hold no standing credentials to any customer environment. Where a support question requires us to see something, the customer decides what to share and shares it deliberately, and that transfer carries evaluation terms.',
		],
	},

	// ---------------------------------------------------------------- THE COMPANY
	{
		id: 'who-are-you',
		cat: 'company',
		q: 'Who is behind this?',
		a: [
			'Oxiedo is a founder-led research company in formation, incorporating as a Delaware C-corporation alongside a move to San Francisco. Until that completes it contracts through an existing registered company, named in full in any agreement.',
			'The founder is a technical founder who has built and exited companies before this one. Commercial, research and regulatory roles are open, and the full position on structure and funding is on the investor page rather than buried.',
		],
		link: { href: '/about', label: 'The company and the founder' },
	},
	{
		id: 'how-much-exists',
		cat: 'company',
		q: 'How much of this actually exists?',
		a: [
			'16,316 lines across 85 files, 383 controlled experiments across four architecture families, and 67 archived runs that regenerate from seed. The architecture is complete and the experimental programme is closed.',
			'The right way to weigh that is not to take it on trust. Every run regenerates from seed, and the mechanism is released in full on publication, so the work becomes checkable in a way that a larger team behind a permanently closed implementation never is.',
		],
	},
	{
		id: 'funding',
		cat: 'company',
		q: 'Are you raising?',
		a: [
			'We are open to early investment conversations ahead of a priced round, alongside commercial licensing and pre-booking.',
			'The investor case rests on one architectural result, published and reproducible, in markets where the obligation to produce evidence is arriving on a legislated timetable rather than a speculative one.',
		],
		link: { href: '/invest', label: 'The investment position' },
	},
	{
		id: 'no-customers',
		cat: 'company',
		q: 'Why should we engage a company with no paying customers?',
		a: [
			'Because the alternative on offer is a mature vendor selling an approximation, and an approximation does not become admissible by being sold at scale. The question is not who has more customers; it is which one produces evidence that survives a regulator.',
			'What is normally opaque at this stage is not opaque here. The release commitment is written into the licence, every experiment regenerates from seed, the one adverse result is disclosed on this site, and the falsification test costs under 30 GPU-hours. Most established vendors disclose none of it.',
			'Zero customer conversations have taken place, and it is on the about page in those words.',
		],
	},
	{
		id: 'company-fails',
		cat: 'company',
		q: 'What happens to us if Oxiedo fails?',
		a: [
			'Everything that matters stays with the licensee. Once the architecture is released it cannot be withdrawn, because the licence makes that irrevocable, and escrow covers the implementation before then. The models, weights and records sit in the customer environment and were never in ours. The records are written in a documented open format that needs no software of ours to read, and remain readable indefinitely.',
			'Escrow covers the production implementation. This is the concentration-risk question every procurement function is right to ask, and the answer is structural rather than reassuring: there is no switch we could throw that would take anything away from a licensee.',
		],
	},
	{
		id: 'roadmap-dependency',
		cat: 'company',
		q: 'How much of what you sell depends on work not yet done?',
		a: [
			'The published architecture and its results are complete and reproducible today. The programme extending it is described by its objectives and constraints on the technology page; its mechanism is not published, and will not be until it is protected.',
			'Anything sold against work not yet complete is identified as such in the contract, with the milestone written in. Nothing here is priced on a promise that is not also a commitment.',
		],
	},
	{
		id: 'the-name',
		cat: 'company',
		q: 'Where does the name come from?',
		a: [
			'ORMAS is the architecture. Oxiedo is the company that publishes and licenses it. The distinction matters in a contract, which is the only place it matters.',
		],
	},
	{
		id: 'contact',
		cat: 'company',
		q: 'How do we start a conversation?',
		a: [
			'Through the contact page. Every message is read by a person and answered within a few days, and the first reply comes from the person who built the architecture rather than from a qualification process.',
			'Useful things to bring: what is being trained, what obligation attaches to it, and what a failure currently costs to diagnose.',
		],
		link: { href: '/contact', label: 'Contact' },
	},
];
