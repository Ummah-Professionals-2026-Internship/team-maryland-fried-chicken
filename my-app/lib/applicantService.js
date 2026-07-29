import { createClient } from "@/utils/supabase/server";

// The applicants table has more than one relationship to service_types (the
// direct `service_id` FK plus a junction table), so the embed must name the
// FK column explicitly — otherwise PostgREST errors with "more than one
// relationship was found". `service_types!service_id` selects the direct
// one-to-one link, which the UI consumes as a single { name } object.
const SERVICE_EMBED = "*, service_types!service_id(name)";

// Fetch all rows from the applicants table, including the resolved service name
export async function getAllApplicants() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applicants")
    .select("*, service_types:service_types!applicants_service_id_fkey(name)");
  return { data, error };
}

// Fetch a single applicant by their id, including the resolved service name
export async function getApplicantById(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applicants")
    .select("*, service_types:service_types!applicants_service_id_fkey(name)")
    .eq("id", id)
    .single();
  return { data, error };
}

// Insert a new row into the applicants table
export async function createApplicant(data) {
  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from("applicants")
    .insert(data)
    .select()
    .single();
  return { data: created, error };
}

// Update an existing applicant by their id
export async function updateApplicant(id, data) {
  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("applicants")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  return { data: updated, error };
}
