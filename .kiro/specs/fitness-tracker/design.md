# Design Document: Fitness Tracker

## Overview

The Fitness Tracker is designed as a modular system with clear separation between data models, business logic, storage, and user interface. The architecture follows a layered approach where the core domain logic is independent of storage and UI concerns, enabling testability and maintainability.

The system will support logging various types of physical activities, tracking progress toward user-defined goals, and providing analytics on fitness trends. Data persistence ensures that user activity history is preserved across sessions.

## Architecture

The system follows a three-layer architecture:

1. **Data Layer**: Handles data models, validation, and serialization
2. **Business Logic Layer**: Implements core functionality for activity management, goal tracking, and analytics
3. **Presentation Layer**: Provides user interface for interaction

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  (UI Components, Formatters)        │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│     Business Logic Layer            │
│  (Activity Manager, Goal Tracker,   │
│   Analytics Engine)                 │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         Data Layer                  │
│  (Models, Validation, Storage)      │
└─────────────────────────────────────┘
```

## Components and Interfaces

### Activity Model

Represents a single workout or exercise session.

```
class Activity:
  id: string (unique identifier)
  type: ActivityType (enum: running, cycling, swimming, walking, strength_training)
  date: DateTime
  duration: number (minutes, must be > 0)
  distance: number (kilometers, must be >= 0)
  calories: number (must be >= 0)
  
  validate() -> Result<void, ValidationError>
```

### Goal Model

Represents a fitness goal with target metrics.

```
class Goal:
  id: string (unique identifier)
  name: string
  target_metric: MetricType (enum: total_distance, total_duration, total_calories, workout_count)
  target_value: number (must be > 0)
  deadline: DateTime (must be in future at creation)
  created_at: DateTime
  
  validate() -> Result<void, ValidationError>
  calculate_progress(activities: List<Activity>) -> number (percentage 0-100)
  is_achieved(activities: List<Activity>) -> boolean
```

### Activity Manager

Handles CRUD operations for activities.

```
class ActivityManager:
  storage: Storage
  
  create_activity(activity_data: ActivityData) -> Result<Activity, Error>
  get_activity(id: string) -> Result<Activity, Error>
  get_all_activities() -> List<Activity>
  get_activities_by_type(type: ActivityType) -> List<Activity>
  get_activities_by_date_range(start: DateTime, end: DateTime) -> List<Activity>
  update_activity(id: string, activity_data: ActivityData) -> Result<Activity, Error>
  delete_activity(id: string) -> Result<void, Error>
```

### Goal Tracker

Manages fitness goals and progress calculation.

```
class GoalTracker:
  storage: Storage
  activity_manager: ActivityManager
  
  create_goal(goal_data: GoalData) -> Result<Goal, Error>
  get_goal(id: string) -> Result<Goal, Error>
  get_all_goals() -> List<Goal>
  update_goal(id: string, goal_data: GoalData) -> Result<Goal, Error>
  delete_goal(id: string) -> Result<void, Error>
  calculate_goal_progress(goal_id: string) -> Result<number, Error>
  check_goal_status(goal_id: string) -> Result<GoalStatus, Error>
```

### Analytics Engine

Computes statistics and trends from activity data.

```
class AnalyticsEngine:
  activity_manager: ActivityManager
  
  get_weekly_stats() -> Statistics
  get_monthly_stats() -> Statistics
  get_stats_by_period(start: DateTime, end: DateTime) -> Statistics
  get_stats_by_activity_type(type: ActivityType, start: DateTime, end: DateTime) -> Statistics
  calculate_average_duration() -> number
  
class Statistics:
  total_distance: number
  total_duration: number
  total_calories: number
  workout_count: number
  breakdown_by_type: Map<ActivityType, TypeStatistics>
```

### Storage Interface

Abstracts persistence mechanism for activities and goals.

```
interface Storage:
  save_activity(activity: Activity) -> Result<void, Error>
  load_activity(id: string) -> Result<Activity, Error>
  load_all_activities() -> Result<List<Activity>, Error>
  update_activity(activity: Activity) -> Result<void, Error>
  delete_activity(id: string) -> Result<void, Error>
  
  save_goal(goal: Goal) -> Result<void, Error>
  load_goal(id: string) -> Result<Goal, Error>
  load_all_goals() -> Result<List<Goal>, Error>
  update_goal(goal: Goal) -> Result<void, Error>
  delete_goal(id: string) -> Result<void, Error>
```

## Data Models

### Activity Data Structure

```
{
  "id": "uuid-string",
  "type": "running" | "cycling" | "swimming" | "walking" | "strength_training",
  "date": "ISO-8601 datetime",
  "duration": number (minutes),
  "distance": number (kilometers),
  "calories": number
}
```

### Goal Data Structure

```
{
  "id": "uuid-string",
  "name": "string",
  "target_metric": "total_distance" | "total_duration" | "total_calories" | "workout_count",
  "target_value": number,
  "deadline": "ISO-8601 datetime",
  "created_at": "ISO-8601 datetime"
}
```

### Validation Rules

Activities must satisfy:
- `duration > 0`
- `distance >= 0`
- `calories >= 0`
- `date` is a valid DateTime
- `type` is one of the supported ActivityType values

Goals must satisfy:
- `target_value > 0`
- `deadline > current_time` (at creation)
- `name` is non-empty
- `target_metric` is one of the supported MetricType values

### Storage Format

The system will use JSON for serialization:
- Activities stored in `activities.json` as an array
- Goals stored in `goals.json` as an array
- Each file is read entirely into memory on startup
- Each modification writes the entire file back to disk

