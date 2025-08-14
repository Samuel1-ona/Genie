import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications';
import type { Subscriber, Proposal } from '@/types';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  subscribers: () => [...notificationKeys.all, 'subscribers'] as const,
};

// Hooks
export function useSubscribers() {
  return useQuery({
    queryKey: notificationKeys.subscribers(),
    queryFn: notificationsApi.list,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAddSubscriber() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subscriber: Subscriber) => {
      return notificationsApi.add(subscriber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.subscribers() });
    },
  });
}

export function useBroadcastNotification() {
  return useMutation({
    mutationFn: async ({ 
      summary, 
      proposal 
    }: { 
      summary: string; 
      proposal: Pick<Proposal, 'id' | 'title' | 'url'>; 
    }) => {
      return notificationsApi.broadcast(summary, proposal);
    },
  });
}
