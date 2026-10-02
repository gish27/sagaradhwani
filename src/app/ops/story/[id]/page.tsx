import Link from "next/link";
import { notFound } from "next/navigation";
import { story, capturesFor, scriptsFor, assetsFor, userMap, advertisers } from "@/db/queries";
import { currentUser, roleOf } from "@/lib/session";
import { can } from "@/domain/permissions";
import { BUCKETS, FOOTAGE_SOURCES, PERMISSION_CHECKLIST } from "@/domain/constants";
import { fmtDateTime, fmtTime, hours, parseJson } from "@/lib/format";
import { turnaroundHours } from "@/domain/rules";
import { Chip, LayerChip, Notice, PageHeader, Section, StatusChip, TierChip, Empty } from "@/components/ui";
import { ActionForm, Check, Field } from "@/components/action-form";
import { attachAsset, logCapture, publishStory, saveScript, approveScript, markVoiceDone, setStoryStatus, clearAsset } from "../../actions";

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = story(id);
  if (!s) notFound();
  const me = await currentUser();
  const role = roleOf(me);
  const names = userMap();
  const caps = capturesFor(id);
  const scripts = scriptsFor(id);
  const assets = assetsFor(id);
  const amberPending = assets.filter((a) => a.tier === "amber" && a.clearance_status !== "cleared");
  const ad = s.advertiser_id ? advertisers().find((a) => a.id === s.advertiser_id) : null;
  const urls = parseJson<string[]>(s.platform_urls, []);

  return (
    <>
      <div className="text-xs text-stone-500 mb-2"><Link href="/ops/lineup" className="hover:underline">Lineup</Link> / {s.date}</div>
      <PageHeader title={s.title} sub={s.summary ?? undefined}>
        <StatusChip status={s.status} />
      </PageHeader>

      <div className="flex flex-wrap gap-2 mb-4">
        <LayerChip layer={s.layer} />
        {s.bucket ? <Chip tone="saffron">{BUCKETS[s.bucket as keyof typeof BUCKETS]?.label}</Chip> : null}
        <Chip>{s.source.replace("_", " ")}</Chip>
        <Chip>{s.slot ?? "no slot"}</Chip>
        {s.political ? <Chip tone="red">political — content head approves</Chip> : null}
        {s.paid ? <Chip tone="saffron">Paid · {ad?.business ?? "advertiser missing"}</Chip> : null}
        {s.is_buffer ? <Chip>buffer</Chip> : null}
      </div>

      {s.status === "rolled" && <div className="mb-4"><Notice tone="warn">Footage came in at {fmtTime(s.footage_in_at)}, after the {fmtTime(s.cutoff_at)} cutoff, and was not breaking. Rolled to the next day.</Notice></div>}
      {amberPending.length > 0 && <div className="mb-4"><Notice tone="warn">{amberPending.length} amber asset(s) awaiting central clearance. Publish is blocked.</Notice></div>}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Section title="Brief" sub="Set before anyone leaves the office.">
            <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
              <dt className="text-stone-500">Angle</dt><dd>{s.brief_angle ?? "—"}</dd>
              <dt className="text-stone-500">Key line</dt><dd>{s.brief_key_line ?? "—"}</dd>
              <dt className="text-stone-500">Clip order</dt><dd>{s.brief_clip_order ?? "—"}</dd>
              <dt className="text-stone-500">Footage in</dt><dd>{fmtDateTime(s.footage_in_at)}</dd>
              <dt className="text-stone-500">Cutoff</dt><dd>{fmtDateTime(s.cutoff_at)}</dd>
              <dt className="text-stone-500">Approved</dt><dd>{s.approved_at ? `${fmtDateTime(s.approved_at)} by ${names[s.approved_by ?? ""]}` : "—"}</dd>
              <dt className="text-stone-500">Published</dt><dd>{s.published_at ? `${fmtDateTime(s.published_at)} by ${names[s.published_by ?? ""]} · turnaround ${hours(turnaroundHours(s.footage_in_at, s.published_at))}` : "—"}</dd>
              {urls.length > 0 && <><dt className="text-stone-500">Platforms</dt><dd className="flex gap-2 flex-wrap">{urls.map((u) => <a key={u} href={u} className="underline text-xs" target="_blank" rel="noreferrer">{u}</a>)}</dd></>}
            </dl>
          </Section>

          <Section title={`Captures (${caps.length})`} sub="Field unit uploads within the hour; each file named by date, place, subject; interviewee name, designation, place noted.">
            {caps.length === 0 ? <Empty>No captures yet.</Empty> : (
              <table className="data">
                <thead><tr><th>File</th><th>Kind</th><th>Interviewee</th><th>Uploaded</th><th>Notes</th></tr></thead>
                <tbody>{caps.map((c) => (
                  <tr key={c.id}><td className="font-mono text-xs">{c.file_name}</td><td>{c.kind}{c.duration_s ? ` · ${c.duration_s}s` : ""}</td>
                    <td>{c.interviewee_name ? <>{c.interviewee_name}<div className="text-xs text-stone-500">{c.interviewee_designation}, {c.interviewee_place}</div></> : <span className="text-stone-400">{c.interviewee_place}</span>}</td>
                    <td className="text-xs">{fmtTime(c.uploaded_at)} · {names[c.uploaded_by ?? ""]}</td><td className="text-xs">{c.notes}</td></tr>
                ))}</tbody>
              </table>
            )}
            {can(role, "capture.log") && s.status !== "published" && (
              <details className="mt-3"><summary className="cursor-pointer text-sm font-medium">Log a capture</summary>
                <div className="mt-2">
                  <ActionForm action={logCapture} submit="Log capture">
                    <input type="hidden" name="story_id" value={s.id} />
                    <div className="grid grid-cols-3 gap-2">
                      <Field label="File name"><input name="file_name" className="input" placeholder="20261001_place_subject_01.mp4" /></Field>
                      <Field label="Kind"><select name="kind" className="input"><option>video</option><option>still</option><option>audio</option></select></Field>
                      <Field label="Duration (s)"><input name="duration_s" type="number" className="input" /></Field>
                      <Field label="Interviewee"><input name="interviewee_name" className="input" /></Field>
                      <Field label="Designation"><input name="interviewee_designation" className="input" /></Field>
                      <Field label="Place"><input name="interviewee_place" className="input" /></Field>
                    </div>
                    <Field label="Notes (phonetic spelling of names, context)"><input name="notes" className="input" /></Field>
                    <Check name="breaking" label="Breaking — publish today even if after cutoff (rare)" />
                  </ActionForm>
                </div>
              </details>
            )}
          </Section>

          <Section title={`Scripts (${scripts.length})`} sub="Facts first; our own Kannada words; phonetic spellings for the AI voice; primary source named.">
            {scripts.map((sc) => (
              <div key={sc.id} className="mb-3 rounded border border-stone-200 p-3 text-sm">
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  <span className="font-medium">v{sc.version}</span>
                  {sc.retold ? <Chip tone="blue">retold</Chip> : null}
                  {sc.approved_at ? <Chip tone="green">approved · {names[sc.approved_by ?? ""]}</Chip> : <Chip tone="amber">awaiting approval</Chip>}
                  {sc.voice_done ? <Chip tone="green">voice done</Chip> : <Chip>voice pending</Chip>}
                  <span className="text-xs text-stone-500">by {names[sc.written_by ?? ""]}</span>
                </div>
                <ul className="list-disc pl-5 text-xs text-stone-700 mb-2">{parseJson<string[]>(sc.facts, []).map((f, i) => <li key={i}>{f}</li>)}</ul>
                {sc.primary_source && <div className="text-xs text-stone-500 mb-2">Primary source: {sc.primary_source}</div>}
                {sc.body_kn && <p className="kn text-base leading-relaxed">{sc.body_kn}</p>}
                {parseJson<{ word: string; say: string }[]>(sc.phonetics, []).length > 0 && (
                  <div className="mt-2 text-xs"><span className="text-stone-500">Phonetics: </span>{parseJson<{ word: string; say: string }[]>(sc.phonetics, []).map((p) => `${p.word} → ${p.say}`).join(" · ")}</div>
                )}
                <div className="mt-2 flex gap-2">
                  {!sc.approved_at && can(role, "script.approve") && (
                    <ActionForm action={approveScript} submit="Approve script" inline><input type="hidden" name="script_id" value={sc.id} /></ActionForm>
                  )}
                  {sc.approved_at && !sc.voice_done && can(role, "asset.attach") && (
                    <ActionForm action={markVoiceDone} submit="Mark voice done" inline><input type="hidden" name="script_id" value={sc.id} /></ActionForm>
                  )}
                </div>
              </div>
            ))}
            {can(role, "script.write") && s.status !== "published" && (
              <details className="mt-2"><summary className="cursor-pointer text-sm font-medium">Write a new version</summary>
                <div className="mt-2">
                  <ActionForm action={saveScript} submit="Save script">
                    <input type="hidden" name="story_id" value={s.id} />
                    <Field label="Facts (one per line)"><textarea name="facts" className="input" rows={3} required /></Field>
                    <Field label="Primary source"><input name="primary_source" className="input" /></Field>
                    <Field label="Script (Kannada)"><textarea name="body_kn" className="input kn" rows={5} /></Field>
                    <Field label="Phonetics (word = say, one per line)"><textarea name="phonetics" className="input" rows={2} placeholder="Avinahalli = a-VI-na-HAL-li" /></Field>
                    <Check name="retold" label="Retold from a state/central story — facts only, our own words" />
                  </ActionForm>
                </div>
              </details>
            )}
          </Section>
        </div>

        <div>
          <Section title={`Footage & assets (${assets.length})`} sub="Green attaches. Amber waits for central clearance. Red never attaches.">
            {assets.length === 0 ? <Empty>No assets attached.</Empty> : assets.map((a) => (
              <div key={a.id} className="mb-3 text-sm border-b border-stone-100 pb-2">
                <div className="flex gap-2 items-center flex-wrap"><TierChip tier={a.tier} /><span className="font-medium">{a.description}</span></div>
                <div className="text-xs text-stone-500 mt-1">{a.source_type.replace(/_/g, " ")}{a.source_name ? ` · ${a.source_name}` : ""}{a.duration_s ? ` · ${a.duration_s}s` : ""}{a.ai_generated ? " · AI" : ""}{a.credit_on_screen ? " · credit on screen" : ""}</div>
                {a.tier === "amber" && <div className="mt-1 flex gap-2 items-center"><StatusChip status={a.clearance_status} />{a.clearance_note && <span className="text-xs text-stone-600">{a.clearance_note}</span>}</div>}
                {a.tier === "amber" && a.clearance_status === "pending" && can(role, "asset.clear") && (
                  <div className="mt-2 grid gap-1">
                    <ActionForm action={clearAsset} submit="Clear" inline><input type="hidden" name="asset_id" value={a.id} /><input type="hidden" name="decision" value="cleared" /><input name="note" className="input" placeholder="Note" /></ActionForm>
                    <ActionForm action={clearAsset} submit="Reject" inline danger><input type="hidden" name="asset_id" value={a.id} /><input type="hidden" name="decision" value="rejected" /><input name="note" className="input" placeholder="Why" /></ActionForm>
                  </div>
                )}
              </div>
            ))}
            {can(role, "asset.attach") && s.status !== "published" && (
              <details className="mt-2"><summary className="cursor-pointer text-sm font-medium">Attach footage</summary>
                <div className="mt-2">
                  <ActionForm action={attachAsset} submit="Attach">
                    <input type="hidden" name="story_id" value={s.id} />
                    <Field label="Description"><input name="description" className="input" required /></Field>
                    <Field label="Source type">
                      <select name="source_type" className="input">
                        {FOOTAGE_SOURCES.map((f) => <option key={f.key} value={f.key}>[{f.tier}] {f.label}</option>)}
                      </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Tier"><select name="tier" className="input"><option>green</option><option>amber</option><option>red</option></select></Field>
                      <Field label="Duration (s)"><input name="duration_s" type="number" className="input" /></Field>
                    </div>
                    <Field label="Source name / credit"><input name="source_name" className="input" /></Field>
                    <Field label="Permission reference"><input name="permission_ref" className="input" placeholder="consent id / WhatsApp screenshot" /></Field>
                    <Check name="own" label="Shot by our own people" defaultChecked />
                    <Check name="ai_generated" label="AI-generated (identity/ads only)" />
                    <div className="text-xs font-medium text-stone-600 mt-1">Permission checklist</div>
                    {PERMISSION_CHECKLIST.map((c) => <Check key={c.key} name={`ck_${c.key}`} label={c.q} defaultChecked={c.key === "minors_consent"} />)}
                  </ActionForm>
                </div>
              </details>
            )}
          </Section>

          <Section title="Pipeline actions">
            <div className="grid gap-2">
              {s.status === "idea" && can(role, "story.assign") && <ActionForm action={setStoryStatus} submit="Assign to field" inline><input type="hidden" name="story_id" value={s.id} /><input type="hidden" name="status" value="assigned" /></ActionForm>}
              {["scripted", "captured"].includes(s.status) && can(role, "script.approve") && <ActionForm action={setStoryStatus} submit="Approve story" inline><input type="hidden" name="story_id" value={s.id} /><input type="hidden" name="status" value="approved" /></ActionForm>}
              {s.status === "approved" && can(role, "asset.attach") && <ActionForm action={setStoryStatus} submit="Mark produced" inline><input type="hidden" name="story_id" value={s.id} /><input type="hidden" name="status" value="produced" /></ActionForm>}
              {s.status === "rolled" && can(role, "story.assign") && <ActionForm action={setStoryStatus} submit="Reinstate for today" inline><input type="hidden" name="story_id" value={s.id} /><input type="hidden" name="status" value="captured" /></ActionForm>}
              {s.status !== "published" && s.status !== "killed" && (
                <ActionForm action={publishStory} submit="Publish">
                  <input type="hidden" name="story_id" value={s.id} />
                  <Field label="Platform URLs (space separated)"><input name="platform_urls" className="input" placeholder="https://youtube.com/… https://instagram.com/…" /></Field>
                </ActionForm>
              )}
              {s.status !== "published" && s.status !== "killed" && can(role, "story.assign") && <ActionForm action={setStoryStatus} submit="Kill story" inline danger><input type="hidden" name="story_id" value={s.id} /><input type="hidden" name="status" value="killed" /></ActionForm>}
            </div>
            <p className="mt-3 text-xs text-stone-500">Acting as <strong>{me.name}</strong>. The server rejects anything your role may not do; try publishing as a Taluk Editor to see the rule.</p>
          </Section>
        </div>
      </div>
    </>
  );
}
