import { useMutation, useQuery } from '@tanstack/react-query';
import {
  enrichProposal,
  summarizeProposal,
  analyzeSentiment,
  getAIStatus,
  retryAI,
} from '@/api/ai';
import type { AIResult, AIStatus } from '@/types/ai';

export function useAIStatus() {
  return useQuery<AIStatus>({
    queryKey: ['ai-status'],
    queryFn: getAIStatus,
    refetchInterval: 30000,
  });
}

export function useEnrichProposal(id: string | undefined) {
  return useMutation<AIResult, Error, { mode?: 'short' | 'detailed' | 'both' }>(
    {
      mutationFn: vars =>
        enrichProposal({ id: id!, mode: vars?.mode ?? 'both' }),
    }
  );
}

export function useSummarizeProposal(
  id: string | undefined,
  mode: 'short' | 'detailed' = 'detailed'
) {
  return useMutation<AIResult, Error>({
    mutationFn: () => summarizeProposal(id!, mode),
  });
}

export function useAnalyzeSentiment(id: string | undefined) {
  return useMutation<AIResult, Error>({
    mutationFn: () => analyzeSentiment(id!),
  });
}

export function useRetryAI() {
  return useMutation<
    { ok: boolean; queued: number },
    Error,
    { ids?: string[] }
  >({
    mutationFn: v => retryAI(v?.ids),
  });
}
