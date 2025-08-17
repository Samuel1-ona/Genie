import { describe, it, expect } from 'vitest';
import {
  showAbsoluteAndRelative,
  formatAbsolute,
  formatRelative,
  formatTableTime,
  formatDetailed,
  isRecent,
  timeAgo,
  formatDuration,
  now,
  parseTime,
} from './time';

describe('Time Utilities', () => {
  const testTimestamp = 1735689600000; // 2025-01-01 00:00:00 UTC
  const testDate = new Date(testTimestamp);

  describe('showAbsoluteAndRelative', () => {
    it('should format timestamp with both absolute and relative time', () => {
      const result = showAbsoluteAndRelative(testTimestamp);
      expect(result).toContain('Jan 01, 2025');
      expect(result).toContain('(');
      expect(result).toContain(')');
    });

    it('should handle string timestamps', () => {
      const result = showAbsoluteAndRelative(testTimestamp.toString());
      expect(typeof result).toBe('string');
      expect(result).toContain('(');
      expect(result).toContain(')');
    });
  });

  describe('formatAbsolute', () => {
    it('should format timestamp as absolute time', () => {
      const result = formatAbsolute(testTimestamp);
      expect(result).toMatch(/^[A-Za-z]{3} \d{2}, \d{4} \d{1,2}:\d{2} [AP]M$/);
    });

    it('should handle string timestamps', () => {
      const result = formatAbsolute(testTimestamp.toString());
      expect(result).toMatch(/^[A-Za-z]{3} \d{2}, \d{4} \d{1,2}:\d{2} [AP]M$/);
    });
  });

  describe('formatRelative', () => {
    it('should format timestamp as relative time', () => {
      const result = formatRelative(testTimestamp);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatTableTime', () => {
    it('should format timestamp for table display', () => {
      const result = formatTableTime(testTimestamp);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle recent dates differently', () => {
      const recentTimestamp = Date.now() - 1000 * 60 * 60; // 1 hour ago
      const result = formatTableTime(recentTimestamp);
      expect(result).toMatch(/^\d{1,2}:\d{2} [AP]M$/);
    });
  });

  describe('formatDetailed', () => {
    it('should format timestamp with detailed information', () => {
      const result = formatDetailed(testTimestamp);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('isRecent', () => {
    it('should return true for recent timestamps', () => {
      const recentTimestamp = Date.now() - 1000 * 60 * 60; // 1 hour ago
      expect(isRecent(recentTimestamp)).toBe(true);
    });

    it('should return false for old timestamps', () => {
      expect(isRecent(testTimestamp)).toBe(false);
    });
  });

  describe('timeAgo', () => {
    it('should return relative time string', () => {
      const result = timeAgo(testTimestamp);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatDuration', () => {
    it('should format duration in milliseconds', () => {
      const oneHour = 1000 * 60 * 60;
      const result = formatDuration(oneHour);
      expect(result).toBe('1h 0m 0s');
    });

    it('should format duration with days', () => {
      const twoDays = 1000 * 60 * 60 * 24 * 2;
      const result = formatDuration(twoDays);
      expect(result).toBe('2d 0h 0m');
    });

    it('should format duration with minutes only', () => {
      const thirtyMinutes = 1000 * 60 * 30;
      const result = formatDuration(thirtyMinutes);
      expect(result).toBe('30m 0s');
    });
  });

  describe('now', () => {
    it('should return current time in Lagos timezone', () => {
      const result = now();
      expect(result).toBeDefined();
      expect(typeof result.format).toBe('function');
    });
  });

  describe('parseTime', () => {
    it('should parse timestamp to dayjs object', () => {
      const result = parseTime(testTimestamp);
      expect(result).toBeDefined();
      expect(typeof result.format).toBe('function');
    });

    it('should handle string timestamps', () => {
      const result = parseTime(testTimestamp.toString());
      expect(result).toBeDefined();
      expect(typeof result.format).toBe('function');
    });
  });
});
