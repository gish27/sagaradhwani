# 01 · Architecture

## 1. Scope

Two kinds of architecture are described, because the plan has two:

- **Organisational architecture** — how content and money flow between state, district and taluk (plan §3).
- **System architecture** — the software that makes the organisational model operable: one publishing system, one asset library, one analytics dashboard (plan §3, "technology backbone").

Everything is centralised by design: taluks capture and send up; the state hub scripts, produces, clears, publishes and archives. The software mirrors that — there is one system, and taluk users have narrow, write-limited roles in it.

## 2. System context (C4 level 1)

```mermaid
flowchart LR
  subgraph Field["Taluk field (×240 at scale)"]
    TE[Taluk Editor]
    FO[Field Operator]
    DP[District Person]
  end

  subgraph Hub["State hub"]
    CH[Content Head]
    SW[Scriptwriters · daily + rewriter]
    ED[Editor]
    AI[AI Visuals]
    PD[Production Desk Owner]
    SO[Sales & Collections Owner]
    F[Founder]
  end

  subgraph Ext["External"]
    ADV[Advertisers]
    CR[Local creators · roster]
    VW[Viewers]
    YT[YouTube]
    META[Facebook / Instagram]
    WA[WhatsApp]
    TTS[Kannada TTS provider]
    GEN[AI video / image generation]
    GST[GST / invoicing]
    MCMC[MCMC · election certification]
  end

  SYS[(Sagara Dhwani Platform\npublishing system · asset library · ops · sales · analytics)]

  TE & FO & DP --> SYS
  CH & SW & ED & AI & PD & SO & F --> SYS
  SYS --> YT & META
  VW --> YT & META
  VW -->|public channel page| SYS
  CR -->|standing permission| SYS
  WA -->|tip line · footage · consents| SYS
  SYS --> TTS & GEN
  SYS --> GST
  SO --> ADV
  ADV -->|monthly packages| SYS
  PD -->|political ads| MCMC
```

## 3. Three-layer organisational flow (plan §3)

```mermaid
flowchart TB
  S["STATE HUB\nBrand & format control · editorial & legal clearance · all scripting & production · publishing · archive · sales desk"]
  D["DISTRICT (×31)\nZilla panchayat · DC office · district politics\nFolds into taluk feed initially"]
  T["TALUK (×240)\nTwo people · find stories · interview · record · upload before cutoff"]

  S -- "tagged state/central story list · scripts · finished pieces · posters · rate card" --> D
  S -- "tagged list (farming/coastal/industrial/education) · finished daily output" --> T
  T -- "raw footage · story briefs · capture log · local tips" --> S
  D -- "district stories" --> S
  D -. "light district layer" .-> T
```

**Why production is central** (§3): a taluk person needs only a phone, a mic and local relationships; units are cheap and fast to recruit; one standard across 240 channels; taluk two costs far less than taluk one.

## 4. Container view (C4 level 2)

```mermaid
flowchart TB
  subgraph Browser["Clients"]
    OPS[Ops web app\n/ops — role-gated]
    PUB[Public channel page\n/ and /sagara]
    DECK[Investor deck\n/deck]
    MOB[Field capture\nphone browser · WhatsApp]
  end

  subgraph App["Next.js application (single deployable)"]
    RSC[React Server Components\n+ Server Actions]
    API[Route handlers\n/api/*]
    AUTH[Role & session middleware]
    JOBS[Scheduled jobs\ncutoff sweep · daily-promise check · metrics rollup]
  end

  subgraph Data["Data"]
    DB[(SQLite · better-sqlite3\nops.db)]
    FS[/Asset store\nraw footage · finished pieces · posters/]
    CSV[/Exports\ninvoices · analytics CSV/]
  end

  subgraph External["External services"]
    YT[YouTube Data API]
    META[Meta Graph API]
    TTS[Kannada TTS]
    GEN[AI image/video]
    MAIL[Email / WhatsApp notifications]
  end

  OPS & PUB & DECK & MOB --> RSC
  RSC --> AUTH --> DB
  RSC --> API --> DB
  API --> FS
  JOBS --> DB
  API --> YT & META & TTS & GEN & MAIL
  DB --> CSV
```

**Pilot simplification.** For a single taluk the whole system is one Next.js process with an embedded SQLite file and a local asset directory. Platform integrations (YouTube/Meta publishing, TTS, generation) are behind adapter interfaces and are stubbed in the pilot: publishing is scheduled in the system, executed by the state desk, and the platform post URL is recorded back. This keeps the pilot honest about what is proven (daily publishing, advertiser payment) without building integrations before there is an audience.

## 5. Domain model (plan §4–§12)

