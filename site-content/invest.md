# Pre-seed: the round and the risks

- **URL:** `/invest`
- **Page title:** Pre-seed: the round and the risks — Oxiedo
- **Meta description:** Pre-seed, $750K on a post-money SAFE at a $7.5M cap, 18 months, five milestones with pass lines written first. Neural networks that report what broke while they train, and fix it.

---
INVEST

## The system of record for what training did.

The whole thing, in one screen

- **The problem** — Training runs fail silently, and nobody can say which part broke. Builders pay for failed runs in compute; validators inherit a finished black box. Meta logged 35+ manual restarts of OPT-175B in two months, and PaLM saw about 20 loss spikes in one run. The fix each time was rewind, skip data, retry. The cause was never named.
- **What ORMAS does** — It watches every component while the model trains, names the part that died, resets only that part, and writes the change down. Two of three blocks of a trained image model zeroed at epoch 100: standard training stays at 10.0% on every seed, ORMAS recovers to 80.3% ± 1.5%. Every step is on the record, 85 logged interventions per run.
- **First product** — A training health monitor plus a change record. It runs beside the customer’s training job, read-only, on their machines, and produces one file per run for the validator. Both already run inside V1; next is cleaning up the record and packaging it.
- **Why now** — Four regulators now want evidence from training itself, not only from the finished model: the EU AI Act (credit scoring is high-risk from December 2027), the Fed’s SR 26-2 (April 2026), the PRA’s SS1/23 in the UK, and the FDA’s change-control plans for AI devices.
- **The ask** — $750K on a post-money SAFE at a $7.5M cap, 10.0% dilution, 18 months on a Dhaka cost base. It buys five milestones, each with a pass line written before the work, and three hires: a research engineer in month one, then a product engineer and a commercial lead in month seven.
- **The risk** — One founder. No regulated-buyer sales yet and no price put to a buyer. Every result is on CIFAR-10 and CIFAR-100 with small models. On a one-seed rerun a plain reset beat ORMAS’s controller (83.3% vs 78.5%), so what is sold is the detector and the record. All of it is listed below.

Every model should arrive with a record of what its training did, part by part. Today none does.

When a training run breaks, the standard response is to rewind to a checkpoint, skip some data and try again. Trackers chart the loss; model-risk tools inspect the finished model. Nothing in between names the part that broke while it is breaking, so the cause is never written down and a validator inherits a black box.

ORMAS watches every component while the model trains. When a part dies, its learning signal is exactly zero, and standard training cannot leave that trap. ORMAS names the part, resets only that part, and writes the change to a ledger: component, epoch, reason, size.

Don’t trust us: replay the run yourself at oxiedo.com/black-box. Every figure there is read from the archived run files; nothing is simulated in the browser.

80.3%

Recovery after two of three blocks were zeroed mid-training, where standard training stays at 10.0% on every seed

383

Controlled experiments across four model families

3 losses

Published runs where ORMAS finishes behind standard training, named next to the wins

5 milestones

Each with a pass line written before the work. A failed milestone gets reported

**WHY NOW**

### The demand event has a date on it.

The usual answer to “why has nobody built this” is that the incentive did not exist. Here it is arriving on a legislated calendar, and an architecture cannot be retrofitted into a model that has already been trained, so it has to exist before the date, not after it.

> Dates in law as at October 2026. Filled marks have already taken effect.

Two of these have already happened. In the UK the PRA’s SS1/23 deliberately covers AI models, and in the US the FDA lets AI devices change only under a documented change plan. Banks are not ready: large EMEA banks run around 365 models, 67% use AI or machine learning, only 29% say their framework fits, and 75% put under 5% of staff on AI validation (Deloitte, 2025).

**THE MARKET**

### A $19B market by 2035, and we know who signs.

The reference market is AI model-risk management: $5.9B (2025) → $19.1B by 2035, growing 12.5% a year, with 35% in finance. Model-risk spend is already a budget line. We sell into it from training.

TAM · AI model-risk management

$5.9B

2025, growing to $19.1B by 2035 (SNS Insider).

SAM · buyers we can serve now

$149M

Counted bottom-up from the two buyer groups below.

SOM · ARR by year five

$4.75M

3.2% of SAM: 30 ML teams and 10 banks.

ML platform leads at organisations training their own models

1,400+

× $75K a year = $105M SAM. Year-five target: 30 teams (2.1%), $2.25M. Count: the Weights & Biases customer base.

