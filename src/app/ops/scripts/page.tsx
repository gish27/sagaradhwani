import Link from "next/link";
import { allScripts, userMap } from "@/db/queries";
import { currentUser, roleOf } from "@/lib/session";
import { can } from "@/domain/permissions";
import { fmtDateTime, parseJson } from "@/lib/format";
import { Chip, PageHeader, Section, LayerChip } from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { approveScript, markVoiceDone } from "../actions";

export default async function ScriptsPage() {
  const me = await currentUser();
  const role = roleOf(me);
  const scripts = allScripts();
  const names = userMap();
  const pending = scripts.filter((s) => !s.approved_at);
  const approved = scripts.filter((s) => s.approved_at);

  const Row = ({ sc }: { sc: (typeof scripts)[number] }) => (
    <div className="rounded border border-stone-200 p-3 text-sm mb-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/ops/story/${sc.story_id}`} className="font-medium hover:underline">{sc.story_title}</Link>
        <LayerChip layer={sc.story_layer} />
        <Chip>v{sc.version}</Chip>
        {sc.retold ? <Chip tone="blue">retold</Chip> : null}
        {sc.story_political ? <Chip tone="red">political</Chip> : null}
        {sc.voice_done ? <Chip tone="green">voice done</Chip> : <Chip>voice pending</Chip>}
      </div>
      <div className="text-xs text-stone-500 mt-1">by {names[sc.written_by ?? ""]}{sc.approved_at ? ` · approved ${fmtDateTime(sc.approved_at)} by ${names[sc.approved_by ?? ""]}` : ""}{sc.primary_source ? ` · source: ${sc.primary_source}` : ""}</div>
      <ul className="list-disc pl-5 text-xs mt-2">{parseJson<string[]>(sc.facts, []).map((f, i) => <li key={i}>{f}</li>)}</ul>
      {sc.body_kn && <p className="kn mt-2">{sc.body_kn}</p>}
      <div className="mt-2 flex gap-2">
        {!sc.approved_at && can(role, "script.approve") && <ActionForm action={approveScript} submit={sc.story_political ? "Approve (content head)" : "Approve"} inline><input type="hidden" name="script_id" value={sc.id} /></ActionForm>}
        {sc.approved_at && !sc.voice_done && can(role, "asset.attach") && <ActionForm action={markVoiceDone} submit="Mark AI voice done" inline><input type="hidden" name="script_id" value={sc.id} /></ActionForm>}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader title="Scripts & voice" sub="Retelling rule: take the facts and the underlying story, never their script, sentence structure, footage or photographs. One consistent AI Kannada voice; phonetic spellings for names and numbers. Political scripts need the content head." />
      <div className="grid lg:grid-cols-2 gap-5">
        <Section title={`Awaiting approval (${pending.length})`}>{pending.length === 0 ? <p className="text-sm text-stone-500">Nothing waiting.</p> : pending.map((sc) => <Row key={sc.id} sc={sc} />)}</Section>
        <Section title={`Approved (${approved.length})`}>{approved.map((sc) => <Row key={sc.id} sc={sc} />)}</Section>
      </div>
    </>
  );
}
