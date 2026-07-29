export class MatchReplacementError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "MatchReplacementError";
    this.status = status;
  }
}

function errorMessage(error, fallback) {
  return error?.message ?? fallback;
}

export async function restoreArchivedMatch(supabase, snapshot) {
  if (!snapshot) return;

  await supabase
    .from("matches")
    .update({ match_status: "Active" })
    .eq("id", snapshot.matchId);

  await supabase
    .from("advisors")
    .update({
      currentAssignments: snapshot.previousAdvisorAssignments,
    })
    .eq("id", snapshot.advisorId);

  if (
    snapshot.recommendationId &&
    snapshot.previousRecommendationStatus
  ) {
    await supabase
      .from("recommendations")
      .update({
        recommendation_status:
          snapshot.previousRecommendationStatus,
      })
      .eq("id", snapshot.recommendationId);
  }
}

export async function archiveActiveMatchForReplacement(
  supabase,
  {
    applicant,
    applicantId,
    nextAdvisorId,
  },
) {
  const { data: activeMatch, error: activeMatchError } =
    await supabase
      .from("matches")
      .select("id, advisor_id, recommendation_id")
      .eq("applicant_id", applicantId)
      .eq("match_status", "Active")
      .maybeSingle();

  if (activeMatchError) {
    throw new MatchReplacementError(
      errorMessage(
        activeMatchError,
        "Failed to check the current match.",
      ),
    );
  }

  if (!activeMatch) {
    return null;
  }

  if (
    applicant.follow_up_outcome !==
    "Additional Session Requested"
  ) {
    throw new MatchReplacementError(
      "Save Additional Session Requested before replacing the current match.",
      409,
    );
  }

  if (activeMatch.advisor_id === nextAdvisorId) {
    throw new MatchReplacementError(
      "Choose a different advisor for the additional session.",
      409,
    );
  }

  const { data: previousAdvisor, error: previousAdvisorError } =
    await supabase
      .from("advisors")
      .select("id, currentAssignments")
      .eq("id", activeMatch.advisor_id)
      .maybeSingle();

  if (previousAdvisorError || !previousAdvisor) {
    throw new MatchReplacementError(
      errorMessage(
        previousAdvisorError,
        "The currently matched advisor could not be found.",
      ),
    );
  }

  let previousRecommendationStatus = null;

  if (activeMatch.recommendation_id) {
    const {
      data: previousRecommendation,
      error: previousRecommendationError,
    } = await supabase
      .from("recommendations")
      .select("recommendation_status")
      .eq("id", activeMatch.recommendation_id)
      .maybeSingle();

    if (previousRecommendationError) {
      throw new MatchReplacementError(
        errorMessage(
          previousRecommendationError,
          "Failed to load the current recommendation.",
        ),
      );
    }

    previousRecommendationStatus =
      previousRecommendation?.recommendation_status ?? null;
  }

  const snapshot = {
    matchId: activeMatch.id,
    advisorId: activeMatch.advisor_id,
    recommendationId: activeMatch.recommendation_id,
    previousAdvisorAssignments: Number(
      previousAdvisor.currentAssignments ?? 0,
    ),
    previousRecommendationStatus,
  };

  const { error: matchUpdateError } = await supabase
    .from("matches")
    .update({ match_status: "Completed" })
    .eq("id", activeMatch.id)
    .eq("match_status", "Active");

  if (matchUpdateError) {
    throw new MatchReplacementError(
      errorMessage(
        matchUpdateError,
        "Failed to archive the current match.",
      ),
    );
  }

  const { error: advisorUpdateError } = await supabase
    .from("advisors")
    .update({
      currentAssignments: Math.max(
        0,
        snapshot.previousAdvisorAssignments - 1,
      ),
    })
    .eq("id", activeMatch.advisor_id);

  if (advisorUpdateError) {
    await restoreArchivedMatch(supabase, snapshot);

    throw new MatchReplacementError(
      errorMessage(
        advisorUpdateError,
        "Failed to release the previous advisor assignment.",
      ),
    );
  }

  if (activeMatch.recommendation_id) {
    const { error: recommendationUpdateError } =
      await supabase
        .from("recommendations")
        .update({ recommendation_status: "Rejected" })
        .eq("id", activeMatch.recommendation_id);

    if (recommendationUpdateError) {
      await restoreArchivedMatch(supabase, snapshot);

      throw new MatchReplacementError(
        errorMessage(
          recommendationUpdateError,
          "Failed to archive the previous recommendation.",
        ),
      );
    }
  }

  return snapshot;
}