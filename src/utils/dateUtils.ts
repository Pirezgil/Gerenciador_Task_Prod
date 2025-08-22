/**
 * Utility functions for handling dates with proper timezone support
 */

/**
 * Get today's date in local timezone as YYYY-MM-DD string
 * This fixes the timezone bug where new Date().toISOString().split('T')[0]
 * returns wrong date in timezones with negative offset
 */
export function getTodayLocalString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert a Date object to local date string (YYYY-MM-DD)
 * without timezone issues
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get yesterday's date in local timezone as YYYY-MM-DD string
 */
export function getYesterdayLocalString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return toLocalDateString(yesterday);
}