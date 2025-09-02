import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useProposals, useAddProposal } from '@/lib/aoClient';
import {
  useExistingProposals,
  useRefreshProposals,
  useGovernancePlatformsWithTally,
} from '@/hooks/useProposalsWithTally';
import { Filters } from '@/components/proposals/Filters';
import { ProposalsTable } from '@/components/proposals/ProposalsTable';
import { ProposalsTableSkeleton } from '@/components/skeleton/TableSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { Badge } from '@/components/ui/badge';
import { CreateProposalDialog } from '@/components/proposals/CreateProposalDialog';

import { Button } from '@/components/ui/button';
import { Plus, Filter, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import type { Proposal } from '@/types';

export default function ProposalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Get filter values from URL
  const dao = searchParams.get('dao') || 'all';
  const status = searchParams.get('status') || 'all';
  const dateRange = searchParams.get('dateRange') || 'all';
  const searchQuery = searchParams.get('search') || '';

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch proposals from both AO process and Tally API
  const {
    data: aoProposals,
    isLoading: aoLoading,
    error: aoError,
    refetch: aoRefetch,
  } = useProposals();
  const {
    data: tallyProposals,
    isLoading: tallyLoading,
    error: tallyError,
  } = useExistingProposals();
  const { data: platforms } = useGovernancePlatformsWithTally();
  const refreshProposals = useRefreshProposals();

  // Add proposal mutation
  const addProposal = useAddProposal();

  // Combine proposals from both sources, prioritizing AO data for duplicates
  const allProposals = useMemo(() => {
    const aoProposalIds = new Set((aoProposals || []).map(p => p.id));
    const tallyProposalsFiltered = (tallyProposals || []).filter(
      p => !aoProposalIds.has(p.id)
    );

    return [...(aoProposals || []), ...tallyProposalsFiltered];
  }, [aoProposals, tallyProposals]);

  // Determine loading and error states
  const isLoading = aoLoading || tallyLoading;
  const error = aoError || tallyError;
  const refetch = () => {
    aoRefetch();
    refreshProposals.mutate();
  };

  // Filter proposals based on search params
  const filteredProposals = useMemo(() => {
    if (!allProposals) return [];

    return allProposals.filter(proposal => {
      // DAO filter
      if (dao !== 'all' && proposal.daoId !== dao) {
        return false;
      }

      // Status filter
      if (status !== 'all' && proposal.status !== status) {
        return false;
      }

      // Date range filter
      if (dateRange !== 'all') {
        const proposalDate = new Date(proposal.createdAt);
        const now = new Date();

        switch (dateRange) {
          case 'today':
            const today = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );
            if (proposalDate < today) return false;
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (proposalDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (proposalDate < monthAgo) return false;
            break;
        }
      }

      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesTitle = proposal.title.toLowerCase().includes(searchLower);
        const matchesDescription = proposal.description
          .toLowerCase()
          .includes(searchLower);
        const matchesDao = proposal.daoId.toLowerCase().includes(searchLower);

        if (!matchesTitle && !matchesDescription && !matchesDao) {
          return false;
        }
      }

      return true;
    });
  }, [allProposals, dao, status, dateRange, debouncedSearch]);

  // Update URL when filters change
  const updateFilters = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === 'all' || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    setSearchParams(newParams);
  };

  // Handle proposal selection
  const handleProposalSelect = (proposal: Proposal) => {
    navigate(`/proposals/${proposal.id}`);
  };

  // Handle proposal creation
  const handleCreateProposal = async (proposalData: Partial<Proposal>) => {
    try {
      await addProposal.mutateAsync(proposalData);
      // The mutation will automatically invalidate queries and show success toast
    } catch (error) {
      console.error('Failed to create proposal:', error);
      // Error toast is handled by the mutation hook
    }
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Proposals List
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Browse and monitor governance proposals across all DAOs
              </p>
              {/* Data Source Indicators */}
              <div className="mt-3 flex items-center space-x-3">
                {aoProposals && aoProposals.length > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {aoProposals.length} from AO Process
                  </Badge>
                )}
                {tallyProposals && tallyProposals.length > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {tallyProposals.length} from Tally API
                  </Badge>
                )}
                {platforms && platforms.length > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200"
                  >
                    {platforms[0]?.name || 'Tally.xyz'} Platform
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
                className="bg-gray-800 dark:bg-gray-700 text-white border-gray-600 hover:bg-gray-700"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh All
              </Button>
              <Button
                variant="outline"
                className="bg-gray-800 dark:bg-gray-700 text-white border-gray-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
              <Button
                onClick={handleOpenCreateDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />+ Add Proposal
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Filters
            dao={dao}
            status={status}
            dateRange={dateRange}
            searchQuery={searchQuery}
            onFiltersChange={updateFilters}
          />
        </div>

        {/* Proposals Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="p-6">
              <ProposalsTableSkeleton />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorState
                title="Failed to Load Proposals"
                message={error.message}
                onRetry={refetch}
              />
            </div>
          ) : (
            <ProposalsTable
              proposals={filteredProposals}
              isLoading={isLoading}
              onProposalSelect={handleProposalSelect}
            />
          )}
        </div>
      </div>

      {/* Create Proposal Dialog */}
      <CreateProposalDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onSubmit={handleCreateProposal}
        platforms={platforms || []}
      />
    </div>
  );
}
