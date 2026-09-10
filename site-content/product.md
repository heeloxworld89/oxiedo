# ORMAS: seven applications, one licence

- **URL:** `/product`
- **Page title:** ORMAS: seven applications, one licence — Oxiedo
- **Meta description:** One architecture, one licence, seven applications. Every model it trains arrives with the evidence of how it was made.

---
THE PRODUCT

## Every model it trains arrives with the evidence of how it was made.

### Each component stays addressable from the first step to the last.

Standard architecture

one node

1. op

2. op

3. op

4. op

continues through every remaining layer

The path from one parameter to the loss runs through everything downstream. It has no fixed length, so per-node attribution cannot be computed — only estimated afterwards, by a separate model, which is what every interpretability tool is.

ORMAS

one node

1. LayerNorm

2. Linear

3. PReLU

4. Linear

loss

measured, not estimated

Four operations, through a shared 4,715-parameter bottleneck. The chain cannot grow with the network, so the contribution of each node is read directly off the backward pass.

> The bound is the product — everything else on this site follows from the second row having a fixed length.

Train a model the ordinary way and the process erases itself. What survives is weights, a loss curve, and whatever the team still remembers. Six months on, a regulator asks what changed between the version validated and the version shipped, and every available answer is a reconstruction.

The cause is not carelessness. In a standard network every error signal reaches every parameter on every step, so by the time training ends there is no component left that a question can be put to. The information was never lost. It was never separable in the first place.

ORMAS bounds each component's learning path so the component stays individually addressable throughout the run. The data does not change. The objective does not change. The model that ships is the one that would have shipped anyway. What is added is a record of what happened inside it, and parts that can be pointed at by name.

Naming is the whole thing. A part that has a name can be watched while it trains, protected when it starts to fail, corrected inside a limit declared in advance, tied back to the data that produced it, and taken out when a contract says it has to go.

**WHAT THE ARCHITECTURE GIVES**

### All of it is produced while the model trains.

None of this is assembled afterwards out of logs. It falls out of the arithmetic the network is already doing, which is why it can be trusted and why it costs nothing extra to generate.

01

#### Five layers of telemetry

From the health of the whole system down to the attribution of a single parameter. The network computes these as it trains; switching them off would take extra work rather than save any.

02

#### Health for every component, at every step

Not sampled and not periodic. Each component is measured continuously against its own baseline, so a component drifting away from itself shows up while it is still drifting.

03

#### Eight named failure conditions

A component can die, oscillate, saturate, stagnate, explode, lose confidence, lose its gradient, or fail in a way the system declines to classify. Each one has a name and a declared ceiling on the response.

04

#### Corrections capped before they happen

Nothing is altered by more than a stated fraction of that component's own weight. Every change is balanced so it adds nothing on net, and whatever is left over is written down.

05

#### A read-only mode

Full diagnostics, zero modification. Most institutions want to watch a system for a year before they let it touch a model, and this is the mode that lets them.

06

#### A record that can be diffed

Hashed, exportable, and comparable line by line against the version last approved. Reviewers rarely ask what the model is. They ask what changed.

07

#### Runs where the data already is

No hosted service, no metering, nothing leaving the network. Inside a hospital enclave or a bank, this is what decides whether the conversation happens at all.

**WHERE WE LEAD**

### Seven applications, worked out end to end.

Six operations on a named part — protect, repair, account, detect, isolate, remove — combine into a large number of useful things. We have not proven all of them and will not claim to have. These are the seven being built, each aimed at a market already paying for its absence, and backed by evidence available on request. They appear in the order of what each one asks for.

1. 01

  #### [The Proofreader](/product/proofreader)

  Which samples are damaging which component?

  Attaches to an already-trained model without modifying it and returns a ranked list of labels judged incorrect, held separate from those that are merely difficult. Broken down by class, and by source where the corpus carries one.

  - **Composed of** — DETECT
  - **What it asks for** — A model file and a labelled sample
  - **Serves** — All five markets

  [Read this application →](/product/proofreader)

