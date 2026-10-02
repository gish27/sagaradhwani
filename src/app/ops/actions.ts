"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { audit, getDb, resetDb } from "@/db/client";
import { assetsFor, slots, story as getStory, advertisers as listAdvertisers } from "@/db/queries";
import { currentUser, roleOf, ROLE_COOKIE } from "@/lib/session";
import { assertCan } from "@/domain/permissions";
import {
  assertAssetCanAttach, assertCanApproveScript, assertCanPublish, assertPaymentMethod, computeContractValue,
  initialClearance, RuleError, shouldRoll, turnaroundHours, assertAdvertiserAllowed,
} from "@/domain/rules";
import { PROHIBITED_CATEGORIES } from "@/domain/constants";
import { uid } from "@/lib/format";

export type ActionState = { ok: boolean; message: string } | null;

function fail(e: unknown): ActionState {
  const msg = e instanceof RuleError || e instanceof Error ? e.message : String(e);
  return { ok: false, message: msg };
}
function ok(message: string): ActionState {
  return { ok: true, message };
}
const s = (fd: FormData, k: string) => (fd.get(k) as string | null)?.toString().trim() || null;
const n = (fd: FormData, k: string) => {
  const v = s(fd, k);
  return v == null || v === "" ? null : Number(v);
};
const b = (fd: FormData, k: string) => fd.get(k) != null && fd.get(k) !== "0" && fd.get(k) !== "false";
const now = () => new Date().toISOString();

export async function switchUser(fd: FormData) {
  const id = s(fd, "user_id");
  const jar = await cookies();
  if (id) jar.set(ROLE_COOKIE, id, { path: "/", httpOnly: true, sameSite: "lax" });
  redirect((s(fd, "back") as string) || "/ops");
}

export async function resetDemo() {
  const u = await currentUser();
  assertCan(roleOf(u), "policy.edit");
  resetDb();
  revalidatePath("/", "layout");
  redirect("/ops");
}

// ---------- Lineup ----------
export async function confirmLineup(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "lineup.confirm");
    const date = s(fd, "date")!;
    const nothing = b(fd, "nothing_coming") ? 1 : 0;
    const db = getDb();
    const existing = db.prepare("SELECT id FROM daily_lineup WHERE taluk_id='sagara' AND date=?").get(date) as { id: string } | undefined;
    const id = existing?.id ?? uid("lu");
    if (existing) db.prepare("UPDATE daily_lineup SET confirmed_at=?, confirmed_by=?, nothing_coming=? WHERE id=?").run(now(), u.id, nothing, id);
    else db.prepare("INSERT INTO daily_lineup (id,taluk_id,date,confirmed_at,confirmed_by,nothing_coming) VALUES (?,?,?,?,?,?)").run(id, "sagara", date, now(), u.id, nothing);
    audit(u.id, "lineup.confirm", "daily_lineup", id, { nothing });
    revalidatePath("/ops", "layout");
    return ok(nothing ? "Lineup confirmed: nothing coming — buffer piece will be scheduled." : "Lineup confirmed by 8 am rule.");
  } catch (e) {
    return fail(e);
  }
}

export async function createStory(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "story.create");
    const layer = s(fd, "layer")!;
    const political = b(fd, "political") ? 1 : 0;
    const paid = b(fd, "paid") ? 1 : 0;
    const advertiserId = s(fd, "advertiser_id");
    if (paid && !advertiserId) throw new RuleError("A paid story must name its advertiser.");
    if (paid && layer === "daily_pulse") throw new RuleError("Paid content does not go inside the daily pulse. Use a dedicated, labelled story.");
    const date = s(fd, "date")!;
    const db = getDb();
    const lu = db.prepare("SELECT id FROM daily_lineup WHERE taluk_id='sagara' AND date=?").get(date) as { id: string } | undefined;
    const id = uid("st");
    const cutoff = `${date}T14:00:00+05:30`;
    db.prepare(`INSERT INTO story (id,taluk_id,lineup_id,date,title,layer,bucket,source,status,political,paid,advertiser_id,brief_angle,brief_key_line,brief_clip_order,cutoff_at,slot,is_buffer,summary)
      VALUES (?,?,?,?,?,?,?,?,'idea',?,?,?,?,?,?,?,?,?,?)`).run(
      id, "sagara", lu?.id ?? null, date, s(fd, "title"), layer, s(fd, "bucket"), s(fd, "source") ?? "taluk", political, paid, advertiserId,
      s(fd, "brief_angle"), s(fd, "brief_key_line"), s(fd, "brief_clip_order"), cutoff, s(fd, "slot"), b(fd, "is_buffer") ? 1 : 0, s(fd, "summary"),
    );
    audit(u.id, "story.create", "story", id, { title: s(fd, "title") });
    revalidatePath("/ops", "layout");
    return ok("Story added to the lineup as an idea.");
  } catch (e) {
    return fail(e);
  }
}

