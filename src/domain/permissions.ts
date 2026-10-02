import type { Role } from "./constants";

export type Permission =
  | "ops.view" | "lineup.confirm" | "story.create" | "story.assign" | "capture.log"
  | "script.write" | "script.approve" | "script.approve_political" | "asset.attach" | "asset.clear"
  | "story.publish" | "creator.manage" | "sales.manage" | "payment.record" | "ratecard.edit"
  | "decision.edit" | "unblock.log" | "analytics.view" | "equipment.check" | "export.csv" | "policy.edit";

const ALL: Permission[] = [
  "ops.view", "lineup.confirm", "story.create", "story.assign", "capture.log", "script.write", "script.approve",
  "script.approve_political", "asset.attach", "asset.clear", "story.publish", "creator.manage", "sales.manage",
  "payment.record", "ratecard.edit", "decision.edit", "unblock.log", "analytics.view", "equipment.check", "export.csv", "policy.edit",
];

export const PERMISSIONS: Record<Role, Permission[]> = {
  founder: ALL,
  content_head: ["ops.view", "story.create", "story.assign", "script.approve", "script.approve_political", "asset.attach", "asset.clear", "creator.manage", "decision.edit", "analytics.view", "export.csv", "policy.edit"],
  scriptwriter_daily: ["ops.view", "script.write", "asset.attach"],
  scriptwriter_rewriter: ["ops.view", "script.write", "asset.attach"],
  editor: ["ops.view", "asset.attach"],
  ai_visuals: ["ops.view", "asset.attach"],
  production_desk: ["ops.view", "lineup.confirm", "story.create", "story.assign", "asset.attach", "story.publish", "unblock.log", "analytics.view", "export.csv"],
  sales: ["ops.view", "sales.manage", "payment.record", "analytics.view", "export.csv"],
  taluk_editor: ["ops.view", "lineup.confirm", "story.create", "capture.log", "equipment.check", "creator.manage"],
  field_operator: ["ops.view", "capture.log", "equipment.check"],
  district: ["ops.view", "story.create", "capture.log"],
  investor: ["ops.view", "analytics.view"],
};

export function can(role: Role, p: Permission): boolean {
  return PERMISSIONS[role]?.includes(p) ?? false;
}

export function assertCan(role: Role, p: Permission): void {
  if (!can(role, p)) throw new Error(`Role "${role}" is not allowed to ${p}`);
}
