import { aoSend, aoSendAdmin } from '@/lib/aoClient';
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
  async add(subscriber: {
    name: string;
    type: 'discord' | 'telegram';
    endpoint: string;
    active: boolean;
  }): Promise<{ ok: boolean }> {
    try {
      // Format the data according to the expected structure
      const subscriberData = {
        name: subscriber.name,
        type: subscriber.type,
        endpoint: subscriber.endpoint,
        active: subscriber.active,
      };

      await aoSend<any>('AddSubscriber', subscriberData);
      return { ok: true };
    } catch (error) {
      return { ok: false };
    }
  },

  /**
   * Broadcast a notification about a proposal (admin only)
   */
  async broadcast(
    proposal: Pick<Proposal, 'id' | 'title' | 'url'>,
    summary?: string
  ): Promise<{ ok: boolean }> {
    try {
      await aoSendAdmin<any>('BroadcastNotification', {
        proposal: {
          id: proposal.id,
          title: proposal.title,
          url: proposal.url,
        },
        summary: summary || `New proposal: ${proposal.title}`,
        timestamp: Date.now(),
      });
      return { ok: true };
    } catch (error) {
      return { ok: false };
    }
  },

  /**
   * Test broadcast to specific subscribers
   */
  async testBroadcast(
    proposal: Pick<Proposal, 'id' | 'title' | 'url'>,
    subscriberIds: string[]
  ): Promise<{ ok: boolean; results?: any }> {
    try {
      const result = await aoSendAdmin<any>('TestBroadcast', {
        proposal: {
          id: proposal.id,
          title: proposal.title,
          url: proposal.url,
        },
        subscriberIds,
        summary: `Test broadcast: ${proposal.title}`,
        timestamp: Date.now(),
      });
      return { ok: true, results: result };
    } catch (error) {
      return { ok: false };
    }
  },
};
