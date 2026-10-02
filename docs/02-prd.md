# 02 · Product Requirements Document (PRD)

**Product:** Sagara Dhwani Platform — the operating system of the Taluk Channel Network
**Owner:** Raghu (founder) · **Status:** Draft v1 for the Sagara pilot · **Source:** Plan §2, §4, §7, §8, §10, §13, §15

---

## 1. Problem

Around 240 taluks in Karnataka have no daily voice of their own (§2.1). Local cable has died, newspapers have thinned out, and social media is noise with nobody accountable. A road stays broken for two years because nobody films it; a hundred-year-old story dies with the last person who remembered it.

The network answers this with one brand, one channel per taluk, publishing every single day, produced centrally by a small state team. The operational difficulty is not creative — it is logistical: getting footage from two people with a phone to a published piece the same evening, every day, across (eventually) 240 units, without borrowing footage, without breaking election law, and with every rupee of local advertising invoiced.

The platform exists to make that logistics repeatable.

## 2. Goals and non-goals

### Goals (pilot)
1. **Prove the daily promise** — a two-person taluk unit publishes every day for six months (§13.2).
2. **Prove advertisers pay** — first signings by month 3, taluk unit covers its own cost by month 4–5 (§14.2).
3. **Measure turnaround obsessively** — footage-in → published-out, same day (§8.3).
4. **Make the rules unbreakable in software** — green/amber/red, central publishing, central political ads, fixed rate card.
5. **Build the archive from day one** — every identity piece tagged and findable (§4.5).
6. **Write the playbook as a by-product** — decisions, open items, founder-unblock log (§13.1).

### Non-goals (pilot)
- Automated multi-platform publishing integrations (state desk posts manually; URL recorded).
- Subscriptions or memberships (§10.1 — people will not pay for local news they expect free).
- District channel as a separate feed (§3 — folds into taluk feed at first).
- Podcast tooling (§7.5 — later stage).
- A public comments or social layer on the channel page (platforms already provide this).

## 3. Users and personas

| Persona | Where | Primary jobs | Pain if the platform fails |
|---|---|---|---|
| **Taluk Editor** | Sagara, on a two-wheeler | Fix the day's line-up; verify claims; write briefs; maintain week-ahead | Misses a day; publishes something unverified |
| **Field Operator** | Sagara | Capture; name files; upload before cutoff; capture log; equipment check | Footage late or unusable; story rolls |
| **Content Head** | State hub | Morning tagged list; approve every script; political verifier | Becomes the bottleneck |
| **Scriptwriters** (daily, rewriter) | State hub | Write Kannada scripts from facts; retell state stories with taluk context | Accidental line-by-line translation = copyright exposure |
| **Editor / AI Visuals** | State hub | Cut, graphics, AI voice, posters, history recreations | Amber footage slips through |
| **Production Desk Owner** | State hub | Cutoff discipline; publishing schedule; turnaround | No visibility into what is late |
| **Sales & Collections Owner** | State hub | Sell on rate card; invoice; collect; report | Cash leaks; advertisers lean on coverage |
| **Founder** | Everywhere | Decisions; unblock; investor reporting | Model works only because of him and nobody knows why |
| **Investor** | Meeting room | Read month-3 checkpoint | Numbers not in a consistent format |
| **Viewer** (Sagara resident) | Phone | Open the channel every day; recognise their place | Channel feels like a repeater of state news |
| **Advertiser** (shop owner) | Sagara | One conversation; monthly package; see results | Asked for cash; promised coverage |
| **Local creator** | Sagara | Give standing permission once; be credited | Clip used without credit |

## 4. Product principles

1. **Central authority, local judgement.** The taluk decides *what* is covered; the state decides *whether* it publishes. The UI never lets a taluk role publish, clear amber, discount, or touch political inventory.
2. **The cutoff is a wall.** Everything that matters has a timestamp against the cutoff.
3. **Nothing borrowed.** Every non-own asset has a classification and, if amber, a clearance record.
4. **Facts first.** The script tool enforces the retelling workflow (§5.2): facts are extracted before a script is written.
5. **Honest stubs.** Unbuilt integrations are visible as manual steps with evidence fields, never hidden.
6. **Archive by default.** Publishing an identity piece archives it.

## 5. Feature requirements

Priority: **P0** = pilot cannot run without it · **P1** = needed within pilot · **P2** = network phase.

### 5.1 Daily line-up & content pipeline (§4, §8.1)
| ID | Requirement | Priority |
|---|---|---|
| LU-1 | Content Head publishes a dated **tagged list** of state/central stories; tags: farming, coastal, industrial, education, (extensible) | P0 |
| LU-2 | Taluk Editor builds the **day's line-up**: 2–3 local stories, 1 identity piece (daily during a festival), 2–3 state pieces selected from the tagged list, optional district item | P0 |
| LU-3 | Each story has a **layer** (daily pulse / identity / participation), optional **bucket** (six identity buckets), **source**, and **status** (idea → assigned → captured → scripted → approved → produced → published / killed) | P0 |
| LU-4 | Story **brief**: angle, key line, clip order; interviewee full name, designation, place | P0 |
| LU-5 | **Week-ahead** view: identity stories, festivals, events | P1 |
| LU-6 | **Buffer bank**: evergreen pieces produced pre-launch; one-click "use buffer" when a day is at risk | P0 |
| LU-7 | **Daily-promise indicator**: today published? days published / days elapsed; red when a day has no published story by schedule time | P0 |
| LU-8 | Pacing rule surfaced: warn when more than 3–4 identity buckets are scheduled in a week (§4.2) | P2 |

