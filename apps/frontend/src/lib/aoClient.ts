/**
 * AO Client wrapper for communicating with AO processes
 * Features: requestId, timeout, retries, JSON encode/decode, normalized errors
 */

import { getEnv, env } from '@/config/env';
import { mockAo } from '@/server/mockAo';
import { toast } from './toast';

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
 * Map HTTP status codes to user-friendly error messages
 */
function getErrorMessage(status: number, action: string): string {
  switch (status) {
    case 429:
      return 'Rate limit exceeded. Please try again in a few minutes.';
    case 500:
      return 'Server error occurred. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'Access denied. You do not have permission to perform this action.';
    case 404:
      return 'Resource not found.';
    default:
      return `Failed to ${action.toLowerCase()}. Please try again.`;
  }
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
  // Use mock if enabled
  if (env.MOCK) {
    try {
      const result = await mockAo(action, data, tags);
      return result as T;
    } catch (error) {
      console.error('Mock AO error:', error);
      throw new Error(`Mock ${action} failed: ${String(error)}`);
    }
  }

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

      if (!res.ok) {
        const errorMessage = getErrorMessage(res.status, action);
        throw new Error(errorMessage);
      }

      const json = await res.json();
      if (json.ok === false) {
        throw new Error(json.error || `AO ${action} failed`);
      }

      return json.data as T;
    } catch (e) {
      lastError = e;
      // basic exponential backoff
      await sleep(400 * (attempt + 1));
    }
  }

  // Show toast for final error
  const errorMessage = lastError?.message || `aoSend(${action}) failed`;
  toast.error('Request Failed', errorMessage);
  throw new Error(errorMessage);
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
  // Use mock if enabled
  if (env.MOCK) {
    try {
      const result = await mockAo(action, data, tags);
      return result as T;
    } catch (error) {
      console.error('Mock admin AO error:', error);
      throw new Error(`Mock admin ${action} failed: ${String(error)}`);
    }
  }

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

      if (!res.ok) {
        const errorMessage = getErrorMessage(res.status, `admin ${action}`);
        throw new Error(errorMessage);
      }

      const json = await res.json();
      if (json.ok === false) {
        throw new Error(json.error || `Admin command ${action} failed`);
      }

      return json.data as T;
    } catch (e) {
      lastError = e;
      // basic exponential backoff
      await sleep(400 * (attempt + 1));
    }
  }

  // Show toast for final error
  const errorMessage = lastError?.message || `aoSendAdmin(${action}) failed`;
  toast.error('Admin Action Failed', errorMessage);
  throw new Error(errorMessage);
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
