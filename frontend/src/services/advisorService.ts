import { api } from "@/lib/api";
import type { Profile, SchemeMatch } from "@/lib/types";

export type AdvisorDraft = {
  name: string | null;
  sector: string | null;
  stage: string | null;
  location: string | null;
  fundingNeeded: number | null;
  founderExperience: string | null;
  incorporationDate: string | null;
  gstStatus: string | null;
  dpiitRegistration: boolean | null;
  previousFunding: number | null;
  websiteUrl: string | null;
  founderCount: number | null;
  problem: string | null;
  city: string | null;
  technology: string | null;
  fundingPurpose: string | null;
  fundingSource: string | null;
  entityType: string | null;
  subSector: string | null;
  businessModel: string | null;
  incorporationStatus: string | null;
  udyamRegistered: boolean | null;
  hasRevenue: boolean | null;
  gstApplicable: boolean | null;
};

export type AdvisorInsight = {
  statedIntent: string | null;
  targetSector: string | null;
  targetStage: string | null;
  technology: string | null;
  subSector: string | null;
  entityType: string | null;
  city: string | null;
  gstLabel: string | null;
  dpiitLabel: string | null;
  udyamLabel: string | null;
  incorporationLabel: string | null;
  fundingPurpose: string | null;
  revenueLabel: string | null;
  completeness: number;
  summary: string;
};

export type AdvisorAnalysis = {
  profileId: string;
  processedSchemes: number;
  strongMatch: boolean;
  matches: SchemeMatch[];
  fallbackMode: boolean;
  fallbackReason?: string;
};

export type AdvisorReply = {
  success: boolean;
  conversationId: string;
  message: string;
  phase: string;
  profile: AdvisorDraft;
  missingFields: string[];
  profileComplete: boolean;
  intent: "profile_building" | "confirm" | "analyze" | "results" | "follow_up";
  insight: AdvisorInsight;
  analysis: AdvisorAnalysis | null;
  savedProfile: Profile | null;
  advisorMode: "gemini" | "rules";
};

export function sendAdvisorMessage(conversationId: string | null, message: string, signal?: AbortSignal) {
  return api<AdvisorReply>("/api/chat", {
    method: "POST",
    signal,
    body: JSON.stringify({
      ...(conversationId ? { conversationId } : {}),
      message,
    }),
  });
}
