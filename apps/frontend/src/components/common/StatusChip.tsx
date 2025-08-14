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
          'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
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
}

export function StatusChip({
  className,
  variant,
  children,
  ...props
}: StatusChipProps) {
  return (
    <span className={cn(statusChipVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
