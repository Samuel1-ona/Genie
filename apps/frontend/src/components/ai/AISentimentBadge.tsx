import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { AISentiment } from '@/types/ai';

interface AISentimentBadgeProps {
  sentiment: AISentiment;
  score?: number;
  className?: string;
}

const SENTIMENT_CONFIG = {
  positive: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    label: 'Positive',
  },
  neutral: {
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    label: 'Neutral',
  },
  negative: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    label: 'Negative',
  },
};

export function AISentimentBadge({
  sentiment,
  score,
  className = '',
}: AISentimentBadgeProps) {
  const config = SENTIMENT_CONFIG[sentiment];

  const tooltipContent =
    score !== undefined ? `Score: ${score.toFixed(2)}` : config.label;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={`${config.color} ${className}`}
            aria-label={`Sentiment: ${config.label}${score !== undefined ? ` (Score: ${score.toFixed(2)})` : ''}`}
          >
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
