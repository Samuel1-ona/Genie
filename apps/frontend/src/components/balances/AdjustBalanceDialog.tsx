import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Minus } from 'lucide-react';
import { adminAdjustBalance } from '@/lib/adminClient';

interface Balance {
  id: string;
  address: string;
  description: string;
  balance: number;
  usdValue: number;
  lastUpdated: string;
  status: 'active' | 'inactive';
  type:
    | 'validator'
    | 'treasury'
    | 'rewards'
    | 'development'
    | 'marketing'
    | 'grants';
}

interface AdjustBalanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  balance: Balance | null;
  onAdjust: (amount: number) => void;
}

export function AdjustBalanceDialog({
  isOpen,
  onClose,
  balance,
  onAdjust,
}: AdjustBalanceDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>(
    'add'
  );
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !reason || !balance) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);

    try {
      const finalAmount = adjustmentType === 'add' ? numAmount : -numAmount;

      // Use admin client for balance adjustment
      await adminAdjustBalance(balance.address, finalAmount, reason);

      // Call the original onAdjust callback
      await onAdjust(finalAmount);

      // Reset form
      setAmount('');
      setReason('');
      setAdjustmentType('add');
    } catch (error) {
      console.error('Failed to adjust balance:', error);
      throw error; // Re-throw to show error in UI
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount('');
      setReason('');
      setAdjustmentType('add');
      onClose();
    }
  };

  const formatBalance = (balance: number) => {
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateNewBalance = () => {
    if (!balance || !amount) return balance?.balance;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return balance.balance;

    return adjustmentType === 'add'
      ? balance.balance + numAmount
      : balance.balance - numAmount;
  };

  const newBalance = calculateNewBalance();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Adjust Balance
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Add or remove tokens from this balance. All changes are logged for
            audit purposes.
          </DialogDescription>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        {balance && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Balance Info */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Current Balance
              </h4>
              <div className="space-y-1">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Address: <span className="font-mono">{balance.address}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Description: {balance.description}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatBalance(balance.balance)} AR
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ≈ ${formatBalance(balance.usdValue)} USD
                </div>
              </div>
            </div>

            {/* Adjustment Type */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Adjustment Type
              </Label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('add')}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    adjustmentType === 'add'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <Plus className="h-5 w-5 text-green-500" />
                        <p className="font-medium text-gray-900 dark:text-white">
                          Add Tokens
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          Increase balance
                        </p>
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustmentType('subtract')}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    adjustmentType === 'subtract'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <Minus className="h-5 w-5 text-red-500" />
                        <p className="font-medium text-gray-900 dark:text-white">
                          Remove Tokens
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          Decrease balance
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <Label
                htmlFor="amount"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Amount (AR)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                disabled={isSubmitting}
                className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* New Balance Preview */}
            {newBalance !== undefined && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  New Balance Preview
                </h4>
                <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {formatBalance(newBalance)} AR
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {newBalance > balance.balance ? '+' : ''}
                  {formatBalance(newBalance - balance.balance)} AR change
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <Label
                htmlFor="reason"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Reason for Adjustment
              </Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for this balance adjustment..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                disabled={isSubmitting}
                className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                rows={3}
              />
            </div>

            {/* Confirmation */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Important
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      This action will permanently modify the balance. Please
                      ensure the amount and reason are correct before
                      proceeding.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !amount || !reason}
                className={`${
                  adjustmentType === 'add'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isSubmitting ? 'Adjusting...' : `Adjust Balance`}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