export async function setStoryStatus(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    const id = s(fd, "story_id")!;
    const status = s(fd, "status")!;
    const st = getStory(id);
    if (!st) throw new RuleError("Story not found.");
    const role = roleOf(u);
    if (status === "assigned") assertCan(role, "story.assign");
    if (status === "killed") assertCan(role, "story.assign");
    if (status === "produced") assertCan(role, "asset.attach");
    if (status === "approved") {
      assertCanApproveScript(role, st);
      getDb().prepare("UPDATE story SET status='approved', approved_at=?, approved_by=? WHERE id=?").run(now(), u.id, id);
    } else {
      getDb().prepare("UPDATE story SET status=? WHERE id=?").run(status, id);
    }
    audit(u.id, `story.${status}`, "story", id);
    revalidatePath("/ops", "layout");
    return ok(`Story marked ${status}.`);
  } catch (e) {
    return fail(e);
  }
}

export async function publishStory(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    const id = s(fd, "story_id")!;
    const st = getStory(id);
    if (!st) throw new RuleError("Story not found.");
    assertCanPublish(roleOf(u), st, assetsFor(id));
    const urls = (s(fd, "platform_urls") ?? "").split(/\s+/).filter(Boolean);
    const publishedAt = now();
    const db = getDb();
    db.transaction(() => {
      db.prepare("UPDATE story SET status='published', published_at=?, published_by=?, platform_urls=? WHERE id=?").run(publishedAt, u.id, JSON.stringify(urls), id);
      if (st.layer === "identity") {
        db.prepare(`INSERT INTO archive_item (id,story_id,bucket,tags,places,people,era,rights_status,archived_at) VALUES (?,?,?,?,?,?,?,?,?)
          ON CONFLICT(story_id) DO UPDATE SET archived_at=excluded.archived_at`).run(uid("ar"), id, st.bucket, "[]", "[]", "[]", null, "own", publishedAt);
      }
    })();
    audit(u.id, "story.publish", "story", id, { turnaround_h: turnaroundHours(st.footage_in_at, publishedAt) });
    revalidatePath("/", "layout");
    return ok("Published. Turnaround recorded; identity pieces archived.");
  } catch (e) {
    return fail(e);
  }
}

