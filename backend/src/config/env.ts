/**
 * Environment Configuration
 * Zod-validated env — no silent unsafe defaults for DB or JWT.
 */

import { z } from "zod";

const WEAK_JWT_SECRETS = new Set([
  "your-secret-key",
  "dev-secret-change-in-production-abc123xyz",
  "change-me-to-a-long-random-secret",
  "secret",
  "jwt-secret",
]);

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z
      .string({
        required_error: "DATABASE_URL is required (PostgreSQL connection string)",
      })
      .min(1)
      .refine(
        (v) => v.startsWith("postgres://") || v.startsWith("postgresql://"),
        "DATABASE_URL must be a PostgreSQL connection string (postgres:// or postgresql://)"
      ),
    JWT_SECRET: z
      .string({ required_error: "JWT_SECRET is required" })
      .min(16, "JWT_SECRET must be at least 16 characters"),
    JWT_EXPIRES_IN: z.string().default("7d"),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),
    LOG_LEVEL: z.string().default("info"),
  })
  .superRefine((data, ctx) => {
    const isProd = data.NODE_ENV === "production";
    if (WEAK_JWT_SECRETS.has(data.JWT_SECRET) || data.JWT_SECRET.length < 32) {
      if (isProd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["JWT_SECRET"],
          message:
            "JWT_SECRET is missing, too short (<32), or a known weak placeholder. Set a strong secret in production.",
        });
      }
    }
  });

function loadEnv() {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    LOG_LEVEL: process.env.LOG_LEVEL,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "env"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return parsed.data;
}

export const env = loadEnv();

export type Env = z.infer<typeof envSchema>;
