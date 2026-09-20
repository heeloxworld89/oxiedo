# About Oxiedo: the company and the research

- **URL:** `/about`
- **Page title:** About Oxiedo: the company and the research
- **Meta description:** A licensing company built around one goal: making the world’s locked data usable. The origin, the accountability behind the licence, the operating principles, and where this honestly stands today.

---
ABOUT

## We build the thing that lets locked data be used.

01

### What Oxiedo is

A licensing company. What it licenses is train-time accountability: the architecture that makes a neural network keep a bounded, logged account of every change it makes to itself, as it makes it, which is the account that says what the model took from each source it was given. It exists in no standard architecture and no tool recovers it afterwards. It has to be built into how the model learns. We built it, and we license it to institutions holding data under obligation.

02

### Why it matters

Data is the asset of the next decade and most of the valuable part of it is locked. Hospital records, bank ledgers, assay runs and licensed corpora sit behind regulation and contract, unused, because handing them to a model means handing them to something that afterwards cannot say what it did with them. Enough of it to change how medicine is practised, how risk is priced and how systems are built to fail safely, and almost none of it usable. The constraint is an accounting one rather than a technical one. Nobody holding that data is being careless, and nobody holding it is wrong to hold it under the conditions that exist. What is missing is the account that would make opening it defensible, and that account cannot be recovered later. It has to be built into how the model learns.

03

### What we are doing about it

Turning one property into one product, licensed to institutions that hold data under obligation. Transparency is the mechanism rather than the goal. The goal is that data currently locked by regulation and contract becomes data an institution can defensibly train on, because the record now exists to show what was taken from it and to take it back out on request. Behind those doors are applications nobody has reached, in sectors that have never had a model trained on their own data because the data was never releasable. The mechanism is published so it can be checked, and the release is committed in the licence rather than promised in a blog post.

**ORIGIN**

### Three years on one question, then the company the answer required.

Nothing here was planned from the beginning. The work began as a research question two years before there was a legal person behind it, the company went where the problem was, and the problem turned out to be considerably larger than the one it set out to solve.

1. 2023

  #### It starts as a research question

  Oxiedo exists from 2023, quietly and without much happening in it. What it had was a question nobody had a good answer to: can a neural network produce a truthful account of what it does to itself, while it does it, rather than a reconstruction assembled afterwards and hoped to be accurate? Everything since has been the attempt to produce one somebody else could check.

2. 2024

  #### The black box stops being an abstraction, and the first attempts fail

  The field had priced opacity as the cost of capability and moved on. Looked at closely, that trade was not a law of the method. It was the consequence of one early decision, reasonable when it was made and never revisited since. Acting on that took several attempts, and the early ones did not work. An architecture was built, put through a destruction suite written in advance, and lost to a plain CNN at every noise level tested. The correction mechanism never triggered once across 42 runs. Those logs were kept rather than deleted, and they are on this page further down.

3. 2025

  #### A legal footing, and the pursuit of regulated data begins

  The research reaches the point of needing a legal person behind it, something that can hold an agreement, take a payment and issue a licence, so it gets one: contracting runs through an existing UK-registered company, named in full in any agreement, while the permanent structure is decided. The work then went to the people who hold regulated data to ask what a custodian actually needs before releasing any: a calibrated bound, a record that survives an audit, a named counterparty who will stand behind both. Those answers shaped the architecture more than any benchmark did. No custodian has yet released data to us, and that remains the largest single thing standing between the result and the field it was built for.

4. 11 July 2026

  #### The first version that works

  The trainer rewritten and the architecture reconstructed, the suite that destroyed the previous version is cleared for the first time. Not a refinement of the earlier attempts. A different construction, arrived at after the earlier ones had been taken as far as they went and abandoned.

5. 1 August 2026

  #### The architecture reaches maturity

  The complete system: 383 controlled experiments across four architecture families, 67 archived runs reproducible from seed, and 16,316 lines of instrumentation. Every result on this site was measured on or after this date. It is worth being exact about the timing, because it explains the rest of the position. Before that date there was nothing here an institution could have been sold, and selling it anyway would have broken the operating principle below that says nothing ships while a known defect is open.

6. Now

  #### Licensing is open, and the headquarters moves to San Francisco

  The architecture, the results and the reasoning are released in full on publication, and what is sold is not the research but a licence to the accountability it produces. Commercial licensing is open, pre-bookings are being taken, and we are open to early investment conversations. The first dataset partnership is the priority ahead of everything else, because a custodian releasing regulated data to this architecture is the proof the whole thesis rests on. The company is incorporating as a Delaware C-corporation and the headquarters is relocating to San Francisco, nearer the labs, the capital and the operators this was built for.

**ACCOUNTABILITY**

### A licence has to have a name on it.

Rokib Al Dhin Raadh

Founder and named principal

