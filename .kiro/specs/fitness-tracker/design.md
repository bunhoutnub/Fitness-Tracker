# Design Document: Fitness Tracker

## Overview

The Fitness Tracker is designed as a Progressive Web App (PWA) with a modular architecture featuring clear separation between data models, business logic, storage, and user interface. The architecture follows a layered approach where the core domain logic is independent of storage and UI concerns, enabling testability and maintainability.

The system will support logging various types of physical activities, tracking progress toward user-defined goals, and providing analytics on fitness trends. As a PWA, the application will work in web browsers, support offline functionality through service workers, and can be installed to device home screens for a native-like experience. Data persistence uses browser storage APIs to ensure that user activity history is preserved across sessions.

## Architecture

The system follows a four-layer PWA architecture:

1. **Service Worker Layer**: Handles offline functionality, caching, and background sync
2. **Presentation Layer**: React components for user interface
3. **Business Logic Layer**: Core functionality for activity management, goal tracking, and analytics
4. **Data Layer**: Data models, validation, and browser storage

```
┌─────────────────────────────────────┐
│      Service Worker Layer           │
│  (Offline Support, Caching,         │
│   Background Sync)                  │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  (React Components, Routing)        │
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
│  (Models, Validation, Browser       │
│   Storage: localStorage/IndexedDB)  │
└─────────────────────────────────────┘
```

### PWA Features

**Offline Support:**
- Service worker caches app shell and static assets
- Background sync queues data changes when offline
- Offline indicator in UI

**Installability:**
- Web app manifest enables "Add to Home Screen"
- Standalone display mode for native-like experience
- Custom app icons and splash screens

**Responsive Design:**
- Mobile-first CSS with responsive breakpoints
- Touch-friendly UI elements
- Optimized for various screen sizes

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

Abstracts persistence mechanism for activities and goals using browser storage APIs.

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

class BrowserStorage implements Storage:
  // Uses localStorage for simple key-value storage
  // Uses IndexedDB for complex queries and large datasets
  // Provides fallback mechanism if storage is unavailable
```

### Service Worker

Manages offline functionality and caching strategy.

```
class ServiceWorkerManager:
  register() -> Promise<void>
  cache_app_shell() -> Promise<void>
  handle_fetch(request: Request) -> Promise<Response>
  sync_data() -> Promise<void>
  
  // Caching strategy: Cache-first for static assets, Network-first for API calls
  // Background sync for queued data changes when coming back online
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

The system will use browser storage APIs with a hybrid approach:

**localStorage** (for simple data):
- Small configuration values
- User preferences
- Last sync timestamp

**IndexedDB** (for structured data):
- Activities stored in `activities` object store with indexes on `date` and `type`
- Goals stored in `goals` object store with index on `deadline`
- Supports efficient querying by date range and activity type
- Transactional operations ensure data consistency

**Storage Strategy:**
```javascript
// IndexedDB Schema
Database: fitness-tracker-db
Version: 1

ObjectStore: activities
  - keyPath: id
  - indexes: 
    - date (for date range queries)
    - type (for filtering by activity type)

ObjectStore: goals
  - keyPath: id
  - indexes:
    - deadline (for status checking)
```

**Fallback Mechanism:**
- If IndexedDB is unavailable, fall back to localStorage with JSON serialization
- If localStorage is unavailable, use in-memory storage with warning to user


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Activity Creation with Valid Data

*For any* valid activity data (with positive duration, non-negative distance and calories, valid date, and supported activity type), creating an activity should result in a new activity record with all provided fields plus a generated ID and timestamp.

**Validates: Requirements 1.1, 1.5**

### Property 2: Input Validation Rejects Invalid Data

*For any* activity data with invalid fields (duration ≤ 0, negative distance, negative calories, or invalid date), the system should reject the activity creation and return a validation error.

**Validates: Requirements 1.2, 1.4, 7.1, 7.2, 7.3, 7.4**

### Property 3: Validation Error Messages Are Descriptive

*For any* validation failure, the error message should contain both the field name that failed validation and the reason for the failure.

**Validates: Requirements 7.5**

### Property 4: Activity Persistence Round-Trip

*For any* valid activity, saving it to storage and then loading it back should produce an equivalent activity with all fields preserved.

**Validates: Requirements 1.3, 5.1, 6.2**

### Property 5: Activity Retrieval Sorted by Date

