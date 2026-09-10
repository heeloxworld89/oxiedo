# Medical AI: PCCP evidence for models that update

- **URL:** `/sectors/medical-ai`
- **Page title:** Medical AI: PCCP evidence for models that update — Oxiedo
- **Meta description:** Which site caused this, and can we show it? How ORMAS applies in medical ai: the failures, the regulation, the buyer, and the limits.

---
MARKET

## Medical AI

- **The question** — Which site caused this, and can we show it?
- **What forces it** — FDA PCCP · final guidance August 2025
- **The number** — 1,451 — AI-enabled devices authorised by end-2025 — Up from 950 in August 2024. The deployed clinical AI population is large and growing quickly.

Which site caused this, and can we show it?

Regulators opened a door for models that change after approval. Almost nobody can walk through it, because walking through it requires evidence of what the training did, and no clinical architecture produces any.

Access is granted on auditability, not on accuracy. It has never been granted on accuracy.

The most common misreading in this market is that a better model opens the door. It does not. The gate is whether an institution can account, per decision and per change, for what the model did and why. Every current architecture answers that after the fact, by a separate procedure that can itself be wrong. The comparison that matters is what can be filed, not what can be scored.

**WHERE THIS MARKET IS**

A clinical model is a clinician who trained brilliantly and then had their memory frozen on graduation day. It will never learn anything from the institution, because teaching it something about the local patient population would cost it something it knows about everyone else's. That is not a policy choice. It is how the machinery works.

The scale of the deployed population is now substantial: cumulative FDA authorisations of AI-enabled devices passed 1,250 by July 2025 and stood at 1,451 by the end of that year, up from 950 in August 2024. The scale of the population permitted to change after authorisation is not. Roughly 8% of new AI device authorisations in the 2024–25 window included an authorised Predetermined Change Control Plan. The overwhelming majority are locked models with no ability to learn after launch.

The FDA finalised its PCCP guidance in August 2025, and the mechanism is genuinely permissive: a sponsor states in advance exactly what the algorithm may change, how it will be validated, and how the change will be controlled, and may then modify the device without a new marketing submission. The constraint is not regulatory appetite. It is that producing that evidence requires an architecture that knows what it changed, and standard architectures do not.

> Six hospitals train one shared model together. When its accuracy drops, ORMAS names which hospital caused it, two rounds before the drop is even visible in the shared result.

**WHAT IT COSTS**

### The numbers this market already publishes about itself.

1,451

AI-enabled devices authorised by end-2025

Up from 950 in August 2024. The deployed clinical AI population is large and growing quickly.

~8%

of new authorisations carrying a PCCP

Across the 2024–25 window. The rest are locked at authorisation and cannot be updated without a new submission.

94.6%

prior-task retention with no replay buffer

Against 47.3% for a parameter-matched baseline, under sequential shift with no task identifier. This is the mechanism behind the freeze. Measured on CIFAR-10/100.

Mar 2029

EHDS secondary-use provisions apply

Genetic and clinical-trial data from March 2031. Institutions select training infrastructure roughly three years ahead, which places that decision now.

**WHAT BREAKS**

### Four things that go wrong, and why none of them is a tooling problem.

1. 01

  #### The model is frozen because updating it is not safe

  Training on the local population degrades what the model knew about the populations it was validated on. Without a mechanism that separates the two, any local update is a silent trade against the evidence base the authorisation rests on. Freezing is the conservative and correct response to that, and it is why deployed models decay.

2. 02

  #### Site shift arrives with no instrument to measure it

  A model validated at one institution is deployed at another and performance drops. Nobody can say how much of the drop is genuinely different patients and how much is the model having learned the first site's scanner, reconstruction kernel, protocol or case mix. The deployment is then abandoned or accepted on faith, and neither is a decision anyone wants to defend.

3. 03

  #### Federated averaging destroys attribution by construction

  Several institutions train a shared model without pooling data. Round forty-one drops six points. No participant can identify which site caused it, because averaging is a lossy operation performed before anybody looks. The coordinator's options are to roll back or to guess.

4. 04

  #### The largest cost is invisible and uncounted

  Nobody counts the deployments never attempted because no one could write a defensible change-control plan. That population does not appear in any market figure, because every published number measures devices that got past the gate.

**WHAT IS USED TODAY**

### The current answers, and what each one genuinely does.

These are not strawmen. Each is used because it works at the job it was built for. The question is what remains unanswered afterwards.

#### Locking the model at authorisation

The prevailing approach, and a coherent one given the constraints. It converts an unmanageable risk into a managed decay curve, and the decay is invisible until an outcome review finds it.

