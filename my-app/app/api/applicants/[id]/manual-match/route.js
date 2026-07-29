import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  archiveActiveMatchForReplacement,
  MatchReplacementError,
  restoreArchivedMatch,
} from "@/lib/matchReplacement";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/applicants/:id/manual-match
export async function GET(request, { params }) {
  const { id: applicantId } = await params;

  if (!UUID_REGEX.test(applicantId)) {
    return NextResponse.json(
      { error: "Invalid applicant ID." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data: activeMatch, error: matchError } =
    await supabase
      .from("matches")
      .select("id, advisor_id, recommendation_id")
      .eq("applicant_id", applicantId)
      .eq("match_status", "Active")
      .is("recommendation_id", null)
      .maybeSingle();

  if (matchError) {
    return NextResponse.json(
      { error: matchError.message },
      { status: 500 },
    );
  }

  if (!activeMatch) {
    return NextResponse.json(null);
  }

  const { data: advisor, error: advisorError } =
    await supabase
      .from("advisors")
      .select(
        "id, first_name, last_name, job_title, company, industry, experience_level, reliability_level, currentAssignments, max_meetings_per_month",
      )
      .eq("id", activeMatch.advisor_id)
      .maybeSingle();

  if (advisorError) {
    return NextResponse.json(
      { error: advisorError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    advisorId: activeMatch.advisor_id,
    advisorName: [advisor?.first_name, advisor?.last_name]
      .filter(Boolean)
      .join(" "),
    jobTitle: advisor?.job_title ?? "",
    company: advisor?.company ?? "",
    industry: advisor?.industry ?? "",
    experienceLevel: advisor?.experience_level ?? "",
    reliabilityLevel: advisor?.reliability_level ?? "",
    currentMonthlyAssignments: Number(advisor?.currentAssignments ?? 0),
    maxMonthlyAssignments: Number(advisor?.max_meetings_per_month ?? 0),
  });
}

// POST /api/applicants/:id/manual-match
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

  const { advisorId } = body;

  if (!advisorId || !UUID_REGEX.test(advisorId)) {
    return NextResponse.json(
      { error: "A valid advisorId is required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data: applicant, error: applicantError } =
    await supabase
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

  const { data: advisor, error: advisorError } =
    await supabase
      .from("advisors")
      .select(
        "id, first_name, last_name, job_title, company, industry, experience_level, reliability_level, currentAssignments, max_meetings_per_month",
      )
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

  const maximumAssignments = Number(
    advisor.max_meetings_per_month ?? 0,
  );
  const currentAssignments = Number(
    advisor.currentAssignments ?? 0,
  );

  if (currentAssignments >= maximumAssignments) {
    return NextResponse.json(
      { error: "This advisor has no remaining monthly capacity." },
      { status: 409 },
    );
  }

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

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      applicant_id: applicantId,
      advisor_id: advisorId,
      recommendation_id: null,
      match_status: "Active",
    })
    .select()
    .single();

  if (matchError) {
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
    await restoreArchivedMatch(supabase, archivedMatch);

    return NextResponse.json(
      { error: applicantUpdateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      message: archivedMatch
        ? "Replacement advisor manually matched successfully."
        : "Advisor manually matched successfully.",
      match,
      archivedMatchId: archivedMatch?.matchId ?? null,
      applicantStatus: "Matched",
      followUpOutcome: archivedMatch
        ? "Awaiting Follow-up"
        : applicant.follow_up_outcome,
      currentAssignments: nextCurrentAssignments,
      advisor: {
        advisorId: advisor.id,
        advisorName: [advisor.first_name, advisor.last_name]
          .filter(Boolean)
          .join(" "),
        jobTitle: advisor.job_title ?? "",
        company: advisor.company ?? "",
        industry: advisor.industry ?? "",
        experienceLevel: advisor.experience_level ?? "",
        reliabilityLevel: advisor.reliability_level ?? "",
        currentMonthlyAssignments: nextCurrentAssignments,
        maxMonthlyAssignments: maximumAssignments,
      },
    },
    { status: 201 },
  );
}