Heads of model risk at large banks

176

66 US + 110 ECB-supervised banks × $250K a year = $44M SAM. Year-five target: 10 banks (5.7%), $2.50M.

Together that is $149M serviceable now, and the year-five target is 3.2% of it: $4.75M ARR. Adjacent markets are larger: AI governance software reaches $15.8B by 2030 (Forrester) and MLOps $16.6B by 2030, all inside $2.7T of AI spend in 2026.

The counts are sourced. The prices and the year-five target are our hypotheses: no price has been put to a buyer yet, and M4 is where that changes.

**WHO SIGNS**

### One wedge, one expansion.

The wedge is the monitor and change record for an ML platform team. The expansion is the same record, read by a model-risk validator. An annual licence per team, run on the customer’s own machines: no seats, no usage meter, no hosted tier.

#### The first buyer — machine-learning platform lead

Runs the training and pays for the failed runs. Wants to know which part broke, and when, instead of rewinding and retrying. Buys the monitor: an annual licence per team, around $75K a year (band $75–250K).

#### The expansion buyer — head of model risk

Owns validation and the budget for it. Wants evidence from training itself, in one file, that their validators can review. Buys the model-risk record: around $250K a year per validation team (band $200–500K).

#### The validator

Wants something verifiable rather than asserted. Kills deals by rejecting a method it cannot reproduce, which is why every record is exportable in a documented format and belongs to the customer.

#### The examiner

Stands behind the validator: the Fed under SR 26-2, the PRA under SS1/23, an EU notified body under the AI Act. The record exists so the bank can answer the question the examiner will ask.

Records belong to the customer and export in a documented format, during the term and after it. Renewal is earned on new runs: monitoring, updates, support, and a version their validator has reviewed. The switching cost is re-validation, not lost history.

**DEFENSIBILITY**

### Why this is hard to copy, ranked honestly.

Five advantages, each with what a competitor would need and where it stands today. The first two exist now. The third is what locks in, and it is earned in a first validation cycle, not claimed. A tracker could copy the second quickly; the first and third take runs and a validator’s review.

#### The failure archive

383 experiments and a labelled taxonomy: what dies, how it shows, what fixes it. A competitor would have to run and label the same controlled experiments from scratch.

**Today:** Built; grows with each design partner, with consent

#### Inside the training loop

It reads component state while training runs. Post-hoc tools cannot recover that later; a competitor needs a hook in the loop.

**Today:** Built for PyTorch; the packaged monitor is M4

#### A validator-accepted format

Once a validator accepts the method, replacing it means re-validating, bank by bank.

**Today:** Not yet: no validator has reviewed it

#### Regulatory evidence

Maps to EU AI Act Annex IV 2(d), SR 26-2 ongoing monitoring, and the FDA’s change-control plans.

**Today:** Mapping stated; untested with a regulator

#### Speed and discipline

Pre-registered tests, and the record of following them. A track record cannot be bought.

**Today:** Kill rules written before runs

#### Not a moat: the reset itself

Resetting a dead part is prior art (ReDo, ICML 2023; Continual Backprop, Nature 2024), and the code is open. A plain reset matches ORMAS.

**Today:** Stated, not hidden

**THE ALTERNATIVES**

### Trackers chart training. Oxiedo records each fix.

Our axis is a per-component record of each fix, made during training, on the customer’s machines. The tools a buyer already owns either watch the run or inspect the finished model; none of them names, resets and records the part that broke.

The buyer’s alternative Type · threat Layer state in training Names the part Resets it Record of each fix Validator workflow Rewind to checkpoint and retry Substitute · high—————Trackers: W&B, MLflow Indirect · medium yes partly——partly Research resets: ReDo, Continual Backprop (open code)Substitute · medium yes yes yes——Data quality: cleanlab Indirect · low—————Model-risk tools: ValidMind, ModelOp, Credo, Fiddler, Arthur Adjacent · medium————yes Oxiedo (ORMAS)—yes yes yes yes partly

The category is being bought: Weights & Biases by CoreWeave (about $1.7B, 2025), Arize by Dynatrace ($915M, 2026), Neptune by OpenAI (2025). And funded: Arize $70M, Fiddler $30M, Credo AI $21M, ValidMind $8.1M.

The real rival is the substitute: rewind and retry is free and habitual, and the reset itself is open code. Our edge is a 383-experiment failure archive, data read inside the training loop, and a record that, once a validator accepts it, costs a re-validation to replace.

