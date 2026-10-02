import { DEMO_DATE } from "@/db/seed";
import { budgetLines, rateCards, slots, storiesForDate, taluk } from "@/db/queries";
import { BUCKETS, LAYERS, REVENUE_AT_MATURITY, TALUK_UNIT_MONTHLY_COST_INR } from "@/domain/constants";
import { Deck, type DeckData } from "./deck";

export const dynamic = "force-dynamic";
export const metadata = { title: "Investor deck · Taluk Channel Network" };

export default function DeckPage() {
  const t = taluk();
  const day = storiesForDate(DEMO_DATE).filter((s) => !["idea", "killed"].includes(s.status)).map((s) => ({ slot: s.slot ?? "", title: s.title, layer: LAYERS[s.layer].label, status: s.status, paid: !!s.paid }));
  const lines = budgetLines();
  const total = (k: "lean_inr" | "five_inr" | "middle_inr") => lines.reduce((a, l) => a + (l[k] ?? 0), 0);
  const cards = rateCards().map((rc) => ({ tier: rc.tier, slots: slots(rc.id).filter((s) => s.price_inr != null).map((s) => ({ slot: s.slot_type, price: s.price_inr as number, sold_as: s.sold_as ?? "" })) }));
  const data: DeckData = {
    brand: t.brand_name, taluk: t.name, district: t.district, date: DEMO_DATE, publishTime: t.publish_time,
    day,
    buckets: Object.values(BUCKETS).map((b) => ({ label: b.label, examples: b.examples })),
    budget: { lean: total("lean_inr"), middle: total("middle_inr"), five: total("five_inr"), lines: lines.map((l) => ({ line: l.line, lean: l.lean_inr, middle: l.middle_inr, five: l.five_inr })) },
    unitCost: TALUK_UNIT_MONTHLY_COST_INR,
    revenue: REVENUE_AT_MATURITY.map((r) => ({ line: r.line, basis: r.basis, monthly: r.monthly })),
    rateCards: cards,
  };
  return <Deck data={data} />;
}
