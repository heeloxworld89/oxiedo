# Regulated finance: model risk under SR 26-2

- **URL:** `/sectors/regulated-finance`
- **Page title:** Regulated finance: model risk under SR 26-2 — Oxiedo
- **Meta description:** What changed, and can a validator verify it? How ORMAS applies in regulated finance: the failures, the regulation, the buyer, and the limits.

---
MARKET

## Regulated Finance

- **The question** — What changed, and can a validator verify it?
- **What forces it** — SR 26-2 · from 17 April 2026
- **The number** — 47.3%of prior-regime knowledge surviving a retrain — A parameter-matched standard network, retrained on a second task with no replay buffer and no task identifier. ORMAS retained 94.6% under identical conditions. Measured on CIFAR-10/100, three seeds.

What changed, and can a validator verify it?

Every quantitative firm is already paying for catastrophic forgetting in cash, and booking it as a cost of doing business rather than as the architectural defect it is.

The question a validator is asking is not whether the model is good. It is whether anything the model team told them can be checked.

Model risk functions are not evaluating performance; the model team already did that. They are evaluating whether the assertions in the documentation can be independently verified. Every incumbent answer produces a document written after the fact by the party under review. Compare on verifiability and the field narrows to one.

**WHERE THIS MARKET IS**

A model is trained through one market regime. The regime turns. The model degrades at exactly the moment its output matters most, so the firm retrains on the new regime, and the retraining quietly destroys what the model knew about the old one. Then the old regime returns.

The industry response is to retrain on a schedule and absorb the difference. That is a rational response to a constraint nobody has been able to remove, and it is worth being precise about what the constraint is: it is not a tuning problem, and no amount of hyperparameter search resolves it. It is catastrophic forgetting, and it is a property of how gradient descent updates a shared parameter space.

Meanwhile the supervisory picture changed. On 17 April 2026 the Federal Reserve, FDIC and OCC jointly issued SR 26-2, superseding the SR 11-7 framework that had governed model risk management since 2011. The core disciplines survive — inventory, independent validation, board-level governance, documented change control — but expectations are now explicitly scaled to materiality and to each institution's own model risk profile.

> Teach a model about 2024 and it quietly forgets 2021. ORMAS keeps 94.6% of the old behaviour where an ordinary model keeps 47.3% — and a validator can check that claim component by component.

**WHAT IT COSTS**

### The numbers this market already publishes about itself.

47.3%

of prior-regime knowledge surviving a retrain

A parameter-matched standard network, retrained on a second task with no replay buffer and no task identifier. ORMAS retained 94.6% under identical conditions. Measured on CIFAR-10/100, three seeds.

4.5×

reduction in final-epoch weight variance

0.19 against 0.86 for the parameter-matched baseline, with a stability characterisation attached rather than asserted. Measured on CIFAR-10/100.

Apr 2026

SR 26-2 supersedes SR 11-7

Interagency guidance from the Federal Reserve, FDIC and OCC. Validation, inventory and change-control obligations are retained and re-scoped to materiality.

**WHAT BREAKS**

### Four things that go wrong, and why none of them is a tooling problem.

1. 01

  #### The retrain is the loss event

  Every scheduled retrain on new data degrades performance on the regimes already learned. The firm is not choosing between a stale model and a current one; it is choosing which regime to be wrong about. Over a full cycle the same knowledge is bought more than once.

2. 02

  #### A model that cannot be audited per component cannot be validated

  Independent validation requires that a reviewer be able to interrogate what a model does and why. When the smallest addressable unit is the whole model, the validator is reduced to testing inputs against outputs and reading a document about the process. That is assessment, not verification.

3. 03

  #### The validator is adversarial by design, and currently has no instrument

  Model risk functions are measured on finding what the model team missed. They are the least persuadable audience in the institution and the correct one to design for. What they lack is not diligence but any mechanism for checking a claim about what a model changed during training.

4. 04

  #### A failed validation writes off the whole programme

  A model that does not clear validation does not deploy. The development cost, the data work and the opportunity are written off together, and the second attempt starts with a governance function that has already said no once.

**WHAT IS USED TODAY**

### The current answers, and what each one genuinely does.

These are not strawmen. Each is used because it works at the job it was built for. The question is what remains unanswered afterwards.

#### Rolling-window retraining

