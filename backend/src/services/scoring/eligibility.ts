import { EligibilityStatus, Gap } from "../../types/matching.types";

export function determineEligibility(score: number, gaps: Gap[]): EligibilityStatus {
  const criticalGaps = gaps.filter((gap) => gap.impact === "high").length;

  if (score >= 75 && criticalGaps === 0) {
    return "FULLY_ELIGIBLE";
  }
  if (score >= 50 && criticalGaps <= 2) {
    return "PARTIALLY_ELIGIBLE";
  }
  if (score >= 25 && criticalGaps <= 5) {
    return "UNLIKELY_ELIGIBLE";
  }
  return "NOT_ELIGIBLE";
}
