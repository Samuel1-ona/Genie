/**
 * Mock AO handlers for development
 * Returns plausible data structures matching the application types
 */

import type {
  Proposal,
  Subscriber,
  GovernancePlatform,
  Balance,
  ScrapeHistory,
  RuntimeStats,
  RateLimit,
  ApiResponse,
} from '@/types';

// Generate a recent timestamp
function getRecentTimestamp(): string {
  const now = new Date();
  // Random offset within the last 24 hours
  const offset = Math.floor(Math.random() * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - offset).toISOString();
}

// Generate a base entity with timestamps
function createBaseEntity(id: string) {
  const createdAt = getRecentTimestamp();
  const updatedAt = new Date().toISOString();
  return { id, createdAt, updatedAt };
}

// Mock proposals data
const mockProposals: Proposal[] = [
  {
    ...createBaseEntity('prop-1'),
    title: 'Increase Treasury Allocation for Development',
    description:
      'Proposal to allocate 500 ETH from treasury for ongoing development initiatives and community grants.',
    status: 'active',
    daoId: 'dao-uniswap',
    governancePlatformId: 'platform-snapshot',
    proposalId: '0x1234567890abcdef',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: 1000000,
    votesFor: 750000,
    votesAgainst: 150000,
    votesAbstain: 50000,
    totalVotes: 950000,
  },
  {
    ...createBaseEntity('prop-2'),
    title: 'Update Protocol Parameters',
    description:
      'Adjust fee structure and liquidity parameters to optimize protocol efficiency.',
    status: 'passed',
    daoId: 'dao-aave',
    governancePlatformId: 'platform-tally',
    proposalId: '0xabcdef1234567890',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: 500000,
    votesFor: 450000,
    votesAgainst: 30000,
    votesAbstain: 10000,
    totalVotes: 490000,
    executionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    executedBy: '0x1234567890abcdef1234567890abcdef12345678',
  },
  {
    ...createBaseEntity('prop-3'),
    title: 'Community Grant Program',
    description:
      'Establish a new grant program to support community-driven projects.',
    status: 'pending',
    daoId: 'dao-compound',
    governancePlatformId: 'platform-snapshot',
    proposalId: '0x9876543210fedcba',
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: 200000,
  },
];

// Mock subscribers data
const mockSubscribers: Subscriber[] = [
  {
    ...createBaseEntity('sub-1'),
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    email: 'alice@example.com',
    name: 'Alice Johnson',
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      daoIds: ['dao-uniswap', 'dao-aave'],
    },
    isActive: true,
    lastActiveAt: new Date().toISOString(),
  },
  {
    ...createBaseEntity('sub-2'),
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    email: 'bob@example.com',
    name: 'Bob Smith',
    preferences: {
      emailNotifications: false,
      pushNotifications: true,
      daoIds: ['dao-compound'],
    },
    isActive: true,
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock governance platforms
const mockGovernancePlatforms: GovernancePlatform[] = [
  {
    ...createBaseEntity('platform-snapshot'),
    name: 'Snapshot',
    slug: 'snapshot',
    baseUrl: 'https://snapshot.org',
    apiEndpoint: 'https://api.snapshot.org',
    isActive: true,
    config: {
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
        burstLimit: 10,
      },
      supportedFeatures: ['proposals', 'votes', 'delegation'],
      authRequired: false,
    },
  },
  {
    ...createBaseEntity('platform-tally'),
    name: 'Tally',
    slug: 'tally',
    baseUrl: 'https://tally.xyz',
    apiEndpoint: 'https://api.tally.xyz',
    isActive: true,
    config: {
      rateLimit: {
        requestsPerMinute: 30,
        requestsPerHour: 500,
        requestsPerDay: 5000,
        burstLimit: 5,
      },
      supportedFeatures: ['proposals', 'votes', 'execution'],
      authRequired: true,
    },
  },
];

