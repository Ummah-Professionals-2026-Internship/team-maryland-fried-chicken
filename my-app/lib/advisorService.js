import supabase from "@/supabaseClient";

// Fetch all rows from the advisors table
export async function getAllAdvisors() {
  const { data, error } = await supabase.from("advisors").select("*");
  return { data, error };
}

// Fetch a single advisor by their id
export async function getAdvisorById(id) {
  const { data, error } = await supabase
    .from("advisors")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

// Insert a new row into the advisors table
export async function createAdvisor(data) {
  const { data: created, error } = await supabase
    .from("advisors")
    .insert(data)
    .select()
    .single();
  return { data: created, error };
}

// Update an existing advisor by their id
export async function updateAdvisor(id, data) {
  const { data: updated, error } = await supabase
    .from("advisors")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  return { data: updated, error };
}
