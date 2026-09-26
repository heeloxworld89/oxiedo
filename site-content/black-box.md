# The black box is not a law of nature

- **URL:** `/black-box`
- **Page title:** The black box is not a law of nature — Oxiedo
- **Meta description:** Opacity is not inherent to deep learning. It is a consequence of one design decision, made early and never revisited. Change the decision and half the problem stops existing — here is that half, running.

---
**Two neural networks, the same data, the same damage.** **ORMAS**, on the right, names which parts broke — two steps later — and repairs itself. The **sealed network** on the left cannot say anything about it, and never will. Every figure is read from one archived training run.

ORMAS·replay console

Scenario

Loading the archived run…

Sealed network

test accuracy now

Open network

test accuracy now

Corrections written

during training, so far

Fault named in

after the event

The same network, twice. One sealed, one open.

- Field: Scenario — Dead-layer lesion Full-hierarchy lesion Corrupted labels Adversarial weight injection

Loading the archived run…

The archived run did not load.

Every figure on this screen is read from a file in the experiment archive, and that file did not arrive. Nothing here is computed in the browser, so there is nothing to show until it does.

- Field: Epoch

epoch 0 / 199

What each one can answer, at this epoch

The question Standard CNN ORMAS

Test accuracy · both arms, one axis

Correction ledger · written during training

##### The record

Every correction, with its component, diagnosis, step, magnitude and declared ceiling Step Component Diagnosis Magnitude Ceiling

**THE RUN, REPLAYED**

### What was done to the network, and how to check it.

Both arms have identical shape and were trained on the same data toward the same objective. At epoch 101 two of their convolutional stages are destroyed outright. The sealed arm does not degrade gracefully: it falls to chance and stays there for the rest of the run.

The controls drive an archive, not a simulation. Play and the epoch bar move both arms through the same recorded run, and the table underneath stops answering the same way for the two of them. The run's identifier and seed sit in the bar at the top of the console, and each of the four scenarios regenerates from its own seed. The fourth goes against us, and it sits in the same menu as the other three.

Nothing in the sealed pane was withheld. A standard network does not compute a per-component health signal at any point in training, so there is no quantity to display and no setting that would reveal one. That absence is the problem, drawn.

**THE SPLIT**

### The black box was never one problem. It is two questions that were given one name.

What the open pane just did is not a better reading of a finished model. It is a different question, answered by different means — and the distinction is not academic. One of these is a question about meaning, and it is genuinely hard. The other is a question about accounting, and it is the one that decides whether a regulated institution can use a model at all. For a decade both were attacked with the same instrument.

OPEN

#### What does this model know?

What a given component encodes. Which concepts live where. Why this input produced that output.

This is the question mechanistic interpretability works on, and it is a serious programme — named a breakthrough technology of 2026 and producing real results.

It is also honest about its own difficulty. Published surveys record that current work remains largely confined to toy models or to small fragments of larger networks, and that there is no agreed way to tell a true explanation from a merely plausible one. The substrate resists the question: a single unit routinely encodes several unrelated features at once, so there is no clean correspondence between the parts of a network and the concepts anyone wants to ask about.

Nothing on this page closes this question, and nothing on this site claims to.

CLOSED

#### What did this model do to itself?

Which component failed. At which step. By how much. Inside what declared limit. Traceable to the data that caused it.

This is not a question about meaning. It is a question about accounting, and it is the one that decides whether a model can be validated, audited, updated under a change-control plan, or have a data source removed from it on request.

It was attacked with the same instrument as the question above — examine the finished network, estimate what must have happened — and that instrument cannot answer it. An account that was never written during training cannot be recovered from the weights afterwards. The information was not hidden. It was never separable.

Bound each component’s learning path and it becomes separable, so the network writes the account as it goes. The replay below is that account being written.

Only the right-hand question is closed here, and only within the limits set out below. A page that claimed both would be worth less, not more, to the people who have to file against it.

**WHY THE OLD INSTRUMENT COULD NOT DO IT**

### An account that was never written cannot be recovered from the weights.

Every error signal in a standard neural network reaches every parameter on every step. That property is the source of a network's capability, and it is also why nothing inside one can be named afterwards. The trail does not go cold. It was never laid.

Ask a finished model what it took from a particular source and every available tool works the same way: examine the trained system, produce a best estimate of what must have occurred. The estimate is frequently a good one. It is also unverifiable, two tools disagree on the same input, and an estimate is not something a data owner accepts or a supervisor files.

This was never a tooling failure. The quantity was not being withheld. In a network where every gradient touches every parameter, there is no component whose behaviour can be isolated from the aggregate, so there is nothing for a question to be put to. Reverse engineering is the right instrument for the left-hand question and the wrong one for the right-hand question, and the field spent a decade using it for both.

That decision was reasonable when it was made and has not been revisited since. Change it — bound each component's learning path so the component stays individually addressable — and one half of the black box stops existing. Not because a better tool was pointed at a finished model, but because the model keeps the account as it goes, which is what the run above is doing.

