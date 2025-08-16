import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  ChevronDown,
  Copy,
  Edit,
  Trash2,
  Clock,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Subscriber } from '@/types';

interface SubscriberTableProps {
  subscribers: Subscriber[];
  isLoading: boolean;
  onAddSubscriber: () => void;
}

const TYPE_CONFIG = {
  discord: {
    label: 'Discord',
    icon: MessageSquare,
    color: 'text-blue-500',
  },
  telegram: {
    label: 'Telegram',
    icon: MessageCircle,
    color: 'text-blue-400',
  },
};

export function SubscriberTable({
  subscribers,
  isLoading,
  onAddSubscriber,
}: SubscriberTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter subscribers based on search and filters
  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch =
      subscriber.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || subscriber.type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? subscriber.isActive : !subscriber.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleToggleActive = (subscriberId: string) => {
    // TODO: Implement toggle active logic
    console.log('Toggle active for subscriber:', subscriberId);
  };

  const handleEdit = (subscriberId: string) => {
    // TODO: Implement edit logic
    console.log('Edit subscriber:', subscriberId);
  };

  const handleDelete = (subscriberId: string) => {
    // TODO: Implement delete logic
    console.log('Delete subscriber:', subscriberId);
  };

  const handleCopyEndpoint = (endpoint: string) => {
    navigator.clipboard.writeText(endpoint);
    // TODO: Show success toast
  };

  const formatLastSuccess = (lastActiveAt: string) => {
    const date = new Date(lastActiveAt);
    return (
      date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WAT'
    );
  };

  const truncateEndpoint = (endpoint: string, maxLength: number = 40) => {
    if (endpoint.length <= maxLength) return endpoint;
    return endpoint.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search subscribers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button
              variant="outline"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              All Types
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="relative">
            <Button
              variant="outline"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              All Status
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                    Endpoint
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                    Active
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                    Last Success
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map(subscriber => {
                  const typeConfig =
                    TYPE_CONFIG[subscriber.type as keyof typeof TYPE_CONFIG] ||
                    TYPE_CONFIG.discord;
                  const TypeIcon = typeConfig.icon;

                  return (
                    <tr
                      key={subscriber.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {subscriber.name}
                          </div>
                          {subscriber.email && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {subscriber.email}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <TypeIcon
                            className={cn('h-4 w-4', typeConfig.color)}
                          />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {typeConfig.label}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900 dark:text-white font-mono">
                            {truncateEndpoint(subscriber.endpoint || '')}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleCopyEndpoint(subscriber.endpoint || '')
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleActive(subscriber.id)}
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                            subscriber.isActive
                              ? 'bg-blue-600'
                              : 'bg-gray-200 dark:bg-gray-700'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              subscriber.isActive
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            )}
                          />
                        </button>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {formatLastSuccess(subscriber.lastActiveAt)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(subscriber.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(subscriber.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredSubscribers.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {filteredSubscribers.length} of {subscribers.length}{' '}
            subscribers
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
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredSubscribers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'No subscribers match your filters'
              : 'No subscribers found'}
          </p>
          {!searchQuery && typeFilter === 'all' && statusFilter === 'all' && (
            <Button
              onClick={onAddSubscriber}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Your First Subscriber
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
