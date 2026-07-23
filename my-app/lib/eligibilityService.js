import { getRemainingCapacity } from "./capacityService.js";

/**
 * Filters advisors down to only those eligible to receive a recommendation
 * for the given applicant.
 *
 * An advisor is EXCLUDED if ANY of the following are true (issue #112):
 *   1. availability_status !== 'Available'
 *   2. reliability_level === 'Low'
 *   3. Remaining capacity === 0
 *
 * currentAssignments is stored directly on the advisor row and is updated
 * by the recommendation accept/undo API workflows.
 *
 * @param {object[]} advisors
 * @param {object} applicant
 * @returns {Promise<{ eligible: object[], excluded: Record<string, string> }>}
 */
export async function filterEligibleAdvisors(advisors, applicant) {
  const excluded = {};
  const eligible = [];

  for (const advisor of advisors) {
    if (advisor.availability_status !== "Available") {
      excluded[advisor.id] =
        `Advisor unavailable (status: ${advisor.availability_status})`;
      continue;
    }

    if (advisor.reliability_level === "Low") {
      excluded[advisor.id] = "Reliability level is Low";
      continue;
    }

    const currentAssignments = Number(advisor.currentAssignments ?? 0);
    const remaining = getRemainingCapacity(advisor, currentAssignments);

    if (remaining === 0) {
      excluded[advisor.id] =
        `No remaining capacity (${currentAssignments}/${advisor.max_meetings_per_month} meetings used)`;
      continue;
    }

    eligible.push({
      ...advisor,
      _remaining: remaining,
      _currentAssignments: currentAssignments,
    });
  }

  if (Object.keys(excluded).length > 0) {
    console.log(
      `[eligibilityService] Excluded ${Object.keys(excluded).length} advisor(s):`,
      excluded,
    );
  }

  return { eligible, excluded };
}
