import { getDb } from "./client";
import { turnaroundHours } from "@/domain/rules";
import { DEMO_DATE } from "./seed";

export type Row = Record<string, unknown>;

export interface Story {
  id: string; taluk_id: string; lineup_id: string | null; date: string; title: string;
  layer: "daily_pulse" | "identity" | "participation"; bucket: string | null; source: string; tagged_story_id: string | null;
  status: string; political: number; paid: number; advertiser_id: string | null;
  brief_angle: string | null; brief_key_line: string | null; brief_clip_order: string | null;
  footage_in_at: string | null; cutoff_at: string | null; approved_at: string | null; approved_by: string | null;
  published_at: string | null; published_by: string | null; platform_urls: string; slot: string | null; is_buffer: number; summary: string | null;
}
export interface Asset {
  id: string; story_id: string; description: string; own: number; ai_generated: number; tier: "green" | "amber" | "red";
  source_type: string; source_name: string | null; duration_s: number | null; credit_on_screen: number; permission_ref: string | null;
  checklist: string; clearance_status: "n/a" | "pending" | "cleared" | "rejected"; cleared_by: string | null; cleared_at: string | null; clearance_note: string | null;
}
export interface Capture {
  id: string; story_id: string; file_name: string; kind: string; duration_s: number | null; uploaded_at: string; uploaded_by: string | null;
  interviewee_name: string | null; interviewee_designation: string | null; interviewee_place: string | null; notes: string | null;
}
export interface Script {
  id: string; story_id: string; version: number; facts: string; primary_source: string | null; body_kn: string | null; phonetics: string;
  retold: number; written_by: string | null; approved_by: string | null; approved_at: string | null; voice_done: number;
}
export interface User { id: string; name: string; role: string; taluk_id: string | null; declared_affiliation: string | null; personal_page_terms: string | null; backup_for_user_id: string | null; active: number }
export interface Advertiser { id: string; taluk_id: string | null; business: string; category: string; contact: string | null; phone: string | null; tier: string; status: string; prohibited_check: string | null; central_screen_decision: string | null; gstin: string | null; likely_ticket_inr: number | null }
export interface Slot { id: string; rate_card_id: string; slot_type: string; format: string | null; sold_as: string | null; price_inr: number | null; category_exclusive: number; political: number; sort: number }
export interface Contract { id: string; advertiser_id: string; slot_id: string; months: number; start_date: string; value_inr: number; free_month: number; category_exclusive: number; political: number; mcmc_cert_ref: string | null; paid_for_by: string | null; status: string; created_by: string | null }
export interface Invoice { id: string; contract_id: string; number: string; issued_at: string; due_at: string; amount_inr: number; gst_inr: number; status: string }
export interface Payment { id: string; invoice_id: string; received_at: string; amount_inr: number; method: string; bank_ref: string | null; recorded_by: string | null }
export interface Decision { id: string; area: string; title: string; status: "decided" | "open"; decision: string | null; position_a: string | null; position_b: string | null; why_it_matters: string | null; plan_ref: string | null; owner: string | null; due: string | null }

export const DEFAULT_TALUK = "sagara";

export function q() {
  return getDb();
}

export function taluk(id = DEFAULT_TALUK) {
  return q().prepare("SELECT * FROM taluk WHERE id = ?").get(id) as { id: string; name: string; district: string; brand_name: string; cutoff_time: string; publish_time: string; night_callout_threshold: string | null; launched_on: string | null };
}

export function users(): User[] {
  return q().prepare("SELECT * FROM user WHERE active = 1 ORDER BY rowid").all() as User[];
}
export function userById(id: string | null | undefined): User | undefined {
  if (!id) return undefined;
  return q().prepare("SELECT * FROM user WHERE id = ?").get(id) as User | undefined;
}
export function userMap(): Record<string, string> {
  const m: Record<string, string> = {};
  for (const u of users()) m[u.id] = u.name;
  return m;
}

