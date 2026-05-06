import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  WEBHOOK_SECRET: z.string().min(10),
  STRIPE_SECRET_KEY: z.string().default('sk_test_123'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_123'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_secret_123'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', z.treeifyError(_env.error));
  process.exit(1);
}

export const env = _env.data;
