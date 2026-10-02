import { FOOTAGE_SOURCES, LAYERS, PERMISSION_CHECKLIST, PROHIBITED_CATEGORIES, ROLES, ROLE_LABEL, SLOT_TYPES } from "@/domain/constants";
import { PERMISSIONS, type Permission } from "@/domain/permissions";
import { ALLOWED_PAYMENT_METHODS } from "@/domain/rules";
import { Chip, Notice, PageHeader, Section, TierChip } from "@/components/ui";
import Link from "next/link";
import { resetDemo } from "@/app/ops/actions";
import { currentUser, roleOf } from "@/lib/session";
import { can } from "@/domain/permissions";

const PERMS: Permission[] = ["lineup.confirm", "story.create", "capture.log", "script.write", "script.approve", "script.approve_political", "asset.attach", "asset.clear", "story.publish", "creator.manage", "sales.manage", "payment.record", "ratecard.edit", "decision.edit", "unblock.log", "analytics.view", "export.csv"];

const HARD_RULES = [
  { rule: "Publish is a single button, pressed only by the production desk or founder.", where: "assertCanPublish" },
  { rule: "Amber footage must be cleared by the central desk before it can be published; red footage can never be attached.", where: "assertAssetCanAttach · assertCanPublish" },
  { rule: "AI-generated visuals never appear in the Daily Pulse; AI is for identity recreation and ads only, always labelled.", where: "assertAssetCanAttach" },
  { rule: "Political scripts and advertising are approved only by the content head or founder; political ads need an MCMC certificate and a 'paid for by' line.", where: "assertCanApproveScript · computeContractValue" },
  { rule: "A paid story must be attached to an advertiser and is labelled 'Paid' on the public page.", where: "publishStory" },
  { rule: "Footage received after the 14:00 cutoff rolls to the next day unless it is breaking news.", where: "shouldRoll" },
  { rule: "Minimum sale is one month; no discounting — the free first month is the only concession, and it is recorded as such.", where: "computeContractValue" },
  { rule: "Cash is not accepted. Every rupee goes through the company's bank account; payment methods: " + ALLOWED_PAYMENT_METHODS.join(", ") + ".", where: "assertPaymentMethod" },
  { rule: "Advertisers in a prohibited category are blocked at the gate; some categories need a central decision.", where: "assertAdvertiserAllowed" },
  { rule: "Every mutation is written to the audit trail with user, action, entity and time.", where: "audit()" },
];

