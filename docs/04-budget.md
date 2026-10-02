# 04 · Budget Requirements

**Status:** Working assumptions, not researched market rates (plan §14). Every salary line must be checked against what people in Sagara will actually accept before the investor meeting. Figures in ₹.

## 1. The decision the budget needs (§14.1)

Two versions exist because two different conversations produced them. The difference nearly doubles the ask.

| Line | Basis | **A — Lean** (6 mo) | **B — Five-person team** (6 mo) |
|---|---|---:|---:|
| Taluk Editor | ₹25,000 × 6 | 1,50,000 | 1,50,000 |
| Field Operator | ₹15,000 × 6 | 90,000 | 90,000 |
| Data, travel, fuel | ₹5,000 × 6 | 30,000 | 30,000 |
| Equipment (one-time) | camera/phone, mic, light, laptop | 70,000 | 70,000 |
| Central production | A: one editor-producer ₹35,000/mo · B: ₹1,55,000/mo (below) | 2,10,000 | 9,30,000 |
| Founder salary (nominal) | ₹40,000 × 6 | 2,40,000 | 2,40,000 |
| Hosting, platform, software | ₹6,000 × 6 | 36,000 | 36,000 |
| Buffer bank | 15 evergreen pieces, pre-launch | 60,000 | 60,000 |
| Contingency | ~10% | 88,000 | 1,61,000 |
| **Total six-month pilot** | | **9,74,000** | **17,67,000** |

**B — central team monthly (placeholder assumptions, not set in discussion):** content head 40,000 · daily scriptwriter 25,000 · rewriter 30,000 · editor 30,000 · AI visuals 30,000 (internal rate) = **₹1,55,000/mo**.

Founder's own earlier estimate for the taluk roles was ~₹20,000 and ~₹15,000; the table uses ₹25,000 for the Editor.

### 1.1 Middle path (for decision, not decided — §14.3)

Founder acts as content head; one scriptwriter covers daily + rewriting; editor; AI visuals part-time. Add roles as volume and the second taluk arrive.

| Central role | Monthly |
|---|---:|
| Scriptwriter (daily + rewrite) | 30,000 |
| Editor | 30,000 |
| AI visuals (half internal rate) | 15,000 |
| **Central production / month** | **75,000** |
| **× 6** | **4,50,000** |

| Line | **C — Middle path** (6 mo) |
|---|---:|
| Taluk unit (editor, operator, running) | 2,70,000 |
| Equipment | 70,000 |
| Central production | 4,50,000 |
| Founder salary | 2,40,000 |
| Hosting, platform, software | 36,000 |
| Buffer bank | 60,000 |
| Contingency ~10% | 1,13,000 |
| **Total** | **≈ 12,39,000** |

> Recommendation to carry into the meeting: present **one** figure. If C is chosen, show A and B as the bounds and C as the plan, with the trigger that adds roles ("second editor only when daily volume actually overloads the first" — §7.1).

## 2. Why founder salary and AI rates are in the budget (§14.4)

Costing them at zero hides the true unit cost, breaks the economics when the network scales and those roles must be hired, and reads as a red flag. Both are budgeted openly at nominal, below-market levels. A founder can defer pay later; a salary line never budgeted is hard to add once the investor has anchored lower.

## 3. Technology & platform line — detail

The ₹6,000/month hosting line covers the pilot. Breakdown and what is deliberately excluded:

| Item | Monthly | Note |
|---|---:|---|
| App hosting (one small VM / PaaS) | 1,500 | Next.js + SQLite, single instance |
| Object storage + backups (≈500 GB raw footage/mo growth) | 1,500 | Nightly copy of DB and assets |
| Domain, DNS, TLS, email | 300 | — |
| Kannada TTS (≈60 min narration/mo) | 1,000 | Usage-based; brand voice fixed |
| AI image/video generation credits | 1,200 | History recreations + category ad templates; bespoke client work billed on |
| Editing software / fonts / stock & music licences | 500 | Paid or properly free-licensed only (§6.1) |
| **Total** | **6,000** | |

