// Utility functions for formatting dates and metrics
import { format } from 'date-fns';

/**
 * Formats a date in human-readable format
 * Requirements: 8.4
 */
export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

/**
 * Formats a date with time
 */
export function formatDateTime(date: Date): string {
  return format(date, 'MMM d, yyyy h:mm a');
}

/**
 * Formats duration in minutes to human-readable format
 * Requirements: 8.4
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Formats distance in kilometers
 * Requirements: 8.4
 */
export function formatDistance(kilometers: number): string {
  return `${kilometers.toFixed(2)} km`;
}

/**
 * Formats calories
 * Requirements: 8.4
 */
export function formatCalories(calories: number): string {
  return `${Math.round(calories)} cal`;
}

/**
 * Formats activity type for display
 */
export function formatActivityType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats a percentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}
