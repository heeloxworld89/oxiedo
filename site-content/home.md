# Oxiedo

- **URL:** `/`
- **Page title:** Oxiedo — neural networks that know what they did to themselves
- **Meta description:** ORMAS is a neural network architecture that records every change it makes to itself as it trains, names the part that broke, repairs it, and keeps what it learned. The account that unlocks the world's locked data.

---
**ORMAS · A NEW KIND OF NEURAL NETWORK**

## For forty years, networks learned blind. ORMAS opens their eyes.

Machines that cannot lie.

Not about the world. About themselves.

The labs building the most powerful networks on earth say they cannot see inside them, or teach them to learn without forgetting.

**ORMAS** makes a network record every change it makes to itself, as it happens: it names the part that broke, repairs it, and keeps what it learned. That record unlocks the world's most valuable data.

[Pre-book ORMAS](/contact)

[Watch it heal itself](/black-box)

Five sectors. One question about data, asked five ways.

- AI Training — Is this run failing, and where?

- Regulated Finance — What changed, and can a validator verify it?

- Medical AI — Which site caused this, and can we show it?

- Data Obligation — What data is in here, and can we remove it?

- Defense & Safety-Critical — What did the system do to itself in the field?

Nothing in a standard network can answer any of them. Not because a standard network is opaque, but because no part of it can be named.

What that costs today

- $15M

  Estimated compute lost to restarts on one frontier run.

- 419

  Stops on that run in 54 days. One every three hours.

- 7%

  Of worldwide revenue. The EU fine ceiling, from August 2026.

- 92%

  Of approved medical AI can never be updated at all.

Published figures · one per sector

feature

The Proofreader

Which samples are damaging which component?

Attaches to an already-trained model without modifying it and returns a ranked list of labels judged incorrect, held separate from those that are merely difficult. Broken down by class, and by source where the corpus carries one.

Needs: A model file and a labelled sample

[Read the page →](/product/proofreader)

feature

The Warning Light

Is this run failing, and where?

Watches every component of a model while it trains and raises an alarm when one crosses its own baseline, naming the component rather than the run. The operator rolls back hundreds of steps instead of thousands.

Needs: One line around the training loop · Way in for AI Training

[Read the page →](/product/warning-light)

feature

The Diary

What did the model do to itself, and when?

Produces a signed, timestamped record of every modification made during training: the component, the diagnosis, the treatment, the step, and the limit it remained inside. Diffable against the last approved version.

Needs: Training on the architecture · Way in for Regulated Finance · Defense & Safety-Critical

[Read the page →](/product/diary)

feature

The Separator

Which part of this is the source, not the signal?

Separates what a model learned about the world from what it learned about where the data came from. One model ships and works anywhere, carrying a named removable part for each source and a record of the data that justified each.

Needs: Training on the architecture, with source labels

[Read the page →](/product/separator)

feature

Certified Deletion

What data is in here, and can we remove it?

Removes a named source's contribution and issues a signed certificate of exactly what was removed, with a bounded statement of what changed, and without retraining.

Needs: The Separator, plus a deletion policy · Way in for Data Obligation

[Read the page →](/product/certified-deletion)

feature

The Federated Node

Can we train together without pooling the data?

Runs inside an existing federation. Each party's contribution is recorded before the averaging step destroys it, so a round that drops six points can be attributed to a site.

Needs: A federation that already exists · Way in for Medical AI

[Read the page →](/product/federated-node)

feature

The Update Engine

What is this model allowed to change about itself?

Retrains a deployed model inside a limit declared and signed beforehand, and produces the evidence that every change stayed inside it. Built to the shape of a predetermined change control plan.

Needs: A limit agreed with the reviewer in advance

[Read the page →](/product/update-engine)

capability

ACCOUNT

One of the six capabilities the bounded chain makes possible.

Used by 6 of the seven features: The Warning Light, The Diary, The Separator, Certified Deletion, The Federated Node, The Update Engine.

