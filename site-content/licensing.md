# Licensing: one product, one licence

- **URL:** `/licensing`
- **Page title:** Licensing: one product, one licence — Oxiedo
- **Meta description:** A research licence, free for research and teaching. Production deployment is licensed, because an open licence has no counterparty to stand behind a filing.

---
LICENSING

## We publish the mechanism. We license the accountability.

Everything that makes the architecture work is released on publication and stays released: the mechanism, the telemetry, the correction system, the paper and all 383 experiments behind it. The manuscript is under peer review; the release follows acceptance and the terms are already fixed. From that day a researcher, a student, a model-risk validator or a regulator can read it, run it, reproduce every result and publish about it, permanently and without asking us. That commitment is why any of this is checkable rather than merely asserted.

[Read the full licence text](/LICENCE.txt). It is a working draft, published now so a university or an enterprise legal team can clear it before the release lands rather than after.

Running it in production is licensed. The distinction is deliberate and it is not hidden anywhere in a footnote: research and teaching are free, and an institution putting this into a regulated deployment takes a licence.

Published code has no counterparty. It cannot be named in a filing, it cannot stand behind a declaration, and there is nobody to hold to it.

A licence supplies what the repository structurally cannot: a named party that calibrated the bound, validated it against the domain, and signed it. In markets that buy on auditability, that is what is actually being purchased.

**WHAT IS PUBLISHED, AND WHAT IS LICENSED**

### The line, drawn once.

The rows are in order. The free column runs out partway down, and where it stops is the product.

Research licence

Deployment licence

The training architecture itself

The mechanism, in full. Run it, modify it, ship what is built with it.

Research

Deployment

The telemetry channels

All five layers, emitted natively, exactly as the paper describes them.

Research

Deployment

The correction mechanism and its bounds

Eight diagnoses, their triggers, and the per-diagnosis ceilings.

Research

Deployment

The paper and every experiment behind it

383 controlled runs, each regenerating from seed, with the reproducibility checklist.

Research

Deployment

Teaching, publishing and independent evaluation

Use it in a course, cite it in a paper, or evaluate our claims against it. No permission needed, and no notification to us.

Research

Deployment

Submission-grade record generation

The record in the shape a reviewer expects to receive, rather than a research log.

Research

Deployment

The diff engine

Two records compared line by line. The only question a reviewer actually asks.

Research

Deployment

Cryptographic signing and a frozen reader

A hash over a canonical body, a detached signature, and a reader binary the licensee keeps.

Research

Deployment

The bound, calibrated for the domain

Derived against the data and the institution's risk profile, then validated. Not a default.

Research

Deployment

Integration into the customer stack

Bindings for the training infrastructure, the federation, the imaging pipeline.

Research

Deployment

Version-pinned reproducible builds

Hash-pinned, with the means to verify that the running binary is the one validated.

Research

Deployment

Support against an agreed response time

With the person who built the architecture, not a tier-one queue.

Research

Deployment

Indemnity

Contractual liability, which is the thing an open licence structurally cannot offer.

Research

Deployment

A counterparty who signs the bound

Somebody who will stand behind the declaration under questioning.

Research

Deployment

**THE FOUR LAYERS**

### One of them is the business, and it is not the one people expect.

1. RESEARCH LICENCE

  #### The research release

  Free for research, teaching and evaluation. Permanent.

  The architecture, the telemetry, the correction mechanism and every experiment behind them, released in full on publication. The manuscript is under peer review and the release follows acceptance, a commitment written into the licence rather than an intention. From that day a researcher, a student, a model-risk validator or a regulator can run it, reproduce our results, teach from it and publish about it without asking us and without paying us. Evaluation access is available before then under agreement. Production use sits under the deployment licence.

  Purpose: the mechanism can be checked.

2. SOURCE-AVAILABLE

  #### The artefact layer

  Free for research. Licensed for regulated commercial deployment.

  The record generator, the diff engine, the signing and versioning machinery, and the templates mapped onto the frameworks these markets file under. Readable by anyone, because a format nobody can inspect is a format nobody adopts. Converts to a permissive licence on a date fixed in the licence text.

  Purpose: the format, not the fee.

3. COMMERCIAL

  #### The deployment licence

  Annual, per institution, on customer infrastructure.

  Integration into the customer environment, the bound calibrated and validated for the domain, reproducible builds, support, and indemnity. This is the licence, and essentially all revenue is here.

  Where the commercial relationship lives.

4. ENGAGEMENT

  #### Assurance work

  Priced per engagement.

  Calibrating a bound for a domain nobody has calibrated before, drafting a change-control plan, authoring the validation report, and appearing to defend it. Low volume, high value, and the reason a deployment licence renews.

  The layer that cannot be copied at all.

**WHAT THE FIGURE IS BUILT FROM**

### Priced against exposure, not against a feature list.

A rate card would price the software. What an institution is buying here is the removal of a specific, quantified risk, and that is worth a different amount to a consortium than to a bank. The figure is set per institution and written into the contract. Four things determine it.

1. 01

  What the problem currently costs, which is the only anchor that means anything.

2. 02

  Which applications are turned on, and how much of the model portfolio is in scope.

3. 03

  Whether the bound for the domain already exists or has to be calibrated and validated from nothing.

4. 04

  What we are asked to sign, and therefore what we are carrying.

Annual, per institution, on-premise. No per-seat component and no consumption meter.

