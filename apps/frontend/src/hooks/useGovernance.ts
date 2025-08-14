import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { governanceApi } from '@/api/governance';

// Query keys
export const governanceKeys = {
  all: ['governance'] as const,
  platforms: () => [...governanceKeys.all, 'platforms'] as const,
  status: () => [...governanceKeys.all, 'status'] as const,
  scrape: (platformId: string) => [...governanceKeys.all, 'scrape', platformId] as const,
};

// Hooks
export function useGovernancePlatforms() {
  return useQuery({
    queryKey: governanceKeys.platforms(),
    queryFn: governanceApi.platforms,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGovernanceStatus() {
  return useQuery({
    queryKey: governanceKeys.status(),
    queryFn: governanceApi.status,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });
}

export function useGovernanceScrape() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      governanceId, 
      name, 
      url 
    }: { 
      governanceId: string; 
      name?: string; 
      url?: string; 
    }) => {
      return governanceApi.scrape(governanceId, name, url);
    },
    onSuccess: () => {
      // Invalidate related queries after successful scrape
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: governanceKeys.status() });
    },
  });
}