*For any* collection of activities, retrieving the activity history should return all activities sorted by date in descending order (most recent first).

**Validates: Requirements 2.1**

### Property 6: Activity Type Filtering

*For any* collection of activities and any activity type, filtering by that type should return only activities matching that type, and all returned activities should have the specified type.

**Validates: Requirements 2.2**

### Property 7: Date Range Filtering

*For any* collection of activities and any date range (start, end), filtering by that range should return only activities where the activity date falls within [start, end], inclusive.

**Validates: Requirements 2.3**

### Property 8: Activity Display Contains Required Fields

*For any* activity, the serialized or displayed representation should contain all required fields: id, type, date, duration, distance, and calories.

**Validates: Requirements 2.4**

### Property 9: Goal Creation with Valid Data

*For any* valid goal data (with positive target value, future deadline, non-empty name, and valid target metric), creating a goal should result in a new goal record with all provided fields plus a generated ID and creation timestamp.

**Validates: Requirements 3.1**

### Property 10: Goal Deadline Validation

*For any* goal with a deadline in the past or present (at creation time), the system should reject the goal creation and return a validation error.

**Validates: Requirements 3.2**

### Property 11: Goal Target Value Validation

*For any* goal with a target value ≤ 0, the system should reject the goal creation and return a validation error.

**Validates: Requirements 3.3**

### Property 12: Goal Progress Calculation

*For any* goal and collection of activities, the calculated progress should be a percentage between 0 and 100, and should accurately reflect the sum of relevant activities toward the goal's target metric.

**Validates: Requirements 3.4**

### Property 13: Goal Status Determination

*For any* goal with a deadline in the past, the goal status should be "completed" if progress ≥ 100%, otherwise "missed".

**Validates: Requirements 3.5**

### Property 14: Goal Persistence Round-Trip

*For any* valid goal, saving it to storage and then loading it back should produce an equivalent goal with all fields preserved.

**Validates: Requirements 5.3**

### Property 15: Time-Based Statistics Aggregation

*For any* collection of activities and any time period, calculating statistics for that period should return totals (distance, duration, calories, workout count) that equal the sum of all activities within that period.

**Validates: Requirements 4.1, 4.2, 4.5**

### Property 16: Statistics Grouped by Activity Type

*For any* collection of activities, statistics grouped by type should include all activity types present in the collection, and the sum of all type-specific totals should equal the overall totals.

**Validates: Requirements 4.3**

### Property 17: Average Duration Calculation

*For any* non-empty collection of activities, the average duration should equal the sum of all durations divided by the number of activities.

**Validates: Requirements 4.4**

### Property 18: Activity Update Validation

*For any* activity update, the validation rules applied should be identical to those used during activity creation (positive duration, non-negative distance and calories, valid date).

**Validates: Requirements 6.1**

### Property 19: Activity Deletion Removes Record

*For any* activity, after deletion, attempting to retrieve that activity by ID should return an error indicating the activity does not exist.

**Validates: Requirements 6.3**

### Property 20: Activity Deletion Updates Goal Progress

*For any* goal and activity that contributes to that goal, deleting the activity should result in the goal's progress being recalculated to reflect the removal of that activity's contribution.

**Validates: Requirements 6.4**

### Property 21: Data Loading on Startup

*For any* collection of activities and goals saved to storage, restarting the system should result in all previously saved activities and goals being loaded and available.

**Validates: Requirements 5.2**

### Property 22: Date Formatting is Human-Readable

*For any* date value, the formatted output should match a human-readable pattern (e.g., "Jan 15, 2024" or "2024-01-15") and should be parseable back to the original date.

**Validates: Requirements 8.4**

## Error Handling

The system implements comprehensive error handling across all layers:

### Validation Errors

- **Invalid Input**: When user input fails validation (negative duration, invalid date, etc.), the system returns a `ValidationError` with a descriptive message indicating the field and reason
- **Missing Required Fields**: When required fields are missing, the system returns a `ValidationError` listing all missing fields
- **Type Mismatches**: When data types don't match expected types, the system returns a `ValidationError` with type information

### Storage Errors

- **Write Failures**: If storage write operations fail (disk full, permissions, etc.), the system logs the error and returns a `StorageError` to the caller
- **Read Failures**: If storage read operations fail (file not found, corrupted data), the system logs the error and returns a `StorageError`
- **Serialization Errors**: If JSON serialization/deserialization fails, the system logs the error and returns a `SerializationError`
- **User Notification**: All storage errors trigger user notifications through the UI layer

