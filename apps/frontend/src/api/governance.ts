import { aoSend } from '@/lib/aoClient';
import { adminScrapeGovernance } from '@/lib/adminClient';
import type { GovernancePlatform } from '@/types';

export const governanceApi = {
  /**
   * Get all governance platforms
   */
  async platforms(): Promise<GovernancePlatform[]> {
    return aoSend<GovernancePlatform[]>('GetGovernancePlatforms');
  },

  /**
   * Scrape governance data for a specific platform (admin only)
   */
  async scrape(
    governanceId: string,
    name?: string,
    url?: string
  ): Promise<{ count: number; refreshedAt: number }> {
    const result = await adminScrapeGovernance(governanceId);

    return {
      count: result.proposalsScraped || 0,
      refreshedAt: Date.now(),
    };
  },

  /**
   * Get governance scraping status
   */
  async status(): Promise<{ ok: boolean; lastRun?: number }> {
    try {
      const history = await aoSend<any[]>('GetScrapingHistory');
      const lastRun =
        history.length > 0
          ? new Date(history[0].createdAt).getTime()
          : undefined;

      return {
        ok: true,
        lastRun,
      };
    } catch (error) {
      return {
        ok: false,
      };
    }
  },
};
