import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('*'),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  DEFAULT_LLM_PROVIDER: z.enum(['openai', 'anthropic', 'mock', 'auto']).default('auto'),
  DATABASE_URL: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60 * 1000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(30), // 30 requests per minute
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
