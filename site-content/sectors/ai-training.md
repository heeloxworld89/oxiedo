# AI training: diagnosing runs that fail silently

- **URL:** `/sectors/ai-training`
- **Page title:** AI training: diagnosing runs that fail silently — Oxiedo
- **Meta description:** Is this run failing, and where? How ORMAS applies in ai training: the failures, the regulation, the buyer, and the limits.

---
MARKET

## AI Training

- **The question** — Is this run failing, and where?
- **What forces it** — No regulator — the compute budget the failed run came out of
- **The number** — 419 — unexpected interruptions in a single 54-day run — Meta's Llama 3 405B pre-training, on 16,384 H100s. Roughly one failure every three hours. Faulty GPUs caused 148 of them; HBM3 memory another 72.

Is this run failing, and where?

A training run is the most expensive thing most AI organisations own, and it is supervised by the one instrument that cannot see inside it.

The question is not whether a failing run can be detected. It is how small a fault can be detected, and how early.

Every tool in this category answers at the level of the run. Compare them on resolution instead: what is the smallest unit the instrument can name, and how long after the fault does it name it? A loss curve resolves to the whole model, after the aggregate moves. This resolves to a component, at the step it happened.

**WHERE THIS MARKET IS**

The economics of this market are unusual: the buyer does not need to be convinced the problem exists. They lost money to it recently, they can name the run, and they can find the invoice. What they have never had is an instrument that tells them anything smaller than "the run is in trouble."

The standard operating picture for a large training job is a loss curve on a dashboard, a gradient-norm chart beside it, and checkpointing at some interval chosen as a compromise between storage cost and how much work is acceptable to lose. When something goes wrong, all three report the same thing at the same time: something went wrong. None of them names which part, or when it started.

That gap is not a tooling oversight. In a standard network every error signal reaches every parameter on every step, so there is no component whose behaviour can be isolated from the aggregate. The information required to answer "which part?" is not being withheld. It was never separable.

> A big training run breaks, and today the first sign is the crash itself. ORMAS watches each machine separately, so it flags the one that went wrong 647 steps earlier — roughly two hours of compute, or $16,000–$24,000.

**WHAT IT COSTS**

### The numbers this market already publishes about itself.

419

unexpected interruptions in a single 54-day run

Meta's Llama 3 405B pre-training, on 16,384 H100s. Roughly one failure every three hours. Faulty GPUs caused 148 of them; HBM3 memory another 72.

$15M

of compute wasted on that one run

At 30-minute checkpointing, a single failure at that scale forces roughly 4,096 GPU-hours of work to be repeated. Multiplied across 419 failures.

20+

loss spikes in one 540B-parameter run

Each requiring a checkpoint rewind and several hundred skipped batches. The published mitigation is to restart about 100 steps before the spike and skip 200–500 batches.

129.3 MWh

of additional energy on a 65B run

Plus thirty additional days, spent entirely on recovering from loss spikes rather than on training.

**WHAT BREAKS**

### Four things that go wrong, and why none of them is a tooling problem.

1. 01

  #### The instrument reports the symptom, and only after the fact

  A loss curve is an aggregate over every parameter in the model. By construction it cannot move until enough components have degraded to shift the average, which means the first observable evidence of a problem arrives after the problem has been training itself into the weights for some time. The published characterisation of this is blunt: a run may already have entered an unstable state while training silently continues for thousands of steps before symptoms become visible.

2. 02

  #### Recovery discards work that was never damaged

  Because nothing identifies which component failed, the only safe response is to discard everything since the last checkpoint. A rollback of twenty thousand steps throws away twenty thousand steps of legitimate learning in order to undo the few hundred that were harmful. The cost of the remedy is set by checkpoint interval, not by the size of the fault.

3. 03

  #### The cause is not reliably reproducible

  Loss spikes are hypothesised to arise from rare interactions between the optimiser state and specific input batches, a combination that is fragile, hard to predict, and difficult to reproduce deliberately. Post-mortem analysis of an aggregate signal cannot distinguish a benign spike that would have recovered on its own from a malignant one that leads to irreversible divergence.

4. 04

  #### The failure is invisible until it is expensive

  Silent degradation is worse than a crash. A crashed job restarts. A job that keeps running while quietly getting worse consumes its full compute budget and produces a model that has to be thrown away — which is the mechanism behind the industry estimate that a large share of frontier compute goes to experiments that never ship anything.