Excluded on purpose (pilot): paid analytics tools, CRM, invoicing SaaS (built in), platform API costs (manual publishing), legal/CA retainers (below).

## 4. One-time and pre-launch costs

| Item | ₹ | Source |
|---|---:|---|
| Equipment: phone/camera, mic, light, laptop | 70,000 | §14.1 |
| Buffer bank: 10–15 evergreen pieces | 60,000 | §4.4, §13.4 |
| Brand package: logo, titles, transitions, AI voice selection | included in AI visuals | §11.1 |
| CA + media lawyer engagement (entity, GST, contracts, consent templates, election law) | **Open** — not in §14; recommend 50,000–1,00,000 contingency draw | §12.1 |
| Trial week stipends for 4–6 candidates | ~10,000 | §7.4 |

## 5. Revenue at maturity — one taluk (§14.2)

| Line | Basis | Monthly |
|---|---|---:|
| Local advertisers | 25 × ₹3,000 | 75,000 |
| Event coverage | 4 × ₹8,000 | 32,000 |
| AI ads and production | 6 × ₹3,000 | 18,000 |
| Classifieds and listings | recurring small slots | 10,000 |
| **Monthly revenue at maturity** | | **1,35,000** |
| Taluk unit monthly cost | salaries + running | 45,000 |
| **Taluk unit covers own cost** | | **Month 4–5** |

Month-by-month reality (§15.3): M1 no audience, nobody buys · M2 audience building, first conversations · M3 first signings paid monthly in arrears · M4–5 unit covers itself · M6 full picture.

**The assumption the whole case rests on: 25 advertisers at ₹3,000.** Validate against Sagara's actual shops before the meeting (worksheet SL-9 in the PRD; `/ops/sales/validation` in the app).

## 6. Reading the numbers honestly (§14.3)

- The taluk unit is the cheap half (₹45,000/mo) and is covered by month 4–5.
- The central engine costs more than the taluk. That is the honest shape of the model — and why taluk two onwards is far cheaper than taluk one.
- Under **A**, one mature taluk roughly covers the whole running cost. Under **B**, it does not; the team pays for itself only once it serves several taluks. Say this plainly.

### 6.1 Break-even by number of taluks (illustrative)

Central monthly cost ÷ (taluk revenue at maturity − taluk unit cost) = taluks needed for the engine to pay for itself.

| Plan | Central monthly (incl. founder, hosting) | Surplus per mature taluk | Taluks to cover engine |
|---|---:|---:|---:|
| A — Lean | 35,000 + 40,000 + 6,000 = 81,000 | 90,000 | **1** |
| C — Middle | 75,000 + 46,000 = 1,21,000 | 90,000 | **2** |
| B — Five-person | 1,55,000 + 46,000 = 2,01,000 | 90,000 | **3** |

## 7. Sensitivity (what moves the case)

| Variable | Base | Pessimistic | Effect on monthly revenue |
|---|---|---|---|
| Advertisers | 25 | 12 | −39,000 |
| Ticket | ₹3,000 | ₹2,000 | −25,000 |
| Events | 4 | 2 | −16,000 |
| AI ads | 6 | 3 | −9,000 |
| Combined pessimistic | | | ≈ 46,000/mo — unit roughly breaks even, engine does not |

Conclusion: the unit survives the pessimistic case; the engine's recovery timeline depends entirely on taluk count, which is why the ask funds the pilot, not the network, and why "first right on the network round" (§15.2) is part of the ask.

## 8. Open money items (§10.7, §17.3)

- Rupee values per slot per tier — **after** pilot audience numbers.
- Commission for taluk staff on local sales, and rate.
- Payment terms and collection owner.
- Investment amount and what portion it buys.
- Number of taluks in phase one and timeline.
- CA/legal engagement cost line.