#### Post-hoc explainability for the submission

Saliency maps and attribution methods included in a submission dossier. They explain individual predictions of a finished model, which is a different question from what the training did, and they are reconstructions produced by a separate procedure that can itself be wrong.

#### Domain adaptation and harmonisation

Real techniques that genuinely reduce site effects, and worth using. What they leave behind is one model and a hope. Nothing is named, nothing is removable, and no reviewer can be shown which part of the model was the site.

#### A validation report asserting generalisation

The current artefact. It holds until the scanner is replaced, the protocol changes, the population shifts, or a new site is added, and there is no instrument that says which of those happened.

**WHAT ORMAS DOES**

### Each site's contribution is recorded before the averaging step destroys it. When a round drops six points, the record says which site, and on what evidence.

1. 01

  #### Retraining inside a limit declared in advance

  A PCCP asks three questions: what types of modification may the algorithm undergo, how is it validated that it stayed inside them, and how is the change controlled. The bound table answers the first with eight named modification types and their individual ceilings. The record answers the second, per modification, as training happens. The diff against the approved version answers the third.

2. 02

  #### The site becomes a named, removable object

  What the model learned about each contributing institution is separated from what it learned about the disease, bound to a record of exactly which data justified it, and removable. You deploy a source-invariant model plus a named component per site plus the evidence tying each one to its data.

3. 03

  #### Attribution before the averaging step

  In a federation, each participant runs the separation locally and only the shared component aggregates. Per-party attribution is recorded before the aggregation destroys it, so when round forty-one drops six points, the record says which site, and on what evidence.

4. 04

  #### Evidence of what training did, not a description of it

  Node 1, diagnosed oscillating at step 39,553, magnitude 7.674, treated with bounded dampening at 0.10 of the weight norm, conservation residual 0.0, tensor attached. A reviewer can audit a document about a process. They can verify a log of what the process did.

**THE OBLIGATIONS**

### What is required, and from when.

#### FDA PCCP · final guidance August 2025

Allows authorised modification of an AI-enabled device without a new marketing submission, provided the modifications, their validation methodology and their impact assessment are declared in advance. Roughly 8% of new authorisations currently carry one.

#### EU AI Act · Article 12, Annex I from 2 August 2028

Medical devices are high-risk AI systems embedded in regulated products. Automatic event recording across the system lifetime is required. Under the AI Omnibus, in force 27 July 2026, the Annex I transition runs to 2 August 2028.

#### European Health Data Space · Regulation (EU) 2025/327

Secondary-use provisions apply from 25 March 2029, extending to genetic and clinical-trial data in March 2031. Results of secondary use must be published in anonymised form within eighteen months, and non-compliance can mean exclusion from data access for up to five years.

**APPLICATIONS IN SCOPE**

### 6 of the seven apply here. This is the one to start with.

Lead application

#### [The Federated Node](/product/federated-node)

Can we train together without pooling the data?

Runs inside an existing federation. Each party's contribution is recorded before the averaging step destroys it, so a round that drops six points can be attributed to a site.

What it asks for A federation that already exists

- [The Proofreader](/product/proofreader)Which samples are damaging which component?

- [The Diary](/product/diary)What did the model do to itself, and when?

- [The Separator](/product/separator)Which part of this is the source, not the signal?

- [The Update Engine](/product/update-engine)What is this model allowed to change about itself?

- [Certified Deletion](/product/certified-deletion)What data is in here, and can I remove it?

**THE OBJECTIONS**

### Four objections, answered before they are raised.

A repeated objection is a gap in what we have explained, not a nuisance. These are the four we expect in this market, in the words a buyer actually uses.

01 — Nobody replaces their training stack to get a report.

Nobody should, and the entry point does not ask for it. The first engagement attaches to an existing checkpoint, changes nothing about it, and runs on a selected sample. What it returns, which labels are wrong broken down by contributing site, is useful on its own and requires no architectural decision at all.

02 — Has a regulator ever accepted this?

No. Nobody has filed anything, and our mapping onto the PCCP framework is our own reading of published guidance made by people who have never submitted one. We would rather state that than let it be discovered. What we can say is that the framework asks three questions, what may change, how it is validated and how it is controlled, and that the bound table, the record and the diff are direct answers to those three.

03 — Our data cannot leave the institution, and our IG office will ask about the telemetry.

It runs inside the customer environment; there is no hosted tier and nothing egresses. The sharper question an information governance office will ask is whether the telemetry itself is non-identifying, and the honest answer is that a formal privacy analysis has not been completed. We would want that done before an engagement, not after.

04 — This has only ever been run on CIFAR-10.

