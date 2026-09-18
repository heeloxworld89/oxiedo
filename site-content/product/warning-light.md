# The Warning Light: naming the component that failed

- **URL:** `/product/warning-light`
- **Page title:** The Warning Light: naming the component that failed — Oxiedo
- **Meta description:** Is this run failing, and where? The Warning Light is one of the seven features of ORMAS, under one architecture and one licence.

---
AN APPLICATION OF ORMAS

## The Warning Light

THE QUESTION IT ANSWERS

Is this run failing, and where?

- ACCOUNT

01

### The problem

Silent mid-training collapse costs $16,000 to $24,000 in recovery compute per incident. Conventional monitoring reports that a run has failed. The Warning Light isolates the collapse to a named component.

02

### What it delivers

A precise, per-component health signal emitted continuously during training. It names which component is failing, not just that the run is failing. Measured: two convolutional stages destroyed at step 39,491; both diagnosed dead at step 39,493, two steps later, each named individually. When a divergence occurs, the operator rolls back hundreds of steps rather than thousands.

An archived run in which two convolutional stages are destroyed at epoch 101. The alarm names both damaged components at step 39,493 — two steps after the damage — while the parameter-matched baseline sits at chance level for the rest of the run with nothing to report.

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

[The full replay page](/black-box) carries three further scenarios, including the adversarial injection where this architecture measures worse than the baseline.

03

### Who it is for

A fit for

- teams where a single failed run exceeds $50,000 in compute

- organisations running large fine-tunes without dedicated infrastructure research teams

- anyone who has experienced a silent divergence and had no signal it was coming until the loss spiked

Not a fit for

- frontier labs who can build their own custom internal tooling

- teams whose training runs cost less than $10,000 each

04

### How it works

The Warning Light is built from one capability of the ORMAS architecture. Each is a property of how the network trains, not a tool bolted on afterwards.

1. 01 — ACCOUNT — Emit a bounded, timestamped, causally attributed record of every modification the network made to itself.

05

### Where it is bought

This is why ORMAS is one product rather than seven. The Warning Light is the same mechanism in every row below; only the customer’s own vocabulary changes.

- **AI lab** — a $200M run failing silently
- **SaaS** — a fine-tune failing

06

### Markets using it

- [AI Training](/sectors/ai-training)Segments by scale*lead*

07

### Questions

#### Is this a separate product?

No. ORMAS is one product under one licence, and The Warning Light is one of the seven things it is proven at. An institution turns on what its situation needs; there is no separate purchase, no separate integration and no separate contract.

#### Does this only work in my industry?

The mechanism does not know what industry it is in. What changes between them is the noun, not the method. The table above is the same mechanism with each sector's own vocabulary substituted, which is why one product serves all of them.

#### Where does it run, and does our data leave?

On customer infrastructure. The licence is on-premise and per-institution: nothing is sent to a third party, there is no hosted tier, and no usage metering phones home. In a hospital enclave or a controlled environment, that is a requirement rather than a preference.

### Pre-book ORMAS with The Warning Light in scope.

Every engagement starts with one specific problem: a run that died, an audit question that had no answer, a dataset nobody can vouch for.

We reply within a few days. Every message is read by a person.

#### Pre-book a deployment

One licence, no price list. Terms are agreed per institution and written into the contract, and pre-booking fixes them ahead of general availability.

Useful to bring

- What is being trained, and roughly at what scale

- The obligation driving it: SR 26-2, the EU AI Act, Article 17, a PCCP, an internal policy

- What a failed run currently costs to diagnose

[Pre-book a deployment](/contact?intent=pre-book#pre-book)
