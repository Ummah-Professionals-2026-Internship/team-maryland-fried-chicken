import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [
      matchedRes,
      totalRes,
      advisorsRes,
      recentRes,
    ] = await Promise.all([
      // Matched applicants
      supabase
        .from("applicants")
        .select("id", { count: "exact", head: true })
        .eq("status", "Matched"),

      // Total applicants
      supabase
        .from("applicants")
        .select("id", { count: "exact", head: true }),

      // Available advisors
      supabase
        .from("advisors")
        .select("id", { count: "exact", head: true })
        .eq("availability_status", "Available"),

      // Latest applicants still waiting
      supabase
        .from("applicants")
        .select("id, first_name, last_name, industry, status, created_at")
        .neq("status", "Matched")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    if (matchedRes.error) throw matchedRes.error;
    if (totalRes.error) throw totalRes.error;
    if (advisorsRes.error) throw advisorsRes.error;
    if (recentRes.error) throw recentRes.error;

    const totalCount = totalRes.count ?? 0;
    const matchedCount = matchedRes.count ?? 0;

    // Map DB column names to UI wireframe expectations (first_name + last_name -> name, industry -> occupation_field)
    const formattedApplicants = (recentRes.data ?? []).map((a) => ({
      id: a.id,
      name: `${a.first_name || ""} ${a.last_name || ""}`.trim() || "Anonymous",
      occupation_field: a.industry || "N/A",
      status: a.status,
      created_at: a.created_at,
    }));

    return NextResponse.json({
      totalCount,
      matchedCount,
      awaitingCount: totalCount - matchedCount,
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