Every result, without exception. No clinical, biological or patient data has ever touched this system, and that is the single largest gap in the programme rather than a detail. It is also why the first conversations we want are with consortia and discovery groups, where a real dataset can be worked on as a research partnership rather than a purchase.

**WHO BUYS IT**

### Three different people, in a deliberate order

- **Sits in** — A consortium coordinator or lead-site research informatics first. A VP Research or Head of Platform in discovery second. A Head of Regulatory Affairs or the chair of an AI governance committee last.
- **Budget** — Grant and project-scoped for consortia. R&D for discovery. Governance and model risk for regulated clinical, which is the budget line currently being created while capital budgets are cut.
- **Trigger** — A federated round nobody can explain, an eighteen-month assay history the model no longer represents, or a governance committee that rejected a model and released the budget to rebuild it.

Round forty-one dropped six points and we cannot tell which site.

Three different people, in a deliberate order

**MAKING THE CASE**

### You are not the only person who has to say yes.

Nothing at this size is bought by one person. These are the lines for the other four, in the terms each of them is actually measured on.

Head of regulatory affairs

Something that maps onto a submission

A declared modification set with per-type ceilings, a per-modification record emitted during training, and a diff against the approved version. Those are the three things a change control plan asks for.

The AI governance committee

To approve without guessing

They stop reading an assertion that the process was followed and start reading evidence of what the process did, with the tensor attached.

Research informatics

To know which site caused it

Attribution recorded per party before the aggregation step destroys it. When a federated round drops six points, the record names the site.

Information governance

Data residency and a privacy position

On-premise, no egress. And we will say plainly that the formal privacy analysis of the telemetry is outstanding rather than claim it is done.

**WHAT WE CAN SHOW YOU**

### No customer references. An unusual amount of everything else.

Nobody has deployed this, and we are not going to imply otherwise. What we can put in front of an evaluation is the following, and most of it needs no contract first.

- The manuscript, the supplementary material and the reproducibility checklist

- The bound table: eight modification types, ceilings, and observed frequencies across 67 runs

- A worked modification record, in the format a reviewer would receive

- A label audit on a nominated dataset, returning results broken down by contributing site

- Evaluation access for their own team, under a short agreement, before any contract exists

Not a fit where

- Anyone who needs a cleared reference deployment today. There is not one.

- Programmes where the model is genuinely static and the population genuinely is not shifting. Where freezing works, freezing is cheaper.

- Discovery groups working at very small n. Every result is on tens of thousands of examples, and whether the signal survives at thirty compounds is untested, and we would run that sweep before a meeting, not after.

**WHAT WE DO NOT CLAIM**

### The boundaries, stated rather than discovered.

In markets whose central complaint is that vendors overstate their approximations, stating our own limit precisely is the position rather than a caveat on it.

- No clinical, biological or patient data has ever touched this system. Every result is CIFAR-10 or CIFAR-100, and this is the binding constraint on the entire programme.

- No regulator has seen this architecture. The mapping onto the PCCP framework is our own reading of published guidance, made by people who have never filed one.

- Every result is on tens of thousands of examples. A discovery assay batch is thirty to forty compounds, and whether the signal survives at that scale is untested.

- Nothing here is autonomous field adaptation. Every modification happens during supervised retraining, under review, before release.

Sources

- [FDA · PCCP marketing submission recommendations](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/marketing-submission-recommendations-predetermined-change-control-plan-artificial-intelligence)

- [AI in FDA-authorized devices · taxonomy across 1,016 authorizations (npj Digital Medicine)](https://www.nature.com/articles/s41746-025-01800-1)

- [FDA experience with Predetermined Change Control Plans](https://www.medrxiv.org/content/10.1101/2025.08.26.25334477.full.pdf)

- [European Health Data Space · Regulation (EU) 2025/327](https://www.ey.com/en_gr/technical/tax/tax-alerts/regulation-2025-327-establishing-ehds)

Figures attributed to the ORMAS experiment programme are measured on CIFAR-10 and CIFAR-100 across 383 controlled runs, and are labelled as such wherever they appear.[The paper](/technology) carries the conditions for each.

[Talk to us about this market](/contact)

[See the product](/product)

### Working in Medical AI?

Every engagement starts with one specific problem: a run that died, an audit question that had no answer, a dataset nobody can vouch for.

We reply within a few days. Every message is read by a person.

#### Start a conversation

Describe what has to be visible inside the models, and we will say plainly whether this is the right thing for it.

Useful to bring

- What is being trained and what has to be proven about it

- Anything already tried

[Send a message](/contact?intent=other#other)
