// AnalyticsEngine service for calculating statistics and trends
import type { Activity, ActivityType } from '../models/Activity';
import type { ActivityManager } from './ActivityManager';

export interface Statistics {
  totalDistance: number;
  totalDuration: number;
  totalCalories: number;
  workoutCount: number;
  breakdownByType: Map<ActivityType, TypeStatistics>;
}

export interface TypeStatistics {
  totalDistance: number;
  totalDuration: number;
  totalCalories: number;
  workoutCount: number;
}

export class AnalyticsEngine {
  constructor(private activityManager: ActivityManager) {}

  /**
   * Gets weekly statistics (past 7 days)
   * Requirements: 4.1, 4.5
   */
  async getWeeklyStats(): Promise<Statistics> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.getStatsByPeriod(sevenDaysAgo, now);
  }

  /**
   * Gets monthly statistics (past 30 days)
   * Requirements: 4.2, 4.5
   */
  async getMonthlyStats(): Promise<Statistics> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return this.getStatsByPeriod(thirtyDaysAgo, now);
  }

  /**
   * Gets statistics for a custom date range
   * Requirements: 4.5
   */
  async getStatsByPeriod(start: Date, end: Date): Promise<Statistics> {
    const result = await this.activityManager.getActivitiesByDateRange(start, end);
    
    if (!result.success) {
      return this.emptyStatistics();
    }

    return this.calculateStatistics(result.data);
  }

  /**
   * Gets statistics for a specific activity type
   * Requirements: 4.3
   */
  async getStatsByActivityType(
    type: ActivityType,
    start: Date,
    end: Date
  ): Promise<TypeStatistics> {
    const result = await this.activityManager.getActivitiesByDateRange(start, end);
    
    if (!result.success) {
      return this.emptyTypeStatistics();
    }

    const filtered = result.data.filter(activity => activity.type === type);
    return this.calculateTypeStatistics(filtered);
  }

  /**
   * Calculates average workout duration
   * Requirements: 4.4
   */
  async calculateAverageDuration(): Promise<number> {
    const result = await this.activityManager.getAllActivities();
    
    if (!result.success || result.data.length === 0) {
      return 0;
    }

    const totalDuration = result.data.reduce((sum, activity) => sum + activity.duration, 0);
    return totalDuration / result.data.length;
  }

  /**
   * Calculates statistics from a list of activities
   */
  private calculateStatistics(activities: Activity[]): Statistics {
    const breakdownByType = new Map<ActivityType, TypeStatistics>();

    let totalDistance = 0;
    let totalDuration = 0;
    let totalCalories = 0;

    for (const activity of activities) {
      totalDistance += activity.distance;
      totalDuration += activity.duration;
      totalCalories += activity.calories;

      // Update type breakdown
      const existing = breakdownByType.get(activity.type) || this.emptyTypeStatistics();
      breakdownByType.set(activity.type, {
        totalDistance: existing.totalDistance + activity.distance,
        totalDuration: existing.totalDuration + activity.duration,
        totalCalories: existing.totalCalories + activity.calories,
        workoutCount: existing.workoutCount + 1,
      });
    }

    return {
      totalDistance,
      totalDuration,
      totalCalories,
      workoutCount: activities.length,
      breakdownByType,
    };
  }

  /**
   * Calculates type-specific statistics
   */
  private calculateTypeStatistics(activities: Activity[]): TypeStatistics {
    return {
      totalDistance: activities.reduce((sum, a) => sum + a.distance, 0),
      totalDuration: activities.reduce((sum, a) => sum + a.duration, 0),
      totalCalories: activities.reduce((sum, a) => sum + a.calories, 0),
      workoutCount: activities.length,
    };
  }

  private emptyStatistics(): Statistics {
    return {
      totalDistance: 0,
      totalDuration: 0,
      totalCalories: 0,
      workoutCount: 0,
      breakdownByType: new Map(),
    };
  }

  private emptyTypeStatistics(): TypeStatistics {
    return {
      totalDistance: 0,
      totalDuration: 0,
      totalCalories: 0,
      workoutCount: 0,
    };
  }
}
