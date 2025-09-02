import { useState } from 'react';
import { useSystemInfo } from '@/lib/aoClient';
import { RuntimeKpis } from '@/components/runtime/RuntimeKpis';
import { CallsChart } from '@/components/runtime/CallsChart';
import { HistoryTable } from '@/components/runtime/HistoryTable';
import { Controls } from '@/components/runtime/Controls';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { Input } from '@/components/ui/input';
import { Bell, Moon, Search } from 'lucide-react';

export default function RuntimePage() {
  const {
    data: scrapeHistory,
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useSystemInfo();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for KPI cards
  const kpiData = {
    lastScrape: {
      time: '32m ago',
      status: 'success' as const,
      nextScheduled: '~28m',
      newProposals: 68,
    },
    apiCalls: {
      count: 4382,
      status: 'warning' as const,
      percentage: 78,
      avgPerHour: 182.6,
      rateLimitWarning: 'Rate limit at 86% for Tally',
    },
    cacheSize: {
      size: '246 MB',
      status: 'success' as const,
      items: 12568,
      lastPurge: '3d ago',
    },
    errors: {
      count: 8,
      status: 'error' as const,
      change: '+3 from yesterday',
      errorRate: 0.18,
      breakdown: '6 rate limit, 2 timeout errors',
    },
  };

  // Mock data for rate limits
  const rateLimits = [
    {
      platform: 'Tally.xyz',
      percentage: 86,
      status: 'warning' as const,
      current: 4300,
      limit: 5000,
      period: 'per day',
    },
    {
      platform: 'Snapshot',
      percentage: 42,
      status: 'success' as const,
      current: 840,
      limit: 2000,
      period: 'per hour',
    },
    {
      platform: 'Discord API',
      percentage: 15,
      status: 'success' as const,
      current: 75,
      limit: 500,
      period: 'per minute',
    },
  ];

  // Mock data for cache information
  const cacheInfo = {
    totalSize: '246 MB',
    itemsCount: '12,568',
    lastPurge: '3d ago',
    hitRate: '78.3%',
    missRate: '21.7%',
    avgTTL: '6h',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Scraping & Runtime Status
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor system performance and manage scraping operations
            </p>
          </div>

          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Bell className="h-5 w-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Moon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <RuntimeKpis data={kpiData} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* Left Column - Chart and History */}
          <div className="lg:col-span-3 space-y-8">
            {/* API Calls vs Errors Chart */}
            <CallsChart />

            {/* Scraping History Table */}
            {historyLoading ? (
              <LoadingState message="Loading scraping history..." />
            ) : historyError ? (
              <ErrorState
                title="Failed to Load Scraping History"
                message={historyError.message}
                onRetry={refetchHistory}
              />
            ) : (
              <HistoryTable
                data={scrapeHistory || []}
                isLoading={historyLoading}
                searchQuery={searchQuery}
              />
            )}
          </div>

          {/* Right Column - Controls and Side Panel */}
          <div className="space-y-6">
            {/* System Controls */}
            <Controls />

            {/* API Rate Limits */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                API Rate Limits
              </h3>
              {/* The original code had apiLoading and apiError, but useSystemInfo doesn't return these.
                  Assuming these were intended to be removed or replaced with new hooks if needed.
                  For now, removing them as they are not present in the new useSystemInfo hook. */}
              {/* {apiLoading ? (
                <LoadingState
                  message="Loading rate limits..."
                  showSpinner={false}
                />
              ) : apiError ? (
                <ErrorState
                  title="Failed to Load Rate Limits"
                  message={apiError.message}
                  onRetry={refetchApi}
                />
              ) : ( */}
              <div className="space-y-4">
                {rateLimits.map((limit, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        {limit.platform}
                      </span>
                      <span
                        className={`
                          font-medium
                          ${
                            limit.status === 'warning'
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : limit.status === 'error'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-green-600 dark:text-green-400'
                          }
                        `}
                      >
                        {limit.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          limit.status === 'warning'
                            ? 'bg-yellow-500'
                            : limit.status === 'error'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                        }`}
                        style={{ width: `${limit.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {limit.current.toLocaleString()} /{' '}
                      {limit.limit.toLocaleString()} {limit.period}
                    </div>
                  </div>
                ))}
              </div>
              {/* )} */}
            </div>

            {/* Cache Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cache Information
              </h3>
              <div className="space-y-3">
                {Object.entries(cacheInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
