import { cn } from '@/lib/utils';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {showHeader && (
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Specialized table skeletons for different use cases
export function ProposalsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        <div className="flex space-x-2">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        </div>
      </div>

      {/* Table */}
      <TableSkeleton rows={8} columns={6} showHeader={true} />

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function OverviewTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
      </div>

      {/* Table */}
      <TableSkeleton rows={5} columns={5} showHeader={true} />
    </div>
  );
}

export function BalancesTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse" />
        <div className="flex space-x-2">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse" />
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
        </div>
      </div>

      {/* Table */}
      <TableSkeleton rows={6} columns={4} showHeader={true} />
    </div>
  );
}

export function ErrorsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse" />
        <div className="flex space-x-2">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse" />
        </div>
      </div>

      {/* Table */}
      <TableSkeleton rows={10} columns={4} showHeader={true} />
    </div>
  );
}
