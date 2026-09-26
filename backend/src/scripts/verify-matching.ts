import { Profile } from "../types/profile.types";
import { Scheme } from "../types/scheme.types";
import { buildFallbackActionPlan } from "../services/fallbackActionPlan";
import { buildFallbackMatch } from "../services/fallbackMatch";
import { ideaScore } from "../services/scoring/idea";

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const highProfile: Profile = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "TechStart India",
  sector: "EdTech",
  stage: "Seed",
  location: "Bangalore",
  fundingNeeded: 50,
  founderExperience: "First-time",
  incorporationDate: "2024-04-01",
  gstStatus: "Registered",
  dpiitRegistration: true,
  previousFunding: 0,
  websiteUrl: null,
  createdAt: "2026-09-26T00:00:00.000Z",
};

const partialProfile: Profile = {
  ...highProfile,
  id: "22222222-2222-4222-8222-222222222222",
  name: "Partial Learn",
  stage: "Series A",
  fundingNeeded: 200,
  gstStatus: "No",
  dpiitRegistration: false,
};

const noneProfile: Profile = {
  ...highProfile,
  id: "33333333-3333-4333-8333-333333333333",
  name: "CareFirst",
  sector: "HealthTech",
  stage: "Pre-seed",
  location: "Delhi",
  fundingNeeded: 10,
  incorporationDate: null,
  gstStatus: "No",
  dpiitRegistration: false,
};

function scheme(partial: Pick<Scheme, "id" | "name" | "eligibleSectors" | "eligibleStages" | "fundingMin" | "fundingMax" | "eligibilityCriteria">): Scheme {
  return {
    description: partial.name,
    eligibleLocations: ["Pan India"],
    sourceUrl: null,
    schemeType: "Central",
    ...partial,
  };
}

const gst = {
  id: "gst",
  name: "GST Registration",
  description: "GST registration",
  required: true,
  impact: "high" as const,
};

const incorporated = {
  id: "incorporation",
  name: "Incorporation Certificate",
  description: "Incorporated in India",
  required: true,
  impact: "high" as const,
};

const high = buildFallbackMatch(
  highProfile,
  scheme({
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "NASSCOM Startup Scheme",
    eligibleSectors: ["EdTech"],
    eligibleStages: ["Seed"],
    fundingMin: 25,
    fundingMax: 100,
    eligibilityCriteria: [incorporated, gst],
  }),
);

const partial = buildFallbackMatch(
  partialProfile,
  scheme({
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    name: "EdTech Growth Window",
    eligibleSectors: ["EdTech"],
    eligibleStages: ["Seed", "Series A"],
    fundingMin: 25,
    fundingMax: 150,
    eligibilityCriteria: [gst],
  }),
);

const none = buildFallbackMatch(
  noneProfile,
  scheme({
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    name: "EdTech Series A Fund",
    eligibleSectors: ["EdTech"],
    eligibleStages: ["Series A"],
    fundingMin: 100,
    fundingMax: 500,
    eligibilityCriteria: [gst],
  }),
);

assert(high.compatibilityScore >= 90 && high.compatibilityScore <= 100, `high match ${high.compatibilityScore}`);
assert(partial.compatibilityScore >= 60 && partial.compatibilityScore <= 75, `partial match ${partial.compatibilityScore}`);
assert(none.compatibilityScore >= 15 && none.compatibilityScore <= 30, `no match ${none.compatibilityScore}`);
assert(high.eligibilityStatus === "FULLY_ELIGIBLE", high.eligibilityStatus);

const plan = buildFallbackActionPlan(partialProfile, scheme({
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  name: "EdTech Growth Window",
  eligibleSectors: ["EdTech"],
  eligibleStages: ["Seed", "Series A"],
  fundingMin: 25,
  fundingMax: 150,
  eligibilityCriteria: [gst],
}));
assert(plan.steps.length >= 5 && plan.steps.length <= 10, `steps ${plan.steps.length}`);
assert(plan.fallbackMode === true, "fallback flag missing");

const edtechScheme = scheme({
  id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  name: "Classroom Grant",
  eligibleSectors: ["EdTech"],
  eligibleStages: ["Seed"],
  fundingMin: 10,
  fundingMax: 50,
  eligibilityCriteria: [gst],
});
const schoolIdea = "We build an online learning platform for school students and teachers with classroom courses.";
const clinicIdea = "We run a hospital clinic for patient diagnostics and medical records.";
const schoolFit = ideaScore(schoolIdea, edtechScheme);
const clinicFit = ideaScore(clinicIdea, edtechScheme);
assert(schoolFit > clinicFit, `school idea ${schoolFit} should beat clinic idea ${clinicFit}`);
const withSite = buildFallbackMatch({ ...highProfile, websiteUrl: "https://example.com" }, edtechScheme, schoolIdea);
assert(withSite.scoreBreakdown.ideaMatch !== undefined, "idea points missing");
assert((withSite.websiteIdea ?? "").includes("learning"), "website idea was not stored");

console.log(
  JSON.stringify(
    {
      high: high.compatibilityScore,
      partial: partial.compatibilityScore,
      none: none.compatibilityScore,
      steps: plan.steps.length,
    },
    null,
    2,
  ),
);