export function storiesForDate(date: string, talukId = DEFAULT_TALUK): Story[] {
  return q().prepare("SELECT * FROM story WHERE taluk_id = ? AND date = ? ORDER BY CASE slot WHEN 'Morning' THEN 1 WHEN 'Mid-day' THEN 2 WHEN 'Afternoon' THEN 3 WHEN 'Evening' THEN 4 ELSE 5 END, rowid").all(talukId, date) as Story[];
}
export function allStories(talukId = DEFAULT_TALUK): Story[] {
  return q().prepare("SELECT * FROM story WHERE taluk_id = ? ORDER BY date DESC, rowid").all(talukId) as Story[];
}
export function story(id: string): Story | undefined {
  return q().prepare("SELECT * FROM story WHERE id = ?").get(id) as Story | undefined;
}
export function publishedStories(talukId = DEFAULT_TALUK): Story[] {
  return q().prepare("SELECT * FROM story WHERE taluk_id = ? AND status = 'published' ORDER BY published_at DESC").all(talukId) as Story[];
}
export function assetsFor(storyId: string): Asset[] {
  return q().prepare("SELECT * FROM asset WHERE story_id = ? ORDER BY rowid").all(storyId) as Asset[];
}
export function allAssets(): (Asset & { story_title: string; story_layer: string })[] {
  return q().prepare("SELECT a.*, s.title AS story_title, s.layer AS story_layer FROM asset a JOIN story s ON s.id = a.story_id ORDER BY CASE a.clearance_status WHEN 'pending' THEN 0 ELSE 1 END, a.rowid DESC").all() as (Asset & { story_title: string; story_layer: string })[];
}
export function capturesFor(storyId: string): Capture[] {
  return q().prepare("SELECT * FROM capture WHERE story_id = ? ORDER BY uploaded_at").all(storyId) as Capture[];
}
export function allCaptures(): (Capture & { story_title: string; story_date: string })[] {
  return q().prepare("SELECT c.*, s.title AS story_title, s.date AS story_date FROM capture c JOIN story s ON s.id = c.story_id ORDER BY c.uploaded_at DESC").all() as (Capture & { story_title: string; story_date: string })[];
}
export function scriptsFor(storyId: string): Script[] {
  return q().prepare("SELECT * FROM script WHERE story_id = ? ORDER BY version DESC").all(storyId) as Script[];
}
export function allScripts(): (Script & { story_title: string; story_political: number; story_layer: string })[] {
  return q().prepare("SELECT sc.*, s.title AS story_title, s.political AS story_political, s.layer AS story_layer FROM script sc JOIN story s ON s.id = sc.story_id ORDER BY sc.approved_at IS NOT NULL, sc.rowid DESC").all() as (Script & { story_title: string; story_political: number; story_layer: string })[];
}
export function lineup(date: string, talukId = DEFAULT_TALUK) {
  return q().prepare("SELECT * FROM daily_lineup WHERE taluk_id = ? AND date = ?").get(talukId, date) as { id: string; confirmed_at: string | null; confirmed_by: string | null; nothing_coming: number } | undefined;
}
export function taggedStories() {
  return q().prepare("SELECT * FROM tagged_story ORDER BY date DESC, rowid").all() as { id: string; date: string; title: string; summary: string | null; level: string; tags: string; source_url: string | null }[];
}
export function creators(talukId = DEFAULT_TALUK) {
  return q().prepare("SELECT * FROM creator WHERE taluk_id = ? ORDER BY active DESC, name").all(talukId) as { id: string; name: string; handle: string | null; platform: string | null; permission_ref: string | null; permission_at: string | null; active: number }[];
}
export function consents() {
  return q().prepare("SELECT * FROM consent ORDER BY given_at DESC").all() as { id: string; kind: string; subject_name: string; given_by: string | null; relation: string | null; reference: string | null; given_at: string; story_id: string | null; creator_id: string | null; revoked_at: string | null }[];
}
export function archive() {
  return q().prepare("SELECT a.*, s.title, s.summary, s.layer, s.published_at FROM archive_item a JOIN story s ON s.id = a.story_id ORDER BY a.archived_at DESC").all() as { id: string; story_id: string; bucket: string | null; tags: string; places: string; people: string; era: string | null; anniversary_mmdd: string | null; rights_status: string; archived_at: string; title: string; summary: string | null; layer: string; published_at: string | null }[];
}
export function rateCards() {
  return q().prepare("SELECT * FROM rate_card ORDER BY CASE tier WHEN 'taluk' THEN 1 WHEN 'district' THEN 2 ELSE 3 END").all() as { id: string; tier: string; version: number; effective_from: string | null; note: string | null }[];
}
export function slots(rateCardId?: string): Slot[] {
  if (rateCardId) return q().prepare("SELECT * FROM rate_card_slot WHERE rate_card_id = ? ORDER BY sort").all(rateCardId) as Slot[];
  return q().prepare("SELECT * FROM rate_card_slot ORDER BY rate_card_id, sort").all() as Slot[];
}
export function advertisers(): Advertiser[] {
  return q().prepare("SELECT * FROM advertiser ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'free_month' THEN 1 WHEN 'prospect' THEN 2 WHEN 'lapsed' THEN 3 ELSE 4 END, business").all() as Advertiser[];
}
export function contracts(): (Contract & { business: string; slot_type: string })[] {
  return q().prepare("SELECT c.*, a.business, s.slot_type FROM contract c JOIN advertiser a ON a.id = c.advertiser_id JOIN rate_card_slot s ON s.id = c.slot_id ORDER BY c.start_date DESC").all() as (Contract & { business: string; slot_type: string })[];
}
export function invoices(): (Invoice & { business: string; paid_inr: number })[] {
  return q().prepare(`SELECT i.*, a.business, COALESCE((SELECT SUM(amount_inr) FROM payment p WHERE p.invoice_id = i.id),0) AS paid_inr
    FROM invoice i JOIN contract c ON c.id = i.contract_id JOIN advertiser a ON a.id = c.advertiser_id ORDER BY i.issued_at DESC`).all() as (Invoice & { business: string; paid_inr: number })[];
}
export function payments(): (Payment & { number: string; business: string })[] {
  return q().prepare(`SELECT p.*, i.number, a.business FROM payment p JOIN invoice i ON i.id = p.invoice_id JOIN contract c ON c.id = i.contract_id JOIN advertiser a ON a.id = c.advertiser_id ORDER BY p.received_at DESC`).all() as (Payment & { number: string; business: string })[];
}
export function decisions(): Decision[] {
  return q().prepare("SELECT * FROM decision ORDER BY status DESC, rowid").all() as Decision[];
}
export function unblockLog() {
  return q().prepare("SELECT * FROM unblock_log ORDER BY date DESC").all() as { id: string; date: string; what: string; who_helped: string | null; why_hired_editor_could_not: string | null; playbook_note: string | null }[];
}
export function escalations() {
  return q().prepare("SELECT e.*, s.title FROM escalation e LEFT JOIN story s ON s.id = e.story_id ORDER BY e.decided_at IS NOT NULL, e.raised_at DESC").all() as { id: string; story_id: string | null; kind: string; detail: string | null; raised_by: string | null; raised_at: string; decision: string | null; decided_by: string | null; decided_at: string | null; title: string | null }[];
}
export function equipmentChecks(talukId = DEFAULT_TALUK) {
  return q().prepare("SELECT * FROM equipment_check WHERE taluk_id = ? ORDER BY date DESC LIMIT 14").all(talukId) as { id: string; date: string; by_user: string | null; ok: number; fault: string | null }[];
}
export function audienceMonths(talukId = DEFAULT_TALUK) {
  return q().prepare("SELECT * FROM audience_month WHERE taluk_id = ? ORDER BY month, platform").all(talukId) as { id: string; month: string; platform: string; views: number; reach: number; watch_time_min: number; followers: number; age_split: string | null; gender_split: string | null }[];
}
export function budgetLines() {
  return q().prepare("SELECT * FROM budget_line ORDER BY sort").all() as { id: string; section: string; line: string; basis: string | null; lean_inr: number | null; five_inr: number | null; middle_inr: number | null }[];
}
export function auditTrail(limit = 50) {
  return q().prepare("SELECT * FROM audit ORDER BY id DESC LIMIT ?").all(limit) as { id: number; at: string; user_id: string | null; action: string; entity: string; entity_id: string | null; detail: string | null }[];
}

