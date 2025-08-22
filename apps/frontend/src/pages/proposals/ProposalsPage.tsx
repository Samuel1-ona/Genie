import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useProposals } from '@/hooks/useAOClient';
import { Filters } from '@/components/proposals/Filters';
import { ProposalsTable } from '@/components/proposals/ProposalsTable';
import { ProposalsTableSkeleton } from '@/components/skeleton/TableSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';

import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import type { Proposal } from '@/types';

export default function ProposalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get filter values from URL
  const dao = searchParams.get('dao') || 'all';
  const status = searchParams.get('status') || 'all';
  const dateRange = searchParams.get('dateRange') || 'all';
  const searchQuery = searchParams.get('search') || '';

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch proposals with filters
  const { data: proposals, isLoading, error, refetch } = useProposals();

  // Filter proposals based on search params
  const filteredProposals = useMemo(() => {
    if (!proposals) return [];

    return proposals.filter(proposal => {
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
  }, [proposals, dao, status, dateRange, debouncedSearch]);

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
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="bg-gray-800 dark:bg-gray-700 text-white border-gray-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
    </div>
  );
}
