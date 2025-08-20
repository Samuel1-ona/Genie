/**
 * Admin client for sensitive AO actions
 * Calls the admin command endpoint which handles HMAC authentication
 */

interface AdminCommandRequest {
  action: string;
  data?: any;
  tags?: Record<string, string>;
}

interface AdminCommandResponse {
  ok: boolean;
  data?: any;
  error?: string;
}

/**
 * Send admin command to AO bridge
 * This endpoint handles HMAC authentication internally
 */
export async function adminSend<T>(
  action: string,
  data?: any,
  tags?: Record<string, string>
): Promise<T> {
  const payload: AdminCommandRequest = {
    action,
    data,
    tags,
  };

  const response = await fetch('/api/admin/command', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      errorData.error || `Admin command failed: ${response.status}`
    );
  }

  const result: AdminCommandResponse = await response.json();

  if (!result.ok) {
    throw new Error(result.error || 'Admin command returned error');
  }

  return result.data as T;
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
