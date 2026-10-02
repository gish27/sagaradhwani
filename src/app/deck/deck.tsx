"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface DeckData {
  brand: string; taluk: string; district: string; date: string; publishTime: string;
  day: { slot: string; title: string; layer: string; status: string; paid: boolean }[];
  buckets: { label: string; examples: string }[];
  budget: { lean: number; middle: number; five: number; lines: { line: string; lean: number | null; middle: number | null; five: number | null }[] };
  unitCost: number;
  revenue: { line: string; basis: string; monthly: number }[];
  rateCards: { tier: string; slots: { slot: string; price: number; sold_as: string }[] }[];
}

const inr = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(Math.round(n));

type Variant = "lean" | "middle" | "five";
const VARIANT_LABEL: Record<Variant, string> = { lean: "A · Lean", middle: "C · Middle path", five: "B · Five-person team" };

function Slide({ n, kicker, line, children, dark }: { n: number; kicker: string; line: string; children?: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`h-full w-full flex flex-col p-10 md:p-16 ${dark ? "bg-stone-950 text-stone-50" : "bg-white text-stone-900"}`}>
      <div className={`text-xs uppercase tracking-[0.2em] ${dark ? "text-amber-400" : "text-amber-700"}`}>{String(n).padStart(2, "0")} · {kicker}</div>
      <h2 className="text-3xl md:text-5xl font-bold leading-tight mt-3 max-w-4xl">{line}</h2>
      <div className="flex-1 mt-8 overflow-auto">{children}</div>
    </div>
  );
}

