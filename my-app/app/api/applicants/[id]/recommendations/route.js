import { NextResponse } from "next/server";
import { getApplicantById } from "@/lib/applicantService";
import { getAllAdvisors } from "@/lib/advisorService";
import { generateRecommendations } from "@/lib/recommendationEngine";
import { createClient } from "@/utils/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RECOMMENDATION_SELECT = `
  id,
  applicant_id,
  advisor_id,
  match_score,
  rank_position,
  recommendation_status,
  matching_explanation,
  total_score,
  career_score,
  industry_score,
  experience_score,
  gender_bonus,
  capacity_adjustment,
  career_similarity
`;

function parseExplanation(value) {
  if (!value) return [];
  return String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function mapPersistedRecommendation(row, advisorsById) {
  const advisor = advisorsById.get(row.advisor_id);
  const totalScore = Number(row.total_score ?? row.match_score ?? 0);

  return {
    recommendationId: row.id,
    advisorId: row.advisor_id,
    advisorName: [advisor?.first_name, advisor?.last_name].filter(Boolean).join(" "),
    jobTitle: advisor?.job_title ?? "",
    company: advisor?.company ?? "",
    industry: advisor?.industry ?? "",
    experienceLevel: advisor?.experience_level ?? "",
    reliabilityLevel: advisor?.reliability_level ?? "",
    matchScore: Number(row.match_score ?? totalScore),
    totalScore,
    careerScore: Number(row.career_score ?? 0),
    industryScore: Number(row.industry_score ?? 0),
    experienceScore: Number(row.experience_score ?? 0),
    genderBonus: Number(row.gender_bonus ?? 0),
    capacityAdjustment: Number(row.capacity_adjustment ?? 0),
    careerSimilarity: row.career_similarity ?? "",
    currentMonthlyAssignments: Number(advisor?.currentAssignments ?? 0),
    maxMonthlyAssignments: Number(advisor?.max_meetings_per_month ?? 0),
    explanation: parseExplanation(row.matching_explanation),
    recommendationStatus: row.recommendation_status ?? "Pending",
  };
}

// GET /api/applicants/:id/recommendations
// - ?persistedOnly=true returns saved recommendations without generating new ones.
// - Otherwise, returns saved recommendations when present or generates + persists them once.
export async function GET(request, { params }) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "Invalid applicant ID." },
      { status: 400 },
    );
  }

  const persistedOnly =
    new URL(request.url).searchParams.get("persistedOnly") === "true";

  const { data: applicant, error: applicantError } = await getApplicantById(id);

  if (applicantError || !applicant) {
    if (!applicant || applicantError?.code === "PGRST116") {
      return NextResponse.json(
        { error: `Applicant with id "${id}" not found` },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: applicantError.message },
      { status: 500 },
    );
  }

  try {
    const supabase = createClient();
    const { data: advisors, error: advisorsError } = await getAllAdvisors();

    if (advisorsError) {
      throw new Error(advisorsError.message);
    }

    const advisorsById = new Map(
      (advisors ?? []).map((advisor) => [advisor.id, advisor]),
    );

    const { data: existing, error: existingError } = await supabase
      .from("recommendations")
      .select(RECOMMENDATION_SELECT)
      .eq("applicant_id", id)
      .order("rank_position", { ascending: true });

    if (existingError) {
      throw new Error(existingError.message);
    }

    if ((existing ?? []).length > 0 || persistedOnly) {
      return NextResponse.json(
        (existing ?? []).map((row) =>
          mapPersistedRecommendation(row, advisorsById),
        ),
      );
    }

    const ranked = await generateRecommendations(id, { limit: 5 });

    if (ranked.length === 0) {
      await supabase
        .from("applicants")
        .update({ status: "Recommendations Generated" })
        .eq("id", id)
        .neq("status", "Matched");

      return NextResponse.json([]);
    }

    const rowsToPersist = ranked.map((rec, index) => ({
      applicant_id: id,
      advisor_id: rec.advisorId,
      match_score: rec.totalScore,
      rank_position: index + 1,
      recommendation_status: "Pending",
      matching_explanation: (rec.explanation ?? []).join("\n"),
      total_score: rec.totalScore,
      career_score: rec.careerScore,
      industry_score: rec.industryScore,
      experience_score: rec.experienceScore,
      gender_bonus: rec.genderScore,
      capacity_adjustment: rec.capacityPenalty,
      career_similarity: rec.careerSimilarity,
    }));

    const { data: persisted, error: persistError } = await supabase
      .from("recommendations")
      .insert(rowsToPersist)
      .select(RECOMMENDATION_SELECT);

    if (persistError) {
      throw new Error(persistError.message);
    }

    await supabase
      .from("applicants")
      .update({ status: "Recommendations Generated" })
      .eq("id", id)
      .neq("status", "Matched");

    return NextResponse.json(
      (persisted ?? [])
        .sort((a, b) => (a.rank_position ?? 0) - (b.rank_position ?? 0))
        .map((row) => mapPersistedRecommendation(row, advisorsById)),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load recommendations.",
      },
      { status: 500 },
    );
  }
}
