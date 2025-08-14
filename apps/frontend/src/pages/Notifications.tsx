import { EmptyState } from '@/components/common/EmptyState';
import { Bell } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Notifications
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Stay updated with proposal activities
        </p>
      </div>

      <EmptyState
        icon={Bell}
        title="No notifications"
        description="You're all caught up! New notifications will appear here."
      />
    </div>
  );
}