**WHAT IS USED TODAY**

### The current answers, and what each one genuinely does.

These are not strawmen. Each is used because it works at the job it was built for. The question is what remains unanswered afterwards.

#### Loss and gradient-norm dashboards

Genuinely useful, and the right tool for tracking whether a run is converging. They are aggregate statistics computed over the whole model, so their smallest addressable unit is the run itself.

#### Checkpointing and automated restart

Solves crash recovery, which is a real and different problem. It states how to resume, never what to fix, and its cost model is set by interval rather than by fault size.

#### Experiment trackers

Weights & Biases and MLflow record what happened to a run: loss, accuracy, learning rate, utilisation, artefacts. Excellent at that job. They observe the training process from outside it, so they cannot record events that were never emitted in the first place.

#### Gradient clipping and spike mitigation

Adaptive clipping methods reduce the incidence of spikes. They suppress the symptom without localising the cause, and a suppressed spike still leaves the component involved unnamed.

**WHAT ORMAS DOES**

### The Warning Light supplies that signal: per component, every step, while the run is still recoverable.

1. 01

  #### Health is a property each component emits, not a statistic computed about it

  Every component carries its own bounded learning path, so it produces a health signal as a byproduct of the arithmetic the network is already doing. The signal exists at every step for every component. Nothing samples it, and no observer computes it from outside.

2. 02

  #### The alarm names a component, a step and a magnitude

  Instead of "the loss moved at step 40,200", the record reads: node 1, oscillating, magnitude 7.674, step 39,553. That is an object an operator can act on. In the measured case, fault localisation to a specific component happened within a single epoch of the fault occurring.

3. 03

  #### Eight named conditions, each with a declared ceiling

  A component can go dead, oscillate, saturate, stagnate, explode, lose confidence, lose gradient, or fail unclassified. Each has a name, a trigger condition, and a declared limit on how much may be changed in response — stated as a fraction of that component's own weight rather than as a global constant.

4. 04

  #### Read-only is a supported mode, and it is where most teams start

  The diagnostics run with corrections switched off entirely. The full signal is emitted and the architecture touches nothing. Nobody sensible lets an unproven system modify weights inside a run costing hundreds of thousands of dollars, and the product does not ask them to.

**APPLICATIONS IN SCOPE**

### 3 of the seven apply here. This is the one to start with.

Lead application

#### [The Warning Light](/product/warning-light)

Is this run failing, and where?

Watches every component of a model while it trains and raises an alarm when one crosses its own baseline, naming the component rather than the run. The operator rolls back hundreds of steps instead of thousands.

What it asks for One line around the training loop

- [The Proofreader](/product/proofreader)Which samples are damaging which component?

- [The Separator](/product/separator)Which part of this is the source, not the signal?

**THE OBJECTIONS**

### Four objections, answered before they are raised.

A repeated objection is a gap in what we have explained, not a nuisance. These are the four we expect in this market, in the words a buyer actually uses.

01 — We already have monitoring. Why would we add another dashboard?

Nobody should, and we do not ship one. The alarm exports to wherever the team already looks: JSONL, a webhook, or the existing experiment tracker. Nobody adopts a second place to look, and a product that requires them to is a product that gets switched off in month two. What changes is not where the team looks, but what is in the alert: a component name and a step number instead of a curve.

02 — What does the instrumentation cost us in throughput?

The honest answer is that the full system carries a measured overhead of 1.35× on a graph backbone, and that most of it is gradient surgery that monitoring does not need. The read-only path runs none of that. Its wall-clock cost has been characterised as negligible in the paper and has not been separately benchmarked, so it is a measurement we will run against the customer configuration rather than quote.

03 — This has never been run on a transformer.

Correct, and ten minutes of reading would establish it, so we state it first. The architecture is demonstrated on fully-connected, CNN and ResNet families. The monitoring half of a transformer port is the cheap half, a local readout on intermediate activations already demonstrated on a non-graph backbone. The correction half is the expensive one, and it is not the half anyone wants on a run that size.

04 — Our failures are hardware, not model pathology. Half of Llama 3's were GPUs.

Also correct, and a monitor does not fix a dead GPU. The distinction that matters is between a job that crashes and a job that keeps running while getting worse. A crash is detected by the orchestrator in seconds. Silent degradation is the one that consumes the full budget and produces a model that gets thrown away, and it is the one nothing currently catches.

