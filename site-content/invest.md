# Pre-seed: the round and the risks

- **URL:** `/invest`
- **Page title:** Pre-seed: the round and the risks — Oxiedo
- **Meta description:** Pre-seed, $4.5M, six named milestones. Every regulated training run will soon have to account for itself, and almost none of them can.

---
INVEST

## Every model in a regulated industry will soon have to account for itself. Almost none of them can.

The whole thing, in one screen

- **The insight** — Every interpretability and monitoring tool estimates a model from outside it, and an estimate is an opinion. ORMAS bounds each node’s gradient chain to four operations, so attribution stops being an estimate and becomes a measurement taken during training. If that is right, every regulated training run eventually has to be built this way, and the layer the market is currently funding is the wrong layer.
- **What exists** — 383 controlled experiments across four architecture families, 67 archived runs reproducible from seed, 16,316 lines of instrumentation. +70.3 pp recovery from catastrophic structural collapse. One adverse result, disclosed. Manuscript under peer review.
- **Why now** — The obligations arrive on legislated dates, not forecast ones: SR 26-2 already in force, EU AI Act Annex III from 2 December 2027, Annex I from 2 August 2028. An architecture cannot be retrofitted into a model that has already been trained.
- **The moat** — The mechanism publishes on acceptance, so defensibility never rested on secrecy. It rests on what capital cannot compress: regulatory acceptance, calibration history, and an adversarial record.
- **The ask** — $4.5M pre-seed, 24 months, six milestones with acceptance criteria. Team $1.8M · compute $1.6M · data partnerships $550K · assurance $350K · operating $200K.
- **The risk** — No revenue, no customers, zero customer conversations. One person. Every result on CIFAR-10 and CIFAR-100. The whole remaining programme is falsifiable for under 30 GPU-hours, which is the fastest way to find out if we are wrong.

The entire field treats attribution as something reconstructed after training. It is not. It is something a network either computes about itself, or does not.

Interpretability, monitoring and governance tooling all share one assumption: that a simpler model of a trained network can be built and its approximation reported. That assumption is why two of those tools disagree on the same input, and why none of their output can be entered as evidence by an institution that is legally obliged to produce some.

ORMAS bounds each node’s local gradient chain to four operations through a shared 4,715-parameter bottleneck. Because the chain is bounded, per-node attribution stops being an estimate and becomes a measurement taken from the backward pass. A model trained this way arrives with the account already made.

If that is right, every regulated training run eventually has to be built this way, and the layer everyone is currently investing in is the wrong layer.

+70.3 pp

Recovery from catastrophic structural collapse, where a parameter-matched baseline is permanently dead

383

Controlled experiments across four architecture families, every run reproducible from seed

<30 GPU-hrs

To falsify the entire remaining research programme, on a single card

1 person

Who built all of it. The second is the most consequential thing this round buys

**WHY NOW**

### The demand event has a date on it.

The usual answer to “why has nobody built this” is that the incentive did not exist. Here it is arriving on a legislated calendar, and an architecture cannot be retrofitted into a model that has already been trained, so it has to exist before the date, not after it.

> Dates in law as at September 2026. Filled marks have already taken effect.

Two of these have already happened. An institution that begins the architecture question in 2027 is not late by a quarter; it is late by a training cycle, and a training cycle in a regulated environment is measured in years.

**DEFENSIBILITY**

### The moat is time nobody can buy.

The mechanism is published on acceptance, so defensibility does not rest on secrecy and this page will not pretend it does. It rests on the things capital cannot compress.

#### Regulatory acceptance is not compressible

A competitor can reimplement a published architecture in weeks. They cannot compress the time it takes a validator, an examiner or a notified body to accept a counterparty and a method. That clock runs at the speed of institutions, and it does not run faster for a better-funded entrant.

#### Calibration is empirical, not architectural

What is licensed is a calibrated bound and somebody accountable for it. Calibration is accumulated runs, adversarial testing and failure history. A reimplementation arrives with the architecture and none of the record behind it, which is the part an institution is actually buying.

#### Publishing is the distribution strategy

In fields where the buyer is obliged to show their working, the released implementation becomes the one validators check against. Being the reference is a stronger position than being the secret, and it is only available to whoever publishes first.

#### The incumbents are structurally committed

Every interpretability and observability vendor is built on the premise that attribution is recovered after training. Adopting this architecture means conceding that premise was wrong. That is not a product decision they can take quickly.

**THE NUMBER**

### $4.5M, and here is the arithmetic behind it.

Priced against the market rather than picked. The published H1 2026 benchmarks are below, and every line of the round is costed underneath them at rates anyone can check.

