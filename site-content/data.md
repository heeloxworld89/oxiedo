# Data handling: three modes, separated in law

- **URL:** `/data`
- **Page title:** Data handling: three modes, separated in law — Oxiedo
- **Meta description:** Three modes with distinct legal shapes. Under a deployment licence we receive nothing, so no Article 28 relationship arises and no BAA is required.

---
DATA HANDLING

## In the ordinary case we never receive the data at all.

Most data policies describe what a company does with data it has collected. This one has to start somewhere else, because the product is deployed inside the customer environment and in that mode there is no collection to describe. The software runs where the data already is. Nothing is sent to us, nothing checks in, and nothing stops working if we disappear.

That is an architectural property rather than a promise, which matters: a commitment can be broken, and a system with no outbound route cannot be. It also changes the legal analysis rather than merely softening it, and the three modes below are separated because they genuinely differ in law.

- **Version** — 1.0
- **Last updated** — September 2026
- **Entity** — Oxiedo is a research company in formation, incorporating in Delaware. Until that completes, the controller is the UK-registered company through which we contract, named in full in any agreement and before any data reaches us
- **Governing law** — UK GDPR and the Data Protection Act 2018 apply to that controller as home law. EU GDPR applies under Article 3(2) for data subjects in the Union; the governing law of any engagement is set in its own contract

**THE THREE MODES**

### What we receive, what we are in law, and what has to be signed.

Almost every question a security review asks is answered by working out which of these three modes are in. Most engagements are Mode A, and Mode A is the one with nothing in it.

MODE A

#### Licensed deployment

The product, running in the customer environment.

- **We receive** — Nothing. No model, no data, no telemetry, no logs.
- **Our role** — We are not a processor of anything the software handles.
- **Agreement** — The licence. No DPA is required for data we never receive.

MODE B

#### Evaluation engagement

You ask us to run an assessment and the data is permitted to move.

- **We receive** — A model checkpoint and a sample of labelled data, both of which the customer selects.
- **Our role** — We are a processor, acting only on the customer's documented instructions.
- **Agreement** — A signed DPA before anything is transferred. No exceptions.

MODE C

#### This website

You send a message through a form or by email.

- **We receive** — What is typed into the form: a name, an address, an organisation, a message.
- **Our role** — We are the controller of that correspondence.
- **Agreement** — None. Ask and it is deleted.

**MODE A · LICENSED DEPLOYMENT**

### There is nothing to retain, because there was never a transfer.

#### What runs where

The software is installed and operated by the licensee, on customer infrastructure or in their own cloud tenancy. Model weights, training data, telemetry, records and logs are created in the customer environment and stay there. There is no hosted tier, no usage meter, no licence server, no crash reporter and no update check.

#### Support access

None by default. Where a support engagement requires us to see something, the customer decides what to share, shares it deliberately, and that transfer is Mode B with Mode B's terms. We do not hold standing credentials to any customer environment.

#### Your position under UK and EU GDPR

You remain the controller. A processor is a party that processes personal data on behalf of a controller; where we do not receive, store, transmit or access the data, no such processing occurs and no Article 28 relationship arises in respect of it. A DPA remains available and is required the moment any evaluation moves data to us.

#### Your position under HIPAA

A business associate is an entity that creates, receives, maintains or transmits protected health information on behalf of a covered entity. In Mode A we do none of those four things, so the relationship does not arise and no BAA is required. Where an evaluation involves PHI, we execute one first.

**MODE B · EVALUATION**

### When data does move, these are the terms — before it moves.

What we ask for

A model checkpoint, read-only, and a sample of labelled data selected by the customer. Source or site columns if the data carries them and they are deliberately included.

What we never ask for

Credentials, API keys, production access, employee personal data, or any data beyond what the specific diagnostic question requires. If a request looks broader than the question, refuse it and tell us.

In transit and at rest

TLS 1.3 in transit. AES-256 at rest. Region agreed in writing before transfer, and EU-resident by default for EU customers.

Who can access it

Only the people running the assessment, named before the engagement begins. No general access, no analytics, no internal sharing.

Retention

Deleted within 30 days of the report being delivered, or immediately on written request at any point before that.

Certification of deletion

Issued in writing on request, naming what was deleted, from which locations, by what method, and on what date.

What we keep afterwards

The report itself, and correspondence about the engagement. Nothing else. Aggregate findings are kept only in a form that identifies no organisation, model or dataset.

Breach notification

Without undue delay and within 72 hours of becoming aware, direct to the customer, with what is known and what is not yet known stated separately.

No evaluation involving personal data or regulated data begins without a signed Data Processing Agreement. We do not start work and then paper it afterwards.

**COMMITMENTS**

### Five things we will not do, in any mode.

1. 01

  Train any model on the data, including our own.

2. 02

  Transfer, sell, license or share the data with a third party for any commercial purpose.

3. 03

  Publish a result that identifies the organisation, the model or the dataset without the organisation's written permission.

4. 04

  Retain a model checkpoint, a dataset or a run log beyond the window stated below.

5. 05

  Require any connection outward from the network in order for the software to run.

The last one is the load-bearing commitment. Everything above it is a policy; that one is enforced by the software having no outbound route to begin with.

**BY SECTOR**

### The questions each regulated buyer asks first.

#### Clinical and healthcare

In Mode A no PHI is created, received, maintained or transmitted by us, so no business associate relationship arises and no BAA is required. The four verbs in the definition are the whole test, and none of them applies. Where an evaluation involves PHI, we execute a BAA before any transfer and we would expect the data use agreement and any relevant ethics approval to govern the sample sent.

#### Financial services

