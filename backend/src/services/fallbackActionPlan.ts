import { Profile } from "../types/profile.types";
import { Scheme } from "../types/scheme.types";
import { ActionPlan, ActionStep } from "../types/matching.types";
import { detectGaps } from "./scoring/gaps";

const FALLBACK_REASON = "Using generic action plan (details may be less accurate)";

export function buildFallbackActionPlan(profile: Profile, scheme: Scheme): ActionPlan {
  const gaps = detectGaps(profile, scheme.eligibilityCriteria);
  const steps: ActionStep[] = [
    {
      stepNumber: 1,
      title: "Confirm company registration",
      description: `Make sure ${profile.name} has an incorporation certificate before applying to ${scheme.name}.`,
      priority: "critical",
      estimatedTime: "1 day",
      requiredDocuments: ["Certificate of Incorporation", "PAN"],
      deadline: "Before application",
      contactDetails: "https://www.mca.gov.in",
    },
    {
      stepNumber: 2,
      title: "Register or confirm DPIIT recognition",
      description: "Apply for startup recognition if it is not already approved.",
      priority: "critical",
      estimatedTime: "2 hours",
      requiredDocuments: ["PAN", "Address Proof", "Board Resolution"],
      deadline: "Before scheme application",
      contactDetails: "https://www.startupindia.gov.in",
    },
    {
      stepNumber: 3,
      title: "Close GST registration",
      description: gaps.some((gap) => gap.type === "GST_REGISTRATION")
        ? "GST is missing. File the registration on the GST portal."
        : "Confirm GST status is Registered and download the certificate.",
      priority: "high",
      estimatedTime: "1-2 days",
      requiredDocuments: ["PAN", "Address Proof", "Bank Details"],
      deadline: "Before submission",
      contactDetails: "https://www.gst.gov.in",
    },
    {
      stepNumber: 4,
      title: "Assemble the eligibility pack",
      description: `Collect documents for ${scheme.name}: ${scheme.eligibilityCriteria.map((criterion) => criterion.name).join(", ")}.`,
      priority: "high",
      estimatedTime: "1 day",
      requiredDocuments: ["Pitch deck", "Financials", "Founder KYC"],
      deadline: "Two days before submission",
    },
    {
      stepNumber: 5,
      title: "Create the portal account",
      description: `Open the official application account for ${scheme.name}.`,
      priority: "medium",
      estimatedTime: "1 hour",
      requiredDocuments: ["Email ID", "Mobile number"],
      deadline: "Day of application",
      contactDetails: scheme.sourceUrl ?? undefined,
    },
    {
      stepNumber: 6,
      title: "Submit the application",
      description: `File the ${scheme.name} application for a ${profile.stage} ${profile.sector} startup seeking ₹${profile.fundingNeeded}L.`,
      priority: "critical",
      estimatedTime: "3 hours",
      requiredDocuments: ["Completed form", "Eligibility pack"],
      deadline: "Scheme window",
      contactDetails: scheme.sourceUrl ?? undefined,
    },
  ];

  return {
    profileId: profile.id,
    schemeId: scheme.id,
    schemeName: scheme.name,
    steps,
    totalEstimatedTime: "4-5 days",
    timeline: [
      { day: 1, activities: ["Confirm company registration", "Register DPIIT"], expected: "Applications filed" },
      { day: 2, activities: ["GST registration", "Assemble documents"], expected: "Pending certificates" },
      { day: 4, activities: ["Submit the application"], expected: "Application acknowledged" },
    ],
    successCriteria: "All required documents obtained and the application submitted",
    fallbackMode: true,
    fallbackReason: FALLBACK_REASON,
  };
}
