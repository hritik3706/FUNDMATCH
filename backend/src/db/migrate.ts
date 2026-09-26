import fs from "fs";
import path from "path";
import { Client } from "pg";
import { env } from "../config/env";
import { pool } from "../config/db";

function pgSsl() {
  return /render\.com|sslmode=require/i.test(env.DATABASE_URL)
    ? { rejectUnauthorized: false as const }
    : undefined;
}

async function ensureDatabase(): Promise<void> {
  const probe = new Client({ connectionString: env.DATABASE_URL, ssl: pgSsl() });
  try {
    await probe.connect();
    await probe.end();
    return;
  } catch {
    await probe.end().catch(() => undefined);
  }

  const url = new URL(env.DATABASE_URL);
  const dbName = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(dbName)) {
    throw new Error(`Refusing to create a database named ${dbName}`);
  }

  url.pathname = "/postgres";
  const client = new Client({ connectionString: url.toString(), ssl: pgSsl() });
  await client.connect();
  try {
    const existing = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Created database ${dbName}`);
    }
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  await ensureDatabase();

  const reset = process.argv.includes("--reset");
  const dir = __dirname;
  const schema = fs.readFileSync(path.join(dir, "schema.sql"), "utf8");
  const seed = fs.readFileSync(path.join(dir, "seed.sql"), "utf8");
  const client = await pool.connect();

  try {
    const existing = await client.query<{ exists: boolean }>(
      `SELECT to_regclass('public.profiles') IS NOT NULL AS exists`,
    );
    if (existing.rows[0]?.exists && !reset) {
      await client.query(
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url VARCHAR(500)",
      );
      console.log("Schema already exists. Re-run with --reset to drop and reseed.");
      return;
    }

    await client.query("BEGIN");
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
    await client.query("DROP TABLE IF EXISTS action_plans");
    await client.query("DROP TABLE IF EXISTS matches");
    await client.query("DROP TABLE IF EXISTS schemes");
    await client.query("DROP TABLE IF EXISTS profiles");
    await client.query(schema);
    await client.query(seed);
    await client.query("COMMIT");

    const count = await client.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM schemes",
    );
    console.log(`Migrated. Schemes seeded: ${count.rows[0].count}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
