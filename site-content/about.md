# About Oxiedo: the company and the research

- **URL:** `/about`
- **Page title:** About Oxiedo: the company and the research
- **Meta description:** A software company that followed a problem into research and stayed. The origin, the operating principles, and where this honestly stands today.

---
ABOUT

## We are building the instrument that makes machine intelligence accountable.

01

### What Oxiedo is

We build the instrument that makes a neural network accountable for itself: one that produces a bounded, logged account of every change it makes to its own structure, as it makes it. That account exists in no standard architecture and cannot be recovered afterwards by any tool. It has to be built into how the model learns. We built it.

02

### Why it matters

Every industry now training under real obligation, whether medicine, finance, data rights or safety-critical systems, is asked the same question by an auditor, a regulator or a customer: what did this model do, and can it be proven? Today the honest answer is no. The record is the answer.

03

### What we are doing about it

Turning one property into one product, licensed to institutions that carry an obligation. The mechanism is published so it can be checked, and the release is committed in the licence rather than promised in a blog post. The production system is licensed because what an institution needs is a calibrated bound and somebody who will stand behind it.

**ORIGIN**

### A software company that followed a problem into research, and stayed.

Nothing here was planned from the beginning. The company went where the problem was, and the problem turned out to be considerably larger than the one it set out to solve.

1. 2023

  #### It starts as a research question

  Oxiedo exists from 2023, quietly and without much happening in it. What it had was a question nobody had a good answer to: can a neural network produce a truthful account of what it does to itself, while it does it, rather than a reconstruction assembled afterwards and hoped to be accurate? Everything since has been the attempt to produce one somebody else could check.

2. 2024

  #### The black box stops being an abstraction

  The field had priced opacity as the cost of capability and moved on. Looked at closely, that trade was not a law of the method. It was the consequence of one early decision, reasonable when it was made and never revisited since.

3. 2025

  #### A legal footing, and the pursuit of regulated data begins

  The research reaches the point of needing a legal person behind it, something that can hold an agreement, take a payment and issue a licence, so it gets one, through an existing registered company while the permanent structure is decided. The work then went to the people who hold regulated data to ask what a custodian actually needs before releasing any: a calibrated bound, a record that survives an audit, a named counterparty who will stand behind both. Those answers shaped the architecture more than any benchmark did. No custodian has yet released data to us, and that remains the largest single thing standing between the result and the field it was built for.

4. 2026

  #### The programme closes

  383 controlled experiments across four architecture families, 67 archived runs reproducible from seed, 16,316 lines of instrumentation, and a manuscript submitted for peer review. The result held.

5. Now

  #### Under review, commercially open, and moving to San Francisco

  The manuscript is under peer review, with the architecture, the results and the reasoning released in full on acceptance. Commercial licensing is open, pre-bookings are being taken, and we are open to early investment conversations. The company is incorporating as a Delaware C-corporation and the headquarters is relocating to San Francisco — nearer the labs, the capital and the operators this was built for.

**A NOTE FROM THE FOUNDER**

Rokib Al Dhin Raadh

Founder

- **Background** — Technical founder. Built and exited companies before this one.
- **Role here** — The architecture and the research programme.
- **Based** — Relocating to San Francisco.

I have started companies before this one and sold some of them. This is the first time I have spent three years on a question rather than a product, and it is the only question I would have done that for.

The problem is not really technical, it is an accounting one. There is an enormous quantity of data in the world that would improve how medicine is practised, how risk is priced, how systems are built to fail safely — and almost none of it can be used, because using it means putting it inside a model that afterwards cannot say what it did with it. So it stays where it is, and everything it could have done goes unspent. Somewhere behind those doors are the applications nobody has reached yet, in fields that have never had a model trained on their own data because the data was never releasable.

Nobody holding that data is being careless. They are right to hold it under the conditions that exist. What is missing is the account that would make opening it defensible, and that account has to be built into how a model learns, because it cannot be recovered later.

I wanted to contribute a fact to this field rather than an opinion — measured, reproducible, checkable by anyone who cares to check it. That is why the mechanism gets published rather than kept back, and why every experiment regenerates from seed. If I am wrong, I would rather the field established that quickly.

**HOW WE OPERATE**

### Six decisions that shape everything else.

Each of these costs something. They are listed because a company is what it does when the decision is expensive, and because every one of them is checkable against the rest of this site.

1. 01

  #### Publish the mechanism, licence the accountability

  The architecture, the paper and every experiment are released on publication and free for research from that day. Credibility here rests on results anyone can reproduce, and a permanently closed method is worth less to a validator, not more.

2. 02

  #### Watch before touching anything

  The read-only mode is not a stripped tier, it is the default posture. Nobody sensible lets an unproven system modify weights inside a run that costs six figures, and the product does not ask them to.

3. 03

  #### Nothing ships while a known defect is open

  The modification record currently exists in three incompatible shapes in three code paths, and one of them silently drops compliance fields. A compliance artefact assembled from three incompatible records is not a compliance artefact, and that closes before anything is sold on it.

4. 04

  #### Validate at the earliest point validation is possible

  The study that decides four of the seven applications runs a third of the way through the build, not at the end. Running it late costs the same and buys nothing. Running it early preserves the option to change course.

5. 05

  #### State the limit before it is found

  The one adverse result, 1.0 pp worse than baseline under adversarial weight injection, is published on the technology page and named in every market where it is relevant. In fields whose central complaint is that vendors overstate their approximations, being exact about their own limit is the position rather than a caveat on it.

6. 06

  #### One product, not a portfolio

  A bank, a hospital and an AI lab buy the same mechanism and call it by three different nouns. That is a property of the architecture, not a marketing decision, and it is why there is one licence rather than seven contracts.

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
- **Published** — A manuscript under peer review, plus the architecture and every experiment behind it.
- **Stage** — Pre-deployment. The architecture is complete, commercial licensing is open, and pre-bookings are being taken.
- **The binding constraint** — No clinical, biological, financial or defence data has ever touched this system. Every result is CIFAR-10 or CIFAR-100.
- **What is open** — Commercial leadership, research engineering, and a first dataset partnership.

**WHAT WE ARE LOOKING FOR**

### We are hiring across research, commercial and regulatory.

A dataset partner above all, then a commercial lead, a research engineer, and two single consultations that between them unblock the largest part of the product. The commitment shape is stated on each one, because some of them are not jobs.

[See the open roles](/careers)

[Read the research](/technology)

Entity

Oxiedo · A research company in formation · Incorporating in Delaware, headquarters relocating to San Francisco · Contracting runs through an existing registered company, named in full in any agreement

Contact

Every message is read by a person and answered within a few days. We are open to early investment conversations ahead of a priced round.

[Get in touch →](/contact)