```mermaid
erDiagram
  TALUK ||--o{ USER : staffs
  TALUK ||--o{ STORY : covers
  TALUK ||--o{ ADVERTISER : sells_to
  TALUK ||--o{ CREATOR : rosters
  TALUK ||--o{ DAILY_LINEUP : publishes
  DAILY_LINEUP ||--o{ STORY : contains
  STORY ||--o{ CAPTURE : has
  STORY ||--o{ SCRIPT : has
  STORY ||--o{ CLEARANCE : requires
  STORY ||--o| PUBLICATION : becomes
  STORY ||--o| ARCHIVE_ITEM : archived_as
  CAPTURE }o--|| USER : uploaded_by
  CLEARANCE }o--|| USER : cleared_by
  ADVERTISER ||--o{ CONTRACT : signs
  CONTRACT ||--o{ INVOICE : billed_by
  INVOICE ||--o{ PAYMENT : settled_by
  RATE_CARD ||--o{ RATE_CARD_SLOT : lists
  CONTRACT }o--|| RATE_CARD_SLOT : buys
  CREATOR ||--o{ CONSENT : grants
  STORY }o--o{ CREATOR : features
  DECISION }o--|| USER : owned_by

  STORY {
    string id
    string layer "daily_pulse | identity | participation"
    string bucket "history | personalities | culture | livelihood | sports | literature | null"
    string source "taluk | state_retold | district | creator | viewer"
    string status "idea | assigned | captured | scripted | approved | produced | published | killed"
    string political_verifier
    datetime cutoff_at
    datetime footage_in_at
    datetime published_at
  }
  CLEARANCE {
    string tier "green | amber | red"
    string footage_source
    string permission_ref
    string decision "pending | cleared | rejected"
  }
  CONTRACT {
    string slot_type
    boolean category_exclusive
    int months
    boolean political
    string mcmc_cert_ref
  }
```

## 6. Daily pipeline (plan §8.1) — sequence

```mermaid
sequenceDiagram
  autonumber
  participant CH as Content Head
  participant TE as Taluk Editor
  participant FO as Field Operator
  participant SW as Scriptwriters
  participant ED as Editor / AI Visuals
  participant SD as State Desk
  participant SYS as Platform

  CH->>SYS: Morning · publish tagged state/central list (tags: farming, coastal, industrial, education)
  TE->>SYS: Morning · fix 2–3 local stories + 1 identity piece; pick 2–3 state pieces; confirm line-up
  FO->>SYS: Day · captures, interviews, cutaways; capture log entries
  FO->>SYS: Before cutoff · upload files named to standard + story brief
  SYS-->>SD: Cutoff sweep · what arrived, what rolls to tomorrow
  SW->>SYS: Afternoon · write / retell scripts (facts-first workflow §5.2)
  CH->>SYS: Approve every script before voice (named verifier for political)
  ED->>SYS: Evening · edit, graphics, AI voiceover, posters
  SYS-->>SD: Amber clearances pending? block until cleared
  SD->>SYS: Evening · publish on schedule across platforms; record post URLs
  SYS->>SYS: Compute turnaround (footage_in → published) · daily-promise flag
  FO->>SYS: Night · equipment check logged
```

**Turnaround is the key pilot metric** (§8.3): footage-in to published-out, same day = model works; two days = central team is the bottleneck. It is computed per story and rolled up per day.

## 7. Footage clearance state machine (plan §6)

```mermaid
stateDiagram-v2
  [*] --> Classified
  Classified --> Green: own footage / official feed / consented
  Classified --> Amber: short extract · viral · non-roster creator · licensed photo
  Classified --> Red: another channel's report · cropped logo · film/music · minors w/o consent · AI in news
  Green --> Publishable
  Amber --> CentralReview
  CentralReview --> Publishable: cleared (short · source named · our commentary longer than clip)
  CentralReview --> Blocked: rejected
  Red --> Blocked
  Publishable --> Published
  Published --> TakenDown: rights complaint (same day · item down while examined)
  Blocked --> [*]
```

## 8. Money flow (plan §10, §12.2)

```mermaid
flowchart LR
  ADV[Advertiser] -->|one conversation| SALES[Central sales desk]
  SALES -->|fixed rate card · no taluk discounting| CONTRACT[Monthly contract\nmin 1 month · category exclusivity]
  CONTRACT --> INV[Invoice · GST]
  INV --> BANK[(Bank)]
  BANK --> LEDGER[Ledger · every rupee]
  POL[Political buyer] -->|central only| MCMC[MCMC pre-certification]
  MCMC --> CONTRACT
  TALUK[Taluk staff] -. "cannot discount · cannot promise coverage · cannot collect cash" .-x CONTRACT
```

## 9. Deployment

| Stage | Topology | Notes |
|-------|----------|-------|
| Pilot (months 0–6) | One VM or PaaS instance · Next.js (Node 22) · SQLite file on persistent disk · assets on disk, nightly copy to object storage | ₹6,000/month hosting line (§14.1). Single taluk; <20 users. |
| Network phase 1 (10–20 taluks) | Same app · Postgres replaces SQLite · object storage for assets · background worker for jobs | Migration path kept open via repository layer. |
| Full scale (240 taluks, ~480 field users) | Horizontal app replicas · managed Postgres · CDN for public pages · queue for publish/render jobs | Analytics rollups move to a warehouse; agency reporting (§10.6) exported from it. |

## 10. Cross-cutting concerns

- **Authority is central.** Publishing, clearance, political verification, political ads, and advertiser screening are state-only operations in the permission matrix (see [10 · Security](10-security-access-control.md)).
- **Everything timestamped.** Cutoff, footage-in, approval, publish — the metric depends on it.
- **Consent is a first-class record.** Creator standing permissions, viewer submission permissions, parental consents are stored and referenced from stories (see [09](09-data-protection-consent.md)).
- **Archive is not optional.** Every identity piece is stored and tagged on publish; the archive is a revenue line (§10.1, §4.5).
- **Honest stubs.** Where an integration is not built, the UI says so and captures the manual step and its evidence (post URL, certificate number, bank reference).

See also: [diagrams/architecture.svg](diagrams/architecture.svg), [diagrams/](diagrams/) for Mermaid sources.
