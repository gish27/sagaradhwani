import { decisions, escalations, unblockLog, userMap } from "@/db/queries";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { Chip, Empty, PageHeader, Section } from "@/components/ui";
import { ActionForm, Field } from "@/components/action-form";
import { addUnblock, decideEscalation, resolveDecision } from "../actions";

export const dynamic = "force-dynamic";

export default function DecisionsPage() {
  const all = decisions();
  const open = all.filter((d) => d.status === "open");
  const decided = all.filter((d) => d.status === "decided");
  const esc = escalations();
  const users = userMap();
  const unblocks = unblockLog();

  return (
    <>
      <PageHeader title="Decisions register" sub="Plan §17 — what is decided (and binding) versus what is still open. Open items block the investor meeting or the launch; each has an owner and a due date." />

      <div className="grid md:grid-cols-3 gap-3 mb-5">
        <div className="card"><div className="text-xs text-stone-500">Decided</div><div className="text-2xl font-semibold">{decided.length}</div></div>
        <div className="card"><div className="text-xs text-stone-500">Open</div><div className="text-2xl font-semibold text-amber-700">{open.length}</div></div>
        <div className="card"><div className="text-xs text-stone-500">Escalations awaiting a call</div><div className="text-2xl font-semibold">{esc.filter((e) => !e.decided_at).length}</div></div>
      </div>

      <Section title="Open — needs a decision" sub="Resolve with a sentence that can be acted on. Content head or founder only.">
        {open.length === 0 ? <Empty>Nothing open.</Empty> : (
          <div className="grid gap-3">
            {open.map((d) => (
              <details key={d.id} className="rounded border border-amber-200 bg-amber-50/40 p-3">
                <summary className="cursor-pointer text-sm font-medium flex flex-wrap gap-2 items-center"><Chip tone="amber">{d.area}</Chip>{d.title}{d.due && <span className="text-xs text-stone-500 ml-auto">due {fmtDate(d.due)}{d.owner ? ` · ${d.owner}` : ""}</span>}</summary>
                <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                  {d.position_a && <div className="rounded bg-white border border-stone-200 p-2"><div className="text-xs font-medium text-stone-500 mb-1">Position A</div>{d.position_a}</div>}
                  {d.position_b && <div className="rounded bg-white border border-stone-200 p-2"><div className="text-xs font-medium text-stone-500 mb-1">Position B</div>{d.position_b}</div>}
                </div>
                {d.why_it_matters && <p className="text-xs text-stone-600 mt-2"><b>Why it matters:</b> {d.why_it_matters} {d.plan_ref && <span className="text-stone-400">({d.plan_ref})</span>}</p>}
                <div className="mt-3">
                  <ActionForm action={resolveDecision} submit="Record decision" inline>
                    <input type="hidden" name="decision_id" value={d.id} />
                    <Field label="Decision"><input name="decision" className="input w-[28rem] max-w-full" required placeholder="One actionable sentence" /></Field>
                  </ActionForm>
                </div>
              </details>
            ))}
          </div>
        )}
      </Section>

      <Section title="Escalations" sub="Political, legal and sensitive calls raised from the desk. Decided by content head or founder.">
        {esc.length === 0 ? <Empty>No escalations.</Empty> : (
          <table className="data"><thead><tr><th>Raised</th><th>Kind</th><th>Story</th><th>Detail</th><th>Decision</th></tr></thead><tbody>
            {esc.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap text-xs">{fmtDateTime(e.raised_at)}<br /><span className="text-stone-500">{users[e.raised_by ?? ""]  ?? "—"}</span></td>
                <td><Chip tone={e.kind === "political" ? "red" : "violet"}>{e.kind}</Chip></td>
                <td className="text-sm">{e.title ?? "—"}</td>
                <td className="text-xs text-stone-600 max-w-xs">{e.detail}</td>
                <td>
                  {e.decided_at ? <div className="text-sm"><Chip tone="green">{e.decision}</Chip><div className="text-xs text-stone-500 mt-1">{users[e.decided_by ?? ""] } · {fmtDateTime(e.decided_at)}</div></div> : (
                    <ActionForm action={decideEscalation} submit="Decide" inline>
                      <input type="hidden" name="escalation_id" value={e.id} />
                      <select name="decision" className="input" defaultValue="approve"><option value="approve">approve</option><option value="approve_with_changes">approve with changes</option><option value="hold">hold</option><option value="kill">kill</option></select>
                    </ActionForm>
                  )}
                </td>
              </tr>
            ))}
          </tbody></table>
        )}
      </Section>

      <Section title="Unblock log" sub="Plan §8 — every time the founder has to step in, record what, who helped, and why the hired editor could not. This is how the playbook gets written and how we know when the taluk runs without the founder.">
        <table className="data mb-4"><thead><tr><th>Date</th><th>What</th><th>Who helped</th><th>Why the hired editor could not</th><th>Playbook note</th></tr></thead><tbody>
          {unblocks.map((u) => <tr key={u.id}><td className="whitespace-nowrap">{fmtDate(u.date)}</td><td>{u.what}</td><td>{u.who_helped}</td><td className="text-stone-600">{u.why_hired_editor_could_not}</td><td className="text-stone-600">{u.playbook_note}</td></tr>)}
        </tbody></table>
        <ActionForm action={addUnblock} submit="Log unblock" className="grid md:grid-cols-2 gap-3">
          <Field label="What happened"><input name="what" className="input" required /></Field>
          <Field label="Who helped"><input name="who_helped" className="input" /></Field>
          <Field label="Why the hired editor could not"><input name="why" className="input" /></Field>
          <Field label="Playbook note"><input name="playbook_note" className="input" placeholder="What goes into the playbook so it does not recur" /></Field>
        </ActionForm>
      </Section>

      <Section title="Decided — binding" sub="These are settled. Reopening one is itself a decision to record.">
        <table className="data"><thead><tr><th>Area</th><th>Decision</th><th>Ref</th></tr></thead><tbody>
          {decided.map((d) => <tr key={d.id}><td className="whitespace-nowrap"><Chip tone="green">{d.area}</Chip></td><td><div className="font-medium">{d.title}</div><div className="text-stone-600 text-xs">{d.decision}</div></td><td className="text-xs text-stone-400 whitespace-nowrap">{d.plan_ref}</td></tr>)}
        </tbody></table>
      </Section>
    </>
  );
}