**WHAT THAT RECORD IS FOR**

### The same record answers four different people.

It is one artefact, generated once, during training. What changes between these readers is the obligation that makes them ask.

- **The engineer whose run died.** A component, a step and a magnitude, while the run is still recoverable — instead of a loss curve that moved once the damage was thousands of steps old.

- **The validator who cannot verify a memo.** A signed, per-modification record with a declared bound, diffable against the version last approved. Evidence of what training did rather than a written account of what the team intended.

- **The reviewer assessing a model allowed to update.** A declared set of modification types with individual ceilings, the record of each one as it happened, and the diff. Those are the three things a change-control plan asks for.

- **The counsel holding a deletion clause.** What the model took from a named source, held as an addressable part rather than spread across every parameter — the precondition for removing it and certifying what was removed.

Transparency is the mechanism. The product is that data a custodian will not release today becomes data they can release, because the account they have been waiting for now exists.

**BEFORE THE QUESTIONS**

### Ten objections, answered before they are raised.

These are the questions a technical evaluation asks in its first five minutes, in the words a reader actually uses. The limits come first, because a page that lists only what worked is a marketing page wearing a lab coat.

#### Where does it lose?

Under adversarial weight injection the architecture measures 1.0 percentage point worse than a parameter-matched baseline, and there is no current mitigation. Adversarially crafted perturbations hold nominal activation statistics while moving decision boundaries, which evades precisely what this monitors.

That run is in the scenario selector. It plays, and it loses.

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

No, and that is not what it is for. It shows one 200-epoch run on a network of 636,677 parameters, and what it establishes is the mechanism rather than the scale. Frontier scale, regulated data and production over time are outside the evidence: no deployment exists, and nothing here is asserted about behaviour under any of the three.

#### Why not checkpoint and roll back instead?

Rollback recovers the accuracy and discards every step of legitimate learning since the last checkpoint, and it arrives with no account of what failed. The cost of the remedy is set by the checkpoint interval rather than by the size of the fault, and the same failure remains available to happen again unexplained.

The replay is not an argument that repair beats rollback on accuracy. It is an argument that a named component, a step and a magnitude is a different class of object from a collapsed curve.

#### Where is the code?

The mechanism is released in full on publication, and that commitment is written into the licence rather than promised. Free for research, teaching and evaluation from that day, permanently.

Until then, evaluation access is available under a short agreement, every archived run regenerates from its seed, and the falsification specification is supplied on request.

#### What is the commercial model?

One product, one licence. The mechanism publishes free for research, teaching and evaluation, permanently. Production deployment is licensed: annual, per institution, running on customer infrastructure, with the bound calibrated for the domain, reproducible builds, support and indemnity.

Nothing is priced per feature and there is no price list. Terms are agreed per institution and written into the contract.

**THE BOUNDARY OF THE CLAIM**

### Stated here, in the same place as the claim.

A page arguing that half of a decade-old problem is closed has to say exactly which half and exactly how far, in the same breath. These are the boundaries of the evidence.

- **This is structural transparency, not semantic interpretability.** The record names which component failed, when, by how much and inside what limit. It does not say what that component encodes, and no claim here should be read as saying it does.

- **Every result is CIFAR-10 or CIFAR-100.** No clinical, biological, financial or defence data has ever touched this system. That is the binding constraint on the whole programme rather than a detail.

- **Transformers are a stated target, not a demonstrated result.**Demonstrated on fully-connected, convolutional and residual families.

- **Where it loses.** Under adversarial weight injection the architecture finishes 1.0 percentage point behind a parameter-matched baseline, with no current mitigation; that run is in the scenario selector above, and it plays, and it loses. It also finishes 0.9 pp behind under a 100× weight explosion, and on ResNet-18 an uninstrumented network recovers slightly better (92.6% vs 91.7%).

- **The claim stops where the evidence stops.** Frontier scale, regulated data and production over time are outside it — no deployment exists, and nothing here is asserted about behaviour under any of the three.

The claim is not that a network can now be read. It is that a single-network architecture can produce mechanistically logged, per-component causal attribution that no prior single-network method offers, and that this is what makes recovery from failures possible that standard architectures cannot even detect.

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

The remaining research programme comes down to four measurements, each with a written prediction, against a specification we supply. It runs on customer hardware, by the institution's own technical partner, without us in the room.

[Request the specification](/contact?intent=falsify#falsify)

#### Evaluate it directly

Evaluation access is available now under a short agreement, and free and unrestricted once the research release is out. Either way it runs entirely in the customer environment, with nothing reaching us.

[Ask for access](/contact?intent=other#other)

#### Pre-book a deployment

Terms are agreed per institution and written into the contract, and pre-booking fixes them ahead of general availability. Early partners shape the baseline architecture while the requirements are still open.

[Pre-book a deployment](/contact?intent=pre-book#pre-book)

Every figure on this page is measured on CIFAR-10 across the controlled experiment programme, and is labelled as such wherever it appears.[The technology page](/technology) carries the conditions for each, the error bars, and every run where it loses.
