import Link from "next/link";
import { allAssets, userMap } from "@/db/queries";
import { currentUser, roleOf } from "@/lib/session";
import { can } from "@/domain/permissions";
import { FOOTAGE_SOURCES, PERMISSION_CHECKLIST } from "@/domain/constants";
import { fmtDateTime, parseJson } from "@/lib/format";
import { Chip, PageHeader, Section, StatusChip, TierChip, LayerChip, Empty } from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { clearAsset } from "../actions";

export default async function ClearancePage() {
  const me = await currentUser();
  const role = roleOf(me);
  const assets = allAssets();
  const names = userMap();
  const pending = assets.filter((a) => a.clearance_status === "pending");
  const decided = assets.filter((a) => a.tier === "amber" && a.clearance_status !== "pending");
  const green = assets.filter((a) => a.tier === "green");

  return (
    <>
      <PageHeader title="Footage clearance" sub="Green: ours or properly permitted. Amber: usable only with care and central clearance. Red: never. Every amber item is a decision the content head takes before publish." />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Section title={`Amber — pending central clearance (${pending.length})`}>
            {pending.length === 0 ? <Empty>Nothing pending.</Empty> : pending.map((a) => {
              const ck = parseJson<Record<string, boolean>>(a.checklist, {});
              return (
                <div key={a.id} className="mb-4 rounded border border-amber-200 bg-amber-50/40 p-3 text-sm">
                  <div className="flex flex-wrap gap-2 items-center"><TierChip tier={a.tier} /><span className="font-medium">{a.description}</span><LayerChip layer={a.story_layer} /></div>
                  <div className="text-xs text-stone-600 mt-1">Story: <Link href={`/ops/story/${a.story_id}`} className="underline">{a.story_title}</Link> · {a.source_type.replace(/_/g, " ")} · {a.source_name} · {a.duration_s}s</div>
                  <ul className="mt-2 grid sm:grid-cols-2 gap-x-4 text-xs">
                    {PERMISSION_CHECKLIST.map((c) => <li key={c.key} className={ck[c.key] ? "text-green-700" : "text-red-700"}>{ck[c.key] ? "✓" : "✗"} {c.q}</li>)}
                  </ul>
                  {a.clearance_note && <div className="text-xs mt-2 italic">{a.clearance_note}</div>}
                  {can(role, "asset.clear") ? (
                    <div className="mt-3 grid sm:grid-cols-2 gap-2">
                      <ActionForm action={clearAsset} submit="Clear" inline><input type="hidden" name="asset_id" value={a.id} /><input type="hidden" name="decision" value="cleared" /><input name="note" className="input" placeholder="Condition (credit on screen…)" /></ActionForm>
                      <ActionForm action={clearAsset} submit="Reject" inline danger><input type="hidden" name="asset_id" value={a.id} /><input type="hidden" name="decision" value="rejected" /><input name="note" className="input" placeholder="Why" /></ActionForm>
                    </div>
                  ) : <p className="mt-2 text-xs text-stone-500">Only the content head or founder clears amber footage.</p>}
                </div>
              );
            })}
          </Section>
          <Section title={`Amber — decided (${decided.length})`}>
            {decided.length === 0 ? <Empty>None.</Empty> : (
              <table className="data"><thead><tr><th>Asset</th><th>Story</th><th>Decision</th><th>By</th><th>Note</th></tr></thead>
                <tbody>{decided.map((a) => <tr key={a.id}><td>{a.description}</td><td><Link href={`/ops/story/${a.story_id}`} className="hover:underline">{a.story_title}</Link></td><td><StatusChip status={a.clearance_status} /></td><td className="text-xs">{names[a.cleared_by ?? ""]} · {fmtDateTime(a.cleared_at)}</td><td className="text-xs">{a.clearance_note}</td></tr>)}</tbody></table>
            )}
          </Section>
          <Section title={`Green assets (${green.length})`}>
            <table className="data"><thead><tr><th>Asset</th><th>Story</th><th>Source</th><th>Flags</th></tr></thead>
              <tbody>{green.map((a) => <tr key={a.id}><td>{a.description}</td><td><Link href={`/ops/story/${a.story_id}`} className="hover:underline">{a.story_title}</Link></td><td className="text-xs">{a.source_type.replace(/_/g, " ")}{a.source_name ? ` · ${a.source_name}` : ""}</td><td className="flex gap-1 flex-wrap">{a.ai_generated ? <Chip tone="violet">AI</Chip> : null}{a.credit_on_screen ? <Chip>credit</Chip> : null}{a.permission_ref ? <Chip tone="green">permission {a.permission_ref}</Chip> : null}</td></tr>)}</tbody></table>
          </Section>
        </div>
        <div>
          <Section title="The footage rules" sub="Plan §6.1–6.2. Encoded in the attach form.">
            {(["green", "amber", "red"] as const).map((tier) => (
              <div key={tier} className="mb-3">
                <div className="mb-1"><TierChip tier={tier} /></div>
                <ul className="text-xs grid gap-1">{FOOTAGE_SOURCES.filter((f) => f.tier === tier).map((f) => <li key={f.key}><span className="font-medium">{f.label}</span> — <span className="text-stone-600">{f.rule}</span></li>)}</ul>
              </div>
            ))}
            <p className="text-xs text-stone-500 mt-2">If it is not ours and the source is not clear, we do not use it. The two-part rule: never take another channel&apos;s report; never take entertainment content.</p>
          </Section>
        </div>
      </div>
    </>
  );
}
