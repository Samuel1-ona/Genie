import { aoSend, aoSendAdmin } from '@/lib/aoClient';
import type { AIResult, AIStatus, EnrichRequest } from '@/types/ai';

export async function enrichProposal(req: EnrichRequest) {
  return aoSend<AIResult>('EnrichProposal', req);
}

export async function summarizeProposal(
  id: string,
  mode: 'short' | 'detailed' = 'detailed'
) {
  return aoSend<AIResult>('SummarizeProposal', { id, mode });
}

export async function analyzeSentiment(id: string) {
  return aoSend<AIResult>('AnalyzeSentiment', { id });
}

export async function getAIStatus() {
  return aoSend<AIStatus>('GetAIStatus');
}

// Optional, admin-gated bulk retry
export async function retryAI(ids?: string[]) {
  return aoSendAdmin<{ ok: boolean; queued: number }>('RetryAI', { ids });
}
