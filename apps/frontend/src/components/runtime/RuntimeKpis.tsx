import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  Activity,
  Database,
  AlertTriangle,
  Clock,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiData {
  lastScrape: {
    time: string;
    status: 'success' | 'warning' | 'error';
    nextScheduled: string;
    newProposals: number;
  };
  apiCalls: {
    count: number;
    status: 'success' | 'warning' | 'error';
    percentage: number;
    avgPerHour: number;
    rateLimitWarning: string;
  };
  cacheSize: {
    size: string;
    status: 'success' | 'warning' | 'error';
    items: number;
    lastPurge: string;
  };
  errors: {
    count: number;
    status: 'success' | 'warning' | 'error';
    change: string;
    errorRate: number;
    breakdown: string;
  };
}

interface RuntimeKpisProps {
  data: KpiData;
}

const STATUS_CONFIG = {
  success: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  warning: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  error: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
  },
};

export function RuntimeKpis({ data }: RuntimeKpisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Last Scrape Card */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Last Scrape
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {data.lastScrape.time}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Next scheduled: {data.lastScrape.nextScheduled}
                </span>
              </div>
              <div className="flex items-center mt-1 space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {data.lastScrape.newProposals} new proposals found
                </span>
              </div>
            </div>
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                STATUS_CONFIG[data.lastScrape.status].bgColor,
                STATUS_CONFIG[data.lastScrape.status].color
              )}
            >
              Success
            </span>
          </div>
        </CardContent>
      </Card>

      {/* API Calls Card */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                API Calls (24h)
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {data.apiCalls.count.toLocaleString()}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <BarChart3 className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Avg: {data.apiCalls.avgPerHour}/hour
                </span>
              </div>
              <div className="flex items-center mt-1 space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {data.apiCalls.rateLimitWarning}
                </span>
              </div>
            </div>
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                STATUS_CONFIG[data.apiCalls.status].bgColor,
                STATUS_CONFIG[data.apiCalls.status].color
              )}
            >
              {data.apiCalls.percentage}% of limit
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Cache Size Card */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Cache Size
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {data.cacheSize.size}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <Database className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Items: {data.cacheSize.items.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center mt-1 space-x-2">
                <RefreshCw className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Last purge: {data.cacheSize.lastPurge}
                </span>
              </div>
            </div>
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                STATUS_CONFIG[data.cacheSize.status].bgColor,
                STATUS_CONFIG[data.cacheSize.status].color
              )}
            >
              Normal
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Errors Card */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Errors (24h)
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {data.errors.count}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {data.errors.change}
                </span>
              </div>
              <div className="flex items-center mt-1 space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {data.errors.breakdown}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Error rate: {data.errors.errorRate}%
                </span>
              </div>
            </div>
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                STATUS_CONFIG[data.errors.status].bgColor,
                STATUS_CONFIG[data.errors.status].color
              )}
            >
              {data.errors.count} issues
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
