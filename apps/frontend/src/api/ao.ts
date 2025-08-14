/**
 * AO Proxy API endpoint
 * This is a placeholder that will be implemented as a proper API route
 * For now, it simulates AO transport responses
 */

import type { AOMessage, ApiResponse } from '@/types';

// Simulated AO process responses
const mockResponses: Record<string, any> = {
  GetProposals: [
    {
      id: '1',
      title: 'Proposal #123: Update Treasury Management',
      status: 'active',
      daoId: 'arweave-dao',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Proposal #122: Community Grant Program',
      status: 'passed',
      daoId: 'ao-foundation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  GetRuntimeStats: {
    uptime: 86400,
    memoryUsage: 512,
    cpuUsage: 25,
    activeConnections: 5,
    requestsPerMinute: 10,
    errorRate: 0.01,
    lastHealthCheck: new Date().toISOString(),
    status: 'healthy',
  },
  HealthCheck: {
    status: 'healthy',
  },
};

export async function handleAORequest(
  message: AOMessage
): Promise<ApiResponse<any>> {
  const requestId = message.Tags?.['Request-Id'] || 'unknown';

  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const response = mockResponses[message.Action];

    if (response === undefined) {
      return {
        success: false,
        error: `Unknown action: ${message.Action}`,
        requestId,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: response,
      requestId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export for potential use in actual API implementation
export { mockResponses };
