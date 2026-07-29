import { getApplicantById } from "./applicantService.js";
import { getAllAdvisors } from "./advisorService.js";
import { filterEligibleAdvisors } from "./eligibilityService.js";
import { getCareerSimilarity, clearSimilarityCache } from "./careerSimilarityService.js";
import { calculateFinalScore } from "./scoringService.js";
import { rankAdvisors } from "./rankingService.js";

/**
 * Builds the explanation array for a recommendation.
 * Only positive-contribution factors are included — capacity penalty is never shown.
 * Order: career → industry → experience → gender.
 *
 * @param {object} scoreBreakdown - { careerScore, industryScore, experienceScore, genderScore, ... }
 * @param {object} advisor - full advisor row (needs experience_level)
 * @returns {string[]}
 */
function buildExplanation(scoreBreakdown, advisor) {
  const lines = [];

  if (scoreBreakdown.careerScore === 75) lines.push("Exact Career Match");
  else if (scoreBreakdown.careerScore === 65) lines.push("Closely Related Career");
  else if (scoreBreakdown.careerScore === 35) lines.push("Somewhat Related Career");
  // careerScore === 0 → add nothing

  if (scoreBreakdown.industryScore > 0) lines.push("Same Industry");

  if (scoreBreakdown.experienceScore > 0 && advisor.experience_level) {
    lines.push(advisor.experience_level);
  }

  if (scoreBreakdown.genderScore > 0) lines.push("Same Gender");

  return lines;
}

/**
 * Generates ranked advisor recommendations for a given applicant.
 *
 * This function is READ-ONLY — it does NOT write to the recommendations table.
 * Persisting results is the API layer's responsibility (Safa's route).
 *
 * PIPELINE:
 *   1. Fetch applicant via applicantService
 *   2. Fetch all advisors via advisorService (with joined service/expertise data)
 *   3. Filter eligible advisors via eligibilityService (availability, reliability, capacity)
 *   4. Fire all Gemini career similarity calls IN PARALLEL via Promise.all
 *      — safe at OpenRouter's 30 RPM limit; rate limiter in careerSimilarityService
 *        queues any overflow automatically. This is the primary performance optimization:
 *        parallel calls cut generation time from ~60s (sequential) to ~3-5s.
 *   5. Score each advisor via scoringService (pure JS, instant)
 *   6. Rank via rankingService.rankAdvisors (with tie-breaking)
 *   7. Reshape each entry into the final output shape
 *
 * PERFORMANCE NOTE:
 *   The previous implementation used a sequential for...of loop to respect a
 *   5 RPM Gemini free-tier limit. That limit no longer applies — the team
 *   switched to OpenRouter (30 RPM). Running calls in parallel reduces
 *   generation time from the sum of all API latencies to the max of any one call.
 *
 * @param {string} applicantId - UUID of the applicant row in the applicants table
 * @param {{ limit?: number }} [options] - options.limit caps the number of results (default 5)
 *
 * @returns {Promise<Array<{
 *   advisorId: string,
 *   advisorName: string,
 *   advisorJobTitle: string,
 *   totalScore: number,
 *   careerScore: number,
 *   industryScore: number,
 *   experienceScore: number,
 *   genderScore: number,
 *   capacityPenalty: number,
 *   careerSimilarity: string,
 *   explanation: string[]
 * }>>}
 *   Sorted descending by totalScore. advisorName and advisorJobTitle are included
 *   for convenience — consumers building API responses or UIs won't need a second lookup.
 */
export async function generateRecommendations(applicantId, options = {}) {
  const limit = options.limit ?? 5;

  // Clear the similarity cache so each run starts fresh
  clearSimilarityCache();

  // Step 1: fetch the applicant
  const { data: applicant, error: applicantError } = await getApplicantById(applicantId);
  if (applicantError || !applicant) {
    throw new Error(
      `[recommendationEngine] Could not fetch applicant ${applicantId}: ${applicantError?.message ?? "not found"}`
    );
  }

  console.log(
    `[recommendationEngine] Generating recommendations for: ${applicant.first_name} ${applicant.last_name}`
  );

  // Step 2: fetch all advisors with joined service and expertise data
  const { data: advisors, error: advisorsError } = await getAllAdvisors();
  if (advisorsError || !advisors) {
    throw new Error(
      `[recommendationEngine] Could not fetch advisors: ${advisorsError?.message}`
    );
  }

  console.log(`[recommendationEngine] Total advisors fetched: ${advisors.length}`);

  // Step 3: filter eligible advisors
  // eligibilityService augments each passing advisor with _remaining and _currentAssignments
  const { eligible, excluded } = await filterEligibleAdvisors(advisors, applicant);
  console.log(
    `[recommendationEngine] Eligible after filtering: ${eligible.length} (excluded: ${Object.keys(excluded).length})`
  );

  if (eligible.length === 0) {
    console.warn("[recommendationEngine] No eligible advisors — returning empty array.");
    return [];
  }

  // Step 4: fire Gemini career similarity calls in concurrent batches.
  // Batch size matches the rate limiter's window (30 RPM on OpenRouter free tier).
  // Batching avoids firing more simultaneous requests than the rate limit allows
  // in a single window, which would cause the overflow calls to wait a full 60s.
  // With ≤30 eligible advisors the entire pool runs in one batch (~2-5s).
  // With >30 advisors a second batch starts after the first completes.
  const BATCH_SIZE = 30;
  const similarityResults = [];

  console.log(`[recommendationEngine] Firing similarity calls in batches of ${BATCH_SIZE} (${eligible.length} total)...`);

  for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
    const batch = eligible.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((advisor) => getCareerSimilarity(applicant, advisor))
    );
    similarityResults.push(...batchResults);
  }

  // Step 5: score each advisor (pure JS — instant)
  const scoredEntries = eligible.map((advisor, i) => {
    const careerSimilarity = similarityResults[i];
    const remainingCapacity = advisor._remaining; // set by eligibilityService — not recomputed
    const maxMeetingsPerMonth = advisor.max_meetings_per_month ?? 0;

    const scoreBreakdown = calculateFinalScore(
      applicant,
      advisor,
      careerSimilarity,
      remainingCapacity,
      maxMeetingsPerMonth
    );

    return {
      advisor,
      careerSimilarity,
      scoreBreakdown,
      remainingCapacity,
      maxMeetingsPerMonth,
    };
  });

  // Step 6: rank
  const ranked = rankAdvisors(scoredEntries, { limit });

  // Step 7: reshape into final output shape
  return ranked.map(({ advisor, careerSimilarity, scoreBreakdown }) => ({
    advisorId: advisor.id,
    advisorName: `${advisor.first_name ?? ""} ${advisor.last_name ?? ""}`.trim(),
    advisorJobTitle: advisor.job_title ?? "",
    totalScore: scoreBreakdown.totalScore,
    careerScore: scoreBreakdown.careerScore,
    industryScore: scoreBreakdown.industryScore,
    experienceScore: scoreBreakdown.experienceScore,
    genderScore: scoreBreakdown.genderScore,
    capacityPenalty: scoreBreakdown.capacityPenalty,
    careerSimilarity: careerSimilarity.classification,
    explanation: buildExplanation(scoreBreakdown, advisor),
  }));
}
