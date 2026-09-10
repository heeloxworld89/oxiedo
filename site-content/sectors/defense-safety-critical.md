# Safety-critical AI: accounting for self-change

- **URL:** `/sectors/defense-safety-critical`
- **Page title:** Safety-critical AI: accounting for self-change — Oxiedo
- **Meta description:** What did the system do to itself in the field? How ORMAS applies in defense & safety-critical: the failures, the regulation, the buyer, and the limits.

---
MARKET

## Defense & Safety-Critical

- **The question** — What did the system do to itself in the field?
- **What forces it** — DoD test and evaluation · under active revision
- **The number** — 10.0%where a standard network sits after structural damage — Chance level, on every independent initialisation, permanently. A zeroed layer produces constant activations and exactly one-over-classes accuracy regardless of seed. Measured on CIFAR-10.

What did the system do to itself in the field?

An autonomous system meets conditions that degrade at exactly the moment it matters most, and the question after an incident is never what the model predicted. It is what the system did to itself, and whether anyone can say.

The assurance question is not whether the system performs. It is whether anything it did to itself can be reconstructed afterwards by someone who was not there.

A test campaign that shows a system failed under a condition has established one data point. A campaign that shows why it failed has established something that generalises to conditions nobody tested. That difference is the whole value of an assurance case, and it is unavailable when the smallest observable unit is the system output.

**WHERE THIS MARKET IS**

Jamming, spoofing, sensor damage, radiation-induced corruption. The data stops resembling the training distribution precisely when the system is doing the thing it was built for, and the prevailing engineering answer is to train harder on simulated corruption and hope the real thing resembles the simulation.

The assurance apparatus is being built now and is visibly incomplete. The Department of Defense CDAO's own AI assurance page remains a placeholder. An updated DOT&E manual identifies tracking of system safety and unexpected behaviour for AI-enabled and autonomous systems as a major shift under assessment. In March 2026 the Pentagon and intelligence community went to industry asking for an evaluation harness to standardise AI system testing, and in January 2026 the Army contracted specifically to assess AI's unpredictable behaviours.

What those procurements have in common is that they are all asking for the same missing thing: a way to see what an autonomous system did internally, under stress, in a form somebody can review afterwards. Testing under denied, degraded, intermittent and limited conditions is now an explicit requirement, and the instrument for recording what happens inside the model during those conditions does not exist.

> As conditions degrade, whether by jamming, spoofing or a failing sensor, a bounded model keeps 80.3% of what it could do, where a frozen one collapses to 10%. Measured during training; the test-time case is named as not yet run.

**WHAT IT COSTS**

### The numbers this market already publishes about itself.

10.0%

where a standard network sits after structural damage

Chance level, on every independent initialisation, permanently. A zeroed layer produces constant activations and exactly one-over-classes accuracy regardless of seed. Measured on CIFAR-10.

80.3%

recovery from the same damage

Diagnosed within one epoch and repaired through 85 individually attributed structural corrections. A system that degrades to eighty rather than ten is in a different safety category.

70.8%

recovery from simultaneous full-hierarchy damage

Every convolutional stage zeroed at once, not one layer. The baseline collapses permanently. Measured on CIFAR-10.

−1.0 pp

against baseline under adversarial weight injection

A known structural blind spot, published rather than buried. Adversarially crafted perturbations maintain nominal activation statistics while degrading decision boundaries, which evades exactly what this architecture monitors. There is no current mitigation.

**WHAT BREAKS**

### Four things that go wrong, and why none of them is a tooling problem.

1. 01

  #### Degradation is binary, and the fallback is not the mission

  The prevailing design pattern is that the system works or it hands control back to a classical controller. There is no graceful middle, so a partial internal failure is treated the same as a total one, and capability is surrendered long before it has actually been lost.

2. 02

  #### An unexplained self-modification ends the programme

  Software entering a controlled environment must be accountable for its own behaviour and auditable after the fact. "The model updated itself and we cannot say how" is not a finding that gets remediated. It is a finding that ends the deployment, and it is the correct response given the alternative.

3. 03

  #### Test and evaluation cannot reach the failure states

  Assurance requires exploring the operational space and the failure states within it. When the smallest observable unit is the system's output, a test campaign can establish that a system failed under a condition without establishing anything about why, which means the finding cannot be generalised to conditions not tested.

4. 04

  #### Bit flips are continuous, not exceptional

  In space and high-radiation environments, corruption of stored parameters is a constant background process rather than an incident. A model with no mechanism for noticing internal damage degrades silently and continuously.

**WHAT IS USED TODAY**

### The current answers, and what each one genuinely does.