**THE TEAM**

### Ships fast, and tries to break the work first.

Rokib Al Dhin Raadh built V1 alone. Dated and checkable: in April 2026 the founder’s own test suite killed the first design, and it was rebuilt; 383 controlled experiments across four model families; the replay demo shipped in September; the DeepMath 2026 poster accepted in September; a NeurIPS 2026 workshop reviewer in October; every baseline reviewers asked for run in October.

Skill the plan needs Today Evidence, or who covers it Research Covered ORMAS; 383 runs; DeepMath 2026 poster; NeurIPS 2026 workshop reviewer Engineering Covered V1 code; the replay demo, shipped Product Partly Demo and site today; a product engineer joins in month 7 Sales Gap Commercial lead, month 7 Model risk Gap A bank model-risk advisor, being recruited

**GO-TO-MARKET**

### 20 buyer calls by month 4; 4 paid teams in year 2.

Every stage has a number, an owner and a channel. Each is a hypothesis until contract three, when observed conversion rates replace it.

Stage Year 1 Year 2 Year 3 Owner Target accounts worked 200 400 800 Founder; commercial lead from month 7 First conversations 60 (20 by month 4)120 250 Founder; commercial lead from month 7 Technical evaluation, on their own run, under 30 days 1 per pilot 1 per pilot 1 per pilot Research engineer Design partners and pilots, 3 months, read-only 3 unpaid 12 pilots 30 pilots Product engineer New paid annual licences 0 4 (33% of pilots)8 Commercial lead Channel mix: founder outbound · research circuit · validator and Big-4 partners 70% · 30% · 0%50% · 25% · 25%40% · 25% · 35%Sales and marketing spend, fully loaded$120K$220K$500K$840K over three years

Of the $750K, $223.5K is go-to-market. Year one is expected to buy 60 conversations and three design partners at $0 revenue: about $2K per conversation and $40K per design partner.

#### Training Health Monitor

Bought by the ML platform lead. $75K a year per team, paid annually upfront. Year one: design partners get three months free. From year two: a paid pilot at $15K, credited to the first year. The contract trigger is agreed first: the pilot finds an injected fault in their own run, inside the agreed delay. $10K one-off implementation; support included.

#### Model Change Record

Bought by the head of model risk; the validator must accept it. $250K a year per bank, paid annually upfront. Starts from a monitor customer, or a six-month validation pilot at $40K, credited. The contract trigger is the validator accepting the record in one validation cycle. $25K implementation; assurance work priced per engagement.

All stage numbers, prices and pilot terms are hypotheses, set before any contract.

**THE NUMBER**

### $750K buys five tested milestones in 18 months.

Priced against the market rather than picked, and priced below it on purpose. The Carta benchmarks are below, and every line of the round is costed underneath them.

Median cap, $250K–$1M SAFEs

~$10M

Carta, State of Pre-Seed 2025.

Median cap, $1M–$2.5M SAFEs

~$15M

Carta, State of Pre-Seed 2025.

Median US pre-seed deal

~$0.9M

PitchBook–NVCA, Q2 2025.

This round

$750K

At a $7.5M cap, below the median for its size on purpose. Post-money SAFE, 10.0% dilution.

The round is sized to the next results, not to the whole plan. Research runs only where the product needs an answer, and the Dhaka cost base is what lets $750K carry three hires for 18 months. If an accelerator or programme (Entrepreneur First, Antler and similar) leads, its terms replace the instrument; the milestones stay the same.

**THE MILESTONES**

### Five milestones, each with a pass line written first.

A failed milestone gets reported. Months are counted from close, assumed December 2026; M5 is pinned to the NeurIPS 2027 deadline in mid-May.

Milestone Passes if Month M1 Repair benchmark Five seeds against three published fixes and a dropout control; ours within one point of the best.2 M2 Detection study Injected faults found at ≥90% precision and recall, flagged within one epoch.4 M3 Beyond CIFAR M2’s pass line holds on credit-risk and medical-image data.7 M4 Design partners 20 buyer conversations; three teams run the read-only monitor in-house.4 → 12 M5 Open record Preprint and code public; NeurIPS 2027 submitted.5

**USE OF FUNDS**

### The $750K, line by line.

Every line names the milestone it pays for. Runway is 18 months, on a Dhaka cost base, with the Delaware C-corp formed at close.

