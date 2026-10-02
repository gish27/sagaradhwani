# 03 · Technical Requirements Document (TRD)

**System:** Sagara Dhwani Platform (repo `gish27/tcn`) · **Status:** Draft v1 · **Companion:** [01 · Architecture](01-architecture.md), [02 · PRD](02-prd.md)

## 1. Technology choices

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router, React 19, TypeScript) | One deployable for ops app, public page and deck; server components keep data access server-side |
| Styling | Tailwind CSS v4 | Fast, consistent, no design-system overhead for a pilot |
| Database (pilot) | SQLite via `better-sqlite3`, file `data/ops.db` | Zero-ops, single process, trivially backed up; <20 users, one taluk |
| Database (network) | PostgreSQL | Swap behind the repository layer when multi-taluk concurrency and replicas are needed |
| Charts | Recharts | Dashboard and deck slide 10 |
| Icons | lucide-react | — |
| Auth (pilot) | Signed cookie session + seeded users, role claim | No external IdP cost; replace with an OIDC provider at network phase |
| Jobs | In-process scheduler started from the server (`node-cron` style) | Cutoff sweep, daily-promise check, metrics rollup |
| Assets | Local `data/assets/` with nightly copy to object storage | Raw footage stays on disk; finished pieces live on platforms |
| Lint/format | ESLint (next config), TypeScript strict | — |
| Node | 22 LTS | — |

## 2. Repository layout

```
tcn/
├─ docs/                       # this documentation set
├─ data/                       # ops.db, assets/ (git-ignored)
├─ src/
│  ├─ app/
│  │  ├─ (public)/             # / channel page, /privacy, /terms
│  │  ├─ deck/                 # investor deck
│  │  ├─ ops/                  # role-gated ops app
│  │  │  ├─ lineup/ captures/ scripts/ clearance/ creators/
│  │  │  ├─ sales/ (advertisers, contracts, invoices, rate-card)
│  │  │  ├─ archive/ analytics/ decisions/ unblocks/
│  │  └─ api/                  # route handlers (exports, webhooks later)
│  ├─ db/                      # schema.sql, client, migrations, seed
│  ├─ domain/                  # pure rules: clearance, cutoff, turnaround, rate card
│  ├─ components/
│  └─ lib/                     # auth, config, formatting (₹, Kannada dates)
└─ scripts/                    # seed, backup, export
```

## 3. Data model

SQLite DDL (Postgres-compatible types chosen). Timestamps are ISO-8601 UTC strings; display converts to IST.

