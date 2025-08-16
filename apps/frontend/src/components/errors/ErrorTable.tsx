import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTableTime } from '@/lib/time';

interface Error {
  id: string;
  timestamp: string;
  governanceId: string;
  errorMessage: string;
  errorType: 'rate_limit' | 'parse' | 'network';
  count: number;
}

interface ErrorTableProps {
  errors: Error[];
  dateRange: { start: string; end: string };
  governanceId: string;
  errorType: string;
}

const ERROR_TYPE_CONFIG = {
  rate_limit: {
    label: 'Rate Limit',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  },
  parse: {
    label: 'Parse',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  },
  network: {
    label: 'Network',
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  },
};

export function ErrorTable({
  errors,
  dateRange,
  governanceId,
  errorType,
}: ErrorTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter errors based on props
  const filteredErrors = errors.filter(error => {
    // Filter by date range
    if (dateRange.start || dateRange.end) {
      const errorDate = new Date(error.timestamp);
      if (dateRange.start && errorDate < new Date(dateRange.start))
        return false;
      if (dateRange.end && errorDate > new Date(dateRange.end)) return false;
    }

    // Filter by governance ID
    if (governanceId && error.governanceId !== governanceId) return false;

    // Filter by error type
    if (errorType !== 'all' && error.errorType !== errorType) return false;

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredErrors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentErrors = filteredErrors.slice(startIndex, endIndex);

  const formatTimestamp = (timestamp: string) => {
    return formatTableTime(timestamp);
  };

  const handleViewDetails = (error: Error) => {
    // TODO: Implement view details functionality
    console.log('Viewing details for error:', error.id);
  };

  const handleDownloadLog = (error: Error) => {
    // TODO: Implement download log functionality
    console.log('Downloading log for error:', error.id);
  };

  const handleRefresh = () => {
    // TODO: Implement refresh functionality
    console.log('Refreshing error logs...');
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Opening filter dialog...');
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Error Logs
          </CardTitle>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFilter}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
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
                  Error Message
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentErrors.map(error => {
                const errorTypeConfig = ERROR_TYPE_CONFIG[error.errorType];

                return (
                  <tr
                    key={error.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatTimestamp(error.timestamp)}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {error.governanceId}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            errorTypeConfig.color
                          )}
                        >
                          {errorTypeConfig.label}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="max-w-md">
                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                          {error.errorMessage}
                        </div>
                        {error.count > 1 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            +{error.count - 1} more similar errors
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(error)}
                          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadLog(error)}
                          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredErrors.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredErrors.length)} of{' '}
              {filteredErrors.length} errors
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
        {filteredErrors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No errors found matching your filters
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
