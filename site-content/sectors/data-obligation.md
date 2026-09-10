# Data obligation: deletion evidence for AI models

- **URL:** `/sectors/data-obligation`
- **Page title:** Data obligation: deletion evidence for AI models — Oxiedo
- **Meta description:** What data is in here, and can I remove it? How ORMAS applies in data obligation: the failures, the regulation, the buyer, and the limits.

---
MARKET

## Data Obligation

- **The question** — What data is in here, and can I remove it?
- **What forces it** — GDPR · Article 17
- **The number** — $100k–$500k+to retrain a custom domain model from scratch — The only exactly compliant remedy. Plus service downtime, plus revalidation, and at frontier scale it is not done at all.

What data is in here, and can I remove it?

The obligation to delete training data from a model is already contractual and already enforceable. The prevailing industry response is to disclose that it cannot be done.

Stop asking whether a vendor can delete the data. Ask what they will put in writing, and what happens if it is tested.

Every answer in this category is approximate, and most of them say so in their own documentation. The useful comparison is not which approximation is closest, but which supplier will sign a statement about what was removed and stand behind the wording. That question narrows the field faster than any technical evaluation, and it is the question counsel is actually asking.

**WHERE THIS MARKET IS**

This is not an industry. It is a duty, and it cuts across every industry and includes companies in none of them. A hospital under a data-use agreement, a SaaS vendor with a termination clause, and a bank holding client records have the same problem and it has nothing to do with what they sell.

The qualifying test is three properties held at once: the organisation trains or fine-tunes on data it does not own outright; it carries a deletion obligation that is contractual, regulatory or both; and it is large enough that this is somebody's actual job. Contractual requirements increasingly name the artefacts explicitly — models, weights, embeddings, training artefacts and derived datasets — and require written attestation.

The technical position is well documented and unflattering. Exact unlearning means retraining from scratch, which is prohibitively expensive at any serious scale. Everything else shipping is approximate: weights that resemble what retraining would have produced. The field is currently having a credibility reckoning about its own approximations, including a position paper arguing the term "machine unlearning" is overused. Arriving in that moment with a structural answer rather than a better approximation is the position.

> A customer withdraws the data a model was trained on. ORMAS removes just their contribution and issues signed proof, instead of retraining the whole model from scratch for $100,000–$500,000.

**WHAT IT COSTS**

### The numbers this market already publishes about itself.

$100k–$500k+

to retrain a custom domain model from scratch

The only exactly compliant remedy. Plus service downtime, plus revalidation, and at frontier scale it is not done at all.

6–21%

label error rates found in real datasets

Across published audits, with at least 3.3% average across ten commonly-used benchmarks and at least 6% of the ImageNet validation set. The same detection signal that finds these finds memorised and atypical data.

Recurring

the obligation, not the incident

Every new contract with a deletion clause is another metered event. The cost scales with the customer's contract count rather than with any decision they make about infrastructure.

**WHAT BREAKS**

### Four things that go wrong, and why none of them is a tooling problem.

1. 01

  #### There is no object to delete

  When a model trains, a source's contribution is distributed across billions of coefficients in ways that were never separable. Deleting a row from the training set does nothing to the trained artefact. The clause is enforceable, the obligation is real, and the mechanism to satisfy it does not exist in a standard architecture.

2. 02

  #### The compliant remedy costs more than the deal

  Retraining from scratch is the only method that unambiguously satisfies an erasure obligation. For most institutions the cost of honouring one request exceeds the value of the contract that created it, which means the obligation is signed and then not met.

3. 03

  #### Best practice is currently to disclose the failure

  Vendor guidance now advises disclosing where deletion is not feasible because data has already been incorporated into model weights. That is honest, and it is an admission that an entire category of contractual commitment is routinely unenforceable in practice.

4. 04

  #### It propagates through procurement, all at once

  The moment one buyer in a sector demands attestation, every vendor in that sector needs an answer. Compliance requirements move through supply chains faster than product roadmaps, and the vendors who cannot produce an answer start looking on the same day.

**WHAT IS USED TODAY**

### The current answers, and what each one genuinely does.

These are not strawmen. Each is used because it works at the job it was built for. The question is what remains unanswered afterwards.

#### Retraining from scratch

The gold standard, and the only exact method. Six figures per request, plus downtime and revalidation, and structurally unavailable at large scale.

#### Sharded training such as SISA

