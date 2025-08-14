import { EmptyState } from '@/components/common/EmptyState';
import { Wallet } from 'lucide-react';

export default function Balances() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Balances
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View your token balances and transactions
        </p>
      </div>

      <EmptyState
        icon={Wallet}
        title="No balances to display"
        description="Connect your wallet to view your token balances."
      />
    </div>
  );
}
