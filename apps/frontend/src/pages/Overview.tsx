import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/common/StatusChip';
import { TimeAgo } from '@/components/common/TimeAgo';
import { EmptyState } from '@/components/common/EmptyState';
import { OverviewTableSkeleton } from '@/components/skeleton/TableSkeleton';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Play,
  ExternalLink,
  Activity,
  BarChart3,
  Calendar,
  Target,
  Eye,
  Vote,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useProposals,
  useGovernancePlatforms,
  useScrapeHistory,
  useScrapeGovernance,
  useSubscribers,
} from '@/hooks/useAOClient';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useState } from 'react';

// Chart colors for different proposal statuses
const CHART_COLORS = {
  active: '#10b981', // green
  pending: '#f59e0b', // amber
  passed: '#3b82f6', // blue
  failed: '#ef4444', // red
  executed: '#8b5cf6', // purple
  canceled: '#6b7280', // gray
  expired: '#f97316', // orange
};

// Progress bar colors for different stages
const PROGRESS_COLORS = {
  active: {
    bg: '#dcfce7', // light green background
    fill: '#10b981', // green fill
  },
  pending: {
    bg: '#fef3c7', // light amber background
    fill: '#f59e0b', // amber fill
  },
  passed: {
    bg: '#dbeafe', // light blue background
    fill: '#3b82f6', // blue fill
  },
  failed: {
    bg: '#fee2e2', // light red background
    fill: '#ef4444', // red fill
  },
  executed: {
    bg: '#f3e8ff', // light purple background
    fill: '#8b5cf6', // purple fill
  },
  canceled: {
    bg: '#f3f4f6', // light gray background
    fill: '#6b7280', // gray fill
  },
  expired: {
    bg: '#fed7aa', // light orange background
    fill: '#f97316', // orange fill
  },
};

// Calculate progress percentage based on proposal status and time
function calculateProgress(proposal: any): number {
  const now = new Date().getTime();
  const startDate = new Date(proposal.startDate).getTime();
  const endDate = new Date(proposal.endDate).getTime();

  if (proposal.status === 'executed') return 100;
  if (proposal.status === 'passed') return 90;
  if (proposal.status === 'failed' || proposal.status === 'canceled')
    return 100;
  if (proposal.status === 'expired') return 100;

  if (proposal.status === 'active') {
    const totalDuration = endDate - startDate;
    const elapsed = now - startDate;
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  }

  if (proposal.status === 'pending') {
    return 0; // Not started yet
  }

  return 0;
}

