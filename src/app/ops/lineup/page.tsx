import Link from "next/link";
import { allStories, advertisers, userMap } from "@/db/queries";
import { currentUser, roleOf } from "@/lib/session";
import { can } from "@/domain/permissions";
import { BUCKETS, LAYERS } from "@/domain/constants";
import { DEMO_DATE } from "@/db/seed";
import { fmtDate, fmtTime, hours } from "@/lib/format";
import { turnaroundHours } from "@/domain/rules";
import { Chip, LayerChip, PageHeader, Section, StatusChip } from "@/components/ui";
import { ActionForm, Check, Field } from "@/components/action-form";
import { createStory, setStoryStatus } from "../actions";

export default async function LineupPage() {
  const me = await currentUser();
  const role = roleOf(me);
  const stories = allStories();
  const names = userMap();
  const ads = advertisers().filter((a) => a.status !== "blocked");
  const byDate = new Map<string, typeof stories>();
  for (const s of stories) byDate.set(s.date, [...(byDate.get(s.date) ?? []), s]);

  return (
    <>
      <PageHeader title="Lineup & stories" sub="Every story carries a brief — angle, key line, clip order — before anyone leaves the office. Footage after cutoff rolls to tomorrow unless it is truly breaking." />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {[...byDate.entries()].map(([date, list]) => (
            <Section key={date} title={fmtDate(date)} sub={`${list.length} stories`}>
              <table className="data">
                <thead><tr><th>Slot</th><th>Story</th><th>Layer</th><th>Source</th><th>Status</th><th>In / TAT</th><th></th></tr></thead>
                <tbody>
                  {list.map((s) => (
                    <tr key={s.id}>
                      <td className="text-stone-500">{s.slot ?? "—"}</td>
                      <td>
                        <Link href={`/ops/story/${s.id}`} className="font-medium hover:underline">{s.title}</Link>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {s.bucket ? <Chip tone="saffron">{BUCKETS[s.bucket as keyof typeof BUCKETS]?.label ?? s.bucket}</Chip> : null}
                          {s.political ? <Chip tone="red">political</Chip> : null}
                          {s.paid ? <Chip tone="saffron">paid</Chip> : null}
                          {s.is_buffer ? <Chip>buffer</Chip> : null}
                        </div>
                      </td>
                      <td><LayerChip layer={s.layer} /></td>
                      <td className="text-xs">{s.source.replace("_", " ")}</td>
                      <td><StatusChip status={s.status} />{s.approved_by ? <div className="text-[11px] text-stone-500 mt-1">appr. {names[s.approved_by]}</div> : null}</td>
                      <td className="text-xs whitespace-nowrap">{fmtTime(s.footage_in_at)}<br />{hours(turnaroundHours(s.footage_in_at, s.published_at))}</td>
                      <td>
                        {can(role, "story.assign") && s.status === "idea" && (
                          <ActionForm action={setStoryStatus} submit="Assign" inline>
                            <input type="hidden" name="story_id" value={s.id} /><input type="hidden" name="status" value="assigned" />
                          </ActionForm>
                        )}
                        {can(role, "story.assign") && !["published", "killed"].includes(s.status) && s.status !== "idea" && (
                          <ActionForm action={setStoryStatus} submit="Kill" inline danger>
                            <input type="hidden" name="story_id" value={s.id} /><input type="hidden" name="status" value="killed" />
                          </ActionForm>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          ))}
        </div>
        <div>
          {can(role, "story.create") ? (
            <Section title="Add a story" sub="Brief first. Taluk Editor or content head.">
              <ActionForm action={createStory} submit="Add to lineup">
                <Field label="Date"><input name="date" type="date" defaultValue={DEMO_DATE} className="input" required /></Field>
                <Field label="Title"><input name="title" className="input" required /></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Layer">
                    <select name="layer" className="input">{Object.entries(LAYERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                  </Field>
                  <Field label="Bucket (identity)">
                    <select name="bucket" className="input"><option value="">—</option>{Object.entries(BUCKETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                  </Field>
                  <Field label="Source">
                    <select name="source" className="input">
                      <option value="taluk">Taluk unit</option><option value="state_retold">State story, retold</option><option value="district">District</option>
                      <option value="creator">Roster creator</option><option value="viewer">Viewer</option><option value="buffer">Buffer bank</option>
                    </select>
                  </Field>
                  <Field label="Slot">
                    <select name="slot" className="input"><option>Morning</option><option>Mid-day</option><option>Afternoon</option><option>Evening</option><option>Anytime</option></select>
                  </Field>
                </div>
                <Field label="Angle" hint="Not 'road is bad'. Who asked whom, when, what was promised."><textarea name="brief_angle" className="input" rows={2} /></Field>
                <Field label="Key line / who speaks"><input name="brief_key_line" className="input" /></Field>
                <Field label="Clip order"><input name="brief_clip_order" className="input" placeholder="1 wide → 2 bite → 3 detail" /></Field>
                <Field label="Summary (public page)"><textarea name="summary" className="input" rows={2} /></Field>
                <Check name="political" label="Political — needs content head approval" />
                <Check name="is_buffer" label="Buffer / evergreen piece" />
                <Check name="paid" label="Paid story (label 'Paid'; advertiser required)" />
                <Field label="Advertiser (if paid)">
                  <select name="advertiser_id" className="input"><option value="">—</option>{ads.map((a) => <option key={a.id} value={a.id}>{a.business}</option>)}</select>
                </Field>
              </ActionForm>
            </Section>
          ) : (
            <Section title="Add a story"><p className="text-sm text-stone-500">Your role ({role}) cannot create stories.</p></Section>
          )}
        </div>
      </div>
    </>
  );
}
