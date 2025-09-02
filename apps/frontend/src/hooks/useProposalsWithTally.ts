/**
 * Enhanced Proposal Hooks with Tally API Integration
 * Loads existing proposals from Tally API and integrates with AO process
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { tallyApi, tallyRequestWithRetry } from '@/lib/tallyClient';
import { env } from '@/config/env';

// Query keys for proposals
export const PROPOSAL_QUERY_KEYS = {
  proposals: ['proposals'],
  proposalsWithTally: ['proposals', 'tally'],
  proposal: (id: string) => ['proposal', id],
  governancePlatforms: ['governance-platforms'],
} as const;

/**
 * Hook to load existing proposals from Tally API by chain ID
 * This provides immediate access to governance data without waiting for scraping
 */
export function useExistingProposals(chainId?: string) {
  // Default chain IDs for popular networks
  const defaultChainId = chainId || env.TALLY_DEFAULT_CHAIN_ID || 'eip155:1'; // Ethereum mainnet

  return useQuery({
    queryKey: [...PROPOSAL_QUERY_KEYS.proposalsWithTally, defaultChainId],
    queryFn: async () => {
      try {
        console.log(
          'Loading existing proposals from Tally API for chain:',
          defaultChainId
        );

        // Debug: Log the exact parameters being sent
        const pagination = { limit: 100, offset: 0 };
        const sort = { field: 'START_BLOCK', order: 'DESC' };
        console.log('Tally API Parameters:', {
          defaultChainId,
          pagination,
          sort,
        });

        const response = await tallyRequestWithRetry(() =>
          tallyApi.getProposals(defaultChainId, pagination, sort)
        );

        // Extract proposals from GraphQL response
        const proposals = response?.proposals || [];

        // Transform Tally GraphQL API response to match our proposal format
        const transformedProposals = proposals.map((proposal: any) => ({
          id: `tally-${proposal.id}`,
          title: proposal.title || 'Untitled Proposal',
          description: 'No description available', // Not available in simplified API
          content: 'No content available', // Not available in simplified API
          proposer: 'Unknown', // Not available in simplified API
          platform: 'tally',
          governance_platform_id: defaultChainId,
          status: 'active', // Default status since not available
          type: 'governance',
          url: `https://tally.xyz/governance/${defaultChainId}/proposal/${proposal.id}`,
          deadline: proposal.eta
            ? new Date(proposal.eta * 1000).toISOString() // Tally uses Unix seconds
            : null,
          created_at: new Date().toISOString(), // Default since not available
          updated_at: new Date().toISOString(), // Default since not available
          executed_at: null, // Not available in this API structure
          canceled_at: null, // Not available in this API structure

          // Voting data from voteStats
          for_votes: proposal.voteStats?.[0]?.votes || 0,
          against_votes: 0, // Not directly available in this structure
          abstain_votes: 0, // Not directly available in this structure
          quorum: 0, // Not directly available in this structure
          total_votes: proposal.voteStats?.[0]?.votes || 0,

          // Execution data
          execution_time: null, // Not available in simplified API
          timelock_id: '',

          // Metadata
          metadata: {
            tally_id: proposal.id,
            chain_id: defaultChainId,
            platform: 'tally',
            raw_data: proposal,
            source: 'tally-graphql-api',
            governor_name: proposal.governor?.name,
            organization_name: null, // Not available in simplified API
          },

          // Actions/Transactions (if available)
          actions: proposal.actions || [],

          // Tags and categories
          tags: proposal.tags || [],
          category: proposal.category || 'general',
        }));

        console.log(
          `Loaded ${transformedProposals.length} existing proposals from Tally API`
        );
        return transformedProposals;
      } catch (error) {
        console.error(
          'Failed to load existing proposals from Tally API:',
          error
        );
        toast.error(
          'Failed to load existing proposals',
          'Check your Tally API configuration'
        );
        return [];
      }
    },
    enabled: !!env.TALLY_API_KEY, // Only run if Tally API key is configured
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to load a specific proposal from Tally API
 */
export function useExistingProposal(proposalId: string, chainId?: string) {
  const defaultChainId = chainId || env.TALLY_DEFAULT_CHAIN_ID || 'eip155:1';

  return useQuery({
    queryKey: [
      ...PROPOSAL_QUERY_KEYS.proposal(proposalId),
      'tally',
      defaultChainId,
    ],
    queryFn: async () => {
      try {
        // Extract Tally ID from our proposal ID format
        const tallyId = proposalId.replace('tally-', '');

        console.log('Loading proposal details from Tally API:', tallyId);

        const response = await tallyRequestWithRetry(() =>
          tallyApi.getProposal(tallyId)
        );

        // Extract proposal from GraphQL response
        const proposal = response?.proposal;

        if (!proposal) {
          throw new Error('Proposal not found');
        }

        // Transform to our format (similar to above)
        return {
          id: `tally-${proposal.id}`,
          title: proposal.title || 'Untitled Proposal',
          description: 'No description available', // Not available in simplified API
          content: 'No content available', // Not available in simplified API
          proposer: 'Unknown', // Not available in simplified API
          platform: 'tally',
          governance_platform_id: defaultChainId,
          status: 'active', // Default status since not available
          type: 'governance',
          url: `https://tally.xyz/governance/${defaultChainId}/proposal/${proposal.id}`,
          deadline: proposal.eta
            ? new Date(proposal.eta * 1000).toISOString()
            : null,
          created_at: new Date().toISOString(), // Default since not available
          updated_at: new Date().toISOString(), // Default since not available
          executed_at: null, // Not available in this API structure
          canceled_at: null, // Not available in this API structure

          // Voting data from voteStats
          for_votes: proposal.voteStats?.[0]?.votes || 0,
          against_votes: 0, // Not directly available in this structure
          abstain_votes: 0, // Not directly available in this structure
          quorum: 0, // Not directly available in this structure
          total_votes: proposal.voteStats?.[0]?.votes || 0,

          // Execution data
          execution_time: null, // Not available in simplified API
          timelock_id: '',

          // Metadata
          metadata: {
            tally_id: proposal.id,
            chain_id: defaultChainId,
            platform: 'tally',
            raw_data: proposal,
            source: 'tally-graphql-api',
            governor_name: proposal.governor?.name,
            organization_name: null, // Not available in simplified API
          },

          // Actions/Transactions (if available)
          actions: proposal.actions || [],

          // Tags and categories
          tags: proposal.tags || [],
          category: proposal.category || 'general',
        };
      } catch (error) {
        console.error('Failed to load proposal from Tally API:', error);
        toast.error(
          'Failed to load proposal details',
          'Check your Tally API configuration'
        );
        return null;
      }
    },
    enabled: !!proposalId && !!env.TALLY_API_KEY,
    staleTime: 2 * 60 * 1000, // 2 minutes for individual proposals
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to load governance platforms from Tally API
 */
export function useGovernancePlatformsWithTally() {
  return useQuery({
    queryKey: [...PROPOSAL_QUERY_KEYS.governancePlatforms, 'tally'],
    queryFn: async () => {
      try {
        // Return popular chain-based governance platforms
        return [
          {
            id: 'tally-ethereum',
            name: 'Tally.xyz - Ethereum',
            url: 'https://tally.xyz',
            apiEndpoint: env.TALLY_GRAPHQL_URL,
            type: 'governance',
            description: 'Tally governance platform for Ethereum mainnet',
            metadata: {
              source: 'tally-graphql-api',
              chain_id: 'eip155:1',
              default: true,
            },
          },
          {
            id: 'tally-polygon',
            name: 'Tally.xyz - Polygon',
            url: 'https://tally.xyz',
            apiEndpoint: env.TALLY_GRAPHQL_URL,
            type: 'governance',
            description: 'Tally governance platform for Polygon',
            metadata: {
              source: 'tally-graphql-api',
              chain_id: 'eip155:137',
            },
          },
          {
            id: 'tally-arbitrum',
            name: 'Tally.xyz - Arbitrum',
            url: 'https://tally.xyz',
            apiEndpoint: env.TALLY_GRAPHQL_URL,
            type: 'governance',
            description: 'Tally governance platform for Arbitrum',
            metadata: {
              source: 'tally-graphql-api',
              chain_id: 'eip155:42161',
            },
          },
        ];
      } catch (error) {
        console.error('Failed to load governance platforms:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to refresh proposals from Tally API
 */
export function useRefreshProposals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chainId?: string) => {
      const defaultChainId =
        chainId || env.TALLY_DEFAULT_CHAIN_ID || 'eip155:1';

      // Invalidate and refetch existing proposals
      await queryClient.invalidateQueries({
        queryKey: [...PROPOSAL_QUERY_KEYS.proposalsWithTally, defaultChainId],
      });

      toast.success('Proposals refreshed from Tally API');
      return true;
    },
    onError: error => {
      console.error('Failed to refresh proposals:', error);
      toast.error('Failed to refresh proposals', 'Please try again later');
    },
  });
}

/**
 * Map Tally status to our status format
 */
function mapTallyStatus(tallyStatus: string): string {
  if (!tallyStatus) return 'active';

  const statusMapping: Record<string, string> = {
    ACTIVE: 'active',
    PENDING: 'pending',
    EXECUTED: 'executed',
    CANCELED: 'canceled',
    DEFEATED: 'defeated',
    EXPIRED: 'expired',
    QUEUED: 'queued',
    SUCCEEDED: 'succeeded',
    VETOED: 'vetoed',
  };

  const upperStatus = String(tallyStatus).toUpperCase();
  return statusMapping[upperStatus] || tallyStatus.toLowerCase();
}
