/**
 * Application types for Genie Proposal Summarizer
 * Aligned with AO contract expectations
 */

// Proposal status types
export type ProposalStatus =
  | 'active'
  | 'pending'
  | 'passed'
  | 'failed'
  | 'executed'
  | 'canceled'
  | 'expired';

// Proposal interface - aligned with AO contract
export interface Proposal {
  id: string; // Required by AO contract
  title: string;
  description?: string;
  content?: string;
  proposer?: string;
  platform?: string;
  governance_platform_id?: string;
  status: ProposalStatus;
  type?: string;
  url?: string;
  deadline?: number;
  created_at?: number;
  updated_at?: number;
  executed_at?: number;
  canceled_at?: number;

  // Voting data
  for_votes?: number;
  against_votes?: number;
  abstain_votes?: number;
  quorum?: number;
  total_votes?: number;

  // Execution data
  execution_time?: number;
  timelock_id?: string;

  // Metadata
  metadata?: Record<string, any>;
  actions?: any[];
  tags?: string[];
  category?: string;
}

// Subscriber interface - aligned with AO contract
export interface Subscriber {
  name?: string;
  type: 'discord' | 'telegram'; // Required by AO contract
  active?: boolean;

  // Discord-specific fields
  webhook_url?: string; // Required for Discord

  // Telegram-specific fields
  bot_token?: string; // Required for Telegram
  chat_id?: string; // Required for Telegram

  // Optional fields
  last_success?: number;
}

// Governance Platform interface - aligned with AO contract
export interface GovernancePlatform {
  id: string;
  chainId?: string;
  contracts?: any[];
  isIndexing?: boolean;
  isBehind?: boolean;
  isPrimary?: boolean;
  kind?: string;
  name: string;
  organization?: any;
  proposalStats?: any;
  parameters?: any;
  quorum?: number;
  slug?: string;
  timelockId?: string;
  tokenId?: string;
  token?: any;
  type?: string;
  delegatesCount?: number;
  delegatesVotesCount?: number;
  tokenOwnersCount?: number;
  metadata?: Record<string, any>;
  created_at?: number;
  updated_at?: number;
}

// Balance interface - aligned with AO contract
export interface Balance {
  [userId: string]: number; // User ID -> Balance amount
}

// Runtime Stats interface
export interface RuntimeStats {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
  lastHealthCheck: string;
  status: 'healthy' | 'warning' | 'error';
}

// Scrape History interface
export interface ScrapeHistory {
  timestamp: number;
  governanceId: string;
  status: 'success' | 'rate_limited' | 'error';
  message?: string;
}

// Rate Limit interface
export interface RateLimit {
  governanceId: string;
  remaining: number;
  resetAt: number;
}

// AO Message interface
export interface AOMessage {
  Target: string;
  Action: string;
  Data?: any;
  Tags?: Record<string, string>;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  requestId: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  requestId?: string;
}

// Filter and sort types
export interface ProposalFilters {
  status?: ProposalStatus[];
  daoId?: string;
  governancePlatformId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Hook return types
export interface UseProposalsOptions {
  filters?: ProposalFilters;
  sort?: SortOptions;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export interface UseProposalsResult {
  proposals: Proposal[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
