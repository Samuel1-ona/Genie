import { useState } from 'react';
import { useSubscribers } from '@/hooks/useAOClient';
import { SubscriberTable } from '@/components/notifications/SubscriberTable';
import { AddSubscriberDialog } from '@/components/notifications/AddSubscriberDialog';
import { TemplatePreview } from '@/components/notifications/TemplatePreview';
import { TestBroadcast } from '@/components/notifications/TestBroadcast';
import { Button } from '@/components/ui/button';
import { Send, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'subscribers' | 'templates' | 'test';

export default function NotificationsPage() {
  const { data: subscribers, isLoading } = useSubscribers();
  const [activeTab, setActiveTab] = useState<TabType>('subscribers');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddSubscriber = async (subscriberData: {
    name: string;
    type: 'discord' | 'telegram';
    endpoint: string;
  }) => {
    // TODO: Implement add subscriber logic
    console.log('Adding subscriber:', subscriberData);
    setShowAddDialog(false);
  };

  const handleTestBroadcast = async (data: {
    proposalId: string;
    subscriberIds: string[];
  }) => {
    // TODO: Implement test broadcast logic
    console.log('Test broadcast:', data);
  };

  const tabs = [
    { id: 'subscribers', label: 'Subscribers List' },
    { id: 'templates', label: 'Templates' },
    { id: 'test', label: 'Test Broadcast' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Notification Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Configure and manage notification subscribers and templates
            </p>
          </div>

          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            {/* Test Broadcast Button */}
            <Button
              onClick={() => setActiveTab('test')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Test Broadcast
            </Button>

            {/* Add Subscriber Button */}
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subscriber
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'subscribers' && (
            <SubscriberTable
              subscribers={subscribers || []}
              isLoading={isLoading}
              onAddSubscriber={() => setShowAddDialog(true)}
            />
          )}

          {activeTab === 'templates' && <TemplatePreview />}

          {activeTab === 'test' && (
            <TestBroadcast
              subscribers={subscribers || []}
              onTestBroadcast={handleTestBroadcast}
            />
          )}
        </div>
      </div>

      {/* Add Subscriber Dialog */}
      <AddSubscriberDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddSubscriber}
      />
    </div>
  );
}