Reaches AI Training · Regulated Finance · Medical AI · Data Obligation · Defense & Safety-Critical

[Read the page →](/technology)

capability

PROTECT

One of the six capabilities the bounded chain makes possible.

Used by 2 of the seven features: The Diary, The Update Engine.

Reaches Regulated Finance · Defense & Safety-Critical

[Read the page →](/technology)

capability

REPAIR

One of the six capabilities the bounded chain makes possible.

Used by 2 of the seven features: The Diary, The Update Engine.

Reaches Regulated Finance · Defense & Safety-Critical

[Read the page →](/technology)

capability

DETECT

One of the six capabilities the bounded chain makes possible.

Used by 4 of the seven features: The Proofreader, The Separator, Certified Deletion, The Federated Node.

Reaches Medical AI · Data Obligation

[Read the page →](/technology)

capability

ISOLATE

One of the six capabilities the bounded chain makes possible.

Used by 3 of the seven features: The Separator, Certified Deletion, The Federated Node.

Reaches Medical AI · Data Obligation

[Read the page →](/technology)

capability

SUPPRESS

One of the six capabilities the bounded chain makes possible.

Used by 3 of the seven features: The Separator, Certified Deletion, The Federated Node.

Reaches Medical AI · Data Obligation

[Read the page →](/technology)

> One unit of a neural network · six capabilities · seven features Drag to turn it

What replaces it

- Keep the run

  Names the component that failed, so it is repaired rather than the run rerun.

- No mystery

  When a run degrades, the part at fault is named.

- Proof, built in

  The evidence a regulator wants, written as it learns.

- It can change

  Every change capped and logged against a limit declared in advance.

Built in, not bolted on

Five sectors where the data is locked and worth the most

- [AI Training](/sectors/ai-training)

- [Regulated Finance](/sectors/regulated-finance)

- [Medical AI](/sectors/medical-ai)

- [Data Obligation](/sectors/data-obligation)

- [Defense & Safety-Critical](/sectors/defense-safety-critical)

**THE PRODUCT**

### ORMAS is one product, and its job is to make data usable that cannot be used today.

Training procedure is unaffected. Data, objective and resulting model are unchanged. What changes is the account that exists alongside the model. What the model took from each source is held as a named part that can be watched, repaired, audited, traced back to the data that produced it, and removed on instruction. That account is the condition on which data a custodian will not release today becomes data they can release.

What is delivered

01

#### The model

Deploys exactly as it would have done. Same architecture, same inference cost, no change to the serving path.

02

#### The named parts

What the model learned from each source, held as a discrete addressable object, bound to the record of the data that justified it, and removable.

03

#### The record

Every change training made: which component, at which step, under which diagnosis, by how much, and inside what declared limit. Signed, and diffable against the last approved version.

The seven features

ORMAS is one product. The seven below are its features, not seven separate products. Each is the same architecture asked to do a different job with data, and each is named after the job rather than the mechanism, because the person who buys it owns the data problem and not the mathematics underneath it. They are ordered by what each one asks of the licensee. The first needs a file and never touches the model. The last needs a limit agreed with a reviewer in advance. **Other combinations exist. These are the seven worth naming.**

The feature

What it does

What it requires

01

[The Proofreader](/product/proofreader)

Which samples are damaging which component?

Serves all five markets

Attaches to an already-trained model without modifying it and returns a ranked list of labels judged incorrect, held separate from those that are merely difficult. Broken down by class, and by source where the corpus carries one.

- DETECT

A model file and a labelled sample

02

[The Warning Light](/product/warning-light)

Is this run failing, and where?

AI Training

Watches every component of a model while it trains and raises an alarm when one crosses its own baseline, naming the component rather than the run. The operator rolls back hundreds of steps instead of thousands.

- ACCOUNT

One line around the training loop

03

[The Diary](/product/diary)

What did the model do to itself, and when?

