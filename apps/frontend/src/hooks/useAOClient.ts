/**
 * React hooks for AO client operations using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllProposals,
  getGovernancePlatforms,
  getSubscribers,
  scrapeGovernance,
  addSubscriber,
  removeSubscriber,
  getRuntimeStats,
  getBalances,
  adjustBalance,
  getErrors,
  aoSend,
  aoSendAdmin,
} from '@/lib/aoClient';
import { toast } from '@/lib/toast';
import type { Proposal } from '@/types';

// Query keys
export const aoQueryKeys = {
  all: ['ao'] as const,
  proposals: () => [...aoQueryKeys.all, 'proposals'] as const,
  proposal: (id: string) => [...aoQueryKeys.proposals(), id] as const,
  governancePlatforms: () =>
    [...aoQueryKeys.all, 'governance-platforms'] as const,
  subscribers: () => [...aoQueryKeys.all, 'subscribers'] as const,
  balances: () => [...aoQueryKeys.all, 'balances'] as const,
  runtimeStats: () => [...aoQueryKeys.all, 'runtime-stats'] as const,
  scrapeHistory: () => [...aoQueryKeys.all, 'scrape-history'] as const,
  errors: () => [...aoQueryKeys.all, 'errors'] as const,
  health: () => [...aoQueryKeys.all, 'health'] as const,
};

// Hook for getting proposals
export function useProposals() {
  return useQuery({
    queryKey: aoQueryKeys.proposals(),
    queryFn: () => getAllProposals(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for searching proposals
export function useSearchProposals(query: string) {
  return useQuery({
    queryKey: [...aoQueryKeys.proposals(), 'search', query],
    queryFn: () => getAllProposals(), // TODO: Implement search functionality
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for getting proposals by platform
export function useProposalsByPlatform(platformId: string) {
  return useQuery({
    queryKey: [...aoQueryKeys.proposals(), 'platform', platformId],
    queryFn: () => getAllProposals(), // TODO: Implement platform filtering
    enabled: !!platformId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting a single proposal
export function useProposal(id: string) {
  return useQuery({
    queryKey: aoQueryKeys.proposal(id),
    queryFn: () =>
      getAllProposals().then(proposals => proposals.find(p => p.id === id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for getting governance platforms
export function useGovernancePlatforms() {
  return useQuery({
    queryKey: aoQueryKeys.governancePlatforms(),
    queryFn: () => getGovernancePlatforms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting API rate limits
export function useApiRateLimits() {
  return useQuery({
    queryKey: aoQueryKeys.runtimeStats(),
    queryFn: () => getRuntimeStats(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// Hook for getting scrape history
export function useScrapeHistory() {
  return useQuery({
    queryKey: aoQueryKeys.scrapeHistory(),
    queryFn: () => getRuntimeStats(), // TODO: Implement scrape history
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for getting subscribers
export function useSubscribers() {
  return useQuery({
    queryKey: aoQueryKeys.subscribers(),
    queryFn: () => getSubscribers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting balances
export function useBalances() {
  return useQuery({
    queryKey: aoQueryKeys.balances(),
    queryFn: () => getBalances(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for getting errors
export function useErrors() {
  return useQuery({
    queryKey: aoQueryKeys.errors(),
    queryFn: () => getErrors(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for health check
export function useHealthCheck() {
  return useQuery({
    queryKey: aoQueryKeys.health(),
    queryFn: () => getRuntimeStats(), // TODO: Implement health check
    staleTime: 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Mutation hooks
export function useAddSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriber: any) => addSubscriber(subscriber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.subscribers() });
      toast.success(
        'Subscriber Added',
        'The subscriber has been added successfully.'
      );
    },
    onError: error => {
      toast.error('Failed to Add Subscriber', error.message);
    },
  });
}

export function useRemoveSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriberId: string) => removeSubscriber(subscriberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.subscribers() });
      toast.success(
        'Subscriber Removed',
        'The subscriber has been removed successfully.'
      );
    },
    onError: error => {
      toast.error('Failed to Remove Subscriber', error.message);
    },
  });
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: any) => Promise.resolve(), // TODO: Implement broadcast
    onSuccess: () => {
      toast.success(
        'Notification Sent',
        'The notification has been sent successfully.'
      );
    },
    onError: error => {
      toast.error('Failed to Send Notification', error.message);
    },
  });
}

export function useScrapeGovernance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (platformId: string) => scrapeGovernance(platformId),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.scrapeHistory() });
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.proposals() });
      const count = data?.proposalsScraped || 0;
      toast.success(
        'Governance Scraped',
        `Successfully scraped ${count} proposals.`
      );
    },
    onError: error => {
      toast.error('Failed to Scrape Governance', error.message);
    },
  });
}

export function useClearCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aoSendAdmin<any>('ClearCache'),
    onSuccess: () => {
      // Invalidate all queries
      queryClient.invalidateQueries();
      toast.success(
        'Cache Cleared',
        'The cache has been cleared successfully.'
      );
    },
    onError: error => {
      toast.error('Failed to Clear Cache', error.message);
    },
  });
}

export function useResetRateLimits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aoSendAdmin<any>('ResetRateLimits'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.runtimeStats() });
      toast.success(
        'Rate Limits Reset',
        'The rate limits have been reset successfully.'
      );
    },
    onError: error => {
      toast.error('Failed to Reset Rate Limits', error.message);
    },
  });
}

export function useAddBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (balance: any) =>
      adjustBalance(balance.address, balance.amount, 'Manual adjustment'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.balances() });
      toast.success(
        'Balance Adjusted',
        'The balance has been adjusted successfully.'
      );
    },
    onError: error => {
      toast.error('Failed to Adjust Balance', error.message);
    },
  });
}