// ---------- Captures ----------
export async function logCapture(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "capture.log");
    const storyId = s(fd, "story_id")!;
    const st = getStory(storyId);
    if (!st) throw new RuleError("Story not found.");
    const uploadedAt = now();
    const db = getDb();
    const id = uid("cp");
    db.prepare(`INSERT INTO capture (id,story_id,file_name,kind,duration_s,uploaded_at,uploaded_by,interviewee_name,interviewee_designation,interviewee_place,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, storyId, s(fd, "file_name") ?? `${uploadedAt.slice(0, 10)}_capture.mp4`, s(fd, "kind") ?? "video", n(fd, "duration_s"), uploadedAt, u.id,
      s(fd, "interviewee_name"), s(fd, "interviewee_designation"), s(fd, "interviewee_place"), s(fd, "notes"),
    );
    let message = "Capture logged.";
    if (!st.footage_in_at) {
      const breaking = b(fd, "breaking");
      const rolled = st.cutoff_at ? shouldRoll(new Date(uploadedAt), new Date(st.cutoff_at), breaking) : false;
      db.prepare("UPDATE story SET footage_in_at=?, status=CASE WHEN status IN ('idea','assigned') THEN ? ELSE status END WHERE id=?").run(uploadedAt, rolled ? "rolled" : "captured", storyId);
      if (rolled) message = "Footage arrived after the cutoff and is not breaking — story rolled to the next day.";
      else message = "Capture logged; footage-in time stamped. Turnaround clock started.";
    }
    audit(u.id, "capture.log", "capture", id);
    revalidatePath("/ops", "layout");
    return ok(message);
  } catch (e) {
    return fail(e);
  }
}

// ---------- Scripts ----------
export async function saveScript(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "script.write");
    const storyId = s(fd, "story_id")!;
    const db = getDb();
    const v = (db.prepare("SELECT COALESCE(MAX(version),0) AS v FROM script WHERE story_id=?").get(storyId) as { v: number }).v + 1;
    const facts = (s(fd, "facts") ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
    const phon = (s(fd, "phonetics") ?? "").split("\n").map((x) => x.trim()).filter(Boolean).map((line) => {
      const [word, say] = line.split("=").map((x) => x.trim());
      return { word, say: say ?? "" };
    });
    const id = uid("sc");
    db.prepare(`INSERT INTO script (id,story_id,version,facts,primary_source,body_kn,phonetics,retold,written_by) VALUES (?,?,?,?,?,?,?,?,?)`).run(
      id, storyId, v, JSON.stringify(facts), s(fd, "primary_source"), s(fd, "body_kn"), JSON.stringify(phon), b(fd, "retold") ? 1 : 0, u.id,
    );
    db.prepare("UPDATE story SET status=CASE WHEN status IN ('idea','assigned','captured') THEN 'scripted' ELSE status END WHERE id=?").run(storyId);
    audit(u.id, "script.save", "script", id, { version: v });
    revalidatePath("/ops", "layout");
    return ok(`Script v${v} saved.`);
  } catch (e) {
    return fail(e);
  }
}

export async function approveScript(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    const id = s(fd, "script_id")!;
    const db = getDb();
    const sc = db.prepare("SELECT * FROM script WHERE id=?").get(id) as { story_id: string } | undefined;
    if (!sc) throw new RuleError("Script not found.");
    const st = getStory(sc.story_id)!;
    assertCanApproveScript(roleOf(u), st);
    const t = now();
    db.prepare("UPDATE script SET approved_by=?, approved_at=? WHERE id=?").run(u.id, t, id);
    db.prepare("UPDATE story SET status='approved', approved_at=?, approved_by=? WHERE id=? AND status NOT IN ('published','killed')").run(t, u.id, st.id);
    audit(u.id, "script.approve", "script", id);
    revalidatePath("/ops", "layout");
    return ok(st.political ? "Political script approved by the content head." : "Script approved.");
  } catch (e) {
    return fail(e);
  }
}

export async function markVoiceDone(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "asset.attach");
    getDb().prepare("UPDATE script SET voice_done=1 WHERE id=?").run(s(fd, "script_id"));
    revalidatePath("/ops", "layout");
    return ok("AI voice marked done.");
  } catch (e) {
    return fail(e);
  }
}

// ---------- Assets / clearance ----------
export async function attachAsset(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "asset.attach");
    const storyId = s(fd, "story_id")!;
    const st = getStory(storyId);
    if (!st) throw new RuleError("Story not found.");
    const tier = s(fd, "tier") as "green" | "amber" | "red";
    const ai = b(fd, "ai_generated") ? 1 : 0;
    assertAssetCanAttach(st, { tier, ai_generated: ai });
    const checklist: Record<string, boolean> = {};
    for (const k of ["who_shot", "written_permission", "identifiable_aware", "minors_consent", "verified_event", "credit_on_screen", "central_cleared"]) checklist[k] = b(fd, `ck_${k}`);
    if (!checklist.minors_consent) throw new RuleError("Minors without a parent's consent: never.");
    const id = uid("as");
    getDb().prepare(`INSERT INTO asset (id,story_id,description,own,ai_generated,tier,source_type,source_name,duration_s,credit_on_screen,permission_ref,checklist,clearance_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, storyId, s(fd, "description"), b(fd, "own") ? 1 : 0, ai, tier, s(fd, "source_type") ?? "own", s(fd, "source_name"), n(fd, "duration_s"), checklist.credit_on_screen ? 1 : 0, s(fd, "permission_ref"), JSON.stringify(checklist), initialClearance(tier),
    );
    audit(u.id, "asset.attach", "asset", id, { tier });
    revalidatePath("/ops", "layout");
    return ok(tier === "amber" ? "Amber asset attached — publish is blocked until the central desk clears it." : "Asset attached.");
  } catch (e) {
    return fail(e);
  }
}

export async function clearAsset(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "asset.clear");
    const id = s(fd, "asset_id")!;
    const decision = s(fd, "decision") as "cleared" | "rejected";
    getDb().prepare("UPDATE asset SET clearance_status=?, cleared_by=?, cleared_at=?, clearance_note=? WHERE id=?").run(decision, u.id, now(), s(fd, "note"), id);
    audit(u.id, `asset.${decision}`, "asset", id);
    revalidatePath("/ops", "layout");
    return ok(decision === "cleared" ? "Cleared. Credit must appear on screen and in the description." : "Rejected. Recreate, license, or shoot our own.");
  } catch (e) {
    return fail(e);
  }
}

