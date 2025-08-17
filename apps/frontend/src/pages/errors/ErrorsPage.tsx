import { useState, useEffect } from 'react';
import { ErrorTable } from '@/components/errors/ErrorTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Bell,
  User,
  Calendar,
  X,
  Download,
  TrendingUp,
  AlertTriangle,
  Code,
  Wifi,
  Eye,
  CheckCircle,
  BarChart3,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mock data for errors
const mockErrors = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    governanceId: 'tally.xyz/aave API v2',
    errorMessage:
      'Rate limit exceeded: Too many requests (429). Retry after 180 seconds.',
    errorType: 'rate_limit' as const,
    count: 1,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
    governanceId: 'tally.xyz/uniswap API v2',
    errorMessage:
      'Parse error: Unexpected token in JSON at position 1024. Failed to parse proposal data.',
    errorType: 'parse' as const,
    count: 1,
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
    governanceId: 'snapshot.org/ens GraphQL API',
    errorMessage:
      'Network error: Request timeout after 30000ms. Connection to snapshot.org failed.',
    errorType: 'network' as const,
    count: 1,
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5h ago
    governanceId: 'tally.xyz/aave API v2',
    errorMessage:
      'Rate limit exceeded: Too many requests (429). Retry after 180 seconds.',
    errorType: 'rate_limit' as const,
    count: 1,
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
    governanceId: 'tally.xyz/uniswap API v2',
    errorMessage:
      'Parse error: Unexpected token in JSON at position 1024. Failed to parse proposal data.',
    errorType: 'parse' as const,
    count: 1,
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7h ago
    governanceId: 'snapshot.org/ens GraphQL API',
    errorMessage:
      'Network error: Request timeout after 30000ms. Connection to snapshot.org failed.',
    errorType: 'network' as const,
    count: 1,
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8h ago
    governanceId: 'tally.xyz/aave API v2',
    errorMessage:
      'Rate limit exceeded: Too many requests (429). Retry after 180 seconds.',
    errorType: 'rate_limit' as const,
    count: 1,
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), // 9h ago
    governanceId: 'tally.xyz/uniswap API v2',
    errorMessage:
      'Parse error: Unexpected token in JSON at position 1024. Failed to parse proposal data.',
    errorType: 'parse' as const,
    count: 1,
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10h ago
    governanceId: 'snapshot.org/ens GraphQL API',
    errorMessage:
      'Network error: Request timeout after 30000ms. Connection to snapshot.org failed.',
    errorType: 'network' as const,
    count: 1,
  },
  {
    id: '10',
    timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(), // 11h ago
    governanceId: 'tally.xyz/aave API v2',
    errorMessage:
      'Rate limit exceeded: Too many requests (429). Retry after 180 seconds.',
    errorType: 'rate_limit' as const,
    count: 1,
  },
  {
    id: '11',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
    governanceId: 'tally.xyz/uniswap API v2',
    errorMessage:
      'Parse error: Unexpected token in JSON at position 1024. Failed to parse proposal data.',
    errorType: 'parse' as const,
    count: 1,
  },
  {
    id: '12',
    timestamp: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(), // 13h ago
    governanceId: 'snapshot.org/ens GraphQL API',
    errorMessage:
      'Network error: Request timeout after 30000ms. Connection to snapshot.org failed.',
    errorType: 'network' as const,
    count: 1,
  },
  {
    id: '13',
    timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14h ago
    governanceId: 'tally.xyz/aave API v2',
    errorMessage:
      'Rate limit exceeded: Too many requests (429). Retry after 180 seconds.',
    errorType: 'rate_limit' as const,
    count: 1,
  },
  {
    id: '14',
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(), // 15h ago
    governanceId: 'tally.xyz/uniswap API v2',
    errorMessage:
      'Parse error: Unexpected token in JSON at position 1024. Failed to parse proposal data.',
    errorType: 'parse' as const,
    count: 1,
  },
  {
    id: '15',
    timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16h ago
    governanceId: 'snapshot.org/ens GraphQL API',
    errorMessage:
      'Network error: Request timeout after 30000ms. Connection to snapshot.org failed.',
    errorType: 'network' as const,
    count: 1,
  },
];

// Mock data for error frequency chart
const mockChartData = [
  { time: '00:00', rateLimit: 2, parse: 1, network: 0 },
  { time: '02:00', rateLimit: 1, parse: 2, network: 1 },
  { time: '04:00', rateLimit: 3, parse: 0, network: 1 },
  { time: '06:00', rateLimit: 2, parse: 1, network: 2 },
  { time: '08:00', rateLimit: 4, parse: 2, network: 1 },
  { time: '10:00', rateLimit: 6, parse: 3, network: 0 },
];

