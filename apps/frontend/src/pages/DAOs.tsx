import { EmptyState } from '@/components/common/EmptyState';
import { Building2 } from 'lucide-react';

export default function DAOs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          DAOs
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your DAO connections and settings
        </p>
      </div>

      <EmptyState
        icon={Building2}
        title="No DAOs connected"
        description="Connect your first DAO to start managing proposals."
      />
    </div>
  );
}
