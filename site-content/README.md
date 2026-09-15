# Oxiedo — site content

A plain-text mirror of every page on **oxiedo.com**. 26 pages, ~42,983 words.

**Read this instead of the codebase.** These files carry the full text of the site with the
markup stripped: every claim, figure, price, licence term and regulatory reference, in the same
hierarchy as the URLs. Nothing here is summarised or paraphrased.

## The thesis, in one line

> **The most valuable data in the world is locked up. ORMAS opens it.**

Everything on the site is downstream of that sentence, and copy that drifts from it is wrong even
when every fact in it is true. The argument runs:

1. **Data is the asset.** In every market the site addresses, the valuable thing is data.
2. **The best of it is locked.** Hospital records, bank ledgers, assay runs and licensed corpora
   sit behind regulation and contract, unused. Not because they are secret, and not because
   anyone holding them is careless.
3. **The reason is accounting, not capability.** Training on that data means handing it to a
   model that afterwards cannot say what it did with it. A custodian is right to refuse that.
4. **ORMAS supplies the missing account.** The network records what it took from every source as
   it trains, as a property of the arithmetic rather than as a log written alongside.
5. **So transparency is the mechanism, and unlocked data is the product.** That distinction is
   the one most easily lost in a rewrite. Transparency is not what is being sold.

Three vocabulary rules follow from it, and they are load-bearing:

- **Seven features, not seven products.** One architecture, one licence, nothing priced per
  feature. They carry job-names (The Proofreader, The Diary) rather than mechanism-names because
  the person who signs owns the data problem, not the mathematics.
- **Five sectors, not five solutions.** Every sector holding data has this problem. These five
  are named because the cost of the missing account is already on somebody's books there in
  figures that can be checked. Other sectors are reached by the same licence.
- **"Sectors", never "industries".** The site uses one word for this and it is that one.

## How this is generated

`python3 scripts/build-site-content.py`, run from the project root after `npm run build`.

It extracts from the **built** HTML in `dist/`, not from the source. That matters: this is an
Astro project where the long-form content lives in `src/data/*.ts` and is interpolated into page
templates at build time, so reading a single `.astro` file shows structure but not text. These
files are what a visitor actually reads.

Navigation, footer, forms and decorative markup are dropped. Accordions and FAQ `<details>`
blocks are flattened to `#### question` followed by the answer.

Everything except this README is generated. Edit the site, rebuild, regenerate — never edit a
page mirror by hand, because the next run overwrites it.

## Conventions in these files

| In the file | Was |
|---|---|
| `#### A question?` | An accordion or FAQ item; the text under it is the answer |
| `**LABEL**` | An eyebrow — a small label above a section heading |
| `> text` | A figure caption |
| `- **Term** — value` | A definition list, usually a spec or fact table |
| `→ [/path](/path)` | The destination of a card that was a link |

## Facts an agent gets wrong without reading these

- The company is **not registered**. It contracts through an existing UK-registered company; a
  Delaware C-corporation is in formation, with headquarters relocating to San Francisco.
- **No research paper is named, described or referred to anywhere on the site**, and this is
  deliberate. No title, no author byline in a citation, no venue, no preprint, and no status —
  not "under review", not "submitted", not "on acceptance". The architecture is not public yet;
  the commitment to release it in full is written into the licence and phrased as "on
  publication". Do not reintroduce any of it. Where the site needs to refer to the underlying
  document it says **"the full technical account"**.
- ORMAS is **one product under one licence**. The seven are features of it, not separate
  purchases, and nothing is priced per feature.
- Every experimental number is on **CIFAR-10/100**. No clinical, financial, defence or market data
  has ever touched the system, and every market page says so in its own words.
- There is **one adverse result** (1.0 pp worse than baseline under adversarial weight injection).
  It is published on `/technology` and referenced from the market pages.
- Headcount is disclosed on `/invest` only. No other page discusses team size.
- The copy uses no **"you"** and no **"I"**. Institutional third person throughout; "we" is the
  company. The register is enterprise rather than SaaS, and em-dash density is kept near the
  human norm deliberately.

## The pages

### Start here

| Page | Words | What is on it |
|---|---:|---|
| [`/`](home.md) | 2,956 | The thesis in full: locked data, the product, what it costs today, the five sectors, the evidence. |
| [`/technology`](technology.md) | 2,956 | The architecture, 383 experiments, the results, and what is *not* established. |
| [`/product`](product.md) | 1,724 | The seven features, in the order of what each one asks for. |

### What is sold, and on what terms

| Page | Words | What is on it |
|---|---:|---|
| [`/licensing`](licensing.md) | 2,105 | One product, one licence. The four layers and what is free. |
| [`/data`](data.md) | 2,330 | Three modes, separated in law. GDPR and HIPAA positions. Our own data handling, *not* the unlock thesis. |
| [`/faq`](faq.md) | 5,682 | 60 questions across 7 categories. The densest single file here, and the thesis questions lead it. |

### The seven features

| Page | Words | What is on it |
|---|---:|---|
| [`/product/proofreader`](product/proofreader.md) | 527 | Which samples are damaging which component. |
| [`/product/warning-light`](product/warning-light.md) | 560 | Naming the component that failed, during the run. |
| [`/product/diary`](product/diary.md) | 612 | A signed, timestamped record of every self-modification. |
| [`/product/separator`](product/separator.md) | 620 | Separating what a model learned about a source from the signal. |
| [`/product/certified-deletion`](product/certified-deletion.md) | 608 | Signed removal of a named source's contribution. |
| [`/product/federated-node`](product/federated-node.md) | 592 | Per-party attribution before aggregation destroys it. |
| [`/product/update-engine`](product/update-engine.md) | 609 | Retraining inside a bound declared in advance. |

### The five sectors

| Page | Words | What is on it |
|---|---:|---|
| [`/sectors`](sectors.md) | 556 | Index: every sector with data has this; these five pay most. |
| [`/sectors/ai-training`](sectors/ai-training.md) | 2,445 | Runs that fail silently. The buyer can name the run and find the invoice. |
| [`/sectors/regulated-finance`](sectors/regulated-finance.md) | 2,453 | Model risk under SR 26-2. |
| [`/sectors/medical-ai`](sectors/medical-ai.md) | 2,671 | PCCP evidence for models that are allowed to update. |
| [`/sectors/data-obligation`](sectors/data-obligation.md) | 2,651 | Deletion obligations against trained models. |
| [`/sectors/defense-safety-critical`](sectors/defense-safety-critical.md) | 2,577 | Accounting for what a system did to itself in the field. |

### Company

| Page | Words | What is on it |
|---|---:|---|
| [`/about`](about.md) | 1,716 | Origin, the timeline, the founder note, what we are looking for. |
| [`/invest`](invest.md) | 2,711 | Pre-seed: the round, the arithmetic, six milestones, the risk register. |
| [`/careers`](careers.md) | 988 | Open roles and the dataset partnership. |
| [`/contact`](contact.md) | 878 | Five routes in, and what each one asks for. |
| [`/press`](press.md) | 1,221 | Facts, figures, and releases written in advance. |
| [`/insights`](insights.md) | 146 | Currently empty, deliberately, and it says why. |
| [`/404`](404.md) | 89 | Not found. |
