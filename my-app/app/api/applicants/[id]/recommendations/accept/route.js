import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  const supabase = createSupabaseServerClient();

  const { data: applicant, error: applicantError } = await supabase
    .from("applicants")
    .select("id, status")
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

  const { data: advisor, error: advisorError } = await supabase
    .from("advisors")
    .select("id")
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

  const { data: existingMatch, error: existingMatchError } = await supabase
    .from("matches")
    .select("id, advisor_id")
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

  const matchingExplanation = Array.isArray(explanation)
    ? explanation.join("\n")
    : String(explanation ?? "");

  const { data: recommendation, error: recommendationError } = await supabase
    .from("recommendations")
    .insert({
      applicant_id: applicantId,
      advisor_id: advisorId,
      match_score: matchScore,
      rank_position: rankPosition,
      recommendation_status: "Accepted",
      matching_explanation: matchingExplanation,
    })
    .select()
    .single();

  if (recommendationError) {
    return NextResponse.json(
      { error: recommendationError.message },
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
    await supabase
      .from("recommendations")
      .delete()
      .eq("id", recommendation.id);

    return NextResponse.json(
      { error: matchError.message },
      { status: 500 },
    );
  }

  const { error: applicantUpdateError } = await supabase
    .from("applicants")
    .update({ status: "Matched" })
    .eq("id", applicantId);

  if (applicantUpdateError) {
    await supabase
      .from("matches")
      .delete()
      .eq("id", match.id);

    await supabase
      .from("recommendations")
      .delete()
      .eq("id", recommendation.id);

    return NextResponse.json(
      { error: applicantUpdateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      message: "Recommendation accepted successfully.",
      recommendation,
      match,
      applicantStatus: "Matched",
    },
    { status: 201 },
  );
}
