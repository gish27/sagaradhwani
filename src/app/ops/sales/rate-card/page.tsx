import { rateCards, slots } from "@/db/queries";
import { currentUser, roleOf } from "@/lib/session";
import { can } from "@/domain/permissions";
import { inr } from "@/lib/format";
import { Chip, Notice, PageHeader, Section } from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { setSlotPrice } from "../../actions";

export default async function RateCardPage() {
  const me = await currentUser();
  const role = roleOf(me);
  const cards = rateCards();
  return (
    <>
      <PageHeader title="Rate card" sub="Structure is fixed now; rupee values are set only after pilot audience numbers (plan §11.3). Taluk staff do not discount. Value lives in the fixed card and in how many taluks we can offer in one sale." />
      <div className="mb-4"><Notice tone="info">Unfair advantage: the only seller able to offer taluk, district and state inventory from one desk. Same structure across all three tiers.</Notice></div>
      {cards.map((rc) => {
        const rows = slots(rc.id);
        return (
          <Section key={rc.id} title={`${rc.tier[0].toUpperCase()}${rc.tier.slice(1)} rate card · v${rc.version}`} sub={rc.note ?? undefined}>
            <table className="data"><thead><tr><th>Slot type</th><th>Format</th><th>Sold as</th><th>Flags</th><th>Price (₹/unit)</th>{can(role, "ratecard.edit") && <th></th>}</tr></thead>
              <tbody>{rows.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.slot_type}</td><td className="text-xs">{s.format}</td><td className="text-xs">{s.sold_as}</td>
                  <td className="flex gap-1">{s.category_exclusive ? <Chip>category-exclusive</Chip> : null}{s.political ? <Chip tone="red">central only</Chip> : null}</td>
                  <td>{s.price_inr == null ? <span className="text-stone-400">not set</span> : inr(s.price_inr)}</td>
                  {can(role, "ratecard.edit") && <td><ActionForm action={setSlotPrice} submit="Set" inline><input type="hidden" name="slot_id" value={s.id} /><input name="price_inr" type="number" className="input w-28" defaultValue={s.price_inr ?? ""} placeholder="₹" /></ActionForm></td>}
                </tr>
              ))}</tbody></table>
          </Section>
        );
      })}
    </>
  );
}