Broad pre-seed median

$1.2M

All sectors, H1 2026. Range $500K–$2.5M.

Deep tech and AI infrastructure

$2M–$5M

Raised above the median specifically to cover compute and research.

AI seed median

$4.6M

A 1.3x premium on the broader seed market.

This round

$4.5M

Top of the deep tech pre-seed band, costed line by line below.

The pre-seed market in 2026 is a barbell: sub-$250K party rounds at one end, $2.5M+ lead-led rounds at the other. A figure in between is the one position with no natural buyer, and it would also not cover the compute.

**USE OF FUNDS**

### Six line items. Each one buys down a named risk.

Deep tech is funded against de-risking rather than revenue, so this is set out as risks removed rather than categories of spend. Every item carries an acceptance criterion, because a milestone without acceptance criteria is an intention. Runway is 24 months.

1. 01

  #### Team

  Five people, 24 months, fully loaded

  $1.8M

  Key-person risk

  A co-founder, two research engineers, a systems engineer to take a research codebase to something an institution can deploy, and an assurance lead who owns the bound. The company is one person. That is not modesty — there is more validated work available right now than one person can execute, and every month of it is being lost.

  Done when — Three people who can independently extend the architecture, and one production implementation with the modification record unified across every code path.

2. 02

  #### Compute

  800 NVIDIA SXM accelerators, 100 nodes of 8, with NVLink intra-node, 400G InfiniBand fabric, all-flash NVMe. Reserved, not owned. A bounded 4–6 week campaign.

  $1.6M

  Scale risk

  Every result to date runs on CIFAR because that is what one person could afford. The first question any technical evaluator asks is whether the property holds at scale, and it is answerable with hardware and not answerable without it. The requirement is a genuine training fabric rather than a pile of cards: 100 eight-GPU nodes on NVLink, joined by 400G InfiniBand, with flash on the same fabric — the bottleneck in a bounded-attribution run is interconnect, not FLOPs. It is rented and released. Buying 800 accelerators is roughly $30M of hardware before power, and holding them idle is the most common way a round this size disappears with nothing attached to it.

  Done when — Bounded attribution demonstrated at frontier parameter counts, on the same adversarial suite the current architecture was hardened against, with every run reproducible from seed.

3. 03

  #### Data partnerships

  Three to five non-exclusive regulated datasets, $50K–$500K each, plus the legal work around them

  $550K

  Domain risk

  No clinical, biological, financial or defence data has ever touched this system, and one partnership does not fix that. A property demonstrated on a single dataset is a coincidence until it holds across sectors. This funds several in parallel, plus the data use agreements, ethics approvals and custodian assurance work that gate each one. Healthcare AI developers spend an average of $2.4M a year on licensed data; the ask here is deliberately at the non-exclusive end.

  Done when — Three signed dataset partnerships across at least two regulated sectors, and the property demonstrated on data carrying a real obligation.

4. 04

  #### Assurance, certification and IP

  Delaware C-corp conversion, SOC 2 Type II, ISO 27001, EU Article 27 representation, patent filings

  $350K

  Procurement and structural risk

  Every one of these is a gate rather than an ornament. The Delaware conversion has to complete before a US institutional round can close into it. SOC 2 is a procurement baseline in 2026 rather than a differentiator. An EU Article 27 representative is a legal requirement for a UK company offering services to EU data subjects. And the programme extending the architecture cannot be published until it is protected. None of this is optional and all of it has a lead time measured in months.

  Done when — Delaware C-corporation incorporated and the round able to close into it, SOC 2 Type II held, EU representation appointed, and priority filings made.

5. 05

  #### Calibrating the bound

  The asset a reimplementation does not come with

  Within compute and team

  Commercial risk

  What an institution licenses is not the architecture, which is released on publication and free to copy from that day. It is a calibrated bound and a counterparty who will stand behind it in a filing. Calibration is accumulated runs, adversarial testing and failure history — it is bought with the compute and the people above, and it is the single line on this page that compounds.

  Done when — A published calibration methodology and a bound an external validator can independently verify.

6. 06

  #### Operating

  24 months of everything else

  $200K

  Runway risk

  Insurance, tooling, accounting, the San Francisco relocation, and the contingency any honest budget carries. Listed rather than folded into another line, because a use-of-funds with no operating line has simply hidden it somewhere else.

  Done when — 24 months of runway with the milestones above met inside it.

**CAPITAL DISCIPLINE**

### What this round is deliberately not spent on.

A use-of-funds is only as credible as the things it refuses. These four are the most common ways a round this size disappears with no result attached to it.

