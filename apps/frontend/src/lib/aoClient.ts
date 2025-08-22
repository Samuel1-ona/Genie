/**
 * AO Client wrapper for communicating with AO processes
 * Features: requestId, timeout, retries, JSON encode/decode, normalized errors
 */

import { getEnv } from '@/config/env';

type AOEnvelope = {
  Target: string;
  Action: string;
  Data?: string;
  Tags?: Record<string, string>;
};

type AdminCommandRequest = {
  action: string;
  data?: any;
  tags?: Record<string, string>;
};

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

/**
 * Send request to regular AO bridge endpoint
 * Used for non-sensitive actions that don't require admin authentication
 */
export async function aoSend<T>(
  action: string,
  data?: any,
  tags?: Record<string, string>
): Promise<T> {
  const Target = getEnv('VITE_AO_TARGET_ID');
  const body: AOEnvelope = {
    Target,
    Action: action,
    Data: data ? JSON.stringify(data) : undefined,
    Tags: tags,
  };

  let lastError: any;
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch('/api/ao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`AO HTTP ${res.status}`);
      const json = await res.json();
      if (json.ok === false) throw new Error(json.error || 'AO returned error');
      return json.data as T;
    } catch (e) {
      lastError = e;
      // basic exponential backoff
      await sleep(400 * (attempt + 1));
    }
  }
  throw new Error(`aoSend(${action}) failed: ${String(lastError)}`);
}

/**
 * Send request to admin command endpoint
 * Used for sensitive actions that require admin authentication
 * The server-side endpoint handles HMAC signature generation
 */
export async function aoSendAdmin<T>(
  action: string,
  data?: any,
  tags?: Record<string, string>
): Promise<T> {
  const payload: AdminCommandRequest = {
    action,
    data,
    tags,
  };

  let lastError: any;
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch('/api/admin/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`Admin command HTTP ${res.status}`);
      const json = await res.json();
      if (json.ok === false)
        throw new Error(json.error || 'Admin command returned error');
      return json.data as T;
    } catch (e) {
      lastError = e;
      // basic exponential backoff
      await sleep(400 * (attempt + 1));
    }
  }
  throw new Error(`aoSendAdmin(${action}) failed: ${String(lastError)}`);
}

// Helper function to get environment variables
function getEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

// Example usage functions
export async function getAllProposals(): Promise<any[]> {
  return aoSend<any[]>('GetAllProposals');
}

export async function getGovernancePlatforms(): Promise<any[]> {
  return aoSend<any[]>('GetGovernancePlatforms');
}

export async function getSubscribers(): Promise<any[]> {
  return aoSend<any[]>('GetSubscribers');
}

// Sensitive action - requires admin authentication
export async function scrapeGovernance(platformId: string): Promise<any> {
  return aoSendAdmin<any>('ScrapeGovernance', { platformId });
}

export async function addSubscriber(subscriber: any): Promise<any> {
  return aoSend<any>('AddSubscriber', subscriber);
}

export async function removeSubscriber(subscriberId: string): Promise<any> {
  return aoSend<any>('RemoveSubscriber', { subscriberId });
}

export async function getRuntimeStats(): Promise<any> {
  return aoSend<any>('GetRuntimeStats');
}

export async function getBalances(): Promise<any[]> {
  return aoSend<any[]>('GetBalances');
}

// Sensitive action - requires admin authentication
export async function adjustBalance(
  address: string,
  amount: number,
  reason: string
): Promise<any> {
  return aoSendAdmin<any>('AdjustBalance', { address, amount, reason });
}

export async function getErrors(): Promise<any[]> {
  return aoSend<any[]>('GetErrors');
}
