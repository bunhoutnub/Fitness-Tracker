// ActivityManager service for CRUD operations on activities
import type { Activity, ActivityData } from '../models/Activity';
import { ActivityType, createActivity, validateActivity } from '../models/Activity';
import type { Storage } from './Storage';

export interface ActivityManagerError {
  type: 'validation' | 'storage' | 'not_found';
  message: string;
}

export type ActivityManagerResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ActivityManagerError };

export class ActivityManager {
  constructor(private storage: Storage) {}

  /**
   * Creates a new activity with validation and storage
   * Requirements: 1.1, 1.2, 1.3, 1.4
   */
  async createActivity(data: ActivityData): Promise<ActivityManagerResult<Activity>> {
    // Validate
    const validation = validateActivity(data);
    if (!validation.success) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: validation.errors.map(e => `${e.field}: ${e.message}`).join(', '),
        },
      };
    }

    // Create activity
    const activity = createActivity(data);

    // Save to storage
    const saveResult = await this.storage.saveActivity(activity);
    if (!saveResult.success) {
      return {
        success: false,
        error: {
          type: 'storage',
          message: saveResult.error.message,
        },
      };
    }

    return { success: true, data: activity };
  }

  /**
   * Retrieves an activity by ID
   * Requirements: 6.2
   */
  async getActivity(id: string): Promise<ActivityManagerResult<Activity>> {
    const result = await this.storage.loadActivity(id);
    
    if (!result.success) {
      return {
        success: false,
        error: {
          type: 'not_found',
          message: `Activity with id ${id} not found`,
        },
      };
    }

    return { success: true, data: result.data };
  }

  /**
   * Retrieves all activities sorted by date (descending)
   * Requirements: 2.1
   */
  async getAllActivities(): Promise<ActivityManagerResult<Activity[]>> {
    const result = await this.storage.loadAllActivities();
    
    if (!result.success) {
      return {
        success: false,
        error: {
          type: 'storage',
          message: result.error.message,
        },
      };
    }

    // Sort by date descending (most recent first)
    const sorted = result.data.sort((a, b) => b.date.getTime() - a.date.getTime());

    return { success: true, data: sorted };
  }

  /**
   * Retrieves activities filtered by type
   * Requirements: 2.2
   */
  async getActivitiesByType(type: ActivityType): Promise<ActivityManagerResult<Activity[]>> {
    const result = await this.getAllActivities();
    
    if (!result.success) {
      return result;
    }

    const filtered = result.data.filter(activity => activity.type === type);

    return { success: true, data: filtered };
  }

  /**
   * Retrieves activities within a date range (inclusive)
   * Requirements: 2.3
   */
  async getActivitiesByDateRange(start: Date, end: Date): Promise<ActivityManagerResult<Activity[]>> {
    const result = await this.getAllActivities();
    
    if (!result.success) {
      return result;
    }

    const filtered = result.data.filter(activity => {
      const activityTime = activity.date.getTime();
      return activityTime >= start.getTime() && activityTime <= end.getTime();
    });

    return { success: true, data: filtered };
  }

  /**
   * Updates an existing activity with validation
   * Requirements: 6.1, 6.2
   */
  async updateActivity(id: string, data: ActivityData): Promise<ActivityManagerResult<Activity>> {
    // Check if activity exists
    const existingResult = await this.storage.loadActivity(id);
    if (!existingResult.success) {
      return {
        success: false,
        error: {
          type: 'not_found',
          message: `Activity with id ${id} not found`,
        },
      };
    }

    // Validate new data
    const validation = validateActivity(data);
    if (!validation.success) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: validation.errors.map(e => `${e.field}: ${e.message}`).join(', '),
        },
      };
    }

    // Create updated activity (keep same ID)
    const updatedActivity: Activity = {
      id,
      type: data.type,
      date: data.date,
      duration: data.duration,
      distance: data.distance,
      calories: data.calories,
    };

    // Save to storage
    const saveResult = await this.storage.updateActivity(updatedActivity);
    if (!saveResult.success) {
      return {
        success: false,
        error: {
          type: 'storage',
          message: saveResult.error.message,
        },
      };
    }

    return { success: true, data: updatedActivity };
  }

  /**
   * Deletes an activity
   * Requirements: 6.3
   */
  async deleteActivity(id: string): Promise<ActivityManagerResult<void>> {
    // Check if activity exists
    const existingResult = await this.storage.loadActivity(id);
    if (!existingResult.success) {
      return {
        success: false,
        error: {
          type: 'not_found',
          message: `Activity with id ${id} not found`,
        },
      };
    }

    // Delete from storage
    const deleteResult = await this.storage.deleteActivity(id);
    if (!deleteResult.success) {
      return {
        success: false,
        error: {
          type: 'storage',
          message: deleteResult.error.message,
        },
      };
    }

    return { success: true, data: undefined };
  }
}