export default async function PolicyPage() {
  const me = await currentUser();
  const canReset = can(roleOf(me), "policy.edit");
  return (
    <>
      <PageHeader title="Policy & permissions" sub="What the software enforces, by whom. These rules are code, not guidance — the server rejects an action that breaks them regardless of who is logged in.">
        <div className="flex gap-2"><Link href="/privacy" className="btn">Privacy</Link><Link href="/terms" className="btn">Terms</Link><Link href="/policy" className="btn">Public policy page</Link></div>
      </PageHeader>

      <Section title="Hard rules enforced in code" sub="Plan §4, §5, §9, §11. Column on the right names the rule function in src/domain/rules.ts.">
        <table className="data"><thead><tr><th>#</th><th>Rule</th><th>Enforced by</th></tr></thead><tbody>
          {HARD_RULES.map((r, i) => <tr key={i}><td className="text-stone-400">{i + 1}</td><td>{r.rule}</td><td className="text-xs font-mono text-stone-500 whitespace-nowrap">{r.where}</td></tr>)}
        </tbody></table>
      </Section>

      <Section title="Role permission matrix" sub="Who can do what. Founder has every permission; the investor role is read-only.">
        <div className="overflow-x-auto">
          <table className="data text-xs"><thead><tr><th className="sticky left-0 bg-white">Permission</th>{ROLES.map((r) => <th key={r} className="whitespace-nowrap align-bottom"><span className="inline-block" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{ROLE_LABEL[r]}</span></th>)}</tr></thead><tbody>
            {PERMS.map((p) => <tr key={p}><td className="font-mono sticky left-0 bg-white">{p}</td>{ROLES.map((r) => <td key={r} className="text-center">{PERMISSIONS[r].includes(p) ? <span className="text-green-700">●</span> : <span className="text-stone-200">·</span>}</td>)}</tr>)}
          </tbody></table>
        </div>
      </Section>

      <div className="grid lg:grid-cols-2 gap-4">
        <Section title="Footage sources — green / amber / red" sub="Plan §9. Every asset is tagged with its source; the tier decides whether it can be attached and whether it needs clearance.">
          <table className="data"><thead><tr><th>Source</th><th>Tier</th><th>Rule</th></tr></thead><tbody>
            {FOOTAGE_SOURCES.map((f) => <tr key={f.key}><td>{f.label}</td><td><TierChip tier={f.tier} /></td><td className="text-xs text-stone-600">{f.rule}</td></tr>)}
          </tbody></table>
        </Section>
        <Section title="Permission checklist for amber footage" sub="All seven must be answered before the central desk clears an amber asset.">
          <ol className="list-decimal pl-5 text-sm space-y-1">{PERMISSION_CHECKLIST.map((c) => <li key={c.key}>{c.q}</li>)}</ol>
          <Notice tone="info">Consent is recorded per creator (written, dated, scope). A creator without a saved consent cannot have amber footage cleared.</Notice>
        </Section>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Section title="Prohibited advertiser categories" sub="Plan §11.4 — the founder's values filter plus categories added because they are the fastest way to lose credibility.">
          <table className="data"><thead><tr><th>Category</th><th>Source</th><th>Decision</th></tr></thead><tbody>
            {PROHIBITED_CATEGORIES.map((c) => <tr key={c.category}><td>{c.category}</td><td className="text-xs text-stone-600">{c.source}</td><td>{c.central_only ? <Chip tone="violet">central only</Chip> : <Chip tone="red">blocked</Chip>}</td></tr>)}
          </tbody></table>
        </Section>
        <Section title="Content layers" sub="Plan §4 — what each layer is for and what may appear in it.">
          <table className="data"><thead><tr><th>Layer</th><th>What</th><th>AI allowed</th></tr></thead><tbody>
            {Object.entries(LAYERS).map(([k, v]) => <tr key={k}><td className="font-medium whitespace-nowrap">{v.label}</td><td className="text-xs text-stone-600">{v.why}</td><td>{k === "daily_pulse" ? <Chip tone="red">never</Chip> : <Chip tone="green">labelled</Chip>}</td></tr>)}
          </tbody></table>
        </Section>
      </div>

      <Section title="Advertising slots" sub="Plan §11.2 — the rate card structure. Prices are set per taluk on the rate card page.">
        <table className="data"><thead><tr><th>Slot</th><th>Format</th><th>Sold as</th><th>Flags</th></tr></thead><tbody>
          {SLOT_TYPES.map((s) => <tr key={s.slot_type}><td className="font-medium">{s.slot_type}</td><td className="text-xs text-stone-600">{s.format}</td><td className="text-xs">{s.sold_as}</td><td className="flex gap-1">{s.category_exclusive ? <Chip tone="blue">category-exclusive</Chip> : null}{s.political ? <Chip tone="red">political · MCMC</Chip> : null}</td></tr>)}
        </tbody></table>
      </Section>

      <Section title="Demo data" sub="The database is seeded with a demo day (1 Oct 2026). Resetting wipes every change made in this demo and reseeds.">
        {canReset ? (
          <form action={resetDemo}><button type="submit" className="btn border-red-300 text-red-700 hover:bg-red-50">Reset demo data</button></form>
        ) : (
          <p className="text-sm text-stone-600">Only the founder or content head can reset demo data. Switch role in the sidebar.</p>
        )}
      </Section>
    </>
  );
}
