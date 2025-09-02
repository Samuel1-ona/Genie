/**
 * Tally API Hooks
 * React hooks for Tally API interactions following the provided pattern
 */

import { useState, useEffect } from 'react';
import {
  tallyApi,
  tallyRequestWithRetry,
  TallyApiError,
} from '@/lib/tallyClient';
import { toast } from '@/lib/toast';

/**
 * Hook for fetching organization users
 */
export const useOrganizationUsers = (organizationId: string | null) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TallyApiError | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await tallyRequestWithRetry(() =>
          tallyApi.getOrganizationUsers(organizationId)
        );
        setUsers(data);
      } catch (err) {
        const tallyError =
          err instanceof TallyApiError
            ? err
            : new TallyApiError('Failed to fetch users');
        setError(tallyError);
        toast.error('Failed to fetch users', tallyError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [organizationId]);

  return { users, loading, error };
};

/**
 * Hook for fetching organization details
 */
export const useOrganization = (organizationId: string | null) => {
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TallyApiError | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await tallyRequestWithRetry(() =>
          tallyApi.getOrganization(organizationId)
        );
        setOrganization(data);
      } catch (err) {
        const tallyError =
          err instanceof TallyApiError
            ? err
            : new TallyApiError('Failed to fetch organization');
        setError(tallyError);
        toast.error('Failed to fetch organization', tallyError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId]);

  return { organization, loading, error };
};

/**
 * Hook for fetching organization proposals
 */
export const useOrganizationProposals = (organizationId: string | null) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TallyApiError | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await tallyRequestWithRetry(() =>
          tallyApi.getOrganizationProposals(organizationId)
        );
        setProposals(data);
      } catch (err) {
        const tallyError =
          err instanceof TallyApiError
            ? err
            : new TallyApiError('Failed to fetch proposals');
        setError(tallyError);
        toast.error('Failed to fetch proposals', tallyError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [organizationId]);

  return { proposals, loading, error };
};

/**
 * Hook for fetching proposal details
 */
export const useProposal = (proposalId: string | null) => {
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TallyApiError | null>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!proposalId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await tallyRequestWithRetry(() =>
          tallyApi.getProposal(proposalId)
        );
        setProposal(data);
      } catch (err) {
        const tallyError =
          err instanceof TallyApiError
            ? err
            : new TallyApiError('Failed to fetch proposal');
        setError(tallyError);
        toast.error('Failed to fetch proposal', tallyError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [proposalId]);

  return { proposal, loading, error };
};

/**
 * Hook for fetching proposal votes
 */
export const useProposalVotes = (proposalId: string | null) => {
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TallyApiError | null>(null);

  useEffect(() => {
    const fetchVotes = async () => {
      if (!proposalId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await tallyRequestWithRetry(() =>
          tallyApi.getProposalVotes(proposalId)
        );
        setVotes(data);
      } catch (err) {
        const tallyError =
          err instanceof TallyApiError
            ? err
            : new TallyApiError('Failed to fetch votes');
        setError(tallyError);
        toast.error('Failed to fetch votes', tallyError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [proposalId]);

  return { votes, loading, error };
};

/**
 * Hook for fetching user details
 */
export const useUser = (userId: string | null) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TallyApiError | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await tallyRequestWithRetry(() =>
          tallyApi.getUser(userId)
        );
        setUser(data);
      } catch (err) {
        const tallyError =
          err instanceof TallyApiError
            ? err
            : new TallyApiError('Failed to fetch user');
        setError(tallyError);
        toast.error('Failed to fetch user', tallyError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};

/**
 * Hook for searching organizations
 */
export const useOrganizationSearch = (query: string | null) => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TallyApiError | null>(null);

  useEffect(() => {
    const searchOrganizations = async () => {
      if (!query || query.trim().length < 2) {
        setOrganizations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await tallyRequestWithRetry(() =>
          tallyApi.searchOrganizations(query)
        );
        setOrganizations(data);
      } catch (err) {
        const tallyError =
          err instanceof TallyApiError
            ? err
            : new TallyApiError('Failed to search organizations');
        setError(tallyError);
        toast.error('Failed to search organizations', tallyError.message);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchOrganizations, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { organizations, loading, error };
};

/**
 * Hook for fetching user's organizations
 */
export const useUserOrganizations = (userId: string | null) => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TallyApiError | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await tallyRequestWithRetry(() =>
          tallyApi.getUserOrganizations(userId)
        );
        setOrganizations(data);
      } catch (err) {
        const tallyError =
          err instanceof TallyApiError
            ? err
            : new TallyApiError('Failed to fetch user organizations');
        setError(tallyError);
        toast.error('Failed to fetch user organizations', tallyError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [userId]);

  return { organizations, loading, error };
};

/**
 * Hook for fetching governance tokens
 */
export const useGovernanceTokens = (organizationId: string | null) => {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TallyApiError | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await tallyRequestWithRetry(() =>
          tallyApi.getGovernanceTokens(organizationId)
        );
        setTokens(data);
      } catch (err) {
        const tallyError =
          err instanceof TallyApiError
            ? err
            : new TallyApiError('Failed to fetch governance tokens');
        setError(tallyError);
        toast.error('Failed to fetch governance tokens', tallyError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [organizationId]);

  return { tokens, loading, error };
};

/**
 * Hook for fetching delegates
 */
export const useDelegates = (organizationId: string | null) => {
  const [delegates, setDelegates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TallyApiError | null>(null);

  useEffect(() => {
    const fetchDelegates = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await tallyRequestWithRetry(() =>
          tallyApi.getDelegates(organizationId)
        );
        setDelegates(data);
      } catch (err) {
        const tallyError =
          err instanceof TallyApiError
            ? err
            : new TallyApiError('Failed to fetch delegates');
        setError(tallyError);
        toast.error('Failed to fetch delegates', tallyError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDelegates();
  }, [organizationId]);

  return { delegates, loading, error };
};
