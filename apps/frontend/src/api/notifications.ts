import { aoSend } from '@/lib/aoClient';
import type { Subscriber, Proposal } from '@/types';

export const notificationsApi = {
  /**
   * Get all subscribers
   */
  async list(): Promise<Subscriber[]> {
    return aoSend<Subscriber[]>('GetSubscribers');
  },

  /**
   * Add a new subscriber
   */
  async add(subscriber: Subscriber): Promise<{ ok: boolean }> {
    try {
      await aoSend<any>('AddSubscriber', subscriber);
      return { ok: true };
    } catch (error) {
      return { ok: false };
    }
  },

  /**
   * Broadcast a notification about a proposal
   */
  async broadcast(
    summary: string,
    proposal: Pick<Proposal, 'id' | 'title' | 'url'>
  ): Promise<{ ok: boolean }> {
    try {
      await aoSend<any>('BroadcastNotification', {
        summary,
        proposal,
        timestamp: Date.now(),
      });
      return { ok: true };
    } catch (error) {
      return { ok: false };
    }
  },
};
