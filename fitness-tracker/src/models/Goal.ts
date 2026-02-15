// Goal model with validation

export enum MetricType {
  TotalDistance = 'total_distance',
  TotalDuration = 'total_duration',
  TotalCalories = 'total_calories',
  WorkoutCount = 'workout_count',
}

export interface Goal {
  id: string;
  name: string;
  targetMetric: MetricType;
  targetValue: number;
  deadline: Date;
  createdAt: Date;
}

export interface GoalData {
  name: string;
  targetMetric: MetricType;
  targetValue: number;
  deadline: Date;
}

export interface ValidationError {
  field: string;
  message: string;
}

export type ValidationResult = 
  | { success: true }
  | { success: false; errors: ValidationError[] };

/**
 * Validates a goal's data
 * Requirements: 3.2, 3.3
 */
export function validateGoal(data: Partial<GoalData>): ValidationResult {
  const errors: ValidationError[] = [];

  // Check required fields
  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Goal name is required' });
  }

  if (!data.targetMetric) {
    errors.push({ field: 'targetMetric', message: 'Target metric is required' });
  } else if (!Object.values(MetricType).includes(data.targetMetric)) {
    errors.push({ field: 'targetMetric', message: 'Invalid target metric' });
  }

  if (data.targetValue === undefined || data.targetValue === null) {
    errors.push({ field: 'targetValue', message: 'Target value is required' });
  } else if (data.targetValue <= 0) {
    errors.push({ field: 'targetValue', message: 'Target value must be greater than zero' });
  }

  if (!data.deadline) {
    errors.push({ field: 'deadline', message: 'Deadline is required' });
  } else if (!(data.deadline instanceof Date) || isNaN(data.deadline.getTime())) {
    errors.push({ field: 'deadline', message: 'Deadline must be a valid date' });
  } else if (data.deadline <= new Date()) {
    errors.push({ field: 'deadline', message: 'Deadline must be in the future' });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true };
}

/**
 * Creates a new goal with generated ID and creation timestamp
 * Requirements: 3.1
 */
export function createGoal(data: GoalData): Goal {
  const validation = validateGoal(data);
  
  if (!validation.success) {
    throw new Error(
      `Validation failed: ${validation.errors.map(e => `${e.field}: ${e.message}`).join(', ')}`
    );
  }

  return {
    id: crypto.randomUUID(),
    name: data.name,
    targetMetric: data.targetMetric,
    targetValue: data.targetValue,
    deadline: data.deadline,
    createdAt: new Date(),
  };
}
