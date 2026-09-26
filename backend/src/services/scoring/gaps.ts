import { Profile } from "../../types/profile.types";
import { EligibilityCriterion } from "../../types/scheme.types";
import { Gap } from "../../types/matching.types";

export function detectGaps(profile: Profile, criteria: EligibilityCriterion[]): Gap[] {
  const gaps: Gap[] = [];

  for (const criterion of criteria) {
    const name = criterion.name.toLowerCase();
    let missing = false;
    let type = "OTHER";
    let howToFix = `Complete ${criterion.name}`;
    let estimatedTime = "a few days";
    let impact = criterion.impact;

    if (name.includes("gst")) {
      type = "GST_REGISTRATION";
      missing = profile.gstStatus !== "Registered";
      howToFix = "Apply on GST portal";
      estimatedTime = "1-2 days";
      impact = "high";
    } else if (name.includes("dpiit")) {
      type = "DPIIT_REGISTRATION";
      missing = profile.dpiitRegistration !== true;
      howToFix = "Register on dpiit.gov.in";
      estimatedTime = "2-3 days";
      impact = criterion.required ? "high" : "medium";
    } else if (name.includes("incorporation") || name.includes("company registration")) {
      type = "INCORPORATION";
      missing = !profile.incorporationDate;
      howToFix = "Incorporate company at ROC";
      estimatedTime = "15-20 days";
      impact = "high";
    }

    if (!missing) {
      continue;
    }

    gaps.push({
      name: criterion.name,
      status: "missing",
      impact,
      howToFix,
      estimatedTime,
      type,
    });
  }

  return gaps;
}

export function completenessScore(criteria: EligibilityCriterion[], gaps: Gap[]): number {
  const mandatory = criteria.filter((criterion) => criterion.required);
  if (mandatory.length === 0) {
    return 1;
  }
  const unmet = mandatory.filter((criterion) =>
    gaps.some((gap) => gap.name.toLowerCase() === criterion.name.toLowerCase()),
  ).length;
  return 1 - unmet / mandatory.length;
}
