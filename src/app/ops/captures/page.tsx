import Link from "next/link";
import { allCaptures, userMap, taluk } from "@/db/queries";
import { fmtDate, fmtTime } from "@/lib/format";
import { PageHeader, Section } from "@/components/ui";

export default function CapturesPage() {
  const caps = allCaptures();
  const names = userMap();
  const t = taluk();
  return (
    <>
      <PageHeader title="Capture log" sub={`Field protocol: upload within the hour; file named by date, place, subject; interviewee name, designation and place noted; at least one wide, one tight and one detail per story. Cutoff ${t.cutoff_time}.`} />
      <Section title={`All captures (${caps.length})`}>
        <table className="data">
          <thead><tr><th>Uploaded</th><th>File</th><th>Story</th><th>Kind</th><th>Interviewee</th><th>By</th><th>Notes</th></tr></thead>
          <tbody>{caps.map((c) => (
            <tr key={c.id}>
              <td className="whitespace-nowrap text-xs">{fmtDate(c.uploaded_at)} {fmtTime(c.uploaded_at)}</td>
              <td className="font-mono text-xs">{c.file_name}</td>
              <td><Link href={`/ops/story/${c.story_id}`} className="hover:underline">{c.story_title}</Link></td>
              <td className="text-xs">{c.kind}{c.duration_s ? ` · ${c.duration_s}s` : ""}</td>
              <td className="text-xs">{c.interviewee_name ? <>{c.interviewee_name}<div className="text-stone-500">{c.interviewee_designation}, {c.interviewee_place}</div></> : <span className="text-stone-400">{c.interviewee_place}</span>}</td>
              <td className="text-xs">{names[c.uploaded_by ?? ""]}</td>
              <td className="text-xs">{c.notes}</td>
            </tr>
          ))}</tbody>
        </table>
        <p className="mt-3 text-xs text-stone-500">Log new captures from a story page. The first capture stamps footage-in and starts the turnaround clock; after cutoff the story rolls unless marked breaking.</p>
      </Section>
    </>
  );
}
