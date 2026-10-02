import type { Role } from "./constants";

export class RuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuleError";
  }
}

export type Tier = "green" | "amber" | "red";
export type ClearanceStatus = "n/a" | "pending" | "cleared" | "rejected";

export interface StoryLike {
  layer: "daily_pulse" | "identity" | "participation";
  status: string;
  political: number;
  paid: number;
  advertiser_id: string | null;
  cutoff_at: string | null;
}

export interface AssetLike {
  tier: Tier;
  ai_generated: number;
  clearance_status: ClearanceStatus;
}

/** Rule: red footage can never attach. AI visuals never in daily pulse. */
export function assertAssetCanAttach(story: StoryLike, asset: Pick<AssetLike, "tier" | "ai_generated">): void {
  if (asset.tier === "red") throw new RuleError("Red-tier footage cannot be attached to any story. Recreate, license, or shoot our own.");
  if (asset.ai_generated && story.layer === "daily_pulse")
    throw new RuleError("AI-generated visuals are never allowed inside a news (daily pulse) story.");
}

/** Initial clearance status for a new asset by tier. */
export function initialClearance(tier: Tier): ClearanceStatus {
  return tier === "amber" ? "pending" : "n/a";
}

/** Rule: only production desk / founder publish; amber assets must be cleared first; paid needs advertiser. */
export function assertCanPublish(role: Role, story: StoryLike, assets: AssetLike[]): void {
  if (role !== "production_desk" && role !== "founder")
    throw new RuleError("Only the production desk owner (or founder) presses publish.");
  if (story.status === "published") throw new RuleError("Story is already published.");
  if (story.status === "killed") throw new RuleError("A killed story cannot be published.");
  if (!["approved", "produced"].includes(story.status))
    throw new RuleError(`Story must be approved before publishing (currently "${story.status}").`);
  const blocking = assets.filter((a) => a.tier === "amber" && a.clearance_status !== "cleared");
  if (blocking.length)
    throw new RuleError(`${blocking.length} amber asset(s) not yet cleared by the central desk.`);
  if (assets.some((a) => a.tier === "red")) throw new RuleError("Story carries red-tier footage.");
  if (story.paid && !story.advertiser_id) throw new RuleError("A paid story must name its advertiser and carry the Paid label.");
}

/** Rule: political approval requires content head (or founder). */
export function assertCanApproveScript(role: Role, story: StoryLike): void {
  if (story.political && role !== "content_head" && role !== "founder")
    throw new RuleError("Political scripts need the content head's approval.");
  if (!story.political && !["content_head", "founder", "scriptwriter_rewriter"].includes(role))
    throw new RuleError("Script approval is a central desk function.");
}

/** Rule: footage after cutoff rolls to the next day unless it is one of the few true breaking stories. */
export function shouldRoll(footageInAt: Date, cutoffAt: Date, isBreaking: boolean): boolean {
  return footageInAt > cutoffAt && !isBreaking;
}

/** Turnaround in hours = published_at − footage_in_at. */
export function turnaroundHours(footageInAt: string | null, publishedAt: string | null): number | null {
  if (!footageInAt || !publishedAt) return null;
  return Math.round(((new Date(publishedAt).getTime() - new Date(footageInAt).getTime()) / 36e5) * 10) / 10;
}

export interface ContractInput {
  months: number;
  price_inr: number | null;
  free_month: boolean;
  political: boolean;
  mcmc_cert_ref?: string | null;
  paid_for_by?: string | null;
}

/** Rules: ≥1 month, no discounting, price must be set, political needs certificate + paid-for-by. */
export function computeContractValue(input: ContractInput): number {
  if (input.months < 1) throw new RuleError("Minimum sale is one month.");
  if (input.price_inr == null) throw new RuleError("Rate card price for this slot is not set — set the rate card before selling.");
  if (input.political && (!input.mcmc_cert_ref || !input.paid_for_by))
    throw new RuleError("Political advertising needs an MCMC pre-certification reference and a 'paid for by' line.");
  if (input.free_month) return 0;
  return input.price_inr * input.months;
}

export const ALLOWED_PAYMENT_METHODS = ["bank_transfer", "upi", "cheque"] as const;
export function assertPaymentMethod(method: string): asserts method is (typeof ALLOWED_PAYMENT_METHODS)[number] {
  if (!(ALLOWED_PAYMENT_METHODS as readonly string[]).includes(method))
    throw new RuleError("Cash is not accepted. Every rupee goes through the company's bank account.");
}

/** Rule: no advertiser from a prohibited category. */
export function assertAdvertiserAllowed(prohibitedCheck: string | null, centralDecision: string | null, categoryNeedsCentral: boolean) {
  if (prohibitedCheck !== "pass") throw new RuleError("Advertiser has not passed the prohibited-category check.");
  if (categoryNeedsCentral && !centralDecision) throw new RuleError("This category needs a central screening decision.");
}

/** Month-3 checkpoint evaluation, per plan §14. */
export interface Month3Input {
  publishingDays: number;
  elapsedDays: number;
  payingAdvertisers: number;
  payingAdvertisersPaidTwice: number;
  avgTurnaroundHours: number | null;
  medianTurnaroundHours: number | null;
}
export function month3Verdict(m: Month3Input) {
  const consistency = m.elapsedDays > 0 ? m.publishingDays / m.elapsedDays : 0;
  const checks = [
    { label: "Publishing every day (≥95% of days)", ok: consistency >= 0.95, value: `${Math.round(consistency * 100)}%` },
    { label: "Turnaround under 48 hours (average)", ok: m.avgTurnaroundHours != null && m.avgTurnaroundHours < 48, value: m.avgTurnaroundHours == null ? "—" : `${m.avgTurnaroundHours}h` },
    { label: "Ten or more paying advertisers", ok: m.payingAdvertisers >= 10, value: String(m.payingAdvertisers) },
    { label: "Advertisers paying a second month", ok: m.payingAdvertisersPaidTwice >= 5, value: String(m.payingAdvertisersPaidTwice) },
  ];
  const passed = checks.filter((c) => c.ok).length;
  const verdict = passed === checks.length ? "continue" : passed >= 2 ? "fix_and_continue" : "stop_and_rethink";
  return { checks, passed, verdict } as const;
}
