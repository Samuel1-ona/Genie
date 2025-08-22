import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
  className?: string;
}

export function LoadingState({
  message = 'Loading...',
  showSpinner = true,
  className = '',
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${className}`}
    >
      {showSpinner && (
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
      )}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = '',
}: SkeletonTableProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`space-y-3 p-4 ${className}`}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