1. 01

  #### Research engineer, remote, month 1

  $9.2K a month, loaded

  $165K

  Key-person risk

  The first hire, because the first three milestones are research: the repair benchmark, the detection study, and the move beyond CIFAR. Remote, so the budget buys a strong engineer rather than a postcode.

  Pays for — M1, M2, M3 and M5

2. 02

  #### Commercial lead, month 7

  $10K a month

  $120K

  Go-to-market risk

  The half of the company the founder has not done. Joins once there is a measured detector and a record format to sell, and carries the design-partner conversations to signatures.

  Pays for — M4

3. 03

  #### Product engineer, remote, month 7

  $8.75K a month, loaded

  $105K

  Product risk

  Packages the monitor and the change record so a team can install it beside their own training job, read-only, on their own machines.

  Pays for — M4

4. 04

  #### Compute, rented GPUs

  Non-CIFAR data, larger models, partner pilots

  $75K

  Scale risk

  Current experiments cost about $200–600 of rented GPU time. This line pays for the work beyond that: credit-risk and medical-image data, larger models, and pilots with design partners. Rented and released, never standing.

  Pays for — M1 to M4

5. 05

  #### Delaware C-corp, IP, legal, accounts

  Formed at close

  $45K

  Structural risk

  The Delaware C-corporation is formed before the SAFE is executed, and the code, run archive, paper, brand and domain are assigned to it at incorporation.

  Pays for — Close, then M4 contracts

6. 06

  #### Founder, living in Dhaka

  $2.5K a month

  $45K

  Runway risk

  The Dhaka cost base is why $750K covers 18 months and three hires. Relocation follows the first design partner, not the round.

  Pays for — All five

7. 07

  #### Partner travel and conferences

  Partner visits, NeurIPS

  $37.5K

  Distribution risk

  Design partners are won in rooms, not inboxes. This pays for the visits and for presenting the open record.

  Pays for — M4 and M5

8. 08

  #### Regulatory and data-protection review

  One engagement each

  $22.5K

  Compliance risk

  A design partner in a regulated sector will ask for both before any data or code touches their systems.

  Pays for — M4

9. 09

  #### Tools, software, insurance

  18 months

  $22.5K

  Operating risk

  Listed rather than folded into another line, because a budget with no operating line has hidden it somewhere else.

  Pays for — Operating costs, no single milestone

10. 10

  #### Buffer, unallocated

  Slippage, or a three-month bridge

  $112.5K

  Estimation risk

  The seed is raised from month 12 on M1–M5 results; the model assumes month 15. The buffer covers three more months if it slips.

  Pays for — Unspent, or spent against a decision written down at the time

**THREE YEARS**

### Three years, with year one at $0 revenue.

Year one is months 1–12 after close. Every figure is a planning assumption, not a forecast from data.

Year 1 Year 2 Year 3 Assumption Design partners (unpaid)3 3—M4: three teams on the read-only monitor by month 12 Paying monitor teams 0 4 9$75K a year each; the first converts by month 15 Paying model-risk teams 0 0 3$250K a year each; validator expansion from year 3 ARR$0$0.30M$1.43M Teams × licence Revenue in year$0$0.15M$0.86M Contracts land mid-year on average Gross margin—70%80%Nothing hosted; cost is deployment and support Headcount 4 9 16 Founder plus three hires from this round Operating spend$0.40M$1.40M$2.60M Year 1 is this round’s plan; then ~$150K per loaded hire Net burn$0.40M$1.30M$1.91M Operating spend less gross profit Money in$0.75M$3.0M—This round; a seed at month 15 on M1–M5 (assumed)Cash, year-end$0.35M$2.06M$0.14M Series A in year 3, not modelled

Gross margin is high because nothing is hosted: cost of revenue is deployment engineering and support. Unit economics below are hypotheses until the first three paid contracts replace them; after contracts one to three, CAC and payback are recomputed from actual cost, and any channel above $120K CAC is dropped.

Unit economics (hypothesis)Monitor Model-risk record Blended, year 3 Annual contract value$75K$250K≈ $119K Gross margin 80%80%80%Customer life 4 years 5 years 4 years Lifetime value$240K$1.0M≈ $381K Acquisition cost (CAC)$55K$120K$70K LTV / CAC 4.4×8.3×≈ 5.4×Payback~14 months~10 months~12 months

