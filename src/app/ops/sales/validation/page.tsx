import { advertisers } from "@/db/queries";
import { REVENUE_AT_MATURITY, TALUK_UNIT_MONTHLY_COST_INR } from "@/domain/constants";
import { inr } from "@/lib/format";
import { Notice, PageHeader, Section, Stat, StatusChip } from "@/components/ui";

export default function ValidationPage() {
  const ads = advertisers().filter((a) => a.status !== "blocked");
  const target = 25;
  const ticket = 3000;
  const committed = ads.filter((a) => a.status === "active" || a.status === "free_month");
  const likely = ads.reduce((sum, a) => sum + (a.likely_ticket_inr ?? 0), 0);
  const atTicket = ads.filter((a) => (a.likely_ticket_inr ?? 0) >= ticket).length;
  const revenueMaturity = REVENUE_AT_MATURITY.reduce((s, r) => s + r.monthly, 0);

  return (
    <>
      <PageHeader title="25 × ₹3,000 validation worksheet" sub="Plan §14.2: the revenue slide rests on 25 local advertisers paying ₹3,000 a month. Validate against real Sagara shops before the meeting. This sheet tracks how many are identified, how many would pay at the ticket, and how many have actually committed." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat label="Identified" value={`${ads.length}/${target}`} tone={ads.length >= target ? "ok" : "warn"} />
        <Stat label="At ≥ ₹3,000 ticket" value={`${atTicket}/${target}`} tone={atTicket >= target ? "ok" : "warn"} />
        <Stat label="Committed (active or free month)" value={committed.length} hint="first signings" tone={committed.length >= 10 ? "ok" : "warn"} />
        <Stat label="Sum of likely tickets" value={inr(likely)} hint={`vs ₹75,000 assumed`} tone={likely >= 75000 ? "ok" : "warn"} />
      </div>
      <div className="mb-5"><Notice tone={atTicket >= target ? "ok" : "warn"}>{atTicket >= target ? "Assumption holds on paper — now convert." : `${target - atTicket} more businesses at ≥ ₹3,000 needed to back the revenue slide. The month-3 target is ten paying.`}</Notice></div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Section title="Worksheet">
            <table className="data"><thead><tr><th>#</th><th>Business</th><th>Category</th><th>Likely ₹/mo</th><th>Status</th></tr></thead>
              <tbody>{ads.map((a, i) => <tr key={a.id}><td className="text-stone-400">{i + 1}</td><td>{a.business}</td><td className="text-xs">{a.category}</td><td className={(a.likely_ticket_inr ?? 0) >= ticket ? "text-green-700" : "text-amber-700"}>{inr(a.likely_ticket_inr)}</td><td><StatusChip status={a.status} /></td></tr>)}</tbody></table>
          </Section>
        </div>
        <div>
          <Section title="Revenue at maturity (per taluk)" sub="Plan §14.4 — working assumptions.">
            <table className="data"><tbody>{REVENUE_AT_MATURITY.map((r) => <tr key={r.line}><td>{r.line}<div className="text-xs text-stone-500">{r.basis}</div></td><td className="text-right">{inr(r.monthly)}</td></tr>)}
              <tr className="font-semibold"><td>Total / month</td><td className="text-right">{inr(revenueMaturity)}</td></tr>
              <tr><td>Taluk unit cost / month</td><td className="text-right">{inr(TALUK_UNIT_MONTHLY_COST_INR)}</td></tr>
              <tr className="font-semibold text-green-700"><td>Taluk surplus / month</td><td className="text-right">{inr(revenueMaturity - TALUK_UNIT_MONTHLY_COST_INR)}</td></tr>
            </tbody></table>
            <p className="text-xs text-stone-500 mt-2">The central engine costs more than one taluk&apos;s surplus; it is shared as taluks are added (§14.3). See Analytics for break-even by taluk count.</p>
          </Section>
        </div>
      </div>
    </>
  );
}
