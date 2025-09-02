/**
 * Tally GraphQL API Client
 * Handles all Tally GraphQL API interactions with proper error handling and configuration
 */

import { env } from '@/config/env';

// Tally GraphQL API endpoint
const TALLY_GRAPHQL_URL = 'https://api.tally.xyz/query';

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
 * Get Tally GraphQL API headers with authentication
 */
function getTallyHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add API key if available (Tally uses Api-Key header, not Authorization)
  if (env.TALLY_API_KEY) {
    headers['Api-Key'] = env.TALLY_API_KEY;
  }

  return headers;
}

/**
 * Make a GraphQL request to the Tally API
 */
async function tallyGraphQLRequest<T>(
  query: string,
  variables: any = {}
): Promise<T> {
  const config: RequestInit = {
    method: 'POST',
    headers: getTallyHeaders(),
    body: JSON.stringify({
      query,
      variables,
    }),
  };

  try {
    const response = await fetch(TALLY_GRAPHQL_URL, config);

    if (!response.ok) {
      let errorMessage = `Tally GraphQL API error: ${response.status}`;

      try {
        const errorData = await response.json();
        console.error('Tally API Error Response:', errorData);

        // Try to extract more detailed error information
        if (errorData.errors && errorData.errors.length > 0) {
          const graphqlError = errorData.errors[0];
          errorMessage = `GraphQL Error: ${graphqlError.message}`;
          if (graphqlError.extensions) {
            errorMessage += ` (Code: ${graphqlError.extensions.code || 'unknown'})`;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new TallyApiError(errorMessage, response.status);
    }

    const data = await response.json();

    // Check for GraphQL errors
    if (data.errors && data.errors.length > 0) {
      const errorMessage = data.errors[0].message || 'GraphQL query error';
      throw new TallyApiError(errorMessage, response.status);
    }

    return data.data;
  } catch (error) {
    if (error instanceof TallyApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new TallyApiError(
        'Network error: Unable to connect to Tally GraphQL API'
      );
    }

    throw new TallyApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

/**
 * Tally GraphQL API methods
 */
export const tallyApi = {
  /**
   * Get proposals by chain ID (main method for fetching proposals)
   */
  async getProposals(
    chainId: string,
    pagination = { limit: 100, offset: 0 },
    sort = { field: 'START_BLOCK', order: 'DESC' }
  ): Promise<any[]> {
    // Fixed query structure - proposals are likely nested under 'items' or similar
    const query = `
      query Proposals($input: ProposalsInput!) {
        proposals(input: $input) {
          items {
            id
            title
            eta
            governor {
              name
            }
            voteStats {
              support
              weight
              votes
              percent
            }
          }
          pagination {
            total
            limit
            offset
          }
        }
      }
    `;

    // Structure the input according to the API requirements
    const variables = {
      input: {
        chainId,
        pagination,
        sort,
      },
    };

    console.log('Tally GraphQL Query:', query);
    console.log('Tally GraphQL Variables:', variables);

    const result = await tallyGraphQLRequest<any>(query, variables);

    // Extract proposals from the nested structure
    if (result?.proposals?.items) {
      return result.proposals.items;
    } else if (Array.isArray(result?.proposals)) {
      return result.proposals;
    } else if (Array.isArray(result)) {
      return result;
    }

    console.warn('Unexpected Tally API response structure:', result);
    return [];
  },

  /**
   * Get governors by chain IDs
   */
  async getGovernors(
    chainIds: string[],
    pagination = { limit: 100, offset: 0 },
    sort = { field: 'TOTAL_PROPOSALS', order: 'DESC' }
  ): Promise<any[]> {
    const query = `
      query Governors($input: GovernorsInput!) {
        governors(input: $input) {
          id
          name
          tokens {
            stats {
              voters
            }
          }
          proposalStats {
            total
            active
          }
        }
      }
    `;

    const variables = {
      input: {
        chainIds,
        pagination,
        sort,
      },
    };

    return tallyGraphQLRequest<any[]>(query, variables);
  },

  /**
   * Get proposal details by ID
   */
  async getProposal(proposalId: string): Promise<any> {
    // For individual proposals, we'll need to search across chains
    // This is a simplified approach - in practice you might need to know the chainId
    const query = `
      query Proposal($id: ID!) {
        proposal(id: $id) {
          id
          title
          description
          eta
          governor {
            id
            name
            organization {
              id
              name
              slug
            }
          }
          voteStats {
            support
            weight
            votes
            percent
          }
          status
          startBlock
          endBlock
          executionEta
          createdBlock
          createdTimestamp
        }
      }
    `;

    return tallyGraphQLRequest<any>(query, {
      id: proposalId,
    });
  },

  /**
   * Get votes for a proposal
   */
  async getProposalVotes(proposalId: string): Promise<any[]> {
    const query = `
      query Votes($proposalId: ID!, $pagination: Pagination) {
        votes(proposalId: $proposalId, pagination: $pagination) {
          id
          support
          weight
          reason
          voter {
            id
            address
            ens
            name
          }
          blockNumber
          blockTimestamp
        }
      }
    `;

    return tallyGraphQLRequest<any[]>(query, {
      proposalId,
      pagination: { limit: 100, offset: 0 },
    });
  },

  /**
   * Get account details by address
   */
  async getAccount(address: string): Promise<any> {
    const query = `
      query Account($address: String!) {
        account(address: $address) {
          id
          address
          ens
          twitter
          name
          bio
          picture
          safes
          type
          votes {
            id
            support
            weight
            proposal {
              id
              title
            }
          }
          proposalsCreated {
            id
            title
            status
          }
        }
      }
    `;

    return tallyGraphQLRequest<any>(query, {
      address,
    });
  },

  /**
   * Get organizations (if supported by the API)
   */
  async getOrganizations(
    pagination = { limit: 20, offset: 0 }
  ): Promise<any[]> {
    // This might not be supported in the current Tally API
    // Returning empty array as placeholder
    console.warn('getOrganizations not yet implemented for Tally GraphQL API');
    return [];
  },

  /**
   * Test method using the exact working query from examples
   */
  async testProposals(chainId: string = 'eip155:1'): Promise<any[]> {
    // Start with the absolute minimal query to test the API structure
    const query = `
      query Proposals($input: ProposalsInput!) {
        proposals(input: $input) {
          items {
            id
            title
          }
          pagination {
            total
            limit
            offset
          }
        }
      }
    `;

    const variables = {
      input: {
        chainId,
        pagination: { limit: 1, offset: 0 },
        // Remove sort to test if it's causing issues
      },
    };

    console.log('Test Query Variables:', variables);

    const result = await tallyGraphQLRequest<any>(query, variables);

    // Extract proposals from the nested structure
    if (result?.proposals?.items) {
      return result.proposals.items;
    } else if (Array.isArray(result?.proposals)) {
      return result.proposals;
    } else if (Array.isArray(result)) {
      return result;
    }

    console.warn('Unexpected Tally API response structure:', result);
    return [];
  },
};

/**
 * Retry wrapper for Tally GraphQL API calls
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
        `Tally GraphQL API request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
