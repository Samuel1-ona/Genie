import { aoSend, aoSendAdmin } from '@/lib/aoClient';
import type { ScrapeHistory, RateLimit } from '@/types';

export const runtimeApi = {
  /**
   * Get scraping history
   */
  async history(): Promise<ScrapeHistory[]> {
    return aoSend<ScrapeHistory[]>('GetScrapingHistory');
  },

  /**
   * Get rate limits for all platforms
   */
  async rateLimits(): Promise<RateLimit[]> {
    const limits = await aoSend<Record<string, RateLimit>>('GetApiRateLimits');
    return Object.entries(limits).map(([platformId, limit]) => ({
      ...limit,
      platformId,
    }));
  },

  /**
   * Get cache information
   */
  async cacheInfo(): Promise<{ size: number; keys: number }> {
    const cacheData = await aoSend<any>('GetCachedData');
    return {
      size: cacheData.cacheSize ? parseInt(cacheData.cacheSize) : 0,
      keys:
        cacheData.proposals +
        cacheData.platforms +
        cacheData.subscribers +
        cacheData.balances,
    };
  },

  /**
   * Get API call counts
   */
  async apiCounts(): Promise<{
    last24h: number;
    perPlatform: Record<string, number>;
  }> {
    const counts = await aoSend<any>('GetApiCallCounts');
    return {
      last24h: counts.today || 0,
      perPlatform: counts.byPlatform || {},
    };
  },

  /**
   * Get error logs
   */
  async errors(): Promise<
    { timestamp: number; governanceId: string; message: string }[]
  > {
    const errorLogs = await aoSend<any[]>('GetErrorLogs');
    return errorLogs.map(log => ({
      timestamp: new Date(log.timestamp).getTime(),
      governanceId: log.details?.platformId || 'unknown',
      message: log.message || log.level,
    }));
  },

  /**
   * Clear cache (admin only)
   */
  async clearCache(): Promise<{ ok: boolean }> {
    try {
      await aoSendAdmin<any>('ClearCache');
      return { ok: true };
    } catch (error) {
      return { ok: false };
    }
  },

  /**
   * Reset rate limits (admin only)
   */
  async resetLimits(): Promise<{ ok: boolean }> {
    try {
      await aoSendAdmin<any>('ResetRateLimits');
      return { ok: true };
    } catch (error) {
      return { ok: false };
    }
  },
};
