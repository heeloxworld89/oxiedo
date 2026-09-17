# The record, replayed: a network diagnosing its own failure

- **URL:** `/demo`
- **Page title:** The record, replayed: a network diagnosing its own failure — Oxiedo
- **Meta description:** Two parameter-matched networks, trained identically. One is destroyed mid-training and cannot say why. The other names both damaged components two steps later. An archived run, replayed.

---
**THE RECORD, REPLAYED**

## What the record looks like when a model breaks.

Two networks, parameter-matched, trained identically on CIFAR-10. At epoch 101 two convolutional stages are destroyed. One network sits at chance level for the remaining ninety-nine epochs and cannot say why. The other names both damaged components and recovers.

This is a replay of an archived run, not a simulation. The run identifier and the seed are on screen, and every figure regenerates from that seed.

- Field: Scenario — Dead-layer lesion Full-hierarchy lesion Adversarial weight injection Weight explosion

Loading the archived run…

##### Standard CNN

parameter-matched

Component telemetry

No such quantity is computed by this architecture.

##### ORMAS

same data, same objective

Component telemetry

- Field: Epoch

epoch 0

##### The record

Every correction, with its component, diagnosis, step, magnitude and declared ceiling Step Component Diagnosis Magnitude Ceiling

Nothing in the panel on the left was withheld. A standard network does not compute a per-component health signal at any point in training, so there is no quantity to display. That absence is the problem ORMAS was built to remove.

**BEFORE THE QUESTIONS**

### Ten objections, answered before they are raised.

These are the questions a technical evaluation asks in its first five minutes. The limits come first, because a page that lists only what worked is a marketing page wearing a lab coat.

#### Where does it lose?

Under adversarial weight injection the architecture measures 1.0 percentage point worse than a parameter-matched baseline, and there is no current mitigation. Adversarially crafted perturbations hold nominal activation statistics while moving decision boundaries, which evades precisely what this monitors.

That run is in the scenario selector above. It plays, and it loses.

#### Is this deep supervision with extra steps?

Auxiliary classification heads on intermediate layers are long established, and the local loss shares that lineage. Two things differ. The readout is a single shared low-rank bottleneck across every node rather than independent per-layer classifiers, which couples readout capacity across the network and makes the signal a continuous health baseline rather than a training objective. And no prior architecture couples that isolation with a health-gated closed-loop repair mechanism.

The coupling is the contribution, not the auxiliary loss.

#### This is CIFAR-10.

Every result is CIFAR-10 or CIFAR-100. No clinical, biological, financial or defence data has ever touched this system. That is the binding constraint on the whole programme rather than a detail, and it is stated on every page where a result appears.

#### What does the instrumentation cost in compute?

Two numbers, and conflating them would flatter the answer. In parameters the cost is a bounded constant that does not grow with the model. In wall-clock throughput it is not a constant: the full system has been measured at 1.35× on a graph backbone and 2.16× on a CNN, and the gap between those two is unfused Python loops rather than algorithmic complexity.

Most of the 1.35× is gradient surgery, which monitoring does not need. The read-only path runs none of it, and its wall-clock cost has been characterised as negligible but not separately benchmarked, so it is a measurement we will run against the customer configuration rather than quote. Anyone sizing a frontier run should assume the full figure until that measurement exists.

#### Is this a simulation?

No. It is a replay of one archived training run. The run identifier and the seed are on screen at every frame, and the figures are the values recorded during that run.

Playback speed varies across the run so that the failure is legible rather than a blink. The data is untouched; only the camera speed changes.

#### Has this been run on a transformer?

No. The architecture is demonstrated on fully-connected, convolutional and residual families. Transformers are a stated generalisation target, not a demonstrated result.

#### Does the replay prove it works at scale?

No. It shows one 200-epoch run on a network of 636,677 parameters. Behaviour at frontier scale, on regulated data, and in production over time has not been observed, because no deployment exists.

#### Why not checkpoint and roll back instead?

Rollback recovers the accuracy and discards every step of legitimate learning since the last checkpoint, and it arrives with no account of what failed. The cost of the remedy is set by the checkpoint interval rather than by the size of the fault, and the same failure remains available to happen again unexplained.

The replay above is not an argument that repair beats rollback on accuracy. It is an argument that a named component, a step and a magnitude is a different class of object from a collapsed curve.

#### Where is the code?

The mechanism is released in full on publication, and that commitment is written into the licence rather than promised. Free for research, teaching and evaluation from that day, permanently.

Until then, evaluation access is available under a short agreement, every archived run regenerates from its seed, and the falsification specification is supplied on request.

#### What is the commercial model?

One product, one licence. The mechanism publishes free for research, teaching and evaluation, permanently. Production deployment is licensed: annual, per institution, running on customer infrastructure, with the bound calibrated for the domain, reproducible builds, support and indemnity.

Nothing is priced per feature and there is no price list. Terms are agreed per institution and written into the contract.

**WHY THE TIMING MATTERS**

### The obligations arrive on legislated dates, not forecast ones.

- 17 April 2026 — SR 26-2 supersedes SR 11-7. In force.

- 2 December 2027 — EU AI Act, Annex III obligations apply.

- 2 August 2028 — EU AI Act, Annex I transition.

- 25 March 2029 — European Health Data Space, secondary use.

An architecture cannot be retrofitted into a model that has already been trained. An institution that begins the architecture question after the date is not late by a quarter; it is late by a training cycle.

**THREE WAYS ON**

### Start with the problem already on the table.

#### Run the falsification specification

The remaining research programme can be falsified for under thirty GPU-hours on a single card, against a specification we supply. It runs on customer hardware, by the institution's own technical partner, without us in the room.

[Request the specification](/contact?intent=falsify#falsify)

#### Evaluate it directly

Evaluation access is available now under a short agreement, and free and unrestricted once the research release is out. Either way it runs entirely in the customer environment, with nothing reaching us.

[Ask for access](/contact?intent=other#other)

#### Pre-book a deployment

Terms are agreed per institution and written into the contract, and pre-booking fixes them ahead of general availability. Early partners shape the baseline architecture while the requirements are still open.

[Pre-book a deployment](/contact?intent=pre-book#pre-book)

Every figure on this page is measured on CIFAR-10 across the controlled experiment programme, and is labelled as such wherever it appears.[The technology page](/technology) carries the conditions for each, the error bars, and the one result that went against us.
