import { audienceMonths, pilotMetrics, publishedStories, taluk } from "@/db/queries";
import { turnaroundHours } from "@/domain/rules";
import { currentUser, roleOf } from "@/lib/session";
import { can } from "@/domain/permissions";

export const dynamic = "force-dynamic";

function csv(rows: (string | number | null)[][]) {
  return rows.map((r) => r.map((v) => (v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replaceAll('"', '""')}"` : String(v))).join(",")).join("\n");
}

export async function GET() {
  const u = await currentUser();
  if (!can(roleOf(u), "export.csv")) return new Response("Your role cannot export.", { status: 403 });
  const t = taluk();
  const m = pilotMetrics(t.id);
  const rows: (string | number | null)[][] = [
    ["section", "key", "value", "extra"],
    ["pilot", "start", m.start, null], ["pilot", "demo_date", m.today, null], ["pilot", "elapsed_days", m.elapsedDays, null], ["pilot", "publishing_days", m.publishingDays, null],
    ["pilot", "avg_turnaround_h", m.avgTurnaround, null], ["pilot", "median_turnaround_h", m.medianTurnaround, null],
    ["money", "paying_advertisers", m.paying, null], ["money", "paid_twice", m.payingTwice, null], ["money", "billed_inr", m.billed, null], ["money", "collected_inr", m.collected, null], ["money", "contracted_inr", m.contracted, null], ["money", "free_months", m.freeMonths, null],
    [],
    ["audience", "month", "platform", "views|reach|watch_min|followers"],
    ...audienceMonths(t.id).map((a) => ["audience", a.month, a.platform, `${a.views}|${a.reach}|${a.watch_time_min}|${a.followers}`]),
    [],
    ["story", "id", "title", "layer|slot|paid|footage_in|published|turnaround_h"],
    ...publishedStories(t.id).map((s) => ["story", s.id, s.title, `${s.layer}|${s.slot ?? ""}|${s.paid}|${s.footage_in_at ?? ""}|${s.published_at ?? ""}|${turnaroundHours(s.footage_in_at, s.published_at) ?? ""}`]),
  ];
  return new Response("\uFEFF" + csv(rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="sagara-dhwani-analytics-${m.today}.csv"` },
  });
}
