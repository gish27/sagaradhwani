import { audienceMonths, budgetLines, pilotMetrics, publishedStories, taluk } from "@/db/queries";
import { month3Verdict, turnaroundHours } from "@/domain/rules";
import { REVENUE_AT_MATURITY, TALUK_UNIT_MONTHLY_COST_INR } from "@/domain/constants";
import { inr, monthLabel } from "@/lib/format";
import { Chip, Notice, PageHeader, Section, Stat } from "@/components/ui";
import { AudienceChart, BreakEvenChart, TurnaroundChart } from "@/components/charts";

export const dynamic = "force-dynamic";

const REV = REVENUE_AT_MATURITY.reduce((a, r) => a + r.monthly, 0);

export default function AnalyticsPage() {
  const t = taluk();
  const m = pilotMetrics(t.id);
  const verdict = month3Verdict({ publishingDays: m.publishingDays, elapsedDays: m.elapsedDays, payingAdvertisers: m.paying, payingAdvertisersPaidTwice: m.payingTwice, avgTurnaroundHours: m.avgTurnaround, medianTurnaroundHours: m.medianTurnaround });
  const months = audienceMonths(t.id);
  const latestMonth = months[0]?.month;
  const audience = months.filter((a) => a.month === latestMonth).map((a) => ({ platform: a.platform, views: a.views, reach: a.reach, followers: a.followers }));

  const ta = publishedStories(t.id).map((s) => ({ title: s.title.length > 36 ? s.title.slice(0, 34) + "…" : s.title, hours: turnaroundHours(s.footage_in_at, s.published_at) })).filter((x): x is { title: string; hours: number } => x.hours != null);

  // Break-even: central monthly cost per budget variant vs. per-taluk margin at maturity.
  const lines = budgetLines();
  const central = (k: "lean_inr" | "five_inr" | "middle_inr") => lines.filter((l) => l.line === "Central production" || l.line === "Founder salary (nominal)" || l.line === "Hosting, platform, software").reduce((a, l) => a + (l[k] ?? 0), 0) / 6;
  const margin = REV - TALUK_UNIT_MONTHLY_COST_INR;
  const be = Array.from({ length: 6 }, (_, i) => i + 1).map((n) => ({ taluks: n, lean: n * margin - central("lean_inr"), five: n * margin - central("five_inr"), middle: n * margin - central("middle_inr") }));
  const breakEven = (k: "lean" | "five" | "middle") => be.find((r) => r[k] >= 0)?.taluks ?? ">6";

  return (
    <>
      <PageHeader title="Analytics & checkpoints" sub="Weekly review in week 2 and month-3 checkpoint, straight from the operating record. Audience figures are entered monthly per platform." ><a className="btn" href="/api/export/analytics.csv">Export CSV</a></PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat label="Pilot day" value={`${m.elapsedDays}`}  hint={`since ${m.start}`} />
        <Stat label="Delivery record" value={`${m.publishingDays}/${m.elapsedDays}`} hint="days with a published day" />
        <Stat label="Avg turnaround" value={m.avgTurnaround == null ? "—" : `${m.avgTurnaround}h`} hint={`median ${m.medianTurnaround ?? "—"}h · target <48h`} />
        <Stat label="Paying advertisers" value={String(m.paying)} hint={`${m.payingTwice} paid twice · target 10`} />
        <Stat label="Collected" value={inr(m.collected)} hint={`billed ${inr(m.billed)}`} />
      </div>

      <Section title="Month-3 checkpoint" sub="The four tests from plan §14. Verdict: continue / fix and continue / stop and rethink.">
        <Notice tone={verdict.verdict === "continue" ? "ok" : verdict.verdict === "fix_and_continue" ? "warn" : "error"}>
          <b>{verdict.verdict.replaceAll("_", " ")}</b> — {verdict.passed} of {verdict.checks.length} checks passing on the demo clock ({m.today}).
        </Notice>
        <table className="data mt-3"><thead><tr><th>Check</th><th>Value</th><th>Status</th></tr></thead><tbody>
          {verdict.checks.map((c) => <tr key={c.label}><td>{c.label}</td><td>{c.value}</td><td><Chip tone={c.ok ? "green" : "red"}>{c.ok ? "pass" : "fail"}</Chip></td></tr>)}
        </tbody></table>
      </Section>

      <div className="grid lg:grid-cols-2 gap-4">
        <Section title={`Audience · ${latestMonth ? monthLabel(latestMonth) : "no data"}`} sub="Views, reach and followers per platform; entered by the production desk at month end.">
          {audience.length ? <AudienceChart data={audience} /> : <p className="text-sm text-stone-500">No audience data yet.</p>}
        </Section>
        <Section title="Turnaround per published story" sub="Footage in → published. Breaking news target 24h, everything else under 48h.">
          {ta.length ? <TurnaroundChart data={ta} /> : <p className="text-sm text-stone-500">No published stories with footage timestamps.</p>}
        </Section>
      </div>

      <Section title="Break-even by number of taluks" sub={`Each taluk at maturity: ${inr(REV)}/mo revenue − ${inr(TALUK_UNIT_MONTHLY_COST_INR)}/mo unit cost = ${inr(margin)} margin against central monthly cost.`}>
        <BreakEvenChart data={be} />
        <div className="grid grid-cols-3 gap-3 mt-3">
          <Stat label="A · Lean breaks even at" value={`${breakEven("lean")} taluk`} hint={`central ${inr(central("lean_inr"))}/mo`} />
          <Stat label="C · Middle path breaks even at" value={`${breakEven("middle")} taluks`} hint={`central ${inr(central("middle_inr"))}/mo`} />
          <Stat label="B · Five-person breaks even at" value={`${breakEven("five")} taluks`} hint={`central ${inr(central("five_inr"))}/mo`} />
        </div>
      </Section>

      <Section title="Monthly audience log">
        <table className="data"><thead><tr><th>Month</th><th>Platform</th><th className="text-right">Views</th><th className="text-right">Reach</th><th className="text-right">Followers</th><th className="text-right">Watch min</th></tr></thead><tbody>
          {months.map((a) => <tr key={a.id}><td>{monthLabel(a.month)}</td><td>{a.platform}</td><td className="text-right">{a.views.toLocaleString("en-IN")}</td><td className="text-right">{a.reach.toLocaleString("en-IN")}</td><td className="text-right">{a.followers.toLocaleString("en-IN")}</td><td className="text-right">{a.watch_time_min.toLocaleString("en-IN")}</td></tr>)}
        </tbody></table>
      </Section>
    </>
  );
}
