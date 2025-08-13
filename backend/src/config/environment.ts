import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:3000'),
  PORT: z.string().transform(Number).default('3001'),
  
  // OAuth variables (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Notification variables (optional)
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

// Validate environment variables at startup
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parseResult.error.format());
  process.exit(1);
}

export const env = parseResult.data;

// Log important config in development
if (env.NODE_ENV === 'development') {
  console.log('✅ Environment variables validated successfully');
  console.log('📋 Configuration:');
  console.log(`   - NODE_ENV: ${env.NODE_ENV}`);
  console.log(`   - PORT: ${env.PORT}`);
  console.log(`   - FRONTEND_URL: ${env.FRONTEND_URL}`);
  console.log(`   - DATABASE_URL: ${env.DATABASE_URL ? '***configured***' : 'missing'}`);
  console.log(`   - JWT_SECRET: ${env.JWT_SECRET ? '***configured***' : 'missing'}`);
}