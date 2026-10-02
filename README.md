# Sagara Dhwani — Taluk Channel Network (TCN)

Digital-only, federated local media network for Karnataka. This repository holds the **six-month Sagara pilot** build: the operations platform, the public channel page, the investor deck, and the full document set.

Source of truth: *Taluk Channel Network — Complete Plan* (26 Sep 2026). Documents live in [`docs/`](docs/README.md).

## What is in the app

| Route | What it is |
|-------|------------|
| `/` | Public **Sagara Dhwani** channel page — today's published stories by slot, Paid / AI / retold labels, identity archive, how to participate, sponsors |
| `/ops` | **Operations platform** — Today board, lineup & cutoff, story pipeline, field captures, scripts (pronunciation guide), green/amber/red footage clearance, creators, sales & rate card, invoicing/collections validation, archive, analytics, decisions & unblock log, budget, policy |
| `/deck` | 12-slide **investor deck** (plan §15.1) with A/B/C budget toggle; arrow keys to navigate |
| `/privacy`, `/terms`, `/policy`, `/policy/advertising` | Public policies rendered from `docs/` |
| `/api/health` | Health check |
| `/api/export/analytics.csv` | Pilot metrics export (role-gated) |

### Hard rules enforced server-side

1. Every taluk publishes every day — lineup is set the evening before; late non-breaking footage rolls to the next day.
2. No AI visuals in news, ever (AI assets cannot attach to daily-pulse stories).
3. Borrowed footage: green attaches, amber waits for central clearance, red never attaches. Publish is blocked while any amber asset is pending.
4. Paid content is labelled, names its advertiser, and never sits inside the daily pulse. Political ads are sold and certified centrally.
5. Fixed central rate card — taluk roles cannot discount, promise coverage, or collect cash. Every rupee is invoiced and banked (payment method is enforced).
6. Publishing happens from the production desk only. Every state change is audited.

## Run it

Requirements: Node 22+.

```bash
npm install
npm run dev        # http://localhost:3000
```

The SQLite database is created and seeded with demo data on first request at `data/ops.db` (gitignored). Override with `TCN_DB_PATH=/path/to/ops.db`.

- **Demo roles**: use the role switcher in the `/ops` sidebar (Founder, Content head, Production desk, Sales, Taluk Editor, Field Operator, Investor, …). Permissions are enforced on the server per role — try publishing as a Taluk Editor to see a rule reject.
- **Reset demo data**: `/ops/policy` → *Reset demo data* (founder/content head), or delete `data/ops.db`.

```bash
npm run build && npm run start   # production
npm run lint                     # eslint
npx tsc --noEmit                 # type check
```

## Stack

Next.js 16 (App Router, Server Actions, Turbopack) · React 19 · TypeScript · Tailwind v4 · SQLite via `better-sqlite3` · Recharts. Single process, no external services — fits the pilot's hosting line in the budget.

## Layout

```
docs/            PRD, TRD, architecture, budget, policies, risk register, roadmap, SVG diagram
src/app/         routes (public page, /ops platform, /deck, policies, API)
src/components/  shared UI, action forms, charts, markdown doc renderer
src/db/          schema.sql, seed.ts (demo data as of 2026-10-01), queries.ts, client.ts
src/domain/      rules.ts (hard rules), permissions.ts (role matrix), constants.ts (rate card, slots, buckets)
```

> Working standards, not legal, tax or financial advice. A CA and a media lawyer confirm the policy documents before launch (plan §12.1).