Regulated Finance · Medical AI · Data Obligation · Defense & Safety-Critical

Produces a signed, timestamped record of every modification made during training: the component, the diagnosis, the treatment, the step, and the limit it remained inside. Diffable against the last approved version.

- ACCOUNT

- PROTECT

- REPAIR

Training on the architecture

04

[The Separator](/product/separator)

Which part of this is the source, not the signal?

Serves all five markets

Separates what a model learned about the world from what it learned about where the data came from. One model ships and works anywhere, carrying a named removable part for each source and a record of the data that justified each.

- ACCOUNT

- DETECT

- ISOLATE

- SUPPRESS

Training on the architecture, with source labels

05

[Certified Deletion](/product/certified-deletion)

What data is in here, and can we remove it?

Regulated Finance · Medical AI · Data Obligation

Removes a named source's contribution and issues a signed certificate of exactly what was removed, with a bounded statement of what changed, and without retraining.

- ACCOUNT

- DETECT

- ISOLATE

- SUPPRESS

The Separator, plus a deletion policy

06

[The Federated Node](/product/federated-node)

Can we train together without pooling the data?

Regulated Finance · Medical AI · Data Obligation

Runs inside an existing federation. Each party's contribution is recorded before the averaging step destroys it, so a round that drops six points can be attributed to a site.

- ACCOUNT

- DETECT

- ISOLATE

- SUPPRESS

A federation that already exists

07

[The Update Engine](/product/update-engine)

What is this model allowed to change about itself?

Regulated Finance · Medical AI · Defense & Safety-Critical

Retrains a deployed model inside a limit declared and signed beforehand, and produces the evidence that every change stayed inside it. Built to the shape of a predetermined change control plan.

- ACCOUNT

- PROTECT

- REPAIR

A limit agreed with the reviewer in advance

ORMAS is licensed as a single architecture, deployed on customer infrastructure. Scope is agreed per institution and written into the contract. One integration, one contract, and nothing priced per feature.

[See the product in full](/product)

**SEE IT**

### What that account looks like while it is being written.

Two networks of identical shape, trained on the same data with the same objective. At epoch 101 two convolutional stages are destroyed in both. One sits at chance level for the rest of the run and cannot say why; the other names both damaged components two steps later and recovers. Nothing computes here — every figure is read from the run's own telemetry, and the run identifier and seed are on screen.

The same network, twice. One sealed, one open.

Loading the archived run…

The archived run did not load.

Every figure on this screen is read from a file in the experiment archive, and that file did not arrive. Nothing here is computed in the browser, so there is nothing to show until it does.

**A neural network is damaged partway through training.** The version on the right names which parts broke, two steps later, and repairs itself. The one on the left cannot say anything about it, and never will.

- Field: Epoch

epoch 0 / 199

What each one can answer, at this epoch

The question Standard CNN ORMAS

Test accuracy · both arms, one axis

Correction ledger · written during training

##### The record

Every correction, with its component, diagnosis, step, magnitude and declared ceiling Step Component Diagnosis Magnitude Ceiling

[Open the live demo](/black-box)

The full console: four scenarios to replay, a two-minute narrated tour on desktop, and [the one run where this architecture loses](/black-box).

**THE FRONTIER**

### The field names two problems as unsolved. ORMAS has measured baselines against both.

For two years the leaders of the largest AI laboratories have said the same two things in public. Nobody can see what a trained network is doing inside itself. And no network can keep learning without erasing what it already knew. These are their words, not ours. None of the people or publications quoted is affiliated with Oxiedo.

Open problem 01 · Seeing inside

Dario Amodei · Anthropic

“People outside the field are often surprised and alarmed to learn that we do not understand how our own AI creations work.”

