import { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { cn } from '@/lib/utils';

// Configure dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export interface TimeAgoProps {
  date: string | Date;
  className?: string;
  showAbsolute?: boolean;
  format?: string;
}

export function TimeAgo({
  date,
  className,
  showAbsolute = true,
  format = 'MMM D, YYYY',
}: TimeAgoProps) {
  const [showRelative, setShowRelative] = useState(true);

  const dayjsDate = dayjs(date).tz('Africa/Lagos');
  const relative = dayjsDate.fromNow();
  const absolute = dayjsDate.format(format);

  if (!showAbsolute) {
    return (
      <span
        className={cn('text-sm text-gray-600 dark:text-gray-400', className)}
      >
        {relative}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100',
        className
      )}
      onClick={() => setShowRelative(!showRelative)}
      title={showRelative ? absolute : relative}
    >
      {showRelative ? relative : absolute}
    </span>
  );
}
