import { z } from "zod";

const nonEmpty = z.string().min(1);

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(Number(process.env.PORT)),
  API_PREFIX: z.string().default("api/v1"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:4173,http://localhost:5173"),

  DATABASE_URL: nonEmpty,

  JWT_ACCESS_SECRET: nonEmpty,
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_SECRET: nonEmpty,
  JWT_REFRESH_TTL: z.string().default("7d"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  RESEND_API_KEY: z.string().optional(),
  APP_URL: z.string().default("http://localhost:5173"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}
