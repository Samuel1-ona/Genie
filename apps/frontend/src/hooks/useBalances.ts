import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { balancesApi } from '@/api/balances';

// Query keys
export const balanceKeys = {
  all: ['balances'] as const,
  lists: () => [...balanceKeys.all, 'list'] as const,
  list: (filters: string) => [...balanceKeys.lists(), { filters }] as const,
  details: () => [...balanceKeys.all, 'detail'] as const,
  detail: (address: string) => [...balanceKeys.details(), address] as const,
};

// Hooks
export function useBalances() {
  return useQuery({
    queryKey: balanceKeys.lists(),
    queryFn: balancesApi.all,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useBalance(address: string) {
  return useQuery({
    queryKey: balanceKeys.detail(address),
    queryFn: () => balancesApi.get(address),
    enabled: !!address,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Mutations
export function useAddBalance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      address, 
      amount 
    }: { 
      address: string; 
      amount: number; 
    }) => {
      return balancesApi.add(address, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: balanceKeys.all });
    },
  });
}

export function useInvalidateBalances() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: balanceKeys.all });
    },
  });
}
