/**
 * React hooks for AO client operations using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aoClient } from '@/lib/aoClient';
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
    queryFn: () => aoClient.getProposals(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for searching proposals
export function useSearchProposals(query: string) {
  return useQuery({
    queryKey: [...aoQueryKeys.proposals(), 'search', query],
    queryFn: () => aoClient.searchProposals(query),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for getting proposals by platform
export function useProposalsByPlatform(platformId: string) {
  return useQuery({
    queryKey: [...aoQueryKeys.proposals(), 'platform', platformId],
    queryFn: () => aoClient.getProposalsByPlatform(platformId),
    enabled: !!platformId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting a single proposal
export function useProposal(id: string) {
  return useQuery({
    queryKey: aoQueryKeys.proposal(id),
    queryFn: () => aoClient.getProposal(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for getting governance platforms
export function useGovernancePlatforms() {
  return useQuery({
    queryKey: aoQueryKeys.runtimeStats(), // Reusing the key for now
    queryFn: () => aoClient.getGovernancePlatforms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting API rate limits
export function useApiRateLimits() {
  return useQuery({
    queryKey: aoQueryKeys.runtimeStats(), // Reusing the key for now
    queryFn: () => aoClient.getApiRateLimits(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// Hook for getting scrape history
export function useScrapeHistory() {
  return useQuery({
    queryKey: aoQueryKeys.scrapeHistory(),
    queryFn: () => aoClient.getScrapeHistory(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for getting subscribers
export function useSubscribers() {
  return useQuery({
    queryKey: aoQueryKeys.scrapeHistory(), // Reusing the key for now
    queryFn: () => aoClient.getSubscribers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting balances
export function useBalances() {
  return useQuery({
    queryKey: aoQueryKeys.scrapeHistory(), // Reusing the key for now
    queryFn: () => aoClient.getAllBalances(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for health check
export function useHealthCheck() {
  return useQuery({
    queryKey: aoQueryKeys.health(),
    queryFn: () => aoClient.healthCheck(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Mutation hooks
export function useAddSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriber: any) => aoClient.addSubscriber(subscriber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.scrapeHistory() }); // Reusing key
    },
  });
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: any) => aoClient.broadcastNotification(message),
    onSuccess: () => {
      // No cache invalidation needed for notifications
    },
  });
}

export function useScrapeGovernance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (platformId: string) => aoClient.scrapeGovernance(platformId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.scrapeHistory() });
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.proposals() });
    },
  });
}

export function useClearCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aoClient.clearCache(),
    onSuccess: () => {
      // Invalidate all queries
      queryClient.invalidateQueries();
    },
  });
}

export function useResetRateLimits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aoClient.resetRateLimits(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.runtimeStats() });
    },
  });
}

export function useAddBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (balance: any) => aoClient.addBalance(balance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.scrapeHistory() }); // Reusing key
    },
  });
}
