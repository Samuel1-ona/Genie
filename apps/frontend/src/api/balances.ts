import { aoSend, aoSendAdmin } from '@/lib/aoClient';
import type { Balance } from '@/types';

export const balancesApi = {
  /**
   * Get all balances
   */
  async all(): Promise<Balance[]> {
    return aoSend<Balance[]>('GetAllBalances');
  },

  /**
   * Get balance for a specific address
   */
  async get(address: string): Promise<Balance> {
    const balances = await aoSend<Balance[]>('GetBalance', {
      walletAddress: address,
    });

    // The mock returns an array, but we want a single balance
    // In a real implementation, this would return a single balance
    if (Array.isArray(balances) && balances.length > 0) {
      return balances[0];
    }

    throw new Error(`Balance not found for address: ${address}`);
  },

  /**
   * Add balance for an address (admin only)
   */
  async add(address: string, amount: number): Promise<{ ok: boolean }> {
    try {
      await aoSendAdmin<any>('AddBalance', {
        walletAddress: address,
        balance: amount.toString(),
        tokenAddress: '0x0000000000000000000000000000000000000000', // ETH
        tokenSymbol: 'ETH',
        tokenName: 'Ethereum',
        decimals: 18,
        network: 'ethereum',
      });
      return { ok: true };
    } catch (error) {
      return { ok: false };
    }
  },
};
