export type AISentiment = 'positive' | 'neutral' | 'negative';

export interface AIResult {
  id: string;
  summary?: string; // long (~600 chars) from APUS
  short?: string; // optional short (~150 chars) if provided
  confidence?: number; // 0..1
  sentiment?: AISentiment;
  score?: number; // -1..1 or 0..1 depending on backend; treat as float
  key_points?: string[];
  last_updated?: number; // unix seconds
  pending?: boolean; // FE convenience flag when enrichment is running
}

export interface AIStatus {
  queueDepth: number;
  lastRun?: number;
  lastError?: { ts: number; code: string; message?: string };
}

export interface EnrichRequest {
  id: string;
  mode?: 'short' | 'detailed' | 'both';
}