### 5.2 Capture log, cutoff & turnaround (§7.2, §8.1–8.3)
| ID | Requirement | Priority |
|---|---|---|
| CL-1 | Field Operator logs each **capture**: story, file name (validated against standard `YYYYMMDD_TALUK_STORY_SEQ`), type (video/still/audio), duration, uploaded-at | P0 |
| CL-2 | Configurable **daily cutoff time** per taluk; the unit confirms by cutoff what is coming "even if the answer is nothing" | P0 |
| CL-3 | **Cutoff sweep**: stories whose footage arrived after cutoff roll to next day automatically and are flagged | P0 |
| CL-4 | **Turnaround** computed per story (first footage-in → published-at) and rolled up per day: median, same-day %, two-day+ count | P0 |
| CL-5 | Nightly **equipment check** log; faults reported same day | P1 |
| CL-6 | **On-call rotation** (weekly) and night call-out threshold recorded | P1 |
| CL-7 | Capture protocol (framing, duration, naming) shown inline on the capture form | P1 |

### 5.3 Scripts, approvals & voice (§5, §7.1)
| ID | Requirement | Priority |
|---|---|---|
| SC-1 | Script editor with mandatory **facts panel** (bullet facts + primary source) before the script body unlocks | P0 |
| SC-2 | **Approval gate**: Content Head approves every script before "voice" step; political stories require the named verifier | P0 |
| SC-3 | **Phonetic field** for proper nouns and numbers for Kannada TTS (§5.4) | P1 |
| SC-4 | Script flagged "retold" must carry at least one primary-source cross-check | P1 |
| SC-5 | AI voice: one configured brand voice; interviews stay human — stored as a per-story flag | P1 |

### 5.4 Footage clearance — green / amber / red (§6)
| ID | Requirement | Priority |
|---|---|---|
| FC-1 | Every non-own asset attached to a story carries a **classification**: green / amber / red and a **source type** from the §6 tables | P0 |
| FC-2 | **Amber** blocks publish until the central desk records a clearance (short · source named · our commentary longer than clip) | P0 |
| FC-3 | **Red** cannot be attached; the UI explains why with the §6.3 reason | P0 |
| FC-4 | **Permission checklist** (§6.7) must be completed for anything not shot by us | P0 |
| FC-5 | **AI-in-news guard**: an asset marked AI-generated cannot be attached to a daily-pulse story | P0 |
| FC-6 | **Takedown log**: rights complaint → item marked down same day, reason, outcome | P1 |
| FC-7 | Repeated borrowing per unit surfaced on the dashboard (§6.6 "serious matter") | P2 |

### 5.5 Creators & consent (§5.6, §6.7, §9)
| ID | Requirement | Priority |
|---|---|---|
| CR-1 | **Creator roster** per taluk (target 5–6): name, handle, platform, standing-permission reference (WhatsApp screenshot/text), date | P0 |
| CR-2 | **Consent records** for viewer submissions and interviewees; **parental consent** for minors | P0 |
| CR-3 | Story ↔ creator link enforces on-screen credit field | P1 |

### 5.6 Sales, rate card & invoicing (§10, §12.2)
| ID | Requirement | Priority |
|---|---|---|
| SL-1 | **Rate card** per tier (taluk/district/state) with slot types (§10.4); rupee values nullable until pilot audience numbers exist (§10.5) | P0 |
| SL-2 | **Prohibited categories** list attached to the rate card and shown at advertiser creation; central-only flag for "against nation/culture" decisions (§9.4) | P0 |
| SL-3 | **Advertiser** record: business, category, contact, tier, status (prospect → free-month → active → lapsed) | P0 |
| SL-4 | **Contract**: slot(s), months (min 1), category exclusivity, start, value; **free first month** supported | P0 |
| SL-5 | **Invoice** generation (GST fields), **payment** recording with bank reference; outstanding/overdue view | P0 |
| SL-6 | **No cash** rule: payment method excludes cash; UI copy states the rule | P0 |
| SL-7 | **Political inventory**: separate slot family, central-only, requires MCMC certificate reference and "paid for by" disclosure before activation; blocked in 48-hour silence window | P1 |
| SL-8 | **Paid label** flag on dedicated stories and sponsored segments | P0 |
| SL-9 | Validation worksheet for the **25 advertisers × ₹3,000** assumption: list Sagara businesses by category and likely ticket (§14.2) | P1 |
| SL-10 | Commission on local sales — recorded as **Open** decision; field present but disabled | P2 |

