import { advertisers, contracts, invoices, payments, slots, rateCards, pilotMetrics } from "@/db/queries";
import { currentUser, roleOf } from "@/lib/session";
import { can } from "@/domain/permissions";
import { ADVERTISER_CATEGORIES, PROHIBITED_CATEGORIES } from "@/domain/constants";
import { fmtDate, inr } from "@/lib/format";
import { Chip, PageHeader, Section, Stat, StatusChip } from "@/components/ui";
import { ActionForm, Check, Field } from "@/components/action-form";
import { createContract, recordPayment, upsertAdvertiser } from "../actions";

export default async function SalesPage() {
  const me = await currentUser();
  const role = roleOf(me);
  const ads = advertisers();
  const cts = contracts();
  const invs = invoices();
  const pays = payments();
  const talukSlots = slots(rateCards().find((r) => r.tier === "taluk")!.id);
  const m = pilotMetrics();
  const open = invs.filter((i) => i.status !== "paid" && i.status !== "void");

  return (
    <>
      <PageHeader title="Advertisers & contracts" sub="Sold centrally on a fixed rate card. Minimum one month. No discounting — the only concession is a free first month. Invoice and bank every rupee; cash is never accepted." />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <Stat label="Paying advertisers" value={m.paying} hint="paid at least one invoice" tone={m.paying >= 10 ? "ok" : "warn"} />
        <Stat label="Contracted" value={inr(m.contracted)} hint="active contracts" />
        <Stat label="Billed" value={inr(m.billed)} hint="ex GST" />
        <Stat label="Collected" value={inr(m.collected)} hint="incl. GST, bank only" tone="ok" />
        <Stat label="Free months" value={m.freeMonths} hint="first-month concessions" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Section title={`Advertisers (${ads.length})`} sub="Every advertiser passes the prohibited-category filter. 'Against nation or culture' decisions are made centrally only.">
            <table className="data"><thead><tr><th>Business</th><th>Category</th><th>Status</th><th>Screen</th><th>Likely ticket</th></tr></thead>
              <tbody>{ads.map((a) => <tr key={a.id}><td className="font-medium">{a.business}</td><td className="text-xs">{a.category}</td><td><StatusChip status={a.status} /></td><td>{a.prohibited_check === "pass" ? <Chip tone="green">pass</Chip> : <Chip tone="red">prohibited</Chip>}</td><td>{inr(a.likely_ticket_inr)}/mo</td></tr>)}</tbody></table>
          </Section>

          <Section title={`Contracts (${cts.length})`}>
            <table className="data"><thead><tr><th>Advertiser</th><th>Slot</th><th>Months</th><th>Start</th><th>Value</th><th>Flags</th></tr></thead>
              <tbody>{cts.map((c) => <tr key={c.id}><td>{c.business}</td><td className="text-xs">{c.slot_type}</td><td>{c.months}</td><td className="text-xs">{fmtDate(c.start_date)}</td><td>{c.free_month ? <Chip tone="blue">free month</Chip> : inr(c.value_inr)}</td><td className="flex gap-1">{c.category_exclusive ? <Chip>exclusive</Chip> : null}{c.political ? <Chip tone="red">political · {c.mcmc_cert_ref}</Chip> : null}</td></tr>)}</tbody></table>
          </Section>

          <Section title={`Invoices (${invs.length}) & payments (${pays.length})`} sub="Payment terms: 7 days from issue. Methods: bank transfer, UPI, cheque.">
            <table className="data"><thead><tr><th>Invoice</th><th>Advertiser</th><th>Issued / due</th><th>Amount + GST</th><th>Paid</th><th>Status</th></tr></thead>
              <tbody>{invs.map((i) => <tr key={i.id}><td className="font-mono text-xs">{i.number}</td><td>{i.business}</td><td className="text-xs">{fmtDate(i.issued_at)} / {fmtDate(i.due_at)}</td><td>{inr(i.amount_inr)} + {inr(i.gst_inr)}</td><td>{inr(i.paid_inr)}</td><td><StatusChip status={i.status} /></td></tr>)}</tbody></table>
            <div className="mt-3 text-xs text-stone-600">
              {pays.map((p) => <div key={p.id}>{fmtDate(p.received_at)} · {p.business} · {inr(p.amount_inr)} · {p.method.replace("_", " ")} · {p.bank_ref}</div>)}
            </div>
          </Section>
        </div>

        <div>
          {can(role, "sales.manage") && (
            <>
              <Section title="New advertiser" sub="Prohibited-category check happens here.">
                <ActionForm action={upsertAdvertiser} submit="Add advertiser">
                  <Field label="Business"><input name="business" className="input" required /></Field>
                  <Field label="Category"><select name="category" className="input">{ADVERTISER_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Contact"><input name="contact" className="input" /></Field>
                    <Field label="Phone"><input name="phone" className="input" /></Field>
                    <Field label="GSTIN"><input name="gstin" className="input" /></Field>
                    <Field label="Likely ticket ₹/mo"><input name="likely_ticket_inr" type="number" className="input" defaultValue={3000} /></Field>
                  </div>
                  <div className="text-xs font-medium text-stone-600">Does the business fall in any prohibited category?</div>
                  {PROHIBITED_CATEGORIES.map((p, i) => <Check key={p.category} name={`pro_${i}`} label={p.category + (p.central_only ? " (central decision only)" : "")} />)}
                </ActionForm>
              </Section>
              <Section title="New contract" sub="Value = rate card price × months. Free month = ₹0. Invoice auto-issued.">
                <ActionForm action={createContract} submit="Create contract & invoice">
                  <Field label="Advertiser"><select name="advertiser_id" className="input">{ads.filter((a) => a.status !== "blocked").map((a) => <option key={a.id} value={a.id}>{a.business}</option>)}</select></Field>
                  <Field label="Slot (taluk rate card)"><select name="slot_id" className="input">{talukSlots.map((s) => <option key={s.id} value={s.id}>{s.slot_type} — {s.price_inr == null ? "price not set" : inr(s.price_inr)}</option>)}</select></Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Months (min 1)"><input name="months" type="number" min={1} defaultValue={1} className="input" /></Field>
                    <Field label="Start"><input name="start_date" type="date" defaultValue="2026-10-01" className="input" /></Field>
                  </div>
                  <Check name="free_month" label="Free first month (the only concession allowed)" />
                  <details><summary className="text-xs cursor-pointer">Political (election period, central only)</summary>
                    <div className="grid gap-2 mt-2">
                      <Field label="MCMC certificate ref"><input name="mcmc_cert_ref" className="input" /></Field>
                      <Field label="Paid for by"><input name="paid_for_by" className="input" /></Field>
                    </div>
                  </details>
                </ActionForm>
              </Section>
            </>
          )}
          {can(role, "payment.record") && (
            <Section title="Record payment" sub="Bank, UPI or cheque. Never cash.">
              <ActionForm action={recordPayment} submit="Record">
                <Field label="Invoice"><select name="invoice_id" className="input">{open.map((i) => <option key={i.id} value={i.id}>{i.number} · {i.business} · {inr(i.amount_inr + i.gst_inr)}</option>)}</select></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Amount (incl. GST)"><input name="amount_inr" type="number" className="input" required /></Field>
                  <Field label="Method"><select name="method" className="input"><option value="bank_transfer">Bank transfer</option><option value="upi">UPI</option><option value="cheque">Cheque</option><option value="cash">Cash (will be rejected)</option></select></Field>
                </div>
                <Field label="Bank reference"><input name="bank_ref" className="input" /></Field>
              </ActionForm>
            </Section>
          )}
          {!can(role, "sales.manage") && !can(role, "payment.record") && <Section title="Sales"><p className="text-sm text-stone-500">Sales and collections are owned by the sales owner. Taluk staff may introduce advertisers; they do not quote or collect.</p></Section>}
        </div>
      </div>
    </>
  );
}