**WHO BUYS IT**

### The person who owns the training run

- **Sits in** — Infrastructure or research engineering, inside a team doing large fine-tunes, continued pre-training, or a domain-specific build.
- **Budget** — Compute. Not governance, not compliance. It is the same budget line the failed run came out of.
- **Trigger** — A run that died, or degraded silently, and could not be explained afterwards.

We lost four days and we still do not know what happened at step forty thousand.

The person who owns the training run

**MAKING THE CASE**

### Nobody signs this alone.

Nothing at this size is bought by one person. These are the lines for the other four, in the terms each of them is actually measured on.

The person who signs

A number they can defend

One avoided incident at two hours of recovery is $16,000–$24,000. The licence is priced against that, and the arithmetic does not require believing anything we say.

The infrastructure lead

To know it will not become their problem

One line around the training loop. A context manager or callback, never a required base class, and read-only by default so nothing touches weights.

The research lead

To know the mechanism is real

383 controlled experiments across four architecture families, the manuscript, and 67 archived run records reproducible from seed. Send them the paper, not the deck.

Security

To know nothing leaves

Runs inside the customer environment. No hosted tier, no metering, no telemetry egress.

**WHAT CAN BE SHOWN**

### No customer references. An unusual amount of everything else.

Nobody has deployed this, and we are not going to imply otherwise. What we can put in front of an evaluation is the following, and most of it needs no contract first.

- The manuscript, in full, with the reproducibility checklist

- 67 archived run records, each reproducible from seed

- A worked example of the alarm output: component, diagnosis, step, magnitude

- The read-only configuration, so the first engagement modifies nothing

- Evaluation access under the research licence, so the team can run the mechanism before any contract exists

Not a fit where

- Teams whose runs cost less than about $10,000. The arithmetic does not work, and we say so.

- The dozen frontier labs who build their own infrastructure. A research partnership serves both sides better than a licence fee.

- Anyone looking for a replacement for their experiment tracker. This is not that, and it composes with whichever tracker is already in place.

**WHAT WE DO NOT CLAIM**

### The boundaries, stated rather than discovered.

In markets whose central complaint is that vendors overstate their approximations, stating our own limit precisely is the position rather than a caveat on it.

- Every published ORMAS result is on CIFAR-10 or CIFAR-100. No frontier-scale run has been instrumented.

- The architecture has been demonstrated on fully-connected, CNN and ResNet families. Transformers are a stated generalisation target, not a demonstrated result.

- Our evidence for the health signal comes from corruption-driven failure. Whether it transfers cleanly to optimiser-driven instability is an open question, and a frontier engineer will raise it inside five minutes.

Sources

- [Meta · Llama 3 training interruptions (Tom's Hardware)](https://www.tomshardware.com/tech-industry/artificial-intelligence/faulty-nvidia-h100-gpus-and-hbm3-memory-caused-half-of-the-failures-during-llama-3-training-one-failure-every-three-hours-for-metas-16384-gpu-training-cluster)

- [Llama 3 interruption breakdown (Data Center Dynamics)](https://www.datacenterdynamics.com/en/news/meta-report-details-hundreds-of-gpu-and-hbm3-related-interruptions-to-llama-3-training-run/)

- [ZClip · adaptive spike mitigation for LLM pre-training](https://arxiv.org/html/2504.02507)

- [PaLM · loss spikes and checkpoint rewind](https://arxiv.org/pdf/2204.02311)

- [Characterization of LLM development in the datacenter](https://arxiv.org/pdf/2403.07648)

Figures attributed to the ORMAS experiment programme are measured on CIFAR-10 and CIFAR-100 across 383 controlled runs, and are labelled as such wherever they appear.[The paper](/technology) carries the conditions for each.

[Talk to us about this market](/contact)

[See the product](/product)

### Working in AI Training?

Every engagement starts with one specific problem: a run that died, an audit question that had no answer, a dataset nobody can vouch for.

We reply within a few days. Every message is read by a person.

#### Start a conversation

Describe what has to be visible inside the models, and we will say plainly whether this is the right thing for it.

Useful to bring

- What is being trained and what has to be proven about it

- Anything already tried

[Send a message](/contact?intent=other#other)
