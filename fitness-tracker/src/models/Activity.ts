// Activity model with validation

export enum ActivityType {
  Running = 'running',
  Cycling = 'cycling',
  Swimming = 'swimming',
  Walking = 'walking',
  StrengthTraining = 'strength_training',
}

export interface Activity {
  id: string;
  type: ActivityType;
  date: Date;
  duration: number; // minutes
  distance: number; // kilometers
  calories: number;
}

export interface ActivityData {
  type: ActivityType;
  date: Date;
  duration: number;
  distance: number;
  calories: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export type ValidationResult = 
  | { success: true }
  | { success: false; errors: ValidationError[] };

/**
 * Validates an activity's data
 * Requirements: 1.2, 1.4, 7.1, 7.2, 7.3, 7.4
 */
export function validateActivity(data: Partial<ActivityData>): ValidationResult {
  const errors: ValidationError[] = [];

  // Check required fields
  if (!data.type) {
    errors.push({ field: 'type', message: 'Activity type is required' });
  } else if (!Object.values(ActivityType).includes(data.type)) {
    errors.push({ field: 'type', message: 'Invalid activity type' });
  }

  if (!data.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  } else if (!(data.date instanceof Date) || isNaN(data.date.getTime())) {
    errors.push({ field: 'date', message: 'Date must be a valid date' });
  }

  if (data.duration === undefined || data.duration === null) {
    errors.push({ field: 'duration', message: 'Duration is required' });
  } else if (data.duration <= 0) {
    errors.push({ field: 'duration', message: 'Duration must be greater than zero' });
  }

  if (data.distance === undefined || data.distance === null) {
    errors.push({ field: 'distance', message: 'Distance is required' });
  } else if (data.distance < 0) {
    errors.push({ field: 'distance', message: 'Distance cannot be negative' });
  }

  if (data.calories === undefined || data.calories === null) {
    errors.push({ field: 'calories', message: 'Calories is required' });
  } else if (data.calories < 0) {
    errors.push({ field: 'calories', message: 'Calories cannot be negative' });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true };
}

/**
 * Creates a new activity with generated ID and timestamp
 * Requirements: 1.1, 1.5
 */
export function createActivity(data: ActivityData): Activity {
  const validation = validateActivity(data);
  
  if (!validation.success) {
    throw new Error(
      `Validation failed: ${validation.errors.map(e => `${e.field}: ${e.message}`).join(', ')}`
    );
  }

  return {
    id: crypto.randomUUID(),
    type: data.type,
    date: data.date,
    duration: data.duration,
    distance: data.distance,
    calories: data.calories,
  };
}