// ---------- Creators ----------
export async function addCreator(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "creator.manage");
    const id = uid("cr");
    const ref = s(fd, "permission_ref");
    const db = getDb();
    db.transaction(() => {
      db.prepare("INSERT INTO creator (id,taluk_id,name,handle,platform,permission_ref,permission_at,active) VALUES (?,?,?,?,?,?,?,?)").run(id, "sagara", s(fd, "name"), s(fd, "handle"), s(fd, "platform"), ref, ref ? now() : null, ref ? 1 : 0);
      if (ref) db.prepare("INSERT INTO consent (id,kind,subject_name,given_by,relation,reference,given_at,creator_id) VALUES (?,?,?,?,?,?,?,?)").run(uid("cs"), "creator_standing", s(fd, "name"), s(fd, "name"), "self", ref, now(), id);
    })();
    audit(u.id, "creator.add", "creator", id);
    revalidatePath("/ops", "layout");
    return ok(ref ? "Creator added to the cleared roster." : "Creator added — inactive until standing permission is saved.");
  } catch (e) {
    return fail(e);
  }
}

// ---------- Sales ----------
export async function upsertAdvertiser(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "sales.manage");
    const category = s(fd, "category") ?? "Other";
    const prohibited = PROHIBITED_CATEGORIES.some((p) => b(fd, `pro_${PROHIBITED_CATEGORIES.indexOf(p)}`));
    const id = uid("ad");
    getDb().prepare(`INSERT INTO advertiser (id,taluk_id,business,category,contact,phone,tier,status,prohibited_check,gstin,likely_ticket_inr) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, "sagara", s(fd, "business"), category, s(fd, "contact"), s(fd, "phone"), "taluk", prohibited ? "blocked" : "prospect", prohibited ? "fail" : "pass", s(fd, "gstin"), n(fd, "likely_ticket_inr"),
    );
    audit(u.id, "advertiser.add", "advertiser", id, { prohibited });
    revalidatePath("/ops", "layout");
    return prohibited ? { ok: false, message: "Advertiser recorded as blocked: prohibited category." } : ok("Advertiser added as a prospect.");
  } catch (e) {
    return fail(e);
  }
}

export async function setSlotPrice(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "ratecard.edit");
    getDb().prepare("UPDATE rate_card_slot SET price_inr=? WHERE id=?").run(n(fd, "price_inr"), s(fd, "slot_id"));
    audit(u.id, "ratecard.price", "rate_card_slot", s(fd, "slot_id"), { price: n(fd, "price_inr") });
    revalidatePath("/ops", "layout");
    return ok("Rate card value set centrally.");
  } catch (e) {
    return fail(e);
  }
}

export async function createContract(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "sales.manage");
    const advertiserId = s(fd, "advertiser_id")!;
    const slotId = s(fd, "slot_id")!;
    const months = n(fd, "months") ?? 0;
    const freeMonth = b(fd, "free_month");
    const ad = listAdvertisers().find((a) => a.id === advertiserId);
    if (!ad) throw new RuleError("Advertiser not found.");
    const needsCentral = PROHIBITED_CATEGORIES.some((p) => p.central_only && ad.central_screen_decision === "pending");
    assertAdvertiserAllowed(ad.prohibited_check, ad.central_screen_decision, needsCentral);
    const slot = slots().find((x) => x.id === slotId);
    if (!slot) throw new RuleError("Slot not found.");
    if (slot.political && roleOf(u) !== "founder" && roleOf(u) !== "content_head") throw new RuleError("Political advertising is sold centrally only — founder or content head.");
    const value = computeContractValue({ months, price_inr: slot.price_inr, free_month: freeMonth, political: !!slot.political, mcmc_cert_ref: s(fd, "mcmc_cert_ref"), paid_for_by: s(fd, "paid_for_by") });
    const db = getDb();
    if (slot.category_exclusive) {
      const clash = db.prepare("SELECT c.id FROM contract c JOIN advertiser a ON a.id=c.advertiser_id WHERE c.slot_id=? AND c.status='active' AND a.category=? AND c.advertiser_id<>?").get(slotId, ad.category, advertiserId);
      if (clash) throw new RuleError(`Category-exclusive slot already sold to another ${ad.category}.`);
    }
    const id = uid("ct");
    const start = s(fd, "start_date") ?? new Date().toISOString().slice(0, 10);
    db.transaction(() => {
      db.prepare(`INSERT INTO contract (id,advertiser_id,slot_id,months,start_date,value_inr,free_month,category_exclusive,political,mcmc_cert_ref,paid_for_by,status,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,'active',?)`).run(
        id, advertiserId, slotId, months, start, value, freeMonth ? 1 : 0, slot.category_exclusive, slot.political, s(fd, "mcmc_cert_ref"), s(fd, "paid_for_by"), u.id,
      );
      db.prepare("UPDATE advertiser SET status=? WHERE id=?").run(freeMonth ? "free_month" : "active", advertiserId);
      if (value > 0) {
        const seq = (db.prepare("SELECT COUNT(*) AS c FROM invoice").get() as { c: number }).c + 1;
        const due = new Date(Date.parse(start) + 7 * 864e5).toISOString().slice(0, 10);
        db.prepare("INSERT INTO invoice (id,contract_id,number,issued_at,due_at,amount_inr,gst_inr,status) VALUES (?,?,?,?,?,?,?,'issued')").run(uid("in"), id, `TCN/SGR/2026-27/${String(seq).padStart(3, "0")}`, start, due, value, Math.round(value * 0.18));
      }
    })();
    audit(u.id, "contract.create", "contract", id, { value });
    revalidatePath("/ops", "layout");
    return ok(value > 0 ? `Contract created and invoice issued for ₹${value.toLocaleString("en-IN")} + GST. No discounting applied.` : "Free month recorded. Invoice follows when the paid month starts.");
  } catch (e) {
    return fail(e);
  }
}

export async function recordPayment(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "payment.record");
    const method = s(fd, "method") ?? "";
    assertPaymentMethod(method);
    const invoiceId = s(fd, "invoice_id")!;
    const amount = n(fd, "amount_inr") ?? 0;
    if (amount <= 0) throw new RuleError("Amount must be positive.");
    const db = getDb();
    const inv = db.prepare("SELECT amount_inr, gst_inr FROM invoice WHERE id=?").get(invoiceId) as { amount_inr: number; gst_inr: number } | undefined;
    if (!inv) throw new RuleError("Invoice not found.");
    const id = uid("py");
    db.transaction(() => {
      db.prepare("INSERT INTO payment (id,invoice_id,received_at,amount_inr,method,bank_ref,recorded_by) VALUES (?,?,?,?,?,?,?)").run(id, invoiceId, now().slice(0, 10), amount, method, s(fd, "bank_ref"), u.id);
      const paid = (db.prepare("SELECT COALESCE(SUM(amount_inr),0) AS s FROM payment WHERE invoice_id=?").get(invoiceId) as { s: number }).s;
      if (paid >= inv.amount_inr + inv.gst_inr) db.prepare("UPDATE invoice SET status='paid' WHERE id=?").run(invoiceId);
    })();
    audit(u.id, "payment.record", "payment", id, { amount, method });
    revalidatePath("/ops", "layout");
    return ok("Payment recorded against the company bank account.");
  } catch (e) {
    return fail(e);
  }
}

// ---------- Governance ----------
export async function resolveDecision(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "decision.edit");
    getDb().prepare("UPDATE decision SET status='decided', decision=? WHERE id=?").run(s(fd, "decision"), s(fd, "decision_id"));
    audit(u.id, "decision.resolve", "decision", s(fd, "decision_id"));
    revalidatePath("/ops", "layout");
    return ok("Decision recorded.");
  } catch (e) {
    return fail(e);
  }
}

export async function addUnblock(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "unblock.log");
    const id = uid("ub");
    getDb().prepare("INSERT INTO unblock_log (id,date,what,who_helped,why_hired_editor_could_not,playbook_note) VALUES (?,?,?,?,?,?)").run(id, now().slice(0, 10), s(fd, "what"), s(fd, "who_helped"), s(fd, "why"), s(fd, "playbook_note"));
    audit(u.id, "unblock.log", "unblock_log", id);
    revalidatePath("/ops", "layout");
    return ok("Logged. This becomes a line in the playbook.");
  } catch (e) {
    return fail(e);
  }
}

export async function decideEscalation(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "script.approve");
    getDb().prepare("UPDATE escalation SET decision=?, decided_by=?, decided_at=? WHERE id=?").run(s(fd, "decision"), u.id, now(), s(fd, "escalation_id"));
    revalidatePath("/ops", "layout");
    return ok("Escalation decided.");
  } catch (e) {
    return fail(e);
  }
}

export async function logEquipment(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const u = await currentUser();
    assertCan(roleOf(u), "equipment.check");
    const okFlag = b(fd, "ok") ? 1 : 0;
    getDb().prepare("INSERT INTO equipment_check (id,taluk_id,date,by_user,ok,fault) VALUES (?,?,?,?,?,?)").run(uid("eq"), "sagara", now().slice(0, 10), u.id, okFlag, s(fd, "fault"));
    revalidatePath("/ops", "layout");
    return ok(okFlag ? "Equipment check: all good." : "Fault logged — swap to backup and tell the desk.");
  } catch (e) {
    return fail(e);
  }
}
