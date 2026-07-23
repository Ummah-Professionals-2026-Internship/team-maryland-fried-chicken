import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const FOLLOW_UP_PHASES = new Set([
  "Not Started",
  "1 Week Follow-up",
  "2 Month Follow-up",
  "4 Month Follow-up",
  "Follow-up Complete",
]);

const FOLLOW_UP_OUTCOMES = new Set([
  "Awaiting Follow-up",
  "No Additional Session Needed",
  "Additional Session Requested",
]);

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function parseOptionalDate(value) {
  if (value === null || value === "") return { value: null };

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { error: "Dates must use YYYY-MM-DD format." };
  }

  const parsed = new Date(value + "T00:00:00Z");

  if (Number.isNaN(parsed.getTime())) {
    return { error: "Invalid date value." };
  }

  return { value };
}

async function findApplicant(supabase, applicantId) {
  return supabase
    .from("applicants")
    .select(
      "id, status, follow_up_phase, follow_up_outcome, last_meeting_date, next_follow_up_date, internal_notes",
    )
    .eq("id", applicantId)
    .maybeSingle();
}

export async function GET(request, { params }) {
  const { id: applicantId } = await params;

  if (!UUID_REGEX.test(applicantId)) {
    return NextResponse.json({ error: "Invalid applicant ID." }, { status: 400 });
  }

  const supabase = createClient();
  const { data: applicant, error } = await findApplicant(supabase, applicantId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!applicant) {
    return NextResponse.json({ error: "Applicant not found." }, { status: 404 });
  }

  const { data: meetingActivity, error: activityError } = await supabase
    .from("matches")
    .select(
      "id, match_status, matched_at, created_at, advisors(first_name, last_name)",
    )
    .eq("applicant_id", applicantId)
    .order("matched_at", { ascending: false });

  if (activityError) {
    return NextResponse.json({ error: activityError.message }, { status: 500 });
  }

  return NextResponse.json({
    ...applicant,
    meetingActivity: meetingActivity ?? [],
  });
}

export async function PATCH(request, { params }) {
  const { id: applicantId } = await params;

  if (!UUID_REGEX.test(applicantId)) {
    return NextResponse.json({ error: "Invalid applicant ID." }, { status: 400 });
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

  const supabase = createClient();
  const { data: applicant, error: applicantError } =
    await findApplicant(supabase, applicantId);

  if (applicantError) {
    return NextResponse.json({ error: applicantError.message }, { status: 500 });
  }

  if (!applicant) {
    return NextResponse.json({ error: "Applicant not found." }, { status: 404 });
  }

  const updates = {};

  if (hasOwn(body, "followUpPhase")) {
    if (typeof body.followUpPhase !== "string") {
      return NextResponse.json(
        { error: "Follow-up phase must be a string." },
        { status: 400 },
      );
    }

    const phase = body.followUpPhase.trim();

    if (!FOLLOW_UP_PHASES.has(phase)) {
      return NextResponse.json(
        { error: "Invalid follow-up phase." },
        { status: 400 },
      );
    }

    updates.follow_up_phase = phase;
  }

  if (hasOwn(body, "followUpOutcome")) {
    const outcome =
      body.followUpOutcome === null || body.followUpOutcome === ""
        ? null
        : typeof body.followUpOutcome === "string"
          ? body.followUpOutcome.trim()
          : undefined;

    if (outcome === undefined) {
      return NextResponse.json(
        { error: "Follow-up outcome must be a string or null." },
        { status: 400 },
      );
    }

    if (outcome !== null && !FOLLOW_UP_OUTCOMES.has(outcome)) {
      return NextResponse.json(
        { error: "Invalid follow-up outcome." },
        { status: 400 },
      );
    }

    updates.follow_up_outcome = outcome;
  }

  if (hasOwn(body, "lastMeetingDate")) {
    const parsed = parseOptionalDate(body.lastMeetingDate);

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    updates.last_meeting_date = parsed.value;
  }

  if (hasOwn(body, "nextFollowUpDate")) {
    const parsed = parseOptionalDate(body.nextFollowUpDate);

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    updates.next_follow_up_date = parsed.value;
  }

  if (hasOwn(body, "internalNotes")) {
    if (body.internalNotes !== null && typeof body.internalNotes !== "string") {
      return NextResponse.json(
        { error: "Internal notes must be a string or null." },
        { status: 400 },
      );
    }

    updates.internal_notes = body.internalNotes?.trim() || null;
  }

  if (body.closeCase === true) {
    const finalPhase =
      updates.follow_up_phase ?? applicant.follow_up_phase ?? "Not Started";
    const finalOutcome =
      hasOwn(updates, "follow_up_outcome")
        ? updates.follow_up_outcome
        : applicant.follow_up_outcome;

    if (
      finalPhase !== "Follow-up Complete" ||
      finalOutcome !== "No Additional Session Needed"
    ) {
      return NextResponse.json(
        {
          error:
            "Complete follow-up and select No Additional Session Needed before closing the case.",
        },
        { status: 400 },
      );
    }

    updates.status = "Closed";
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No case-management changes were provided." },
      { status: 400 },
    );
  }

  const { data: updatedApplicant, error: updateError } = await supabase
    .from("applicants")
    .update(updates)
    .eq("id", applicantId)
    .select(
      "id, status, follow_up_phase, follow_up_outcome, last_meeting_date, next_follow_up_date, internal_notes",
    )
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    message:
      body.closeCase === true
        ? "Applicant case closed successfully."
        : "Case management updated successfully.",
    applicant: updatedApplicant,
  });
}
