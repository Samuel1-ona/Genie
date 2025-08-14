/**
 * Environment configuration with safe getters
 * Throws clear errors if required environment variables are missing
 */

interface EnvConfig {
  AO_TARGET_ID: string;
  TALLY_BASE_URL: string;
}

function getRequiredEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Please check your .env file and ensure ${key} is set.`
    );
  }
  return value;
}

// Removed unused function

export const env: EnvConfig = {
  AO_TARGET_ID: getRequiredEnvVar('VITE_AO_TARGET_ID'),
  TALLY_BASE_URL: getRequiredEnvVar('VITE_TALLY_BASE_URL'),
};

// Validate environment on import
export function validateEnv(): void {
  try {
    // This will throw if any required env vars are missing
    void env.AO_TARGET_ID;
    void env.TALLY_BASE_URL;
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw error;
  }
}

// Export individual getters for convenience
export const getAOTargetId = (): string => env.AO_TARGET_ID;
export const getTallyBaseUrl = (): string => env.TALLY_BASE_URL;