The standard practice, and a deliberate trade: recency is bought by discarding history. It works, and it structurally guarantees that the institution keeps paying for knowledge it has already acquired.

#### Champion–challenger frameworks

Compares two models' outputs to decide which to promote. It answers which model performs better; it says nothing about what changed inside either of them, which is the question a validator asks.

#### Post-hoc explainability

SHAP and its relatives explain individual predictions of a finished model. Genuinely useful for adverse-action reasoning and feature attribution. They operate on a trained artefact, so they cannot describe the training process that produced it.

#### Model documentation and validation memos

The current answer to a change-control obligation is a written account of intentions, produced after the fact by the team whose work is under review. A reviewer can audit that document. They cannot verify it against anything.

**WHAT ORMAS DOES**

### Where attribution is available per component, validation can be conducted the same way. The record answers SR 26-2's validation and change-control expectations with evidence rather than with a memo.

1. 01

  #### Retention without a replay buffer

  Under sequential task shift with no replay buffer and no task identifier, the architecture retained 94.6% of prior-task performance against 47.3% for a parameter-matched baseline. The mechanism is gradient conflict resolution: competing objectives are separated into distinct components rather than averaged into shared weights.

2. 02

  #### A record the validator can verify instead of read

  Every modification made during training is emitted with its component, diagnosis, step, magnitude, the declared limit it stayed inside, and the residual left after the conservation constraint. Signed, hashed, and comparable line by line against the version last approved.

3. 03

  #### A declared bound table, before the run rather than after it

  Eight named modification types, each with its own ceiling expressed as a fraction of the component's weight, each with its observed frequency across the archived runs. A reviewer is handed the declaration and the empirical distribution together.

4. 04

  #### Variance as a governance property

  Final-epoch weight variance of 0.19 against 0.86 is a 4.5× reduction with a stability argument attached. For a model risk function, lower parameter volatility with a characterisation of why is a better artefact than a validation memo asserting the same thing.

**THE OBLIGATIONS**

### What is required, and from when.

#### SR 26-2 · from 17 April 2026

Interagency supervisory guidance on model risk management from the Federal Reserve, FDIC and OCC, superseding SR 11-7. Retains model inventory, independent validation, and documented governance, with expectations scaled to materiality and institutional risk profile.

#### SS1/23 · Bank of England

The UK model risk management principles for banks, covering identification, governance, development, validation and monitoring. The same structural requirement: a change to a model must be evidenced, not described.

#### EU AI Act · Article 12

Requires high-risk systems to allow automatic recording of events across their lifetime, with deployers retaining logs for at least six months under Article 26. Credit scoring and creditworthiness assessment fall within Annex III. Under the AI Omnibus, in force 27 July 2026, Annex III obligations apply from 2 December 2027.

**APPLICATIONS IN SCOPE**

### 6 of the seven apply here. This is the one to start with.

Lead application

#### [The Diary](/product/diary)

What did the model do to itself, and when?

Produces a signed, timestamped record of every modification made during training: the component, the diagnosis, the treatment, the step, and the limit it remained inside. Diffable against the last approved version.

What it asks for Training on the architecture

- [The Proofreader](/product/proofreader)Which samples are damaging which component?

- [The Separator](/product/separator)Which part of this is the source, not the signal?

- [The Update Engine](/product/update-engine)What is this model allowed to change about itself?

- [Certified Deletion](/product/certified-deletion)What data is in here, and can I remove it?

- [The Federated Node](/product/federated-node)Can we train together without pooling the data?

**THE OBJECTIONS**

### Four objections, answered before they are raised.

A repeated objection is a gap in what we have explained, not a nuisance. These are the four we expect in this market, in the words a buyer actually uses.

01 — Changing our training architecture is a two-year programme.

For the full deployment, that is a fair estimate and we will not pretend otherwise. It is also not where anyone starts. The entry point attaches to an already-trained model, does not modify it, and runs on a selected sample. The first engagement therefore needs no change to the stack, no security review of a training pipeline, and no architecture decision.

02 — SR 26-2 is more proportionate than SR 11-7. Does this still matter?

Proportionality changed how expectations scale; it did not remove independent validation, model inventory or documented change control. For a material model the disciplines are intact, and the practical effect of a more tailored regime is that the burden of proof shifts onto the institution to justify its own scoping — which is easier to do with evidence than with a memo.

