import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Pause,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GovernancePlatform } from '@/types';

interface DaoCardProps {
  platform: GovernancePlatform;
  viewMode: 'grid' | 'list';
  onClick: () => void;
  onRunScrape: () => void;
}

const PLATFORM_COLORS = {
  'dao-uniswap': 'bg-blue-500',
  'dao-aave': 'bg-purple-500',
  'dao-makerdao': 'bg-green-500',
  'dao-compound': 'bg-yellow-500',
  'dao-ens': 'bg-blue-600',
  'dao-synthetix': 'bg-purple-600',
  'dao-optimism': 'bg-pink-500',
  'dao-arbitrum': 'bg-orange-500',
  'dao-curve': 'bg-green-600',
};

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'bg-blue-500 text-white',
    icon: CheckCircle,
  },
  error: {
    label: 'Error',
    color: 'bg-red-500 text-white',
    icon: AlertTriangle,
  },
  paused: {
    label: 'Paused',
    color: 'bg-gray-500 text-white',
    icon: Pause,
  },
};

const SCRAPE_STATUS_CONFIG = {
  success: {
    label: 'Last scrape successful',
    color: 'text-green-600 dark:text-green-400',
    icon: CheckCircle,
  },
  failed: {
    label: 'API connection failed',
    color: 'text-red-600 dark:text-red-400',
    icon: AlertTriangle,
  },
  paused: {
    label: 'Scraping paused',
    color: 'text-yellow-600 dark:text-yellow-400',
    icon: Pause,
  },
};

export function DaoCard({
  platform,
  viewMode,
  onClick,
  onRunScrape,
}: DaoCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  const platformColor =
    PLATFORM_COLORS[platform.id as keyof typeof PLATFORM_COLORS] ||
    'bg-gray-500';
  const statusConfig =
    STATUS_CONFIG[platform.status as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.active;
  const scrapeStatusConfig =
    SCRAPE_STATUS_CONFIG[
      platform.scrapeStatus as keyof typeof SCRAPE_STATUS_CONFIG
    ] || SCRAPE_STATUS_CONFIG.success;

  const StatusIcon = statusConfig.icon;
  const ScrapeIcon = scrapeStatusConfig.icon;

  const handleRunScrape = async () => {
    setIsScraping(true);
    setShowMenu(false);

    try {
      await onRunScrape();
      // TODO: Show success toast
    } catch (error) {
      // TODO: Show error toast
      console.error('Scrape failed:', error);
    } finally {
      setIsScraping(false);
    }
  };

  const formatLastUpdated = (lastUpdated: string) => {
    const now = new Date();
    const updated = new Date(lastUpdated);
    const diffInHours = Math.floor(
      (now.getTime() - updated.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (viewMode === 'list') {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-lg ${platformColor} flex items-center justify-center`}
              >
                <Building2 className="h-6 w-6 text-white" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {platform.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {platform.category}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Proposals
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {platform.totalProposals}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Active Proposals
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {platform.activeProposals}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Last Updated
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {formatLastUpdated(platform.lastUpdated)}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </span>

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {showMenu && (
                    <div className="absolute right-0 top-8 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleRunScrape();
                        }}
                        disabled={isScraping}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        {isScraping ? 'Running...' : 'Run Scrape'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ScrapeIcon className={cn('h-4 w-4', scrapeStatusConfig.color)} />
              <span className={cn('text-sm', scrapeStatusConfig.color)}>
                {scrapeStatusConfig.label}
              </span>
            </div>

            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card
      className="bg-white dark:bg-gray-800 shadow-sm border-0 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-10 h-10 rounded-lg ${platformColor} flex items-center justify-center`}
          >
            <Building2 className="h-5 w-5 text-white" />
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="h-6 w-6 p-0"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>

              {showMenu && (
                <div className="absolute right-0 top-6 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleRunScrape();
                    }}
                    disabled={isScraping}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    {isScraping ? 'Running...' : 'Run Scrape'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {platform.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {platform.category}
          </p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Proposals
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {platform.totalProposals}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Active Proposals
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {platform.activeProposals}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Last Updated
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {formatLastUpdated(platform.lastUpdated)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ScrapeIcon className={cn('h-4 w-4', scrapeStatusConfig.color)} />
            <span className={cn('text-sm', scrapeStatusConfig.color)}>
              {scrapeStatusConfig.label}
            </span>
          </div>

          <ArrowRight className="h-4 w-4 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
}
