import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  archiveActiveMatchForReplacement,
  MatchReplacementError,
  restoreArchivedMatch,
} from "@/lib/matchReplacement";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function restoreRecommendation(
  supabase,
  recommendationId,
  recommendationStatus,
) {
  await supabase
    .from("recommendations")
    .update({ recommendation_status: recommendationStatus })
    .eq("id", recommendationId);
}

// POST /api/applicants/:id/recommendations/accept
export async function POST(request, { params }) {
  const { id: applicantId } = await params;

  if (!UUID_REGEX.test(applicantId)) {
    return NextResponse.json(
      { error: "Invalid applicant ID." },
      { status: 400 },
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 },
    );
  }

  const {
    advisorId,
    matchScore = null,
    rankPosition = null,
    explanation = [],
  } = body;

  if (!advisorId || !UUID_REGEX.test(advisorId)) {
    return NextResponse.json(
      { error: "A valid advisorId is required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data: applicant, error: applicantError } = await supabase
    .from("applicants")
    .select("id, status, follow_up_outcome")
    .eq("id", applicantId)
    .maybeSingle();

  if (applicantError) {
    return NextResponse.json(
      { error: applicantError.message },
      { status: 500 },
    );
  }

  if (!applicant) {
    return NextResponse.json(
      { error: "Applicant not found." },
      { status: 404 },
    );
  }

  if (applicant.status === "Closed") {
    return NextResponse.json(
      { error: "A closed applicant case cannot be matched." },
      { status: 409 },
    );
  }

  const { data: advisor, error: advisorError } = await supabase
    .from("advisors")
    .select("id, currentAssignments, max_meetings_per_month")
    .eq("id", advisorId)
    .maybeSingle();

  if (advisorError) {
    return NextResponse.json(
      { error: advisorError.message },
      { status: 500 },
    );
  }

  if (!advisor) {
    return NextResponse.json(
      { error: "Advisor not found." },
      { status: 404 },
    );
  }

  const currentAssignments = Number(
    advisor.currentAssignments ?? 0,
  );
  const maximumAssignments = Number(
    advisor.max_meetings_per_month ?? 0,
  );

  if (currentAssignments >= maximumAssignments) {
    return NextResponse.json(
      { error: "This advisor has no remaining monthly capacity." },
      { status: 409 },
    );
  }

  const {
    data: recommendation,
    error: recommendationLookupError,
  } = await supabase
    .from("recommendations")
    .select("*")
    .eq("applicant_id", applicantId)
    .eq("advisor_id", advisorId)
    .maybeSingle();

  if (recommendationLookupError) {
    return NextResponse.json(
      { error: recommendationLookupError.message },
      { status: 500 },
    );
  }

  if (!recommendation) {
    return NextResponse.json(
      {
        error:
          "Generate recommendations before accepting an advisor.",
      },
      { status: 409 },
    );
  }

  const previousRecommendationStatus =
    recommendation.recommendation_status ?? "Pending";

  let archivedMatch = null;

  try {
    archivedMatch = await archiveActiveMatchForReplacement(
      supabase,
      {
        applicant,
        applicantId,
        nextAdvisorId: advisorId,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to prepare the replacement match.",
      },
      {
        status:
          error instanceof MatchReplacementError
            ? error.status
            : 500,
      },
    );
  }

  const matchingExplanation = Array.isArray(explanation)
    ? explanation.join("\n")
    : String(explanation ?? "");

  const recommendationUpdates = {
    recommendation_status: "Accepted",
  };

  if (matchScore !== null) {
    recommendationUpdates.match_score = matchScore;
  }

  if (rankPosition !== null) {
    recommendationUpdates.rank_position = rankPosition;
  }

  if (matchingExplanation) {
    recommendationUpdates.matching_explanation =
      matchingExplanation;
  }

  const {
    data: acceptedRecommendation,
    error: recommendationUpdateError,
  } = await supabase
    .from("recommendations")
    .update(recommendationUpdates)
    .eq("id", recommendation.id)
    .select()
    .single();

  if (recommendationUpdateError) {
    await restoreArchivedMatch(supabase, archivedMatch);

    return NextResponse.json(
      { error: recommendationUpdateError.message },
      { status: 500 },
    );
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      applicant_id: applicantId,
      advisor_id: advisorId,
      recommendation_id: recommendation.id,
      match_status: "Active",
    })
    .select()
    .single();

  if (matchError) {
    await restoreRecommendation(
      supabase,
      recommendation.id,
      previousRecommendationStatus,
    );
    await restoreArchivedMatch(supabase, archivedMatch);

    return NextResponse.json(
      { error: matchError.message },
      { status: 500 },
    );
  }

  const nextCurrentAssignments = currentAssignments + 1;

  const { error: advisorUpdateError } = await supabase
    .from("advisors")
    .update({
      currentAssignments: nextCurrentAssignments,
    })
    .eq("id", advisorId);

  if (advisorUpdateError) {
    await supabase.from("matches").delete().eq("id", match.id);
    await restoreRecommendation(
      supabase,
      recommendation.id,
      previousRecommendationStatus,
    );
    await restoreArchivedMatch(supabase, archivedMatch);

    return NextResponse.json(
      { error: advisorUpdateError.message },
      { status: 500 },
    );
  }

  const applicantUpdates = {
    status: "Matched",
  };

  if (archivedMatch) {
    applicantUpdates.follow_up_outcome = "Awaiting Follow-up";
  }

  const { error: applicantUpdateError } = await supabase
    .from("applicants")
    .update(applicantUpdates)
    .eq("id", applicantId);

  if (applicantUpdateError) {
    await supabase
      .from("advisors")
      .update({ currentAssignments })
      .eq("id", advisorId);

    await supabase.from("matches").delete().eq("id", match.id);

    await restoreRecommendation(
      supabase,
      recommendation.id,
      previousRecommendationStatus,
    );

    await restoreArchivedMatch(supabase, archivedMatch);

    return NextResponse.json(
      { error: applicantUpdateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      message: archivedMatch
        ? "Replacement recommendation accepted successfully."
        : "Recommendation accepted successfully.",
      recommendation: acceptedRecommendation,
      match,
      archivedMatchId: archivedMatch?.matchId ?? null,
      applicantStatus: "Matched",
      followUpOutcome: archivedMatch
        ? "Awaiting Follow-up"
        : applicant.follow_up_outcome,
      currentAssignments: nextCurrentAssignments,
    },
    { status: 201 },
  );
}