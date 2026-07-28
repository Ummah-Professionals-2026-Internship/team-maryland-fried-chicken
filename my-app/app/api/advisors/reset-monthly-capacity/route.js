import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

// POST /api/advisors/reset-monthly-capacity
//
// Resets currentAssignments to 0 for every advisor, starting a fresh
// monthly mentoring cycle. Historical match records are not affected.
//
// This endpoint is the manual trigger / fallback for the Supabase pg_cron
// job defined in migrations/monthly_capacity_reset.sql, which runs
// automatically at 12:00 AM UTC on the 1st of every calendar month.
//
// It can also be called manually by an admin if a reset is ever needed
// outside the normal schedule.
//
// Protected by a shared secret (RESET_SECRET env var) to prevent
// unauthorized calls. Set RESET_SECRET in .env and pass it as the
// Authorization header: "Bearer <secret>".
export async function POST(request) {
  // ── Authorization ──────────────────────────────────────────────────────────
  const resetSecret = process.env.RESET_SECRET;

  if (resetSecret) {
    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (token !== resetSecret) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("advisors")
    .update({ currentAssignments: 0 })
    .neq("currentAssignments", 0) // only touch rows that actually need updating
    .select("id");

  if (error) {
    console.error("[reset-monthly-capacity] Reset failed:", error.message);
    return NextResponse.json(
      { error: `Reset failed: ${error.message}` },
      { status: 500 },
    );
  }

  const resetCount = data?.length ?? 0;

  console.log(
    `[reset-monthly-capacity] Reset complete — ${resetCount} advisor(s) had their currentAssignments set to 0.`
  );

  return NextResponse.json(
    {
      message: "Monthly capacity reset complete.",
      advisorsReset: resetCount,
      resetAt: new Date().toISOString(),
    },
    { status: 200 },
  );
}
