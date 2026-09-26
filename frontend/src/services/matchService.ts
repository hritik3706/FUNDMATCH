import { api } from "@/lib/api";
import type { ActionPlan, SchemeMatch } from "@/lib/types";

export type MatchContext = {
  story?: string;
  futureIntent?: string;
};

export type FieldConflict = {
  field: string;
  structuredValue: string;
  otherSource: "website" | "story";
  otherValue: string;
};

export type AnalyzeResponse = {
  success: boolean;
  profileId: string;
  matches: SchemeMatch[];
  totalRelevant?: number;
  matchThreshold?: number;
  processedSchemes?: number;
  websiteStatus?: "skipped" | "extracted" | "unavailable";
  websiteNotice?: string;
  conflicts?: FieldConflict[];
  missingFields?: string[];
  informationStatus?: "ready" | "incomplete" | "conflict";
  fallbackMode?: boolean;
  fallbackReason?: string;
};

type MatchResponse = { success: boolean; match: SchemeMatch };
type PlanResponse = { success: boolean; actionPlan: ActionPlan; fallbackMode?: boolean; fallbackReason?: string };

export function matchContext(story?: { text?: string; futureIntent?: string }): MatchContext {
  return {
    story: story?.text?.trim().slice(0, 4000) || undefined,
    futureIntent: story?.futureIntent?.trim().slice(0, 2000) || undefined,
  };
}

export function analyzeProfile(profileId: string, context?: MatchContext) {
  return api<AnalyzeResponse>("/api/matches/analyze", {
    method: "POST",
    body: JSON.stringify({
      profileId,
      story: context?.story,
      futureIntent: context?.futureIntent,
    }),
  });
}

export function getMatch(profileId: string, schemeId: string, context?: MatchContext) {
  const params = new URLSearchParams();
  if (context?.story) params.set("story", context.story.slice(0, 1500));
  if (context?.futureIntent) params.set("futureIntent", context.futureIntent.slice(0, 800));
  const query = params.toString();
  return api<MatchResponse>(`/api/matches/${profileId}/${schemeId}${query ? `?${query}` : ""}`);
}

export function getActionPlan(profileId: string, schemeId: string) {
  return api<PlanResponse>(`/api/action-plans/${profileId}/${schemeId}`);
}
