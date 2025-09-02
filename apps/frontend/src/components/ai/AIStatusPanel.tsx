import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, Clock, Play } from 'lucide-react';
import { useAIStatus, useRetryAI } from '@/hooks/useAI';
import { TimeAgo } from '@/components/common/TimeAgo';
import { toast } from '@/lib/toast';

export function AIStatusPanel() {
  const { data: aiStatus, isLoading, error, refetch } = useAIStatus();
  const retryMutation = useRetryAI();

  const handleRetryFailed = async () => {
    try {
      const result = await retryMutation.mutateAsync({});
      toast({
        title: 'Retry Initiated',
        description: `Queued ${result.queued} failed AI operations for retry.`,
        variant: 'default',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Retry Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to retry AI operations',
        variant: 'destructive',
      });
    }
  };

  const renderStatusContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
        </div>
      );
    }

    if (error || !aiStatus) {
      return (
        <div className="text-center py-4">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Unable to fetch AI status
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Queue Depth */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Queue Depth
            </span>
          </div>
          <Badge
            variant={
              aiStatus.queueDepth > 10
                ? 'destructive'
                : aiStatus.queueDepth > 5
                  ? 'secondary'
                  : 'default'
            }
            className="text-xs"
          >
            {aiStatus.queueDepth}
          </Badge>
        </div>

        {/* Last Run */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Play className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Last Run
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {aiStatus.lastRun ? (
              <TimeAgo timestamp={aiStatus.lastRun * 1000} />
            ) : (
              'Never'
            )}
          </span>
        </div>

        {/* Last Error */}
        {aiStatus.lastError && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Last Error
              </span>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs">
              <div className="text-red-800 dark:text-red-200 font-medium">
                {aiStatus.lastError.code}
              </div>
              {aiStatus.lastError.message && (
                <div className="text-red-600 dark:text-red-300 mt-1">
                  {aiStatus.lastError.message}
                </div>
              )}
              <div className="text-red-500 dark:text-red-400 mt-1">
                <TimeAgo timestamp={aiStatus.lastError.ts * 1000} />
              </div>
            </div>
          </div>
        )}

        {/* Retry Button */}
        <Button
          onClick={handleRetryFailed}
          disabled={retryMutation.isPending}
          variant="outline"
          size="sm"
          className="w-full"
          aria-label="Retry failed AI operations"
        >
          {retryMutation.isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {retryMutation.isPending ? 'Retrying...' : 'Retry Failed'}
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>AI Status</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-8 w-8 p-0"
            aria-label="Refresh AI status"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>{renderStatusContent()}</CardContent>
    </Card>
  );
}