Blended CAC is $840K of sales and marketing over three years divided by 12 paid customers. The monitor at the blended $70K CAC is 3.4×, against a 3× benchmark for healthy.

The seed is raised from month 12 on M1–M5 results; the model assumes month 15. The buffer covers three more months if it slips.

**CAPITAL DISCIPLINE**

### What this round is deliberately not spent on.

A use-of-funds is only as credible as the things it refuses.

#### Relocation before a design partner

The company moves when the first design partner gives it a reason to, not because a round closed.

#### Standing GPU capacity

Compute is rented for the work in front of it and released. Idle accelerators are the most common way a deep tech round disappears without a result attached.

#### Marketing spend

The buyers are ML platform teams and heads of model risk, reachable by name. Demand generation is not the constraint; evidence is.

#### Certification before customers

SOC 2 Type II and ISO 27001 are procurement gates for a company with a pipeline. Buying them now would be passing an exam nobody has set yet.

#### A hosted tier

The monitor runs on the customer’s machines. Nothing is hosted, so training data never leaves them and serving cost sits with them.

**THE LADDER**

### What is already removed, and what this round removes next.

- REMOVED

  #### Can a dead part be named and reset during training

  Shown. Standard training stays at 10.0% on every seed; ORMAS names the dead blocks, resets them and recovers to 80.3% ± 1.5%, with every intervention on the record. Replayable at oxiedo.com/black-box.

- REMOVED

  #### Does it follow its own kill rules

  Shown. Three pre-set tests went against us, and each one changed what we build: the April 2026 suite killed the first design, a negative V2 pilot moved V2 to parallel parts, and a paper was held when ORMAS finished below a plain reset.

- LIVE

  #### Is the repair better than the simplest fix

  Live. On one seed a plain reset beat ORMAS’s controller by 4.8 points. M1 reruns it on five seeds against three published fixes and a dropout control.

- LIVE

  #### How well does it detect faults

  Live. Precision, recall and delay against known faults are unmeasured. M2 sets the pass line at 90% and one epoch.

- LIVE

  #### Does it hold beyond CIFAR

  Live. M3 runs M2’s test on credit-risk and medical-image data.

- LIVE

  #### Will teams install it and pay

  Live. No price has been put to a buyer. M4 is 20 conversations and three teams running the monitor in-house.

**THE RISK REGISTER**

### What is not established, and where ORMAS loses.

None of this is disclosed reluctantly. An investor who finds these in week three discounts everything else on the page; an investor who reads them here is evaluating the same company with better information.

#### One founder, and no regulated-buyer sales yet.

Rokib Al Dhin Raadh built V1 alone. Research and engineering are covered; sales and model risk are gaps. The round’s first hire is a research engineer in month one; a product engineer and a commercial lead follow in month seven, and a bank model-risk advisor is being recruited. No price has been put to a buyer; M4 tests it.

#### A plain reset beat the controller on one seed.

On a one-seed rerun of the headline lesion, a plain reset reached 83.3%, ORMAS 78.5% and ReDo 77.5%. ORMAS carries dropout and the plain reset does not, so the comparison is confounded. What is sold is the detector and the record; M1 settles the repair question on five seeds with matched dropout.

#### Three published runs where it loses.

Random-direction weight injection (83.1% vs 84.1%), a 100× weight explosion (85.1% vs 86.0%), and ResNet-18, where the skip connection keeps signal flowing and standard training finishes ahead (92.3% vs 91.6%). Three seeds each.

#### Every result is CIFAR-10 and CIFAR-100 on small models.

No transformer, tabular or customer data yet. M3 is the move to credit-risk and medical-image data, with a pass line written first.

#### What it does not cover.

Today it handles dead layers and units on small vision models. Loss spikes, divergence and label noise are planned; tabular, credit and medical images are M3; transformers come after the seed. Inference-time drift, deliberate attacks on a model and frontier-scale LLM pre-training are not supported. Where nothing is broken, ORMAS ties or trails, which is why the product is the monitor and the record, not a training replacement.

#### It costs more to train.

About 2.6× wall-clock on the lesion run (799 s against 312 s) and +15,867 parameters (+2.56%), measured on one seed.

#### Detection has not been measured, and one pilot was negative.

Precision, recall and delay against known faults are M2. A pilot using disagreement between parts to flag mislabelled samples was negative (AUROC ≈ 0.51 against ≈ 0.97 for plain per-sample loss), and V2 changed course because of it.