Splits the training set into disjoint shards and retrains only the affected one, cutting cost by roughly a factor of the shard count. Genuine engineering, and it constrains the architecture and the data pipeline before any request arrives.

#### Approximate unlearning

Influence functions, gradient rollback and their descendants produce weights that resemble what retraining would have produced. Recent work reports roughly half the cost of retraining. Every one of these describes itself as approximate, and a regulator asking for an attestation is not asking for a resemblance.

#### Deleting from the data lake and hoping

Common, and it satisfies the letter of a database-oriented reading of the obligation while leaving the trained model exactly as it was. It is the gap between what was deleted and what still knows that creates the exposure.

**WHAT ORMAS DOES**

### Certified Deletion routes the memorisable contribution into a named, removable structure, and hands the requester a signed certificate.

1. 01

  #### Route the memorisable part into a structure that can be removed

  Data that is redundant with the rest of the corpus was never the exposure: the model would have learned the same thing from a thousand other examples. Data that is unique, atypical or in tension with the corpus cannot be generalised, so it is memorised — and memorisation is what creates the exposure. The detection signal fires on exactly that population.

2. 02

  #### Bind the structure to the data that justified it

  Each isolated component carries a hash of the specific sample set that caused it to be allocated. The binding is recorded when it happens, not reconstructed afterwards, which is what makes a certificate mean something.

3. 03

  #### Delete the structure, sign what left

  Removal takes out the source-specific capacity and produces a signed record of precisely what was removed, together with a bounded statement of what changed in the remaining model. No retraining. The cost stops scaling with the size of the model and starts scaling with the size of the request.

4. 04

  #### The claim stays narrow, deliberately and permanently

  We route the memorisable portion of the training signal into named, bounded, deletable structures; deleting the structure removes the source-specific capacity; and a signed record of what was removed is issued, plus a bounded statement of what changed. We do not say the data is gone, we do not claim no trace remains, and we do not call it exact unlearning.

**THE OBLIGATIONS**

### What is required, and from when.

#### GDPR · Article 17

The right to erasure, now being read against trained models rather than only against databases. The question a supervisory authority asks is whether a person's contribution can be removed, and the honest answer from most vendors is currently no.

#### Contractual deletion and attestation clauses

Increasingly explicit about scope: models, model weights, embeddings, training artefacts and derived datasets containing customer data, on termination, with written attestation. These are negotiated commercially and enforced commercially, without waiting for a regulator.

#### Unlearning-ready architectures

The compliance industry named this category and forecast it becoming a requirement before any supply side existed. A named category with anticipated regulation and nothing to buy is a rarer situation than a large addressable market.

**APPLICATIONS IN SCOPE**

### 5 of the seven apply here. This is the one to start with.

Lead application

#### [Certified Deletion](/product/certified-deletion)

What data is in here, and can I remove it?

Removes a named source's contribution and issues a signed certificate of exactly what was removed, with a bounded statement of what changed, and without retraining.

What it asks for The Separator, plus a deletion policy

- [The Proofreader](/product/proofreader)Which samples are damaging which component?

- [The Separator](/product/separator)Which part of this is the source, not the signal?

- [The Diary](/product/diary)What did the model do to itself, and when?

- [The Federated Node](/product/federated-node)Can we train together without pooling the data?

**THE OBJECTIONS**

### Four objections, answered before they are raised.

A repeated objection is a gap in what we have explained, not a nuisance. These are the four we expect in this market, in the words a buyer actually uses.

01 — Our lawyers will not accept anything short of deletion.

Then they are right, and they should not accept what is currently on the market either, because none of it is deletion. What we would put in writing is narrower and harder to attack: the memorisable portion of a source's signal is routed into a named, bounded structure; removing that structure removes the source-specific capacity; and a signed record of what was removed is issued, with a bounded statement of what changed. We do not say the data is gone.

02 — How is this different from the approximate unlearning methods already published?

Those operate after the fact on a model that was trained without any separation, and they produce weights that resemble what retraining would have produced. Resemblance is the whole problem. This separates during training, so there is an object bound to a recorded sample set before any request arrives. The difference is not accuracy of the approximation; it is that there is something to point at.

03 — What happens to data that was not memorised?

It stays, and that is the argument rather than an evasion. Data redundant with the rest of the corpus was never the exposure, because the model would have learned the same thing from a thousand other examples, and nobody's privacy is violated by a fact learned everywhere. What creates exposure is data unique enough that the model had to memorise it, and that is exactly the population the detector fires on.

