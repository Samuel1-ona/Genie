/**
 * Proposal Source Badge
 * Shows whether a proposal came from AO Process or Tally API
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ExternalLink } from 'lucide-react';

interface ProposalSourceBadgeProps {
  source: 'ao-process' | 'tally-api';
  className?: string;
}

export function ProposalSourceBadge({
  source,
  className = '',
}: ProposalSourceBadgeProps) {
  if (source === 'ao-process') {
    return (
      <Badge
        variant="outline"
        className={`bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 ${className}`}
      >
        <Sparkles className="h-3 w-3 mr-1" />
        AO Process
      </Badge>
    );
  }

  if (source === 'tally-api') {
    return (
      <Badge
        variant="outline"
        className={`bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 ${className}`}
      >
        <ExternalLink className="h-3 w-3 mr-1" />
        Tally API
      </Badge>
    );
  }

  return null;
}