#### The paper and the code disagree on one point.

The paper states a 30% cap on resets; the code does not enforce it. A correction is pending. The April 2026 suite that killed the predecessor has not yet been re-run on the current code.

#### The external record is early.

Accepted at DeepMath 2026 (decision 30 September; presented 30 October 2026), and a reviewer for NeurIPS 2026 (3 October), for the Trustworthy AI for Good workshop in Paris on 12 December. The experiments are not yet independently replicated. Every reviewer request maps to a milestone.

**DILIGENCE**

### We write the kill rule first, and follow it.

A single-author result is easy to tune until it flatters. So each test gets its rule before the run, and the rule stays on the record when it goes against us.

Three pre-set tests have gone against us. Each one changed what we build.

April 2026: the predecessor architecture lost to a plain CNN at all four noise levels of a purpose-built suite, and zero corrections fired in 42 runs. We rewrote the system. October 2026: a pilot testing whether disagreement between parts flags mislabelled samples came back negative, so V2 moved to parallel parts, and the next pilot must beat plain loss by 0.03 AUROC, published either way.

Also October 2026: the paper rule was not to submit if ORMAS finished two or more points below a plain reset. It finished 4.8 points below on one seed, so the paper was held, and V2 keeps only detect and reset. The product is the detector and the record.

What goes in front of an investor

- The deck: 14 slides and a 29-page appendix, grouped by the question an investor asks.

- Every number and its source, including the ones that are plans rather than measurements.

- The full results table, every run and baseline, weak runs included.

- The kill-rule record and the venue record.

- The three-year model, the acquisition plan, unit economics and the go-to-market budget, every row with its assumption.

- Personas, the competitor map by threat, five forces, and the entity and IP plan.

**TERMS**

### $750K on a post-money SAFE. $7.5M cap, 10.0% dilution.

The cap sits below Carta’s median of about $10M for SAFEs of $250K–$1M, on purpose: a company with one founder, no paying customer and an evidence base confined to CIFAR should not price at the top of its category.

Oxiedo is not yet incorporated, has no cap table and no prior investor. The Delaware C-corporation is formed before the SAFE is executed, and the code, run archive, paper, brand and domain are assigned to it at incorporation. Until then the founder holds them personally, and contracting runs through an existing UK-registered company, named in full in any agreement, which takes no equity. Founder stock vests. Bangladesh foreign-exchange rules on US shares go to counsel before close.

**PROVENANCE**

### Where every number on this page comes from.

Measured figures come from the run archive; market and price figures are labelled as hypotheses. An investor who takes the measured rows and discounts the rest is reading this page exactly as intended.

Figure Source Status 10.0% vs 80.3% ± 1.5%Archived lesion runs, three seeds each Measured; rerun 4 October 2026 Plain reset 83.3%, ReDo 77.5%, ORMAS 78.5%Rerun on one seed, RTX 3080 Measured, one seed; M1 repeats it 383 controlled experiments Run records across the founder’s result folders Counted NeurIPS 2026 reviewer NeurIPS 2026 reviewer recognition letter, 3 October 2026; Trustworthy AI for Good workshop, Paris, 12 December External Accepted poster, DeepMath 2026 Programme committee decision, 30 September 2026; presented 30 October 2026 External review$5.9B (2025) → $19.1B (2035)SNS Insider, AI model-risk management, 25 August 2026 Analyst report 1,400+ orgs; 176 banks; $149M W&B customer base; Fed large banks; ECB list; our planned prices Counts sourced; prices untested$75K and $250K a year Our pricing hypothesis No price put to a buyer yet$4.75M SOM; funnel; CAC $70K; LTV/CAC ≈ 5.4×Our acquisition plan and unit-economics model Hypotheses until the first three contracts$750K, $7.5M cap Carta pre-seed data 2025–26; our plan Proposal

**THE ASK**

### $750K pre-seed, 18 months of runway, five tested milestones.

Oxiedo is founder-owned and forms its Delaware C-corporation at close, so the round lands in the structure US investors expect. The founder is based in Dhaka, and the company relocates when the first design partner gives it a reason to.

The investor this suits backs technical risk that is already measured and published, losses included, and wants each next step tied to a test written down before the work. The regulatory dates are already in law: the EU AI Act’s high-risk obligations apply from 2 December 2027.

[Open a conversation](/contact)

[Read the research first](/technology)
