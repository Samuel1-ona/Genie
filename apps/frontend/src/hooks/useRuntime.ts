import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { runtimeApi } from '@/api/runtime';

// Query keys
export const runtimeKeys = {
  all: ['runtime'] as const,
  history: () => [...runtimeKeys.all, 'history'] as const,
  rateLimits: () => [...runtimeKeys.all, 'rateLimits'] as const,
  cacheInfo: () => [...runtimeKeys.all, 'cacheInfo'] as const,
  apiCounts: () => [...runtimeKeys.all, 'apiCounts'] as const,
  errors: () => [...runtimeKeys.all, 'errors'] as const,
};

// Hooks
export function useScrapingHistory() {
  return useQuery({
    queryKey: runtimeKeys.history(),
    queryFn: runtimeApi.history,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });
}

export function useRateLimits() {
  return useQuery({
    queryKey: runtimeKeys.rateLimits(),
    queryFn: runtimeApi.rateLimits,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useCacheInfo() {
  return useQuery({
    queryKey: runtimeKeys.cacheInfo(),
    queryFn: runtimeApi.cacheInfo,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });
}

export function useApiCounts() {
  return useQuery({
    queryKey: runtimeKeys.apiCounts(),
    queryFn: runtimeApi.apiCounts,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });
}

export function useErrorLogs() {
  return useQuery({
    queryKey: runtimeKeys.errors(),
    queryFn: runtimeApi.errors,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });
}

// Mutations
export function useClearCache() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: runtimeApi.clearCache,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: runtimeKeys.cacheInfo() });
    },
  });
}

export function useResetRateLimits() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: runtimeApi.resetLimits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: runtimeKeys.rateLimits() });
    },
  });
}
