import { EmptyState } from '@/components/common/EmptyState';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure your application preferences
        </p>
      </div>

      <EmptyState
        icon={SettingsIcon}
        title="Settings coming soon"
        description="Application settings and configuration options will be available here."
      />
    </div>
  );
}