These are not strawmen. Each is used because it works at the job it was built for. The question is what remains unanswered afterwards.

#### Simulated corruption during training

Augmentation with synthetic jamming, noise and sensor faults. It improves robustness to the corruptions anticipated, and the operational problem is the ones that were not.

#### Redundancy and voting

Multiple models or sensors with a voting scheme. Effective against independent failures and considerably less so against correlated ones, and it multiplies the compute budget without producing any account of what went wrong inside any single model.

#### Runtime monitors and out-of-distribution detection

Watch the inputs or the outputs and raise a flag when they look unfamiliar. Genuinely useful, and they observe the system from outside, so they detect that something is wrong without localising it to anything.

#### Freeze and certify

The current answer for anything safety-critical: fix the weights, certify that artefact, and accept that it cannot adapt. Coherent, and it puts the entire burden on pre-deployment test coverage.

**WHAT ORMAS DOES**

### Degrading to 80.3% rather than collapsing permanently to 10% is a different safety category, and every modification the system made to itself is bounded, timestamped and reviewable afterwards.

1. 01

  #### Graceful degradation as a measured property

  A layer was destroyed mid-training on a network that had reached 85.1%. The parameter-matched baseline sat at chance level permanently, on every seed. This architecture diagnosed the failure within one epoch and recovered to 80.3% through 85 individually attributed corrections. Under simultaneous damage to every convolutional stage it recovered to 70.8%.

2. 02

  #### A bounded, timestamped record of every self-modification

  This is the artefact the assurance community is currently asking industry to build. Which component, what diagnosis, what magnitude, which declared ceiling, what residual — emitted as the system trains, signed, and reviewable long after the fact.

3. 03

  #### Nothing changes by more than a declared amount

  Every correction is capped as a fraction of the component's own weight, balanced so it removes nothing on net, and logged with what was left over. Unbounded self-modification is what makes an autonomous system unacceptable in a controlled environment; a declared ceiling is what makes review tractable.

4. 04

  #### Read-only, if that is the only acceptable posture

  The full diagnostic signal with corrections disabled. For a programme that will not authorise any autonomous weight modification — which is most of them, correctly — the record alone is the deliverable.

**THE OBLIGATIONS**

### What is required, and from when.

#### DoD test and evaluation · under active revision

An updated DOT&E manual identifies tracking of system safety and unexpected behaviour for AI-enabled and autonomous systems as a major shift being assessed. The CDAO's AI assurance guidance is not yet published.

#### DDIL testing requirements

Programmes now require assessment of resilience in denied, degraded, intermittent and limited environments, in controlled and reproducible conditions. In March 2026 the Pentagon and intelligence community solicited industry for an evaluation harness to standardise this.

#### Accountability as an entry condition

Software entering a classified or controlled environment must be accountable for its own behaviour and auditable after the fact. The record is not a feature in this market. It is the condition of being allowed in the building.

**APPLICATIONS IN SCOPE**

### 4 of the seven apply here. This is the one to start with.

Lead application

#### [The Diary](/product/diary)

What did the model do to itself, and when?

Produces a signed, timestamped record of every modification made during training: the component, the diagnosis, the treatment, the step, and the limit it remained inside. Diffable against the last approved version.

What it asks for Training on the architecture

- [The Update Engine](/product/update-engine)What is this model allowed to change about itself?

- [The Proofreader](/product/proofreader)Which samples are damaging which component?

- [The Separator](/product/separator)Which part of this is the source, not the signal?

**THE OBJECTIONS**

### Four objections, answered before they are raised.

A repeated objection is a gap in what we have explained, not a nuisance. These are the four we expect in this market, in the words a buyer actually uses.

01 — Your evidence is training-time. Our problem is in the field.

That is the correct objection and it should be the first thing said in the room, not extracted from us in the second meeting. Failures here are detected and repaired during training, where gradients and labels exist. At inference there are neither. Test-time distribution shift is named in the paper as an unrun extension, and no experiment in the current programme addresses it. What transfers today is the record and the graceful-degradation property; what does not is the detection mechanism at inference.

02 — You are 1 percentage point worse under adversarial weight injection.

We are, it is published rather than buried, and there is no current mitigation. Adversarially crafted perturbations maintain nominal activation statistics while degrading decision boundaries, which evades precisely what this monitors. In a domain defined by an adversary that is a serious finding, and it is the reason this market is positioned last rather than first.

03 — Nothing autonomous is going into our system.

Nor should it, and the read-only configuration exists for exactly that posture. Corrections disabled entirely, full diagnostic record retained. For most programmes the record alone is the deliverable and the correction capability is something to evaluate in a laboratory for several years first.

04 — Who has accredited this?

