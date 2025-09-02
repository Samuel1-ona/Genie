/**
 * Tally API Client
 * Handles all Tally API interactions with proper error handling and configuration
 */

import { env } from '@/config/env';

// Tally API base URL
const TALLY_BASE_URL = 'https://api.tally.so';

/**
 * Tally API error class
 */
export class TallyApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'TallyApiError';
  }
}

/**
 * Get Tally API headers with authentication
 */
function getTallyHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add API key if available
  if (env.TALLY_API_KEY) {
    headers.Authorization = `Bearer ${env.TALLY_API_KEY}`;
  }

  return headers;
}

/**
 * Make a request to the Tally API
 */
async function tallyRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${TALLY_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: getTallyHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `Tally API error: ${response.status}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new TallyApiError(errorMessage, response.status);
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TallyApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new TallyApiError('Network error: Unable to connect to Tally API');
    }

    throw new TallyApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

/**
 * Tally API methods
 */
export const tallyApi = {
  /**
   * Get organization users
   */
  async getOrganizationUsers(organizationId: string): Promise<any[]> {
    return tallyRequest<any[]>(`/organizations/${organizationId}/users`);
  },

  /**
   * Get organization details
   */
  async getOrganization(organizationId: string): Promise<any> {
    return tallyRequest<any>(`/organizations/${organizationId}`);
  },

  /**
   * Get organization proposals
   */
  async getOrganizationProposals(organizationId: string): Promise<any[]> {
    return tallyRequest<any[]>(`/organizations/${organizationId}/proposals`);
  },

  /**
   * Get proposal details
   */
  async getProposal(proposalId: string): Promise<any> {
    return tallyRequest<any>(`/proposals/${proposalId}`);
  },

  /**
   * Get proposal votes
   */
  async getProposalVotes(proposalId: string): Promise<any[]> {
    return tallyRequest<any[]>(`/proposals/${proposalId}/votes`);
  },

  /**
   * Get user details
   */
  async getUser(userId: string): Promise<any> {
    return tallyRequest<any>(`/users/${userId}`);
  },

  /**
   * Search organizations
   */
  async searchOrganizations(query: string): Promise<any[]> {
    return tallyRequest<any[]>(
      `/organizations/search?q=${encodeURIComponent(query)}`
    );
  },

  /**
   * Get user's organizations
   */
  async getUserOrganizations(userId: string): Promise<any[]> {
    return tallyRequest<any[]>(`/users/${userId}/organizations`);
  },

  /**
   * Get governance tokens
   */
  async getGovernanceTokens(organizationId: string): Promise<any[]> {
    return tallyRequest<any[]>(`/organizations/${organizationId}/tokens`);
  },

  /**
   * Get delegates
   */
  async getDelegates(organizationId: string): Promise<any[]> {
    return tallyRequest<any[]>(`/organizations/${organizationId}/delegates`);
  },
};

/**
 * Retry wrapper for Tally API calls
 */
export async function tallyRequestWithRetry<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      // Don't retry on certain errors
      if (error instanceof TallyApiError) {
        if (error.status && error.status >= 400 && error.status < 500) {
          // Don't retry client errors (4xx)
          throw error;
        }
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(
        `Tally API request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
