import { EmptyState } from '@/components/common/EmptyState';
import { AlertTriangle } from 'lucide-react';

export default function Errors() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Errors
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View and manage system errors
        </p>
      </div>

      <EmptyState
        icon={AlertTriangle}
        title="No errors found"
        description="Great! Your system is running smoothly with no errors."
      />
    </div>
  );
}
