import { Pool, types } from "pg";
import { env } from "./env";

types.setTypeParser(1082, (value) => value);

export function pgSsl() {
  if (
    env.NODE_ENV === "production" ||
    /render\.com|sslmode=require|ssl=true/i.test(env.DATABASE_URL)
  ) {
    return { rejectUnauthorized: false as const };
  }
  return undefined;
}

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  ssl: pgSsl(),
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error", error);
});
