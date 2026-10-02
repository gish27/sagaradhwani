export function inr(n: number | null | undefined, opts: { compact?: boolean } = {}): string {
  if (n == null) return "—";
  if (opts.compact) {
    if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")} Cr`;
    if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2).replace(/\.?0+$/, "")} L`;
  }
  return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

export function pct(n: number, digits = 0): string {
  return `${(n * 100).toFixed(digits)}%`;
}

const IST = "Asia/Kolkata";

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: IST }).format(new Date(iso));
}

export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: IST }).format(new Date(iso));
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return `${fmtDate(iso)} ${fmtTime(iso)}`;
}

export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(new Date());
}

export function monthLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(new Date(Date.UTC(y, m - 1, 1)));
}

export function hours(h: number | null | undefined): string {
  if (h == null) return "—";
  return `${h}h`;
}

export function parseJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}
