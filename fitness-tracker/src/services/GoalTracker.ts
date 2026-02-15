// GoalTracker service for goal management and progress calculation
import type { Goal, GoalData } from '../models/Goal';
import { MetricType, createGoal, validateGoal } from '../models/Goal';
import type { Storage } from './Storage';
import type { ActivityManager } from './ActivityManager';

export type GoalStatus = 'active' | 'completed' | 'missed';

export interface GoalProgress {
  goal: Goal;
  currentValue: number;
  targetValue: number;
  percentage: number;
  status: GoalStatus;
}

export interface GoalTrackerError {
  type: 'validation' | 'storage' | 'not_found';
  message: string;
}

export type GoalTrackerResult<T> = 
  | { success: true; data: T }
  | { success: false; error: GoalTrackerError };

export class GoalTracker {
  constructor(
    private storage: Storage,
    private activityManager: ActivityManager
  ) {}

  /**
   * Creates a new goal with validation and storage
   * Requirements: 3.1, 3.2, 3.3
   */
  async createGoal(data: GoalData): Promise<GoalTrackerResult<Goal>> {
    // Validate
    const validation = validateGoal(data);
    if (!validation.success) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: validation.errors.map(e => `${e.field}: ${e.message}`).join(', '),
        },
      };
    }

    // Create goal
    const goal = createGoal(data);

    // Save to storage
    const saveResult = await this.storage.saveGoal(goal);
    if (!saveResult.success) {
      return {
        success: false,
        error: {
          type: 'storage',
          message: saveResult.error.message,
        },
      };
    }

    return { success: true, data: goal };
  }

  /**
   * Retrieves a goal by ID
   */
  async getGoal(id: string): Promise<GoalTrackerResult<Goal>> {
    const result = await this.storage.loadGoal(id);
    
    if (!result.success) {
      return {
        success: false,
        error: {
          type: 'not_found',
          message: `Goal with id ${id} not found`,
        },
      };
    }

    return { success: true, data: result.data };
  }

  /**
   * Retrieves all goals
   */
  async getAllGoals(): Promise<GoalTrackerResult<Goal[]>> {
    const result = await this.storage.loadAllGoals();
    
    if (!result.success) {
      return {
        success: false,
        error: {
          type: 'storage',
          message: result.error.message,
        },
      };
    }

    return { success: true, data: result.data };
  }

  /**
   * Updates an existing goal with validation
   */
  async updateGoal(id: string, data: GoalData): Promise<GoalTrackerResult<Goal>> {
    // Check if goal exists
    const existingResult = await this.storage.loadGoal(id);
    if (!existingResult.success) {
      return {
        success: false,
        error: {
          type: 'not_found',
          message: `Goal with id ${id} not found`,
        },
      };
    }

    // Validate new data
    const validation = validateGoal(data);
    if (!validation.success) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: validation.errors.map(e => `${e.field}: ${e.message}`).join(', '),
        },
      };
    }

    // Create updated goal (keep same ID and createdAt)
    const updatedGoal: Goal = {
      id,
      name: data.name,
      targetMetric: data.targetMetric,
      targetValue: data.targetValue,
      deadline: data.deadline,
      createdAt: existingResult.data.createdAt,
    };

    // Save to storage
    const saveResult = await this.storage.updateGoal(updatedGoal);
    if (!saveResult.success) {
      return {
        success: false,
        error: {
          type: 'storage',
          message: saveResult.error.message,
        },
      };
    }

    return { success: true, data: updatedGoal };
  }

  /**
   * Deletes a goal
   */
  async deleteGoal(id: string): Promise<GoalTrackerResult<void>> {
    // Check if goal exists
    const existingResult = await this.storage.loadGoal(id);
    if (!existingResult.success) {
      return {
        success: false,
        error: {
          type: 'not_found',
          message: `Goal with id ${id} not found`,
        },
      };
    }

    // Delete from storage
    const deleteResult = await this.storage.deleteGoal(id);
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

  /**
   * Calculates progress for a goal based on logged activities
   * Requirements: 3.4
   */
  async calculateGoalProgress(goalId: string): Promise<GoalTrackerResult<number>> {
    // Get the goal
    const goalResult = await this.getGoal(goalId);
    if (!goalResult.success) {
      return goalResult;
    }

    const goal = goalResult.data;

    // Get all activities from goal creation to deadline
    const activitiesResult = await this.activityManager.getActivitiesByDateRange(
      goal.createdAt,
      goal.deadline
    );

    if (!activitiesResult.success) {
      return {
        success: false,
        error: {
          type: 'storage',
          message: 'Failed to load activities for progress calculation',
        },
      };
    }

    const activities = activitiesResult.data;

    // Calculate current value based on target metric
    let currentValue = 0;

    switch (goal.targetMetric) {
      case MetricType.TotalDistance:
        currentValue = activities.reduce((sum, activity) => sum + activity.distance, 0);
        break;
      case MetricType.TotalDuration:
        currentValue = activities.reduce((sum, activity) => sum + activity.duration, 0);
        break;
      case MetricType.TotalCalories:
        currentValue = activities.reduce((sum, activity) => sum + activity.calories, 0);
        break;
      case MetricType.WorkoutCount:
        currentValue = activities.length;
        break;
    }

    // Calculate percentage (capped at 100)
    const percentage = Math.min(100, (currentValue / goal.targetValue) * 100);

    return { success: true, data: percentage };
  }

  /**
   * Checks the status of a goal (active, completed, or missed)
   * Requirements: 3.5
   */
  async checkGoalStatus(goalId: string): Promise<GoalTrackerResult<GoalStatus>> {
    // Get the goal
    const goalResult = await this.getGoal(goalId);
    if (!goalResult.success) {
      return goalResult;
    }

    const goal = goalResult.data;
    const now = new Date();

    // Get progress
    const progressResult = await this.calculateGoalProgress(goalId);
    if (!progressResult.success) {
      return {
        success: false,
        error: progressResult.error,
      };
    }

    const progress = progressResult.data;

    // Determine status
    let status: GoalStatus;

    if (goal.deadline <= now) {
      // Deadline has passed
      status = progress >= 100 ? 'completed' : 'missed';
    } else {
      // Deadline is in the future
      status = progress >= 100 ? 'completed' : 'active';
    }

    return { success: true, data: status };
  }

  /**
   * Gets goal progress with all details
   * Requirements: 3.4, 3.5
   */
  async getGoalProgress(goalId: string): Promise<GoalTrackerResult<GoalProgress>> {
    // Get the goal
    const goalResult = await this.getGoal(goalId);
    if (!goalResult.success) {
      return goalResult;
    }

    const goal = goalResult.data;

    // Get progress percentage
    const progressResult = await this.calculateGoalProgress(goalId);
    if (!progressResult.success) {
      return {
        success: false,
        error: progressResult.error,
      };
    }

    const percentage = progressResult.data;

    // Get status
    const statusResult = await this.checkGoalStatus(goalId);
    if (!statusResult.success) {
      return {
        success: false,
        error: statusResult.error,
      };
    }

    const status = statusResult.data;

    // Calculate current value
    const activitiesResult = await this.activityManager.getActivitiesByDateRange(
      goal.createdAt,
      goal.deadline
    );

    if (!activitiesResult.success) {
      return {
        success: false,
        error: {
          type: 'storage',
          message: 'Failed to load activities for progress calculation',
        },
      };
    }

    const activities = activitiesResult.data;
    let currentValue = 0;

    switch (goal.targetMetric) {
      case MetricType.TotalDistance:
        currentValue = activities.reduce((sum, activity) => sum + activity.distance, 0);
        break;
      case MetricType.TotalDuration:
        currentValue = activities.reduce((sum, activity) => sum + activity.duration, 0);
        break;
      case MetricType.TotalCalories:
        currentValue = activities.reduce((sum, activity) => sum + activity.calories, 0);
        break;
      case MetricType.WorkoutCount:
        currentValue = activities.length;
        break;
    }

    return {
      success: true,
      data: {
        goal,
        currentValue,
        targetValue: goal.targetValue,
        percentage,
        status,
      },
    };
  }
}
