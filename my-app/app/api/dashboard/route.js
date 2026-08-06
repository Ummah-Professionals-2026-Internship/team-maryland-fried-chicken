import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [
  totalRes,
  pendingRes,
  activeRes,
  completedRes,
  matchedRes,
  advisorsRes,
  recentRes,
] = await Promise.all([
  // Total applicants
  supabase.from("applicants").select("id", { count: "exact", head: true }),

  // Pending Review + Recommendations Generated
  supabase.from("applicants").select("id", { count: "exact", head: true })
    .in("status", ["Pending Review", "Recommendations Generated"]),

  // Active Cases: Matched + Follow Up
  supabase.from("applicants").select("id", { count: "exact", head: true })
    .in("status", ["Matched", "Follow Up"]),

  // Completed Cases: Closed
  supabase.from("applicants").select("id", { count: "exact", head: true })
    .eq("status", "Closed"),

  // Matched only — kept for the Completion Rate card
  supabase.from("applicants").select("id", { count: "exact", head: true })
    .eq("status", "Matched"),

  // Available advisors — kept for Quick Navigation
  supabase.from("advisors").select("id", { count: "exact", head: true })
    .eq("availability_status", "Available"),

  // Recent submissions
  supabase.from("applicants")
    .select("id, first_name, last_name, industry, status, created_at")
    .order("created_at", { ascending: false })
    .limit(6),
  ]);

  for (const r of [totalRes, pendingRes, activeRes, completedRes, matchedRes, advisorsRes, recentRes]) {
    if (r.error) throw r.error;
  }

  const formattedApplicants = (recentRes.data ?? []).map((a) => ({
    id: a.id,
    name: `${a.first_name || ""} ${a.last_name || ""}`.trim() || "Anonymous",
    occupation_field: a.industry || "N/A",
    status: a.status,
    created_at: a.created_at,
  }));

  return NextResponse.json({
    totalCount: totalRes.count ?? 0,
    pendingCount: pendingRes.count ?? 0,
    activeCount: activeRes.count ?? 0,
    completedCount: completedRes.count ?? 0,
    matchedCount: matchedRes.count ?? 0,
    availableAdvisors: advisorsRes.count ?? 0,
    recentUnmatchedApplicants: formattedApplicants,
  });

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load dashboard metrics",
        details: error.message,
      },
      { status: 500 }
    );
  }
}