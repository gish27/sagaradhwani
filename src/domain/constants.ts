export const BRAND = {
  constantWord: "Dhwani",
  meaning: "voice, sound",
  network: "Taluk Channel Network",
  pilotTaluk: "Sagara",
  district: "Shimoga",
  ethos: "Vasudhaiva Kutumbakam — love for one's own land without hostility to anyone",
  alternatives: [
    { word: "Dhwani", meaning: "Voice, sound", character: "Short, warm, does not age", leading: true },
    { word: "Nudi", meaning: "Speech, word", character: "More literary and rooted", leading: false },
    { word: "Kahale", meaning: "Trumpet", character: "More stirring, heavier", leading: false },
  ],
} as const;

export const ROLES = [
  "founder", "content_head", "scriptwriter_daily", "scriptwriter_rewriter", "editor", "ai_visuals",
  "production_desk", "sales", "taluk_editor", "field_operator", "district", "investor",
] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  founder: "Founder",
  content_head: "Content head",
  scriptwriter_daily: "Scriptwriter — daily",
  scriptwriter_rewriter: "Scriptwriter — rewriter",
  editor: "Editor",
  ai_visuals: "AI visuals",
  production_desk: "Production desk owner",
  sales: "Sales & collections owner",
  taluk_editor: "Taluk Editor",
  field_operator: "Field Operator",
  district: "District person",
  investor: "Investor (read-only)",
};

export const STATE_HUB_ROLES: Role[] = [
  "founder", "content_head", "scriptwriter_daily", "scriptwriter_rewriter", "editor", "ai_visuals", "production_desk", "sales",
];
export const TALUK_ROLES: Role[] = ["taluk_editor", "field_operator"];

export const LAYERS = {
  daily_pulse: { label: "Daily pulse", why: "The reason to open the channel every single day" },
  identity: { label: "Identity", why: "The soul of the channel — builds attachment, permanently reusable" },
  participation: { label: "Participation", why: "Turns viewers into contributors" },
} as const;
export type Layer = keyof typeof LAYERS;

export const BUCKETS = {
  history: { label: "History and heritage", examples: "Dynasties, battles, forts, temples, vanished places" },
  personalities: { label: "Personalities", examples: "Freedom fighters, writers, achievers, respected elders" },
  culture: { label: "Culture and festivals", examples: "Jatres, temple festivals, traditions, food, folk forms" },
  livelihood: { label: "Livelihood and economy", examples: "Crops, markets, trades, local industry and its issues" },
  sports: { label: "Sports", examples: "Local teams, athletes, rural games, wins" },
  literature: { label: "Literature and language", examples: "Poets, writers, theatre, dialect, local sayings" },
} as const;
export type Bucket = keyof typeof BUCKETS;

export const STORY_STATUSES = [
  "idea", "assigned", "captured", "scripted", "approved", "produced", "published", "killed", "rolled",
] as const;
export type StoryStatus = (typeof STORY_STATUSES)[number];

export const STATE_TAGS = ["farming", "coastal", "industrial", "education", "health", "infrastructure", "politics"] as const;

export const FOOTAGE_SOURCES: { key: string; label: string; tier: "green" | "amber" | "red"; rule: string }[] = [
  { key: "own", label: "Shot by our own people", tier: "green", rule: "Full ownership. The goal for the overwhelming majority of output." },
  { key: "own_public_speech", label: "Public speech or rally we filmed", tier: "green", rule: "Ours to use." },
  { key: "own_presser", label: "Government press conference we filmed", tier: "green", rule: "Ours to use." },
  { key: "official_gov", label: "Official government video (PIB, department, state release)", tier: "green", rule: "Generally free to reuse with credit; check each portal's licence terms." },
  { key: "legislature_feed", label: "Parliament / Vidhana Soudha proceedings feed", tier: "green", rule: "Public record; credit the source." },
  { key: "sent_by_subject", label: "Sent by the person in it (MLA office, college, temple committee, shop)", tier: "green", rule: "Sent for publication; keep the message as the record." },
  { key: "viewer_submission", label: "Viewer submission", tier: "green", rule: "Only with written permission in the chat, saved." },
  { key: "roster_creator", label: "Local creator on the cleared roster", tier: "green", rule: "Within their standing permission, credited on screen." },
  { key: "ai_identity", label: "AI visuals for history, culture, ads", tier: "green", rule: "Our own production. Never for news." },
  { key: "licensed", label: "Licensed stock and music", tier: "green", rule: "Paid or properly free-licensed only." },

  { key: "channel_extract", label: "Short extract from another channel's broadcast", tier: "amber", rule: "Only when the clip is the subject of our story. Brief, their logo visible, credited by name on screen and in the description." },
  { key: "viral", label: "Viral video on social media", tier: "amber", rule: "Verify who shot it; get permission where possible. If unattributable but newsworthy: short portion, credit platform and handle, remove immediately on request." },
  { key: "leader_speech_other_channel", label: "A leader's speech carried by a channel we did not film", tier: "amber", rule: "Prefer the party's own upload or official feed. The channel's broadcast carries their copyright." },
  { key: "non_roster_creator", label: "Local creator not on the roster", tier: "amber", rule: "15–20 seconds maximum, credited, our narration doing the main work." },
  { key: "press_photo", label: "Photograph from a newspaper or website", tier: "amber", rule: "Almost never safe. Recreate, license, or shoot our own." },
  { key: "film_music", label: "Film clip, song, serial footage", tier: "amber", rule: "Assume no." },

  { key: "reupload", label: "Another channel's report re-uploaded as our story", tier: "red", rule: "Infringement, and it makes us a repeater." },
  { key: "cropped_logo", label: "Their footage with logo cropped or blurred", tier: "red", rule: "Turns a copyright argument into a bad-faith one; fastest route to losing an account." },
  { key: "long_live", label: "Long stretches of another channel's live coverage", tier: "red", rule: "No fair-dealing argument survives length." },
  { key: "entertainment", label: "Film, serial or music content for entertainment", tier: "red", rule: "Guaranteed takedown, possible strike." },
  { key: "private_no_consent", label: "Anyone's private video without consent", tier: "red", rule: "Legal exposure; a trust catastrophe in a small taluk." },
  { key: "cctv_victims", label: "CCTV or accident footage of identifiable victims", tier: "red", rule: "Dignity; potentially actionable." },
  { key: "minor_no_consent", label: "Footage of a minor without a parent's consent", tier: "red", rule: "Never." },
  { key: "ai_in_news", label: "AI-generated visuals inside a news story", tier: "red", rule: "The hard rule." },
  { key: "unverified_viral_as_fact", label: "Unverified viral clip presented as fact", tier: "red", rule: "The biggest reputational risk a local channel carries." },
];