/** Daily delivery and turnaround metrics for the pilot (plan §13.5, §14). */
export function pilotMetrics(talukId = DEFAULT_TALUK) {
  const t = taluk(talukId);
  const start = t.launched_on ?? DEMO_DATE;
  const today = DEMO_DATE; // demo clock
  const elapsedDays = Math.max(1, Math.round((Date.parse(today) - Date.parse(start)) / 864e5) + 1);
  const publishingDaysRow = q().prepare("SELECT COUNT(DISTINCT date) AS c FROM story WHERE taluk_id = ? AND status = 'published'").get(talukId) as { c: number };
  // Demo: assume the unit published every day of September plus the demo days recorded.
  const publishingDays = Math.min(elapsedDays, 29 + publishingDaysRow.c);
  const pub = publishedStories(talukId);
  const tas = pub.map((s) => turnaroundHours(s.footage_in_at, s.published_at)).filter((x): x is number => x != null);
  const avg = tas.length ? Math.round((tas.reduce((a, b) => a + b, 0) / tas.length) * 10) / 10 : null;
  const sorted = [...tas].sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
  const paying = (q().prepare("SELECT COUNT(DISTINCT c.advertiser_id) AS c FROM contract c JOIN invoice i ON i.contract_id = c.id WHERE c.value_inr > 0 AND i.status = 'paid'").get() as { c: number }).c;
  const payingTwice = (q().prepare("SELECT COUNT(*) AS c FROM (SELECT c.advertiser_id FROM contract c JOIN invoice i ON i.contract_id = c.id WHERE i.status='paid' GROUP BY c.advertiser_id HAVING COUNT(*) >= 2)").get() as { c: number }).c;
  const billed = (q().prepare("SELECT COALESCE(SUM(amount_inr),0) AS s FROM invoice WHERE status != 'void'").get() as { s: number }).s;
  const collected = (q().prepare("SELECT COALESCE(SUM(amount_inr),0) AS s FROM payment").get() as { s: number }).s;
  const contracted = (q().prepare("SELECT COALESCE(SUM(value_inr),0) AS s FROM contract WHERE status = 'active'").get() as { s: number }).s;
  const free = (q().prepare("SELECT COUNT(*) AS c FROM contract WHERE free_month = 1").get() as { c: number }).c;
  return { start, today, elapsedDays, publishingDays, avgTurnaround: avg, medianTurnaround: median, paying, payingTwice, billed, collected, contracted, freeMonths: free, publishedCount: pub.length };
}
