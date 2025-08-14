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

// Hook for getting runtime stats
export function useRuntimeStats() {
  return useQuery({
    queryKey: aoQueryKeys.runtimeStats(),
    queryFn: () => aoClient.getRuntimeStats(),
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
export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proposal: Partial<Proposal>) =>
      aoClient.createProposal(proposal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.proposals() });
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Proposal> }) =>
      aoClient.updateProposal(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.proposals() });
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.proposal(id) });
    },
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => aoClient.deleteProposal(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.proposals() });
      queryClient.removeQueries({ queryKey: aoQueryKeys.proposal(id) });
    },
  });
}

export function useTriggerScrape() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (platformId: string) => aoClient.triggerScrape(platformId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoQueryKeys.scrapeHistory() });
    },
  });
}
