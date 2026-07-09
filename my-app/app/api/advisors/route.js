import { NextResponse } from "next/server";
import { getAllAdvisors } from "@/lib/advisorService";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

function getString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getStringArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeMentorshipExperience(value) {
  return value.replace("1-3 years", "1–3 years").replace("3-5 years", "3–5 years");
}

async function upsertLookupValues(supabase, tableName, values) {
  const uniqueValues = [...new Set(values.map((value) => value.trim()).filter(Boolean))];

  if (uniqueValues.length === 0) return [];

  const { data, error } = await supabase
    .from(tableName)
    .upsert(
      uniqueValues.map((name) => ({ name })),
      { onConflict: "name" },
    )
    .select("id, name");

  if (error) throw error;

  return data ?? [];
}

// GET /api/advisors
// Returns all advisors from the database as a JSON array
export async function GET() {
  const { data, error } = await getAllAdvisors();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/advisors
// Stores one public advisor form submission in Supabase
export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 },
    );
  }

  const firstName = getString(body.firstName);
  const lastName = getString(body.lastName);
  const email = getString(body.email).toLowerCase();
  const gender = getString(body.gender);
  const almaMaters = getStringArray(body.almaMaters);
  const majors = getStringArray(body.majors);
  const company = getString(body.company);
  const jobTitle = getString(body.jobTitle);
  const industry = getString(body.industry);
  const experienceLevel = getString(body.experienceLevel);
  const expertise = getStringArray(body.expertise);
  const services = getStringArray(body.services);
  const careerHistorySummary = getString(body.careerHistorySummary);
  const uniqueCareerExperiences = getStringArray(body.uniqueCareerExperiences);
  const mentorshipExperience = normalizeMentorshipExperience(
    getString(body.mentorshipExperience),
  );
  const additionalNotes = getString(body.additionalNotes);
  const maxMeetingsPerMonth = Number(getString(body.maxMeetingsPerMonth));

  const missingFields = [
    ["First Name", firstName],
    ["Last Name", lastName],
    ["Email", email],
    ["Gender", gender],
    ["Company", company],
    ["Job Title", jobTitle],
    ["Industry", industry],
    ["Experience Level", experienceLevel],
  ]
    .filter(([, value]) => !value)
    .map(([label]) => label);

  if (almaMaters.length === 0) missingFields.push("Alma Mater(s)");
  if (majors.length === 0) missingFields.push("Major(s)");
  if (services.length === 0) missingFields.push("Service Types");

  if (!Number.isInteger(maxMeetingsPerMonth) || maxMeetingsPerMonth < 1) {
    missingFields.push("Maximum Meetings Per Month");
  }

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing or invalid required field(s): ${missingFields.join(", ")}.` },
      { status: 400 },
    );
  }

  try {
    const supabase = createSupabaseServerClient();

    const { data: existingAdvisor, error: existingAdvisorError } = await supabase
      .from("advisors")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingAdvisorError) {
      return NextResponse.json(
        { error: existingAdvisorError.message },
        { status: 500 },
      );
    }

    if (existingAdvisor) {
      return NextResponse.json(
        { error: "An advisor submission with this email already exists." },
        { status: 409 },
      );
    }

    const { data: advisor, error: advisorError } = await supabase
      .from("advisors")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        gender,
        alma_mater: almaMaters.join(", "),
        major: majors.join(", "),
        company,
        job_title: jobTitle,
        industry,
        experience_level: experienceLevel,
        reliability_level: "Medium",
        career_history_summary: careerHistorySummary || null,
        unique_career_experiences: uniqueCareerExperiences[0] || null,
        mentorship_experience: mentorshipExperience || null,
        max_meetings_per_month: maxMeetingsPerMonth,
        additional_notes: additionalNotes || null,
      })
      .select("id")
      .single();

    if (advisorError) {
      return NextResponse.json({ error: advisorError.message }, { status: 500 });
    }

    const serviceRows = await upsertLookupValues(supabase, "service_types", services);

    if (serviceRows.length > 0) {
      const { error: advisorServicesError } = await supabase
        .from("advisor_services")
        .insert(
          serviceRows.map((service) => ({
            advisor_id: advisor.id,
            service_id: service.id,
          })),
        );

      if (advisorServicesError) {
        return NextResponse.json(
          { error: advisorServicesError.message },
          { status: 500 },
        );
      }
    }

    const expertiseRows = await upsertLookupValues(
      supabase,
      "expertise_areas",
      expertise,
    );

    if (expertiseRows.length > 0) {
      const { error: advisorExpertiseError } = await supabase
        .from("advisor_expertise")
        .insert(
          expertiseRows.map((area) => ({
            advisor_id: advisor.id,
            expertise_id: area.id,
          })),
        );

      if (advisorExpertiseError) {
        return NextResponse.json(
          { error: advisorExpertiseError.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { advisorId: advisor.id, message: "Advisor submitted successfully." },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while submitting advisor.",
      },
      { status: 500 },
    );
  }
}
