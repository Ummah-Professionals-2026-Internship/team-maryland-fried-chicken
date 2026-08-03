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
  const totalScore = Number(
    row.total_score ?? row.match_score ?? 0,
  );

  return {
    recommendationId: row.id,
    advisorId: row.advisor_id,
    advisorName: [advisor?.first_name, advisor?.last_name]
      .filter(Boolean)
      .join(" "),
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
    capacityAdjustment: Number(
      row.capacity_adjustment ?? 0,
    ),
    careerSimilarity: row.career_similarity ?? "",
    currentMonthlyAssignments: Number(
      advisor?.currentAssignments ?? 0,
    ),
    maxMonthlyAssignments: Number(
      advisor?.max_meetings_per_month ?? 0,
    ),
    explanation: parseExplanation(
      row.matching_explanation,
    ),
    recommendationStatus:
      row.recommendation_status ?? "Pending",
  };
}

function recommendationRow(applicantId, rec, index) {
  return {
    applicant_id: applicantId,
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
  };
}

// GET /api/applicants/:id/recommendations
export async function GET(request, { params }) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "Invalid applicant ID." },
      { status: 400 },
    );
  }

  const searchParams = new URL(request.url).searchParams;
  const persistedOnly =
    searchParams.get("persistedOnly") === "true";
  const regenerate =
    searchParams.get("regenerate") === "true";

  const { data: applicant, error: applicantError } =
    await getApplicantById(id);

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

    const { data: advisors, error: advisorsError } =
      await getAllAdvisors();

    if (advisorsError) {
      throw new Error(advisorsError.message);
    }

    const advisorsById = new Map(
      (advisors ?? []).map((advisor) => [
        advisor.id,
        advisor,
      ]),
    );

    const { data: existing, error: existingError } =
      await supabase
        .from("recommendations")
        .select(RECOMMENDATION_SELECT)
        .eq("applicant_id", id)
        .order("rank_position", { ascending: true });

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (persistedOnly || (!regenerate && existing.length > 0)) {
      return NextResponse.json(
        existing.map((row) =>
          mapPersistedRecommendation(row, advisorsById),
        ),
      );
    }

    let activeMatch = null;
    let preservedRecommendation = null;

    if (regenerate) {
      const { data, error: activeMatchError } =
        await supabase
          .from("matches")
          .select("id, advisor_id, recommendation_id")
          .eq("applicant_id", id)
          .eq("match_status", "Active")
          .maybeSingle();

      if (activeMatchError) {
        throw new Error(activeMatchError.message);
      }

      activeMatch = data;

      if (
        activeMatch &&
        applicant.follow_up_outcome !==
          "Additional Session Requested"
      ) {
        return NextResponse.json(
          {
            error:
              "Save Additional Session Requested before generating replacement recommendations.",
          },
          { status: 409 },
        );
      }

      if (activeMatch?.recommendation_id) {
        preservedRecommendation =
          existing.find(
            (row) =>
              row.id === activeMatch.recommendation_id,
          ) ?? null;
      }
    }

    const ranked = await generateRecommendations(id, {
      limit: 5,
    });

    const replacementRanked = activeMatch
      ? ranked.filter(
          (rec) =>
            rec.advisorId !== activeMatch.advisor_id,
        )
      : ranked;

    const rowsToPersist = replacementRanked.map(
      (rec, index) => recommendationRow(id, rec, index),
    );

    let persisted = [];

    if (rowsToPersist.length > 0) {
      const { data, error: persistError } =
        await supabase
          .from("recommendations")
          .insert(rowsToPersist)
          .select(RECOMMENDATION_SELECT);

      if (persistError) {
        throw new Error(persistError.message);
      }

      persisted = data ?? [];
    }

    if (regenerate) {
      const staleRecommendationIds = existing
        .filter(
          (row) =>
            row.id !== preservedRecommendation?.id,
        )
        .map((row) => row.id);

      if (staleRecommendationIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("recommendations")
          .delete()
          .in("id", staleRecommendationIds);

        if (deleteError) {
          if (persisted.length > 0) {
            await supabase
              .from("recommendations")
              .delete()
              .in(
                "id",
                persisted.map((row) => row.id),
              );
          }

          throw new Error(deleteError.message);
        }
      }
    }

    await supabase
      .from("applicants")
      .update({ status: "Recommendations Generated" })
      .eq("id", id)
      .neq("status", "Matched");

    const responseRows = [
      ...(preservedRecommendation
        ? [preservedRecommendation]
        : []),
      ...persisted,
    ];

    return NextResponse.json(
      responseRows.map((row) =>
        mapPersistedRecommendation(
          row,
          advisorsById,
        ),
      ),
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

// DELETE /api/applicants/:id/recommendations
// DELETE /api/applicants/:id/recommendations?recommendationId=<uuid>
export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "Invalid applicant ID." },
      { status: 400 },
    );
  }

  const searchParams = new URL(request.url).searchParams;
  const recommendationId = searchParams.get("recommendationId");

  if (recommendationId && !UUID_REGEX.test(recommendationId)) {
    return NextResponse.json(
      { error: "Invalid recommendation ID." },
      { status: 400 },
    );
  }

  const supabase = createClient();

  try {
    if (recommendationId) {
      const { data: target, error: lookupError } = await supabase
        .from("recommendations")
        .select("id, recommendation_status")
        .eq("id", recommendationId)
        .eq("applicant_id", id)
        .maybeSingle();

      if (lookupError) {
        throw new Error(lookupError.message);
      }

      if (!target) {
        return NextResponse.json(
          { error: "Recommendation not found." },
          { status: 404 },
        );
      }

      if (target.recommendation_status === "Accepted") {
        return NextResponse.json(
          {
            error:
              "Undo the accepted match before deleting its recommendation.",
          },
          { status: 409 },
        );
      }

      const { error: deleteError } = await supabase
        .from("recommendations")
        .delete()
        .eq("id", recommendationId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      return NextResponse.json({ deletedIds: [recommendationId] });
    }

    // No recommendationId — clear every non-accepted recommendation for
    // this applicant. Accepted recommendations are tied to an active
    // match and must be undone first.
    const { data: deleted, error: deleteAllError } = await supabase
      .from("recommendations")
      .delete()
      .eq("applicant_id", id)
      .neq("recommendation_status", "Accepted")
      .select("id");

    if (deleteAllError) {
      throw new Error(deleteAllError.message);
    }

    return NextResponse.json({
      deletedIds: (deleted ?? []).map((row) => row.id),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete recommendation(s).",
      },
      { status: 500 },
    );
  }
}