- **Accountable for** — The calibrated bound, the record behind it, and every claim published against either.
- **Background** — Technical founder. Built and exited companies before this one.
- **Based** — Relocating to San Francisco.

A custodian deciding whether to release regulated data asks for three things before anything else: a calibrated bound, a record that survives an audit, and a named counterparty who will stand behind both.

The first two are architecture. The third is not something an architecture can supply. A published mechanism has no counterparty of its own, and a bound with nobody behind it cannot be entered into a filing or defended in a review. What a licence adds to a published mechanism is a person who signs the declaration and answers for it when a regulator, an auditor or an opposing expert puts it under pressure.

Rokib Al Dhin Raadh is that person here. The architecture, the results published against it and the one adverse result published alongside them are attributable to a single named principal, and every archived run behind them regenerates from seed, so the claim can be checked rather than taken on trust. Corrections are issued under the same name as the original claim.

That is a deliberate structure rather than a stage the company is passing through. Accountability distributed across a vendor is accountability nobody can locate, which is the reason a compliance function asks who signs before it asks how the method works. A licence that function can rely on names someone, and this one does.

**HOW WE OPERATE**

### Six decisions that shape everything else.

Each of these costs something. They are listed because a company is what it does when the decision is expensive, and because every one of them is checkable against the rest of this site.

1. 01

  #### Publish the mechanism, licence the accountability

  The architecture and every experiment behind it are released on publication and free for research from that day. The intention is to contribute a fact to this field rather than an opinion: measured, reproducible, and checkable by anyone who cares to check it, which is why every experiment regenerates from seed. Credibility here rests on results anyone can reproduce, and a permanently closed method is worth less to a validator, not more. If the result is wrong, the field establishing that quickly is the better outcome.

2. 02

  #### Watch before touching anything

  The read-only mode is not a stripped tier, it is the default posture. Nobody sensible lets an unproven system modify weights inside a run that costs six figures, and the product does not ask them to.

3. 03

  #### Nothing ships while a known defect is open

  The modification record currently exists in three incompatible shapes in three code paths, and one of them silently drops compliance fields. A compliance artefact assembled from three incompatible records is not a compliance artefact, and that closes before anything is sold on it.

4. 04

  #### Validate at the earliest point validation is possible

  The study that decides four of the seven features runs a third of the way through the build, not at the end. Running it late costs the same and buys nothing. Running it early preserves the option to change course.

5. 05

  #### State the limit before it is found

  The one adverse result, 1.0 pp worse than baseline under adversarial weight injection, is published on the technology page and named in every market where it is relevant. In fields whose central complaint is that vendors overstate their approximations, being exact about their own limit is the position rather than a caveat on it.

6. 06

  #### One product, not a portfolio

  A bank, a hospital and an AI lab buy the same mechanism and call it by three different nouns, because the thing all three are really buying is the ability to use data they already hold. That is a property of the architecture rather than a marketing decision, and it is why there is one licence rather than seven contracts.

**HOW THE EVIDENCE WAS BUILT**

### The benchmarks were not chosen to flatter.

An earlier version of this architecture was put through a destruction suite built for the purpose: 42 runs, two backbone types, and an explicit pass/fail list written in advance by the person who most wanted it to pass.

FAIL:

Lost to a plain CNN at every noise level tested.

FAIL:

Under weight-perturbation shock, the plain CNN recovered better.

FAIL:

The correction mechanism never triggered once across 42 runs.

FAIL:

The ablation arms were indistinguishable from the full system.

The logs were kept rather than deleted. The trainer was rewritten, the architecture reconstructed, and the suite that broke the first version became the standard the second had to clear.

The evidence base is adversarial, not confirmatory. That is the answer to anyone asking whether the results were selected after the fact.

Where this stands today

- **Built** — 16,316 lines across 85 files. 383 controlled experiments, four architecture families, 67 archived runs reproducible from seed.
- **Evidence** — 383 controlled experiments across four architecture families, every run regenerating from seed.
- **Stage** — Pre-deployment. The architecture is complete, commercial licensing is open, and pre-bookings are being taken.
- **The binding constraint** — No clinical, biological, financial or defence data has ever touched this system. Every result is CIFAR-10 or CIFAR-100.
- **What is open** — Commercial leadership, research engineering, and a first dataset partnership.

**WHAT WE ARE LOOKING FOR**

### We are hiring across research, commercial and regulatory.

A dataset partner above all, then a commercial lead, a research engineer, and two single consultations that between them unblock the largest part of the product. The commitment shape is stated on each one, because some of them are not jobs.

[See the open roles](/careers)

[Read the research](/technology)

Entity

Oxiedo · A licensing company · Incorporating in Delaware, headquarters relocating to San Francisco · Until that completes, contracting and payments run through an existing UK-registered company, which is named in full in any agreement

Contact

Every message is read by a person and answered within a few days. We are open to early investment conversations ahead of a priced round.

[Get in touch →](/contact)
