import { pool } from "../config/db";
import { ActionPlan, SchemeMatch } from "../types/matching.types";

type MatchRow = {
  match_data: SchemeMatch;
  expires_at: Date | null;
};

type PlanRow = {
  action_data: ActionPlan;
  total_estimated_time: string | null;
  expires_at: Date | null;
};

function stillValid(expiresAt: Date | null): boolean {
  if (!expiresAt) {
    return true;
  }
  return expiresAt.getTime() > Date.now();
}

export async function findStoredMatch(profileId: string, schemeId: string): Promise<SchemeMatch | null> {
  const result = await pool.query<MatchRow>(
    `SELECT match_data, expires_at
     FROM matches
     WHERE profile_id = $1 AND scheme_id = $2`,
    [profileId, schemeId],
  );
  const row = result.rows[0];
  if (!row || !stillValid(row.expires_at)) {
    return null;
  }
  return row.match_data;
}

export async function upsertMatch(match: SchemeMatch): Promise<void> {
  await pool.query(
    `INSERT INTO matches (
      profile_id, scheme_id, compatibility_score, match_data, fallback_mode, expires_at
    ) VALUES ($1, $2, $3, $4::jsonb, $5, NOW() + INTERVAL '1 hour')
    ON CONFLICT (profile_id, scheme_id)
    DO UPDATE SET
      compatibility_score = EXCLUDED.compatibility_score,
      match_data = EXCLUDED.match_data,
      fallback_mode = EXCLUDED.fallback_mode,
      expires_at = EXCLUDED.expires_at`,
    [
      match.profileId,
      match.schemeId,
      match.compatibilityScore,
      JSON.stringify(match),
      Boolean(match.fallbackMode),
    ],
  );
}

export async function findStoredActionPlan(profileId: string, schemeId: string): Promise<ActionPlan | null> {
  const result = await pool.query<PlanRow>(
    `SELECT action_data, total_estimated_time, expires_at
     FROM action_plans
     WHERE profile_id = $1 AND scheme_id = $2`,
    [profileId, schemeId],
  );
  const row = result.rows[0];
  if (!row || !stillValid(row.expires_at)) {
    return null;
  }
  return {
    ...row.action_data,
    totalEstimatedTime: row.total_estimated_time ?? row.action_data.totalEstimatedTime,
  };
}

export async function upsertActionPlan(plan: ActionPlan): Promise<void> {
  await pool.query(
    `INSERT INTO action_plans (
      profile_id, scheme_id, action_data, total_estimated_time, expires_at
    ) VALUES ($1, $2, $3::jsonb, $4, NOW() + INTERVAL '4 hours')
    ON CONFLICT (profile_id, scheme_id)
    DO UPDATE SET
      action_data = EXCLUDED.action_data,
      total_estimated_time = EXCLUDED.total_estimated_time,
      expires_at = EXCLUDED.expires_at`,
    [plan.profileId, plan.schemeId, JSON.stringify(plan), plan.totalEstimatedTime],
  );
}
