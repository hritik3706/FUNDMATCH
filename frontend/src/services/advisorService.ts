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
  intent: "profile_building" | "analyze" | "results" | "follow_up";
  analysis: AdvisorAnalysis | null;
  savedProfile: Profile | null;
  advisorMode: "gemini" | "rules";
};

export function sendAdvisorMessage(conversationId: string | null, message: string) {
  return api<AdvisorReply>("/api/chat", {
    method: "POST",
    body: JSON.stringify({
      ...(conversationId ? { conversationId } : {}),
      message,
    }),
  });
}