```sql
-- Organisation
CREATE TABLE taluk (id TEXT PRIMARY KEY, name TEXT, district TEXT, brand_name TEXT,
  cutoff_time TEXT NOT NULL DEFAULT '14:00', publish_time TEXT NOT NULL DEFAULT '18:30',
  night_callout_threshold TEXT, launched_on TEXT);
CREATE TABLE user (id TEXT PRIMARY KEY, name TEXT, role TEXT NOT NULL
  CHECK (role IN ('founder','content_head','scriptwriter_daily','scriptwriter_rewriter','editor',
                  'ai_visuals','production_desk','sales','taluk_editor','field_operator','district','investor')),
  taluk_id TEXT REFERENCES taluk(id), phone TEXT, declared_affiliation TEXT, personal_page_terms TEXT,
  backup_for_user_id TEXT, active INTEGER DEFAULT 1);

-- Content
CREATE TABLE tagged_story (id TEXT PRIMARY KEY, date TEXT, title TEXT, summary TEXT,
  level TEXT CHECK (level IN ('state','central')), tags TEXT /* json array */, source_url TEXT, created_by TEXT);
CREATE TABLE daily_lineup (id TEXT PRIMARY KEY, taluk_id TEXT, date TEXT, confirmed_at TEXT,
  confirmed_by TEXT, nothing_coming INTEGER DEFAULT 0, UNIQUE (taluk_id, date));
CREATE TABLE story (id TEXT PRIMARY KEY, taluk_id TEXT, lineup_id TEXT, date TEXT, title TEXT,
  layer TEXT CHECK (layer IN ('daily_pulse','identity','participation')),
  bucket TEXT CHECK (bucket IN ('history','personalities','culture','livelihood','sports','literature') OR bucket IS NULL),
  source TEXT CHECK (source IN ('taluk','state_retold','district','creator','viewer','buffer')),
  tagged_story_id TEXT, status TEXT NOT NULL DEFAULT 'idea'
  CHECK (status IN ('idea','assigned','captured','scripted','approved','produced','published','killed','rolled')),
  political INTEGER DEFAULT 0, paid INTEGER DEFAULT 0, advertiser_id TEXT,
  brief_angle TEXT, brief_key_line TEXT, brief_clip_order TEXT,
  footage_in_at TEXT, cutoff_at TEXT, approved_at TEXT, approved_by TEXT, published_at TEXT,
  published_by TEXT, platform_urls TEXT /* json */, slot TEXT, is_buffer INTEGER DEFAULT 0);
CREATE TABLE capture (id TEXT PRIMARY KEY, story_id TEXT, file_name TEXT, kind TEXT
  CHECK (kind IN ('video','still','audio')), duration_s INTEGER, uploaded_at TEXT, uploaded_by TEXT,
  interviewee_name TEXT, interviewee_designation TEXT, interviewee_place TEXT, notes TEXT);
CREATE TABLE script (id TEXT PRIMARY KEY, story_id TEXT, version INTEGER, facts TEXT /* json bullets */,
  primary_source TEXT, body_kn TEXT, phonetics TEXT /* json */, retold INTEGER DEFAULT 0,
  written_by TEXT, approved_by TEXT, approved_at TEXT, voice_done INTEGER DEFAULT 0);
CREATE TABLE asset (id TEXT PRIMARY KEY, story_id TEXT, description TEXT, own INTEGER DEFAULT 1,
  ai_generated INTEGER DEFAULT 0, tier TEXT CHECK (tier IN ('green','amber','red')),
  source_type TEXT, source_name TEXT, duration_s INTEGER, credit_on_screen INTEGER, permission_ref TEXT,
  checklist TEXT /* json of §6.7 answers */, clearance_status TEXT DEFAULT 'n/a'
  CHECK (clearance_status IN ('n/a','pending','cleared','rejected')), cleared_by TEXT, cleared_at TEXT, clearance_note TEXT);
CREATE TABLE takedown (id TEXT PRIMARY KEY, story_id TEXT, asset_id TEXT, received_at TEXT, claimant TEXT,
  platform TEXT, taken_down_at TEXT, outcome TEXT);
CREATE TABLE archive_item (id TEXT PRIMARY KEY, story_id TEXT UNIQUE, bucket TEXT, tags TEXT, places TEXT,
  people TEXT, era TEXT, anniversary_mmdd TEXT, rights_status TEXT, archived_at TEXT);

-- People & consent
CREATE TABLE creator (id TEXT PRIMARY KEY, taluk_id TEXT, name TEXT, handle TEXT, platform TEXT,
  permission_ref TEXT, permission_at TEXT, active INTEGER DEFAULT 1);
CREATE TABLE consent (id TEXT PRIMARY KEY, kind TEXT CHECK (kind IN ('creator_standing','viewer_submission',
  'interviewee','parental','advertiser_creative')), subject_name TEXT, given_by TEXT, relation TEXT,
  reference TEXT, given_at TEXT, story_id TEXT, creator_id TEXT, revoked_at TEXT);

-- Sales
CREATE TABLE rate_card (id TEXT PRIMARY KEY, tier TEXT CHECK (tier IN ('taluk','district','state')),
  version INTEGER, effective_from TEXT, note TEXT);
CREATE TABLE rate_card_slot (id TEXT PRIMARY KEY, rate_card_id TEXT, slot_type TEXT, format TEXT, sold_as TEXT,
  price_inr INTEGER /* NULL until pilot audience numbers */, category_exclusive INTEGER DEFAULT 0, political INTEGER DEFAULT 0);
CREATE TABLE advertiser (id TEXT PRIMARY KEY, taluk_id TEXT, business TEXT, category TEXT, contact TEXT, phone TEXT,
  tier TEXT, status TEXT CHECK (status IN ('prospect','free_month','active','lapsed','blocked')),
  prohibited_check TEXT, central_screen_decision TEXT, gstin TEXT);
CREATE TABLE contract (id TEXT PRIMARY KEY, advertiser_id TEXT, slot_id TEXT, months INTEGER CHECK (months >= 1),
  start_date TEXT, value_inr INTEGER, free_month INTEGER DEFAULT 0, category_exclusive INTEGER DEFAULT 0,
  political INTEGER DEFAULT 0, mcmc_cert_ref TEXT, paid_for_by TEXT, status TEXT, created_by TEXT);
CREATE TABLE invoice (id TEXT PRIMARY KEY, contract_id TEXT, number TEXT UNIQUE, issued_at TEXT, due_at TEXT,
  amount_inr INTEGER, gst_inr INTEGER, status TEXT CHECK (status IN ('draft','issued','paid','overdue','void')));
CREATE TABLE payment (id TEXT PRIMARY KEY, invoice_id TEXT, received_at TEXT, amount_inr INTEGER,
  method TEXT CHECK (method IN ('bank_transfer','upi','cheque')) /* no cash */, bank_ref TEXT, recorded_by TEXT);

-- Ops & governance
CREATE TABLE equipment_check (id TEXT PRIMARY KEY, taluk_id TEXT, date TEXT, by_user TEXT, ok INTEGER, fault TEXT);
CREATE TABLE oncall (id TEXT PRIMARY KEY, taluk_id TEXT, week_start TEXT, user_id TEXT);
CREATE TABLE escalation (id TEXT PRIMARY KEY, story_id TEXT, kind TEXT, raised_by TEXT, raised_at TEXT,
  decision TEXT, decided_by TEXT, decided_at TEXT);
CREATE TABLE audience_month (id TEXT PRIMARY KEY, taluk_id TEXT, month TEXT, platform TEXT, views INTEGER,
  reach INTEGER, watch_time_min INTEGER, followers INTEGER, age_split TEXT, gender_split TEXT);
CREATE TABLE decision (id TEXT PRIMARY KEY, area TEXT, title TEXT, status TEXT CHECK (status IN ('decided','open')),
  decision TEXT, position_a TEXT, position_b TEXT, why_it_matters TEXT, plan_ref TEXT, owner TEXT, due TEXT);
CREATE TABLE unblock_log (id TEXT PRIMARY KEY, date TEXT, what TEXT, who_helped TEXT, why_hired_editor_could_not TEXT,
  playbook_note TEXT);
CREATE TABLE audit (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT, user_id TEXT, action TEXT, entity TEXT,
  entity_id TEXT, detail TEXT);
```