**THREE CLAUSES THAT ARE NOT STANDARD**

### Written to survive the questions a procurement team is paid to ask.

01

#### Artefact survival

On termination the licensee keeps a perpetual, irrevocable right to read, retain and reproduce every record generated during the term, together with a frozen reader binary.

Why Regulatory obligations outlive a commercial relationship. A customer who suspects they could lose their audit trail by not renewing will never sign in the first place, so this clause costs us nothing and makes the contract signable.

02

#### Bound immutability

The declared bound and modification set are fixed when the licence executes. They change only by a documented, mutually signed amendment that generates its own record.

Why If we can quietly alter the bound, the bound is worth nothing and every filing that references it is void. Our own product goes under change control, and we volunteer that rather than waiting to be asked.

03

#### Reproducible build attestation

The licence carries hash-pinned builds and the means to verify that the binary running in the customer environment is the exact artefact that was validated.

Why Technical documentation requirements and software provenance expectations both point here. It costs us a build pipeline and it removes an entire class of question from a security review.

**DEPLOYMENT**

### It runs where the data already is, and there is no other option.

Every commercial deployment is on-premise or inside their own cloud environment. There is no hosted tier and there will not be one. Model weights and training telemetry leaving a controlled network is a disqualifying finding in a hospital enclave, a bank, or a classified environment, and those are the markets this exists for.

The practical consequence is that the licensee holds the artefact. Nothing checks in, nothing reports usage, and nothing stops working if we do. That is a constraint we designed around rather than a feature we chose, and it shapes every commercial term above.

**WHAT WE WILL NOT DO**

### Five commitments, with the reasoning attached.

- No per-seat pricing

  The buyer is an institution carrying an obligation, not a team with users. Charging per seat would price the wrong thing and cap the deal at headcount.

- No metering that phones home

  In a hospital enclave or a bank network, outbound telemetry is a security review we would not pass, and should not.

- No free tier touching regulated data

  Unbounded support exposure and real liability, in exchange for a lead. The research release is free; a free production tier is not the same thing.

- No relicensing of the research core

  Publishing and then closing after adoption would destroy the credibility every commercial claim here rests on. The research release is permanent once made, and that is a commitment written into the licence rather than a default.

- No delivery-date commitments

  We state what is built, what is being built, and what is not started. We will not put a date on the third category.

**LICENSING QUESTIONS**

### The ones that decide whether this is workable.

#### Why publish the mechanism at all?

Because a claim nobody can check is worth nothing to the people who buy this. A validator, an assurance lab or a regulator can take the published release, run all 383 experiments, and confirm every number on this site independently. A closed reimplementation of a published method is worth less to that audience, not more, which is why publishing is a commercial decision rather than a generous one.

#### Can we use the published release in production?

Research, teaching, benchmarking and independent evaluation are free and always will be. Production is licensed. A university group, a student or a validator checking our claims owes us nothing and needs no permission. Where it goes into something the institution operates, that is a licence, and the licence is where the calibrated bound, the reproducible builds, the support and the indemnity live.

#### Will the research terms be withdrawn later?

No, and the licence text says so. Free research and teaching access is permanent. Publishing a method, waiting for academic adoption and then withdrawing it is a move that works exactly once, and it would take the credibility of every commercial claim we make with it. The published release is the reason the rest is believable, so it is not something we would trade.

#### When does the code become public?

When the review period on the paper closes. Peer review sets that timing, not us, so there is no date on this page. The mechanism is available before then on request: the manuscript and the supplementary material go to serious evaluators who ask.

#### If we stop paying, do we lose our records?

No, and the licence says so explicitly. A perpetual, irrevocable right to read, retain and reproduce every record generated during the term survives termination, together with a frozen reader binary held permanently. Regulatory obligations outlive commercial relationships, so access to the audit trail has to outlive them too.

#### Does anything phone home for licence compliance?

Nothing. No telemetry, no usage meter, no licence server, no call-out of any kind. In a hospital enclave, a bank network or a classified environment, anything that reaches outward fails the security review before anyone opens the commercial terms. The product is built for the environment it is sold into rather than for our convenience.

#### Our software policy requires review of every dependency. What does our counsel review?

Two documents, and both arrive before engagement rather than after. The research licence, which permits reading, running, reproducing and teaching, and reserves production use. And the deployment licence, an ordinary commercial agreement carrying the three clauses set out above. Neither is a copyleft licence and neither imposes any obligation on code written alongside it.

#### What exactly is indemnified?

Scope is set with the customer’s counsel, because a consortium and a bank are not carrying the same exposure and a single template would serve neither well. What does not vary: the bound we declare is one we will defend under questioning, and we do not sign declarations we are not prepared to stand behind.

[Discuss licence terms](/contact)

[See the product](/product)

### Licensing conversations start with what an institution has to be able to prove.

Every engagement starts with one specific problem: a run that died, an audit question that had no answer, a dataset nobody can vouch for.

We reply within a few days. Every message is read by a person.

#### Pre-book a deployment

One licence, no price list. Terms are agreed per institution and written into the contract, and pre-booking fixes them ahead of general availability.

Useful to bring

- What is being trained, and roughly at what scale

- The obligation driving it: SR 26-2, the EU AI Act, Article 17, a PCCP, an internal policy

- What a failed run currently costs to diagnose

[Pre-book a deployment](/contact?intent=pre-book#pre-book)