export default function ErrorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateRange, setDateRange] = useState({
    start: searchParams.get('startDate') || '',
    end: searchParams.get('endDate') || '',
  });
  const [governanceId, setGovernanceId] = useState(
    searchParams.get('governanceId') || 'all'
  );
  const [errorType, setErrorType] = useState(
    searchParams.get('errorType') || 'all'
  );

  // Calculate error statistics
  const totalErrors = mockErrors.length;
  const rateLimitErrors = mockErrors.filter(
    e => e.errorType === 'rate_limit'
  ).length;
  const parseErrors = mockErrors.filter(e => e.errorType === 'parse').length;
  const networkErrors = mockErrors.filter(
    e => e.errorType === 'network'
  ).length;

  const rateLimitPercentage = ((rateLimitErrors / totalErrors) * 100).toFixed(
    1
  );
  const parsePercentage = ((parseErrors / totalErrors) * 100).toFixed(1);
  const networkPercentage = ((networkErrors / totalErrors) * 100).toFixed(1);

  // Get unique governance IDs for filter
  const governanceIds = Array.from(
    new Set(mockErrors.map(e => e.governanceId))
  );

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (dateRange.start) params.set('startDate', dateRange.start);
    if (dateRange.end) params.set('endDate', dateRange.end);
    if (governanceId && governanceId !== 'all')
      params.set('governanceId', governanceId);
    if (errorType !== 'all') params.set('errorType', errorType);
    setSearchParams(params);
  }, [dateRange, governanceId, errorType, setSearchParams]);

  const handleClearFilters = () => {
    setDateRange({ start: '', end: '' });
    setGovernanceId('all');
    setErrorType('all');
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = [
      'Timestamp',
      'Governance ID',
      'Error Message',
      'Error Type',
    ];
    const csvContent = [
      headers.join(','),
      ...mockErrors.map(error =>
        [
          new Date(error.timestamp).toISOString(),
          error.governanceId,
          `"${error.errorMessage}"`,
          error.errorType,
        ].join(',')
      ),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleClearResolvedErrors = () => {
    // TODO: Implement clear resolved errors functionality
    console.log('Clearing resolved errors...');
  };

  const handleDownloadErrorReport = () => {
    // TODO: Implement download error report functionality
    console.log('Downloading error report...');
  };

  const handleConfigureAlerts = () => {
    // TODO: Implement configure alerts functionality
    console.log('Configuring alerts...');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Error Logs
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor and troubleshoot system errors
            </p>
          </div>

          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Bell className="h-5 w-5" />
            </button>

            {/* User Profile */}
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Date Range */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={e =>
                    setDateRange(prev => ({ ...prev, start: e.target.value }))
                  }
                  className="w-32 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={e =>
                    setDateRange(prev => ({ ...prev, end: e.target.value }))
                  }
                  className="w-32 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              </div>

              {/* Governance ID Filter */}
              <div>
                <Select value={governanceId} onValueChange={setGovernanceId}>
                  <SelectTrigger className="w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Filter by ID" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All IDs</SelectItem>
                    {governanceIds.map(id => (
                      <SelectItem key={id} value={id}>
                        {id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Error Type Filter */}
              <div>
                <Select value={errorType} onValueChange={setErrorType}>
                  <SelectTrigger className="w-32 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="rate_limit">Rate Limit</SelectItem>
                    <SelectItem value="parse">Parse</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              <Button
                onClick={handleExportCSV}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Error Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Errors */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total Errors
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalErrors}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Across {governanceIds.length} governance IDs
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12 from yesterday
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                  <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                    Last 24h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limit Errors */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Rate Limit Errors
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {rateLimitErrors}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {rateLimitPercentage}% of all errors
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />▲ Mostly from
                    Tally.xyz
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-lg">
                  <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                    Most Common
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parse Errors */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Parse Errors
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {parseErrors}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {parsePercentage}% of all errors
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 flex items-center">
                    <Code className="h-3 w-3 mr-1" />
                    &lt;/&gt; Schema update needed
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                  <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                    Schema Issues
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Errors */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Network Errors
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {networkErrors}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {networkPercentage}% of all errors
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                    <Wifi className="h-3 w-3 mr-1" />
                    Intermittent connection issues
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-900/20 p-2 rounded-lg">
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    Timeout/DNS
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Error Table */}
          <div className="lg:col-span-2">
            <ErrorTable
              errors={mockErrors}
              dateRange={dateRange}
              governanceId={governanceId}
              errorType={errorType}
            />
          </div>

          {/* Right Column - Charts and Solutions */}
          <div className="space-y-6">
            {/* Error Frequency Chart */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Error Frequency
                  </h3>
                  <Select defaultValue="24h">
                    <SelectTrigger className="w-32 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Legend */}
                <div className="flex items-center space-x-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Rate Limit Errors
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Parse Errors
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Network Errors
                    </span>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="rateLimit" stackId="a" fill="#EF4444" />
                      <Bar dataKey="parse" stackId="a" fill="#3B82F6" />
                      <Bar dataKey="network" stackId="a" fill="#EAB308" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Common Solutions */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Common Solutions
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Rate Limit Errors
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Implement exponential backoff and reduce parallel requests
                      to the same API endpoint.
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600 hover:text-blue-700"
                    >
                      View Documentation
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Parse Errors
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Update schema definitions to match the latest API response
                      format from governance platforms.
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600 hover:text-blue-700"
                    >
                      Update Schemas
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Network Errors
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Check network connectivity and implement retry logic with
                      increasing timeouts.
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600 hover:text-blue-700"
                    >
                      Network Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Management */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Error Management
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={handleClearResolvedErrors}
                    className="w-full justify-start bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Clear Resolved Errors
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadErrorReport}
                    className="w-full justify-start bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Error Report
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleConfigureAlerts}
                    className="w-full justify-start bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Configure Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