## 4. Domain rules (enforced in `src/domain`, not only in UI)

| Rule | Enforcement |
|---|---|
| Publishing from state desk only | `publish()` requires role ∈ {production_desk, founder}; taluk roles get 403 |
| Amber blocks publish | `canPublish(story)` false while any asset has `clearance_status='pending'` or tier amber without `cleared` |
| Red cannot attach | `classify()` returns red → insert rejected with reason text from §6.3 |
| No AI visuals in news | asset `ai_generated=1` + story `layer='daily_pulse'` → rejected |
| Political needs named verifier | `approve()` on `political=1` requires approver = taluk's configured verifier (content head) |
| Cutoff roll | job at `cutoff_time`+1 min: stories with no `footage_in_at` or `footage_in_at > cutoff` → `status='rolled'`, cloned to next date |
| Daily promise | job at `publish_time`+30 min: lineup with zero published → flag; dashboard red |
| Turnaround | `published_at − footage_in_at`; same-day if dates equal in IST |
| Min 1 month | `contract.months >= 1` (DB check + validation) |
| No cash | payment method enum excludes cash |
| No taluk discounting | contract `value_inr` must equal slot `price_inr` × months (or free month); only sales/founder may create contracts |
| Political ads central only | contract `political=1` requires `mcmc_cert_ref` and `paid_for_by`; blocked when within configured silence window; creator role ∈ {sales, founder} |
| Paid label | `story.paid=1` forces `advertiser_id` and renders "Paid" badge publicly |
| Archive on publish | publishing `layer='identity'` upserts `archive_item` |
| Central advertiser screen | `central_screen_decision` writable only by founder/content_head |

