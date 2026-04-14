import { z } from 'zod';

const nonEmpty = z.string().min(1);

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default('api/v1'),
  CORS_ORIGINS: z.string().default(''),

  DATABASE_URL: nonEmpty,
  REDIS_URL: nonEmpty,

  JWT_ACCESS_SECRET: nonEmpty,
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_SECRET: nonEmpty,
  JWT_REFRESH_TTL: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_REGION: z.string().default('us-east-1'),
  STORAGE_BUCKET: nonEmpty,
  STORAGE_ACCESS_KEY: nonEmpty,
  STORAGE_SECRET_KEY: nonEmpty,
  STORAGE_FORCE_PATH_STYLE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  STORAGE_PUBLIC_URL: z.string().optional(),

  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  UPLOAD_ALLOWED_MIME: z
    .string()
    .default('image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain')
    .transform((v) => v.split(',').map((m) => m.trim()).filter(Boolean)),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}
