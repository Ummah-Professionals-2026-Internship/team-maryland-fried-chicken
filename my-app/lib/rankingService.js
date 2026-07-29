/**
 * Pure ranking utility — sorts scored advisor entries and returns the top N.
 * No API calls, no database access, no side effects.
 */

const DEFAULT_LIMIT = 5;

/**
 * Sorts scored advisor entries descending by total score and returns the top N.
 *
 * INPUT SHAPE — each entry in scoredEntries:
 * {
 *   advisor: object,                          // full advisor row from Supabase
 *   careerSimilarity: {
 *     classification: string,                 // "Exact Match" | "Closely Related" | "Somewhat Related" | "Unrelated"
 *     explanation: string
 *   },
 *   scoreBreakdown: {
 *     totalScore: number,
 *     careerScore: number,
 *     industryScore: number,
 *     experienceScore: number,
 *     genderScore: number,
 *     capacityPenalty: number
 *   },
 *   remainingCapacity: number,
 *   maxMeetingsPerMonth: number
 * }
 *
 * TIE-BREAKING PRIORITY (applied in order when totalScore is equal):
 *   1. Higher careerScore wins
 *   2. Higher industryScore wins
 *   3. Higher experienceScore wins
 *   4. Lower capacity utilization wins
 *      (utilization = ((maxMeetingsPerMonth - remainingCapacity) / maxMeetingsPerMonth) * 100)
 *   5. Original array order preserved as final deterministic fallback (stable sort)
 *
 * RETURN SHAPE — same as input shape, reordered and truncated to options.limit.
 * If fewer entries exist than the limit, all available entries are returned.
 *
 * @param {object[]} scoredEntries
 * @param {{ limit?: number }} [options]
 * @returns {object[]}
 */
export function rankAdvisors(scoredEntries, options = {}) {
  const limit = options.limit ?? DEFAULT_LIMIT;

  console.log(`[rankingService] Ranking ${scoredEntries.length} entries, returning up to ${limit}`);

  // Tag each entry with its original index for stable-sort fallback (rule 5)
  const indexed = scoredEntries.map((entry, i) => ({ entry, originalIndex: i }));

  indexed.sort((a, b) => {
    const aB = a.entry.scoreBreakdown;
    const bB = b.entry.scoreBreakdown;

    // Primary: total score descending
    if (bB.totalScore !== aB.totalScore) return bB.totalScore - aB.totalScore;

    // Tie-break 1: career score descending
    if (bB.careerScore !== aB.careerScore) return bB.careerScore - aB.careerScore;

    // Tie-break 2: industry score descending
    if (bB.industryScore !== aB.industryScore) return bB.industryScore - aB.industryScore;

    // Tie-break 3: experience score descending
    if (bB.experienceScore !== aB.experienceScore) return bB.experienceScore - aB.experienceScore;

    // Tie-break 4: lower capacity utilization wins (ascending)
    const utilizationA =
      a.entry.maxMeetingsPerMonth > 0
        ? ((a.entry.maxMeetingsPerMonth - a.entry.remainingCapacity) / a.entry.maxMeetingsPerMonth) * 100
        : 0;
    const utilizationB =
      b.entry.maxMeetingsPerMonth > 0
        ? ((b.entry.maxMeetingsPerMonth - b.entry.remainingCapacity) / b.entry.maxMeetingsPerMonth) * 100
        : 0;

    if (utilizationA !== utilizationB) return utilizationA - utilizationB;

    // Tie-break 5: preserve original array order (stable sort fallback)
    return a.originalIndex - b.originalIndex;
  });

  const ranked = indexed.slice(0, limit).map(({ entry }) => entry);

  console.log(`[rankingService] Returning ${ranked.length} ranked entries`);
  return ranked;
}
