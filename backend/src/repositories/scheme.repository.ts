import { pool } from "../config/db";
import {
  EligibilityCriterion,
  Scheme,
  SchemeSummary,
} from "../types/scheme.types";

type SchemeRow = {
  id: string;
  name: string;
  description: string;
  eligible_sectors: string[];
  eligible_stages: string[];
  eligible_locations: string[];
  funding_min: number;
  funding_max: number;
  eligibility_criteria: EligibilityCriterion[] | string;
  source_url: string | null;
  scheme_type: string | null;
};

const SCHEME_COLUMNS = `
  id,
  name,
  description,
  eligible_sectors,
  eligible_stages,
  eligible_locations,
  funding_min,
  funding_max,
  eligibility_criteria,
  source_url,
  scheme_type
`;

export async function listSchemes(): Promise<SchemeSummary[]> {
  const result = await pool.query<SchemeRow>(
    `SELECT ${SCHEME_COLUMNS} FROM schemes ORDER BY name ASC`,
  );
  return result.rows.map(toSummary);
}

export async function countSchemes(): Promise<number> {
  const result = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM schemes",
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function findSchemeById(id: string): Promise<Scheme | null> {
  const result = await pool.query<SchemeRow>(
    `SELECT ${SCHEME_COLUMNS} FROM schemes WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  return toScheme(row);
}

function toSummary(row: SchemeRow): SchemeSummary {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    eligibleSectors: row.eligible_sectors,
    eligibleStages: row.eligible_stages,
    eligibleLocations: row.eligible_locations,
    fundingMin: row.funding_min,
    fundingMax: row.funding_max,
    sourceUrl: row.source_url,
    schemeType: row.scheme_type,
  };
}

function toScheme(row: SchemeRow): Scheme {
  const criteria = row.eligibility_criteria;
  return {
    ...toSummary(row),
    eligibilityCriteria:
      typeof criteria === "string" ? JSON.parse(criteria) : criteria,
  };
}
