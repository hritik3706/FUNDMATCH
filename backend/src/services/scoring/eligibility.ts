import { EligibilityStatus, RequirementCheck } from "../../types/matching.types";

export function determineEligibility(checks: RequirementCheck[]): EligibilityStatus {
  if (checks.length === 0) {
    return "INSUFFICIENT_INFORMATION";
  }

  const required = checks.filter((check) => check.required);
  const pool = required.length > 0 ? required : checks;

  if (pool.every((check) => check.state === "unknown")) {
    return "INSUFFICIENT_INFORMATION";
  }
  if (pool.some((check) => check.state === "not_satisfied")) {
    return "NOT_ELIGIBLE";
  }
  if (pool.every((check) => check.state === "satisfied")) {
    return "FULLY_ELIGIBLE";
  }
  return "PARTIALLY_ELIGIBLE";
}