// Mock balances
const mockBalances: Balance[] = [
  {
    ...createBaseEntity('bal-1'),
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenAddress: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C8',
    tokenSymbol: 'UNI',
    tokenName: 'Uniswap',
    balance: '1500.5',
    decimals: 18,
    network: 'ethereum',
    lastUpdated: new Date().toISOString(),
  },
  {
    ...createBaseEntity('bal-2'),
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenAddress: '0xB0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C8',
    tokenSymbol: 'AAVE',
    tokenName: 'Aave',
    balance: '250.75',
    decimals: 18,
    network: 'ethereum',
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

// Mock scrape history
const mockScrapeHistory: ScrapeHistory[] = [
  {
    ...createBaseEntity('scrape-1'),
    platformId: 'platform-snapshot',
    daoId: 'dao-uniswap',
    status: 'success',
    proposalsScraped: 15,
    errors: [],
    duration: 2500,
    metadata: { totalProposals: 15, newProposals: 3 },
  },
  {
    ...createBaseEntity('scrape-2'),
    platformId: 'platform-tally',
    daoId: 'dao-aave',
    status: 'partial',
    proposalsScraped: 8,
    errors: ['Rate limit exceeded', 'Connection timeout'],
    duration: 5000,
    metadata: { totalProposals: 12, newProposals: 2 },
  },
];

// Mock runtime stats
const mockRuntimeStats: RuntimeStats = {
  uptime: 86400, // 24 hours in seconds
  memoryUsage: 512, // MB
  cpuUsage: 15.5, // percentage
  activeConnections: 25,
  requestsPerMinute: 45,
  errorRate: 0.02, // 2%
  lastHealthCheck: new Date().toISOString(),
  status: 'healthy',
};

// Mock rate limits
const mockRateLimits: Record<string, RateLimit> = {
  'platform-snapshot': {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    burstLimit: 10,
  },
  'platform-tally': {
    requestsPerMinute: 30,
    requestsPerHour: 500,
    requestsPerDay: 5000,
    burstLimit: 5,
  },
};

// Mock API call counts
const mockApiCallCounts = {
  total: 15420,
  today: 1250,
  thisHour: 45,
  byPlatform: {
    'platform-snapshot': 8200,
    'platform-tally': 7220,
  },
  byAction: {
    GetAllProposals: 4500,
    GetProposal: 3200,
    SearchProposals: 1800,
    GetGovernancePlatforms: 1200,
    ScrapeGovernance: 4720,
  },
};

// Mock cached data
const mockCachedData = {
  proposals: 1250,
  platforms: 8,
  subscribers: 450,
  balances: 3200,
  cacheSize: '45.2 MB',
  lastUpdated: new Date().toISOString(),
  ttl: 300, // 5 minutes
};

// Mock error logs
const mockErrorLogs = [
  {
    id: 'error-1',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    level: 'ERROR',
    message: 'Rate limit exceeded for platform-snapshot',
    details: { platformId: 'platform-snapshot', retryCount: 3 },
  },
  {
    id: 'error-2',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    level: 'WARNING',
    message: 'Connection timeout for platform-tally',
    details: { platformId: 'platform-tally', timeout: 5000 },
  },
];

// Main mock AO handler
export async function mockAo(
  action: string,
  data?: any,
  tags?: Record<string, string>
): Promise<any> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));

  console.log(`Mock AO: ${action}`, { data, tags });

  switch (action) {
    // Proposal actions
    case 'GetAllProposals':
      return mockProposals;

    case 'GetProposal':
      const proposalId = data?.id;
      const proposal = mockProposals.find(p => p.id === proposalId);
      if (!proposal) {
        throw new Error(`Proposal not found: ${proposalId}`);
      }
      return proposal;

    case 'SearchProposals':
      const query = data?.query?.toLowerCase() || '';
      return mockProposals.filter(
        p =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );

    case 'GetProposalsByPlatform':
      const platformId = data?.platformId;
      return mockProposals.filter(p => p.governancePlatformId === platformId);

    // Governance platform actions
    case 'GetGovernancePlatforms':
      return mockGovernancePlatforms;

    case 'ScrapeGovernance':
      const scrapePlatformId = data?.platformId;
      const platform = mockGovernancePlatforms.find(
        p => p.id === scrapePlatformId
      );
      if (!platform) {
        throw new Error(`Platform not found: ${scrapePlatformId}`);
      }
      return {
        platformId: scrapePlatformId,
        status: 'success',
        proposalsScraped: Math.floor(Math.random() * 20) + 5,
        duration: Math.floor(Math.random() * 3000) + 1000,
        timestamp: new Date().toISOString(),
      };

    // Subscriber actions
    case 'GetSubscribers':
      return mockSubscribers;

    case 'AddSubscriber':
      const newSubscriber: Subscriber = {
        ...createBaseEntity(`sub-${Date.now()}`),
        walletAddress: data.walletAddress,
        email: data.email,
        name: data.name,
        preferences: data.preferences || {
          emailNotifications: true,
          pushNotifications: true,
          daoIds: [],
        },
        isActive: true,
        lastActiveAt: new Date().toISOString(),
      };
      mockSubscribers.push(newSubscriber);
      return newSubscriber;

    case 'BroadcastNotification':
      return {
        messageId: `msg-${Date.now()}`,
        recipients: mockSubscribers.length,
        sent: mockSubscribers.filter(s => s.isActive).length,
        failed: 0,
        timestamp: new Date().toISOString(),
      };

    // Monitoring actions
    case 'GetScrapingHistory':
      return mockScrapeHistory;

    case 'GetApiRateLimits':
      return mockRateLimits;

    case 'GetCachedData':
      return mockCachedData;

    case 'GetApiCallCounts':
      return mockApiCallCounts;

    case 'GetErrorLogs':
      return mockErrorLogs;

    case 'ClearCache':
      return {
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString(),
      };

    case 'ResetRateLimits':
      return {
        success: true,
        message: 'Rate limits reset successfully',
        timestamp: new Date().toISOString(),
      };

    // Balance actions
    case 'GetAllBalances':
      return mockBalances;

    case 'GetBalance':
      const walletAddress = data?.walletAddress;
      const tokenAddress = data?.tokenAddress;
      if (tokenAddress) {
        return (
          mockBalances.find(
            b =>
              b.walletAddress === walletAddress &&
              b.tokenAddress === tokenAddress
          ) || null
        );
      }
      return mockBalances.filter(b => b.walletAddress === walletAddress);

    case 'AddBalance':
      const newBalance: Balance = {
        ...createBaseEntity(`bal-${Date.now()}`),
        walletAddress: data.walletAddress,
        tokenAddress: data.tokenAddress,
        tokenSymbol: data.tokenSymbol,
        tokenName: data.tokenName,
        balance: data.balance,
        decimals: data.decimals || 18,
        network: data.network || 'ethereum',
        lastUpdated: new Date().toISOString(),
      };
      mockBalances.push(newBalance);
      return newBalance;

    // Health check
    case 'HealthCheck':
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: mockRuntimeStats.uptime,
        version: '1.0.0',
      };

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
