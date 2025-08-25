/**
 * Environment configuration
 */

export function getEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export function getEnvOptional(key: string): string | undefined {
  return import.meta.env[key];
}

export function getEnvBoolean(
  key: string,
  defaultValue: boolean = false
): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

export function getEnvNumber(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;
  return parsed;
}

// Environment configuration object
export const env = {
  // AO Configuration
  AO_TARGET_ID: getEnv('VITE_AO_TARGET_ID'),
  AO_RELAY_URL: getEnv('VITE_AO_RELAY_URL'),
  AO_API_KEY: getEnvOptional('VITE_AO_API_KEY'),
  ADMIN_HMAC_SECRET: getEnvOptional('VITE_ADMIN_HMAC_SECRET'),

  // API Endpoints
  TALLY_BASE_URL: getEnv('VITE_TALLY_BASE_URL'),
  API_BASE_URL: getEnvOptional('VITE_API_BASE_URL') || 'http://localhost:3000',

  // Feature Flags
  MOCK: getEnvBoolean('VITE_MOCK', false),
  ENABLE_ANALYTICS: getEnvBoolean('VITE_ENABLE_ANALYTICS', false),
  ENABLE_DEBUG_MODE: getEnvBoolean('VITE_ENABLE_DEBUG_MODE', false),

  // External Services
  DISCORD_WEBHOOK_URL: getEnvOptional('VITE_DISCORD_WEBHOOK_URL'),
  TELEGRAM_BOT_TOKEN: getEnvOptional('VITE_TELEGRAM_BOT_TOKEN'),
  TELEGRAM_CHAT_ID: getEnvOptional('VITE_TELEGRAM_CHAT_ID'),

  // Development
  NODE_ENV: import.meta.env.MODE,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

// Type for environment variables
export type EnvConfig = typeof env;
