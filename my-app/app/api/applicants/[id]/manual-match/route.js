import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/applicants/:id/manual-match
// Returns the applicant's active match if it has no associated
// recommendation (i.e. it was created manually), so a page refresh can
// still show the matched advisor. Returns null otherwise.
export async function GET(request, { params }) {
  const { id: applicantId } = await params;

  if (!UUID_REGEX.test(applicantId)) {
    return NextResponse.json({ error: "Invalid applicant ID." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: activeMatch, error: matchError } = await supabase
    .from("matches")
    .select("id, advisor_id, recommendation_id")
    .eq("applicant_id", applicantId)
    .eq("match_status", "Active")
    .is("recommendation_id", null)
    .maybeSingle();

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  if (!activeMatch) {
    return NextResponse.json(null);
  }

  const { data: advisor, error: advisorError } = await supabase
    .from("advisors")
    .select("id, first_name, last_name, job_title, company")
    .eq("id", activeMatch.advisor_id)
    .maybeSingle();

  if (advisorError) {
    return NextResponse.json({ error: advisorError.message }, { status: 500 });
  }

  return NextResponse.json({
    advisorId: activeMatch.advisor_id,
    advisorName: [advisor?.first_name, advisor?.last_name].filter(Boolean).join(" "),
    jobTitle: advisor?.job_title ?? "",
    company: advisor?.company ?? "",
  });
}

// POST /api/applicants/:id/manual-match
// Creates a match for a volunteer-selected advisor, without requiring a
// pre-existing recommendation row. Follows the same business rules as
// /api/applicants/:id/recommendations/accept (one active match per
// applicant, bump advisor currentAssignments, mark applicant Matched),
// minus the recommendation-status bookkeeping since there may be no
// associated recommendation. The existing Undo Match endpoint already
// works for these matches, since it only requires an Active row in
// `matches` and treats a null recommendation_id as a no-op.
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

  const { data: applicant, error: applicantError } = await supabase
    .from("applicants")
    .select("id, status")
    .eq("id", applicantId)
    .maybeSingle();

  if (applicantError) {
    return NextResponse.json({ error: applicantError.message }, { status: 500 });
  }

  if (!applicant) {
    return NextResponse.json({ error: "Applicant not found." }, { status: 404 });
  }

  const { data: advisor, error: advisorError } = await supabase
    .from("advisors")
    .select(
      "id, first_name, last_name, job_title, company, industry, experience_level, reliability_level, currentAssignments, max_meetings_per_month",
    )
    .eq("id", advisorId)
    .maybeSingle();

  if (advisorError) {
    return NextResponse.json({ error: advisorError.message }, { status: 500 });
  }

  if (!advisor) {
    return NextResponse.json({ error: "Advisor not found." }, { status: 404 });
  }

  const maxMeetings = Number(advisor.max_meetings_per_month ?? 0);
  const currentAssignments = Number(advisor.currentAssignments ?? 0);

  if (currentAssignments >= maxMeetings) {
    return NextResponse.json(
      { error: "This advisor has no remaining monthly capacity." },
      { status: 409 },
    );
  }

  const { data: existingMatch, error: existingMatchError } = await supabase
    .from("matches")
    .select("id")
    .eq("applicant_id", applicantId)
    .eq("match_status", "Active")
    .maybeSingle();

  if (existingMatchError) {
    return NextResponse.json(
      { error: existingMatchError.message },
      { status: 500 },
    );
  }

  if (existingMatch) {
    return NextResponse.json(
      { error: "This applicant already has an active match." },
      { status: 409 },
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
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  const nextCurrentAssignments = currentAssignments + 1;

  const { error: advisorUpdateError } = await supabase
    .from("advisors")
    .update({ currentAssignments: nextCurrentAssignments })
    .eq("id", advisorId);

  if (advisorUpdateError) {
    await supabase.from("matches").delete().eq("id", match.id);

    return NextResponse.json(
      { error: advisorUpdateError.message },
      { status: 500 },
    );
  }

  const { error: applicantUpdateError } = await supabase
    .from("applicants")
    .update({ status: "Matched" })
    .eq("id", applicantId);

  if (applicantUpdateError) {
    await supabase
      .from("advisors")
      .update({ currentAssignments: Math.max(0, nextCurrentAssignments - 1) })
      .eq("id", advisorId);

    await supabase.from("matches").delete().eq("id", match.id);

    return NextResponse.json(
      { error: applicantUpdateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      message: "Advisor manually matched successfully.",
      match,
      applicantStatus: "Matched",
      currentAssignments: nextCurrentAssignments,
      advisor: {
        advisorId: advisor.id,
        advisorName: [advisor.first_name, advisor.last_name].filter(Boolean).join(" "),
        jobTitle: advisor.job_title ?? "",
        company: advisor.company ?? "",
        industry: advisor.industry ?? "",
        experienceLevel: advisor.experience_level ?? "",
        reliabilityLevel: advisor.reliability_level ?? "",
      },
    },
    { status: 201 },
  );
}
