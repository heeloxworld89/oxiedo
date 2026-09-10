# The ORMAS architecture, and 383 experiments

- **URL:** `/technology`
- **Page title:** The ORMAS architecture, and 383 experiments — Oxiedo
- **Meta description:** The architecture, the three signals, five telemetry layers, 383 controlled experiments, and a section on what is not yet established.

---
THE TECHNOLOGY

## A different bet on the oldest open problem in machine learning.

+70.3 pp

Recovery from catastrophic structural collapse, where a parameter-matched baseline is permanently dead

383

Controlled experiments across four architecture families, every run reproducible from seed

5

Layers of causal telemetry emitted natively, from system health to per-parameter attribution

<30

GPU-hours to falsify the entire remaining research programme, on one card

Neural networks fail opaquely, and not because anybody built them carelessly. Global backpropagation diffuses every error signal across every parameter simultaneously, so precise fault localisation is not difficult; it is mathematically unavailable. When a layer dies mid-training, what a practitioner observes is a collapsed loss curve and no mechanism whatsoever for identifying which component failed, when, or why.

It is worth being precise about the size of this. Opacity is the single property standing between deep learning and every domain that requires an account of a decision before it will accept the decision. Not a performance ceiling, but an admissibility one. And those domains are not small: medicine, finance, safety-critical autonomy, and every use of data belonging to somebody else.

For a decade the field has attacked this as an inference problem, asking what a trained network must have been doing. We treat it as a construction problem, and ask what a network would have to be built like in order to be able to say.

The bet

Transparency is not something to recover from a finished network. It is something to build into how the network trains.

One architectural decision, bounding each node's local gradient chain to exactly four operations, makes per-component attribution something the network computes on its way past, rather than something a second procedure estimates afterwards.

**WHERE THE FIELD STANDS**

### The main line of attack is reverse-engineering, and it is honest about its own difficulty.

This is not a claim that the work is bad. It is careful work on a genuinely hard problem, and the summary below is drawn from that literature's own account of itself.

1. 01

  #### The dominant approach reverse-engineers a finished network

  Mechanistic interpretability sets out to recover the algorithms a trained network implements and translate them into something a person can follow. It is a serious research programme and it has produced real results.

2. 02

  #### Its own literature questions whether the goal is reachable

  Published surveys record that many researchers doubt the ambition is achievable at scale, and that current work remains confined to toy models or to small fragments of larger networks.

3. 03

  #### There is no agreed way to tell a true explanation from a plausible one

  With no unified evaluation, results rest on human interpretation, which leaves open the question of whether an explanation reflects the computation or is an artefact of the narrative imposed on it.

4. 04

  #### And the substrate resists the question

  A single unit routinely encodes several unrelated features at once. There is no clean correspondence between the parts of the network and the concepts anyone wants to ask about.

All four difficulties share a cause: the account is being reconstructed after the network has already made up its mind, by a separate procedure that can itself be wrong. Constrain the network during training and the account stops being a reconstruction.

**THE ARCHITECTURE**

### Three signals, five layers of telemetry, one bounded chain.

The whole mechanism, named. Everything on this page follows from the second signal being bounded to four operations.

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

1. SIGNAL 1

  #### Global backpropagation

  Standard cross-entropy over the full network. Unmodified: the ordinary learning signal is left exactly as it is.

2. SIGNAL 2

  #### Per-node local loss

  Each node carries its own bounded chain of LayerNorm, Linear, PReLU and Linear, anchored through one shared low-rank bottleneck of 4,715 parameters. This is the health baseline.

3. SIGNAL 3

  #### Health-gated self-correction

  Eight diagnoses, each routed to its own treatment, each capped as a fraction of the component's own weight, mean-centred and logged.

Emitted natively, as a property of the forward and backward pass

L1

System health

Global optimisation trajectory, per epoch

L2

Component conflict

Per-node cosine similarity between the global and local gradient

L3

Spatial routing

Where each node attends

L4

Mechanistic ablation

An exact boolean tensor of every correction event

L5

Parameter attribution

Causal saliency through the bounded chain, per parameter

Gradient conflict between the signals is resolved by PCGrad projection. Every continuous correction satisfies a mean-centring conservation constraint and is bounded by an Input-to-State Stability argument under local strong convexity, and the observed correction rate settles exactly as that bound predicts, which is the part that matters: the stability argument is testable, and it was tested.

**WHAT IS PUBLISHED**

### Six results, and the conditions each was measured under.

> Four results, one scale — ORMAS — Parameter-matched baseline

Two further results do not share this scale and are not forced onto it. Under 40% label noise the architecture decayed 2.5 pp from peak against 7.8 pp for standard training. On a 50-node graph at 30% noise it stayed stable through 22,014 attributed corrections, where standard training returned NaN and stopped.

Read the abstract in full

