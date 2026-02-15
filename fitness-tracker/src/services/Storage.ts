// Storage interface for activities and goals
import type { Activity } from '../models/Activity';
import type { Goal } from '../models/Goal';

export interface StorageError {
  type: 'read' | 'write' | 'delete' | 'serialization';
  message: string;
  originalError?: unknown;
}

export type StorageResult<T> = 
  | { success: true; data: T }
  | { success: false; error: StorageError };

export interface Storage {
  // Activity operations
  saveActivity(activity: Activity): Promise<StorageResult<void>>;
  loadActivity(id: string): Promise<StorageResult<Activity>>;
  loadAllActivities(): Promise<StorageResult<Activity[]>>;
  updateActivity(activity: Activity): Promise<StorageResult<void>>;
  deleteActivity(id: string): Promise<StorageResult<void>>;

  // Goal operations
  saveGoal(goal: Goal): Promise<StorageResult<void>>;
  loadGoal(id: string): Promise<StorageResult<Goal>>;
  loadAllGoals(): Promise<StorageResult<Goal[]>>;
  updateGoal(goal: Goal): Promise<StorageResult<void>>;
  deleteGoal(id: string): Promise<StorageResult<void>>;
}
