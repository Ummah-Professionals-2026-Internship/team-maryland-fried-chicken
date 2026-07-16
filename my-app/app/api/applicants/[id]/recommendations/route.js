import { NextResponse } from "next/server";
import { getApplicantById } from "@/lib/applicantService";
import { getAllAdvisors } from "@/lib/advisorService";
import { getCurrentMonthlyAssignments } from "@/lib/capacityService";
import { generateRecommendations } from "@/lib/recommendationEngine";

// GET /api/applicants/:id/recommendations
// Runs the recommendation engine for an applicant and returns ranked,
// UI-ready advisor matches.
export async function GET(request, { params }) {
  const { id } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json(
      { error: `Applicant with id "${id}" not found` },
      { status: 404 },
    );
  }

  // Confirm the applicant exists before running the engine, so we can
  // return a proper 404 instead of a generic 500.
  const { data: applicant, error: applicantError } = await getApplicantById(id);

  if (applicantError || !applicant) {
    if (!applicant || applicantError?.code === "PGRST116") {
      return NextResponse.json(
        { error: `Applicant with id "${id}" not found` },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: applicantError.message }, { status: 500 });
  }

  try {
    // generateRecommendations() only returns scoring fields + advisorId/name/jobTitle
    // (see lib/recommendationEngine.js) — enrich each entry with the display
    // fields the UI needs (company, industry, reliability, capacity).
    const ranked = await generateRecommendations(id);

    const { data: advisors, error: advisorsError } = await getAllAdvisors();
    if (advisorsError) throw new Error(advisorsError.message);

    const advisorsById = new Map((advisors ?? []).map((advisor) => [advisor.id, advisor]));

    const enriched = await Promise.all(
      ranked.map(async (rec) => {
        const advisor = advisorsById.get(rec.advisorId);
        const maxMonthlyAssignments = advisor?.max_meetings_per_month ?? 0;
        const currentMonthlyAssignments = await getCurrentMonthlyAssignments(rec.advisorId);

        return {
          advisorId: rec.advisorId,
          advisorName: rec.advisorName,
          jobTitle: rec.advisorJobTitle,
          company: advisor?.company ?? "",
          industry: advisor?.industry ?? "",
          experienceLevel: advisor?.experience_level ?? "",
          reliabilityLevel: advisor?.reliability_level ?? "",
          matchScore: rec.totalScore,
          currentMonthlyAssignments,
          maxMonthlyAssignments,
          explanation: rec.explanation,
        };
      }),
    );

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate recommendations.",
      },
      { status: 500 },
    );
  }
}
