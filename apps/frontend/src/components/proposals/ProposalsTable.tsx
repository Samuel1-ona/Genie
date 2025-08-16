import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { StatusChip } from '@/components/common/StatusChip';
import { TimeAgo } from '@/components/common/TimeAgo';
import { TableSkeleton } from '@/components/skeleton/TableSkeleton';
import { MoreHorizontal, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Proposal } from '@/types';

interface ProposalsTableProps {
  proposals: Proposal[];
  isLoading: boolean;
  onProposalSelect: (proposal: Proposal) => void;
}

// DAO logo colors
const DAO_COLORS = {
  'dao-uniswap': 'bg-pink-500',
  'dao-aave': 'bg-purple-500',
  'dao-makerdao': 'bg-orange-500',
  'dao-compound': 'bg-green-500',
  'dao-ens': 'bg-blue-500',
  'dao-synthetix': 'bg-blue-600',
};

// Get DAO display name
const getDaoDisplayName = (daoId: string): string => {
  const daoMap: Record<string, string> = {
    'dao-uniswap': 'Uniswap',
    'dao-aave': 'Aave',
    'dao-makerdao': 'MakerDAO',
    'dao-compound': 'Compound',
    'dao-ens': 'ENS',
    'dao-synthetix': 'Synthetix',
  };
  return daoMap[daoId] || daoId;
};

// Calculate participation percentage
const calculateParticipation = (proposal: Proposal): number => {
  if (!proposal.totalVotes || !proposal.quorum) return 0;
  return Math.min((proposal.totalVotes / proposal.quorum) * 100, 100);
};

// Get participation color
const getParticipationColor = (percentage: number, status: string): string => {
  if (status === 'failed') return 'bg-red-500';
  if (status === 'passed' || status === 'executed') return 'bg-green-500';
  if (percentage >= 70) return 'bg-green-500';
  if (percentage >= 40) return 'bg-yellow-500';
  return 'bg-gray-500';
};

const columnHelper = createColumnHelper<Proposal>();

export function ProposalsTable({
  proposals,
  isLoading,
  onProposalSelect,
}: ProposalsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: ({ getValue }) => (
          <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
            {getValue()}
          </div>
        ),
      }),

      columnHelper.accessor('daoId', {
        header: 'DAO',
        cell: ({ getValue }) => {
          const daoId = getValue();
          const daoName = getDaoDisplayName(daoId);
          const daoColor =
            DAO_COLORS[daoId as keyof typeof DAO_COLORS] || 'bg-gray-500';

          return (
            <div className="flex items-center space-x-2">
              <div
                className={`w-6 h-6 rounded-full ${daoColor} flex items-center justify-center text-white text-xs font-bold`}
              >
                {daoName.charAt(0)}
              </div>
              <span className="text-gray-900 dark:text-white">{daoName}</span>
            </div>
          );
        },
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ getValue }) => (
          <StatusChip variant={getValue()}>{getValue()}</StatusChip>
        ),
      }),

      columnHelper.accessor('endDate', {
        header: 'Deadline',
        cell: ({ getValue, row }) => {
          const endDate = new Date(getValue());
          const now = new Date();
          const isActive = row.original.status === 'active';
          const isEnded = endDate < now;

          return (
            <div className="flex items-center space-x-1 text-sm">
              {isActive ? (
                <Clock className="h-4 w-4 text-gray-500" />
              ) : (
                <Calendar className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-gray-900 dark:text-white">
                {isActive ? (
                  <TimeAgo date={endDate} />
                ) : isEnded ? (
                  'Ended'
                ) : (
                  'Pending'
                )}
              </span>
            </div>
          );
        },
      }),

      columnHelper.accessor('votesFor', {
        header: 'For',
        cell: ({ getValue, row }) => {
          const votesFor = getValue() || 0;
          const totalVotes = row.original.totalVotes || 0;
          const percentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;

          return (
            <span className="text-green-600 dark:text-green-400 font-medium">
              {percentage.toFixed(1)}%
            </span>
          );
        },
      }),

      columnHelper.accessor('votesAgainst', {
        header: 'Against',
        cell: ({ getValue, row }) => {
          const votesAgainst = getValue() || 0;
          const totalVotes = row.original.totalVotes || 0;
          const percentage =
            totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;

          return (
            <span className="text-red-600 dark:text-red-400 font-medium">
              {percentage.toFixed(1)}%
            </span>
          );
        },
      }),

      columnHelper.accessor('votesAbstain', {
        header: 'Abstain',
        cell: ({ getValue, row }) => {
          const votesAbstain = getValue() || 0;
          const totalVotes = row.original.totalVotes || 0;
          const percentage =
            totalVotes > 0 ? (votesAbstain / totalVotes) * 100 : 0;

          return (
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {percentage.toFixed(1)}%
            </span>
          );
        },
      }),

      columnHelper.accessor('totalVotes', {
        header: 'Participation %',
        cell: ({ row }) => {
          const participation = calculateParticipation(row.original);
          const participationColor = getParticipationColor(
            participation,
            row.original.status
          );

          return (
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${participationColor}`}
                  style={{ width: `${participation}%` }}
                />
              </div>
              <span className="text-sm text-gray-900 dark:text-white min-w-[2.5rem]">
                {participation.toFixed(0)}%
              </span>
            </div>
          );
        },
      }),

      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onProposalSelect(row.original)}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ),
      }),
    ],
    [onProposalSelect]
  );

  const table = useReactTable({
    data: proposals,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return <TableSkeleton rows={10} columns={8} />;
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => onProposalSelect(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {proposals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No proposals found</p>
        </div>
      )}

      {/* Pagination */}
      {proposals.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing{' '}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
            -
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              proposals.length
            )}{' '}
            of {proposals.length} proposals
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-gray-800 dark:bg-gray-700 text-white border-gray-600"
            >
              ←
            </Button>

            {Array.from(
              { length: Math.min(5, table.getPageCount()) },
              (_, i) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageCount = table.getPageCount();

                // Show first page, last page, current page, and pages around current
                if (
                  i === 0 ||
                  i === pageCount - 1 ||
                  (i >= pageIndex - 1 && i <= pageIndex + 1)
                ) {
                  return (
                    <Button
                      key={i}
                      variant={i === pageIndex ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => table.setPageIndex(i)}
                      className={
                        i === pageIndex
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 dark:bg-gray-700 text-white border-gray-600'
                      }
                    >
                      {i + 1}
                    </Button>
                  );
                } else if (i === pageIndex - 2 || i === pageIndex + 2) {
                  return (
                    <span key={i} className="text-gray-500">
                      ...
                    </span>
                  );
                }
                return null;
              }
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-gray-800 dark:bg-gray-700 text-white border-gray-600"
            >
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
