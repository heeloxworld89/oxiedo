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

ML platform leads at organisations training their own models

1,400+

× $75K a year = $105M. Count: the Weights & Biases customer base. Next: M4, the first 20 conversations.

Heads of model risk at large banks

176

66 US + 110 ECB-supervised banks × $250K a year = $44M. Next: M4, three design partners.

Together that is $149M serviceable now, counted bottom-up. Adjacent markets are larger: AI governance software reaches $15.8B by 2030 (Forrester) and MLOps $16.6B by 2030. Expansion into healthcare AI and pharma R&D follows the same record.

The counts are sourced. The prices are our plan and are untested: no price has been put to a buyer yet, and M4 is where that changes.

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

### The moat is time nobody can buy.

The mechanism is published on release, so defensibility does not rest on secrecy and this page will not pretend it does. It rests on the things capital cannot compress.

#### The dead ends are the barrier to entry

A competitor does not start where this is now. They start where this was in 2023, and the route runs through the same failures: an architecture that lost to a plain CNN at every noise level tested, a correction mechanism that never triggered once across 42 runs, and ablation arms indistinguishable from the full system. Those runs are logged and kept. The question came in 2023, two years of research followed, and the first version that worked arrived on 11 July 2026; the reason the rest of the field does not have this is that the path to it is not visible from the outside.

#### Regulatory acceptance is not compressible

A competitor can reimplement a published architecture in weeks. They cannot compress the time it takes a validator, an examiner or a notified body to accept a counterparty and a method. That clock runs at the speed of institutions, and it does not run faster for a better-funded entrant.

#### Calibration is empirical, not architectural

What is licensed is a calibrated bound and somebody accountable for it. Calibration is accumulated runs, adversarial testing and failure history. A reimplementation arrives with the architecture and none of the record behind it, which is the part an institution is actually buying.

#### Publishing is the distribution strategy

In fields where the buyer is obliged to show their working, the released implementation becomes the one validators check against. Being the reference is a stronger position than being the secret, and it is only available to whoever publishes first.

#### The incumbents are structurally committed

Every interpretability and observability vendor is built on the premise that attribution is recovered after training. Adopting this architecture means conceding that premise was wrong. That is not a product decision they can take quickly.

**THE ALTERNATIVES**

### Trackers chart training. Oxiedo records each fix.

Our axis is a per-component record of each fix, made during training, on the customer’s machines. The tools a buyer already owns either watch the run or inspect the finished model; none of them names, resets and records the part that broke.

The buyer’s alternative Layer state in training Names the part Resets it Record of each fix Validator workflow Rewind to checkpoint and retry—————Trackers: W&B, MLflow yes partly——partly Research resets: ReDo, Continual Backprop yes yes yes——Data quality: cleanlab—————Model-risk tools: ValidMind, ModelOp, Credo, Fiddler, Arthur————yes Oxiedo (ORMAS)yes yes yes yes partly

The category is being bought: Weights & Biases by CoreWeave (about $1.7B, 2025), Arize by Dynatrace ($915M, 2026), Neptune by OpenAI (2025). And funded: Arize $70M, Fiddler $30M, Credo AI $21M, ValidMind $8.1M.

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

No unit-economics ratio is shown. Without a paid contract, acquisition cost and lifetime value are unknown; the first three paid contracts set them. Gross margin is high because nothing is hosted: cost of revenue is deployment engineering and support, modelled at 70% in year two and 80% in year three, to be replaced by pilot data.

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

  Shown. Three pre-set tests went against us, and each one changed what we build: the April 2026 suite killed the first design, a negative V2 pilot moved V2 to parallel parts, and an AISTATS submission was withheld when ORMAS finished below a plain reset.

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

Rokib Al Dhin Raadh built V1 alone. The round’s first hire is a research engineer in month one; a product engineer and a commercial lead follow in month seven. No price has been put to a buyer; M4 tests it.

#### A plain reset beat the controller on one seed.

On a one-seed rerun of the headline lesion, a plain reset reached 83.3%, ORMAS 78.5% and ReDo 77.5%. ORMAS carries dropout and the plain reset does not, so the comparison is confounded. What is sold is the detector and the record; M1 settles the repair question on five seeds with matched dropout.

#### Three published runs where it loses.

Random-direction weight injection (83.1% vs 84.1%), a 100× weight explosion (85.1% vs 86.0%), and ResNet-18, where the skip connection keeps signal flowing and standard training finishes ahead (92.3% vs 91.6%). Three seeds each.