03 — Our models are gradient-boosted trees, not neural networks.

Then this is not relevant today, and that is a straight answer rather than a soft one. The mechanism is a property of how a neural network trains. Where it becomes relevant is the part of the book moving to deep models, which in most institutions is the part with the least mature governance and the most supervisory attention.

04 — Everything you have shown me is CIFAR-10.

Yes. No market data has touched this system. The relevant point is that regime-change behaviour can be demonstrated on public price history without anyone's permission, which makes this the cheapest market in which to produce a non-benchmark result. We would rather run that jointly, on the institution's own definition of a regime, than assert it.

**WHO BUYS IT**

### The validator, not the quant and not the CTO

- **Sits in** — Model risk management, or an independent validation function reporting outside the model development line.
- **Budget** — Governance and model risk. Being expanded, in most institutions, while other budgets are not.
- **Trigger** — A validation that returned findings, or a supervisory examination that asked for evidence of change control.

I can see what the model does. I cannot verify anything the team tells me about how it got there.

The validator, not the quant and not the CTO

**MAKING THE CASE**

### You are not the only person who has to say yes.

Nothing at this size is bought by one person. These are the lines for the other four, in the terms each of them is actually measured on.

Head of model risk

Something a validator can test

A signed, per-modification record with a declared bound table, diffable against the version last approved. Not a memo about the process, but the record of it.

The validator

To be able to falsify a claim

Eight named modification types with individual ceilings and their observed frequencies across 67 runs. They are handed the declaration and the empirical distribution together.

Head of research

To know it does not cost performance

94.6% prior-regime retention against 47.3%, and 4.5× lower final-epoch weight variance, with a stability characterisation attached.

Technology risk

Data residency

On-premise or in the customer environment. Position, client and trading data never move.

**WHAT WE CAN SHOW YOU**

### No customer references. An unusual amount of everything else.

Nobody has deployed this, and we are not going to imply otherwise. What we can put in front of an evaluation is the following, and most of it needs no contract first.

- The bound table: eight modification types, individual ceilings, observed frequencies

- A sample modification record, signed and hashed, with the diff format

- The manuscript and 383 reproducible experiment runs

- A regime-change demonstration on public price history, run on the institution's own definition of a regime

- The Artifact Survival Clause: the records outlive the contract, with a frozen reader retained permanently

Not a fit where

- Institutions whose material models are entirely classical. The mechanism is specific to neural network training.

- Anyone who needs a validated deployment reference today. There is not one, and we will not manufacture the impression of one.

- Teams looking for an accuracy uplift. The claim is verifiability; the accuracy comparison is evidence that the mechanism works, not a selling point.

**WHAT WE DO NOT CLAIM**

### The boundaries, stated rather than discovered.

In markets whose central complaint is that vendors overstate their approximations, stating our own limit precisely is the position rather than a caveat on it.

- Non-stationarity is not the same as sequential task shift. The experiment has clean, labelled task boundaries; markets do not. Regime boundaries are latent and contested, and "conflict fired" has not been established to be the same event as "the regime turned".

- Every result is on CIFAR-10/100. No market data has been used, and the equivalent result on public price history has not yet been produced.

- Backtest discipline decides credibility in this market before mechanism does. A clean protocol with a dull architecture beats the reverse.

Sources

- [Federal Reserve · SR 26-2 supervisory letter](https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm)

- [SR 11-7 vs SR 26-2 · what changed](https://www.sia-partners.com/en/insights/publications/sr-11-7-vs-sr-26-2-model-risk-management-modernization)

- [EU AI Act · Article 12, record-keeping](https://artificialintelligenceact.eu/article/12/)

Figures attributed to the ORMAS experiment programme are measured on CIFAR-10 and CIFAR-100 across 383 controlled runs, and are labelled as such wherever they appear.[The paper](/technology) carries the conditions for each.

[Talk to us about this market](/contact)

[See the product](/product)

### Working in Regulated Finance?

Every engagement starts with one specific problem: a run that died, an audit question that had no answer, a dataset nobody can vouch for.

We reply within a few days. Every message is read by a person.

#### Start a conversation

Describe what has to be visible inside the models, and we will say plainly whether this is the right thing for it.

Useful to bring

- What is being trained and what has to be proven about it

- Anything already tried

[Send a message](/contact?intent=other#other)
