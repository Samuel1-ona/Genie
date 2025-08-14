import { EmptyState } from '@/components/common/EmptyState';
import { FileText } from 'lucide-react';

export default function Proposals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Proposals
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage and track DAO proposals
        </p>
      </div>

      <EmptyState
        icon={FileText}
        title="No proposals yet"
        description="Proposals will appear here once they are created or imported."
      />
    </div>
  );
}