#### Standing GPU capacity

The compute is a bounded campaign with a release date. Idle accelerators are the most common way a deep tech round disappears without a result attached.

#### Sales headcount

There is nothing to scale yet. The first conversations are had by the person who built the architecture, because at this stage they are technical conversations.

#### Marketing spend

The buyers are a few hundred institutions worldwide and they are reachable by name. Demand generation is not the constraint; evidence is.

#### Exclusive data deals

Exclusive refreshed regulated data runs $500K–$5M a year and would consume the round. Non-exclusive datasets prove the same property at a tenth of the price.

**THE LADDER**

### What is already removed, and what this round removes next.

- REMOVED

  #### Does the mechanism work

  Removed. 383 controlled experiments, 67 archived runs reproducible from seed, +70.3 pp recovery under structural collapse, published and checkable.

- REMOVED

  #### Is it a real architecture or a wrapper

  Removed. 16,316 lines across 85 files, four architecture families, an adversarial suite the first version failed and the second had to clear.

- REMOVED

  #### Is the demand real

  Removed by legislation rather than by us. The obligations arrive on dates already in law.

- LIVE

  #### Does it hold at scale

  Live. This is what the compute in this round buys, and it is falsifiable for under 30 GPU-hours.

- LIVE

  #### Does it hold on regulated data

  Live. Requires a dataset partner, which is the first line item after compute.

- LIVE

  #### Will institutions buy it

  Live. Zero customer conversations have taken place.

**THE RISK REGISTER**

### Everything a diligence process would find, listed first.

None of this is disclosed reluctantly. An investor who finds these in week three discounts everything else on the page; an investor who reads them here is evaluating the same company with better information.

#### No revenue, no customers, no pilot.

Zero customer conversations have taken place. Nothing on this site claims otherwise, and any diligence process will confirm it quickly.

#### One adverse published result.

Under adversarial weight injection the architecture is 1.0 pp worse than a parameter-matched baseline. It is published on the technology page and named in every market where it bears on a decision.

#### Key-person risk is total.

One person wrote all of it. That is the first thing this round is spent on, and it is the reason the round exists at this size rather than a smaller one.

#### You are giving the mechanism away.

Deliberately, and on acceptance rather than now. A result nobody can check is worth nothing to a regulator, and the defensibility was never intended to rest on secrecy. What is not published is the programme extending it, which stays unpublished until it is protected.

#### The evidence base is CIFAR-10 and CIFAR-100.

Stated on every page where a result appears. The architecture is domain-independent by construction; that is an argument, and this round converts it into a result.

#### Regulatory timelines can move.

They can, and they have moved before: the Omnibus shifted Annex III to December 2027. They move later, not away. Every reset extends the window rather than closing it.

**DILIGENCE**

### Waiting buys no information here.

The rational default on any pre-seed is to wait. More data arrives, the founder becomes better known, and the option costs nothing. That default is usually correct, and on this company it is not, for one specific reason.

The entire remaining research programme can be falsified for under 30 GPU-hours, on a single card, using a specification we supply.

That is not a claim about how confident we are. It is a statement about how cheap the experiment is. What a quarter of waiting would establish is available this week, for roughly the cost of a business lunch, and it can be run by their own technical partner on customer hardware without us in the room.

Everything else is checkable now, under a short agreement: the mechanism, all 383 seeded runs including the ones that failed, the adversarial suite, and the manuscript in full. The one adverse result is already on the technology page. The data room does not contain a better story than this page does. It contains the same story with the workings attached.

What goes in front of an investor

- The falsification specification, and the runs that would execute it.

- The full archive of 67 seeded runs, including the four the first architecture failed.

- The adversarial suite, written before the results, with its pass/fail list intact.

- The manuscript under review, in full.

- A demonstration on their own workload, run in the customer environment.

**THE ASK**

### $4.5M pre-seed, 24 months of runway, six named milestones.

Oxiedo is founder-owned and incorporating as a Delaware C-corporation alongside the move to San Francisco, so the round closes into the structure US institutional investors require rather than one they would ask us to change first. The conversion is the first line of the assurance budget above for exactly that reason. We are open to conversations ahead of a priced round and are looking for a lead rather than a party round, because the milestones above need someone still in the room at the next one.

The investor this suits backs technical risk that has already been measured rather than technical risk that is still a hypothesis, and is unbothered by a regulated go-to-market where the timetable is legislated and the sales cycle is long. The window is not closing because we say so. It closes on 2 December 2027, when the first obligations apply, and an architecture cannot be retrofitted into a model that has already been trained.

[Open a conversation](/contact)

[Read the research first](/technology)
