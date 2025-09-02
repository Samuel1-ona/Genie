/**
 * AO Connect Hooks
 * React hooks for AO process interactions using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aoDryrun, aoMessage } from '@/lib/aoClient';
import { getErrorMessage } from '@/lib/aoClient';
import { toast } from '@/lib/toast';

// State-modifying actions that require wallet signature
const stateModifyingActions = new Set([
  'AddProposal',
  'UpdateProposal',
  'DeleteProposal',
  'AddGovernancePlatform',
  'UpdateGovernancePlatform',
  'DeleteGovernancePlatform',
  'AddSubscriber',
  'BroadcastNotification',
  'ExecuteProposal',
  'UpdateVotes',
  'SetBalance',
  'AddBalance',
  'ClearCache',
  'ResetRateLimits',
  'ScrapeGovernance',
]);

/**
 * Generic AO dryrun hook
 */
export function useAODryrun(action: string, data?: any, tags?: any[]) {
  return useQuery({
    queryKey: ['ao-dryrun', action, data, tags],
    queryFn: async () => {
      const result = await aoDryrun(action, data, tags);
      return result;
    },
    enabled: !!action,
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Generic AO message hook
 */
export function useAOMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      data,
      tags,
    }: {
      action: string;
      data?: any;
      tags?: any[];
    }) => {
      const result = await aoMessage(action, data, tags);
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['ao-dryrun'] });
      toast.success('Operation completed successfully');
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, 'complete operation');
      toast.error('Operation Failed', errorMessage);
    },
  });
}

/**
 * Generic AO operation hook that determines whether to use dryrun or message
 */
export function useAOOperation(action: string, data?: any, tags?: any[]) {
  if (stateModifyingActions.has(action)) {
    const messageMutation = useAOMessage();
    return {
      data: undefined,
      loading: messageMutation.isPending,
      error: messageMutation.error,
      execute: () => messageMutation.mutate({ action, data, tags }),
      isPending: messageMutation.isPending,
    };
  } else {
    return useAODryrun(action, data, tags);
  }
}

// Specific hooks for common operations

/**
 * Hook for getting all proposals
 */
export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const result = await aoDryrun('GetAllProposals');
      return result.Proposals || result || [];
    },
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for getting governance platforms
 */
