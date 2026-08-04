import { NextResponse } from "next/server";
import { requireAdminOrStaff } from "@/lib/requireStaffRole";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ACTIVE_FOLLOW_UP_PHASES = new Set([
  "1 Week Follow-up",
  "2 Month Follow-up",
  "4 Month Follow-up",
]);

// POST /api/applicants/:id/recommendations/undo
export async function POST(_request, { params }) {
  const { id: applicantId } = await params;

  if (!UUID_REGEX.test(applicantId)) {
    return NextResponse.json(
      { error: "Invalid applicant ID." },
      { status: 400 },
    );
  }

  const authorization = await requireAdminOrStaff();

  if (authorization.error) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  const supabase = authorization.admin;

  const { data: applicant, error: applicantError } = await supabase
    .from("applicants")
    .select("id, status, follow_up_phase")
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

  const { data: activeMatch, error: matchLookupError } = await supabase
    .from("matches")
    .select("id, advisor_id, recommendation_id")
    .eq("applicant_id", applicantId)
    .eq("match_status", "Active")
    .order("matched_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (matchLookupError) {
    return NextResponse.json(
      { error: matchLookupError.message },
      { status: 500 },
    );
  }

  if (!activeMatch) {
    return NextResponse.json(
      { error: "No active match exists for this applicant." },
      { status: 409 },
    );
  }

  const { data: advisor, error: advisorError } = await supabase
    .from("advisors")
    .select("id, currentAssignments")
    .eq("id", activeMatch.advisor_id)
    .maybeSingle();

  if (advisorError) {
    return NextResponse.json(
      { error: advisorError.message },
      { status: 500 },
    );
  }

  const { error: matchCancelError } = await supabase
    .from("matches")
    .update({ match_status: "Cancelled" })
    .eq("id", activeMatch.id);

  if (matchCancelError) {
    return NextResponse.json(
      { error: matchCancelError.message },
      { status: 500 },
    );
  }

  if (activeMatch.recommendation_id) {
    const { error: recommendationUpdateError } = await supabase
      .from("recommendations")
      .update({ recommendation_status: "Pending" })
      .eq("id", activeMatch.recommendation_id)
      .eq("applicant_id", applicantId);

    if (recommendationUpdateError) {
      return NextResponse.json(
        { error: recommendationUpdateError.message },
        { status: 500 },
      );
    }
  }

  const nextCurrentAssignments = Math.max(
    0,
    Number(advisor?.currentAssignments ?? 0) - 1,
  );

  const { error: advisorUpdateError } = await supabase
    .from("advisors")
    .update({ currentAssignments: nextCurrentAssignments })
    .eq("id", activeMatch.advisor_id);

  if (advisorUpdateError) {
    return NextResponse.json(
      { error: advisorUpdateError.message },
      { status: 500 },
    );
  }

  const nextApplicantStatus = ACTIVE_FOLLOW_UP_PHASES.has(
    applicant.follow_up_phase,
  )
    ? "Follow Up"
    : "Recommendations Generated";

  const { error: applicantUpdateError } = await supabase
    .from("applicants")
    .update({ status: nextApplicantStatus })
    .eq("id", applicantId);

  if (applicantUpdateError) {
    return NextResponse.json(
      { error: applicantUpdateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      message: "Accepted recommendation undone successfully.",
      applicantStatus: nextApplicantStatus,
      advisorId: activeMatch.advisor_id,
      currentAssignments: nextCurrentAssignments,
    },
    { status: 200 },
  );
}
