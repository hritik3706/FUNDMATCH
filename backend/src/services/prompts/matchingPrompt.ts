import { Profile } from "../../types/profile.types";
import { Scheme } from "../../types/scheme.types";

export function buildMatchingPrompt(profile: Profile, scheme: Scheme, ideaText?: string): string {
  const criteria = scheme.eligibilityCriteria
    .map(
      (criterion) =>
        `- ${criterion.name} (${criterion.required ? "REQUIRED" : "Optional"}): ${criterion.description}`,
    )
    .join("\n");

  return `You are an expert in Indian government startup funding schemes. 
Analyze the following startup profile against scheme requirements 
and provide a detailed compatibility assessment.

STARTUP PROFILE:
- Company Name: ${profile.name}
- Sector: ${profile.sector}
- Stage: ${profile.stage}
- Location: ${profile.location}
- Funding Needed: ₹${profile.fundingNeeded} lakhs
- Founder Experience: ${profile.founderExperience}
- Previous Funding: ₹${profile.previousFunding || 0} lakhs
- GST Status: ${profile.gstStatus || "Unknown"}
- DPIIT Recognition: ${profile.dpiitRegistration || "No"}
- Website: ${profile.websiteUrl || "Not provided"}

WEBSITE IDEA:
${ideaText || "No website text was available. Score the profile fields only."}

SCHEME DETAILS:
- Name: ${scheme.name}
- Description: ${scheme.description}
- Eligible Sectors: ${scheme.eligibleSectors.join(", ")}
- Eligible Stages: ${scheme.eligibleStages.join(", ")}
- Funding Range: ₹${scheme.fundingMin}L - ₹${scheme.fundingMax}L
- Eligible Locations: ${scheme.eligibleLocations.join(", ")}

ELIGIBILITY CRITERIA:
${criteria}

ANALYSIS REQUIRED:
1. Calculate a compatibility score (0-100)
2. List which criteria the startup MEETS
3. List which criteria the startup is MISSING
4. For each missing criterion, explain how to fix it
5. Provide overall reasoning for the score

RESPONSE FORMAT (JSON):
{
  "schemeId": "${scheme.id}",
  "schemeName": "${scheme.name}",
  "compatibilityScore": <number 0-100>,
  "matchedCriteria": [
    {
      "name": "string",
      "status": "met",
      "explanation": "why this is met"
    }
  ],
  "missingRequirements": [
    {
      "name": "string",
      "status": "missing",
      "impact": "high|medium|low",
      "howToFix": "specific steps to fix this",
      "estimatedTime": "e.g., 2-3 days"
    }
  ],
  "overallReasoning": "2-3 sentence explanation of why this score",
  "nextSteps": ["step1", "step2", "step3"]
}

Return ONLY valid JSON, no other text.`;
}
