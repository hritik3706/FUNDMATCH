import { Profile } from "../types/profile.types";
import { Scheme } from "../types/scheme.types";
import { buildFallbackActionPlan } from "../services/fallbackActionPlan";
import { buildFallbackMatch } from "../services/fallbackMatch";
import { buildUnifiedProfile } from "../services/profile/unifiedProfile";
import { determineEligibility } from "../services/scoring/eligibility";
import { componentScores } from "../services/scoring/formula";
import { ideaScore } from "../services/scoring/idea";
import { selectRelevant } from "../services/scoring/relevance";
import { assessRequirements } from "../services/scoring/requirements";
import { readStartupWebsite } from "../services/website/firecrawl";

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

function scheme(
  partial: Pick<Scheme, "id" | "name" | "eligibleSectors" | "eligibleStages" | "fundingMin" | "fundingMax" | "eligibilityCriteria"> &
    Partial<Pick<Scheme, "eligibleLocations">>,
): Scheme {
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

function rowFor(profile: Profile, item: Scheme, futureFit = 0) {
  return {
    match: buildFallbackMatch(profile, item),
    components: componentScores(profile, item),
    futureFit,
  };
}

function counted(label: string, count: number, sectors: string[] = ["EdTech"]) {
  const rows = Array.from({ length: count }, (_, index) =>
    rowFor(
      highProfile,
      scheme({
        id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
        name: `${label} ${index + 1}`,
        eligibleSectors: sectors,
        eligibleStages: ["Seed"],
        fundingMin: 25,
        fundingMax: 100,
        eligibilityCriteria: [incorporated, gst],
      }),
    ),
  );
  const selected = selectRelevant(rows, 40);
  assert(selected.length === (sectors[0] === "EdTech" ? count : 0), `${label} returned ${selected.length}`);
  return selected;
}

counted("one", 1);
counted("five", 5);
counted("twenty", 20);
counted("none", 4, ["HealthTech"]);

const three = selectRelevant(
  [
    rowFor(highProfile, scheme({
      id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      name: "Relevant A",
      eligibleSectors: ["EdTech"],
      eligibleStages: ["Seed"],
      fundingMin: 25,
      fundingMax: 100,
      eligibilityCriteria: [incorporated, gst],
    })),
    rowFor(highProfile, scheme({
      id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
      name: "Unrelated clinic fund",
      eligibleSectors: ["HealthTech"],
      eligibleStages: ["Seed"],
      fundingMin: 25,
      fundingMax: 100,
      eligibilityCriteria: [gst],
    })),
    rowFor(highProfile, scheme({
      id: "12121212-1212-4121-8121-121212121212",
      name: "Karnataka only",
      eligibleSectors: ["EdTech"],
      eligibleStages: ["Seed"],
      fundingMin: 25,
      fundingMax: 100,
      eligibilityCriteria: [gst],
      eligibleLocations: ["Tamil Nadu"],
    })),
  ],
  40,
);
assert(three.length === 1 && three[0].schemeName === "Relevant A", `precision ${three.map((item) => item.schemeName).join(",")}`);

const healthScheme = scheme({
  id: "abababab-abab-4aba-8aba-abababababab",
  name: "Hospital Seed Support",
  eligibleSectors: ["HealthTech"],
  eligibleStages: ["Seed"],
  fundingMin: 25,
  fundingMax: 100,
  eligibilityCriteria: [incorporated, gst],
});
const future = selectRelevant([rowFor(highProfile, healthScheme, ideaScore(clinicIdea, healthScheme))], 40);
assert(future.length === 1 && future[0].relevance === "future", `future ${future[0]?.relevance}`);

const unknownChecks = assessRequirements(highProfile, [{
  id: "women",
  name: "Woman founder certificate",
  description: "Founder identity condition",
  required: true,
  impact: "high",
}]);
assert(determineEligibility(unknownChecks) === "INSUFFICIENT_INFORMATION", determineEligibility(unknownChecks));

const conflicted = buildUnifiedProfile(
  { ...highProfile, sector: "FinTech" },
  "We build payment wallets for lending.",
  "Expand the credit product.",
  {
    url: "https://example.com",
    title: "Care clinic",
    text: "We run a hospital clinic for patient diagnostics and healthcare.",
  },
);
assert(conflicted.sector === "FinTech", "form sector was overwritten");
assert(conflicted.conflicts.some((item) => item.otherSource === "website" && item.otherValue === "HealthTech"), "website conflict missing");

async function verifyWebsiteFailure() {
  const skipped = await readStartupWebsite(null);
  assert(skipped.status === "skipped" && skipped.idea === null, "blank website should skip");
  const failed = await readStartupWebsite("not a url");
  assert(failed.status === "unavailable" && failed.idea === null && Boolean(failed.notice), "bad website should not throw");
}

verifyWebsiteFailure()
  .then(() => {
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
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