export function useGovernancePlatforms() {
  return useQuery({
    queryKey: ['governance-platforms'],
    queryFn: async () => {
      const result = await aoDryrun('GetGovernancePlatforms');
      return result.Platforms || result || [];
    },
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for getting subscribers
 */
export function useSubscribers() {
  return useQuery({
    queryKey: ['subscribers'],
    queryFn: async () => {
      const result = await aoDryrun('GetSubscribers');
      return result.Subscribers || result || [];
    },
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for getting balances
 */
export function useBalances() {
  return useQuery({
    queryKey: ['balances'],
    queryFn: async () => {
      const result = await aoDryrun('GetAllBalances');
      return result.Balances || result || {};
    },
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for getting errors
 */
export function useErrors() {
  return useQuery({
    queryKey: ['errors'],
    queryFn: async () => {
      const result = await aoDryrun('GetErrorLogs');
      return result.ErrorLogs || result || [];
    },
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for getting system info
 */
export function useSystemInfo() {
  return useQuery({
    queryKey: ['system-info'],
    queryFn: async () => {
      return aoDryrun('Info');
    },
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for health check
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health-check'],
    queryFn: async () => {
      return aoDryrun('Info');
    },
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for getting a specific proposal
 */
export function useProposal(proposalId: string | null) {
  return useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: async () => {
      if (!proposalId) throw new Error('Proposal ID is required');
      return aoDryrun('GetProposal', undefined, [
        { name: 'ProposalID', value: proposalId },
      ]);
    },
    enabled: !!proposalId,
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for searching proposals
 */
export function useProposalSearch(query: string | null) {
  return useQuery({
    queryKey: ['proposal-search', query],
    queryFn: async () => {
      if (!query) return [];
      const result = await aoDryrun('SearchProposals', undefined, [
        { name: 'Query', value: query },
      ]);
      return result.Results || result || [];
    },
    enabled: !!query && query.length > 0,
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for getting proposals by platform
 */
export function useProposalsByPlatform(platformId: string | null) {
  return useQuery({
    queryKey: ['proposals-by-platform', platformId],
    queryFn: async () => {
      if (!platformId) throw new Error('Platform ID is required');
      const result = await aoDryrun('GetProposalsByPlatform', undefined, [
        { name: 'PlatformID', value: platformId },
      ]);
      return result.Proposals || result || [];
    },
    enabled: !!platformId,
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for getting governance status
 */
export function useGovernanceStatus(governanceId: string | null) {
  return useQuery({
    queryKey: ['governance-status', governanceId],
    queryFn: async () => {
      if (!governanceId) throw new Error('Governance ID is required');
      return aoDryrun('GetGovernanceStatus', undefined, [
        { name: 'GovernanceID', value: governanceId },
      ]);
    },
    enabled: !!governanceId,
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for getting scraping history
 */
export function useScrapingHistory(governanceId: string | null) {
  return useQuery({
    queryKey: ['scraping-history', governanceId],
    queryFn: async () => {
      if (!governanceId) throw new Error('Governance ID is required');
      return aoDryrun('GetScrapingHistory', undefined, [
        { name: 'GovernanceID', value: governanceId },
      ]);
    },
    enabled: !!governanceId,
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for getting API rate limits
 */
export function useApiRateLimits() {
  return useQuery({
    queryKey: ['api-rate-limits'],
    queryFn: async () => {
      return aoDryrun('GetApiRateLimits');
    },
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for getting cached data
 */
export function useCachedData(governanceId: string | null) {
  return useQuery({
    queryKey: ['cached-data', governanceId],
    queryFn: async () => {
      if (!governanceId) throw new Error('Governance ID is required');
      return aoDryrun('GetCachedData', undefined, [
        { name: 'GovernanceID', value: governanceId },
      ]);
    },
    enabled: !!governanceId,
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for getting API call counts
 */
export function useApiCallCounts() {
  return useQuery({
    queryKey: ['api-call-counts'],
    queryFn: async () => {
      return aoDryrun('GetApiCallCounts');
    },
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook for getting a specific balance
 */
export function useBalance(userId: string | null) {
  return useQuery({
    queryKey: ['balance', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return aoDryrun('GetBalance', undefined, [
        { name: 'UserID', value: userId },
      ]);
    },
    enabled: !!userId,
    retry: 3,
    retryDelay: 1000,
  });
}

// Mutation hooks for state-modifying operations

/**
 * Hook for adding a proposal
 */
export function useAddProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalData: any) => {
      return aoMessage('AddProposal', proposalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal added successfully');
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, 'add proposal');
      toast.error('Failed to add proposal', errorMessage);
    },
  });
}

/**
 * Hook for executing a proposal
 */
export function useExecuteProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: string) => {
      return aoMessage('ExecuteProposal', undefined, [
        { name: 'ProposalID', value: proposalId },
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal executed successfully');
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, 'execute proposal');
      toast.error('Failed to execute proposal', errorMessage);
    },
  });
}

/**
 * Hook for adding a subscriber
 */
export function useAddSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriberData: any) => {
      return aoMessage('AddSubscriber', subscriberData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      toast.success('Subscriber added successfully');
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, 'add subscriber');
      toast.error('Failed to add subscriber', errorMessage);
    },
  });
}

/**
 * Hook for broadcasting a notification
 */
export function useBroadcastNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proposalData,
      summary,
    }: {
      proposalData: any;
      summary?: string;
    }) => {
      return aoMessage('BroadcastNotification', proposalData, [
        { name: 'Summary', value: summary || 'No summary provided' },
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      toast.success('Notification broadcasted successfully');
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, 'broadcast notification');
      toast.error('Failed to broadcast notification', errorMessage);
    },
  });
}

/**
 * Hook for setting balance
 */
export function useSetBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      amount,
    }: {
      userId: string;
      amount: number;
    }) => {
      return aoMessage('SetBalance', { amount }, [
        { name: 'UserID', value: userId },
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      toast.success('Balance set successfully');
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, 'set balance');
      toast.error('Failed to set balance', errorMessage);
    },
  });
}

/**
 * Hook for adding balance
 */
export function useAddBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      amount,
    }: {
      userId: string;
      amount: number;
    }) => {
      return aoMessage('AddBalance', { amount }, [
        { name: 'UserID', value: userId },
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      toast.success('Balance added successfully');
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, 'add balance');
      toast.error('Failed to add balance', errorMessage);
    },
  });
}

/**
 * Hook for scraping governance data
 */
export function useScrapeGovernance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      governanceId,
      platformConfig,
    }: {
      governanceId: string;
      platformConfig?: any;
    }) => {
      return aoMessage('ScrapeGovernance', platformConfig, [
        { name: 'GovernanceID', value: governanceId },
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-status'] });
      queryClient.invalidateQueries({ queryKey: ['scraping-history'] });
      toast.success('Governance data scraping started');
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, 'scrape governance data');
      toast.error('Failed to scrape governance data', errorMessage);
    },
  });
}
