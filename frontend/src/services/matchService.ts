import { api } from "@/lib/api";
import type { ActionPlan, SchemeMatch } from "@/lib/types";

type AnalyzeResponse = {
  success: boolean;
  profileId: string;
  matches: SchemeMatch[];
  fallbackMode?: boolean;
  fallbackReason?: string;
};

type MatchResponse = { success: boolean; match: SchemeMatch };
type PlanResponse = { success: boolean; actionPlan: ActionPlan; fallbackMode?: boolean; fallbackReason?: string };

export function analyzeProfile(profileId: string) {
  return api<AnalyzeResponse>("/api/matches/analyze", {
    method: "POST",
    body: JSON.stringify({ profileId }),
  });
}

export function getMatch(profileId: string, schemeId: string) {
  return api<MatchResponse>(`/api/matches/${profileId}/${schemeId}`);
}

export function getActionPlan(profileId: string, schemeId: string) {
  return api<PlanResponse>(`/api/action-plans/${profileId}/${schemeId}`);
}
