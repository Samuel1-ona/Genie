import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalsApi } from '@/api/proposals';
import type { Proposal } from '@/types';

// Query keys
export const proposalKeys = {
  all: ['proposals'] as const,
  lists: () => [...proposalKeys.all, 'list'] as const,
  list: (filters: string) => [...proposalKeys.lists(), { filters }] as const,
  details: () => [...proposalKeys.all, 'detail'] as const,
  detail: (id: string) => [...proposalKeys.details(), id] as const,
  byPlatform: (platformId: string) => [...proposalKeys.all, 'platform', platformId] as const,
};

// Hooks
export function useProposals() {
  return useQuery({
    queryKey: proposalKeys.lists(),
    queryFn: proposalsApi.list,
    staleTime: 60 * 1000, // 60 seconds
  });
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: proposalKeys.detail(id),
    queryFn: () => proposalsApi.get(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useProposalSearch(params: {
  q?: string;
  status?: string;
  dao?: string;
  from?: number;
  to?: number;
}) {
  const filters = JSON.stringify(params);
  
  return useQuery({
    queryKey: proposalKeys.list(filters),
    queryFn: () => proposalsApi.search(params),
    enabled: Object.values(params).some(Boolean),
    staleTime: 60 * 1000, // 60 seconds
  });
}

export function useProposalsByPlatform(platformId: string) {
  return useQuery({
    queryKey: proposalKeys.byPlatform(platformId),
    queryFn: () => proposalsApi.byPlatform(platformId),
    enabled: !!platformId,
    staleTime: 60 * 1000, // 60 seconds
  });
}

// Mutations
export function useInvalidateProposals() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: proposalKeys.all });
    },
  });
}
