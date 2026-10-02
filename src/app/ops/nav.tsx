"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/ops", label: "Today", group: "Daily" },
  { href: "/ops/lineup", label: "Lineup & stories", group: "Daily" },
  { href: "/ops/captures", label: "Capture log", group: "Daily" },
  { href: "/ops/scripts", label: "Scripts & voice", group: "Daily" },
  { href: "/ops/clearance", label: "Footage clearance", group: "Daily" },
  { href: "/ops/creators", label: "Creators & consents", group: "Daily" },
  { href: "/ops/sales", label: "Advertisers & contracts", group: "Money" },
  { href: "/ops/sales/rate-card", label: "Rate card", group: "Money" },
  { href: "/ops/sales/validation", label: "25 × ₹3,000 worksheet", group: "Money" },
  { href: "/ops/archive", label: "Identity archive", group: "Library" },
  { href: "/ops/analytics", label: "Analytics & month-3", group: "Review" },
  { href: "/ops/decisions", label: "Decisions & unblocks", group: "Review" },
  { href: "/ops/budget", label: "Budget", group: "Review" },
  { href: "/ops/policy", label: "Rules & roles", group: "Review" },
];

export function NavLinks() {
  const path = usePathname();
  return (
    <nav className="p-2 text-sm">
      {NAV.map((n, idx) => {
        const header = idx === 0 || NAV[idx - 1].group !== n.group ? n.group : null;
        const active = n.href === "/ops" ? path === "/ops" : path.startsWith(n.href) && (n.href !== "/ops/sales" || path === "/ops/sales");
        return (
          <div key={n.href}>
            {header && <div className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-widest text-stone-400">{header}</div>}
            <Link href={n.href} className={`block rounded px-2 py-1.5 ${active ? "bg-stone-900 text-white" : "hover:bg-stone-100"}`}>
              {n.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
