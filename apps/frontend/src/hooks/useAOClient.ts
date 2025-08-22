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
import type { Proposal } from '@/types';

// Query keys
export const aoQueryKeys = {
  all: ['ao'] as const,
  proposals: () => [...aoQueryKeys.all, 'proposals'] as const,
  proposal: (id: string) => [...aoQueryKeys.proposals(), id] as const,
  runtimeStats: () => [...aoQueryKeys.all, 'runtime-stats'] as const,
  scrapeHistory: () => [...aoQueryKeys.all, 'scrape-history'] as const,
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
    queryKey: aoQueryKeys.runtimeStats(), // Reusing the key for now
    queryFn: () => getGovernancePlatforms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting API rate limits
export function useApiRateLimits() {
  return useQuery({
    queryKey: aoQueryKeys.runtimeStats(), // Reusing the key for now
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
    queryKey: aoQueryKeys.scrapeHistory(), // Reusing the key for now
    queryFn: () => getSubscribers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting balances
export function useBalances() {
  return useQuery({
    queryKey: aoQueryKeys.scrapeHistory(), // Reusing the key for now
    queryFn: () => getBalances(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.scrapeHistory() }); // Reusing key
    },
  });
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: any) => Promise.resolve(), // TODO: Implement broadcast
    onSuccess: () => {
      // No cache invalidation needed for notifications
    },
  });
}

export function useScrapeGovernance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (platformId: string) => scrapeGovernance(platformId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.scrapeHistory() });
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.proposals() });
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
    },
  });
}

export function useResetRateLimits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aoSendAdmin<any>('ResetRateLimits'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.runtimeStats() });
    },
  });
}

export function useAddBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (balance: any) =>
      adjustBalance(balance.address, balance.amount, 'Manual adjustment'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.scrapeHistory() }); // Reusing key
    },
  });
}
