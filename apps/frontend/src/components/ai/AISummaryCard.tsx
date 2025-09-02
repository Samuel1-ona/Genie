import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { AISentimentBadge } from './AISentimentBadge';
import { AIKeyPoints } from './AIKeyPoints';
import { AIEnrichButton } from './AIEnrichButton';
import { useEnrichProposal } from '@/hooks/useAI';
import type { AIResult } from '@/types/ai';
import { TimeAgo } from '@/components/common/TimeAgo';

interface AISummaryCardProps {
  proposalId: string;
  aiResult?: AIResult;
  className?: string;
  onRefresh?: () => void;
}

export function AISummaryCard({
  proposalId,
  aiResult,
  className = '',
  onRefresh,
}: AISummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const enrichMutation = useEnrichProposal(proposalId);

  const isLoading = enrichMutation.isPending;
  const hasSummary = aiResult?.summary && aiResult.summary.trim().length > 0;
  const hasShort = aiResult?.short && aiResult.short.trim().length > 0;
  const displayText = hasShort || hasSummary;
  const textToShow = hasShort ? aiResult.short! : aiResult?.summary;

  const handleRefresh = async () => {
    try {
      await enrichMutation.mutateAsync({ mode: 'both' });
      onRefresh?.();
    } catch (error) {
      // Error is handled by the button component
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
        </div>
      );
    }

    if (!displayText) {
      return (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No AI summary yet.
          </p>
          <AIEnrichButton
            proposalId={proposalId}
            mode="both"
            onSuccess={onRefresh}
          />
        </div>
      );
    }

    const shouldTruncate = textToShow!.length > 400;
    const displayContent =
      isExpanded || !shouldTruncate
        ? textToShow!
        : textToShow!.substring(0, 400) + '...';

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {displayContent}
          </p>

          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-auto p-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              aria-label={
                isExpanded ? 'Show less summary' : 'Show more summary'
              }
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show more
                </>
              )}
            </Button>
          )}
        </div>

        {/* Sentiment and Confidence */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {aiResult?.sentiment && (
              <AISentimentBadge
                sentiment={aiResult.sentiment}
                score={aiResult.score}
              />
            )}
            {aiResult?.confidence && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Confidence: {Math.round(aiResult.confidence * 100)}%
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
            aria-label="Refresh AI summary"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>

        {/* Key Points */}
        {aiResult?.key_points && aiResult.key_points.length > 0 && (
          <AIKeyPoints points={aiResult.key_points} />
        )}

        {/* Timestamp */}
        {aiResult?.last_updated && (
          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            Updated <TimeAgo timestamp={aiResult.last_updated * 1000} />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>AI Summary</span>
          {hasSummary && (
            <AIEnrichButton
              proposalId={proposalId}
              mode="both"
              variant="outline"
              size="sm"
              onSuccess={onRefresh}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
