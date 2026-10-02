import Link from "next/link";
import { DEMO_DATE } from "@/db/seed";
import { advertisers, archive, assetsFor, publishedStories, scriptsFor, storiesForDate, taluk, type Story } from "@/db/queries";
import { BRAND, BUCKETS, LAYERS } from "@/domain/constants";
import { fmtDate, fmtTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const SLOT_TIME: Record<string, string> = { Morning: "7:00", "Mid-day": "12:30", Afternoon: "16:00", Evening: "18:30", Anytime: "—" };

function StoryCard({ s, big }: { s: Story; big?: boolean }) {
  const ad = s.paid && s.advertiser_id ? advertisers().find((a) => a.id === s.advertiser_id) : null;
  const assets = assetsFor(s.id);
  const ai = assets.some((a) => a.ai_generated);
  const script = scriptsFor(s.id)[0];
  return (
    <article className={`rounded-xl border border-stone-200 bg-white overflow-hidden ${big ? "md:col-span-2" : ""}`}>
      <div className={`${big ? "aspect-[21/9]" : "aspect-video"} bg-gradient-to-br ${s.layer === "identity" ? "from-amber-200 via-orange-100 to-stone-100" : s.layer === "participation" ? "from-emerald-100 to-stone-100" : "from-stone-800 to-stone-600"} relative flex items-end p-4`}>
        <div className="flex gap-2 flex-wrap">
          <span className={`text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full ${s.layer === "daily_pulse" ? "bg-white/90 text-stone-800" : "bg-stone-900/80 text-white"}`}>{LAYERS[s.layer].label}{s.bucket ? ` · ${BUCKETS[s.bucket as keyof typeof BUCKETS]?.label ?? s.bucket}` : ""}</span>
          {s.paid ? <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-yellow-300 text-yellow-950 font-semibold">Paid{ad ? ` · ${ad.business}` : ""}</span> : null}
          {ai ? <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-violet-200 text-violet-900">AI recreation</span> : null}
          {s.source === "state_retold" ? <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-sky-100 text-sky-900">State story, retold for Sagara</span> : null}
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs text-stone-500 mb-1">{s.slot ?? ""}{s.published_at ? ` · ${fmtTime(s.published_at)}` : ""}</div>
        <h3 className={`font-semibold leading-snug ${big ? "text-xl" : "text-base"}`}>{s.title}</h3>
        {s.summary && <p className="text-sm text-stone-600 mt-2">{s.summary}</p>}
        {script?.body_kn && <p className="kn text-sm text-stone-700 mt-3 border-l-2 border-amber-400 pl-3 line-clamp-3">{script.body_kn}</p>}
        {assets.some((a) => a.credit_on_screen && a.source_name) && (
          <div className="text-[11px] text-stone-500 mt-3">Footage: {assets.filter((a) => a.credit_on_screen && a.source_name).map((a) => a.source_name).join(", ")}</div>
        )}
      </div>
    </article>
  );
}

export default function PublicPage() {
  const t = taluk();
  const date = DEMO_DATE;
  const today = storiesForDate(date).filter((s) => s.status === "published");
  const recent = publishedStories(t.id).filter((s) => s.date !== date).slice(0, 4);
  const identity = archive().slice(0, 6);
  const sponsors = advertisers().filter((a) => a.status === "active").slice(0, 8);
  const lead = today.find((s) => s.layer === "daily_pulse") ?? today[0];
  const rest = today.filter((s) => s.id !== lead?.id);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-bold tracking-tight">{t.brand_name} <span className="kn font-normal text-stone-500 text-lg">ಸಾಗರ ಧ್ವನಿ</span></div>
            <div className="text-xs text-stone-500">{t.name} taluk, {t.district} · part of the {BRAND.network} · one full day, every day at {t.publish_time}</div>
          </div>
          <nav className="text-sm flex gap-4 text-stone-600">
            <a href="#today" className="hover:text-stone-900">Today</a>
            <a href="#identity" className="hover:text-stone-900">Our story</a>
            <a href="#participate" className="hover:text-stone-900">Participate</a>
            <Link href="/ops" className="hover:text-stone-900">Ops →</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <section id="today">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold">Today in Sagara</h1>
              <div className="text-sm text-stone-500">{fmtDate(date)} · {today.length} pieces published</div>
            </div>
            <div className="text-xs text-stone-500 hidden md:block">Morning {SLOT_TIME.Morning} · Mid-day {SLOT_TIME["Mid-day"]} · Afternoon {SLOT_TIME.Afternoon} · Evening {SLOT_TIME.Evening}</div>
          </div>
          {today.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-stone-500">Nothing published yet today. The desk publishes at {t.publish_time}.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {lead && <StoryCard s={lead} big />}
              {rest.map((s) => <StoryCard key={s.id} s={s} />)}
            </div>
          )}
        </section>

        {recent.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold mb-4">Yesterday and before</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">{recent.map((s) => <StoryCard key={s.id} s={s} />)}</div>
          </section>
        )}

        <section id="identity" className="mt-12">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Sagara&apos;s story</h2>
              <div className="text-sm text-stone-500">History, people, places and festivals — the pieces that stay. Recreations are labelled; nothing here is presented as footage of the past.</div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {identity.map((a) => (
              <div key={a.id} className="rounded-xl border border-stone-200 bg-white p-4">
                <div className="text-[11px] uppercase tracking-wide text-amber-700">{BUCKETS[a.bucket as keyof typeof BUCKETS]?.label ?? a.bucket}{a.era ? ` · ${a.era}` : ""}</div>
                <div className="font-medium mt-1">{a.title}</div>
                <p className="text-sm text-stone-600 mt-1 line-clamp-3">{a.summary}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="participate" className="mt-12 grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 md:col-span-2">
            <h2 className="text-lg font-semibold">Send us your Sagara</h2>
            <p className="text-sm text-stone-700 mt-1">A road that needs fixing, a festival in your village, a person everyone should know. Send a clip or a question on WhatsApp. If we use your footage we credit you on screen and we ask your permission first — always.</p>
            <div className="mt-3 text-sm"><span className="font-mono bg-white border border-emerald-200 rounded px-2 py-1">WhatsApp · +91 ·· ··· ····</span> <span className="text-stone-500 ml-2">Citizen question of the week is answered every Friday.</span></div>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 p-5">
            <h2 className="text-sm font-semibold">Advertise with us</h2>
            <p className="text-xs text-stone-600 mt-1">Reach Sagara every day. Monthly slots, category exclusivity for sponsored segments, labelled paid stories. First month free for founding advertisers.</p>
            {sponsors.length > 0 && <div className="mt-3 text-[11px] text-stone-500">Supported by {sponsors.map((a) => a.business).join(" · ")}</div>}
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 mt-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6 text-xs text-stone-500 flex flex-wrap gap-4 justify-between">
          <div>{t.brand_name} · {BRAND.network} · {BRAND.ethos}</div>
          <div className="flex gap-4"><Link href="/policy" className="hover:text-stone-900">Editorial &amp; ad policy</Link><Link href="/privacy" className="hover:text-stone-900">Privacy</Link><Link href="/terms" className="hover:text-stone-900">Terms</Link><Link href="/deck" className="hover:text-stone-900">Deck</Link></div>
        </div>
      </footer>
    </div>
  );
}