Nobody. No defence or classified data has touched it, no clearance is held, and the company is not US-domiciled, which is a real constraint on direct programme work rather than a detail to work around. The realistic shapes here are a research partnership with a national laboratory or university group, or an IP licence to an integrator who holds the clearance.

**WHO BUYS IT**

### A research partnership lead, not a procurement officer

- **Sits in** — A national laboratory, a university defense research group, or a cleared integrator holding the clearance and doing the integration.
- **Budget** — Research programme funding. Direct enterprise sale is realistically a multi-year horizon.
- **Trigger** — A test campaign that produced a failure nobody could explain, or an assurance case that could not be closed.

We can show it failed. We cannot show why, so we cannot argue it will not fail that way again.

A research partnership lead, not a procurement officer

**MAKING THE CASE**

### You are not the only person who has to say yes.

Nothing at this size is bought by one person. These are the lines for the other four, in the terms each of them is actually measured on.

The assurance lead

An artefact that closes a case

A bounded, timestamped record of every self-modification, which is the artefact the community is currently going to industry to procure.

Test and evaluation

To explain a failure, not just observe it

A failure with a named component, a step and a magnitude generalises to untested conditions. A failure observed only at the output does not.

The safety engineer

A bound they can declare

Every modification capped as a fraction of the component's own weight, balanced to net zero, logged with the residual. Unbounded self-modification is what makes a system unacceptable; a declared ceiling makes review tractable.

The programme manager

A path that does not require clearance on day one

Fundamental research needs none. The dual-use civilian route — industrial autonomy, robotics — builds the same evidence base without the overhead.

**WHAT WE CAN SHOW YOU**

### No customer references. An unusual amount of everything else.

Nobody has deployed this, and we are not going to imply otherwise. What we can put in front of an evaluation is the following, and most of it needs no contract first.

- The lesion experiments in full: single-layer and simultaneous full-hierarchy, with error bars and seeds

- The adverse result, unprompted: the 1.0 pp adversarial deficit and its mechanism

- The bound table and a worked self-modification record

- The read-only configuration, in which nothing is modified at all

- Evaluation access to the mechanism itself, inspectable without a contract or a clearance

Not a fit where

- Any programme that needs a test-time robustness result today. It does not exist, and the honest position is that this market is a well-researched hypothesis.

- Adversarial-robustness requirements. We measure worse than baseline there and would be the wrong supplier.

- Anything requiring a cleared vendor now. The realistic entry is fundamental research or an IP licence to an integrator who holds the clearance.

**WHAT WE DO NOT CLAIM**

### The boundaries, stated rather than discovered.

In markets whose central complaint is that vendors overstate their approximations, stating our own limit precisely is the position rather than a caveat on it.

- The measured evidence is for the wrong phase of the problem, and this must lead any conversation in this market. Failures are detected and repaired DURING TRAINING, where gradients and labels exist. This market's problem is at test time, in the field, where neither does.

- Test-time distribution shift is named in the paper as an unrun extension. No experiment in the current programme addresses it.

- Adversarial weight injection is a known blind spot where this architecture measures 1.0 pp worse than baseline, with no current mitigation. In a market whose defining concern is an adversary, this is the first thing a technical evaluator will find, and it should be the first thing they are told.

- Nothing here has been run on sensor data, and no defense or classified data has ever touched this system.

Sources

- [Army assesses AI's unpredictable behaviors (DefenseScoop, Jan 2026)](https://defensescoop.com/2026/01/12/army-contract-ai-behavior-risk-evaluation/)

- [Pentagon and IC seek an AI evaluation harness (DefenseScoop, Mar 2026)](https://defensescoop.com/2026/03/11/ai-system-testing-dod-intelligence-agencies/)

- [A framework for the assurance of AI-enabled systems](https://arxiv.org/pdf/2504.16937)

- [Test & evaluation of AI-enabled and autonomous systems](https://testscience.org/wp-content/uploads/formidable/20/Autonomy-Lit-Review.pdf)

Figures attributed to the ORMAS experiment programme are measured on CIFAR-10 and CIFAR-100 across 383 controlled runs, and are labelled as such wherever they appear.[The paper](/technology) carries the conditions for each.

[Talk to us about this market](/contact)

[See the product](/product)

### Working in Defense & Safety-Critical?

Every engagement starts with one specific problem: a run that died, an audit question that had no answer, a dataset nobody can vouch for.

We reply within a few days. Every message is read by a person.

#### Start a conversation

Describe what has to be visible inside the models, and we will say plainly whether this is the right thing for it.

Useful to bring

- What is being trained and what has to be proven about it

- Anything already tried

[Send a message](/contact?intent=other#other)