export default function Overview() {
  const [isScraping, setIsScraping] = useState(false);

  // Data hooks
  const { data: proposals, isLoading: proposalsLoading } = useProposals();
  const { data: platforms, isLoading: platformsLoading } =
    useGovernancePlatforms();
  const { data: subscribers, isLoading: subscribersLoading } = useSubscribers();
  const { data: scrapingHistory, isLoading: historyLoading } =
    useScrapeHistory();
  const scrapeMutation = useScrapeGovernance();

  // Derived data
  const activeProposals = proposals?.filter(p => p.status === 'active') || [];
  const totalProposals = proposals?.length || 0;
  const totalDAOs = platforms?.length || 0;
  const lastScrapeTime = scrapingHistory?.[0]?.createdAt;

  // Calculate proposal status distribution for chart
  const statusDistribution =
    proposals?.reduce(
      (acc, proposal) => {
        acc[proposal.status] = (acc[proposal.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  const chartData = Object.entries(statusDistribution).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: CHART_COLORS[status as keyof typeof CHART_COLORS] || '#6b7280',
    })
  );

  // Handle scrape action
  const handleRunScrape = async () => {
    if (!platforms?.length) return;

    setIsScraping(true);
    try {
      // Run scrape for the first platform as an example
      await scrapeMutation.mutateAsync(platforms[0].id);
    } catch (error) {
      console.error('Scrape failed:', error);
    } finally {
      setIsScraping(false);
    }
  };

  // Handle proposal actions
  const handleViewProposal = (proposalId: string) => {
    console.log('View proposal:', proposalId);
    // Navigate to proposal detail page
  };

  const handleVote = (proposalId: string) => {
    console.log('Vote on proposal:', proposalId);
    // Open voting modal or navigate to voting page
  };

  const handleSettings = (proposalId: string) => {
    console.log('Settings for proposal:', proposalId);
    // Open settings modal
  };

  // Calculate success rate
  const successRate =
    totalProposals > 0
      ? (
          ((proposals?.filter(
            p => p.status === 'passed' || p.status === 'executed'
          ).length || 0) /
            totalProposals) *
          100
        ).toFixed(1)
      : '0.0';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Genie-Proposal Overview Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Track governance activity across all your DAOs
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleRunScrape}
                disabled={isScraping || !platforms?.length}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                aria-label="Run scraping process to fetch latest proposals"
              >
                <Play className="h-4 w-4 mr-2" />
                {isScraping ? 'Running...' : 'Run Scrape'}
              </Button>
              <Link to="/daos">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View DAOs
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                DAOs Tracked
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {platformsLoading ? '...' : totalDAOs}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {platformsLoading
                  ? 'Loading...'
                  : 'Active governance platforms'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Proposals
              </CardTitle>
              <FileText className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {proposalsLoading ? '...' : activeProposals.length}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {proposalsLoading
                  ? 'Loading...'
                  : `${totalProposals} total proposals`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Subscribers
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {subscribersLoading ? '...' : subscribers?.length || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {subscribersLoading ? 'Loading...' : 'Active notifications'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Last Scrape Time
              </CardTitle>
              <Clock className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {historyLoading ? (
                  'Loading...'
                ) : lastScrapeTime ? (
                  <TimeAgo date={new Date(lastScrapeTime)} />
                ) : (
                  'Never'
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {historyLoading ? 'Loading...' : 'Last data collection'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Latest Proposals Table */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Latest Proposals
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Recent governance proposals across all platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {proposalsLoading ? (
                  <div className="p-6">
                    <OverviewTableSkeleton />
                  </div>
                ) : proposals && proposals.length > 0 ? (
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <div>Title</div>
                      <div>DAO</div>
                      <div>Progress</div>
                      <div>Status</div>
                      <div>Deadline</div>
                      <div>Actions</div>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {proposals.slice(0, 5).map(proposal => {
                        const progress = calculateProgress(proposal);
                        const progressColors =
                          PROGRESS_COLORS[
                            proposal.status as keyof typeof PROGRESS_COLORS
                          ] || PROGRESS_COLORS.pending;

                        return (
                          <div
                            key={proposal.id}
                            className="grid grid-cols-6 gap-4 items-center py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {proposal.title}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {proposal.daoId}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${progress}%`,
                                    backgroundColor: progressColors.fill,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[2.5rem]">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div>
                              <StatusChip status={proposal.status}>
                                {proposal.status}
                              </StatusChip>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <TimeAgo date={new Date(proposal.endDate)} />
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewProposal(proposal.id)}
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-600"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {proposal.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleVote(proposal.id)}
                                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-600"
                                  title="Vote"
                                >
                                  <Vote className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSettings(proposal.id)}
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-600"
                                title="Settings"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <EmptyState
                      icon={FileText}
                      title="No proposals found"
                      description="No governance proposals have been scraped yet."
                      action={
                        <Button onClick={handleRunScrape} disabled={isScraping}>
                          <Play className="h-4 w-4 mr-2" />
                          Run First Scrape
                        </Button>
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Proposals by Status Chart */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 h-full">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Proposals by Status
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Distribution of proposal statuses
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {proposalsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-gray-500">Loading chart...</div>
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={BarChart3}
                    title="No data"
                    description="No proposals available for chart display."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Scraping Activity */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Scraping Activity
              </CardTitle>
              <Link
                to="/runtime"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Latest data collection activities and their results
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {historyLoading ? (
              <div className="p-6">
                <OverviewTableSkeleton />
              </div>
            ) : scrapingHistory && scrapingHistory.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {scrapingHistory.slice(0, 6).map(activity => {
                  // Determine status icon and color based on activity status
                  let statusIcon;
                  let statusColor;
                  let statusText;

                  switch (activity.status) {
                    case 'success':
                      statusIcon = '✓';
                      statusColor = 'bg-green-500';
                      statusText = 'Scrape completed';
                      break;
                    case 'failed':
                      statusIcon = '✕';
                      statusColor = 'bg-red-500';
                      statusText = 'Scrape failed';
                      break;
                    case 'partial':
                      statusIcon = '!';
                      statusColor = 'bg-yellow-500';
                      statusText = 'Partial scrape';
                      break;
                    default:
                      statusIcon = '?';
                      statusColor = 'bg-gray-500';
                      statusText = 'Unknown status';
                  }

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {/* Status Icon */}
                      <div
                        className={`flex-shrink-0 w-6 h-6 ${statusColor} rounded-md flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {statusIcon}
                      </div>

                      {/* Activity Details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {statusText} for {activity.platformId}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(activity.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              day: '2-digit',
                              month: 'short',
                            }
                          )}
                          ,{' '}
                          {new Date(activity.createdAt).toLocaleTimeString(
                            'en-US',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            }
                          )}{' '}
                          WAT
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  icon={Activity}
                  title="No scraping activity"
                  description="No data collection activities have been recorded yet."
                  action={
                    <Button onClick={handleRunScrape} disabled={isScraping}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Scraping
                    </Button>
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
