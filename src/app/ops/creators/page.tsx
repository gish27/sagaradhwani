import { creators, consents } from "@/db/queries";
import { currentUser, roleOf } from "@/lib/session";
import { can } from "@/domain/permissions";
import { fmtDate } from "@/lib/format";
import { Chip, PageHeader, Section } from "@/components/ui";
import { ActionForm, Field } from "@/components/action-form";
import { addCreator } from "../actions";

export default async function CreatorsPage() {
  const me = await currentUser();
  const role = roleOf(me);
  const list = creators();
  const cons = consents();
  const active = list.filter((c) => c.active).length;

  return (
    <>
      <PageHeader title="Creators & consents" sub="A roster of five to six cleared local voices per taluk, each with a standing WhatsApp permission saved. Viewer submissions, interviewees, parents and advertisers each leave a consent record." />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Section title={`Sagara creator roster (${active} cleared of ${list.length})`} sub="Target: 5–6 cleared before day one. Non-roster creators: 15–20 s maximum, credited, our narration doing the work.">
            <table className="data"><thead><tr><th>Creator</th><th>Platform</th><th>Standing permission</th><th>Status</th></tr></thead>
              <tbody>{list.map((c) => <tr key={c.id}><td className="font-medium">{c.name}<div className="text-xs text-stone-500">{c.handle}</div></td><td>{c.platform}</td><td className="text-xs">{c.permission_ref ? `${c.permission_ref} · ${fmtDate(c.permission_at)}` : <span className="text-amber-700">not yet collected</span>}</td><td>{c.active ? <Chip tone="green">cleared</Chip> : <Chip tone="amber">pending</Chip>}</td></tr>)}</tbody></table>
          </Section>
          <Section title={`Consent register (${cons.length})`} sub="Templates in docs/09-data-protection-consent.md.">
            <table className="data"><thead><tr><th>Kind</th><th>Subject</th><th>Given by</th><th>Reference</th><th>Date</th><th>Linked</th></tr></thead>
              <tbody>{cons.map((c) => <tr key={c.id}><td><Chip tone={c.kind === "creator_standing" ? "green" : c.kind === "viewer_submission" ? "violet" : c.kind === "advertiser_creative" ? "saffron" : "blue"}>{c.kind.replace("_", " ")}</Chip></td><td>{c.subject_name}</td><td className="text-xs">{c.given_by} ({c.relation})</td><td className="text-xs">{c.reference}</td><td className="text-xs">{fmtDate(c.given_at)}</td><td className="text-xs">{c.story_id ?? c.creator_id ?? "—"}{c.revoked_at ? <Chip tone="red">revoked</Chip> : null}</td></tr>)}</tbody></table>
          </Section>
        </div>
        <div>
          {can(role, "creator.manage") && (
            <Section title="Add a creator" sub="Save the permission reference to clear them.">
              <ActionForm action={addCreator} submit="Add creator">
                <Field label="Name"><input name="name" className="input" required /></Field>
                <Field label="Handle"><input name="handle" className="input" placeholder="@…" /></Field>
                <Field label="Platform"><select name="platform" className="input"><option>Instagram</option><option>YouTube</option><option>Facebook</option></select></Field>
                <Field label="Standing permission reference" hint="WhatsApp screenshot / message id. Leave blank to add as pending."><input name="permission_ref" className="input" /></Field>
              </ActionForm>
            </Section>
          )}
          <Section title="Standing permission (template)">
            <p className="text-xs text-stone-600 kn">“ನಿಮ್ಮ ವೀಡಿಯೊಗಳನ್ನು ಸಾಗರ ಧ್ವನಿ ಚಾನೆಲ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರಿನ ಕ್ರೆಡಿಟ್‌ನೊಂದಿಗೆ ಬಳಸಲು ಅನುಮತಿ ಇದೆಯೇ? ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ಹಿಂಪಡೆಯಬಹುದು.”</p>
            <p className="text-xs text-stone-500 mt-2">“May Sagara Dhwani use your videos with your name credited on screen? You can withdraw at any time.” Reply saved as the record.</p>
          </Section>
        </div>
      </div>
    </>
  );
}
