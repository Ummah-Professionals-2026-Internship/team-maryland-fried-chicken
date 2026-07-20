import { createClient } from "@/utils/supabase/server";

// Adjust these values to match the actual match_status enum in the matches table.
// Any match whose status is in this list will NOT count against an advisor's capacity.
const EXCLUDED_STATUSES = ["Cancelled", "Declined"];

/**
 * Counts how many active matches an advisor has in the current calendar month.
 * @param {string} advisorId
 * @returns {Promise<number>}
 */
export async function getCurrentMonthlyAssignments(advisorId) {
  
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from("matches")
    .select("id, match_status")
    .eq("advisor_id", advisorId)
    .gte("matched_at", monthStart)
    .lte("matched_at", monthEnd);

  if (error) {
    console.warn(`[capacityService] Failed to fetch matches for advisor ${advisorId}:`, error.message);
    return 0;
  }

  const active = (data ?? []).filter(
    (m) => !EXCLUDED_STATUSES.includes(m.match_status)
  );

  return active.length;
}

/**
 * Returns how many more matches an advisor can take this month (minimum 0).
 * @param {object} advisor - advisor row from the database
 * @param {number} currentAssignments - result of getCurrentMonthlyAssignments()
 * @returns {number}
 */
export function getRemainingCapacity(advisor, currentAssignments) {
  const max = advisor.max_meetings_per_month ?? 0;
  return Math.max(0, max - currentAssignments);
}