The neural network black box is not an inherent property of deep learning—it is a mathematical consequence of global backpropagation, where a single entangled error signal renders mid-training structural collapse invisible. We show that structurally isolating gradient chains to bounded 4-operation local paths transforms a standard neural network into a transparent, self-correcting system. Our protocol, ORMAS, extends backpropagation with a per-node local loss anchored through a capacity-constrained shared bottleneck and a health-gated self-correction mechanism that autonomously diagnoses and repairs structural pathologies in real time. Gradient conflicts between signals are resolved via PCGrad projection, and all continuous corrections satisfy a mean-centering conservation constraint, bounded by an Input-to-State Stability (ISS) convergence analysis under local strong convexity. The architecture natively emits five layers of causal telemetry—from system-level health to exact per-parameter attribution—as physical properties of the forward and backward pass, not post-hoc approximations. Empirically, correction frequency decays from 4.2 to 0.05 per epoch as the network stabilizes, consistent with the predicted ISS bound. Across 383 controlled experiments on four architectures (FC-DAG, CNN, Fat CNN, ResNet-18), ORMAS matches standard baselines on clean data while limiting accuracy decay under 40% label noise to 2.5 percentage points versus 7.8 for standard training. Under catastrophic mid-training structural collapse, ORMAS autonomously recovers to 80.3 ± 1.6% accuracy where parameter-matched baselines permanently collapse to 10.0% across all independent initializations. Under sequential task shift with no replay buffer or modularity constraint, the network self-organizes into partially factorized internal representations, achieving 58.8% mean zero-shot compositional accuracy on novel combinations versus 25% chance. These results establish architectural transparency as a structural prerequisite for autonomous robustness.

ORMAS: Neural Architectural Transparency Enables Autonomous Self-Correction · Rokib Al Dhin Raadh · Manuscript under review

1. 01

  #### Recovery from catastrophic structural collapse

  +70.3 pp

  - **Condition** — A layer surgically zeroed at epoch 101, on a network that had reached 85.1%.
  - **Result** — Diagnosed within one epoch. Recovered to 80.3% ± 1.6% by epoch 195 through 85 individually attributed corrections, recovering 94% of lost performance reclaimed.
  - **Baseline** — Parameter-matched standard CNN: 10.0% ± 0.0%, permanently, on every seed.

2. 02

  #### Recovery from simultaneous full-hierarchy collapse

  +60.8 pp

  - **Condition** — Every convolutional stage zeroed at once, rather than a single layer.
  - **Result** — Recovered to 70.8% ± 2.2%.
  - **Baseline** — Parameter-matched standard network: 10.0% ± 0.0%, permanent.

3. 03

  #### Retention through sequential task shift

  +47.3 pp

  - **Condition** — Task A then Task B, with no replay buffer, no task identifier and no modularity constraint.
  - **Result** — 94.6% of Task A retained across 3/3 seeds. Zero-shot 4-way compositional accuracy of 58.8% against 25% chance. The factorisation was not designed, it emerged from gradient conflict.
  - **Baseline** — Standard ResNet-18 retained 47.3%.

4. 04

  #### Degradation under label noise

  +5.3 pp

  - **Condition** — 40% symmetric label noise across 200 epochs.
  - **Result** — −2.5 pp from peak, without ever being told the data was corrupted.
  - **Baseline** — Standard training: −7.8 pp.

5. 05

  #### Numerical stability at graph scale

  Stable vs. NaN

  - **Condition** — A 50-node fully-connected DAG at 30% continuous label noise, 200 epochs.
  - **Result** — Stable throughout, via 22,014 autonomous corrections, each attributed and bounded.
  - **Baseline** — Standard training returned NaN.

6. 06

  #### Insensitivity to the one hyperparameter that matters

  <0.8%

  - **Condition** — Bottleneck dimension varied across a 16× range.
  - **Result** — Accuracy variance below 0.8%. The correction mechanism compensates for capacity imbalance rather than requiring it to be tuned away.
  - **Baseline** — —

All results on CIFAR-10 and CIFAR-100. Each figure carries its error bars and seed count in the manuscript, alongside the reproducibility checklist and the scripts that regenerate every run.

**WHAT THIS IS FOR**

### Four domains are closed to deep learning for one shared reason.

Not one of them is closed because the models are insufficiently accurate. Each is closed because a decision must be accountable before it is admissible, and no production architecture can produce the account. One property gates all four.

#### Medicine

A clinical model is frozen at authorisation, because updating it on the local population degrades what it knew about everyone else and because nobody can evidence what an update changed. Roughly 8% of authorised AI devices are permitted to change at all. The rest decay from the day they ship.

#### Finance

A model that cannot be audited component by component cannot be validated, and one that is not validated is not deployed. Institutions retrain on a schedule and book the destroyed prior-regime knowledge as a cost of doing business.

#### Safety-critical autonomy

Software entering a controlled environment must be able to account for its own behaviour. "It modified itself and we cannot say how" is not a finding that gets remediated. It ends the programme, and correctly so.

#### Any use of data the trainer does not own

Contracts increasingly require deletion of training data from model weights, with written attestation. The only exactly compliant method is retraining from scratch, and prevailing practice is to disclose that deletion is not feasible.

