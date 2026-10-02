"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionState } from "@/app/ops/actions";

type Action = (state: ActionState, fd: FormData) => Promise<ActionState>;

export function ActionForm({ action, children, className, submit = "Save", danger, inline }: {
  action: Action; children?: ReactNode; className?: string; submit?: string; danger?: boolean; inline?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className={className ?? (inline ? "flex flex-wrap items-end gap-2" : "grid gap-3")}>
      {children}
      <div className={inline ? "flex items-center gap-2" : "flex items-center gap-3"}>
        <button type="submit" disabled={pending} className={`btn ${danger ? "border-red-300 text-red-700 hover:bg-red-50" : "btn-primary"}`}>
          {pending ? "…" : submit}
        </button>
        {state && (
          <span className={`text-xs ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.message}</span>
        )}
      </div>
    </form>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-xs font-medium text-stone-600">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-stone-500">{hint}</span>}
    </label>
  );
}

export function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4" />
      <span>{label}</span>
    </label>
  );
}
