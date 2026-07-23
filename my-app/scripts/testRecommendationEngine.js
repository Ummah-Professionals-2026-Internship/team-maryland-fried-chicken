/**
 * End-to-end test for the recommendation engine.
 *
 * Run from the my-app/ directory:
 *
 *   node --import ./scripts/pathAlias.mjs scripts/testRecommendationEngine.js <applicant-uuid>
 *
 * Get a real UUID by calling: GET /api/applicants (first "id" field)
 */

import "dotenv/config";
import { generateRecommendations } from "../lib/recommendationEngine.js";

const APPLICANT_ID = process.argv[2];

if (!APPLICANT_ID) {
  console.error("Usage: node --import ./scripts/pathAlias.mjs scripts/testRecommendationEngine.js <applicant-uuid>");
  console.error("\nGet a real UUID from: GET /api/applicants (look for the 'id' field)");
  process.exit(1);
}

console.log("=".repeat(60));
console.log("Recommendation Engine — End-to-End Test");
console.log("=".repeat(60));
console.log(`Applicant ID: ${APPLICANT_ID}\n`);

try {
  const recommendations = await generateRecommendations(APPLICANT_ID, { limit: 3 });

  if (recommendations.length === 0) {
    console.log("\nNo recommendations returned.");
    console.log("Possible reasons:");
    console.log("  - Advisor unavailable (availability_status !== 'Available')");
    console.log("  - Reliability level is Low");
    console.log("  - No remaining capacity this month");
    process.exit(0);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Top ${recommendations.length} Recommendation(s)`);
  console.log("=".repeat(60));

  recommendations.forEach((rec, index) => {
    const rank = index + 1;
    console.log(`\n#${rank} — ${rec.advisorName}`);
    console.log(`   ${rec.advisorJobTitle}`);
    console.log(`   Total Score:  ${rec.totalScore}`);
    console.log(`   Breakdown:`);
    console.log(`     Career:     ${rec.careerScore}`);
    console.log(`     Industry:   ${rec.industryScore}`);
    console.log(`     Experience: ${rec.experienceScore}`);
    console.log(`     Gender:     ${rec.genderScore}`);
    console.log(`     Capacity:   ${rec.capacityPenalty}`);
    console.log(`   Career Similarity: ${rec.careerSimilarity}`);
    console.log(`   Explanation:  ${rec.explanation.length > 0 ? rec.explanation.join(" | ") : "(none)"}`);
  });

  console.log(`\n${"=".repeat(60)}`);
  console.log("Test complete.");
} catch (err) {
  console.error("\nError:", err.message);
  process.exit(1);
}
