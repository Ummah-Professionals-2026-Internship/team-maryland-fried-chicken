// ---------------------------------------------------------------------------
// Point-value constants — adjust values here to retune the scoring model.
// ---------------------------------------------------------------------------

export const CAREER_POINTS = {
  "Exact Match": 50,
  "Closely Related": 38,
  "Somewhat Related": 20,
  "Unrelated": 0,
};

export const EXPERIENCE_POINTS = {
  "Senior Professional (10+ Years)": 15,
  "Graduate/Working Student": 11,
  "Young Professional (0-3 Years)": 7,
  "Mid-Career Professional (3-10 Years)": 3,
};

export const INDUSTRY_MATCH_POINTS = 30;

export const GENDER_MATCH_POINTS = 5;

// Genders treated as equivalent during comparison.
// Key is the stored value, mapped value is what it normalizes to.
export const GENDER_EQUIVALENTS = {
  "Brother": "Male",
};

// ---------------------------------------------------------------------------
// Scoring functions
// ---------------------------------------------------------------------------

/**
 * Returns the point value for a given career similarity classification.
 * @param {string} classification - one of the four CAREER_POINTS keys
 * @returns {number}
 */
export function scoreCareerMatch(classification) {
  if (!(classification in CAREER_POINTS)) {
    console.warn(`[scoringService] Unrecognized career classification: "${classification}" — returning 0`);
    return 0;
  }
  return CAREER_POINTS[classification];
}

/**
 * Returns INDUSTRY_MATCH_POINTS if applicant and advisor share the same industry, else 0.
 * Uses exact string match on the raw `industry` column from both tables.
 * @param {object} applicant
 * @param {object} advisor
 * @returns {number}
 */
export function scoreIndustryMatch(applicant, advisor) {
  return applicant.industry === advisor.industry ? INDUSTRY_MATCH_POINTS : 0;
}

/**
 * Returns the experience bonus for an advisor based on their experience_level column.
 * @param {object} advisor
 * @returns {number}
 */
export function scoreExperienceBonus(advisor) {
  const level = advisor.experience_level;
  if (!(level in EXPERIENCE_POINTS)) {
    console.warn(`[scoringService] Unrecognized experience level: "${level}" — returning 0`);
    return 0;
  }
  return EXPERIENCE_POINTS[level];
}

/**
 * Normalizes a gender value using GENDER_EQUIVALENTS.
 * If the value is a key in the map, returns the mapped value; otherwise returns unchanged.
 * @param {string|null|undefined} genderValue
 * @returns {string|null|undefined}
 */
export function normalizeGender(genderValue) {
  if (genderValue in GENDER_EQUIVALENTS) {
    return GENDER_EQUIVALENTS[genderValue];
  }
  return genderValue;
}

/**
 * Returns GENDER_MATCH_POINTS if applicant and advisor gender match after normalization.
 * Returns 0 if either gender is missing, or if they don't match.
 * @param {object} applicant
 * @param {object} advisor
 * @returns {number}
 */
export function scoreGenderBonus(applicant, advisor) {
  if (!applicant.gender || !advisor.gender) {
    console.warn(
      `[scoringService] Missing gender — applicant: "${applicant.gender}", advisor: "${advisor.gender}" — returning 0`
    );
    return 0;
  }
  const normalizedApplicant = normalizeGender(applicant.gender);
  const normalizedAdvisor = normalizeGender(advisor.gender);
  return normalizedApplicant === normalizedAdvisor ? GENDER_MATCH_POINTS : 0;
}

/**
 * Returns a capacity adjustment penalty based on how utilized the advisor is.
 *
 * Utilization = ((maxMeetingsPerMonth - remainingCapacity) / maxMeetingsPerMonth) * 100
 *
 *   0–50% utilized  →  0
 *   51–80% utilized → -2
 *   81–99% utilized → -5
 *   100% utilized   → -5 (with warning — should have been excluded by eligibilityService)
 *
 * @param {number} remainingCapacity
 * @param {number} maxMeetingsPerMonth
 * @returns {number}
 */
export function scoreCapacityAdjustment(remainingCapacity, maxMeetingsPerMonth) {
  if (!maxMeetingsPerMonth || maxMeetingsPerMonth <= 0) return 0;

  const utilized = ((maxMeetingsPerMonth - remainingCapacity) / maxMeetingsPerMonth) * 100;

  if (utilized >= 100) {
    console.warn(
      "[scoringService] Advisor at 100% capacity reached scoring — should have been filtered out by eligibilityService"
    );
    return -5;
  }
  if (utilized >= 81) return -5;
  if (utilized >= 51) return -2;
  return 0;
}

/**
 * Sums all scored components into a final score.
 *
 * @param {object} applicant
 * @param {object} advisor
 * @param {{ classification: string, explanation: string }} careerSimilarityResult
 * @param {number} remainingCapacity
 * @param {number} maxMeetingsPerMonth
 * @returns {{
 *   totalScore: number,
 *   careerScore: number,
 *   industryScore: number,
 *   experienceScore: number,
 *   genderScore: number,
 *   capacityPenalty: number
 * }}
 */
export function calculateFinalScore(
  applicant,
  advisor,
  careerSimilarityResult,
  remainingCapacity,
  maxMeetingsPerMonth
) {
  const careerScore = scoreCareerMatch(careerSimilarityResult.classification);
  const industryScore = scoreIndustryMatch(applicant, advisor);
  const experienceScore = scoreExperienceBonus(advisor);
  const genderScore = scoreGenderBonus(applicant, advisor);
  const capacityPenalty = scoreCapacityAdjustment(remainingCapacity, maxMeetingsPerMonth);

  const totalScore = careerScore + industryScore + experienceScore + genderScore + capacityPenalty;

  return {
    totalScore,
    careerScore,
    industryScore,
    experienceScore,
    genderScore,
    capacityPenalty,
  };
}
