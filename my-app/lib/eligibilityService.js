import { getCurrentMonthlyAssignments, getRemainingCapacity } from "./capacityService.js";

/**
 * Filters advisors down to only those eligible to receive a recommendation
 * for the given applicant.
 *
 * An advisor is EXCLUDED if ANY of the following are true (issue #112):
 *   1. availability_status !== 'Available'
 *   2. reliability_level === 'Low'
 *   3. Remaining capacity === 0
 *   4. Advisor does not offer the applicant's requested service type
 *      (see comment below for status of this rule)
 *
 * @param {object[]} advisors - full advisor list from advisorService (with joined advisor_services)
 * @param {object} applicant - applicant row from the database (must include service_id and service_types)
 * @returns {Promise<{ eligible: object[], excluded: Record<string, string> }>}
 *   eligible: advisors who passed all filters, each augmented with _remaining and _currentAssignments
 *   excluded: map of advisorId -> reason string, for debugging/logging
 */
export async function filterEligibleAdvisors(advisors, applicant) {
  const excluded = {};
  const eligible = [];

  for (const advisor of advisors) {
    // Rule 1: availability
    if (advisor.availability_status !== "Available") {
      excluded[advisor.id] = `Advisor unavailable (status: ${advisor.availability_status})`;
      continue;
    }

    // Rule 2: reliability level — Low reliability advisors are never scored (issue #112)
    if (advisor.reliability_level === "Low") {
      excluded[advisor.id] = "Reliability level is Low";
      continue;
    }

    // Rule 3: remaining capacity — strictly zero means fully booked
    const currentAssignments = await getCurrentMonthlyAssignments(advisor.id);
    const remaining = getRemainingCapacity(advisor, currentAssignments);

    if (remaining === 0) {
      excluded[advisor.id] = `No remaining capacity (${currentAssignments}/${advisor.max_meetings_per_month} meetings used)`;
      continue;
    }

    // Not explicitly listed in issue #112's filtering rules — kept as a logical requirement
    // pending confirmation from Manahil. Remove if she confirms it's redundant.
    const applicantServiceName = applicant.service_types?.name ?? null;
    const offeredServiceNames = (advisor.advisor_services ?? [])
      .map((as) => as.service_types?.name)
      .filter(Boolean);

    const serviceMatches = applicantServiceName
      ? offeredServiceNames.includes(applicantServiceName)
      : false;

    if (!serviceMatches) {
      excluded[advisor.id] = `Does not offer required service: ${applicantServiceName ?? applicant.service_id}`;
      continue;
    }

    eligible.push({ ...advisor, _remaining: remaining, _currentAssignments: currentAssignments });
  }

  if (Object.keys(excluded).length > 0) {
    console.log(`[eligibilityService] Excluded ${Object.keys(excluded).length} advisor(s):`, excluded);
  }

  return { eligible, excluded };
}