## 5. API surface (route handlers)

All mutations are Server Actions; the following HTTP endpoints exist for exports and later integrations.

| Method | Path | Purpose | Auth |
|---|---|---|---|
| GET | `/api/export/analytics.csv?month=` | Agency-format monthly report | sales, founder, investor |
| GET | `/api/export/invoices.csv` | Ledger | sales, founder |
| GET | `/api/checkpoint/month-3` | JSON of the four promised numbers | investor, founder |
| POST | `/api/webhooks/platform` | Reserved: platform stats ingestion | HMAC (network phase) |
| GET | `/api/health` | Liveness | public |

## 6. Non-functional requirements

| Area | Requirement |
|---|---|
| Availability | Pilot: single instance, restart-safe; daily backup of `ops.db` and assets; RPO 24 h, RTO 4 h |
| Performance | Ops pages < 1 s TTFB on 4G; public page < 100 KB above-the-fold JS |
| Mobile | Field screens (capture log, line-up confirm, equipment check) usable one-handed on a 6" phone, offline-tolerant form drafts in localStorage |
| Localisation | UI labels English for ops (pilot); content Kannada; public page Kannada-first with English fallback; IST everywhere |
| Security | Role-gated routes; CSRF on actions; audit on every mutation; no secrets in repo; see [10](10-security-access-control.md) |
| Privacy | Consent references stored, raw consent media stored in assets with restricted ACL; see [05](05-privacy-policy.md), [09](09-data-protection-consent.md) |
| Observability | Structured server logs; job run log table; error boundary pages |
| Data portability | CSV export of every table; SQLite file is the backup |
| Scalability path | Repository layer isolates SQL; Postgres migration scripts; object storage adapter |

## 7. Integrations (adapter interfaces; pilot = manual)

| Adapter | Pilot behaviour | Network behaviour |
|---|---|---|
| `Publisher` | Records scheduled time; state desk posts manually; URL pasted back | YouTube Data API / Meta Graph scheduled uploads |
| `Voice` | Script exported with phonetics; voice generated outside; file attached | Kannada TTS API with the fixed brand voice id |
| `Generator` | AI visuals produced by the AI visuals person; asset tagged `ai_generated=1` | Template-driven generation for category ads (§11.2) |
| `Notifier` | None | WhatsApp/email for cutoff reminders, approvals, overdue invoices |
| `Stats` | Monthly manual entry | Platform analytics pull into `audience_month` |

## 8. Environments

| Env | Where | Data |
|---|---|---|
| local | developer machine | seeded Sagara demo data |
| demo | one instance for the investor meeting | seeded "one full day" |
| pilot | production for Sagara | real data; nightly backup to object storage |

Environment variables: `DATABASE_PATH`, `ASSET_DIR`, `SESSION_SECRET`, `TZ=Asia/Kolkata`, later `YT_*`, `META_*`, `TTS_*`.

## 9. Testing

- Unit tests for every domain rule in §4 (clearance, cutoff roll, turnaround, contract validation, political gating).
- Seed-based smoke test: build → seed → render ops dashboard, public page, deck.
- Lint and typecheck on CI.

## 10. Migration to network scale

1. Introduce `district` table and district feed; `taluk.district_id`.
2. Postgres + connection pooling; move jobs to a worker process.
3. Object storage for assets; CDN for public pages per taluk (`/{taluk}`).
4. OIDC auth; per-taluk role scoping already present in the model.
5. Analytics warehouse for agency reporting across 240 taluks.
