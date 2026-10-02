# 10 · Security & Access Control

**Source:** plan §7 (roles), §8.2 (shared rules), §9.4, §10.5, §12.3. Authority is central by design; the permission matrix encodes it.

## 1. Roles

| Role | Scope | Description |
|---|---|---|
| `founder` | Network | Everything; owns decisions, unblock log, central screening |
| `content_head` | Network | Tagged list, script approval, political verifier, central advertiser screen, escalation decisions |
| `scriptwriter_daily` / `scriptwriter_rewriter` | Network | Scripts |
| `editor` / `ai_visuals` | Network | Assets, production steps, posters, archive tagging |
| `production_desk` | Network | Cutoff, clearance of amber, **publishing**, takedowns, equipment/on-call oversight |
| `sales` | Network | Advertisers, contracts, invoices, payments, rate card values, political contracts (with cert) |
| `district` | District | District stories feeding taluks (later) |
| `taluk_editor` | One taluk | Line-up, briefs, verification, creator roster, escalations, week-ahead |
| `field_operator` | One taluk | Captures, uploads, capture log, equipment check |
| `investor` | Read-only | Analytics, month-3 checkpoint |

## 2. Permission matrix

C = create · R = read · U = update · D = delete · ✓ = allowed action · — = none

| Entity / action | founder | content_head | scriptwriters | editor / ai_visuals | production_desk | sales | taluk_editor | field_operator | investor |
|---|---|---|---|---|---|---|---|---|---|
| Tagged state list | CRUD | CRUD | R | R | R | — | R | R | — |
| Daily line-up (own taluk) | CRUD | RU | R | R | R | — | **CRU** | R | — |
| Story brief | CRUD | RU | R | R | R | — | CRU | R | — |
| Capture / upload | CRUD | R | R | R | R | — | CRU | **CRU** | — |
| Script body | CRUD | RU | **CRU** | R | R | — | R | — | — |
| Script approval | ✓ | **✓** | — | — | — | — | — | — | — |
| Political approval (named verifier) | ✓ | **✓** | — | — | — | — | — | — | — |
| Asset classification | CRUD | R | — | **CRU** | RU | — | R | CR (own) | — |
| Amber clearance | ✓ | ✓ | — | — | **✓** | — | — | — | — |
| **Publish** | ✓ | — | — | — | **✓** | — | **—** | **—** | — |
| Takedown | ✓ | ✓ | — | — | ✓ | — | — | — | — |
| Creator roster & consents | CRUD | RU | R | R | R | — | **CRU** | R | — |
| Advertiser | CRUD | R | — | — | R | **CRU** | **R** | — | — |
| Central advertiser screen ("against nation/culture") | ✓ | ✓ | — | — | — | — | **—** | — | — |
| Rate card values | CRUD | R | — | — | R | **CRU** | R | — | R |
| Contract | CRUD | R | — | — | R | **CRU** | **R** | — | — |
| Discount / price override | **—** | — | — | — | — | **—** | **—** | — | — |
| Political contract (needs MCMC ref) | ✓ | — | — | — | — | **✓** | **—** | — | — |
| Invoice / payment | CRUD | — | — | — | — | **CRU** | — | — | R (aggregate) |
| Cash payment method | **—** | — | — | — | — | **—** | — | — | — |
| Archive tagging | CRUD | RU | — | **CRU** | RU | — | R | — | — |
| Equipment check / on-call | CRUD | R | — | — | RU | — | CRU | **CRU** | — |
| Escalation | CRUD | **RU (decide)** | — | — | RU | — | **CR** | CR | — |
| Audience monthly entry | CRUD | R | — | — | CRU | CRU | R | — | R |
| Decisions register | CRUD | RU | R | R | R | R | R | R | R |
| Founder-unblock log | **CRUD** | R | — | — | — | — | — | — | R |
| Users & roles | CRUD | R | — | — | — | — | R (own taluk) | — | — |
| Audit log | R | R | — | — | R | — | — | — | — |

Bold marks the rule-defining cells: taluk roles never publish, never clear amber, never touch pricing, never screen advertisers; nobody discounts; nobody records cash.

## 3. Authentication (pilot → network)

| Phase | Mechanism |
|---|---|
| Pilot | Email/phone + password or magic link; signed HTTP-only session cookie; role and taluk in the session; users seeded by founder |
| Network | OIDC (Google Workspace or similar) with role mapping; MFA for state-hub roles; device-bound sessions for field roles |

Session lifetime 12 h for state-hub roles, 7 days for field roles (phones). Logout everywhere on role change.

## 4. Authorisation implementation

- Middleware gates `/ops/**` by authenticated session.
- Every Server Action calls `assert(can(user, action, entity))` from `src/domain/permissions.ts` — the matrix above as code.
- Taluk-scoped roles additionally pass a `taluk_id` filter on every query.
- Domain rules (TRD §4) run regardless of role — e.g. even founder cannot attach a red asset or publish with amber pending.

## 5. Audit

Every mutation writes `audit(at, user_id, action, entity, entity_id, detail)`. Immutable (no update/delete route). Reviewed weekly by production desk; founder sees anomalies (e.g. repeated amber attempts by a unit — §6.6).

## 6. Secrets and configuration

- No secrets in the repository. `.env.local` git-ignored; production secrets in the host's secret store.
- `SESSION_SECRET` rotated on any suspected leak; sessions invalidated.
- Platform API tokens (network phase) scoped to publish-only where providers allow.

## 7. Data security

- Backups encrypted at rest; restore tested monthly.
- Raw footage directory not web-served; downloads via signed, expiring links logged in audit.
- Consent media in a restricted folder.
- Public page is static-rendered; it has no write path to the database.

## 8. Field-device hygiene (signed with the job description)

- Phone lock and encryption on; channel uploads only via the platform or the designated WhatsApp line.
- No footage shared to personal pages before publication without written approval (terms on personal pages are settled at hiring — §7.4).
- Lost device reported same day; sessions revoked.

## 9. Incident response

| Incident | First response | Owner |
|---|---|---|
| Copyright strike / rights complaint | Item down same day; clearance review; record | Production desk |
| Election-law query | Pause political inventory; legal adviser; record | Founder + sales |
| Data breach | Within 24 h: contain, notify founder, assess DPDP obligations | Founder |
| Unauthorised publish attempt | Audit review; role check; retrain or remove | Production desk |
| Defamation claim | Item down; media lawyer; verifier review | Content head |