export function Deck({ data }: { data: DeckData }) {
  const [i, setI] = useState(0);
  const [variant, setVariant] = useState<Variant>("middle");
  const monthlyRevenue = data.revenue.reduce((a, r) => a + r.monthly, 0);
  const margin = monthlyRevenue - data.unitCost;
  const centralMonthly = useMemo(() => {
    const pick = (l: DeckData["budget"]["lines"][number]) => l[variant] ?? 0;
    return data.budget.lines.filter((l) => ["Central production", "Founder salary (nominal)", "Hosting, platform, software"].includes(l.line)).reduce((a, l) => a + pick(l), 0) / 6;
  }, [data.budget.lines, variant]);
  const breakEvenTaluks = Math.max(1, Math.ceil(centralMonthly / margin));

  const slides: React.ReactNode[] = [
    <Slide key={1} n={1} kicker="The gap" line="240 taluks in Karnataka have no daily voice of their own." dark>
      <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center h-full">
        <p className="text-lg md:text-2xl text-stone-300 max-w-2xl">Every taluk has a market, a hospital, a bus stand, a fort and a thousand small stories. Not one of them has a channel that shows up every day and says: this is us.</p>
        <div className="grid grid-cols-8 gap-1.5">{Array.from({ length: 240 }).map((_, k) => <div key={k} className={`w-3 h-3 rounded-sm ${k === 117 ? "bg-amber-400 shadow-[0_0_12px_2px_rgba(251,191,36,.7)]" : "bg-stone-800"}`} />)}</div>
      </div>
    </Slide>,
    <Slide key={2} n={2} kicker="What people lost" line="Local cable died, newspapers thinned, social media is noise.">
      <div className="grid md:grid-cols-3 gap-6 text-stone-700">
        <div className="card"><div className="text-4xl">📺</div><h3 className="font-semibold mt-3">The cable channel</h3><p className="text-sm mt-1">Every town once had one. The local jatre, the MLA&apos;s visit, the school day. Digitisation and consolidation ended it.</p></div>
        <div className="card"><div className="text-4xl">📰</div><h3 className="font-semibold mt-3">The district edition</h3><p className="text-sm mt-1">Pages shrank, bureaus closed. A taluk gets a column inch when something goes wrong.</p></div>
        <div className="card"><div className="text-4xl">📱</div><h3 className="font-semibold mt-3">The WhatsApp forward</h3><p className="text-sm mt-1">Fast, free, unverified, anonymous. Nobody stands behind it, and nobody is building anything with it.</p></div>
      </div>
    </Slide>,
    <Slide key={3} n={3} kicker="What we are building" line="One brand, one channel per taluk, fully digital, publishing daily.">
      <div className="grid md:grid-cols-3 gap-6">
        {[["Daily pulse", "The reason to open the channel every single day. Prices, roads, officials, weather, sport — straight, verified, in our own words."], ["Identity", "The soul of the channel. History, people, places, festivals, food, nature. Permanently reusable."], ["Participation", "Turns viewers into contributors. Citizen questions, clips from the public, local creators credited on screen."]].map(([h, p], k) => (
          <div key={h} className={`rounded-xl p-6 ${k === 1 ? "bg-amber-50 border border-amber-200" : "bg-stone-50 border border-stone-200"}`}><div className="text-xs uppercase tracking-wide text-stone-500">Layer {k + 1}</div><h3 className="text-xl font-semibold mt-1">{h}</h3><p className="text-sm text-stone-700 mt-2">{p}</p></div>
        ))}
      </div>
      <p className="text-sm text-stone-500 mt-6">{data.brand} for {data.taluk}. The constant word is <b>Dhwani</b> — voice. Every taluk gets its own name in front of it.</p>
    </Slide>,
    <Slide key={4} n={4} kicker="Not a news channel" line="We build attachment to land and culture; news brings people back.">
      <div className="grid md:grid-cols-3 gap-4">
        {data.buckets.map((b) => <div key={b.label} className="rounded-xl border border-stone-200 p-4"><h3 className="font-semibold">{b.label}</h3><p className="text-sm text-stone-600 mt-1">{b.examples}</p></div>)}
      </div>
      <p className="text-sm text-stone-500 mt-6">Daily news stays straight so trust is never spent. The mission lives in identity content — love for one&apos;s own land, without hostility to anyone.</p>
    </Slide>,
    <Slide key={5} n={5} kicker="The daily promise" line="Every taluk publishes every single day.">
      <p className="text-sm text-stone-500 mb-3">A real day&apos;s line-up from {data.taluk} — {data.date}, published at {data.publishTime}.</p>
      <table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase tracking-wide text-stone-500 border-b"><th className="py-2">Slot</th><th>Piece</th><th>Layer</th><th>State</th></tr></thead><tbody>
        {data.day.map((d, k) => <tr key={k} className="border-b border-stone-100"><td className="py-2 pr-3 text-stone-500 whitespace-nowrap">{d.slot}</td><td className="py-2 pr-3 font-medium">{d.title}{d.paid && <span className="ml-2 text-[10px] uppercase bg-yellow-200 text-yellow-900 px-1.5 rounded">paid</span>}</td><td className="py-2 pr-3 text-stone-600">{d.layer}</td><td className="py-2 text-stone-600">{d.status}</td></tr>)}
      </tbody></table>
      <p className="text-xs text-stone-500 mt-3">Hard cutoff 14:00. Anything later rolls to tomorrow unless it is breaking. A buffer bank of evergreen pieces means a day is never empty.</p>
    </Slide>,
    <Slide key={6} n={6} kicker="The two-person unit" line="A taluk runs on two people and a phone.">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-xl bg-stone-50 border border-stone-200 p-6"><div className="text-xs uppercase tracking-wide text-stone-500">Taluk Editor · ₹25,000/mo</div><ul className="mt-3 text-sm space-y-2 text-stone-700 list-disc pl-5"><li>Knows everyone; decides what matters today</li><li>Confirms the day&apos;s line-up by 09:00</li><li>Interviews, verifies, sends captures with names spelt as pronounced</li><li>Cannot publish, discount, promise coverage or collect cash</li></ul></div>
        <div className="rounded-xl bg-stone-50 border border-stone-200 p-6"><div className="text-xs uppercase tracking-wide text-stone-500">Field Operator · ₹15,000/mo</div><ul className="mt-3 text-sm space-y-2 text-stone-700 list-disc pl-5"><li>Shoots to the capture protocol — wide, close, steady, 90 seconds max</li><li>Uploads before cutoff; equipment check every morning</li><li>No editing, no scripting, no degree needed</li><li>Trial week before hiring</li></ul></div>
      </div>
      <p className="text-sm text-stone-500 mt-6">Unit cost ≈ {inr(data.unitCost)}/month including data, travel and fuel. Everything else is made centrally.</p>
    </Slide>,
    <Slide key={7} n={7} kicker="The central engine" line="The state team makes everything; taluks capture and send.">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {["Capture in taluk", "09:00 line-up confirmed", "Footage in before 14:00", "Script in Kannada + phonetics", "Approval (political → content head)", "Edit · AI voice · visuals", "Clearance of amber footage", `Publish at ${data.publishTime}`, "Archive & analytics"].map((s, k, arr) => (
          <div key={s} className="flex items-center gap-2"><div className={`rounded-lg px-3 py-2 border ${k === 0 ? "bg-amber-50 border-amber-300" : k === arr.length - 2 ? "bg-stone-900 text-white border-stone-900" : "bg-stone-50 border-stone-200"}`}>{s}</div>{k < arr.length - 1 && <span className="text-stone-400">→</span>}</div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4 mt-8 text-sm text-stone-700">
        <div className="card"><b>Turnaround</b> measured from the first day: footage-in to published-out, target under 48 hours, 24 for breaking.</div>
        <div className="card"><b>Single publish button</b>, pressed by the production desk only. Hard rules live in software, not in memos.</div>
        <div className="card"><b>Taluk two costs far less</b>: the engine is built once; a new taluk adds two people, a phone and a rate card.</div>
      </div>
    </Slide>,
    <Slide key={8} n={8} kicker="Our unfair advantage" line="We can recreate history no camera ever filmed." dark>
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-center h-full">
        <div className="aspect-video rounded-xl bg-gradient-to-br from-amber-900 via-stone-900 to-black border border-stone-800 flex items-center justify-center text-center p-8"><div><div className="text-amber-300 text-xs uppercase tracking-[0.2em]">Identity · History · AI recreation</div><div className="text-2xl md:text-3xl font-semibold mt-3">Keladi Chennamma and the night Shivaji&apos;s son came to Keladi</div><div className="text-stone-400 text-sm mt-3">60–90 seconds · labelled recreation · our script, our voice</div></div></div>
        <div className="text-stone-300 text-lg space-y-4"><p>&ldquo;Nobody has ever told this story on film. There are 240 taluks, and each one holds a hundred more.&rdquo;</p><p className="text-sm text-stone-400">AI visuals are never used in news. Every recreation is labelled. The archive of these pieces is a permanent asset — resurfaced on anniversaries, compiled, licensed.</p></div>
      </div>
    </Slide>,
    <Slide key={9} n={9} kicker="How money comes in" line="Local ads, events, government, elections, production.">
      <div className="grid md:grid-cols-3 gap-4">
        {data.rateCards.map((rc) => (
          <div key={rc.tier} className={`rounded-xl border p-4 ${rc.tier === "taluk" ? "border-amber-300 bg-amber-50" : "border-stone-200"}`}>
            <div className="text-xs uppercase tracking-wide text-stone-500">{rc.tier} rate card</div>
            {rc.slots.length === 0 ? <p className="text-sm text-stone-500 mt-2">Prices set at launch of this tier.</p> : (
              <table className="w-full text-sm mt-2"><tbody>{rc.slots.map((s) => <tr key={s.slot} className="border-b border-stone-200/60"><td className="py-1 pr-2">{s.slot}<div className="text-[11px] text-stone-500">{s.sold_as}</div></td><td className="py-1 text-right font-medium whitespace-nowrap">{inr(s.price)}</td></tr>)}</tbody></table>
            )}
          </div>
        ))}
      </div>
      <p className="text-sm text-stone-500 mt-4">One central desk sells all 240 taluks to agencies and government — <b>we are creating inventory that does not exist</b>. Fixed rate card, no discounting, no cash, no paid news, political packages certified centrally.</p>
    </Slide>,
    <Slide key={10} n={10} kicker="Why this scales" line="Adding a taluk is repeatable; the engine is already built.">
      <div className="grid md:grid-cols-2 gap-8">
        <div><h3 className="font-semibold mb-2">One taluk at maturity, per month</h3><table className="w-full text-sm"><tbody>
          {data.revenue.map((r) => <tr key={r.line} className="border-b border-stone-100"><td className="py-1.5">{r.line}<div className="text-[11px] text-stone-500">{r.basis}</div></td><td className="py-1.5 text-right">{inr(r.monthly)}</td></tr>)}
          <tr className="font-semibold"><td className="py-1.5">Revenue</td><td className="py-1.5 text-right">{inr(monthlyRevenue)}</td></tr>
          <tr><td className="py-1.5">Taluk unit cost</td><td className="py-1.5 text-right">− {inr(data.unitCost)}</td></tr>
          <tr className="font-semibold text-green-800"><td className="py-1.5">Margin per taluk</td><td className="py-1.5 text-right">{inr(margin)}</td></tr>
        </tbody></table></div>
        <div>
          <h3 className="font-semibold mb-2">Then multiply</h3>
          <div className="flex gap-2 mb-3">{(["lean", "middle", "five"] as Variant[]).map((v) => <button key={v} onClick={() => setVariant(v)} className={`btn ${variant === v ? "btn-primary" : ""}`}>{VARIANT_LABEL[v]}</button>)}</div>
          <div className="text-sm text-stone-600">Central cost ({VARIANT_LABEL[variant]}): <b>{inr(centralMonthly)}/mo</b></div>
          <div className="grid grid-cols-6 gap-2 mt-3">{[1, 2, 3, 4, 5, 6].map((n) => { const net = n * margin - centralMonthly; return <div key={n} className={`rounded-lg p-2 text-center border ${net >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}><div className="text-xs text-stone-500">{n} taluk{n > 1 ? "s" : ""}</div><div className={`text-sm font-semibold ${net >= 0 ? "text-green-800" : "text-red-800"}`}>{net >= 0 ? "+" : "−"}{inr(Math.abs(net))}</div></div>; })}</div>
          <p className="text-sm mt-3">Network breaks even at <b>{breakEvenTaluks} taluk{breakEvenTaluks > 1 ? "s" : ""}</b> on this budget. 240 taluks is ~480 field people and one engine.</p>
        </div>
      </div>
    </Slide>,
    <Slide key={11} n={11} kicker="The pilot" line="Sagara, six months, real numbers, then we replicate.">
      <div className="grid md:grid-cols-6 gap-2 text-sm">
        {[["Month 1", "Launch. Publish every day. No audience yet — nobody buys."], ["Month 2", "Audience building. First advertiser conversations, free founding month."], ["Month 3", "Checkpoint: publishing daily? turnaround <48h? ten paying advertisers? second-month renewals?"], ["Month 4–5", "Taluk unit covers its own cost."], ["Month 6", "Full picture for the network decision: replicate, fix, or stop."], ["Then", "Taluk two in the same district. Agency desk opens."]].map(([h, p], k) => (
          <div key={h} className={`rounded-xl border p-3 ${k === 2 ? "bg-amber-50 border-amber-300" : "bg-stone-50 border-stone-200"}`}><div className="font-semibold">{h}</div><p className="text-xs text-stone-700 mt-1">{p}</p></div>
        ))}
      </div>
      <div className="mt-8 grid md:grid-cols-2 gap-6 text-sm text-stone-700">
        <div className="card"><b>Why six months, not three.</b> Promising break-even at three means arriving there having missed your own projection. Six months, hit at four, makes you the founder who beat his plan.</div>
        <div className="card"><b>Risks, unprompted.</b> A missed day · the central studio as bottleneck · advertisers leaning on coverage · election law · copyright strikes · defamation · AI mistaken for footage · the engine costs more than the taluk. Each has a named mitigation in the plan.</div>
      </div>
    </Slide>,
    <Slide key={12} n={12} kicker="The ask" line="What we need, what it buys, what it reaches." dark>
      <div className="grid md:grid-cols-3 gap-4">
        {(["lean", "middle", "five"] as Variant[]).map((v) => (
          <button key={v} onClick={() => setVariant(v)} className={`text-left rounded-xl border p-5 transition ${variant === v ? "bg-amber-400 text-stone-950 border-amber-400" : "bg-stone-900 border-stone-800 text-stone-200 hover:border-stone-600"}`}>
            <div className="text-xs uppercase tracking-wide opacity-70">{VARIANT_LABEL[v]}</div>
            <div className="text-3xl font-bold mt-1">{inr(data.budget[v])}</div>
            <div className="text-xs mt-1 opacity-80">six-month pilot, one taluk</div>
          </button>
        ))}
      </div>
      <table className="w-full text-sm mt-6"><tbody>
        {data.budget.lines.map((l) => <tr key={l.line} className="border-b border-stone-800"><td className="py-1.5 text-stone-300">{l.line}</td><td className="py-1.5 text-right text-stone-100">{l[variant] == null ? "—" : inr(l[variant] as number)}</td></tr>)}
      </tbody></table>
      <p className="text-stone-400 text-sm mt-6">In return: one taluk running every day for six months with real audience and revenue numbers; the engine, playbook and archive built; first right on the network round. The broken road becomes visible; the history is recorded before it goes.</p>
    </Slide>,
  ];

  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(slides.length - 1, x + d))), [slides.length]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") go(1); if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1); if (e.key === "Home") setI(0); if (e.key === "End") setI(slides.length - 1); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [go, slides.length]);

  return (
    <div className="fixed inset-0 bg-stone-200 flex flex-col">
      <div className="flex-1 min-h-0">{slides[i]}</div>
      <div className="h-12 bg-stone-900 text-stone-300 text-xs flex items-center justify-between px-4">
        <div className="flex items-center gap-3"><Link href="/" className="hover:text-white">← {data.brand}</Link><span className="text-stone-600">|</span><span>Taluk Channel Network · investor deck</span></div>
        <div className="flex items-center gap-1">{slides.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-amber-400" : "w-1.5 bg-stone-600 hover:bg-stone-400"}`} />)}</div>
        <div className="flex items-center gap-2"><button onClick={() => go(-1)} className="px-2 py-1 rounded hover:bg-stone-800">←</button><span className="tabular-nums">{i + 1} / {slides.length}</span><button onClick={() => go(1)} className="px-2 py-1 rounded hover:bg-stone-800">→</button></div>
      </div>
    </div>
  );
}
