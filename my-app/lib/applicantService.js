import supabase from "@/supabaseClient";

// Fetch all rows from the applicants table
export async function getAllApplicants() {
  const { data, error } = await supabase.from("applicants").select("*");
  return { data, error };
}

// Fetch a single applicant by their id
export async function getApplicantById(id) {
  const { data, error } = await supabase
    .from("applicants")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

// Insert a new row into the applicants table
export async function createApplicant(data) {
  const { data: created, error } = await supabase
    .from("applicants")
    .insert(data)
    .select()
    .single();
  return { data: created, error };
}

// Update an existing applicant by their id
export async function updateApplicant(id, data) {
  const { data: updated, error } = await supabase
    .from("applicants")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  return { data: updated, error };
}
