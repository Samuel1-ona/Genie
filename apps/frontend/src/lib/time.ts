import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// Set default timezone to Africa/Lagos
const LAGOS_TIMEZONE = 'Africa/Lagos';

/**
 * Format timestamp to show both absolute and relative time
 * @param ts - Timestamp in milliseconds or ISO string
 * @returns Formatted string with absolute and relative time
 */
export function showAbsoluteAndRelative(ts: number | string): string {
  const date = dayjs(ts).tz(LAGOS_TIMEZONE);
  const now = dayjs().tz(LAGOS_TIMEZONE);

  const absolute = date.format('MMM DD, YYYY h:mm A');
  const relative = date.fromNow();

  return `${absolute} (${relative})`;
}

/**
 * Format timestamp to absolute time only
 * @param ts - Timestamp in milliseconds or ISO string
 * @returns Formatted absolute time string
 */
export function formatAbsolute(ts: number | string): string {
  return dayjs(ts).tz(LAGOS_TIMEZONE).format('MMM DD, YYYY h:mm A');
}

/**
 * Format timestamp to relative time only
 * @param ts - Timestamp in milliseconds or ISO string
 * @returns Formatted relative time string
 */
export function formatRelative(ts: number | string): string {
  return dayjs(ts).tz(LAGOS_TIMEZONE).fromNow();
}

/**
 * Format timestamp for table display (compact format)
 * @param ts - Timestamp in milliseconds or ISO string
 * @returns Compact formatted time string
 */
export function formatTableTime(ts: number | string): string {
  const date = dayjs(ts).tz(LAGOS_TIMEZONE);
  const now = dayjs().tz(LAGOS_TIMEZONE);

  // If same day, show time only
  if (date.isSame(now, 'day')) {
    return date.format('h:mm A');
  }

  // If same year, show date and time
  if (date.isSame(now, 'year')) {
    return date.format('MMM DD, h:mm A');
  }

  // Otherwise show full date
  return date.format('MMM DD, YYYY');
}

/**
 * Format timestamp for detailed display
 * @param ts - Timestamp in milliseconds or ISO string
 * @returns Detailed formatted time string
 */
export function formatDetailed(ts: number | string): string {
  return dayjs(ts).tz(LAGOS_TIMEZONE).format('MMMM DD, YYYY [at] h:mm A');
}

/**
 * Check if timestamp is recent (within last 24 hours)
 * @param ts - Timestamp in milliseconds or ISO string
 * @returns Boolean indicating if timestamp is recent
 */
export function isRecent(ts: number | string): boolean {
  const date = dayjs(ts).tz(LAGOS_TIMEZONE);
  const now = dayjs().tz(LAGOS_TIMEZONE);
  return now.diff(date, 'hour') < 24;
}

/**
 * Get time ago string (e.g., "2 hours ago", "3 days ago")
 * @param ts - Timestamp in milliseconds or ISO string
 * @returns Time ago string
 */
export function timeAgo(ts: number | string): string {
  return dayjs(ts).tz(LAGOS_TIMEZONE).fromNow();
}

/**
 * Format duration in milliseconds to human readable string
 * @param duration - Duration in milliseconds
 * @returns Human readable duration string
 */
export function formatDuration(duration: number): string {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Get current time in Lagos timezone
 * @returns Current time as dayjs object
 */
export function now(): dayjs.Dayjs {
  return dayjs().tz(LAGOS_TIMEZONE);
}

/**
 * Parse timestamp and return dayjs object in Lagos timezone
 * @param ts - Timestamp in milliseconds or ISO string
 * @returns Dayjs object in Lagos timezone
 */
export function parseTime(ts: number | string): dayjs.Dayjs {
  return dayjs(ts).tz(LAGOS_TIMEZONE);
}
