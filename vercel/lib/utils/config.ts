import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  UPWORK_RSS_FEEDS: z.string().min(1),
  NOTIFICATION_EMAIL_TO: z.string().email(),
  NOTIFICATION_SCORE_THRESHOLD: z.string().transform(Number),
  EMAIL_PROVIDER: z.enum(['resend', 'sendgrid', 'supabase']),
  CRON_SECRET: z.string().min(10),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const config = envSchema.parse(process.env);

export type Config = z.infer<typeof envSchema>;