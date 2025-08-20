import { aoSend } from '@/lib/aoClient';
import { adminAddBalance } from '@/lib/adminClient';
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
      await adminAddBalance(address, amount, 'Admin balance adjustment');
      return { ok: true };
    } catch (error) {
      return { ok: false };
    }
  },
};
