import type Database from "better-sqlite3";
import { SLOT_TYPES } from "@/domain/constants";

type DB = Database.Database;

/** Demo day. All timestamps IST (+05:30) expressed as ISO. */
export const DEMO_DATE = "2026-10-01";
const d = (hhmm: string, date = DEMO_DATE) => `${date}T${hhmm}:00+05:30`;
const prevDay = "2026-09-30";

export function seed(db: DB) {
  const tx = db.transaction(() => {
    // ---------- Taluk ----------
    db.prepare(
      `INSERT INTO taluk (id,name,district,brand_name,cutoff_time,publish_time,night_callout_threshold,launched_on) VALUES (?,?,?,?,?,?,?,?)`,
    ).run("sagara", "Sagara", "Shimoga", "Sagara Dhwani", "14:00", "18:30", "Fatal accident, major fire, flood, large public disorder", "2026-09-01");

    // ---------- Users ----------
    const users: [string, string, string, string | null, string | null, string | null, string | null][] = [
      ["u_founder", "Raghu", "founder", null, null, null, null],
      ["u_head", "Content head (to hire)", "content_head", null, null, null, null],
      ["u_sw_daily", "Daily scriptwriter (to hire)", "scriptwriter_daily", null, null, null, null],
      ["u_rewriter", "Rewriter / content editor (to hire)", "scriptwriter_rewriter", null, null, null, null],
      ["u_editor", "Video editor (to hire)", "editor", null, null, null, null],
      ["u_ai", "AI visuals person (to hire)", "ai_visuals", null, null, null, null],
      ["u_desk", "Production desk owner (to hire)", "production_desk", null, null, null, null],
      ["u_sales", "Sales & collections owner (to hire)", "sales", null, null, null, null],
      ["u_te", "Sagara Taluk Editor (trial week)", "taluk_editor", "sagara", "None declared", "No Sagara news on personal pages; personal pages may share channel links", "u_fo"],
      ["u_fo", "Sagara Field Operator (trial week)", "field_operator", "sagara", "None declared", "Same as Taluk Editor", "u_te"],
      ["u_district", "Shimoga district person (phase 2)", "district", null, null, null, null],
      ["u_investor", "Investor view", "investor", null, null, null, null],
    ];
    const insUser = db.prepare(
      `INSERT INTO user (id,name,role,taluk_id,declared_affiliation,personal_page_terms,backup_for_user_id) VALUES (?,?,?,?,?,?,?)`,
    );
    for (const u of users) insUser.run(...u);

    // ---------- Tagged state/central stories ----------
    const insTagged = db.prepare(`INSERT INTO tagged_story (id,date,title,summary,level,tags,source_url,created_by) VALUES (?,?,?,?,?,?,?,?)`);
    insTagged.run("ts_1", DEMO_DATE, "Cabinet approves arecanut yellow-leaf disease relief package", "State cabinet clears a per-hectare support scheme for arecanut growers hit by yellow leaf disease; applications through RSK centres.", "state", JSON.stringify(["farming"]), "https://example.gov.in/press", "u_sw_daily");
    insTagged.run("ts_2", DEMO_DATE, "New coastal fishing ban dates announced", "Monsoon fishing ban dates revised for Udupi and Dakshina Kannada.", "state", JSON.stringify(["coastal"]), null, "u_sw_daily");
    insTagged.run("ts_3", DEMO_DATE, "Centre revises PM-Kisan instalment schedule", "Next instalment to be released by month-end; eKYC deadline extended.", "central", JSON.stringify(["farming"]), null, "u_sw_daily");
    insTagged.run("ts_4", DEMO_DATE, "State announces 2,000 new PU college lecturer posts", "Recruitment notification expected in November.", "state", JSON.stringify(["education"]), null, "u_sw_daily");
    insTagged.run("ts_5", prevDay, "Industrial corridor land notification for Dharwad", "KIADB notifies 1,200 acres.", "state", JSON.stringify(["industrial"]), null, "u_sw_daily");

    // ---------- Lineup ----------
    db.prepare(`INSERT INTO daily_lineup (id,taluk_id,date,confirmed_at,confirmed_by,nothing_coming) VALUES (?,?,?,?,?,0)`).run("lu_1", "sagara", DEMO_DATE, d("08:05"), "u_te");
    db.prepare(`INSERT INTO daily_lineup (id,taluk_id,date,confirmed_at,confirmed_by,nothing_coming) VALUES (?,?,?,?,?,0)`).run("lu_0", "sagara", prevDay, d("08:10", prevDay), "u_te");

    // ---------- Stories: one full day ----------
    const insStory = db.prepare(`INSERT INTO story
      (id,taluk_id,lineup_id,date,title,layer,bucket,source,tagged_story_id,status,political,paid,advertiser_id,
       brief_angle,brief_key_line,brief_clip_order,footage_in_at,cutoff_at,approved_at,approved_by,published_at,published_by,platform_urls,slot,is_buffer,summary)
      VALUES (@id,@taluk_id,@lineup_id,@date,@title,@layer,@bucket,@source,@tagged_story_id,@status,@political,@paid,@advertiser_id,
       @brief_angle,@brief_key_line,@brief_clip_order,@footage_in_at,@cutoff_at,@approved_at,@approved_by,@published_at,@published_by,@platform_urls,@slot,@is_buffer,@summary)`);

    const base = {
      taluk_id: "sagara", lineup_id: "lu_1", date: DEMO_DATE, bucket: null, tagged_story_id: null, political: 0, paid: 0, advertiser_id: null,
      brief_angle: null, brief_key_line: null, brief_clip_order: null, footage_in_at: null, cutoff_at: d("14:00"), approved_at: null, approved_by: null,
      published_at: null, published_by: null, platform_urls: "[]", slot: null, is_buffer: 0, summary: null,
    };

    const stories = [
      {
        ...base, id: "st_1", title: "Arecanut at ₹48,200 a quintal — why the Sagara APMC price moved this week", layer: "daily_pulse", source: "taluk", status: "published", slot: "Morning",
        brief_angle: "Price up ₹1,400 on the week. Who gains, who is waiting to sell, what traders say about the next fortnight.",
        brief_key_line: "One grower on what the price means for his harvest decision; one trader on arrivals.",
        brief_clip_order: "1 APMC yard wide → 2 grower bite → 3 trader bite → 4 price board close-up",
        footage_in_at: d("09:20"), approved_at: d("11:10"), approved_by: "u_head", published_at: d("12:30"), published_by: "u_desk",
        platform_urls: JSON.stringify(["https://youtube.com/@sagaradhwani", "https://instagram.com/sagaradhwani"]),
        summary: "Arecanut touched ₹48,200 at the Sagara APMC on Wednesday, up ₹1,400 on the week as arrivals slowed and buyers from Mangaluru returned. Growers who held stock through September are selling; traders expect prices to steady after Dasara.",
      },
      {
        ...base, id: "st_2", title: "Hosanagara road, two years broken: Avinahalli residents speak", layer: "daily_pulse", source: "taluk", status: "published", slot: "Mid-day",
        brief_angle: "Not 'road is bad'. Who has asked whom, when, and what was promised. Tender status from the PWD office.",
        brief_key_line: "One resident; one auto driver; the PWD AEE on record or 'declined to speak' stated plainly.",
        brief_clip_order: "1 road wide with traffic → 2 pothole detail → 3 resident bite → 4 auto driver → 5 PWD office board",
        footage_in_at: d("11:05"), approved_at: d("13:30"), approved_by: "u_head", published_at: d("15:45"), published_by: "u_desk",
        platform_urls: JSON.stringify(["https://youtube.com/@sagaradhwani"]),
        summary: "The 4 km stretch between Avinahalli and the Hosanagara road has had no resurfacing since the 2024 monsoon. Residents say three written requests went to the PWD; the office says a tender is 'in process'. We will return in thirty days.",
      },
      {
        ...base, id: "st_3", title: "What the arecanut relief package actually means for a Sagara grower", layer: "daily_pulse", source: "state_retold", tagged_story_id: "ts_1", status: "approved", slot: "Afternoon",
        brief_angle: "Retold in our words: who qualifies, how much per hectare, where to apply in Sagara, by when.",
        brief_key_line: "No borrowed footage — own APMC and plantation b-roll from the archive plus a retold script.",
        footage_in_at: d("10:00"), approved_at: d("13:50"), approved_by: "u_head",
        summary: "The cabinet decision explained for Sagara: eligibility, amount, the RSK counter to go to, and the deadline.",
      },
      {
        ...base, id: "st_4", title: "Keladi Chennamma and the night Shivaji's son came to Keladi", layer: "identity", bucket: "history", source: "buffer", status: "produced", slot: "Evening", is_buffer: 1,
        brief_angle: "90-second AI recreation of Rani Chennamma sheltering Rajaram in 1689, told from Keladi.",
        brief_key_line: "Primary source: Keladi Nripa Vijayam; cross-checked with Shivappa Nayaka museum text.",
        footage_in_at: d("09:00", "2026-09-20"), approved_at: d("17:00", "2026-09-22"), approved_by: "u_head",
        summary: "In 1689 Rani Chennamma of Keladi gave refuge to Rajaram, son of Shivaji, and faced the Mughal army rather than hand him over. A recreation from Keladi itself.",
      },
      {
        ...base, id: "st_5", title: "Citizen question of the week: 'When does the Sagara bus stand get a roof?'", layer: "participation", source: "viewer", status: "scripted", slot: "Evening",
        brief_angle: "Viewer's 20-second voice note (permission saved), put to the TMC commissioner's office.",
        brief_key_line: "Credit viewer by first name only, as requested.",
        footage_in_at: d("12:40"),
        summary: "A viewer from Vinobanagar asks why the renovated bus stand still has no roof over platforms 3–5. We asked the municipal office.",
      },
      {
        ...base, id: "st_6", title: "Poster of the day — Gandhi Jayanti tomorrow: Sagara's 1942 procession", layer: "identity", bucket: "history", source: "buffer", status: "published", slot: "Anytime", is_buffer: 1,
        approved_at: d("10:00"), approved_by: "u_head", published_at: d("08:30"), published_by: "u_desk",
        platform_urls: JSON.stringify(["https://instagram.com/sagaradhwani"]),
        summary: "A date in Sagara's history: the Quit India procession that passed the Marikamba temple in August 1942.",
      },
      {
        ...base, id: "st_7", title: "Jog Falls weekend footfall and what Kargal shops earned", layer: "daily_pulse", source: "taluk", status: "rolled", slot: "Mid-day",
        brief_angle: "Rolled: footage came in at 15:10, after the 14:00 cutoff. Not breaking. Goes out tomorrow.",
        footage_in_at: d("15:10"),
        summary: "Long weekend footfall at Jog and what it meant for Kargal's tea stalls and homestays.",
      },
      {
        ...base, id: "st_8", lineup_id: "lu_0", date: prevDay, title: "Sagara's theatre tradition: a conversation with the Ninasam alumni troupe", layer: "identity", bucket: "literature", source: "taluk", status: "published", slot: "Evening",
        footage_in_at: d("10:30", prevDay), approved_at: d("15:00", prevDay), approved_by: "u_head", published_at: d("18:30", prevDay), published_by: "u_desk",
        platform_urls: JSON.stringify(["https://youtube.com/@sagaradhwani"]),
        summary: "Why a taluk town keeps a theatre culture alive — three members of a Heggodu-trained troupe on what they stage and for whom.",
      },
      {
        ...base, id: "st_9", lineup_id: "lu_0", date: prevDay, title: "Ganapathi Hardware — 40 years on Sagara's main road (Paid)", layer: "identity", bucket: "livelihood", source: "taluk", status: "published", slot: "Evening", paid: 1, advertiser_id: "ad_3",
        footage_in_at: d("11:00", prevDay), approved_at: d("15:30", prevDay), approved_by: "u_head", published_at: d("19:00", prevDay), published_by: "u_desk",
        platform_urls: JSON.stringify(["https://youtube.com/@sagaradhwani"]),
        summary: "A dedicated story, labelled paid: three generations of a hardware shop and the town that grew around it.",
      },
      {
        ...base, id: "st_10", lineup_id: null, date: "2026-10-02", title: "Malnad monsoon food: the kesuvina (colocasia) season explained", layer: "identity", bucket: "culture", source: "buffer", status: "produced", is_buffer: 1, cutoff_at: null,
        approved_at: d("16:00", "2026-09-25"), approved_by: "u_head",
        summary: "Buffer piece. Evergreen Malnad culture for a day when nothing comes in.",
      },
      {
        ...base, id: "st_11", lineup_id: null, date: "2026-10-02", title: "Sagara taluk kabaddi: the Anandapura team that keeps winning", layer: "identity", bucket: "sports", source: "taluk", status: "assigned", cutoff_at: d("14:00", "2026-10-02"),
        brief_angle: "Assigned for tomorrow. Practice session at 6 am; captain and coach bites.",
        summary: "Sports identity piece for the next day.",
      },
      {
        ...base, id: "st_12", lineup_id: null, date: "2026-10-02", title: "MLA's statement on the Sharavathi pumped-storage project", layer: "daily_pulse", source: "state_retold", status: "idea", political: 1, cutoff_at: d("14:00", "2026-10-02"),
        brief_angle: "Political. Needs content head approval. Use the party's own upload or our own filming — not another channel's broadcast.",
        summary: "Political daily pulse item for tomorrow.",
      },
    ];
    // advertiser ad_3 referenced by st_9 — insert advertisers first below; FK is on advertiser_id? (no FK declared) OK.
    for (const s of stories) insStory.run(s);

    // ---------- Captures ----------
    const insCap = db.prepare(`INSERT INTO capture (id,story_id,file_name,kind,duration_s,uploaded_at,uploaded_by,interviewee_name,interviewee_designation,interviewee_place,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
    insCap.run("cp_1", "st_1", "20261001_apmc_wide_01.mp4", "video", 48, d("09:20"), "u_fo", null, null, "Sagara APMC yard", "Wide, two angles, steady");
    insCap.run("cp_2", "st_1", "20261001_apmc_grower_02.mp4", "video", 95, d("09:22"), "u_te", "Nagaraja Hegde", "Arecanut grower, 4 acres", "Keladi village", "Name spelt as pronounced: NA-ga-RA-ja HEG-de");
    insCap.run("cp_3", "st_1", "20261001_apmc_trader_03.mp4", "video", 70, d("09:25"), "u_te", "Mohammed Rafiq", "Commission agent, APMC", "Sagara", null);
    insCap.run("cp_4", "st_1", "20261001_priceboard_04.jpg", "still", null, d("09:26"), "u_fo", null, null, "Sagara APMC", "Price board — ₹48,200 visible");
    insCap.run("cp_5", "st_2", "20261001_road_wide_01.mp4", "video", 60, d("11:05"), "u_fo", null, null, "Avinahalli", "Traffic passing potholes");
    insCap.run("cp_6", "st_2", "20261001_resident_02.mp4", "video", 110, d("11:08"), "u_te", "Lakshmamma", "Resident", "Avinahalli", "Spoke of three written complaints; copies photographed");
    insCap.run("cp_7", "st_2", "20261001_auto_03.mp4", "video", 55, d("11:10"), "u_te", "Suresh", "Auto driver", "Sagara", null);
    insCap.run("cp_8", "st_2", "20261001_pwd_board_04.jpg", "still", null, d("11:12"), "u_fo", null, null, "PWD sub-division office, Sagara", "AEE declined to speak on camera");
    insCap.run("cp_9", "st_5", "20261001_viewer_voicenote.m4a", "audio", 21, d("12:40"), "u_te", "Prakash (first name only)", "Viewer", "Vinobanagar", "WhatsApp permission screenshot saved: consent cs_2");
    insCap.run("cp_10", "st_7", "20261001_jog_footfall_01.mp4", "video", 85, d("15:10"), "u_fo", null, null, "Jog Falls / Kargal", "After cutoff — rolled to tomorrow");
    insCap.run("cp_11", "st_8", "20260930_theatre_troupe_01.mp4", "video", 240, d("10:30", prevDay), "u_te", "Three troupe members", "Theatre troupe", "Sagara", null);
    insCap.run("cp_12", "st_9", "20260930_ganapathi_hw_01.mp4", "video", 180, d("11:00", prevDay), "u_te", "G. Ganesh Bhat", "Proprietor", "Main road, Sagara", "Paid story — advertiser creative consent cs_4");

    // ---------- Scripts ----------
    const insScript = db.prepare(`INSERT INTO script (id,story_id,version,facts,primary_source,body_kn,phonetics,retold,written_by,approved_by,approved_at,voice_done) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
    insScript.run("sc_1", "st_1", 2, JSON.stringify(["Price ₹48,200/quintal on 01 Oct", "Up ₹1,400 week-on-week", "Arrivals 1,850 bags vs 2,400 last week"]), "APMC price board; trader statement", "ಸಾಗರ ಎಪಿಎಂಸಿಯಲ್ಲಿ ಬುಧವಾರ ಅಡಿಕೆ ಧಾರಣೆ ಕ್ವಿಂಟಾಲ್‌ಗೆ ₹48,200 ತಲುಪಿದೆ…", JSON.stringify([{ word: "Nagaraja Hegde", say: "NA-ga-RA-ja HEG-de" }, { word: "48,200", say: "nalvatt-entu saavira innooru" }]), 0, "u_sw_daily", "u_head", d("11:10"), 1);
    insScript.run("sc_2", "st_2", 1, JSON.stringify(["No resurfacing since 2024 monsoon", "Three written requests, dates 12 Mar 25, 8 Aug 25, 14 Jan 26", "PWD: tender 'in process'"]), "Residents' complaint copies; PWD office", "ಅವಿನಹಳ್ಳಿ–ಹೊಸನಗರ ರಸ್ತೆ…", JSON.stringify([{ word: "Avinahalli", say: "a-VI-na-HAL-li" }]), 0, "u_sw_daily", "u_head", d("13:30"), 1);
    insScript.run("sc_3", "st_3", 1, JSON.stringify(["₹X per hectare (from cabinet note)", "Apply at Raitha Samparka Kendra", "Deadline 31 Oct"]), "Cabinet press note (official); DIPR release", "ಸರ್ಕಾರದ ಅಡಿಕೆ ಪರಿಹಾರ ಪ್ಯಾಕೇಜ್ ಸಾಗರದ ಬೆಳೆಗಾರರಿಗೆ ಏನು ಅರ್ಥ…", "[]", 1, "u_rewriter", "u_head", d("13:50"), 0);
    insScript.run("sc_4", "st_4", 3, JSON.stringify(["Rajaram reached Keladi territory in 1689", "Chennamma ruled 1671–1697", "Mughal force under Aurangzeb's commanders engaged"]), "Keladi Nripa Vijayam; Shivappa Nayaka palace museum text", "ಕ್ರಿ.ಶ. 1689. ಕೆಳದಿಯ ರಾಣಿ ಚೆನ್ನಮ್ಮ…", JSON.stringify([{ word: "Rajaram", say: "RAA-ja-raam" }, { word: "Keladi", say: "KE-la-di" }]), 0, "u_rewriter", "u_head", d("17:00", "2026-09-22"), 1);
    insScript.run("sc_5", "st_5", 1, JSON.stringify(["Bus stand renovation completed Feb 2026", "Platforms 3–5 uncovered"]), "Viewer voice note; TMC office reply", "ಈ ವಾರದ ನಾಗರಿಕ ಪ್ರಶ್ನೆ…", "[]", 0, "u_sw_daily", null, null, 0);

    // ---------- Assets ----------
    const insAsset = db.prepare(`INSERT INTO asset (id,story_id,description,own,ai_generated,tier,source_type,source_name,duration_s,credit_on_screen,permission_ref,checklist,clearance_status,cleared_by,cleared_at,clearance_note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const okList = JSON.stringify({ who_shot: true, written_permission: true, identifiable_aware: true, minors_consent: true, verified_event: true, credit_on_screen: true, central_cleared: true });
    insAsset.run("as_1", "st_1", "Own APMC footage (4 clips)", 1, 0, "green", "own", "Sagara unit", 213, 0, null, okList, "n/a", null, null, null);
    insAsset.run("as_2", "st_2", "Own road footage and interviews", 1, 0, "green", "own", "Sagara unit", 225, 0, null, okList, "n/a", null, null, null);
    insAsset.run("as_3", "st_3", "Cabinet briefing clip from DIPR official channel (12 s)", 0, 0, "green", "official_gov", "DIPR Karnataka", 12, 1, "DIPR YouTube — open government licence", okList, "n/a", null, null, null);
    insAsset.run("as_4", "st_3", "Archive plantation b-roll (own, Sept 2026)", 1, 0, "green", "own", "Sagara unit", 40, 0, null, okList, "n/a", null, null, null);
    insAsset.run("as_5", "st_4", "AI recreation — Keladi palace court, 1689 (identity layer)", 1, 1, "green", "ai_identity", "In-house AI visuals", 90, 1, null, okList, "n/a", null, null, "Labelled 'recreation' on screen");
    insAsset.run("as_6", "st_5", "Viewer voice note (21 s)", 0, 0, "green", "viewer_submission", "Prakash, Vinobanagar", 21, 1, "cs_2", okList, "n/a", null, null, null);
    insAsset.run("as_7", "st_12", "Clip of MLA statement as carried by a regional channel (18 s)", 0, 0, "amber", "leader_speech_other_channel", "Regional news channel", 18, 1, null, JSON.stringify({ who_shot: true, written_permission: false, identifiable_aware: true, minors_consent: true, verified_event: true, credit_on_screen: true, central_cleared: false }), "pending", null, null, "Prefer party's own upload; pending central decision");
    insAsset.run("as_8", "st_7", "Viral Instagram reel of Jog crowd (unknown shooter)", 0, 0, "amber", "viral", "@unknown_handle", 15, 1, null, JSON.stringify({ who_shot: false, written_permission: false, identifiable_aware: false, minors_consent: true, verified_event: true, credit_on_screen: true, central_cleared: false }), "rejected", "u_head", d("16:00"), "Shooter unidentified; we have our own footage — use ours.");
    insAsset.run("as_9", "st_8", "Own theatre interview footage", 1, 0, "green", "own", "Sagara unit", 240, 0, null, okList, "n/a", null, null, null);
    insAsset.run("as_10", "st_8", "Roster creator clip — rehearsal (Creator: Malnad Frames)", 0, 0, "green", "roster_creator", "Malnad Frames", 20, 1, "cs_1", okList, "n/a", null, null, null);
    insAsset.run("as_11", "st_9", "Own shop footage; AI-produced 30 s ad insert (not news)", 1, 1, "green", "own", "Sagara unit / in-house AI", 210, 1, "cs_4", okList, "n/a", null, null, null);

    // ---------- Archive ----------
    const insArc = db.prepare(`INSERT INTO archive_item (id,story_id,bucket,tags,places,people,era,anniversary_mmdd,rights_status,archived_at) VALUES (?,?,?,?,?,?,?,?,?,?)`);
    insArc.run("ar_1", "st_4", "history", JSON.stringify(["Keladi", "Nayaka", "Chennamma", "Maratha"]), JSON.stringify(["Keladi", "Ikkeri"]), JSON.stringify(["Rani Chennamma", "Rajaram"]), "17th century", null, "own", d("17:30", "2026-09-22"));
    insArc.run("ar_2", "st_6", "history", JSON.stringify(["Quit India", "freedom movement"]), JSON.stringify(["Marikamba temple", "Sagara"]), JSON.stringify([]), "1942", "08-09", "own", d("08:30"));
    insArc.run("ar_3", "st_8", "literature", JSON.stringify(["theatre", "Ninasam", "Heggodu"]), JSON.stringify(["Sagara", "Heggodu"]), JSON.stringify([]), "contemporary", null, "own+creator", d("18:30", prevDay));
    insArc.run("ar_4", "st_10", "culture", JSON.stringify(["Malnad", "food", "monsoon"]), JSON.stringify(["Sagara"]), JSON.stringify([]), "contemporary", null, "own", d("16:30", "2026-09-25"));
    insArc.run("ar_5", "st_9", "livelihood", JSON.stringify(["main road", "hardware", "family business", "paid"]), JSON.stringify(["Sagara"]), JSON.stringify(["G. Ganesh Bhat"]), "contemporary", null, "own", d("19:00", prevDay));

    // ---------- Creators & consents ----------
    const insCr = db.prepare(`INSERT INTO creator (id,taluk_id,name,handle,platform,permission_ref,permission_at,active) VALUES (?,?,?,?,?,?,?,?)`);
    insCr.run("cr_1", "sagara", "Malnad Frames", "@malnadframes", "Instagram", "cs_1", d("10:00", "2026-09-10"), 1);
    insCr.run("cr_2", "sagara", "Sagara Vlogs", "@sagaravlogs", "YouTube", "cs_5", d("11:00", "2026-09-12"), 1);
    insCr.run("cr_3", "sagara", "Jog Drone Diaries", "@jogdrone", "Instagram", null, null, 0);
    insCr.run("cr_4", "sagara", "Keladi Kathe", "@keladikathe", "YouTube", "cs_6", d("09:00", "2026-09-15"), 1);
    insCr.run("cr_5", "sagara", "Anandapura Sports Club page", "@anandapurasc", "Facebook", null, null, 0);
    insCr.run("cr_6", "sagara", "Heggodu Theatre Notes", "@heggodunotes", "Instagram", "cs_7", d("17:00", "2026-09-18"), 1);

    const insCons = db.prepare(`INSERT INTO consent (id,kind,subject_name,given_by,relation,reference,given_at,story_id,creator_id,revoked_at) VALUES (?,?,?,?,?,?,?,?,?,?)`);
    insCons.run("cs_1", "creator_standing", "Malnad Frames", "Owner", "self", "WhatsApp screenshot 2026-09-10", d("10:00", "2026-09-10"), null, "cr_1", null);
    insCons.run("cs_2", "viewer_submission", "Prakash", "Prakash", "self", "WhatsApp message 2026-10-01 12:35", d("12:35"), "st_5", null, null);
    insCons.run("cs_3", "interviewee", "Lakshmamma", "Lakshmamma", "self", "On camera; capture cp_6", d("11:08"), "st_2", null, null);
    insCons.run("cs_4", "advertiser_creative", "Ganapathi Hardware", "G. Ganesh Bhat", "proprietor", "Signed creative approval 2026-09-29", d("12:00", "2026-09-29"), "st_9", null, null);
    insCons.run("cs_5", "creator_standing", "Sagara Vlogs", "Owner", "self", "WhatsApp 2026-09-12", d("11:00", "2026-09-12"), null, "cr_2", null);
    insCons.run("cs_6", "creator_standing", "Keladi Kathe", "Owner", "self", "WhatsApp 2026-09-15", d("09:00", "2026-09-15"), null, "cr_4", null);
    insCons.run("cs_7", "creator_standing", "Heggodu Theatre Notes", "Owner", "self", "WhatsApp 2026-09-18", d("17:00", "2026-09-18"), null, "cr_6", null);

    // ---------- Rate card (values blank until pilot numbers; a few working values for the demo) ----------
    db.prepare(`INSERT INTO rate_card (id,tier,version,effective_from,note) VALUES (?,?,?,?,?)`).run("rc_taluk", "taluk", 1, null, "Structure fixed. Rupee values are set only after pilot audience numbers (plan §11.3). Working values for validation shown where set.");
    db.prepare(`INSERT INTO rate_card (id,tier,version,effective_from,note) VALUES (?,?,?,?,?)`).run("rc_district", "district", 1, null, "Phase 2.");
    db.prepare(`INSERT INTO rate_card (id,tier,version,effective_from,note) VALUES (?,?,?,?,?)`).run("rc_state", "state", 1, null, "Phase 3.");
    const insSlot = db.prepare(`INSERT INTO rate_card_slot (id,rate_card_id,slot_type,format,sold_as,price_inr,category_exclusive,political,sort) VALUES (?,?,?,?,?,?,?,?,?)`);
    const workingPrices: Record<string, number | null> = { "Pre-roll": 3000, "Lower-third / branding": 2000, "Sponsored segment": 5000, "Dedicated story": 8000, "Event coverage": 8000, "AI ad production": 3000, "Classifieds": 500 };
    SLOT_TYPES.forEach((s, i) => {
      insSlot.run(`rs_t_${i + 1}`, "rc_taluk", s.slot_type, s.format, s.sold_as, workingPrices[s.slot_type] ?? null, s.category_exclusive, s.political, i + 1);
      insSlot.run(`rs_d_${i + 1}`, "rc_district", s.slot_type, s.format, s.sold_as, null, s.category_exclusive, s.political, i + 1);
      insSlot.run(`rs_s_${i + 1}`, "rc_state", s.slot_type, s.format, s.sold_as, null, s.category_exclusive, s.political, i + 1);
    });

    // ---------- Advertisers (validation worksheet: 25 at ₹3,000) ----------
    const insAd = db.prepare(`INSERT INTO advertiser (id,taluk_id,business,category,contact,phone,tier,status,prohibited_check,central_screen_decision,gstin,likely_ticket_inr) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
    const ads: [string, string, string, string, number | null][] = [
      ["ad_1", "Sri Lakshmi Jewellers", "Jeweller", "active", 5000],
      ["ad_2", "Sagara Multispeciality Clinic", "Clinic / hospital", "active", 3000],
      ["ad_3", "Ganapathi Hardware", "Hardware", "active", 8000],
      ["ad_4", "Vidya Coaching Centre", "Coaching centre", "free_month", 3000],
      ["ad_5", "Malnad Agro Seeds & Fertilisers", "Seed & fertiliser dealer", "active", 3000],
      ["ad_6", "Sharavathi Motors (two-wheeler showroom)", "Showroom / dealership", "prospect", 5000],
      ["ad_7", "Keladi Silks", "Textiles / sarees", "prospect", 3000],
      ["ad_8", "Mobile World Sagara", "Electronics / mobiles", "prospect", 3000],
      ["ad_9", "Hotel Shanbhag", "Restaurant / bakery", "free_month", 2000],
      ["ad_10", "Sagara Co-operative Bank", "Bank / co-operative", "prospect", 5000],
      ["ad_11", "Jog Homestay Association", "Travel / tours", "prospect", 3000],
      ["ad_12", "Lions School Sagara", "School / college", "prospect", 3000],
      ["ad_13", "Varalakshmi Furniture", "Furniture", "prospect", 3000],
      ["ad_14", "Sagara Medicals", "Pharmacy", "prospect", 2000],
      ["ad_15", "Anand Builders", "Real estate / builder", "prospect", 5000],
      ["ad_16", "Nisarga Bakery", "Restaurant / bakery", "prospect", 2000],
      ["ad_17", "Ikkeri Tiles & Sanitary", "Hardware", "prospect", 3000],
      ["ad_18", "Sagara Tyres", "Showroom / dealership", "prospect", 3000],
      ["ad_19", "Bright Future PU College", "School / college", "prospect", 3000],
      ["ad_20", "Hegde Arecanut Traders", "Other", "prospect", 3000],
      ["ad_21", "Kaveri Textiles", "Textiles / sarees", "prospect", 3000],
      ["ad_22", "Sagara Opticals", "Clinic / hospital", "prospect", 2000],
      ["ad_23", "Sri Ganesh Travels", "Travel / tours", "prospect", 3000],
      ["ad_24", "Malnad Honey & Spices", "Other", "prospect", 2000],
      ["ad_25", "Nandi Electronics", "Electronics / mobiles", "prospect", 3000],
      ["ad_26", "Lucky Wines (blocked)", "Other", "blocked", null],
      ["ad_27", "WinBig Fantasy App (blocked)", "Other", "blocked", null],
    ];
    for (const [id, biz, cat, status, ticket] of ads) {
      const blocked = status === "blocked";
      insAd.run(id, "sagara", biz, cat, "Owner", null, "taluk", status, blocked ? "fail" : "pass", null, null, ticket);
    }

    // ---------- Contracts, invoices, payments ----------
    const insCt = db.prepare(`INSERT INTO contract (id,advertiser_id,slot_id,months,start_date,value_inr,free_month,category_exclusive,political,mcmc_cert_ref,paid_for_by,status,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    insCt.run("ct_1", "ad_1", "rs_t_3", 3, "2026-09-01", 15000, 0, 1, 0, null, null, "active", "u_sales"); // sponsored segment, jeweller exclusive
    insCt.run("ct_2", "ad_2", "rs_t_1", 2, "2026-09-01", 6000, 0, 0, 0, null, null, "active", "u_sales");
    insCt.run("ct_3", "ad_3", "rs_t_5", 1, "2026-09-25", 8000, 0, 0, 0, null, null, "active", "u_sales");
    insCt.run("ct_4", "ad_4", "rs_t_1", 1, "2026-09-15", 0, 1, 0, 0, null, null, "active", "u_sales");
    insCt.run("ct_5", "ad_5", "rs_t_2", 3, "2026-09-10", 6000, 0, 0, 0, null, null, "active", "u_sales");
    insCt.run("ct_6", "ad_9", "rs_t_1", 1, "2026-09-20", 0, 1, 0, 0, null, null, "active", "u_sales");

    const insInv = db.prepare(`INSERT INTO invoice (id,contract_id,number,issued_at,due_at,amount_inr,gst_inr,status) VALUES (?,?,?,?,?,?,?,?)`);
    insInv.run("in_1", "ct_1", "TCN/SGR/2026-27/001", "2026-09-01", "2026-09-08", 15000, 2700, "paid");
    insInv.run("in_2", "ct_2", "TCN/SGR/2026-27/002", "2026-09-01", "2026-09-08", 6000, 1080, "paid");
    insInv.run("in_3", "ct_5", "TCN/SGR/2026-27/003", "2026-09-10", "2026-09-17", 6000, 1080, "paid");
    insInv.run("in_4", "ct_3", "TCN/SGR/2026-27/004", "2026-09-25", "2026-10-02", 8000, 1440, "issued");

    const insPay = db.prepare(`INSERT INTO payment (id,invoice_id,received_at,amount_inr,method,bank_ref,recorded_by) VALUES (?,?,?,?,?,?,?)`);
    insPay.run("py_1", "in_1", "2026-09-05", 17700, "bank_transfer", "NEFT SBIN2609051234", "u_sales");
    insPay.run("py_2", "in_2", "2026-09-06", 7080, "upi", "UPI 6264 1234 5678", "u_sales");
    insPay.run("py_3", "in_3", "2026-09-15", 7080, "cheque", "CHQ 004512 Canara Bank", "u_sales");

    // ---------- Equipment, on-call, escalation ----------
    db.prepare(`INSERT INTO equipment_check (id,taluk_id,date,by_user,ok,fault) VALUES (?,?,?,?,?,?)`).run("eq_1", "sagara", DEMO_DATE, "u_fo", 1, null);
    db.prepare(`INSERT INTO equipment_check (id,taluk_id,date,by_user,ok,fault) VALUES (?,?,?,?,?,?)`).run("eq_0", "sagara", prevDay, "u_fo", 0, "Lav mic cable intermittent — swapped to backup");
    db.prepare(`INSERT INTO oncall (id,taluk_id,week_start,user_id) VALUES (?,?,?,?)`).run("oc_1", "sagara", "2026-09-28", "u_te");
    db.prepare(`INSERT INTO escalation (id,story_id,kind,detail,raised_by,raised_at,decision,decided_by,decided_at) VALUES (?,?,?,?,?,?,?,?,?)`).run("es_1", "st_12", "political", "MLA statement on Sharavathi project — tone and footage source", "u_te", d("16:30"), null, null, null);
    db.prepare(`INSERT INTO escalation (id,story_id,kind,detail,raised_by,raised_at,decision,decided_by,decided_at) VALUES (?,?,?,?,?,?,?,?,?)`).run("es_0", "st_7", "cutoff", "Footage in at 15:10, cutoff 14:00. Breaking?", "u_desk", d("15:15"), "Not breaking. Roll to tomorrow.", "u_head", d("15:20"));

    // ---------- Audience months (pilot month 1 actuals; later months blank) ----------
    const insAud = db.prepare(`INSERT INTO audience_month (id,taluk_id,month,platform,views,reach,watch_time_min,followers,age_split,gender_split) VALUES (?,?,?,?,?,?,?,?,?,?)`);
    insAud.run("am_1", "sagara", "2026-09", "YouTube", 41200, 18500, 61800, 2150, JSON.stringify({ "18-24": 22, "25-34": 31, "35-44": 24, "45+": 23 }), JSON.stringify({ m: 64, f: 36 }));
    insAud.run("am_2", "sagara", "2026-09", "Instagram", 88400, 36200, 14700, 3480, JSON.stringify({ "18-24": 38, "25-34": 35, "35-44": 17, "45+": 10 }), JSON.stringify({ m: 55, f: 45 }));
    insAud.run("am_3", "sagara", "2026-09", "Facebook", 27900, 15100, 9800, 1920, JSON.stringify({ "18-24": 10, "25-34": 24, "35-44": 30, "45+": 36 }), JSON.stringify({ m: 58, f: 42 }));
    insAud.run("am_4", "sagara", "2026-09", "WhatsApp", 0, 1250, 0, 1250, null, null);

    // ---------- Decisions register (§17) ----------
    const insDec = db.prepare(`INSERT INTO decision (id,area,title,status,decision,position_a,position_b,why_it_matters,plan_ref,owner,due) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
    const decided: [string, string, string, string][] = [
      ["Format", "Fully digital", "Fully digital; state, district and taluk channels under one brand", "§1"],
      ["Purpose", "Identity, not news", "Identity and attachment to place, with daily current affairs; not a news channel", "§2.2"],
      ["Brand pattern", "Taluk name + constant word", "Taluk name + one constant brand word; working option Sagara Dhwani", "§2.4"],
      ["Daily promise", "Publish every day", "Every taluk publishes every day", "§4.1"],
      ["Production", "State team produces 100%", "State team produces 100% of content initially", "§4.5"],
      ["Taluk unit", "Two people", "Two people; both interview, Editor leads, Operator apprentices", "§7"],
      ["Hiring", "Not journalism graduates", "Two sourcing routes; trial-week selection", "§7.3"],
      ["Content sourcing", "Retell in our own words", "Retell stories in our own Kannada words; never line-by-line translation or AI rephrasing of a source script", "§5"],
      ["Voice", "One AI voice", "AI voiceover, one consistent voice across the channel", "§5.4"],
      ["Local creators", "Standing permission roster", "Standing WhatsApp permission and a roster of five to six cleared voices per taluk", "§6.3"],
      ["Footage", "Green/amber/red", "Green/amber/red rules; central clearance for amber", "§6"],
      ["AI", "No AI visuals in news", "AI brought inside the channel; no AI visuals in news, ever", "§8"],
      ["Advertising", "Fixed central rate card", "Prohibited categories list; fixed central rate card; no taluk discounting", "§9, §11"],
      ["Political ads", "Central only", "Sold and certified centrally only", "§9.5"],
      ["Pricing", "After pilot numbers", "Rupee values set only after pilot audience numbers", "§11.3"],
      ["Pilot", "Sagara, six months", "Sagara, six months, single taluk", "§13"],
      ["Pitch", "Fund the pilot", "Ask funds the pilot, not the network; month-3 checkpoint; founder salary and AI rate budgeted at nominal levels", "§15"],
      ["Founder", "Full-time", "Full-time until self-sustaining", "§1"],
    ];
    decided.forEach(([area, title, dec, ref], i) => insDec.run(`dc_${i + 1}`, area, title, "decided", dec, null, null, null, ref, "u_founder", null));
    const open: [string, string, string, string, string, string][] = [
      ["Money", "Size of the state team", "One central editor-producer (budget ₹9,74,000)", "Five-person state team (budget about ₹17,67,000)", "The biggest number in the pitch. Middle path ≈ ₹12,39,000 in §14.3.", "§14.1, §14.3"],
      ["Brand and content", "Content mix", "2–3 local stories every day, plus identity and filtered state pieces", "Mostly general state-level stories retold, with taluk angles only where they fit", "One is Sagara's own voice; the other is a Kannada story channel. The local mix is what local advertisers pay for.", "§4"],
      ["Brand and content", "Political positioning", "Openly aligned in sympathy", "Editorially straight daily news, mission in identity content", "Shapes audience and advertiser base. Not formally resolved.", "§2.3"],
      ["People", "Who conducts interviews", "Job description: the Editor conducts all interviews", "Later decision: both roles interview", "Resolved in favour of both; the job description text should be updated.", "§7"],
      ["Brand and content", "Final brand word — Dhwani or an alternative", "Dhwani", "Nudi / Kahale", "Short and warm vs literary vs stirring.", "§2.4"],
      ["Brand and content", "Choose the channel's AI voice", null as unknown as string, null as unknown as string, "Brand identity across every taluk.", "§5.4"],
      ["People", "Hire the rewriter / content editor", null as unknown as string, null as unknown as string, "Needed before day one.", "§7"],
      ["People", "Hire the production desk owner and the sales & collections owner", null as unknown as string, null as unknown as string, "Needed before first sale.", "§12"],
      ["People", "Identify the two Sagara taluk hires", null as unknown as string, null as unknown as string, "Trial week.", "§7.3"],
      ["People", "Pay bands, equipment policy, travel rules, weekly off, cutoff time, night call-out threshold", null as unknown as string, null as unknown as string, "Operating rules for the unit.", "§7.5"],
      ["Money", "Validate 25 advertisers at ₹3,000 in Sagara", null as unknown as string, null as unknown as string, "Confidence in the revenue slide.", "§14.2"],
      ["Money", "Rupee values per slot (after pilot audience numbers)", null as unknown as string, null as unknown as string, "Rate card values.", "§11.3"],
      ["Money", "Commission for taluk staff on local sales", null as unknown as string, null as unknown as string, "Incentive without discounting.", "§12"],
      ["Money", "Payment terms and collection owner", null as unknown as string, null as unknown as string, "Cash flow.", "§12.2"],
      ["Money", "Investment amount and what portion it buys", null as unknown as string, null as unknown as string, "The ask.", "§15"],
      ["Structure and legal", "Number of taluks in phase one and timeline", null as unknown as string, null as unknown as string, "Network round.", "§13"],
      ["Structure and legal", "Engage a CA and a media lawyer", null as unknown as string, null as unknown as string, "Before launch.", "§16"],
      ["Structure and legal", "Entity structure and cap table — new entity or under Kriyatma", null as unknown as string, null as unknown as string, "Investor requirement.", "§16"],
      ["Structure and legal", "Employee vs contractor model for field staff", null as unknown as string, null as unknown as string, "Cost and compliance.", "§16"],
      ["Structure and legal", "Invoicing system before the first sale", null as unknown as string, null as unknown as string, "Every rupee banked.", "§12.2"],
      ["Structure and legal", "Consent templates for creators and viewer submissions", null as unknown as string, null as unknown as string, "Footage rules depend on it.", "§6.3"],
    ];
    open.forEach(([area, title, a, b, why, ref], i) => insDec.run(`do_${i + 1}`, area, title, "open", null, a, b, why, ref, "u_founder", "2026-10-15"));

    // ---------- Unblock log (§13.1) ----------
    const insUb = db.prepare(`INSERT INTO unblock_log (id,date,what,who_helped,why_hired_editor_could_not,playbook_note) VALUES (?,?,?,?,?,?)`);
    insUb.run("ub_1", "2026-09-03", "APMC secretary agreed to a weekly price briefing on camera", "Founder's personal contact at the APMC", "A new hire has no standing with the APMC office", "Playbook: introduce the Taluk Editor with a channel letter in week 1; request a standing weekly slot.");
    insUb.run("ub_2", "2026-09-11", "Keladi museum allowed interior photography for AI reference", "Founder knew the trustee", "Permission normally takes a written application and weeks", "Playbook: template letter to museum trusts; ask during the three-week prep.");
    insUb.run("ub_3", "2026-09-18", "First three advertisers signed in one visit", "Founder's relationships on main road", "Cold calls from a stranger convert far slower", "Playbook: sales owner carries the published-day reel and a one-page rate card; first visit with Taluk Editor present.");

    // ---------- Budget lines (docs/04-budget.md) ----------
    const insBl = db.prepare(`INSERT INTO budget_line (id,section,line,basis,lean_inr,five_inr,middle_inr,sort) VALUES (?,?,?,?,?,?,?,?)`);
    // Matches docs/04-budget.md: A lean ₹9,74,000 · B five-person ₹17,67,000 · C middle path ≈₹12,39,000
    const bl: [string, string, string, number | null, number | null, number | null][] = [
      ["Taluk unit", "Taluk Editor", "₹25,000 × 6", 150000, 150000, 150000],
      ["Taluk unit", "Field Operator", "₹15,000 × 6", 90000, 90000, 90000],
      ["Taluk unit", "Data, travel, fuel", "₹5,000 × 6", 30000, 30000, 30000],
      ["Taluk unit", "Equipment (one-time)", "Camera/phone, mic, light, laptop", 70000, 70000, 70000],
      ["Central production", "Central production", "A: one editor-producer ₹35,000/mo · B: five-person team ₹1,55,000/mo · C: ₹75,000/mo", 210000, 930000, 450000],
      ["Central", "Founder salary (nominal)", "₹40,000 × 6", 240000, 240000, 240000],
      ["Central", "Hosting, platform, software", "₹6,000 × 6", 36000, 36000, 36000],
      ["Central", "Buffer bank", "15 evergreen pieces, pre-launch", 60000, 60000, 60000],
      ["Central", "Contingency", "≈10%", 88000, 161000, 113000],
    ];
    bl.forEach(([sec, line, basis, a, b, c], i) => insBl.run(`bl_${i + 1}`, sec, line, basis, a, b, c, i + 1));

    // ---------- Audit ----------
    db.prepare(`INSERT INTO audit (at,user_id,action,entity,entity_id,detail) VALUES (?,?,?,?,?,?)`).run(d("08:05"), "u_te", "lineup.confirm", "daily_lineup", "lu_1", null);
    db.prepare(`INSERT INTO audit (at,user_id,action,entity,entity_id,detail) VALUES (?,?,?,?,?,?)`).run(d("12:30"), "u_desk", "story.publish", "story", "st_1", JSON.stringify({ turnaround_h: 3.2 }));
    db.prepare(`INSERT INTO audit (at,user_id,action,entity,entity_id,detail) VALUES (?,?,?,?,?,?)`).run(d("15:45"), "u_desk", "story.publish", "story", "st_2", JSON.stringify({ turnaround_h: 4.7 }));
    db.prepare(`INSERT INTO audit (at,user_id,action,entity,entity_id,detail) VALUES (?,?,?,?,?,?)`).run(d("16:00"), "u_head", "asset.reject", "asset", "as_8", null);
  });
  tx();
}
