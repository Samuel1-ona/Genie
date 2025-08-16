import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
  Wallet,
  Building2,
  Gift,
  Wrench,
  Megaphone,
  Users,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Balance {
  id: string;
  address: string;
  description: string;
  balance: number;
  usdValue: number;
  lastUpdated: string;
  status: 'active' | 'inactive';
  type:
    | 'validator'
    | 'treasury'
    | 'rewards'
    | 'development'
    | 'marketing'
    | 'grants';
}

interface BalancesTableProps {
  balances: Balance[];
  searchQuery: string;
  selectedBalances: string[];
  onSelectBalance: (balanceId: string) => void;
  onSelectAll: () => void;
  onAdjustBalance: (balance: Balance) => void;
}

const TYPE_CONFIG = {
  validator: {
    icon: Wallet,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
  },
  treasury: {
    icon: Building2,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
  },
  rewards: {
    icon: Gift,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
  },
  development: {
    icon: Wrench,
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
  },
  marketing: {
    icon: Megaphone,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  grants: {
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
  },
};

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    color:
      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  },
};

export function BalancesTable({
  balances,
  searchQuery,
  selectedBalances,
  onSelectBalance,
  onSelectAll,
  onAdjustBalance,
}: BalancesTableProps) {
  const [sortField, setSortField] = useState<'balance' | 'lastUpdated' | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter balances based on search query
  const filteredBalances = balances.filter(
    balance =>
      balance.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      balance.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort balances
  const sortedBalances = [...filteredBalances].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: string | number;
    let bValue: string | number;

    if (sortField === 'balance') {
      aValue = a.balance;
      bValue = b.balance;
    } else {
      aValue = new Date(a.lastUpdated).getTime();
      bValue = new Date(b.lastUpdated).getTime();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: 'balance' | 'lastUpdated') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatLastUpdated = (timestamp: string) => {
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

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    // TODO: Show success toast
  };

  const getSortIcon = (field: 'balance' | 'lastUpdated') => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-gray-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-gray-600" />
    );
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  <Checkbox
                    checked={
                      selectedBalances.length === balances.length &&
                      balances.length > 0
                    }
                    onCheckedChange={onSelectAll}
                  />
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  Address
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  <button
                    onClick={() => handleSort('balance')}
                    className="flex items-center space-x-1 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <span>Balance</span>
                    {getSortIcon('balance')}
                  </button>
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  <button
                    onClick={() => handleSort('lastUpdated')}
                    className="flex items-center space-x-1 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <span>Last Updated</span>
                    {getSortIcon('lastUpdated')}
                  </button>
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedBalances.map(balance => {
                const typeConfig = TYPE_CONFIG[balance.type];
                const statusConfig = STATUS_CONFIG[balance.status];
                const TypeIcon = typeConfig.icon;

                return (
                  <tr
                    key={balance.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-4 px-6">
                      <Checkbox
                        checked={selectedBalances.includes(balance.id)}
                        onCheckedChange={() => onSelectBalance(balance.id)}
                      />
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div
                          className={cn('p-2 rounded-lg', typeConfig.bgColor)}
                        >
                          <TypeIcon
                            className={cn('h-4 w-4', typeConfig.color)}
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                              {balance.address}
                            </span>
                            <button
                              onClick={() => handleCopyAddress(balance.address)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {balance.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {balance.balance.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          AR
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ≈ $
                          {balance.usdValue.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          USD
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatLastUpdated(balance.lastUpdated)}
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
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAdjustBalance(balance)}
                          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <RefreshCw className="h-4 w-4" />
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
        {sortedBalances.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {sortedBalances.length} of {balances.length} addresses
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-600 text-white border-blue-600"
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                2
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                3
              </Button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ...
              </span>
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                55
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {sortedBalances.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'No balances match your search'
                : 'No balances found'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
