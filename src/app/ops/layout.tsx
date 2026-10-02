import Link from "next/link";
import type { ReactNode } from "react";
import { currentUser } from "@/lib/session";
import { users, taluk } from "@/db/queries";
import { ROLE_LABEL, type Role } from "@/domain/constants";
import { switchUser } from "./actions";
import { NavLinks } from "./nav";

export const dynamic = "force-dynamic";

export default async function OpsLayout({ children }: { children: ReactNode }) {
  const me = await currentUser();
  const all = users();
  const t = taluk();
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-stone-200 bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-stone-200">
          <Link href="/ops" className="block">
            <div className="text-[11px] uppercase tracking-widest text-stone-500">Taluk Channel Network</div>
            <div className="text-lg font-semibold leading-tight">{t.brand_name} · Ops</div>
          </Link>
          <div className="mt-1 text-xs text-stone-500">{t.name} taluk, {t.district} · cutoff {t.cutoff_time}</div>
        </div>
        <NavLinks />
        <div className="mt-auto border-t border-stone-200 p-3 text-xs">
          <div className="text-stone-500 mb-1">Acting as</div>
          <form action={switchUser} className="grid gap-1">
            <select name="user_id" defaultValue={me.id} className="input text-xs">
              {all.map((u) => (
                <option key={u.id} value={u.id}>{u.name} — {ROLE_LABEL[u.role as Role]}</option>
              ))}
            </select>
            <button className="btn text-xs justify-center">Switch role</button>
          </form>
          <div className="mt-2 text-[11px] text-stone-400">Demo auth. Permissions are enforced server-side per role.</div>
          <div className="mt-2 flex gap-2 text-[11px]">
            <Link className="underline" href="/">Public page</Link>
            <Link className="underline" href="/deck">Deck</Link>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-6 max-w-7xl">{children}</main>
    </div>
  );
}