### Business Logic Errors

- **Not Found**: When attempting to retrieve, update, or delete a non-existent activity or goal, the system returns a `NotFoundError` with the entity type and ID
- **Invalid State**: When operations are attempted on entities in invalid states (e.g., updating a deleted activity), the system returns a `InvalidStateError`

### Error Propagation

- Errors are propagated up through layers using Result types: `Result<T, Error>`
- Each layer can add context to errors before propagating
- The presentation layer translates errors into user-friendly messages
- All errors are logged with appropriate severity levels

### Recovery Strategies

- **Transient Failures**: Storage operations implement retry logic for transient failures
- **Data Corruption**: If data files are corrupted, the system attempts to recover from backup or creates new empty files
- **Partial Failures**: Batch operations continue processing remaining items after individual failures, collecting all errors

## Testing Strategy

The fitness tracker will employ a dual testing approach combining unit tests and property-based tests to ensure comprehensive coverage and correctness.

### Property-Based Testing

Property-based testing will be the primary method for validating the correctness properties defined in this document. We will use **fast-check** (for JavaScript/TypeScript) as the property-based testing library.

**Configuration:**
- Each property test will run a minimum of 100 iterations
- Each test will be tagged with a comment referencing its design property
- Tag format: `// Feature: fitness-tracker-app, Property N: [property description]`

**Property Test Coverage:**
- All 22 correctness properties defined above will be implemented as property-based tests
- Each property test will generate random valid inputs to verify the property holds universally
- Property tests will focus on invariants, round-trip properties, and mathematical relationships

**Example Property Test Structure:**
```javascript
// Feature: fitness-tracker-app, Property 4: Activity Persistence Round-Trip
test('activity persistence round-trip', () => {
  fc.assert(
    fc.property(
      activityArbitrary(), // generates random valid activities
      (activity) => {
        const saved = storage.saveActivity(activity);
        const loaded = storage.loadActivity(activity.id);
        return deepEqual(activity, loaded);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing

Unit tests will complement property-based tests by focusing on:

1. **Specific Examples**: Concrete test cases that demonstrate correct behavior for common scenarios
2. **Edge Cases**: Boundary conditions such as:
   - Empty activity lists
   - Single-item collections
   - Maximum/minimum valid values
   - Leap year dates
   - Activities at midnight (boundary times)
3. **Error Conditions**: Specific error scenarios such as:
   - Storage failures
   - Network timeouts (if applicable)
   - Corrupted data files
   - Missing configuration
4. **Integration Points**: Testing interactions between components:
   - ActivityManager with Storage
   - GoalTracker with ActivityManager
   - AnalyticsEngine with ActivityManager

**Unit Test Balance:**
- Unit tests should be focused and targeted, not exhaustive
- Avoid writing many similar unit tests—property tests handle input variation
- Each unit test should have a clear purpose (demonstrate a specific example or edge case)

### Test Organization

```
tests/
├── properties/          # Property-based tests
│   ├── activity.properties.test.js
│   ├── goal.properties.test.js
│   ├── analytics.properties.test.js
│   └── storage.properties.test.js
├── unit/               # Unit tests
│   ├── activity-manager.test.js
│   ├── goal-tracker.test.js
│   ├── analytics-engine.test.js
│   └── storage.test.js
└── integration/        # Integration tests
    └── end-to-end.test.js
```

### Test Data Generation

For property-based tests, we will create custom arbitraries (generators) for:
- **Activities**: Generate random valid activities with various types, dates, and metrics
- **Goals**: Generate random valid goals with various target metrics and deadlines
- **Date Ranges**: Generate random valid date ranges
- **Invalid Data**: Generate data that violates specific validation rules

### Coverage Goals

- **Property Tests**: 100% coverage of all 22 correctness properties
- **Unit Tests**: Focus on edge cases and error conditions not covered by properties
- **Integration Tests**: Cover critical user workflows end-to-end
- **Code Coverage**: Aim for >90% line coverage, with focus on critical business logic

### Continuous Testing

- All tests run on every commit
- Property tests run with 100 iterations in CI/CD
- Failed property tests should output the failing example for debugging
- Test results tracked over time to identify flaky tests
