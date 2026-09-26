import { api } from "@/lib/api";
import type { Scheme, SchemeSummary } from "@/lib/types";

type SchemeListResponse = { success: boolean; schemes: SchemeSummary[]; totalCount: number };
type SchemeResponse = { success: boolean; scheme: Scheme };

export function listSchemes() {
  return api<SchemeListResponse>("/api/schemes");
}

export function getScheme(schemeId: string) {
  return api<SchemeResponse>(`/api/schemes/${schemeId}`);
}
