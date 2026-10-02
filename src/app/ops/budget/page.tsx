import Link from "next/link";
import { budgetLines } from "@/db/queries";
import { REVENUE_AT_MATURITY, TALUK_UNIT_MONTHLY_COST_INR } from "@/domain/constants";
import { inr } from "@/lib/format";
import { Notice, PageHeader, Section, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

const REV = REVENUE_AT_MATURITY.reduce((a, r) => a + r.monthly, 0);

const COLS = [
  { key: "lean_inr", label: "A · Lean", note: "One central editor-producer" },
  { key: "middle_inr", label: "C · Middle path", note: "Founder as content head; roles added on trigger" },
  { key: "five_inr", label: "B · Five-person team", note: "Full state hub from day one" },
] as const;

export default function BudgetPage() {
  const lines = budgetLines();
  const total = (k: (typeof COLS)[number]["key"]) => lines.reduce((a, l) => a + (l[k] ?? 0), 0);
  const sections = Array.from(new Set(lines.map((l) => l.section)));

  return (
    <>
      <PageHeader title="Six-month pilot budget" sub="Plan §14 — working assumptions, not researched market rates. Three versions exist because two different conversations produced two numbers; the recommendation is to carry one figure into the meeting with the other two as bounds.">
        <Link href="/deck" className="btn">Open investor deck</Link>
      </PageHeader>

      <div className="grid md:grid-cols-3 gap-3 mb-5">
        {COLS.map((c) => <Stat key={c.key} label={c.label} value={inr(total(c.key))} hint={c.note} tone={c.key === "middle_inr" ? "ok" : undefined} />)}
      </div>

      <Notice tone="warn">Every salary line must be checked against what people in Sagara will actually accept before the investor meeting. Founder salary and AI rates are budgeted openly at nominal, below-market levels — costing them at zero hides the true unit cost and breaks the economics at scale.</Notice>

      <Section title="Line items">
        <table className="data"><thead><tr><th>Section</th><th>Line</th><th>Basis</th>{COLS.map((c) => <th key={c.key} className="text-right">{c.label}</th>)}</tr></thead><tbody>
          {sections.map((sec) => lines.filter((l) => l.section === sec).map((l, i) => (
            <tr key={l.id}><td className="text-xs text-stone-500 whitespace-nowrap">{i === 0 ? sec : ""}</td><td className="font-medium">{l.line}</td><td className="text-xs text-stone-600">{l.basis}</td>{COLS.map((c) => <td key={c.key} className="text-right tabular-nums">{l[c.key] == null ? "—" : inr(l[c.key] as number)}</td>)}</tr>
          )))}
          <tr className="font-semibold bg-stone-50"><td></td><td>Total six-month pilot</td><td></td>{COLS.map((c) => <td key={c.key} className="text-right tabular-nums">{inr(total(c.key))}</td>)}</tr>
        </tbody></table>
      </Section>

      <div className="grid md:grid-cols-2 gap-4">
        <Section title="Unit economics at maturity" sub="Per taluk, per month, once the 10-advertiser mark is reached.">
          <table className="data"><tbody>
            <tr><td>Taluk unit cost (editor, operator, running)</td><td className="text-right">{inr(TALUK_UNIT_MONTHLY_COST_INR)}</td></tr>
            <tr><td>Revenue at maturity (25 advertisers, events, AI ads, classifieds)</td><td className="text-right">{inr(REV)}</td></tr>
            <tr className="font-semibold"><td>Margin per taluk, before central cost</td><td className="text-right">{inr(REV - TALUK_UNIT_MONTHLY_COST_INR)}</td></tr>
          </tbody></table>
          <p className="text-xs text-stone-500 mt-2">Break-even by taluk count is on <Link className="underline" href="/ops/analytics">Analytics</Link>: A at 1, C at 2, B at 3 taluks.</p>
        </Section>
        <Section title="Triggers for adding roles" sub="Plan §7.1 — roles are added when volume demands, not on a calendar.">
          <ul className="text-sm list-disc pl-5 space-y-1 text-stone-700">
            <li>Second video editor only when daily volume actually overloads the first.</li>
            <li>Separate rewriter when the daily scriptwriter misses the 14:00 cutoff twice in a week because of rewriting load.</li>
            <li>Full-time AI visuals when identity output is three or more pieces a week across taluks.</li>
            <li>Dedicated content head when the founder&apos;s unblock log shows editorial calls are the bottleneck, or at the second taluk.</li>
          </ul>
        </Section>
      </div>
    </>
  );
}
