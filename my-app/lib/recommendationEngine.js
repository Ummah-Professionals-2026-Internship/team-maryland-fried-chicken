import { getApplicantById } from "./applicantService.js";
import { getAllAdvisors } from "./advisorService.js";
import { filterEligibleAdvisors } from "./eligibilityService.js";
import { getCareerSimilarity, clearSimilarityCache } from "./careerSimilarityService.js";
import {
  calculateFinalScore,
  scoreIndustryMatch,
  scoreExperienceBonus,
  scoreGenderBonus,
  scoreCapacityAdjustment,
} from "./scoringService.js";
import { rankAdvisors } from "./rankingService.js";

// How many top candidates (by non-AI pre-score) to run through Gemini.
// Set to 3× the desired output as a buffer — the true top 5 almost always
// come from the top 15 pre-scored candidates.
// Reducing this is the primary lever for controlling AI API call volume.
const GEMINI_CANDIDATE_LIMIT = 15;

/**
 * Computes a pre-score for an advisor using only the non-AI factors
 * (industry, experience, gender, capacity). Used to shortlist candidates
 * before making any Gemini API calls.
 * Max possible pre-score: 10 + 10 + 5 + 0 = 25 (capacity penalty excluded from pre-sort)
 */
function preScore(applicant, advisor) {
  return (
    scoreIndustryMatch(applicant, advisor) +
    scoreExperienceBonus(advisor) +
    scoreGenderBonus(applicant, advisor)
  );
}

/**
 * Builds the explanation array for a recommendation.
 * Only positive-contribution factors are included — capacity penalty is never shown.
 * Order: career → industry → experience → gender.
 */
function buildExplanation(scoreBreakdown, advisor) {
  const lines = [];

  if (scoreBreakdown.careerScore === 75) lines.push("Exact Career Match");
  else if (scoreBreakdown.careerScore === 65) lines.push("Closely Related Career");
  else if (scoreBreakdown.careerScore === 35) lines.push("Somewhat Related Career");

  if (scoreBreakdown.industryScore > 0) lines.push("Same Industry");
  if (scoreBreakdown.experienceScore > 0 && advisor.experience_level) lines.push(advisor.experience_level);
  if (scoreBreakdown.genderScore > 0) lines.push("Same Gender");

  return lines;
}

/**
 * Generates ranked advisor recommendations for a given applicant.
 *
 * This function is READ-ONLY — it does NOT write to the recommendations table.
 * Persisting results is the API layer's responsibility.
 *
 * PIPELINE:
 *   1. Fetch applicant
 *   2. Fetch all advisors (with joined data)
 *   3. Filter eligible advisors (availability, reliability, capacity)
 *   4. Pre-score all eligible advisors using non-AI factors only (instant, no API calls)
 *      Sort by pre-score and keep only the top GEMINI_CANDIDATE_LIMIT candidates.
 *      This reduces Gemini calls from ~60 down to 15 regardless of dataset size,
 *      staying within free-tier daily quotas and RPM limits.
 *   5. Call Gemini in parallel for the shortlisted candidates only
 *   6. Compute full scores and rank
 *   7. Return top N
 *
 * @param {string} applicantId
 * @param {{ limit?: number }} [options] - default 5
 * @returns {Promise<Array<{
 *   advisorId, advisorName, advisorJobTitle,
 *   totalScore, careerScore, industryScore, experienceScore, genderScore, capacityPenalty,
 *   careerSimilarity, explanation
 * }>>}
 */
export async function generateRecommendations(applicantId, options = {}) {
  const limit = options.limit ?? 5;

  clearSimilarityCache();

  // Step 1: fetch the applicant
  const { data: applicant, error: applicantError } = await getApplicantById(applicantId);
  if (applicantError || !applicant) {
    throw new Error(
      `[recommendationEngine] Could not fetch applicant ${applicantId}: ${applicantError?.message ?? "not found"}`
    );
  }

  console.log(`[recommendationEngine] Generating recommendations for: ${applicant.first_name} ${applicant.last_name}`);

  // Step 2: fetch all advisors
  const { data: advisors, error: advisorsError } = await getAllAdvisors();
  if (advisorsError || !advisors) {
    throw new Error(`[recommendationEngine] Could not fetch advisors: ${advisorsError?.message}`);
  }

  console.log(`[recommendationEngine] Total advisors fetched: ${advisors.length}`);

  // Step 3: eligibility filter
  const { eligible, excluded } = await filterEligibleAdvisors(advisors, applicant);
  console.log(`[recommendationEngine] Eligible after filtering: ${eligible.length} (excluded: ${Object.keys(excluded).length})`);

  if (eligible.length === 0) {
    console.warn("[recommendationEngine] No eligible advisors — returning empty array.");
    return [];
  }

  // Step 4: pre-score using non-AI factors and shortlist for Gemini
  // This is the key optimization: instead of calling Gemini for every eligible advisor,
  // we pre-rank using industry + experience + gender (instant, no API calls) and only
  // send the top GEMINI_CANDIDATE_LIMIT candidates to Gemini.
  const shortlisted = eligible
    .map((advisor) => ({ advisor, nonAiScore: preScore(applicant, advisor) }))
    .sort((a, b) => b.nonAiScore - a.nonAiScore)
    .slice(0, GEMINI_CANDIDATE_LIMIT)
    .map(({ advisor }) => advisor);

  console.log(`[recommendationEngine] Shortlisted ${shortlisted.length} of ${eligible.length} candidates for Gemini scoring.`);

  // Step 5: call Gemini in parallel for shortlisted candidates only
  const similarityResults = await Promise.all(
    shortlisted.map((advisor) => getCareerSimilarity(applicant, advisor))
  );

  // Step 6: full score and assemble entries
  const scoredEntries = shortlisted.map((advisor, i) => {
    const careerSimilarity = similarityResults[i];
    const remainingCapacity = advisor._remaining;
    const maxMeetingsPerMonth = advisor.max_meetings_per_month ?? 0;

    const scoreBreakdown = calculateFinalScore(
      applicant,
      advisor,
      careerSimilarity,
      remainingCapacity,
      maxMeetingsPerMonth
    );

    return { advisor, careerSimilarity, scoreBreakdown, remainingCapacity, maxMeetingsPerMonth };
  });

  // Step 7: rank and reshape
  const ranked = rankAdvisors(scoredEntries, { limit });

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
