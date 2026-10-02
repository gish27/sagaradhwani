import Link from "next/link";
import { DEMO_DATE } from "@/db/seed";
import { storiesForDate, lineup, taluk, userMap, equipmentChecks, escalations, allAssets, pilotMetrics, taggedStories } from "@/db/queries";
import { currentUser, roleOf } from "@/lib/session";
import { can } from "@/domain/permissions";
import { fmtDate, fmtTime, hours, parseJson } from "@/lib/format";
import { turnaroundHours } from "@/domain/rules";
import { Chip, LayerChip, PageHeader, Section, Stat, StatusChip, Notice, Empty } from "@/components/ui";
import { ActionForm, Check, Field } from "@/components/action-form";
import { confirmLineup, logEquipment, publishStory, decideEscalation } from "./actions";

export default async function Today() {
  const me = await currentUser();
  const role = roleOf(me);
  const t = taluk();
  const date = DEMO_DATE;
  const stories = storiesForDate(date);
  const lu = lineup(date);
  const names = userMap();
  const eq = equipmentChecks();
  const esc = escalations().filter((e) => !e.decided_at);
  const pendingAmber = allAssets().filter((a) => a.clearance_status === "pending");
  const m = pilotMetrics();
  const published = stories.filter((s) => s.status === "published");
  const tagged = taggedStories().filter((x) => x.date === date);

  return (
    <>
      <PageHeader title={`Today · ${fmtDate(date)}`} sub={`${t.brand_name} daily pipeline. Lineup by 08:00 · footage cutoff ${t.cutoff_time} · publish by ${t.publish_time}. Every taluk publishes every day.`} />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <Stat label="Lineup" value={lu?.confirmed_at ? fmtTime(lu.confirmed_at) : "—"} hint={lu?.confirmed_at ? `by ${names[lu.confirmed_by ?? ""] ?? "—"}` : "not confirmed"} tone={lu?.confirmed_at ? "ok" : "bad"} />
        <Stat label="Published today" value={published.length} hint={`${stories.length} in lineup`} tone={published.length ? "ok" : "warn"} />
        <Stat label="Amber pending" value={pendingAmber.length} hint="blocks publish" tone={pendingAmber.length ? "warn" : "ok"} />
        <Stat label="Open escalations" value={esc.length} tone={esc.length ? "warn" : "ok"} />
        <Stat label="Pilot delivery" value={`${m.publishingDays}/${m.elapsedDays}`} hint="days published / elapsed" tone={m.publishingDays / m.elapsedDays >= 0.95 ? "ok" : "warn"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Section title="Today's lineup" sub="Slot order per the sample day in plan §4.6" right={<Link href="/ops/lineup" className="btn">Manage</Link>}>
            {stories.length === 0 ? <Empty>No stories. Confirm lineup or schedule a buffer piece.</Empty> : (
              <table className="data">
                <thead><tr><th>Slot</th><th>Story</th><th>Layer</th><th>Footage in</th><th>Status</th><th>TAT</th><th></th></tr></thead>
                <tbody>
                  {stories.map((s) => {
                    const assets = allAssets().filter((a) => a.story_id === s.id);
                    const blocked = assets.some((a) => a.tier === "amber" && a.clearance_status !== "cleared");
                    const canPub = can(role, "story.publish") && ["approved", "produced"].includes(s.status) && !blocked;
                    return (
                      <tr key={s.id}>
                        <td className="text-stone-500 whitespace-nowrap">{s.slot ?? "—"}</td>
                        <td>
                          <Link href={`/ops/story/${s.id}`} className="font-medium hover:underline">{s.title}</Link>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {s.political ? <Chip tone="red">political</Chip> : null}
                            {s.paid ? <Chip tone="saffron">paid</Chip> : null}
                            {s.is_buffer ? <Chip>buffer</Chip> : null}
                            {s.source === "state_retold" ? <Chip tone="blue">retold</Chip> : null}
                            {blocked ? <Chip tone="amber">amber pending</Chip> : null}
                          </div>
                        </td>
                        <td><LayerChip layer={s.layer} /></td>
                        <td className="whitespace-nowrap">{fmtTime(s.footage_in_at)}</td>
                        <td><StatusChip status={s.status} /></td>
                        <td>{hours(turnaroundHours(s.footage_in_at, s.published_at))}</td>
                        <td>
                          {s.status !== "published" && (
                            <ActionForm action={publishStory} submit="Publish" inline>
                              <input type="hidden" name="story_id" value={s.id} />
                              {canPub ? null : <span className="sr-only">not allowed</span>}
                            </ActionForm>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <p className="mt-3 text-xs text-stone-500">Publish is enforced server-side: production desk or founder only; amber footage must be cleared; red never attaches; AI visuals never in daily pulse.</p>
          </Section>

          <Section title="Tagged state & central stories for today" sub="Daily scriptwriter tags by relevance; the Sagara retelling uses only the facts, never the source script.">
            {tagged.length === 0 ? <Empty>Nothing tagged yet.</Empty> : (
              <ul className="grid gap-2 text-sm">
                {tagged.map((x) => (
                  <li key={x.id} className="flex gap-2 items-start">
                    <Chip tone={x.level === "state" ? "blue" : "violet"}>{x.level}</Chip>
                    <div>
                      <div className="font-medium">{x.title}</div>
                      <div className="text-xs text-stone-500">{x.summary} · tags: {parseJson<string[]>(x.tags, []).join(", ")}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div>
          <Section title="8 am lineup confirmation" sub="Taluk Editor confirms what is coming; if nothing, the desk schedules a buffer piece.">
            {lu?.confirmed_at ? <Notice tone="ok">Confirmed at {fmtTime(lu.confirmed_at)} by {names[lu.confirmed_by ?? ""]}{lu.nothing_coming ? " — nothing coming, buffer scheduled" : ""}.</Notice> : <Notice tone="warn">Not yet confirmed.</Notice>}
            {can(role, "lineup.confirm") && (
              <div className="mt-3">
                <ActionForm action={confirmLineup} submit={lu?.confirmed_at ? "Re-confirm" : "Confirm lineup"}>
                  <input type="hidden" name="date" value={date} />
                  <Check name="nothing_coming" label="Nothing coming today — use a buffer piece" />
                </ActionForm>
              </div>
            )}
          </Section>

          <Section title="Equipment check" sub="Weekly check; faults reported same day.">
            <ul className="text-sm grid gap-1 mb-3">
              {eq.slice(0, 5).map((e) => (
                <li key={e.id} className="flex justify-between gap-2">
                  <span>{fmtDate(e.date)} · {names[e.by_user ?? ""] ?? "—"}</span>
                  {e.ok ? <Chip tone="green">ok</Chip> : <Chip tone="red">{e.fault}</Chip>}
                </li>
              ))}
            </ul>
            {can(role, "equipment.check") && (
              <ActionForm action={logEquipment} submit="Log check" inline>
                <Check name="ok" label="All good" defaultChecked />
                <input name="fault" className="input" placeholder="Fault, if any" />
              </ActionForm>
            )}
          </Section>

          <Section title="Escalations" sub="Cutoff, political tone, sensitive footage → content head.">
            {esc.length === 0 ? <Empty>None open.</Empty> : esc.map((e) => (
              <div key={e.id} className="mb-3 text-sm">
                <div className="flex gap-2 items-center"><Chip tone="amber">{e.kind}</Chip><span className="font-medium">{e.title}</span></div>
                <div className="text-xs text-stone-600 mt-1">{e.detail} · raised by {names[e.raised_by ?? ""]} at {fmtTime(e.raised_at)}</div>
                {can(role, "script.approve") && (
                  <div className="mt-2">
                    <ActionForm action={decideEscalation} submit="Decide" inline>
                      <input type="hidden" name="escalation_id" value={e.id} />
                      <Field label="Decision"><input name="decision" className="input" required placeholder="e.g. Use party's own upload; straight tone" /></Field>
                    </ActionForm>
                  </div>
                )}
              </div>
            ))}
          </Section>
        </div>
      </div>
    </>
  );
}
