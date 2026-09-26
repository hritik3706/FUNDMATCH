import { Profile } from "../../types/profile.types";
import { EligibilityCriterion } from "../../types/scheme.types";
import { RequirementCheck } from "../../types/matching.types";

function detailFor(state: RequirementCheck["state"], name: string): string {
  if (state === "satisfied") return `${name} is confirmed on the startup profile.`;
  if (state === "missing") return `${name} is not yet confirmed.`;
  if (state === "not_satisfied") return `${name} does not match the published condition.`;
  return `${name} cannot be checked from the information provided.`;
}

export function assessRequirements(profile: Profile, criteria: EligibilityCriterion[]): RequirementCheck[] {
  return criteria.map((criterion) => {
    const name = criterion.name.toLowerCase();
    let state: RequirementCheck["state"] = "unknown";

    if (name.includes("gst")) {
      if (profile.gstStatus === "Registered") state = "satisfied";
      else if (profile.gstStatus === "No") state = "missing";
      else state = "unknown";
    } else if (name.includes("dpiit")) {
      state = profile.dpiitRegistration === true ? "satisfied" : "missing";
    } else if (name.includes("incorporation") || name.includes("company registration")) {
      state = profile.incorporationDate ? "satisfied" : "missing";
    }

    return {
      name: criterion.name,
      required: criterion.required,
      state,
      detail: detailFor(state, criterion.name),
    };
  });
}
