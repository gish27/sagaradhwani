import type { ReactNode } from "react";

export function Chip({ tone = "stone", children }: { tone?: "stone" | "green" | "amber" | "red" | "blue" | "violet" | "saffron"; children: ReactNode }) {
  const map = {
    stone: "bg-stone-100 text-stone-700",
    green: "bg-green-100 text-green-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-sky-100 text-sky-800",
    violet: "bg-violet-100 text-violet-800",
    saffron: "bg-orange-100 text-orange-800",
  };
  return <span className={`chip ${map[tone]}`}>{children}</span>;
}

export function StatusChip({ status }: { status: string }) {
  const tone: Record<string, Parameters<typeof Chip>[0]["tone"]> = {
    idea: "stone", assigned: "blue", captured: "blue", scripted: "violet", approved: "green", produced: "green", published: "green", killed: "red", rolled: "amber",
    pending: "amber", cleared: "green", rejected: "red", "n/a": "stone",
    prospect: "stone", free_month: "blue", active: "green", lapsed: "amber", blocked: "red",
    paid: "green", issued: "blue", overdue: "red", draft: "stone", void: "stone",
    decided: "green", open: "amber",
  };
  return <Chip tone={tone[status] ?? "stone"}>{status.replace("_", " ")}</Chip>;
}

export function TierChip({ tier }: { tier: "green" | "amber" | "red" }) {
  return <Chip tone={tier}>{tier}</Chip>;
}

export function LayerChip({ layer }: { layer: string }) {
  const label: Record<string, string> = { daily_pulse: "Daily pulse", identity: "Identity", participation: "Participation" };
  const tone: Record<string, Parameters<typeof Chip>[0]["tone"]> = { daily_pulse: "blue", identity: "saffron", participation: "violet" };
  return <Chip tone={tone[layer] ?? "stone"}>{label[layer] ?? layer}</Chip>;
}

export function Stat({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "ok" | "warn" | "bad" }) {
  const color = tone === "ok" ? "text-green-700" : tone === "warn" ? "text-amber-700" : tone === "bad" ? "text-red-700" : "text-stone-900";
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-stone-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-stone-500">{hint}</div>}
    </div>
  );
}

export function PageHeader({ title, sub, children }: { title: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-stone-600 max-w-3xl">{sub}</p>}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}

export function Section({ title, sub, children, right }: { title: string; sub?: ReactNode; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="card mb-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {sub && <p className="text-xs text-stone-500 mt-0.5">{sub}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-md border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">{children}</div>;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "error" | "ok"; children: ReactNode }) {
  const map = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-900",
    ok: "border-green-200 bg-green-50 text-green-900",
  };
  return <div className={`rounded-md border px-3 py-2 text-sm ${map[tone]}`}>{children}</div>;
}
