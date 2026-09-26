import { Profile } from "../../types/profile.types";
import { Scheme } from "../../types/scheme.types";

export function buildActionPlanPrompt(profile: Profile, scheme: Scheme, gaps: string[]): string {
  const requirements = scheme.eligibilityCriteria.map((criterion) => criterion.name).join(", ");
  return `You are an expert advisor helping a startup apply for government funding.
Generate a detailed, actionable step-by-step plan for this startup to 
become eligible for and successfully apply to this scheme.

STARTUP:
- Name: ${profile.name}
- Sector: ${profile.sector}
- Stage: ${profile.stage}
- Current Gaps: ${gaps.join(", ") || "None detected"}

SCHEME:
- Name: ${scheme.name}
- Requirements: ${requirements}

GENERATE:
A prioritized list of 5-10 action steps in JSON format.

RESPONSE FORMAT (JSON):
{
  "actionPlan": [
    {
      "stepNumber": 1,
      "title": "Register DPIIT Startup",
      "description": "Complete startup recognition on dpiit.gov.in portal",
      "priority": "critical",
      "estimatedTime": "2 hours",
      "requiredDocuments": ["PAN", "Address Proof", "Board Resolution"],
      "nextStepDependency": false,
      "deadline": "Before scheme application",
      "contactDetails": "https://dpiit.gov.in/contact"
    }
  ],
  "totalEstimatedTime": "4-5 days",
  "timeline": [
    {
      "day": 1,
      "activities": ["Register DPIIT", "Apply for GST"],
      "expected": "Pending status"
    }
  ],
  "successCriteria": "All required documents obtained, eligibility criteria met"
}

Return ONLY valid JSON, no other text.`;
}
