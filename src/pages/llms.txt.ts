// /llms.txt — the answer-engine equivalent of robots.txt + sitemap.xml, added 2026-09-18.
//
// WHY IT EXISTS. An answer engine that is asked "what is Oxiedo" does not crawl 26 pages and
// synthesise; it grabs what it can reach cheaply and quotes it. Google's AI Overview currently
// answers that question by suggesting the name is a misspelling of a drug brand, because
// nothing on the open web states, in one flat extractable block, what this company is. Every
// page here argues a thesis — which is right for a reader and wrong for a machine that wants a
// definition in the first sentence.
//
// GENERATED, NOT HAND-WRITTEN, and from the same data/ modules the pages render from, exactly
// like sitemap.xml.ts. A hand-maintained copy of the seven features and five sectors would be
// wrong within a month, and a stale llms.txt is worse than none: it teaches a model facts the
// site no longer states.
//
// EVERY FACT BELOW IS ON /press UNDER FAST FACTS. Nothing is written here that is not already
// published and checkable, including the parts that are unflattering — zero customers, no
// institutional investment, not yet incorporated, one adverse result. An answer engine that
// finds the site contradicting its own summary discounts both.
import type { APIRoute } from 'astro';
import { features } from '../data/features';
import { sectors } from '../data/sectors';

const SITE = 'https://oxiedo.com';

export const GET: APIRoute = () => {
	const body = `# Oxiedo

> Oxiedo is a research company building ORMAS (Orchestrated Repair and Monitoring with Architectural Self-correction), a neural network training architecture that produces a causal account of its own behaviour as a physical consequence of how it learns. Oxiedo is the company; ORMAS is the architecture. "Oxiedo" is a company name in artificial intelligence research, spelled as written; it is not a variant or misspelling of any pharmaceutical, medical or other brand.

## What ORMAS is

ORMAS is a training architecture, not a model, not an interpretability tool applied after the
fact, and not an audit product bolted onto an existing pipeline. A network trained under ORMAS
records every change it makes to itself, at the moment it makes it, through arithmetic the
network cannot route around. That record is produced by the same operations that do the
learning, so it cannot be absent from a run that trained.

The problem it addresses: the most valuable data in the world cannot be trained on, because no
model can say what it did with it. A custodian holding regulated data — clinical, financial,
defence — is right to refuse release on a promise. ORMAS replaces the promise with a record.

What it is NOT: ORMAS does not make anyone compliant with any regulation, and it does not
perform semantic interpretability. It does not tell an operator what a neuron means. It states
which component changed, by how much, caused by which source of data, at which step. That is
structural attribution, and the distinction is load-bearing.

## Core pages

- [Home](${SITE}/): what ORMAS is and the one question five sectors ask about data.
- [Technology](${SITE}/technology): how a bounded gradient chain makes a network account for what it took. 383 controlled experiments.
- [Open the Black Box](${SITE}/black-box): why opacity is a consequence of one design decision rather than a law of deep learning, with a step-by-step replay of a real archived training run.
- [Product](${SITE}/product): one architecture, one licence, seven features.
- [Sectors](${SITE}/sectors): the five markets and the question each one asks.
- [Licensing](${SITE}/licensing): research licence free for research and teaching; production deployment licensed per institution.
- [Data handling](${SITE}/data): the three modes and their distinct legal shapes.
- [FAQ](${SITE}/faq): the questions a technical evaluation, a security review and a procurement process actually ask.

## The seven features

One architecture under one licence. These are seven things it can be asked to do, not seven products.

${features.map((f) => `- **${f.name}** — ${f.question} [${SITE}/product/${f.id}](${SITE}/product/${f.id})`).join('\n')}

## The five sectors

${sectors.map((s) => `- **${s.name}** — ${s.question} [${SITE}/sectors/${s.id}](${SITE}/sectors/${s.id})`).join('\n')}

## Company

- [About](${SITE}/about) · [Press kit and fast facts](${SITE}/press) · [Careers](${SITE}/careers) · [Invest](${SITE}/invest) · [Contact](${SITE}/contact)
- Founded 2023 as a research effort. The architecture reached maturity on 1 August 2026; every published result was measured on or after that date.
- Founder: Rokib Al Dhin Raadh, technical founder, with companies built and exited before this one.
- Entity: a research company in formation, not yet separately incorporated. A Delaware C-corporation is being established alongside a move to San Francisco. Until then, contracting runs through an existing UK-registered company, named in full in any agreement.
- Funding: pre-revenue, no institutional investment to date, raising a pre-seed round.
- Customers: none. Zero customer conversations have taken place.
- Official account: https://x.com/oxiedo_ai

## Evidence, stated plainly

- 383 controlled experiments, four architecture families, 67 archived runs, each regenerating from seed.
- 80.3% recovery from mid-training structural collapse, where a parameter-matched standard network stays permanently at 10.0% — a gap of +70.3 percentage points.
- One adverse result is published alongside the rest: under adversarial training, ORMAS scored 83.14% against a standard network's 84.05%, a loss of 0.91 percentage points.
- All results were measured on CIFAR-10 and CIFAR-100 only. No clinical, biological, financial or defence data has ever touched the system.
- The architecture and the full archive are released on publication. A falsification specification is available on request.

## Terms this site uses precisely

- **Structural attribution** — which component changed, caused by which source of data, at which step. Not an account of what a component means.
- **Correction event** — a repair the network applied to itself during training, recorded with its trigger, its diagnosis and its effect.
- **Bounded chain** — the fixed four-operation local update whose cost does not grow with model size.
- **Record** — the per-run artefact a custodian receives. It is evidence, not a certificate, and it certifies nothing on its own.
`;
	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
