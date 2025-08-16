import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Filter,
  Download,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScrapeHistory } from '@/types';

interface HistoryTableProps {
  data: ScrapeHistory[];
  isLoading: boolean;
  searchQuery: string;
}

const STATUS_CONFIG = {
  success: {
    label: 'Success',
    color:
      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  },
  partial: {
    label: 'Partial',
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  },
};

export function HistoryTable({
  data,
  isLoading,
  searchQuery,
}: HistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter data based on search query
  const filteredData = data.filter(
    item =>
      item.platformId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' WAT'
    );
  };

  const formatDuration = (durationMs: number) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const handleViewDetails = (itemId: string) => {
    // TODO: Implement view details functionality
    console.log('View details for:', itemId);
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Scraping History
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Scraping History
          </CardTitle>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  Timestamp
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  Governance ID
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  Duration
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  Results
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map(item => {
                const statusConfig =
                  STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] ||
                  STATUS_CONFIG.success;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatTimestamp(item.timestamp)}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 dark:text-white font-mono">
                        {item.platformId}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          statusConfig.color
                        )}
                      >
                        {statusConfig.label}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDuration(item.duration)}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {item.status === 'success' && (
                          <span>
                            {item.newProposals || 0} new proposals,{' '}
                            {item.unchangedProposals || 0} unchanged
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <span className="text-red-600 dark:text-red-400">
                            {item.errorMessage ||
                              'Rate limit exceeded, Retry in 15m'}
                          </span>
                        )}
                        {item.status === 'partial' && (
                          <span className="text-yellow-600 dark:text-yellow-400">
                            {item.newProposals || 0} new proposals,{' '}
                            {item.errorCount || 0} timeouts
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(item.id)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)}{' '}
              of {filteredData.length} scrape operations
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    )}
                  >
                    {page}
                  </Button>
                );
              })}

              {totalPages > 3 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ...
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(prev => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'No scrape operations match your search'
                : 'No scrape operations found'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
