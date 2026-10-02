PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS taluk (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, district TEXT NOT NULL, brand_name TEXT NOT NULL,
  cutoff_time TEXT NOT NULL DEFAULT '14:00', publish_time TEXT NOT NULL DEFAULT '18:30',
  night_callout_threshold TEXT, launched_on TEXT
);

CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN (
    'founder','content_head','scriptwriter_daily','scriptwriter_rewriter','editor','ai_visuals',
    'production_desk','sales','taluk_editor','field_operator','district','investor')),
  taluk_id TEXT REFERENCES taluk(id), phone TEXT, declared_affiliation TEXT, personal_page_terms TEXT,
  backup_for_user_id TEXT, active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS tagged_story (
  id TEXT PRIMARY KEY, date TEXT NOT NULL, title TEXT NOT NULL, summary TEXT,
  level TEXT NOT NULL CHECK (level IN ('state','central')), tags TEXT NOT NULL DEFAULT '[]',
  source_url TEXT, created_by TEXT
);

CREATE TABLE IF NOT EXISTS daily_lineup (
  id TEXT PRIMARY KEY, taluk_id TEXT NOT NULL REFERENCES taluk(id), date TEXT NOT NULL,
  confirmed_at TEXT, confirmed_by TEXT, nothing_coming INTEGER NOT NULL DEFAULT 0,
  UNIQUE (taluk_id, date)
);

CREATE TABLE IF NOT EXISTS story (
  id TEXT PRIMARY KEY, taluk_id TEXT NOT NULL REFERENCES taluk(id), lineup_id TEXT REFERENCES daily_lineup(id),
  date TEXT NOT NULL, title TEXT NOT NULL,
  layer TEXT NOT NULL CHECK (layer IN ('daily_pulse','identity','participation')),
  bucket TEXT CHECK (bucket IS NULL OR bucket IN ('history','personalities','culture','livelihood','sports','literature')),
  source TEXT NOT NULL CHECK (source IN ('taluk','state_retold','district','creator','viewer','buffer')),
  tagged_story_id TEXT REFERENCES tagged_story(id),
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea','assigned','captured','scripted','approved','produced','published','killed','rolled')),
  political INTEGER NOT NULL DEFAULT 0, paid INTEGER NOT NULL DEFAULT 0, advertiser_id TEXT,
  brief_angle TEXT, brief_key_line TEXT, brief_clip_order TEXT,
  footage_in_at TEXT, cutoff_at TEXT, approved_at TEXT, approved_by TEXT,
  published_at TEXT, published_by TEXT, platform_urls TEXT NOT NULL DEFAULT '[]',
  slot TEXT, is_buffer INTEGER NOT NULL DEFAULT 0, summary TEXT
);

CREATE TABLE IF NOT EXISTS capture (
  id TEXT PRIMARY KEY, story_id TEXT NOT NULL REFERENCES story(id), file_name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('video','still','audio')), duration_s INTEGER,
  uploaded_at TEXT NOT NULL, uploaded_by TEXT,
  interviewee_name TEXT, interviewee_designation TEXT, interviewee_place TEXT, notes TEXT
);

