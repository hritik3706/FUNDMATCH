import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CLAUDE_API_KEY: z.string().optional().default(""),
  CLAUDE_MODEL: z.string().optional().default("claude-sonnet-4-6"),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().optional().default("gemini-3.5-flash-lite"),
  FRONTEND_URL: z.string().optional().default(""),
  FIRECRAWL_API_KEY: z.string().optional().default(""),
  MATCH_THRESHOLD: z.coerce.number().min(0).max(100).default(40),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment: ${details}`);
}

export const env = parsed.data;