04 — Has a data protection authority signed off on this wording?

No, and no data protection lawyer has yet told us what may be certified or in what words. That consultation gates this product more tightly than the engineering does. A certificate whose wording has not been checked is worse than no certificate, because it creates liability instead of removing it.

**WHO BUYS IT**

### General counsel, or the data protection officer

- **Sits in** — Legal, privacy or compliance, in vertical SaaS with AI features, HR and recruiting technology, legal technology, healthcare AI, or any financial services model team handling client data.
- **Budget** — Compliance. Already exists, and does not need to be argued for.
- **Trigger** — An enumerable event: a contract signed with a deletion-and-attestation clause, an erasure request touching a trained model, a data licence terminating, an acquisition where data rights do not transfer, or a competitor being asked and unable to answer.

We signed the clause. Legal is now asking me how we actually do it.

General counsel, or the data protection officer

**MAKING THE CASE**

### Nobody signs this alone.

Nothing at this size is bought by one person. These are the lines for the other four, in the terms each of them is actually measured on.

General counsel

Wording they can defend

A narrow, specific statement about what was removed, with a bounded statement of residual effect, rather than a claim that will not survive being tested.

The data protection officer

An answer to an erasure request that touches a model

A named structure bound to a recorded sample set, removed on request, with a signed record of what left.

The CFO or commercial owner

The cost comparison

Retraining from scratch is $100,000–$500,000 per request and the obligation recurs. The cost stops scaling with the model and starts scaling with the request.

Sales

To stop losing deals on a clause

An answer to the deletion-and-attestation clause that increasingly appears in enterprise contracts, at the point where a competitor has to disclose that they cannot comply.

**WHAT CAN BE SHOWN**

### No customer references. An unusual amount of everything else.

Nobody has deployed this, and we are not going to imply otherwise. What we can put in front of an evaluation is the following, and most of it needs no contract first.

- The exact wording we would put in a certificate, before any engagement

- The scope statement: what is claimed, and the four things we explicitly will not say

- The binding record format: a hash of the sample set that justified each removable structure

- The manuscript and the reproducible experiment programme

- A written position on residual influence, including the parts that are argument rather than proof

Not a fit where

- Anyone who wants to be told their data is gone. We will not say it, and a supplier who does is selling a liability.

- Organisations that train only on data they own outright. The obligation does not attach, and this is a cost with no matching risk.

- Deployments that need a certificate this quarter. The legal opinion that governs the wording has not been obtained yet, and we would not issue one before it is.

**WHAT WE DO NOT CLAIM**

### The boundaries, stated rather than discovered.

In markets whose central complaint is that vendors overstate their approximations, stating our own limit precisely is the position rather than a caveat on it.

- This is not proof that a source's data never influenced the model. Deleting a bound component removes the source-specific capacity; it does not prove no trace remains in the shared model.

- This is not exact unlearning, and it is not a claim to be more private than shared weights. Whether bound capacity has a smaller leakage surface is an empirical question we have designed and not run.

- "Provably low-impact" is currently an argument rather than a proof. Establishing a bound on the residual influence of removed-but-redundant data is a genuine open research problem.

- No data-protection lawyer has yet told us what may be certified, and in what words. Until that answer exists this is a strong story rather than a certifiable product.

Sources

- [Machine unlearning doesn't do what you think · lessons for policy and research](https://arxiv.org/pdf/2412.06966)

- [Unlearning at scale · the right to be forgotten in LLMs](https://arxiv.org/pdf/2508.12220)

- [Algorithms that forget · machine unlearning and the right to erasure](https://www.sciencedirect.com/science/article/pii/S026736492300095X)

- [Pervasive label errors in test sets destabilize ML benchmarks](https://arxiv.org/abs/2103.14749)

Figures attributed to the ORMAS experiment programme are measured on CIFAR-10 and CIFAR-100 across 383 controlled runs, and are labelled as such wherever they appear.[The paper](/technology) carries the conditions for each.

[Talk to us about this market](/contact)

[See the product](/product)

### Working in Data Obligation?

Every engagement starts with one specific problem: a run that died, an audit question that had no answer, a dataset nobody can vouch for.

We reply within a few days. Every message is read by a person.

#### Start a conversation

Describe what has to be visible inside the models, and we will say plainly whether this is the right thing for it.

Useful to bring

- What is being trained and what has to be proven about it

- Anything already tried

[Send a message](/contact?intent=other#other)
