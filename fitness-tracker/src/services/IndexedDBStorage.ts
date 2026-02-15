// IndexedDB storage implementation with localStorage fallback
import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Activity } from '../models/Activity';
import { ActivityType } from '../models/Activity';
import type { Goal } from '../models/Goal';
import { MetricType } from '../models/Goal';
import type { Storage, StorageResult, StorageError } from './Storage';

interface FitnessTrackerDB extends DBSchema {
  activities: {
    key: string;
    value: {
      id: string;
      type: ActivityType;
      date: string; // ISO string for serialization
      duration: number;
      distance: number;
      calories: number;
    };
    indexes: { 'by-date': string; 'by-type': ActivityType };
  };
  goals: {
    key: string;
    value: {
      id: string;
      name: string;
      targetMetric: MetricType;
      targetValue: number;
      deadline: string; // ISO string
      createdAt: string; // ISO string
    };
    indexes: { 'by-deadline': string };
  };
}

const DB_NAME = 'fitness-tracker-db';
const DB_VERSION = 1;

export class IndexedDBStorage implements Storage {
  private db: IDBPDatabase<FitnessTrackerDB> | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.db = await openDB<FitnessTrackerDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create activities store
          if (!db.objectStoreNames.contains('activities')) {
            const activityStore = db.createObjectStore('activities', { keyPath: 'id' });
            activityStore.createIndex('by-date', 'date');
            activityStore.createIndex('by-type', 'type');
          }

          // Create goals store
          if (!db.objectStoreNames.contains('goals')) {
            const goalStore = db.createObjectStore('goals', { keyPath: 'id' });
            goalStore.createIndex('by-deadline', 'deadline');
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      // Fallback will be handled in individual methods
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  private createError(type: StorageError['type'], message: string, error?: unknown): StorageError {
    return { type, message, originalError: error };
  }

  // Activity serialization
  private serializeActivity(activity: Activity) {
    return {
      id: activity.id,
      type: activity.type,
      date: activity.date.toISOString(),
      duration: activity.duration,
      distance: activity.distance,
      calories: activity.calories,
    };
  }

  private deserializeActivity(data: FitnessTrackerDB['activities']['value']): Activity {
    return {
      id: data.id,
      type: data.type,
      date: new Date(data.date),
      duration: data.duration,
      distance: data.distance,
      calories: data.calories,
    };
  }

  // Goal serialization
  private serializeGoal(goal: Goal) {
    return {
      id: goal.id,
      name: goal.name,
      targetMetric: goal.targetMetric,
      targetValue: goal.targetValue,
      deadline: goal.deadline.toISOString(),
      createdAt: goal.createdAt.toISOString(),
    };
  }

  private deserializeGoal(data: FitnessTrackerDB['goals']['value']): Goal {
    return {
      id: data.id,
      name: data.name,
      targetMetric: data.targetMetric,
      targetValue: data.targetValue,
      deadline: new Date(data.deadline),
      createdAt: new Date(data.createdAt),
    };
  }

  // Activity operations
  async saveActivity(activity: Activity): Promise<StorageResult<void>> {
    try {
      await this.ensureInitialized();
      
      if (!this.db) {
        return this.fallbackSaveActivity(activity);
      }

      const serialized = this.serializeActivity(activity);
      await this.db.put('activities', serialized);
      
      return { success: true, data: undefined };
    } catch (error) {
      console.error('Error saving activity:', error);
      return {
        success: false,
        error: this.createError('write', 'Failed to save activity', error),
      };
    }
  }

  async loadActivity(id: string): Promise<StorageResult<Activity>> {
    try {
      await this.ensureInitialized();
      
      if (!this.db) {
        return this.fallbackLoadActivity(id);
      }

      const data = await this.db.get('activities', id);
      
      if (!data) {
        return {
          success: false,
          error: this.createError('read', `Activity with id ${id} not found`),
        };
      }

      return { success: true, data: this.deserializeActivity(data) };
    } catch (error) {
      console.error('Error loading activity:', error);
      return {
        success: false,
        error: this.createError('read', 'Failed to load activity', error),
      };
    }
  }

  async loadAllActivities(): Promise<StorageResult<Activity[]>> {
    try {
      await this.ensureInitialized();
      
      if (!this.db) {
        return this.fallbackLoadAllActivities();
      }

      const data = await this.db.getAll('activities');
      const activities = data.map(d => this.deserializeActivity(d));
      
      return { success: true, data: activities };
    } catch (error) {
      console.error('Error loading activities:', error);
      return {
        success: false,
        error: this.createError('read', 'Failed to load activities', error),
      };
    }
  }

  async updateActivity(activity: Activity): Promise<StorageResult<void>> {
    return this.saveActivity(activity); // Same as save for IndexedDB
  }

  async deleteActivity(id: string): Promise<StorageResult<void>> {
    try {
      await this.ensureInitialized();
      
      if (!this.db) {
        return this.fallbackDeleteActivity(id);
      }

      await this.db.delete('activities', id);
      
      return { success: true, data: undefined };
    } catch (error) {
      console.error('Error deleting activity:', error);
      return {
        success: false,
        error: this.createError('delete', 'Failed to delete activity', error),
      };
    }
  }

  // Goal operations
  async saveGoal(goal: Goal): Promise<StorageResult<void>> {
    try {
      await this.ensureInitialized();
      
      if (!this.db) {
        return this.fallbackSaveGoal(goal);
      }

      const serialized = this.serializeGoal(goal);
      await this.db.put('goals', serialized);
      
      return { success: true, data: undefined };
    } catch (error) {
      console.error('Error saving goal:', error);
      return {
        success: false,
        error: this.createError('write', 'Failed to save goal', error),
      };
    }
  }

  async loadGoal(id: string): Promise<StorageResult<Goal>> {
    try {
      await this.ensureInitialized();
      
      if (!this.db) {
        return this.fallbackLoadGoal(id);
      }

      const data = await this.db.get('goals', id);
      
      if (!data) {
        return {
          success: false,
          error: this.createError('read', `Goal with id ${id} not found`),
        };
      }

      return { success: true, data: this.deserializeGoal(data) };
    } catch (error) {
      console.error('Error loading goal:', error);
      return {
        success: false,
        error: this.createError('read', 'Failed to load goal', error),
      };
    }
  }

  async loadAllGoals(): Promise<StorageResult<Goal[]>> {
    try {
      await this.ensureInitialized();
      
      if (!this.db) {
        return this.fallbackLoadAllGoals();
      }

      const data = await this.db.getAll('goals');
      const goals = data.map(d => this.deserializeGoal(d));
      
      return { success: true, data: goals };
    } catch (error) {
      console.error('Error loading goals:', error);
      return {
        success: false,
        error: this.createError('read', 'Failed to load goals', error),
      };
    }
  }

  async updateGoal(goal: Goal): Promise<StorageResult<void>> {
    return this.saveGoal(goal); // Same as save for IndexedDB
  }

  async deleteGoal(id: string): Promise<StorageResult<void>> {
    try {
      await this.ensureInitialized();
      
      if (!this.db) {
        return this.fallbackDeleteGoal(id);
      }

      await this.db.delete('goals', id);
      
      return { success: true, data: undefined };
    } catch (error) {
      console.error('Error deleting goal:', error);
      return {
        success: false,
        error: this.createError('delete', 'Failed to delete goal', error),
      };
    }
  }

  // localStorage fallback methods
  private fallbackSaveActivity(activity: Activity): StorageResult<void> {
    try {
      const activities = this.getFromLocalStorage<Activity[]>('activities', []);
      const index = activities.findIndex(a => a.id === activity.id);
      
      if (index >= 0) {
        activities[index] = activity;
      } else {
        activities.push(activity);
      }
      
      localStorage.setItem('activities', JSON.stringify(activities));
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: this.createError('write', 'Failed to save activity to localStorage', error),
      };
    }
  }