2. 02

  #### [The Warning Light](/product/warning-light)

  Is this run failing, and where?

  Watches every component of a model while it trains and raises an alarm when one crosses its own baseline, naming the component rather than the run. The operator rolls back hundreds of steps instead of thousands.

  - **Composed of** — ACCOUNT
  - **What it asks for** — One line around the training loop
  - **Leads in** — AI Training

  [Read this application →](/product/warning-light)

3. 03

  #### [The Diary](/product/diary)

  What did the model do to itself, and when?

  Produces a signed, timestamped record of every modification made during training: the component, the diagnosis, the treatment, the step, and the limit it remained inside. Diffable against the last approved version.

  - **Composed of** — ACCOUNT PROTECT REPAIR
  - **What it asks for** — Training on the architecture
  - **Leads in** — Regulated Finance · and 3 more markets

  [Read this application →](/product/diary)

4. 04

  #### [The Separator](/product/separator)

  Which part of this is the source, not the signal?

  Separates what a model learned about the world from what it learned about where the data came from. One model ships and works anywhere, carrying a named removable part for each source and a record of the data that justified each.

  - **Composed of** — ACCOUNT DETECT ISOLATE SUPPRESS
  - **What it asks for** — Training on the architecture, with source labels
  - **Serves** — All five markets

  [Read this application →](/product/separator)

5. 05

  #### [Certified Deletion](/product/certified-deletion)

  What data is in here, and can I remove it?

  Removes a named source's contribution and issues a signed certificate of exactly what was removed, with a bounded statement of what changed, and without retraining.

  - **Composed of** — ACCOUNT DETECT ISOLATE SUPPRESS
  - **What it asks for** — The Separator, plus a deletion policy
  - **Leads in** — Data Obligation · and 2 more markets

  [Read this application →](/product/certified-deletion)

6. 06

  #### [The Federated Node](/product/federated-node)

  Can we train together without pooling the data?

  Runs inside an existing federation. Each party's contribution is recorded before the averaging step destroys it, so a round that drops six points can be attributed to a site.

  - **Composed of** — ACCOUNT DETECT ISOLATE SUPPRESS
  - **What it asks for** — A federation that already exists
  - **Leads in** — Medical AI · and 2 more markets

  [Read this application →](/product/federated-node)

7. 07

  #### [The Update Engine](/product/update-engine)

  What is this model allowed to change about itself?

  Retrains a deployed model inside a limit declared and signed beforehand, and produces the evidence that every change stayed inside it. Built to the shape of a predetermined change control plan.

  - **Composed of** — ACCOUNT PROTECT REPAIR
  - **What it asks for** — A limit agreed with the reviewer in advance
  - **Serves** — Regulated Finance · Medical AI · Defense & Safety-Critical

  [Read this application →](/product/update-engine)

Other combinations are possible and some of them are obvious. They are absent from this page because we would not yet sign a contract against them.

**HOW IT IS DELIVERED**

### There is no menu, and no per-application price.

One deployment licence covers the architecture and everything it can be asked to do. A licensee enables what the deployment requires, and the scope goes into the contract rather than onto a meter. Annual, per institution, running inside the customer environment.

Beyond the software, the licence carries the parts that actually decide a regulated deployment: integration into the customer stack, limits calibrated for the domain, builds pinned to a version anyone can reproduce, support, and indemnity. The research and its experiments stay published, so the mechanism can be checked by anyone who cares to.

[How licensing works](/licensing)

### Start with the problem already on the table.

Every engagement starts with one specific problem: a run that died, an audit question that had no answer, a dataset nobody can vouch for.

We reply within a few days. Every message is read by a person.

#### Pre-book a deployment

One licence, no price list. Terms are agreed per institution and written into the contract, and pre-booking fixes them ahead of general availability.

Useful to bring

- What is being trained, and roughly at what scale

- The obligation driving it: SR 26-2, the EU AI Act, Article 17, a PCCP, an internal policy

- What a failed run currently costs to diagnose

[Pre-book a deployment](/contact?intent=pre-book#pre-book)
