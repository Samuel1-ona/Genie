/**
 * Application types for Genie Proposal Summarizer
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

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Proposal interface
export interface Proposal extends BaseEntity {
  title: string;
  description: string;
  status: ProposalStatus;
  daoId: string;
  governancePlatformId: string;
  proposalId: string; // External proposal ID from the platform
  startDate: string;
  endDate: string;
  quorum?: number;
  votesFor?: number;
  votesAgainst?: number;
  votesAbstain?: number;
  totalVotes?: number;
  executionDate?: string;
  executedBy?: string;
  metadata?: Record<string, any>;
}

// Subscriber interface
export interface Subscriber extends BaseEntity {
  name: string;
  type: 'discord' | 'telegram';
  endpoint: string;
  isActive: boolean;
  lastActiveAt: string;
  // Legacy fields for backward compatibility
  walletAddress?: string;
  email?: string;
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    daoIds: string[];
  };
}

// Governance Platform interface
export interface GovernancePlatform extends BaseEntity {
  name: string;
  category?: string;
  status: 'active' | 'error' | 'paused';
  scrapeStatus: 'success' | 'failed' | 'paused';
  totalProposals: number;
  activeProposals: number;
  lastUpdated: string;
  type?: string;
  // Legacy fields for backward compatibility
  slug?: string;
  baseUrl?: string;
  apiEndpoint?: string;
  isActive?: boolean;
  config?: {
    rateLimit: RateLimit;
    supportedFeatures: string[];
    authRequired: boolean;
  };
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

// Rate Limit interface
export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

// Scrape History interface
export interface ScrapeHistory extends BaseEntity {
  platformId: string;
  daoId?: string;
  status: 'success' | 'failed' | 'partial';
  proposalsScraped: number;
  errors: string[];
  duration: number; // in milliseconds
  metadata?: Record<string, any>;
}

// Balance interface
export interface Balance extends BaseEntity {
  walletAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balance: string;
  decimals: number;
  network: string;
  lastUpdated: string;
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
