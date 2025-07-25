import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value || defaultValue!;
}

function getEnvNumber(name: string, defaultValue?: number): number {
  const value = process.env[name];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
}

function getEnvArray(name: string, defaultValue: string[] = []): string[] {
  const value = process.env[name];
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim());
}

export const config = {
  port: getEnvNumber('PORT', 3001),
  host: getEnvVar('HOST', '0.0.0.0'),
  nodeEnv: getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  
  database: {
    url: getEnvVar('DATABASE_URL')
  },
  
  redis: {
    url: getEnvVar('REDIS_URL', 'redis://localhost:6379')
  },
  
  supabase: {
    url: getEnvVar('SUPABASE_URL'),
    anonKey: getEnvVar('SUPABASE_ANON_KEY'),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_KEY'),
    serviceKey: getEnvVar('SUPABASE_SERVICE_KEY') // Alias for compatibility
  },
  
  // FIXED: Changed from claude to anthropic
  anthropic: {
    apiKey: getEnvVar('ANTHROPIC_API_KEY', '')
  },
  
  // ✅ NEW: Stripe Payment Configuration
  stripe: {
    secretKey: getEnvVar('STRIPE_SECRET_KEY'),
    webhookSecret: getEnvVar('STRIPE_WEBHOOK_SECRET'),
    priceMonthly: getEnvVar('STRIPE_PRICE_MONTHLY'),
    priceDaily: getEnvVar('STRIPE_PRICE_DAILY')
  },
  
  jwt: {
    secret: getEnvVar('JWT_SECRET')
  },
  
  cors: {
    allowedOrigins: getEnvArray('CORS_ORIGINS', ['http://localhost:5173', 'http://localhost:3000'])
  },
  
  limits: {
    maxMessagesPerAnalysis: getEnvNumber('MAX_MESSAGES_PER_ANALYSIS', 50),
    maxSessionsPerMonth: getEnvNumber('MAX_SESSIONS_PER_MONTH', 100),
    maxMessagesPerMonth: getEnvNumber('MAX_MESSAGES_PER_MONTH', 1000)
  },
  
  rateLimit: {
    windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
    maxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100)
  },
  
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info')
  }
};

// Validate critical configuration
export function validateConfig(): void {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    // ✅ NEW: Stripe required variables
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRICE_MONTHLY',
    'STRIPE_PRICE_DAILY'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate URLs
  try {
    new URL(config.supabase.url);
    new URL(config.database.url);
    if (config.redis.url.startsWith('redis://')) {
      new URL(config.redis.url);
    }
  } catch (error) {
    throw new Error('Invalid URL in configuration');
  }
  
  // ✅ NEW: Validate Stripe configuration
  if (config.nodeEnv === 'production') {
    // In production, ensure we have live keys
    if (!config.stripe.secretKey.startsWith('sk_live_')) {
      console.warn('Warning: Using test Stripe keys in production environment');
    }
  }
  
  // Validate Stripe Price IDs format
  if (!config.stripe.priceMonthly.startsWith('price_')) {
    throw new Error('Invalid Stripe monthly price ID format');
  }
  
  if (!config.stripe.priceDaily.startsWith('price_')) {
    throw new Error('Invalid Stripe daily price ID format');
  }
  
  // Validate webhook secret format
  if (!config.stripe.webhookSecret.startsWith('whsec_')) {
    throw new Error('Invalid Stripe webhook secret format');
  }
  
  // Validate port
  if (config.port < 1 || config.port > 65535) {
    throw new Error('Port must be between 1 and 65535');
  }
}

export type AppConfig = typeof config;
export default config;