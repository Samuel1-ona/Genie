import { useState } from 'react';
import { useProposals, useBroadcastNotification } from '@/lib/aoClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Subscriber } from '@/types';

interface TestBroadcastProps {
  subscribers: Subscriber[];
  onTestBroadcast?: (data: {
    proposalId: string;
    subscriberIds: string[];
  }) => void;
}

interface BroadcastResult {
  subscriberId: string;
  subscriberName: string;
  type: 'discord' | 'telegram';
  status: 'success' | 'error';
  message: string;
  timestamp: string;
}

export function TestBroadcast({
  subscribers,
  onTestBroadcast,
}: TestBroadcastProps) {
  const { data: proposals } = useProposals();
  const [selectedProposalId, setSelectedProposalId] = useState('');
  const [selectedSubscriberIds, setSelectedSubscriberIds] = useState<string[]>(
    []
  );
  const [isSending, setIsSending] = useState(false);
  const [results, setResults] = useState<BroadcastResult[]>([]);

  const activeSubscribers = subscribers.filter(s => s.isActive);

  const handleSendTest = async () => {
    if (!selectedProposalId || selectedSubscriberIds.length === 0) return;

    setIsSending(true);
    setResults([]);

    try {
      const selectedProposal = proposals?.find(
        p => p.id === selectedProposalId
      );
      if (!selectedProposal) {
        throw new Error('Selected proposal not found');
      }

      // Use the real API if available, otherwise fall back to the callback
      if (onTestBroadcast) {
        // Fallback to callback for backward compatibility
        await onTestBroadcast({
          proposalId: selectedProposalId,
          subscriberIds: selectedSubscriberIds,
        });
      }
    } catch (error) {
      console.error('Test broadcast failed:', error);
      // Set error results for all selected subscribers
      const errorResults: BroadcastResult[] = selectedSubscriberIds.map(id => {
        const subscriber = subscribers.find(s => s.id === id);
        return {
          subscriberId: id,
          subscriberName: subscriber?.name || 'Unknown',
          type: subscriber?.type || 'discord',
          status: 'error',
          message: 'Failed to send test broadcast',
          timestamp: new Date().toISOString(),
        };
      });
      setResults(errorResults);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedSubscriberIds.length === activeSubscribers.length) {
      setSelectedSubscriberIds([]);
    } else {
      setSelectedSubscriberIds(activeSubscribers.map(s => s.id));
    }
  };

  const handleToggleSubscriber = (subscriberId: string) => {
    setSelectedSubscriberIds(prev =>
      prev.includes(subscriberId)
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  const selectedProposal = proposals?.find(p => p.id === selectedProposalId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Test Broadcast
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Send a test notification to selected subscribers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Proposal Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Proposal
              </label>
              <Select
                value={selectedProposalId}
                onValueChange={setSelectedProposalId}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Choose a proposal to test with..." />
                </SelectTrigger>
                <SelectContent>
                  {proposals?.slice(0, 10).map(proposal => (
                    <SelectItem key={proposal.id} value={proposal.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{proposal.title}</span>
                        <span className="text-xs text-gray-500">
                          {proposal.daoId} • {proposal.status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subscriber Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Subscribers
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedSubscriberIds.length === activeSubscribers.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeSubscribers.map(subscriber => {
                  const result = results.find(
                    r => r.subscriberId === subscriber.id
                  );
                  return (
                    <div
                      key={subscriber.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <Checkbox
                        checked={selectedSubscriberIds.includes(subscriber.id)}
                        onCheckedChange={() =>
                          handleToggleSubscriber(subscriber.id)
                        }
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {subscriber.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {subscriber.type} •{' '}
                          {subscriber.endpoint?.substring(0, 30)}...
                        </div>
                      </div>
                      {result && (
                        <div className="flex items-center">
                          {result.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {activeSubscribers.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No active subscribers found
                </div>
              )}
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendTest}
              disabled={
                !selectedProposalId ||
                selectedSubscriberIds.length === 0 ||
                isSending
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending
                ? 'Sending...'
                : `Send Test to ${selectedSubscriberIds.length} Subscriber${selectedSubscriberIds.length !== 1 ? 's' : ''}`}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Message Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProposal ? (
              <div className="space-y-4">
                {/* Discord Preview */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Discord Preview
                  </h4>
                  <div className="bg-gray-900 text-white p-4 rounded-lg">
                    <div className="border-l-4 border-blue-500 pl-3">
                      <h3 className="font-semibold text-blue-400 mb-2">
                        {selectedProposal.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        {selectedProposal.description?.substring(0, 150)}...
                      </p>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Status:</span>
                          <span className="text-white">
                            {selectedProposal.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Deadline:</span>
                          <span className="text-white">
                            {new Date(
                              selectedProposal.endDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Votes:</span>
                          <span className="text-white">
                            {selectedProposal.totalVotes?.toLocaleString()}{' '}
                            total
                          </span>
                        </div>
                      </div>

                      <div className="text-blue-400 text-sm underline">
                        View Proposal
                      </div>

                      <div className="text-gray-500 text-xs mt-2">
                        Genie Governance Alerts
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telegram Preview */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Telegram Preview
                  </h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                    <div className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                      {`🚨 **${selectedProposal.title}**

${selectedProposal.description?.substring(0, 150)}...

📊 **Status:** ${selectedProposal.status}
⏰ **Deadline:** ${new Date(selectedProposal.endDate).toLocaleDateString()}
🗳️ **Votes:** ${selectedProposal.totalVotes?.toLocaleString()} total

🔗 [View Proposal](#)

_Genie Governance Alerts_`}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Select a proposal to see the message preview
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map(result => {
                const subscriber = subscribers.find(
                  s => s.id === result.subscriberId
                );
                return (
                  <div
                    key={result.subscriberId}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg',
                      result.status === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {result.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {result.subscriberName || subscriber?.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {result.type}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {result.status === 'success'
                        ? 'Sent successfully'
                        : result.message || 'Failed to send'}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
