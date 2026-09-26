import { Pool, types } from "pg";
import { env } from "./env";

types.setTypeParser(1082, (value) => value);

const needsSsl = /render\.com|sslmode=require/i.test(env.DATABASE_URL);

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error", error);
});