CREATE TABLE IF NOT EXISTS script (
  id TEXT PRIMARY KEY, story_id TEXT NOT NULL REFERENCES story(id), version INTEGER NOT NULL DEFAULT 1,
  facts TEXT NOT NULL DEFAULT '[]', primary_source TEXT, body_kn TEXT, phonetics TEXT NOT NULL DEFAULT '[]',
  retold INTEGER NOT NULL DEFAULT 0, written_by TEXT, approved_by TEXT, approved_at TEXT,
  voice_done INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS asset (
  id TEXT PRIMARY KEY, story_id TEXT NOT NULL REFERENCES story(id), description TEXT NOT NULL,
  own INTEGER NOT NULL DEFAULT 1, ai_generated INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL CHECK (tier IN ('green','amber','red')), source_type TEXT NOT NULL, source_name TEXT,
  duration_s INTEGER, credit_on_screen INTEGER NOT NULL DEFAULT 0, permission_ref TEXT,
  checklist TEXT NOT NULL DEFAULT '{}',
  clearance_status TEXT NOT NULL DEFAULT 'n/a' CHECK (clearance_status IN ('n/a','pending','cleared','rejected')),
  cleared_by TEXT, cleared_at TEXT, clearance_note TEXT
);

CREATE TABLE IF NOT EXISTS takedown (
  id TEXT PRIMARY KEY, story_id TEXT REFERENCES story(id), asset_id TEXT, received_at TEXT NOT NULL,
  claimant TEXT, platform TEXT, taken_down_at TEXT, outcome TEXT
);

CREATE TABLE IF NOT EXISTS archive_item (
  id TEXT PRIMARY KEY, story_id TEXT NOT NULL UNIQUE REFERENCES story(id), bucket TEXT, tags TEXT NOT NULL DEFAULT '[]',
  places TEXT NOT NULL DEFAULT '[]', people TEXT NOT NULL DEFAULT '[]', era TEXT, anniversary_mmdd TEXT,
  rights_status TEXT NOT NULL DEFAULT 'own', archived_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS creator (
  id TEXT PRIMARY KEY, taluk_id TEXT NOT NULL REFERENCES taluk(id), name TEXT NOT NULL, handle TEXT, platform TEXT,
  permission_ref TEXT, permission_at TEXT, active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS consent (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK (kind IN ('creator_standing','viewer_submission','interviewee','parental','advertiser_creative')),
  subject_name TEXT NOT NULL, given_by TEXT, relation TEXT, reference TEXT, given_at TEXT NOT NULL,
  story_id TEXT REFERENCES story(id), creator_id TEXT REFERENCES creator(id), revoked_at TEXT
);

CREATE TABLE IF NOT EXISTS rate_card (
  id TEXT PRIMARY KEY, tier TEXT NOT NULL CHECK (tier IN ('taluk','district','state')), version INTEGER NOT NULL DEFAULT 1,
  effective_from TEXT, note TEXT
);

CREATE TABLE IF NOT EXISTS rate_card_slot (
  id TEXT PRIMARY KEY, rate_card_id TEXT NOT NULL REFERENCES rate_card(id), slot_type TEXT NOT NULL, format TEXT, sold_as TEXT,
  price_inr INTEGER, category_exclusive INTEGER NOT NULL DEFAULT 0, political INTEGER NOT NULL DEFAULT 0, sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS advertiser (
  id TEXT PRIMARY KEY, taluk_id TEXT REFERENCES taluk(id), business TEXT NOT NULL, category TEXT NOT NULL, contact TEXT, phone TEXT,
  tier TEXT NOT NULL DEFAULT 'taluk', status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect','free_month','active','lapsed','blocked')),
  prohibited_check TEXT, central_screen_decision TEXT, gstin TEXT, likely_ticket_inr INTEGER
);

CREATE TABLE IF NOT EXISTS contract (
  id TEXT PRIMARY KEY, advertiser_id TEXT NOT NULL REFERENCES advertiser(id), slot_id TEXT NOT NULL REFERENCES rate_card_slot(id),
  months INTEGER NOT NULL CHECK (months >= 1), start_date TEXT NOT NULL, value_inr INTEGER NOT NULL DEFAULT 0,
  free_month INTEGER NOT NULL DEFAULT 0, category_exclusive INTEGER NOT NULL DEFAULT 0,
  political INTEGER NOT NULL DEFAULT 0, mcmc_cert_ref TEXT, paid_for_by TEXT,
  status TEXT NOT NULL DEFAULT 'active', created_by TEXT
);

CREATE TABLE IF NOT EXISTS invoice (
  id TEXT PRIMARY KEY, contract_id TEXT NOT NULL REFERENCES contract(id), number TEXT NOT NULL UNIQUE,
  issued_at TEXT NOT NULL, due_at TEXT NOT NULL, amount_inr INTEGER NOT NULL, gst_inr INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('draft','issued','paid','overdue','void'))
);

CREATE TABLE IF NOT EXISTS payment (
  id TEXT PRIMARY KEY, invoice_id TEXT NOT NULL REFERENCES invoice(id), received_at TEXT NOT NULL, amount_inr INTEGER NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('bank_transfer','upi','cheque')), bank_ref TEXT, recorded_by TEXT
);

CREATE TABLE IF NOT EXISTS equipment_check (
  id TEXT PRIMARY KEY, taluk_id TEXT NOT NULL REFERENCES taluk(id), date TEXT NOT NULL, by_user TEXT, ok INTEGER NOT NULL DEFAULT 1, fault TEXT
);

CREATE TABLE IF NOT EXISTS oncall (
  id TEXT PRIMARY KEY, taluk_id TEXT NOT NULL REFERENCES taluk(id), week_start TEXT NOT NULL, user_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS escalation (
  id TEXT PRIMARY KEY, story_id TEXT REFERENCES story(id), kind TEXT NOT NULL, detail TEXT, raised_by TEXT, raised_at TEXT NOT NULL,
  decision TEXT, decided_by TEXT, decided_at TEXT
);

CREATE TABLE IF NOT EXISTS audience_month (
  id TEXT PRIMARY KEY, taluk_id TEXT NOT NULL REFERENCES taluk(id), month TEXT NOT NULL, platform TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0, reach INTEGER NOT NULL DEFAULT 0, watch_time_min INTEGER NOT NULL DEFAULT 0,
  followers INTEGER NOT NULL DEFAULT 0, age_split TEXT, gender_split TEXT, UNIQUE (taluk_id, month, platform)
);

CREATE TABLE IF NOT EXISTS decision (
  id TEXT PRIMARY KEY, area TEXT NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('decided','open')),
  decision TEXT, position_a TEXT, position_b TEXT, why_it_matters TEXT, plan_ref TEXT, owner TEXT, due TEXT
);

CREATE TABLE IF NOT EXISTS unblock_log (
  id TEXT PRIMARY KEY, date TEXT NOT NULL, what TEXT NOT NULL, who_helped TEXT, why_hired_editor_could_not TEXT, playbook_note TEXT
);

CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, user_id TEXT, action TEXT NOT NULL, entity TEXT NOT NULL,
  entity_id TEXT, detail TEXT
);

CREATE TABLE IF NOT EXISTS budget_line (
  id TEXT PRIMARY KEY, section TEXT NOT NULL, line TEXT NOT NULL, basis TEXT, lean_inr INTEGER, five_inr INTEGER, middle_inr INTEGER, sort INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_story_date ON story(taluk_id, date);
CREATE INDEX IF NOT EXISTS idx_asset_story ON asset(story_id);
CREATE INDEX IF NOT EXISTS idx_capture_story ON capture(story_id);
CREATE INDEX IF NOT EXISTS idx_audit_at ON audit(at);