### 5.7 Identity archive (§4.5, §10.1)
| ID | Requirement | Priority |
|---|---|---|
| AR-1 | On publish, identity pieces are **archived** with bucket, tags, places, people, era, anniversary date | P0 |
| AR-2 | Search/filter by bucket, tag, place, date; "anniversaries this month" | P1 |
| AR-3 | Licensing metadata (rights status, consent refs) | P2 |

### 5.8 Analytics dashboard (§8.3, §10.6, §13.5)
| ID | Requirement | Priority |
|---|---|---|
| AN-1 | **Days published / days elapsed** | P0 |
| AN-2 | **Turnaround**: median, same-day %, trend | P0 |
| AN-3 | **Audience per platform**: manual monthly entry (views, reach, watch time, followers, age/gender split) in the §10.6 agency format | P0 |
| AN-4 | **Advertiser signings and values**; revenue vs taluk unit cost (₹45,000/mo) → break-even indicator | P0 |
| AN-5 | **Month-3 checkpoint** page: the four numbers the investor is promised (§13.5) | P0 |
| AN-6 | Export CSV | P1 |

### 5.9 Governance (§13.1, §17)
| ID | Requirement | Priority |
|---|---|---|
| GV-1 | **Decisions register**: decided / open, positions A and B, why it matters, owner | P0 |
| GV-2 | **Founder-unblock log**: every time personal contacts unblocked something — what, who, why a hired editor could not | P0 |
| GV-3 | **Escalations**: legally risky, communally sensitive, serious allegation → logged before shooting, with state-desk decision | P1 |

### 5.10 Public channel page (§15.4)
| ID | Requirement | Priority |
|---|---|---|
| PB-1 | **Sagara Dhwani** page: name, logo, brand word, AI-voice identity; one full ordinary day of posts (8–10) matching §4.6 | P0 |
| PB-2 | Post types: video piece (placeholder player + script), poster, question of the week | P0 |
| PB-3 | Paid content visibly labelled | P0 |
| PB-4 | Prohibited-categories and privacy/terms links in footer | P0 |

### 5.11 Investor deck (§15)
| ID | Requirement | Priority |
|---|---|---|
| DK-1 | 12 slides exactly as §15.1, keyboard-navigable, print-to-PDF | P0 |
| DK-2 | Slide 10 computes multiplied economics from live budget inputs | P1 |
| DK-3 | Slide 12 shows budget A/B and the middle path with a toggle | P0 |

## 6. Key user flows

### 6.1 A day in the pipeline
1. 08:00 Content Head posts tagged list → 2. 09:00 Taluk Editor builds line-up, confirms → 3. Field captures, logs, uploads → 4. 14:00 cutoff sweep → 5. Scripts written (facts first) → 6. Content Head approves → 7. Edit, voice, posters; amber clearances resolved → 8. 18:30 state desk publishes, records URLs → 9. Turnaround and daily-promise update → 10. Night equipment log.

### 6.2 A sale
Prospect created with category check → free-month contract → results shown at month end → paid monthly contract on rate card → GST invoice → payment with bank ref → outstanding cleared by collections owner. Taluk staff see advertiser names but have no edit rights.

### 6.3 An amber clip
Editor attaches a 15-second extract of a leader's speech from another channel → classification amber, type "short extract from another channel's broadcast" → permission checklist → Production Desk Owner reviews: duration ≤ 20 s, logo visible, credit on screen and description, our commentary longer → cleared → publishable.

## 7. Success metrics (pilot)

| Metric | Target | Source |
|---|---|---|
| Days published / days elapsed | 100% (buffer bank allowed) | §4.4 |
| Same-day turnaround | ≥ 80% of stories by month 2 | §8.3 |
| Advertiser signings | first paid by month 3; 25 × ₹3,000 by maturity | §10.1, §14.2 |
| Taluk unit break-even | month 4–5 | §14.2 |
| Copyright strikes | 0 | §6.4 |
| Election-law incidents | 0 | §12.3 |
| Founder-unblock entries | logged, trending down | §13.1 |

## 8. Open product questions (from §17.2–17.3)

| Question | Position A | Position B | Impact on product |
|---|---|---|---|
| State team size | Lean (1 editor-producer) | Five-person | Approval workflow depth; number of roles seeded |
| Content mix | 2–3 local daily + identity + filtered state | Mostly state retold | Line-up validation rules |
| Political positioning | Openly aligned | Straight daily news, mission in identity | Copy on public page; verifier rules |
| Who interviews | Editor only (JD text) | Both roles | JD templates in docs |
| Commission on local sales | — | — | SL-10 |
| Final brand word | Dhwani | Nudi / Kahale | Brand config value |
| Cutoff time, pay bands, on-call threshold | — | — | Config values |

## 9. Release plan

- **R0 (before investor meeting):** public channel page with one full day, investor deck, docs. Ops platform seeded with Sagara data to demonstrate.
- **R1 (pre-launch, ~3 weeks after funding):** P0 ops features live; buffer bank entered; creator roster; rate card structure; invoicing.
- **R2 (pilot months 1–3):** P1 features; month-3 checkpoint report.
- **R3 (months 4–6):** rupee values set; agency-format reporting; network readiness (Postgres migration path).
