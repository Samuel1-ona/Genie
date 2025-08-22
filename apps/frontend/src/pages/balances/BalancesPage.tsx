import { useState } from 'react';
import { BalancesTable } from '@/components/balances/BalancesTable';
import { AdjustBalanceDialog } from '@/components/balances/AdjustBalanceDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { useBalances } from '@/hooks/useAOClient';
import {
  Search,
  Bell,
  Moon,
  Filter,
  Download,
  Plus,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

// Mock data for balances
const mockBalances = [
  {
    id: '1',
    address: '0x3a5e...c94d',
    description: 'Validator Node',
    balance: 568245.32,
    usdValue: 284122.66,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    status: 'active' as const,
    type: 'validator' as const,
  },
  {
    id: '2',
    address: '0x7b2d...e35a',
    description: 'Treasury',
    balance: 1245698.45,
    usdValue: 622849.23,
    lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'active' as const,
    type: 'treasury' as const,
  },
  {
    id: '3',
    address: '0x45f1...a72b',
    description: 'Rewards Pool',
    balance: 324578.21,
    usdValue: 162289.11,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'active' as const,
    type: 'rewards' as const,
  },
  {
    id: '4',
    address: '0x9e87...f42c',
    description: 'Development Fund',
    balance: 198654.89,
    usdValue: 99327.45,
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: 'inactive' as const,
    type: 'development' as const,
  },
  {
    id: '5',
    address: '0x2c4d...b91e',
    description: 'Marketing',
    balance: 113612.45,
    usdValue: 56806.23,
    lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    status: 'active' as const,
    type: 'marketing' as const,
  },
  {
    id: '6',
    address: '0x5f2a...e19d',
    description: 'Community Grants',
    balance: 0,
    usdValue: 0,
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: 'inactive' as const,
    type: 'grants' as const,
  },
];

// Mock data for recent distribution history
const mockDistributionHistory = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    transactionId: 'tx_3f9d...a1e7',
    from: { address: '0x7b2d...e35a', description: 'Treasury' },
    to: { address: '0x3a5e...c94d', description: 'Validator Node' },
    amount: 50000,
    status: 'confirmed' as const,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    transactionId: 'tx_8e2b...f56c',
    from: { address: '0x7b2d...e35a', description: 'Treasury' },
    to: { address: '0x45f1...a72b', description: 'Rewards Pool' },
    amount: 25000,
    status: 'confirmed' as const,
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    transactionId: 'tx_5c7a...d92e',
    from: { address: '0x7b2d...e35a', description: 'Treasury' },
    to: { address: '0x2c4d...b91e', description: 'Marketing' },
    amount: 15000,
    status: 'confirmed' as const,
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    transactionId: 'tx_2f8e...b41a',
    from: { address: '0x9e87...f42c', description: 'Development Fund' },
    to: { address: '0x5f2a...e19d', description: 'Community Grants' },
    amount: -10000,
    status: 'pending' as const,
  },
];

export default function BalancesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBalances, setSelectedBalances] = useState<string[]>([]);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustingBalance, setAdjustingBalance] = useState<any>(null);

  // Fetch real balances data
  const { data: balances, isLoading, error, refetch } = useBalances();

  // Calculate total balance
  const totalBalance =
    balances?.reduce((sum, balance) => sum + (balance.balance || 0), 0) || 0;
  const totalUsdValue =
    balances?.reduce((sum, balance) => sum + (balance.usdValue || 0), 0) || 0;
  const uniqueAddresses = balances?.length || 0;

  // Calculate 30-day change (mock data)
  const thirtyDayChange = 124856.12;
  const thirtyDayPercentage = 5.4;

  const handleAdjustBalance = (balance: any) => {
    setAdjustingBalance(balance);
    setShowAdjustDialog(true);
  };

  const handleBulkAdjust = () => {
    if (selectedBalances.length > 0) {
      // TODO: Implement bulk adjust functionality
      console.log('Bulk adjust for:', selectedBalances);
    }
  };

  const handleBulkExport = () => {
    if (selectedBalances.length > 0) {
      // TODO: Implement bulk export functionality
      console.log('Bulk export for:', selectedBalances);
    }
  };

  const handleSelectAll = () => {
    if (!balances) return;
    if (selectedBalances.length === balances.length) {
      setSelectedBalances([]);
    } else {
      setSelectedBalances(balances.map(b => b.id));
    }
  };

  const handleSelectBalance = (balanceId: string) => {
    setSelectedBalances(prev =>
      prev.includes(balanceId)
        ? prev.filter(id => id !== balanceId)
        : [...prev, balanceId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Balances Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor and manage token balances across the platform
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

        {/* Total Balance Distributed Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Total Balance Card */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Total Balance Distributed
                </h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {totalBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    AR
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Across {uniqueAddresses} unique addresses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 30 Day Change Card */}
          <div>
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Last 30 Days
                </h3>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    +
                    {thirtyDayChange.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    AR
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  +{thirtyDayPercentage}% from previous period
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Balance Distribution Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 lg:mb-0">
              Balance Distribution
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search by address */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by address..."
                  className="pl-10 w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              </div>

              {/* Action buttons */}
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Distribute Tokens
                </Button>
              </div>
            </div>
          </div>

          {/* Filters and Bulk Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm">
                <option>All Balances</option>
                <option>Active Only</option>
                <option>Inactive Only</option>
              </select>
              <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm">
                <option>All Time</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>

            {selectedBalances.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedBalances.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkAdjust}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                >
                  Adjust Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                >
                  Export Selected
                </Button>
              </div>
            )}
          </div>

          {/* Balances Table */}
          {isLoading ? (
            <LoadingState message="Loading balances..." />
          ) : error ? (
            <ErrorState
              title="Failed to Load Balances"
              message={error.message}
              onRetry={refetch}
            />
          ) : (
            <BalancesTable
              balances={balances || []}
              searchQuery={searchQuery}
              selectedBalances={selectedBalances}
              onSelectBalance={handleSelectBalance}
              onSelectAll={handleSelectAll}
              onAdjustBalance={handleAdjustBalance}
            />
          )}
        </div>

        {/* Recent Distribution History Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Distribution History
            </h2>
            <Button
              variant="link"
              className="text-blue-600 hover:text-blue-700 p-0 h-auto"
            >
              View Full History
              <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Distribution History Table */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                        Timestamp
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                        Transaction ID
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                        From
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                        To
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                        Amount
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDistributionHistory.map(item => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(item.timestamp).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            }) + ' WAT'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-900 dark:text-white font-mono">
                              {item.transactionId}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {item.from.description}, {item.from.address}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {item.to.description}, {item.to.address}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div
                            className={`text-sm font-medium ${
                              item.amount > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {item.amount > 0 ? '+' : ''}
                            {item.amount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            AR
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'confirmed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}
                          >
                            {item.status === 'confirmed'
                              ? 'Confirmed'
                              : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Adjust Balance Dialog */}
      <AdjustBalanceDialog
        isOpen={showAdjustDialog}
        onClose={() => {
          setShowAdjustDialog(false);
          setAdjustingBalance(null);
        }}
        balance={adjustingBalance}
        onAdjust={amount => {
          // TODO: Implement balance adjustment
          console.log('Adjusting balance:', adjustingBalance?.id, 'by', amount);
          setShowAdjustDialog(false);
          setAdjustingBalance(null);
        }}
      />
    </div>
  );
}
