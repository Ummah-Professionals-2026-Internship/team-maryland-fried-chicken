// Allowed classification values — Gemini must return exactly one of these.
const ALLOWED_CLASSIFICATIONS = ["Exact Match", "Closely Related", "Somewhat Related", "Unrelated"];

// In-memory cache for a single recommendation run.
// Keyed by "applicantId:advisorId" — prevents duplicate Gemini calls within one run.
const similarityCache = new Map();

// ---------------------------------------------------------------------------
// Rate limiter — sized for Gemini 2.5 Flash free tier: 5 requests per minute.
// Remove or increase RATE_LIMIT/RATE_WINDOW_MS if the project moves to a paid
// tier with higher quotas.
// ---------------------------------------------------------------------------
const RATE_LIMIT = 5;          // max calls allowed per window
const RATE_WINDOW_MS = 60_000; // sliding window size in milliseconds (60 seconds)

// Timestamps (ms) of the most recent Gemini call attempts, oldest first.
const callTimestamps = [];

/**
 * Blocks until a Gemini call is permitted under the sliding-window rate limit,
 * then records the current timestamp before returning.
 * Logs how long it's waiting when a delay is needed.
 */
async function waitForRateLimit() {
  // Evict timestamps that have fallen outside the window
  const now = Date.now();
  while (callTimestamps.length > 0 && now - callTimestamps[0] >= RATE_WINDOW_MS) {
    callTimestamps.shift();
  }

  // If the window is full, wait until the oldest timestamp expires
  if (callTimestamps.length >= RATE_LIMIT) {
    const oldest = callTimestamps[0];
    const waitMs = RATE_WINDOW_MS - (Date.now() - oldest) + 150; // 150ms buffer
    const waitSeconds = Math.ceil(waitMs / 1000);
    console.log(
      `[careerSimilarityService] Rate limit reached (${RATE_LIMIT} RPM free tier). ` +
      `Waiting ${waitSeconds}s before next call...`
    );
    await new Promise((resolve) => setTimeout(resolve, waitMs));

    // Evict again after the wait
    const newNow = Date.now();
    while (callTimestamps.length > 0 && newNow - callTimestamps[0] >= RATE_WINDOW_MS) {
      callTimestamps.shift();
    }
  }

  // Record this call
  callTimestamps.push(Date.now());
}

/**
 * Classifies the relationship between an applicant's desired future career
 * and an advisor's current job title using Gemini 2.5 Flash.
 *
 * Only compares:
 *   - applicant.desired_future_career
 *   - advisor.job_title
 *
 * Returns one of four fixed classifications (never a numeric score):
 *   "Exact Match" | "Closely Related" | "Somewhat Related" | "Unrelated"
 *
 * Never throws — all errors and invalid responses fall back to
 * { classification: "Unrelated", explanation: "..." }.
 *
 * Calls are automatically paced to stay within the free-tier rate limit.
 * Cached results from the same run never hit the API or the rate limiter.
 *
 * @param {object} applicant - must include id and desired_future_career
 * @param {object} advisor   - must include id and job_title
 * @returns {Promise<{ classification: string, explanation: string }>}
 */
export async function getCareerSimilarity(applicant, advisor) {
  const cacheKey = `${applicant.id}:${advisor.id}`;

  if (similarityCache.has(cacheKey)) {
    return similarityCache.get(cacheKey);
  }

  // Read key at call time so a missing key at import time doesn't crash the module
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[careerSimilarityService] GEMINI_API_KEY is not set — skipping career similarity.");
    return { classification: "Unrelated", explanation: "Career similarity unavailable" };
  }

  // Pace the call — may wait here if the rate limit window is full
  await waitForRateLimit();

  const prompt = `You are a career advisor assistant. Classify the relationship between an applicant's desired future career and an advisor's current job title.

Applicant's desired future career: "${applicant.desired_future_career ?? "Not specified"}"
Advisor's current job title: "${advisor.job_title ?? "Not specified"}"

Classify the relationship into EXACTLY ONE of these four categories:
- "Exact Match" — the advisor's job title is the same role or nearly identical to the applicant's goal
- "Closely Related" — the advisor's role is in the same field and directly relevant
- "Somewhat Related" — there is indirect relevance or partial overlap
- "Unrelated" — the advisor's role has no meaningful connection to the applicant's goal

Respond with ONLY a JSON object in this exact format, no other text:
{"classification": "Closely Related", "explanation": "one brief sentence explaining why"}`;

  try {
    const response = await fetch(
      // gemini-2.5-flash stopped accepting new API keys ahead of its Oct 2026
      // shutdown; gemini-3.5-flash is the current stable flagship model.
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 150 },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "(unreadable)");
      throw new Error(`Gemini API returned ${response.status}: ${body}`);
    }

    const json = await response.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip markdown code fences if Gemini wraps the JSON
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.warn(
        `[careerSimilarityService] Could not parse Gemini response as JSON. Got: "${cleaned}"`
      );
      return {
        classification: "Unrelated",
        explanation: "Invalid response from career similarity service — defaulted to Unrelated",
      };
    }

    // Validate classification is one of the four allowed values
    if (!ALLOWED_CLASSIFICATIONS.includes(parsed.classification)) {
      console.warn(
        `[careerSimilarityService] Unexpected classification from Gemini: "${parsed.classification}". ` +
        `Expected one of: ${ALLOWED_CLASSIFICATIONS.join(", ")}`
      );
      return {
        classification: "Unrelated",
        explanation: "Invalid response from career similarity service — defaulted to Unrelated",
      };
    }

    const result = {
      classification: parsed.classification,
      explanation: typeof parsed.explanation === "string" ? parsed.explanation : "",
    };

    similarityCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`[careerSimilarityService] Error calling Gemini for advisor ${advisor.id}:`, err.message);
    return { classification: "Unrelated", explanation: "Career similarity unavailable" };
  }
}

/** Clears the in-memory cache. Call between separate recommendation runs if needed. */
export function clearSimilarityCache() {
  similarityCache.clear();
}
