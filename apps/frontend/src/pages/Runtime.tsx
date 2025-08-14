import { EmptyState } from '@/components/common/EmptyState';
import { Cpu } from 'lucide-react';

export default function Runtime() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Runtime
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Monitor system performance and health
        </p>
      </div>

      <EmptyState
        icon={Cpu}
        title="Runtime monitoring"
        description="System metrics and performance data will be displayed here."
      />
    </div>
  );
}
