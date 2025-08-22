/**
 * Admin client for sensitive AO actions
 * Uses aoSendAdmin from aoClient for consistent error handling and retries
 */

import { aoSendAdmin } from './aoClient';

/**
 * Send admin command to AO bridge
 * This endpoint handles HMAC authentication internally
 */
export async function adminSend<T>(
  action: string,
  data?: any,
  tags?: Record<string, string>
): Promise<T> {
  return aoSendAdmin<T>(action, data, tags);
}

// Admin-specific AO functions for sensitive actions
export async function adminScrapeGovernance(platformId: string): Promise<any> {
  return adminSend<any>('ScrapeGovernance', { platformId });
}

export async function adminClearCache(): Promise<any> {
  return adminSend<any>('ClearCache');
}

export async function adminResetRateLimits(): Promise<any> {
  return adminSend<any>('ResetRateLimits');
}

export async function adminAdjustBalance(
  address: string,
  amount: number,
  reason: string
): Promise<any> {
  return adminSend<any>('AdjustBalance', { address, amount, reason });
}

export async function adminAddBalance(
  address: string,
  amount: number,
  reason: string
): Promise<any> {
  return adminSend<any>('AddBalance', { address, amount, reason });
}
