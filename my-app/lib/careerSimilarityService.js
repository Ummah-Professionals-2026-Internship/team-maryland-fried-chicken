// Allowed classification values — Gemini must return exactly one of these.
const ALLOWED_CLASSIFICATIONS = ["Exact Match", "Closely Related", "Somewhat Related", "Unrelated"];

// In-memory cache for a single recommendation run.
// Keyed by "applicantId:advisorId" — prevents duplicate Gemini calls within one run.
const similarityCache = new Map();

// ---------------------------------------------------------------------------
// Rate limiter — sized for the gemma-4-31b-it free tier (~30 requests per
// minute), called via OpenRouter with a BYOK Google AI Studio key.
// Lower to 15 if you see upstream 429s; raise only if you move to a paid tier.
// ---------------------------------------------------------------------------
const RATE_LIMIT = 30;          // max calls allowed per window
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
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn("[careerSimilarityService] OPENROUTER_API_KEY is not set — skipping career similarity.");
    return { classification: "Unrelated", explanation: "Career similarity unavailable" };
  }

  // Pace the call — may wait here if the rate limit window is full
  await waitForRateLimit();

  const prompt = `You are a career advisor assistant matching students with mentors. Classify the relationship between an applicant's desired future career and an advisor's current job title, so a coordinator can judge how useful this advisor's mentorship would be.

Applicant's desired future career: "${applicant.desired_future_career ?? "Not specified"}"
Advisor's current job title: "${advisor.job_title ?? "Not specified"}"

Base your classification primarily on:
- Similarity of the actual occupation (what the person does day-to-day)
- Transferable career experience (skills, tools, or domain knowledge that carry over)
- Mentorship relevance (could this advisor give concrete, specific guidance on reaching the applicant's goal?)
- Professional career progression (is one role a natural stepping stone to the other, within the same profession or into a closely adjacent one?)

Do NOT classify based on broad industry alone. Two roles in the same industry can require substantially different education, day-to-day work, and skills — that alone does not make them closely related.

Classify the relationship into EXACTLY ONE of these four categories:
- "Exact Match" — the same occupation, including the same role at a different seniority level (e.g. "Software Engineer" vs "Senior Software Engineer"), or titles that are effectively interchangeable (e.g. "Software Engineer" vs "Software Developer").
- "Closely Related" — a genuinely different title and occupation, but one with substantial overlap in day-to-day work, skills, or team context, such that the advisor could give hands-on, specific guidance (e.g. a Business Analyst mentoring an aspiring Project Manager; a Nurse Practitioner mentoring an aspiring Registered Nurse). This is NOT the same occupation at a different seniority level — that is Exact Match.
- "Somewhat Related" — same broad industry or transferable skills, but meaningfully different occupation, education path, or day-to-day responsibilities (e.g. a Financial Analyst mentoring an aspiring Accountant; a Graphic Designer mentoring an aspiring UX Designer). This is the default when the fields merely overlap.
- "Unrelated" — no meaningful occupational overlap or transferable relevance (e.g. a Mechanical Engineer mentoring an aspiring Elementary School Teacher).

Be conservative: only choose "Closely Related" or "Exact Match" when the advisor could realistically give specific, actionable guidance toward the applicant's exact target role. When in doubt between two categories, choose the more conservative (less related) one.

Examples:
- Applicant wants "Registered Nurse", advisor is "Registered Nurse" -> {"classification": "Exact Match", "explanation": "Same occupation."}
- Applicant wants "Software Engineer", advisor is "Senior Software Engineer" -> {"classification": "Exact Match", "explanation": "Same occupation, differs only by seniority level."}
- Applicant wants "Project Manager", advisor is "Business Analyst" -> {"classification": "Closely Related", "explanation": "Distinct roles that work closely together with significant overlap in skills and day-to-day collaboration, enabling specific guidance."}
- Applicant wants "Corporate Lawyer", advisor is "Paralegal" -> {"classification": "Somewhat Related", "explanation": "Same legal field but a different role with a different education path and day-to-day work."}
- Applicant wants "Marketing Manager", advisor is "Sales Representative" -> {"classification": "Somewhat Related", "explanation": "Related business functions with transferable skills, but distinct day-to-day responsibilities."}
- Applicant wants "High School Teacher", advisor is "Corporate Trainer" -> {"classification": "Somewhat Related", "explanation": "Both involve instruction, but different audiences, settings, and credentialing."}
- Applicant wants "Mechanical Engineer", advisor is "Civil Engineer" -> {"classification": "Somewhat Related", "explanation": "Both are engineering disciplines but require different technical training and work on different problems."}
- Applicant wants "Graphic Designer", advisor is "Illustrator" -> {"classification": "Closely Related", "explanation": "Distinct roles with closely overlapping creative skill sets and a typical shared career path."}
- Applicant wants "Investment Banker", advisor is "Financial Advisor" -> {"classification": "Somewhat Related", "explanation": "Both are finance roles but differ substantially in day-to-day work and client focus."}
- Applicant wants "Physical Therapist", advisor is "Software Engineer" -> {"classification": "Unrelated", "explanation": "No meaningful occupational or skill overlap."}

Respond with ONLY a JSON object in this exact format, no other text:
{"classification": "Closely Related", "explanation": "one brief sentence explaining why"}`;

    try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // model: "google/gemini-2.5-flash-lite",
        model: "google/gemma-4-31b-it:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 150,
        response_format: { type: "json_object" }, // ask for raw JSON
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "(unreadable)");
      throw new Error(`OpenRouter API returned ${response.status}: ${body}`);
    }

    const json = await response.json();
    const rawText = json?.choices?.[0]?.message?.content ?? "";

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
