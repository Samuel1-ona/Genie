import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIKeyPointsProps {
  points: string[];
  maxVisible?: number;
  className?: string;
}

export function AIKeyPoints({
  points,
  maxVisible = 5,
  className = '',
}: AIKeyPointsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!points || points.length === 0) {
    return null;
  }

  const visiblePoints = isExpanded ? points : points.slice(0, maxVisible);
  const hasMore = points.length > maxVisible;

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Key Points
      </h4>
      <ul className="space-y-1">
        {visiblePoints.map((point, index) => (
          <li
            key={index}
            className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400"
          >
            <span className="text-blue-500 mt-1">•</span>
            <span className="flex-1">{point}</span>
          </li>
        ))}
      </ul>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-auto p-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          aria-label={
            isExpanded ? 'Show fewer key points' : 'Show more key points'
          }
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show fewer
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show {points.length - maxVisible} more
            </>
          )}
        </Button>
      )}
    </div>
  );
}