#### Every result is CIFAR-10 and CIFAR-100 on small models.

No transformer, tabular or customer data yet. M3 is the move to credit-risk and medical-image data, with a pass line written first.

#### It costs more to train.

About 2.6× wall-clock on the lesion run (799 s against 312 s) and +15,867 parameters (+2.56%), measured on one seed.

#### Detection has not been measured, and one pilot was negative.

Precision, recall and delay against known faults are M2. A pilot using disagreement between parts to flag mislabelled samples was negative (AUROC ≈ 0.51 against ≈ 0.97 for plain per-sample loss), and V2 changed course because of it.

#### The paper and the code disagree on one point.

The paper states a 30% cap on resets; the code does not enforce it. A correction is pending. The April 2026 suite that killed the predecessor has not yet been re-run on the current code.

#### The venue record is mixed.

One accepted poster (DeepMath 2026), two rejections (AAAI-27 main track, the NeurIPS 2026 AI4GOOD workshop), and one paper withheld from AISTATS 2027 under our own kill rule. Every reviewer request maps to a milestone.

**DILIGENCE**

### We write the kill rule first, and follow it.

A single-author result is easy to tune until it flatters. So each test gets its rule before the run, and the rule stays on the record when it goes against us.

Three pre-set tests have gone against us. Each one changed what we build.

April 2026: the predecessor architecture lost to a plain CNN at all four noise levels of a purpose-built suite, and zero corrections fired in 42 runs. We rewrote the system. October 2026: a pilot testing whether disagreement between parts flags mislabelled samples came back negative, so V2 moved to parallel parts, and the next pilot must beat plain loss by 0.03 AUROC, published either way.

Also October 2026: the rule for AISTATS was not to submit if ORMAS finished two or more points below a plain reset. It finished 4.8 points below on one seed, so the paper was not submitted, and V2 keeps only detect and reset. The product is the detector and the record.

What goes in front of an investor

- The 28-slide deck, with an appendix that puts the limits first.

- Every number and its source, including the ones that are plans rather than measurements.

- The full results table, every run and baseline, weak runs included.

- The kill-rule record and the venue record.

- The three-year model with every row’s assumption, and the entity and IP plan.

**TERMS**

### $750K on a post-money SAFE. $7.5M cap, 10.0% dilution.

The cap sits below Carta’s median of about $10M for SAFEs of $250K–$1M, on purpose: a company with one founder, no paying customer and an evidence base confined to CIFAR should not price at the top of its category.

Oxiedo is not yet incorporated, has no cap table and no prior investor. The Delaware C-corporation is formed before the SAFE is executed, and the code, run archive, paper, brand and domain are assigned to it at incorporation. Until then the founder holds them personally, and contracting runs through an existing UK-registered company, named in full in any agreement, which takes no equity. Founder stock vests. Bangladesh foreign-exchange rules on US shares go to counsel before close.

**PROVENANCE**

### Where every number on this page comes from.

Measured figures come from the run archive; market and price figures are labelled as hypotheses. An investor who takes the measured rows and discounts the rest is reading this page exactly as intended.

Figure Source Status 10.0% vs 80.3% ± 1.5%Archived lesion runs, three seeds each Measured; rerun 4 October 2026 Plain reset 83.3%, ReDo 77.5%, ORMAS 78.5%Rerun on one seed, RTX 3080 Measured, one seed; M1 repeats it 383 controlled experiments Run records across the founder’s result folders Counted Accepted poster, DeepMath 2026 Programme committee decision; poster session 29–30 October 2026 External review$5.9B (2025) → $19.1B (2035)SNS Insider, AI model-risk management, 25 August 2026 Analyst report 1,400+ orgs; 176 banks; $149M W&B customer base; Fed large banks; ECB list; our planned prices Counts sourced; prices untested$75K and $250K a year Our pricing hypothesis No price put to a buyer yet$750K, $7.5M cap Carta pre-seed data 2025–26; our plan Proposal

**THE ASK**

### $750K pre-seed, 18 months of runway, five tested milestones.

Oxiedo is founder-owned and forms its Delaware C-corporation at close, so the round lands in the structure US investors expect. The founder is based in Dhaka, and the company relocates when the first design partner gives it a reason to.

The investor this suits backs technical risk that is already measured and published, losses included, and wants each next step tied to a test written down before the work. The regulatory dates are already in law: the EU AI Act’s high-risk obligations apply from 2 December 2027.

[Open a conversation](/contact)

[Read the research first](/technology)
