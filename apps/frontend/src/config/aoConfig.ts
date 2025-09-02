/**
 * AO Configuration
 * Handles different environments and network settings
 */

export const aoConfig = {
  // AO Process ID from environment
  processId: import.meta.env.VITE_AO_TARGET_ID,

  // Network configuration
  network: {
    // Testnet configuration
    testnet: {
      relayUrl: 'https://cu.ao-testnet.xyz',
      gatewayUrl: 'https://arweave.net',
    },
    // Mainnet configuration
    mainnet: {
      relayUrl: 'https://cu.ao.xyz',
      gatewayUrl: 'https://arweave.net',
    },
  },

  // Development settings
  development: {
    // Enable retry logic
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,

    // Enable detailed logging
    enableLogging: import.meta.env.DEV,

    // CORS handling
    handleCors: true,
  },

  // Error handling
  errors: {
    // Network error messages
    networkErrors: {
      cors: 'Network access blocked. Please check your connection and try again.',
      timeout: 'Request timed out. Please try again.',
      unavailable:
        'AO service temporarily unavailable. Please try again later.',
      connection:
        'Network connection failed. Please check your internet connection.',
      wallet: 'Arweave wallet not available. Please connect your wallet first.',
    },

    // Retry configuration
    retry: {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
    },
  },

  // API endpoints
  endpoints: {
    // AO Connect endpoints
    dryrun: '/dry-run',
    message: '/message',
    result: '/result',

    // Custom API endpoints
    api: {
      ao: '/api/ao',
      admin: '/api/admin/command',
    },
  },
} as const;

/**
 * Get current network configuration
 */
export function getCurrentNetwork() {
  const isTestnet =
    import.meta.env.VITE_AO_NETWORK === 'testnet' || import.meta.env.DEV;

  return isTestnet ? aoConfig.network.testnet : aoConfig.network.mainnet;
}

/**
 * Get retry configuration
 */
export function getRetryConfig() {
  return {
    maxRetries: aoConfig.development.maxRetries,
    baseDelay: aoConfig.development.retryDelay,
    enableRetry: aoConfig.development.enableRetry,
  };
}

/**
 * Get error message for specific error type
 */
export function getErrorMessage(
  errorType: keyof typeof aoConfig.errors.networkErrors
): string {
  return aoConfig.errors.networkErrors[errorType];
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Check if we're in testnet mode
 */
export function isTestnet(): boolean {
  return import.meta.env.VITE_AO_NETWORK === 'testnet' || import.meta.env.DEV;
}