[The Urgency of Interpretability · April 2025](https://darioamodei.com/post/the-urgency-of-interpretability)

MIT Technology Review

“…nobody really understands what they are, how they work, or exactly what they can and can't do—not even the people who build them.”

[10 Breakthrough Technologies · January 2026](https://www.technologyreview.com/2026/01/12/1130003/mechanistic-interpretability-ai-research-models-2026-breakthrough-technologies/)

Dario Amodei · Anthropic

“We are thus in a race between interpretability and model intelligence.”

[The Urgency of Interpretability · April 2025](https://darioamodei.com/post/the-urgency-of-interpretability)

Open problem 02 · Learning without forgetting

Demis Hassabis · Google DeepMind

“…maybe we need one or two more big breakthroughs before we'll get to AGI. And I think they're along the lines of things like continual learning, better memory…”

[Big Technology · January 2026](https://www.bigtechnology.com/p/google-deepmind-ceo-demis-hassabis-946)

Dwarkesh Patel

“The fundamental problem is that LLMs don't get better over time the way a human would.”

[Why I don't think AGI is right around the corner · June 2025](https://www.dwarkesh.com/p/timelines-june-2025)

Google Research

“…‘catastrophic forgetting’, where learning new tasks sacrifices proficiency on old tasks.”

[Introducing Nested Learning · November 2025](https://research.google/blog/introducing-nested-learning-a-new-ml-paradigm-for-continual-learning/)

It sees itself

Not a microscope pointed at a finished model. The network reports on itself from inside, while it trains: a destroyed layer diagnosed within one epoch, both damaged components named two steps later.

It heals itself

+70.3 points recovered after a layer was destroyed mid-training. The standard network of the same size stayed at chance on every seed, permanently.

It keeps what it learned

94.6% of the first task retained after learning a second, with no replay buffer and no task identifier. A standard ResNet-18 kept 47.3%.

What comes next

Every result so far is on CIFAR. Transformer scale is the next measurement, and the entire remaining programme can be proven wrong in under thirty GPU-hours. That is the shot, stated with its odds.

**THE EVIDENCE**

### Four results, with every condition stated.

Each figure comes from a controlled experiment against a standard network matched for parameter count, data and training schedule.

[Read the full evidence](/technology)

80.3%

#### Recovery from total structural collapse

A layer was destroyed mid-training, on a network that had reached 85.1%. The standard network stayed at 10%, chance level, on every seed, permanently. ORMAS diagnosed the failure within one epoch and climbed back to 80.3%.

94.6%

#### Retained through a shift in the task

Trained on one task, then another, with no replay buffer and no task identifier. These are the conditions under which a deployed model is normally retrained. The standard network kept 47.3% of what it knew.

22,014

#### Stable where standard training failed outright

A fifty-node network at 30% label noise across 200 epochs. Standard training returned NaN and stopped. ORMAS stayed stable, and every one of those corrections is on the record with its component, magnitude and limit.

58.8%

#### Structure nobody designed

After the same task shift, the network answered combinations it had never been shown at 58.8%, against 25% chance. No modularity was built in. It organised its own internal structure out of the conflict between the two tasks.

383 controlled experiments across four architecture families. All results on CIFAR-10 and CIFAR-100. [The technology page](/technology) carries the full conditions, the error bars, and the one result that went against us.

A frontier run fails at 60 percent · current practice

The loss curve reports degradation around step 40,000. It cannot identify the component responsible, because no such quantity was ever computed. The run therefore restarts from the last clean checkpoint without a diagnosis, and the same compute is purchased twice. At frontier scale that is thousands of GPU-hours spent returning to a position already held.

The same run, trained under ORMAS

The network reports the component, the step at which it failed, the magnitude of the change, and the declared bound it remained inside. No second system estimates this after the fact. It is a quantity the network computed about itself during training, and reading it back carries no additional cost.

The same record answers the auditor asking which data shaped a decision and the supervisor asking what changed between two approved versions. It is also what a data owner reads before deciding whether their data may be trained on at all.

**WHAT LOCKED DATA COSTS**

### Data is the asset. The bill arrives because nothing can account for what a model did with it.

Every error signal in a neural network touches every parameter at once. That property is the source of a network's capability, and it is also why *which part of this model came from that data?* has no available answer. Data enters the model and the trail ends there. Below is what that costs, sector by sector, in the currency each one actually pays.

Market

Where it breaks

What it costs

[AI Training](/sectors/ai-training)

A run degrades silently. The loss curve moves only once the damage is thousands of steps old, so recovery means discarding everything since the last checkpoint.

$16,000–$24,000

per two-hour recovery

[Medical AI](/sectors/medical-ai)

An audit asks what the training changed. No record of it exists, because no architecture in clinical use produces one. The model therefore goes back.

12–36 months

added to market entry

[Regulated Finance](/sectors/regulated-finance)

Under SR 26-2 a model that cannot be audited component by component will not clear validation, and an unvalidated model does not reach production.

The programme

written off in full

[Data Obligation](/sectors/data-obligation)

A data licence terminates. The clause covers anything trained on it, and retraining from scratch is the only remedy that satisfies the clause.

$100,000–$500,000

per deletion request

[Defense & Safety-Critical](/sectors/defense-safety-critical)

A system modifies itself in the field and cannot account for it afterwards. That is not a finding a programme remediates.

The deployment

ended, not remediated

Every figure above has the same cause. Data goes into a model and stops being something anyone can point at. ORMAS keeps it addressable from the first step to the last, and the bill stops arriving.

**THE COMPARISON**

### Every comparable method reconstructs what happened after the fact. ORMAS records it as it occurs.

Ask a finished model what it learned from a particular source of data and every tool available today works the same way. It examines the finished system and produces its best estimate of what must have occurred. The estimate is frequently a good one. It is also unverifiable, and an estimate is not something a data owner accepts or a regulator files.

What follows is a different class of answer altogether, written while the work is happening, by the system doing the work.

The question the market is asking

How it is answered today

With ORMAS

What failed, and when?

A performance chart. It moves only after the damage is done, and it cannot describe anything smaller than the whole run.

The component, the step it happened on, and how severe it was.

Is that a finding, or an opinion?

An estimate, produced afterwards by a separate tool that can itself be wrong.

A record, written at the moment of the change, by the system that made it.

Which data caused the damage?

Current methods cannot tell bad data apart from genuinely difficult data, so they discard both, and the difficult examples were the valuable half.

The two are told apart, and neither is discarded.

Can one source be removed later?

Only by retraining the model from the beginning, at six figures each time the request is made.

What the model built from that source is a named, removable part. Remove it, and issue a certificate of what was removed.

What does accountability cost to run?

A second model, trained and maintained alongside the first.

Nothing. One model deploys, at the same size and inference cost as the model that would have shipped regardless.

Will an auditor accept it?

A written account of what the team intended to do.

Evidence of what the training actually did, signed and unalterable.

What is being compared

SHAP · LIME · Integrated Gradients

Explain why a finished model made one particular prediction. These answer a different question well. They were never built to observe a model being trained, and do not claim to be.

Weights & Biases · MLflow

Excellent at recording what happened to a training run. They cannot record what happened inside the model.

Co-teaching · DivideMix

Run a second model to get a second opinion, then use it to decide which data to throw away.

Retraining from scratch

The only method that genuinely removes a data source from a model. Six figures, per request, and at scale it is not done at all.

None of this is a report assembled afterwards. The system writes it while the work is happening, and a result produced that way can be verified rather than taken on assertion.

**THE CATEGORY**

### This market splits on one question: when was the record written?

The distinction above is not only a technical one. It divides a market that is already funded. AI model-risk management is bought today from ModelOp, Credo AI, Fiddler AI, Arthur AI and Robust Intelligence, and all five sit on the near side of the line: they begin work after the run has finished, on a model that has already made up its mind. They do that job well, and they are complements rather than casualties — none of them claims to account for what training did to the model, and none was built to be present while it happened. ORMAS is the other side of the line.

The budget

Already allocated. Nothing here asks an institution to open a new line. It changes what the existing one is able to buy.

The question

An evaluation that asked which tool explains a finished model best now has a prior question to settle: whether a record of the training itself can be produced at all.

The answer

A method that starts after the run has ended cannot produce that record, however well it is built. It is a property of when the work happens, not a verdict on how well it is done.

**FIVE MARKETS · ONE PRODUCT**

### Every sector that holds data has this problem. These five are where solving it is worth the most.

Data is the common thread. A hospital calls it the site, a bank calls it the region, a biotech calls it the batch, an AI lab calls it the corpus, and a data controller calls it the licensed source. Underneath, the question is identical in all five. What did the model take from this, and can that be proven? These are not five products and not five solutions. They are the five sectors where the answer is worth the most money today. Every other sector that holds data is reached by the same licence.

#### AI Training

SCALE

Is this run failing, and where?

The Warning Light supplies that signal: per component, every step, while the run is still recoverable.

Answered by **The Warning Light** · 3 of 7 features in scope

[Read the market](/sectors/ai-training)

#### Regulated Finance

SECTOR

What changed, and can a validator verify it?

Where attribution is available per component, validation can be conducted the same way. The record answers SR 26-2's validation and change-control expectations with evidence rather than with a memo.

Answered by **The Diary** · 6 of 7 features in scope

[Read the market](/sectors/regulated-finance)

#### Medical AI

SECTOR

Which site caused this, and can we show it?

Each site's contribution is recorded before the averaging step destroys it. When a round drops six points, the record says which site, and on what evidence.

Answered by **The Federated Node** · 6 of 7 features in scope

[Read the market](/sectors/medical-ai)

#### Data Obligation

OBLIGATION

What data is in here, and can we remove it?

Certified Deletion routes the memorisable contribution into a named, removable structure, and hands the requester a signed certificate.

Answered by **Certified Deletion** · 5 of 7 features in scope

[Read the market](/sectors/data-obligation)

#### Defense & Safety-Critical

SECTOR

What did the system do to itself in the field?

Degrading to 80.3% rather than collapsing permanently to 10% is a different safety category, and every modification the system made to itself is bounded, timestamped and reviewable afterwards.

Answered by **The Diary** · 4 of 7 features in scope

[Read the market](/sectors/defense-safety-critical)

[See all five markets →](/sectors)

**WHY NOW**

### Accounting for what a model did with its training data is becoming statutory, with dates attached.

Three separate regimes now require of a trained model something standard architectures cannot produce. Each one asks for evidence of what the model did with its data, attributable to a named part. The institutions able to generate that record set the format the rest of the market gets measured against, and they are the ones data custodians will release to first.

EU AI Act · Article 12

High-risk AI systems must keep automatic, immutable records of events across the system lifecycle. ORMAS emits that record as a physical property of training rather than as a logging layer bolted alongside it.

SR 26-2 · SS1/23

The interagency guidance that replaced SR 11-7 in April 2026 keeps the disciplines that matter: model inventory, independent validation and documented change control. A model that cannot be audited component by component cannot be validated, and a model that is not validated is not deployed.

GDPR · Article 17

The right to erasure is being enforced against trained models, not only against databases. Compliance vendors have already named the category they need (unlearning-ready architectures) ahead of any supply existing.

**PRE-BOOKING**

### Pre-booking is the window in which the product is still shaped around the first deployments.

There is no price list. The figure is agreed per institution and written into the contract, and pre-booking fixes those terms ahead of general availability. There is no limit on how many are accepted and no countdown attached to it. The reason to move early is that the requirements are still open, not that the slots are scarce.

Early partners get flat-rate, enterprise-wide terms, their own compliance workflow built into the baseline architecture, and direct engineering access rather than an account manager.

[Pre-book a deployment](/contact?intent=pre-book#pre-book)
