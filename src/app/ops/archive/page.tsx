import Link from "next/link";
import { archive } from "@/db/queries";
import { BUCKETS } from "@/domain/constants";
import { fmtDate, parseJson } from "@/lib/format";
import { Chip, PageHeader, Section, Empty } from "@/components/ui";

export default function ArchivePage({ searchParams }: { searchParams: Promise<{ bucket?: string }> }) {
  return <ArchiveInner searchParams={searchParams} />;
}

async function ArchiveInner({ searchParams }: { searchParams: Promise<{ bucket?: string }> }) {
  const { bucket } = await searchParams;
  const items = archive().filter((a) => !bucket || a.bucket === bucket);
  const counts: Record<string, number> = {};
  for (const a of archive()) counts[a.bucket ?? "other"] = (counts[a.bucket ?? "other"] ?? 0) + 1;

  return (
    <>
      <PageHeader title="Identity archive" sub="Every identity piece is permanently reusable: tagged by bucket, place, people, era and anniversary so it can be resurfaced on the right date, compiled, or licensed." />
      <div className="flex gap-2 flex-wrap mb-4">
        <Link href="/ops/archive" className={`btn ${!bucket ? "btn-primary" : ""}`}>All ({archive().length})</Link>
        {Object.entries(BUCKETS).map(([k, v]) => <Link key={k} href={`/ops/archive?bucket=${k}`} className={`btn ${bucket === k ? "btn-primary" : ""}`}>{v.label} ({counts[k] ?? 0})</Link>)}
      </div>
      <Section title={`${items.length} item(s)`}>
        {items.length === 0 ? <Empty>Nothing in this bucket yet. Publishing an identity story archives it automatically.</Empty> : (
          <div className="grid md:grid-cols-2 gap-3">
            {items.map((a) => (
              <div key={a.id} className="rounded border border-stone-200 p-3 text-sm">
                <div className="flex gap-2 items-center flex-wrap mb-1"><Chip tone="saffron">{BUCKETS[a.bucket as keyof typeof BUCKETS]?.label ?? a.bucket}</Chip>{a.era && <Chip>{a.era}</Chip>}{a.anniversary_mmdd && <Chip tone="blue">anniversary {a.anniversary_mmdd}</Chip>}<Chip tone={a.rights_status === "own" ? "green" : "amber"}>{a.rights_status}</Chip></div>
                <Link href={`/ops/story/${a.story_id}`} className="font-medium hover:underline">{a.title}</Link>
                <p className="text-xs text-stone-600 mt-1">{a.summary}</p>
                <div className="text-xs text-stone-500 mt-2">
                  {parseJson<string[]>(a.places, []).length > 0 && <div>Places: {parseJson<string[]>(a.places, []).join(", ")}</div>}
                  {parseJson<string[]>(a.people, []).length > 0 && <div>People: {parseJson<string[]>(a.people, []).join(", ")}</div>}
                  <div>Tags: {parseJson<string[]>(a.tags, []).join(", ") || "—"} · archived {fmtDate(a.archived_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