A network that can account for itself structurally does not make a better prediction. It makes the prediction admissible, and that is the thing which has been missing.

**WHAT WE ARE BUILDING**

### The published result names a broken component. The next one names the data that broke it.

The current system's diagnostic vocabulary has one subject: the component. Every treatment it applies answers the question *what is wrong with this part?* But the most common thing that goes wrong in real training is not a broken part. It is data actively damaging a part that is working correctly, and there is no verb for that yet.

The programme underway supplies it. What follows is stated as objectives and constraints rather than as a method: the mechanism is the intellectual property, and it stays in the building until it is published on our own terms.

1. 01

  #### Name the data, not only the component

  The published system resolves to a component: which part failed, when, by how much, under what limit. The next result resolves one level further, to the specific training examples that damaged that component. That is the difference between knowing a part broke and knowing what broke it.

2. 02

  #### Turn corrupted data from a liability into a contribution

  Every established method for handling bad data decides what to discard, and discards the hard examples along with the wrong ones. The objective here is the opposite: corrupted data is kept, and it raises final accuracy rather than merely being survived.

3. 03

  #### Make a data source a nameable, removable object

  Once the system can attribute to data, what a model learned from one hospital, one desk, one assay run or one licensed corpus becomes an object with a name and a boundary — which is the precondition for separating it, bounding it, and removing it on request.

4. 04

  #### Hold three constraints while doing it

  What ships stays one network of unchanged shape and unchanged inference cost. On clean data the system is identical to the published one, so nothing is paid for capability that is not being used. And every structural decision remains derivable from the logged record, because an audit trail that needs a second opaque system to explain it is not an audit trail.

**HOW IT GETS DE-RISKED**

### Four measurements decide the rest of this, and together they cost under thirty GPU-hours.

Each is falsifiable, each carries a written prediction against it, and each runs on hardware already in the building. The uncertainty in this programme is not spread across years of research. It sits in four measurements, and one of them is free.

1. 01

  Archive analysis

  The weak form of the central question, answered on a laptop against 67 archived run records. It costs nothing and nobody has done it.

  Zero GPU

2. 02

  Monitoring lead time

  How many steps before the global loss visibly degrades does per-component health cross its own threshold. Opens or closes an entire market.

  8.4 GPU-hr

3. 03

  Wrapper viability

  Whether a model we did not train retains enough component independence for the attachment to work. Decides the lowest-friction application.

  ~1 GPU-day

4. 04

  The separation study

  Whether inter-component disagreement separates mislabelled data from data that is merely hard. Gates four of the seven applications.

  ~20 GPU-hr

None has been run. A negative result on any of them narrows the programme rather than ending it: the applications that ship on the published architecture depend on none of the four.

The intellectual property position

The completed architecture is released in full on acceptance of the manuscript: reproducible, free for research and teaching, permanently. That commitment is written into the licence rather than promised. It is the credential, and it is deliberately not the moat.

What is held is the programme above: the mechanism by which attribution extends from components to data, the artefact format, the calibration procedure that turns a general bound into a validated one for a specific deployment, and the record a customer accumulates by running it. The first is a trade secret until we publish it on our own terms. The last cannot be transferred at all, because it belongs to them.

**WHAT IS NOT ESTABLISHED**

### Stated here, in the same place as the results.

A research page that lists only what worked is a marketing page wearing a lab coat. These are the boundaries of the evidence, and they are the first thing a serious evaluator should be able to find.

- Every result on this page is CIFAR-10 or CIFAR-100. No clinical, financial, biological or production data has been used.

- The architecture is demonstrated on fully-connected, convolutional and residual families. Transformers are a stated generalisation target, not a demonstrated result.

- Test-time distribution shift is named in the paper as an unrun extension. The health signal is computed from gradients and local losses, and at inference there are neither.

- Under adversarial weight injection the architecture measures 1.0 pp worse than a standard baseline. Adversarially crafted perturbations hold nominal activation statistics while moving decision boundaries, which evades precisely what this monitors. Published rather than omitted, and unmitigated.

- Whether the signal survives at small n, meaning tens of examples rather than tens of thousands, is untested.

**The scope of the claim, as the paper states it.** We do not claim state-of-the-art accuracy on clean benchmarks, and we do not claim to replace specialised noisy-label algorithms. The claim is that a single-network architecture can achieve competitive accuracy while providing mechanistically logged, per-component causal attribution that no prior single-network method offers, and that this structural transparency is what enables recovery from failures standard architectures cannot detect.

The claim is transparency. The accuracy gap is its evidence.

[Request the manuscript](/contact)

[See what is built on it](/product)

### Evaluating the mechanism?

Every engagement starts with one specific problem: a run that died, an audit question that had no answer, a dataset nobody can vouch for.

We reply within a few days. Every message is read by a person.

#### Start a conversation

Describe what has to be visible inside the models, and we will say plainly whether this is the right thing for it.

Useful to bring

- What is being trained and what has to be proven about it

- Anything already tried

[Send a message](/contact?intent=other#other)
