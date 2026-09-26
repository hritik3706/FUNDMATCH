import { pool } from "../config/db";
import { CreateProfileInput, Profile } from "../types/profile.types";

type ProfileRow = {
  id: string;
  name: string;
  sector: Profile["sector"];
  stage: Profile["stage"];
  location: Profile["location"];
  funding_needed: number;
  founder_experience: Profile["founderExperience"];
  incorporation_date: string | null;
  gst_status: Profile["gstStatus"];
  dpiit_registration: boolean;
  previous_funding: number;
  created_at: Date;
};

export async function insertProfile(input: CreateProfileInput): Promise<Profile> {
  const result = await pool.query<ProfileRow>(
    `INSERT INTO profiles (
      name,
      sector,
      stage,
      location,
      funding_needed,
      founder_experience,
      incorporation_date,
      gst_status,
      dpiit_registration,
      previous_funding
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING
      id,
      name,
      sector,
      stage,
      location,
      funding_needed,
      founder_experience,
      incorporation_date,
      gst_status,
      dpiit_registration,
      previous_funding,
      created_at`,
    [
      input.name,
      input.sector,
      input.stage,
      input.location,
      input.fundingNeeded,
      input.founderExperience,
      input.incorporationDate ?? null,
      input.gstStatus ?? null,
      input.dpiitRegistration ?? false,
      input.previousFunding ?? 0,
    ],
  );

  return toProfile(result.rows[0]);
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    sector: row.sector,
    stage: row.stage,
    location: row.location,
    fundingNeeded: row.funding_needed,
    founderExperience: row.founder_experience,
    incorporationDate: row.incorporation_date,
    gstStatus: row.gst_status,
    dpiitRegistration: row.dpiit_registration,
    previousFunding: row.previous_funding,
    createdAt: row.created_at.toISOString(),
  };
}
