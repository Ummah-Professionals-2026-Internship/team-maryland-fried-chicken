import { NextResponse } from "next/server";
import { getAllAdvisors } from "@/lib/advisorService";

// Matches the CHECK constraints on the advisors table (migrations/init.sql)
const ALLOWED_AVAILABILITY = ["Available", "Unavailable"];
const ALLOWED_RELIABILITY = ["High", "Medium", "Low"];

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function toSummary(advisor) {
  const name = [advisor.first_name, advisor.last_name].filter(Boolean).join(" ");
  const maxMonthlyAssignments = Number(advisor.max_meetings_per_month ?? 0);
  const currentMonthlyAssignments = Number(advisor.currentAssignments ?? 0);

  return {
    advisorId: advisor.id,
    advisorName: name,
    jobTitle: advisor.job_title ?? "",
    company: advisor.company ?? "",
    industry: advisor.industry ?? "",
    experienceLevel: advisor.experience_level ?? "",
    gender: advisor.gender ?? "",
    availabilityStatus: advisor.availability_status ?? "",
    reliabilityLevel: advisor.reliability_level ?? "",
    currentMonthlyAssignments,
    maxMonthlyAssignments,
    remainingCapacity: Math.max(0, maxMonthlyAssignments - currentMonthlyAssignments),
  };
}

// GET /api/advisors/search
// Query params (all optional):
//   q            - free text, matched against name / job title / company
//   industry     - exact match
//   availability - exact match ("Available" | "Unavailable")
//   reliability  - exact match ("High" | "Medium" | "Low")
//   gender       - exact match (case-insensitive; advisors.gender has no fixed enum)
//
// Only advisors with remaining monthly capacity (currentAssignments < max_meetings_per_month)
// are considered eligible for manual matching and returned here.
export async function GET(request) {
  const params = new URL(request.url).searchParams;

  const q = normalize(params.get("q"));
  const industry = params.get("industry") ?? "";
  const availability = params.get("availability") ?? "";
  const reliability = params.get("reliability") ?? "";
  const gender = normalize(params.get("gender"));

  if (availability && !ALLOWED_AVAILABILITY.includes(availability)) {
    return NextResponse.json(
      { error: `availability must be one of: ${ALLOWED_AVAILABILITY.join(", ")}` },
      { status: 400 },
    );
  }

  if (reliability && !ALLOWED_RELIABILITY.includes(reliability)) {
    return NextResponse.json(
      { error: `reliability must be one of: ${ALLOWED_RELIABILITY.join(", ")}` },
      { status: 400 },
    );
  }

  const { data: advisors, error } = await getAllAdvisors();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const eligible = (advisors ?? []).filter((advisor) => {
    const max = Number(advisor.max_meetings_per_month ?? 0);
    const current = Number(advisor.currentAssignments ?? 0);
    return max - current > 0;
  });

  const filtered = eligible.filter((advisor) => {
    if (industry && advisor.industry !== industry) return false;
    if (availability && advisor.availability_status !== availability) return false;
    if (reliability && advisor.reliability_level !== reliability) return false;
    if (gender && normalize(advisor.gender) !== gender) return false;

    if (q) {
      const haystack = [
        advisor.first_name,
        advisor.last_name,
        advisor.job_title,
        advisor.company,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  return NextResponse.json(filtered.map(toSummary));
}
