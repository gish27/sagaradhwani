import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { ReactNode } from "react";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function inline(s: string) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

/** Minimal markdown → HTML for the policy documents in docs/ (headings, paragraphs, lists, tables, blockquotes, hr). */
export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    const h = /^(#{1,6})\s+(.*)$/.exec(l);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (/^---+$/.test(l.trim())) { out.push("<hr/>"); i++; continue; }
    if (l.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`); continue;
    }
    if (l.startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) { rows.push(lines[i]); i++; }
      const cells = (r: string) => r.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(1).filter((r) => !/^\|[\s:|-]+\|$/.test(r)).map(cells);
      out.push(`<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }
    const ul = /^\s*[-*]\s+/.test(l), ol = /^\s*\d+\.\s+/.test(l);
    if (ul || ol) {
      const buf: string[] = [];
      const re = ul ? /^\s*[-*]\s+/ : /^\s*\d+\.\s+/;
      while (i < lines.length && re.test(lines[i])) { buf.push(lines[i].replace(re, "")); i++; }
      out.push(`<${ul ? "ul" : "ol"}>${buf.map((b) => `<li>${inline(b)}</li>`).join("")}</${ul ? "ul" : "ol"}>`); continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#|\||>|---|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) { buf.push(lines[i]); i++; }
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  return out.join("\n");
}

export function readDoc(name: string) {
  return fs.readFileSync(path.join(process.cwd(), "docs", name), "utf8");
}

export function DocPage({ file, children }: { file: string; children?: ReactNode }) {
  const html = renderMarkdown(readDoc(file));
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white"><div className="max-w-3xl mx-auto px-4 py-3 flex justify-between text-sm"><Link href="/" className="font-semibold">Sagara Dhwani</Link><nav className="flex gap-4 text-stone-600"><Link href="/policy">Policy</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav></div></header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
        <article className="doc" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </div>
  );
}
