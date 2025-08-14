import { aoSend } from '@/lib/aoClient';
import type { Proposal } from '@/types';

export const proposalsApi = {
  /**
   * Get all proposals
   */
  async list(): Promise<Proposal[]> {
    return aoSend<Proposal[]>('GetAllProposals');
  },

  /**
   * Get a specific proposal by ID
   */
  async get(id: string): Promise<Proposal> {
    return aoSend<Proposal>('GetProposal', { id });
  },

  /**
   * Search proposals with filters
   */
  async search(params: {
    q?: string;
    status?: string;
    dao?: string;
    from?: number;
    to?: number;
  }): Promise<Proposal[]> {
    const { q, ...filters } = params;
    
    if (q) {
      return aoSend<Proposal[]>('SearchProposals', { query: q });
    }
    
    // For other filters, we'll need to get all proposals and filter client-side
    // In a real implementation, these would be server-side filters
    const allProposals = await aoSend<Proposal[]>('GetAllProposals');
    
    return allProposals.filter(proposal => {
      if (filters.status && proposal.status !== filters.status) return false;
      if (filters.dao && proposal.daoId !== filters.dao) return false;
      if (filters.from && new Date(proposal.startDate).getTime() < filters.from) return false;
      if (filters.to && new Date(proposal.endDate).getTime() > filters.to) return false;
      return true;
    });
  },

  /**
   * Get proposals by platform
   */
  async byPlatform(platformId: string): Promise<Proposal[]> {
    return aoSend<Proposal[]>('GetProposalsByPlatform', { platformId });
  },
};
