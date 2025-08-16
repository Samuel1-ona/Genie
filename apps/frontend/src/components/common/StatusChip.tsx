import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const statusChipVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default:
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        success:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        warning:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        pending:
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        passed:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        executed:
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        canceled:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        expired:
          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusChipVariants> {
  children: React.ReactNode;
  status?: string;
}

// Helper function to map status strings to variants
export function getStatusVariant(
  status?: string
): VariantProps<typeof statusChipVariants>['variant'] {
  if (!status) return 'default';

  const statusMap: Record<
    string,
    VariantProps<typeof statusChipVariants>['variant']
  > = {
    active: 'active',
    pending: 'pending',
    passed: 'passed',
    failed: 'failed',
    executed: 'executed',
    canceled: 'canceled',
    expired: 'expired',
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  return statusMap[status.toLowerCase()] || 'default';
}

export function StatusChip({
  className,
  variant,
  status,
  children,
  ...props
}: StatusChipProps) {
  const finalVariant = variant || getStatusVariant(status);

  return (
    <span
      className={cn(statusChipVariants({ variant: finalVariant }), className)}
      role="status"
      aria-label={`Status: ${children}`}
      {...props}
    >
      {children}
    </span>
  );
}
