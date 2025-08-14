/**
 * AO Client wrapper for communicating with AO processes
 * Features: requestId, timeout, retries, JSON encode/decode, normalized errors
 */

import { env } from '@/config/env';
import type { AOMessage, ApiResponse, ApiError } from '@/types';

// Generate unique request ID
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Convert to AO message format
export function toAOMessage({
  Target,
  Action,
  Data,
  Tags,
}: AOMessage): AOMessage {
  return {
    Target,
    Action,
    Data: Data ? JSON.stringify(Data) : undefined,
    Tags,
  };
}

// Exponential backoff delay
function getBackoffDelay(attempt: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 seconds
}

// Normalize errors
function normalizeError(error: any, requestId: string): ApiError {
  if (error.name === 'AbortError') {
    return {
      code: 'TIMEOUT',
      message: 'Request timed out',
      requestId,
    };
  }

  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network error - unable to connect to AO process',
      requestId,
    };
  }

  return {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message || 'An unknown error occurred',
    details: error.details || error,
    requestId,
  };
}

// Main AO send function
export async function aoSend<T>(
  action: string,
  data?: any,
  tags?: Record<string, string>
): Promise<T> {
  const requestId = generateRequestId();
  const maxRetries = 2;
  const timeout = 10000; // 10 seconds

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), timeout);

      const message = toAOMessage({
        Target: env.AO_TARGET_ID,
        Action: action,
        Data: data,
        Tags: {
          ...tags,
          'Request-Id': requestId,
          Attempt: attempt.toString(),
        },
      });

      const response = await fetch('/api/ao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        body: JSON.stringify({
          action: message.Action,
          data: message.Data ? JSON.parse(message.Data) : undefined,
          tags: message.Tags,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'AO process returned an error');
      }

      return result.data as T;
    } catch (error) {
      const normalizedError = normalizeError(error, requestId);

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        console.error(`AO request failed after ${maxRetries + 1} attempts:`, {
          action,
          requestId,
          error: normalizedError,
        });
        throw normalizedError;
      }

      // Wait before retrying
      const delay = getBackoffDelay(attempt);
      console.warn(`AO request failed, retrying in ${delay}ms:`, {
        action,
        requestId,
        attempt: attempt + 1,
        error: normalizedError,
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error('Unexpected error in aoSend');
}

// Convenience functions for common AO operations
export const aoClient = {
  // Get proposals
  getProposals: () => aoSend<any[]>('GetAllProposals'),

  // Get proposal by ID
  getProposal: (id: string) => aoSend<any>('GetProposal', { id }),

  // Search proposals
  searchProposals: (query: string) =>
    aoSend<any[]>('SearchProposals', { query }),

  // Get proposals by platform
  getProposalsByPlatform: (platformId: string) =>
    aoSend<any[]>('GetProposalsByPlatform', { platformId }),

  // Get governance platforms
  getGovernancePlatforms: () => aoSend<any[]>('GetGovernancePlatforms'),

  // Scrape governance
  scrapeGovernance: (platformId: string) =>
    aoSend<any>('ScrapeGovernance', { platformId }),

  // Get subscribers
  getSubscribers: () => aoSend<any[]>('GetSubscribers'),

  // Add subscriber
  addSubscriber: (subscriber: any) => aoSend<any>('AddSubscriber', subscriber),

  // Broadcast notification
  broadcastNotification: (message: any) =>
    aoSend<any>('BroadcastNotification', message),

  // Get scrape history
  getScrapeHistory: () => aoSend<any[]>('GetScrapingHistory'),

  // Get API rate limits
  getApiRateLimits: () => aoSend<any>('GetApiRateLimits'),

  // Get cached data
  getCachedData: () => aoSend<any>('GetCachedData'),

  // Get API call counts
  getApiCallCounts: () => aoSend<any>('GetApiCallCounts'),

  // Get error logs
  getErrorLogs: () => aoSend<any[]>('GetErrorLogs'),

  // Clear cache
  clearCache: () => aoSend<any>('ClearCache'),

  // Reset rate limits
  resetRateLimits: () => aoSend<any>('ResetRateLimits'),

  // Get all balances
  getAllBalances: () => aoSend<any[]>('GetAllBalances'),

  // Get balance
  getBalance: (walletAddress: string, tokenAddress?: string) =>
    aoSend<any>('GetBalance', { walletAddress, tokenAddress }),

  // Add balance
  addBalance: (balance: any) => aoSend<any>('AddBalance', balance),

  // Health check
  healthCheck: () => aoSend<{ status: string }>('HealthCheck'),
};
