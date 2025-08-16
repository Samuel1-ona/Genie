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
  // Create timestamps that match the image reference (Aug 13, around 20:00 WAT)
  const baseTime = new Date(2024, 7, 13, 20, 0, 0); // Aug 13, 20:00
  const offsets = [0, -2, -5, -8, -11, -14]; // Minutes offset for each entry
  const randomOffset = offsets[Math.floor(Math.random() * offsets.length)];
  return new Date(baseTime.getTime() + randomOffset * 60 * 1000).toISOString();
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
    title: 'UIP-001: Increase Uniswap Treasury',
    description:
      'Proposal to increase the Uniswap treasury allocation by 500 ETH for ongoing development initiatives, community grants, and strategic partnerships.',
    status: 'active',
    daoId: 'dao-uniswap',
    governancePlatformId: 'platform-snapshot',
    proposalId: '0x1234567890abcdef',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: 1000000,
    votesFor: 780000,
    votesAgainst: 120000,
    votesAbstain: 50000,
    totalVotes: 950000,
  },
  {
    ...createBaseEntity('prop-2'),
    title: 'M-24: MakerDAO Strategic Update',
    description:
      'Strategic proposal to update MakerDAO governance parameters and implement new risk management protocols.',
    status: 'passed',
    daoId: 'dao-makerdao',
    governancePlatformId: 'platform-tally',
    proposalId: '0xabcdef1234567890',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: 500000,
    votesFor: 495000,
    votesAgainst: 3000,
    votesAbstain: 2000,
    totalVotes: 500000,
    executionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    executedBy: '0x1234567890abcdef1234567890abcdef12345678',
  },
  {
    ...createBaseEntity('prop-3'),
    title: 'AAVE-001: Protocol Fee Adjustment',
    description:
      'Proposal to adjust AAVE protocol fees to optimize revenue generation and user experience.',
    status: 'active',
    daoId: 'dao-aave',
    governancePlatformId: 'platform-snapshot',
    proposalId: '0x9876543210fedcba',
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: 300000,
    votesFor: 195000,
    votesAgainst: 45000,
    votesAbstain: 15000,
    totalVotes: 255000,
  },
  {
    ...createBaseEntity('prop-4'),
    title: 'COMP-001: Community Grant Program',
    description:
      'Establish a new grant program to support community-driven projects and developer initiatives.',
    status: 'pending',
    daoId: 'dao-compound',
    governancePlatformId: 'platform-snapshot',
    proposalId: '0xabcdef9876543210',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: 200000,
  },
  {
    ...createBaseEntity('prop-5'),
    title: 'ENS-001: Domain Pricing Update',
    description:
      'Update ENS domain pricing structure to reflect current market conditions and improve revenue.',
    status: 'failed',
    daoId: 'dao-ens',
    governancePlatformId: 'platform-tally',
    proposalId: '0x1234567890fedcba',
    startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: 150000,
    votesFor: 45000,
    votesAgainst: 95000,
    votesAbstain: 10000,
    totalVotes: 150000,
  },
  {
    ...createBaseEntity('prop-6'),
    title: 'SNX-001: Staking Rewards Adjustment',
    description:
      'Adjust Synthetix staking rewards to improve protocol sustainability and user incentives.',
    status: 'executed',
    daoId: 'dao-synthetix',
    governancePlatformId: 'platform-snapshot',
    proposalId: '0xabcdef123456fedc',
    startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: 100000,
    votesFor: 87000,
    votesAgainst: 8000,
    votesAbstain: 5000,
    totalVotes: 100000,
    executionDate: new Date(
      Date.now() - 17 * 24 * 60 * 60 * 1000
    ).toISOString(),
    executedBy: '0xabcdef1234567890abcdef1234567890abcdef12',
  },
  {
    ...createBaseEntity('prop-7'),
    title: 'UIP-002: Governance Token Distribution',
    description:
      'Proposal for additional UNI token distribution to active governance participants.',
    status: 'active',
    daoId: 'dao-uniswap',
    governancePlatformId: 'platform-snapshot',
    proposalId: '0x1234567890abcdef1234',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: 800000,
    votesFor: 520000,
    votesAgainst: 180000,
    votesAbstain: 40000,
    totalVotes: 740000,
  },
  {
    ...createBaseEntity('prop-8'),
    title: 'AAVE-002: Risk Parameter Updates',
    description:
      'Update risk parameters for various assets to maintain protocol safety and efficiency.',
    status: 'canceled',
    daoId: 'dao-aave',
    governancePlatformId: 'platform-tally',
    proposalId: '0x9876543210abcdef1234',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: 250000,
  },
  {
    ...createBaseEntity('prop-9'),
    title: 'M-25: DAI Stability Fee Adjustment',
    description:
      'Adjust DAI stability fee to maintain peg stability and optimize protocol revenue.',
    status: 'expired',
    daoId: 'dao-makerdao',
    governancePlatformId: 'platform-snapshot',
    proposalId: '0xabcdef1234567890abcd',
    startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: 400000,
    votesFor: 280000,
    votesAgainst: 80000,
    votesAbstain: 20000,
    totalVotes: 380000,
  },
  {
    ...createBaseEntity('prop-10'),
    title: 'ENS-002: Subdomain Management',
    description:
      'Implement new subdomain management features to improve user experience and governance.',
    status: 'active',
    daoId: 'dao-ens',
    governancePlatformId: 'platform-tally',
    proposalId: '0x1234567890abcdefabcd',
    startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: 120000,
    votesFor: 65000,
    votesAgainst: 25000,
    votesAbstain: 8000,
    totalVotes: 98000,
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
    platformId: 'Uniswap',
    daoId: 'dao-uniswap',
    status: 'success',
    proposalsScraped: 15,
    errors: [],
    duration: 2500,
    metadata: { totalProposals: 15, newProposals: 3 },
  },
  {
    ...createBaseEntity('scrape-2'),
    platformId: 'Aave',
    daoId: 'dao-aave',
    status: 'success',
    proposalsScraped: 12,
    errors: [],
    duration: 3000,
    metadata: { totalProposals: 12, newProposals: 2 },
  },
  {
    ...createBaseEntity('scrape-3'),
    platformId: 'MakerDAO',
    daoId: 'dao-makerdao',
    status: 'success',
    proposalsScraped: 8,
    errors: [],
    duration: 2000,
    metadata: { totalProposals: 8, newProposals: 1 },
  },
  {
    ...createBaseEntity('scrape-4'),
    platformId: 'Compound',
    daoId: 'dao-compound',
    status: 'failed',
    proposalsScraped: 0,
    errors: ['Rate limit exceeded', 'Connection timeout'],
    duration: 5000,
    metadata: { totalProposals: 0, newProposals: 0 },
  },
  {
    ...createBaseEntity('scrape-5'),
    platformId: 'ENS',
    daoId: 'dao-ens',
    status: 'success',
    proposalsScraped: 6,
    errors: [],
    duration: 1800,
    metadata: { totalProposals: 6, newProposals: 1 },
  },
  {
    ...createBaseEntity('scrape-6'),
    platformId: 'Synthetix',
    daoId: 'dao-synthetix',
    status: 'partial',
    proposalsScraped: 4,
    errors: ['Partial data retrieval'],
    duration: 4000,
    metadata: { totalProposals: 8, newProposals: 1 },
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