  private fallbackLoadActivity(id: string): StorageResult<Activity> {
    try {
      const activities = this.getFromLocalStorage<Activity[]>('activities', []);
      const activity = activities.find(a => a.id === id);
      
      if (!activity) {
        return {
          success: false,
          error: this.createError('read', `Activity with id ${id} not found`),
        };
      }
      
      return { success: true, data: activity };
    } catch (error) {
      return {
        success: false,
        error: this.createError('read', 'Failed to load activity from localStorage', error),
      };
    }
  }

  private fallbackLoadAllActivities(): StorageResult<Activity[]> {
    try {
      const activities = this.getFromLocalStorage<Activity[]>('activities', []);
      return { success: true, data: activities };
    } catch (error) {
      return {
        success: false,
        error: this.createError('read', 'Failed to load activities from localStorage', error),
      };
    }
  }

  private fallbackDeleteActivity(id: string): StorageResult<void> {
    try {
      const activities = this.getFromLocalStorage<Activity[]>('activities', []);
      const filtered = activities.filter(a => a.id !== id);
      localStorage.setItem('activities', JSON.stringify(filtered));
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: this.createError('delete', 'Failed to delete activity from localStorage', error),
      };
    }
  }

  private fallbackSaveGoal(goal: Goal): StorageResult<void> {
    try {
      const goals = this.getFromLocalStorage<Goal[]>('goals', []);
      const index = goals.findIndex(g => g.id === goal.id);
      
      if (index >= 0) {
        goals[index] = goal;
      } else {
        goals.push(goal);
      }
      
      localStorage.setItem('goals', JSON.stringify(goals));
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: this.createError('write', 'Failed to save goal to localStorage', error),
      };
    }
  }

  private fallbackLoadGoal(id: string): StorageResult<Goal> {
    try {
      const goals = this.getFromLocalStorage<Goal[]>('goals', []);
      const goal = goals.find(g => g.id === id);
      
      if (!goal) {
        return {
          success: false,
          error: this.createError('read', `Goal with id ${id} not found`),
        };
      }
      
      return { success: true, data: goal };
    } catch (error) {
      return {
        success: false,
        error: this.createError('read', 'Failed to load goal from localStorage', error),
      };
    }
  }

  private fallbackLoadAllGoals(): StorageResult<Goal[]> {
    try {
      const goals = this.getFromLocalStorage<Goal[]>('goals', []);
      return { success: true, data: goals };
    } catch (error) {
      return {
        success: false,
        error: this.createError('read', 'Failed to load goals from localStorage', error),
      };
    }
  }

  private fallbackDeleteGoal(id: string): StorageResult<void> {
    try {
      const goals = this.getFromLocalStorage<Goal[]>('goals', []);
      const filtered = goals.filter(g => g.id !== id);
      localStorage.setItem('goals', JSON.stringify(filtered));
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: this.createError('delete', 'Failed to delete goal from localStorage', error),
      };
    }
  }

  private getFromLocalStorage<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    try {
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }
}
