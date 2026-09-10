# Oxiedo — site content

A plain-text mirror of every page on **oxiedo.com**. 26 pages, ~43,088 words.

**Read this instead of the codebase.** These files carry the full text of the site with the
markup stripped: every claim, figure, price, licence term and regulatory reference, in the same
hierarchy as the URLs. Nothing here is summarised or paraphrased.

## How this is generated

`python3 scripts/build-site-content.py`, run from the project root after `npm run build`.

It extracts from the **built** HTML in `dist/`, not from the source. That matters: this is an
Astro project where the long-form content lives in `src/data/*.ts` and is interpolated into page
templates at build time, so reading a single `.astro` file shows structure but not text. These
files are what a visitor actually reads.

Navigation, footer, forms and decorative markup are dropped. Accordions and FAQ `<details>`
blocks are flattened to `#### question` followed by the answer.

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
- The manuscript is **under peer review and not public**. The release is committed to acceptance.
  Do not name a venue, and do not describe anything as a preprint.
- ORMAS is **one product under one licence**. The seven applications are not separate purchases.
- Every experimental number is on **CIFAR-10/100**. No clinical, financial, defence or market data
  has ever touched the system, and every market page says so in its own words.
- There is **one adverse result** (1.0 pp worse than baseline under adversarial weight injection).
  It is published on `/technology` and referenced from the market pages.
- Headcount is disclosed on `/invest` only. No other page discusses team size.

## The pages

### Start here

| Page | Words | What is on it |
|---|---:|---|
| [`/`](home.md) | 2,752 | The pitch in full: the claim, what it costs today, the five markets, the evidence. |
| [`/technology`](technology.md) | 2,921 | The architecture, 383 experiments, the results, and what is *not* established. |
| [`/product`](product.md) | 1,575 | The seven applications, in the order of what each one asks for. |

### What is sold, and on what terms

| Page | Words | What is on it |
|---|---:|---|
| [`/licensing`](licensing.md) | 2,162 | One product, one licence. The four layers and what is free. |
| [`/data`](data.md) | 2,378 | Three modes, separated in law. GDPR and HIPAA positions. |
| [`/faq`](faq.md) | 5,061 | 55 questions across 7 categories. The densest single file here. |

### The seven applications

| Page | Words | What is on it |
|---|---:|---|
| [`/product/proofreader`](product/proofreader.md) | 605 | Which samples are damaging which component. |
| [`/product/warning-light`](product/warning-light.md) | 642 | Naming the component that failed, during the run. |
| [`/product/diary`](product/diary.md) | 688 | A signed, timestamped record of every self-modification. |
| [`/product/separator`](product/separator.md) | 706 | Separating what a model learned about a source from the signal. |
| [`/product/certified-deletion`](product/certified-deletion.md) | 676 | Signed removal of a named source's contribution. |
| [`/product/federated-node`](product/federated-node.md) | 661 | Per-party attribution before aggregation destroys it. |
| [`/product/update-engine`](product/update-engine.md) | 684 | Retraining inside a bound declared in advance. |

### The five markets

| Page | Words | What is on it |
|---|---:|---|
| [`/sectors`](sectors.md) | 538 | Index: the same question in five vocabularies. |
| [`/sectors/ai-training`](sectors/ai-training.md) | 2,495 | Runs that fail silently. The buyer can name the run and find the invoice. |
| [`/sectors/regulated-finance`](sectors/regulated-finance.md) | 2,507 | Model risk under SR 26-2. |
| [`/sectors/medical-ai`](sectors/medical-ai.md) | 2,727 | PCCP evidence for models that are allowed to update. |
| [`/sectors/data-obligation`](sectors/data-obligation.md) | 2,707 | Deletion obligations against trained models. |
| [`/sectors/defense-safety-critical`](sectors/defense-safety-critical.md) | 2,642 | Accounting for what a system did to itself in the field. |

### Company

| Page | Words | What is on it |
|---|---:|---|
| [`/about`](about.md) | 1,656 | Origin, the timeline, the founder note, what we are looking for. |
| [`/invest`](invest.md) | 2,757 | Pre-seed: the round, the arithmetic, six milestones, the risk register. |
| [`/careers`](careers.md) | 1,030 | Open roles and the dataset partnership. |
| [`/contact`](contact.md) | 924 | Five routes in, and what each one asks for. |
| [`/press`](press.md) | 1,291 | Facts, figures, and releases written in advance. |
| [`/insights`](insights.md) | 182 | Currently empty, deliberately, and it says why. |
| [`/404`](404.md) | 121 | Not found. |

