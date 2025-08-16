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
    name: 'Genie Alerts',
    type: 'discord',
    endpoint:
      'https://discord.com/api/webhooks/1234567890/acdefghijklmnopqrstuvwxyz',
    isActive: true,
    lastActiveAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(), // 13 Aug, 20:06 WAT
  },
  {
    ...createBaseEntity('sub-2'),
    name: 'DAO News Channel',
    type: 'telegram',
    endpoint: '-1001234567890',
    isActive: true,
    lastActiveAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 13 Aug, 19:45 WAT
  },
  {
    ...createBaseEntity('sub-3'),
    name: 'Governance Updates',
    type: 'discord',
    endpoint:
      'https://discord.com/api/webhooks/9876543210/zxwvutsrqponmlkjihgfedcba',
    isActive: false,
    lastActiveAt: new Date(
      Date.now() - 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000
    ).toISOString(), // 12 Aug, 14:22 WAT
  },
  {
    ...createBaseEntity('sub-4'),
    name: 'Uniswap Alerts',
    type: 'telegram',
    endpoint: '-1009876543210',
    isActive: true,
    lastActiveAt: new Date(
      Date.now() - 10 * 60 * 60 * 1000 - 15 * 60 * 1000
    ).toISOString(), // 13 Aug, 10:15 WAT
  },
  {
    ...createBaseEntity('sub-5'),
    name: 'Aave Governance',
    type: 'discord',
    endpoint:
      'https://discord.com/api/webhooks/5678901234/hopqrstuvwxyzabcdefghijkl',
    isActive: true,
    lastActiveAt: new Date(
      Date.now() - 1 * 60 * 60 * 1000 - 30 * 60 * 1000
    ).toISOString(), // 13 Aug, 18:30 WAT
  },
];

// Mock governance platforms (DAO platforms)
const mockGovernancePlatforms: GovernancePlatform[] = [
  {
    ...createBaseEntity('dao-uniswap'),
    name: 'Uniswap',
    category: 'DeFi - DEX',
    status: 'active',
    scrapeStatus: 'success',
    totalProposals: 86,
    activeProposals: 3,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    type: 'defi',
  },
  {
    ...createBaseEntity('dao-aave'),
    name: 'Aave',
    category: 'DeFi - Lending',
    status: 'active',
    scrapeStatus: 'success',
    totalProposals: 124,
    activeProposals: 2,
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
    type: 'defi',
  },
  {
    ...createBaseEntity('dao-makerdao'),
    name: 'MakerDAO',
    category: 'DeFi - Stablecoin',
    status: 'active',
    scrapeStatus: 'success',
    totalProposals: 198,
    activeProposals: 5,
    lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5h ago
    type: 'defi',
  },
  {
    ...createBaseEntity('dao-compound'),
    name: 'Compound',
    category: 'DeFi - Lending',
    status: 'error',
    scrapeStatus: 'failed',
    totalProposals: 72,
    activeProposals: 1,
    lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
    type: 'defi',
  },
  {
    ...createBaseEntity('dao-ens'),
    name: 'ENS',
    category: 'Infrastructure - Naming',
    status: 'active',
    scrapeStatus: 'success',
    totalProposals: 54,
    activeProposals: 0,
    lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
    type: 'infrastructure',
  },
  {
    ...createBaseEntity('dao-synthetix'),
    name: 'Synthetix',
    category: 'DeFi - Derivatives',
    status: 'paused',
    scrapeStatus: 'paused',
    totalProposals: 103,
    activeProposals: 2,
    lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d ago
    type: 'defi',
  },
  {
    ...createBaseEntity('dao-optimism'),
    name: 'Optimism',
    category: 'Infrastructure - L2',
    status: 'active',
    scrapeStatus: 'success',
    totalProposals: 38,
    activeProposals: 4,
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
    type: 'infrastructure',
  },
  {
    ...createBaseEntity('dao-arbitrum'),
    name: 'Arbitrum',
    category: 'Infrastructure - L2',
    status: 'active',
    scrapeStatus: 'success',
    totalProposals: 26,
    activeProposals: 1,
    lastUpdated: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7h ago
    type: 'infrastructure',
  },
  {
    ...createBaseEntity('dao-curve'),
    name: 'Curve Finance',
    category: 'DeFi - DEX',
    status: 'active',
    scrapeStatus: 'success',
    totalProposals: 91,
    activeProposals: 3,
    lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8h ago
    type: 'defi',
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
    platformId: 'tally.xyz/aave',
    status: 'success',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // 18 minutes ago
    duration: 107000, // 1m 47s
    newProposals: 68,
    unchangedProposals: 342,
  },
  {
    ...createBaseEntity('scrape-2'),
    platformId: 'tally.xyz/uniswap',
    status: 'failed',
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(), // 50 minutes ago
    duration: 28000, // 28s
    errorMessage: 'Rate limit exceeded, Retry in 15m',
  },
  {
    ...createBaseEntity('scrape-3'),
    platformId: 'tally.xyz/makerdao',
    status: 'success',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
    duration: 132000, // 2m 12s
    newProposals: 14,
    unchangedProposals: 189,
  },
  {
    ...createBaseEntity('scrape-4'),
    platformId: 'tally.xyz/compound',
    status: 'partial',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2 hours ago
    duration: 118000, // 1m 58s
    newProposals: 5,
    errorCount: 2,
  },
  {
    ...createBaseEntity('scrape-5'),
    platformId: 'tally.xyz/ens',
    status: 'success',
    timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(), // 2.5 hours ago
    duration: 45000, // 45s
    newProposals: 0,
    unchangedProposals: 87,
  },
  // Add more historical data to match the "128 scrape operations" mentioned in the image
  ...Array.from({ length: 123 }, (_, i) => ({
    ...createBaseEntity(`scrape-${i + 6}`),
    platformId: [
      'tally.xyz/aave',
      'tally.xyz/uniswap',
      'tally.xyz/makerdao',
      'tally.xyz/compound',
      'tally.xyz/ens',
    ][i % 5],
    status: ['success', 'failed', 'partial'][i % 3] as
      | 'success'
      | 'failed'
      | 'partial',
    timestamp: new Date(Date.now() - (i + 6) * 30 * 60 * 1000).toISOString(), // Every 30 minutes
    duration: Math.floor(Math.random() * 180000) + 30000, // 30s to 3m
    newProposals: Math.floor(Math.random() * 100),
    unchangedProposals: Math.floor(Math.random() * 500),
    errorMessage: i % 3 === 1 ? 'Rate limit exceeded' : undefined,
    errorCount: i % 3 === 2 ? Math.floor(Math.random() * 5) + 1 : undefined,
  })),
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