export const PERMISSION_CHECKLIST = [
  { key: "who_shot", q: "Do we know who shot it?" },
  { key: "written_permission", q: "Do we have their permission in writing, saved?" },
  { key: "identifiable_aware", q: "Is everyone identifiable in it aware it is being published?" },
  { key: "minors_consent", q: "Any minors? If yes, do we have a parent's consent?" },
  { key: "verified_event", q: "Have we verified the event happened as claimed, and when?" },
  { key: "credit_on_screen", q: "Is the credit on screen?" },
  { key: "central_cleared", q: "Has the central desk cleared it?" },
] as const;

export const PROHIBITED_CATEGORIES = [
  { category: "Gutka and tobacco, cigarettes", source: "Founder's values filter", central_only: false },
  { category: "Alcohol and wine shops", source: "Founder's values filter", central_only: false },
  { category: "Socially harmful businesses", source: "Founder's values filter", central_only: false },
  { category: "Advertisers who have made public statements against the nation or culture", source: "Founder's values filter — decided centrally only", central_only: true },
  { category: "Betting and fantasy gaming apps", source: "Added: easy money, fastest credibility loss", central_only: false },
  { category: "Unlicensed moneylenders and chit funds", source: "Added", central_only: false },
  { category: "Quack cures, clinics making unfounded claims, dubious fertility clinics", source: "Added", central_only: false },
  { category: "Astrology or black-magic services promising results", source: "Added", central_only: false },
] as const;

export const ADVERTISER_CATEGORIES = [
  "Jeweller", "Clinic / hospital", "Coaching centre", "Seed & fertiliser dealer", "Showroom / dealership",
  "Hardware", "Real estate / builder", "Textiles / sarees", "Electronics / mobiles", "Restaurant / bakery",
  "School / college", "Bank / co-operative", "Pharmacy", "Furniture", "Travel / tours", "Other",
] as const;

export const SLOT_TYPES = [
  { slot_type: "Pre-roll", format: "5–10 seconds before daily content", sold_as: "Monthly, per taluk", category_exclusive: 0, political: 0 },
  { slot_type: "Lower-third / branding", format: "Logo or strip during content", sold_as: "Monthly, per taluk", category_exclusive: 0, political: 0 },
  { slot_type: "Sponsored segment", format: "\"Today's weather, brought to you by…\"", sold_as: "Monthly, category-exclusive", category_exclusive: 1, political: 0 },
  { slot_type: "Identity content sponsor", format: "Sponsor of history, personality or festival pieces", sold_as: "Monthly, premium", category_exclusive: 0, political: 0 },
  { slot_type: "Dedicated story", format: "Full piece on the business, labelled paid", sold_as: "Per piece", category_exclusive: 0, political: 0 },
  { slot_type: "Event coverage", format: "Jatre, function, college fest, opening", sold_as: "Per event", category_exclusive: 0, political: 0 },
  { slot_type: "Classifieds", format: "Jobs, property, tenders, matrimonial", sold_as: "Weekly or monthly, cheap recurring", category_exclusive: 0, political: 0 },
  { slot_type: "Podcast sponsor", format: "Episode sponsorship or paid appearance", sold_as: "Per episode", category_exclusive: 0, political: 0 },
  { slot_type: "AI ad production", format: "Template ad for a business, or bespoke", sold_as: "Per ad", category_exclusive: 0, political: 0 },
  { slot_type: "Political — election period", format: "Certified, labelled with who paid", sold_as: "Election period; central only", category_exclusive: 0, political: 1 },
] as const;

export const TALUK_UNIT_MONTHLY_COST_INR = 45_000;
export const REVENUE_AT_MATURITY = [
  { line: "Local advertisers", basis: "25 at ₹3,000", monthly: 75_000 },
  { line: "Event coverage", basis: "4 events at ₹8,000", monthly: 32_000 },
  { line: "AI ads and production", basis: "6 ads at ₹3,000", monthly: 18_000 },
  { line: "Classifieds and listings", basis: "Recurring small slots", monthly: 10_000 },
] as const;