Position, client and transaction data does not move, which is the default assumption for this sector rather than a concession to it. For third-party risk assessment: we are a software supplier rather than a service provider in Mode A, there is no outbound connectivity to review, and no data residency question arises because there is no transfer.

#### Defence and controlled environments

The software operates in air-gapped and network-isolated environments without modification, because nothing in it requires a connection. We hold no clearance and expect none, and export-control classification of anything we supply is confirmed in writing before delivery rather than assumed.

#### Research consortia and multi-party programmes

Each participating site holds its own data and its own record. Nothing central is required for the architecture to work, and no participant sees another participant's data through us because no route exists for that.

**SUB-PROCESSORS**

### Named, with purpose and location.

No sub-processor touches anything in Mode A, because nothing reaches us. This list covers the website and any commissioned evaluation.

Form relay

- **Purpose** — Delivering contact form submissions to us as email
- **Data** — Whatever is typed into the form: name, address, organisation, message body
- **Location** — FormSubmit, operating under its own privacy terms. Disclosed because it handles the submission before we see it. It is the only third party in that path, and it is removed once the form runs on our own infrastructure. Where no third party should touch a message, the direct route is available instead

Email and correspondence

- **Purpose** — Receiving and replying to messages once delivered
- **Data** — Name, address, organisation, message body
- **Location** — A mailbox read directly. Not a shared inbox, not a CRM, not a ticketing system

Website hosting

- **Purpose** — Serving these pages
- **Data** — Request logs only. No account, no analytics, no cookies set by us
- **Location** — To be named before any engagement begins

Evaluation compute

- **Purpose** — Mode B only: running an assessment on data sent to us
- **Data** — The checkpoint and sample provided
- **Location** — Named in writing before any transfer, with region confirmed

**CERTIFICATIONS**

### What we hold, and what we do not.

Listed so nobody has to ask, and so a security review does not discover an absence halfway through.

- ●UK GDPR and the Data Protection Act 2018 — Governing framework. Applies to us as a controller established in the United Kingdom

- ●EU GDPR — Applies extraterritorially under Article 3(2), the UK being a third country to the Union

- ●Standard contractual clauses and the UK Addendum — Executed where an evaluation moves personal data out of the EEA or the UK

- ●Data Processing Agreement — Template available on request

- ○EU Article 27 representative — Not yet appointed. Required of a UK-established controller offering services into the Union, and in place before any Mode B engagement there. No UK representative is required, because we are established here

- ○CCPA and CPRA, California — Not yet engaged. Follows the Delaware entity and the San Francisco headquarters, once the statutory thresholds are met

- ○SOC 2 Type II — Not held. Planned after the first engagements fund the audit

- ○ISO 27001 — Not held. Same timing

- ○HIPAA Business Associate Agreement — Not applicable in Mode A. Available for Mode B where PHI is involved

**QUESTIONS**

### The ones a security review asks, answered here rather than by email.

#### Where is our data stored, and in which region?

In Mode A, where it already is. We do not store it, so there is no region to choose and no residency question to answer. In Mode B the region is agreed in writing before any transfer, and defaults to the EU for EU customers.

#### Does the software work in an air-gapped or network-isolated environment?

Yes, without modification. Nothing in it requires a connection: no licence check, no update check, no telemetry, no crash reporting. That is a design constraint taken from the environments this is built for, not a configuration option that could be switched the other way.

#### Do we need a DPA?

For Mode A, not for the data the software handles, because no processing occurs on our behalf. Many organisations execute one regardless as a matter of policy and we are happy to sign. For Mode B it is mandatory and precedes any transfer. A template is available on request, before any commitment.

#### Will you train on our data?

No, in any mode, under any circumstance, including for our own research. If we want to publish something learned from an engagement, we ask, we show the exact wording, and we accept no as an answer.

#### You do not have SOC 2. How do we get this through our vendor review?

By assessing what actually applies. A SOC 2 report attests to controls over data a vendor holds, and in Mode A we hold none — the review question becomes software supply chain rather than data custody. We provide reproducible hash-pinned builds, so the running binary can be verified independently, and the licence carries a reproducible build attestation. For Mode B, SOC 2 is a fair thing to want and we do not have it.

#### What happens if you are compelled to disclose our data?

In Mode A there is nothing to compel: we cannot produce what we do not hold. In Mode B, where lawfully permitted, we notify the customer before responding to any legal demand and give them the opportunity to challenge it. Where we are prohibited from notifying, we challenge that prohibition.

#### If we stop working with you, what happens to what you hold?

Mode B material is deleted on the schedule above and certified on request. Records the software generated in the customer environment belong to the customer and always did. The licence carries a perpetual right to read and reproduce them, plus a frozen reader binary the customer keeps, precisely so that ending the relationship does not endanger their own audit trail.

**DATA ENQUIRIES**

### DPA requests, deletion requests, breach reports.

Data enquiries are answered within five working days. A deletion request is acted on immediately and confirmed in writing.

Data protection requests have their own route on the contact form. It reaches the people who wrote these terms rather than a shared inbox or a ticketing queue.

[Request the DPA template](/contact)

[Licence terms](/licensing)

What this page does not cover

The commercial terms of an engagement, which are in the licence and the engagement contract. The customer's own obligations as controller of the data the software processes in the customer environment also sit outside it, and remain the customer’s throughout.

This site sets no cookies and runs no analytics. The contact form holds a submitting IP address for up to ten minutes purely to limit abusive volume, unlinked to identity and never stored alongside message content.

This policy states the position we hold ourselves to. It is under review by a qualified data protection solicitor, and the entity registration referenced above is in progress.
