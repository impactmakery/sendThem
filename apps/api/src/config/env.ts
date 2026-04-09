import { z } from 'zod';

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(3002),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Frontend URL (for CORS)
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().default(''),

  // Supabase
  SUPABASE_URL: z.string().default(''),
  SUPABASE_ANON_KEY: z.string().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(''),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Meta WhatsApp
  META_ACCESS_TOKEN: z.string().default(''),
  META_PHONE_NUMBER_ID: z.string().default(''),
  META_WABA_ID: z.string().default(''),
  META_APP_SECRET: z.string().default(''),
  META_WEBHOOK_VERIFY_TOKEN: z.string().default(''),

  // Stripe
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),

  // Resend (transactional emails)
  RESEND_API_KEY: z.string().default(''),
  FROM_EMAIL: z.string().default('noreply@example.com'),

  // Sentry
  SENTRY_DSN: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function loadEnv(): Env {
  if (env) return env;
  env = envSchema.parse(process.env);
  return env;
}

export function getEnv(): Env {
  if (!env) throw new Error('Environment not loaded. Call loadEnv() first.');
  return env;
}
