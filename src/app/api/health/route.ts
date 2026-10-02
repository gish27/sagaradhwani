import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { DEMO_DATE } from "@/db/seed";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    const row = getDb().prepare("SELECT COUNT(*) AS c FROM story").get() as { c: number };
    return NextResponse.json({ ok: true, service: "tcn-ops", demoDate: DEMO_DATE, stories: row.c, time: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
