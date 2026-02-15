# Implementation Plan: Fitness Tracker PWA

## Overview

This implementation plan breaks down the fitness tracker Progressive Web App into discrete coding tasks for React with TypeScript and PWA capabilities. The approach follows a bottom-up strategy: starting with core data models and validation, then building business logic components, implementing browser storage (localStorage/IndexedDB), adding PWA features (service workers, manifest), and finally creating the responsive UI layer. Each task builds incrementally, with property-based tests integrated throughout to validate correctness early.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Initialize React project with Vite and TypeScript template (`npm create vite@latest fitness-tracker -- --template react-ts`)
  - Install dependencies: fast-check for property-based testing, date-fns for date handling, idb for IndexedDB wrapper
  - Configure TypeScript with strict mode
  - Set up testing framework (Vitest) with fast-check integration
  - Create directory structure: `src/models/`, `src/services/`, `src/components/`, `src/utils/`, `src/hooks/`, `tests/properties/`, `tests/unit/`, `public/`
  - Add PWA plugin: `vite-plugin-pwa`
  - _Requirements: Foundation for all requirements_

- [x] 2. Implement core data models and validation
  - [x] 2.1 Create Activity model with TypeScript interfaces and validation
    - Define `Activity` interface with id, type, date, duration, distance, calories
    - Define `ActivityType` enum (running, cycling, swimming, walking, strength_training)
    - Implement `validateActivity()` function with validation rules (duration > 0, distance >= 0, calories >= 0)
    - Implement `createActivity()` factory function that generates ID and timestamp
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 2.2 Write property test for activity validation
    - **Property 2: Input Validation Rejects Invalid Data**
    - **Validates: Requirements 1.2, 1.4, 7.1, 7.2, 7.3, 7.4**
  
  - [ ]* 2.3 Write property test for activity creation
    - **Property 1: Activity Creation with Valid Data**
    - **Validates: Requirements 1.1, 1.5**
  
  - [ ]* 2.4 Write property test for validation error messages
    - **Property 3: Validation Error Messages Are Descriptive**
    - **Validates: Requirements 7.5**

  - [x] 2.5 Create Goal model with TypeScript interfaces and validation
    - Define `Goal` interface with id, name, targetMetric, targetValue, deadline, createdAt
    - Define `MetricType` enum (total_distance, total_duration, total_calories, workout_count)
    - Implement `validateGoal()` function with validation rules (targetValue > 0, deadline in future)
    - Implement `createGoal()` factory function that generates ID and creation timestamp
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 2.6 Write property test for goal validation
    - **Property 10: Goal Deadline Validation**
    - **Property 11: Goal Target Value Validation**
    - **Validates: Requirements 3.2, 3.3**
  
  - [ ]* 2.7 Write property test for goal creation
    - **Property 9: Goal Creation with Valid Data**
    - **Validates: Requirements 3.1**

- [x] 3. Implement storage layer with browser storage APIs
  - [x] 3.1 Create Storage interface and IndexedDB implementation
    - Define `Storage` interface with methods for activities and goals (save, load, loadAll, update, delete)
    - Implement `IndexedDBStorage` class using idb library
    - Create database schema with `activities` and `goals` object stores
    - Add indexes on `date` and `type` for activities, `deadline` for goals
    - Implement JSON serialization/deserialization for activities and goals
    - Add error handling for storage operations with try-catch and error logging
    - Implement fallback to localStorage if IndexedDB unavailable
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 3.2 Write property test for activity persistence round-trip
    - **Property 4: Activity Persistence Round-Trip**
    - **Validates: Requirements 1.3, 5.1, 6.2**
  
  - [ ]* 3.3 Write property test for goal persistence round-trip
    - **Property 14: Goal Persistence Round-Trip**
    - **Validates: Requirements 5.3**
  
  - [ ]* 3.4 Write property test for data loading on startup
    - **Property 21: Data Loading on Startup**
    - **Validates: Requirements 5.2**
  
  - [ ]* 3.5 Write unit tests for storage error handling
    - Test storage write failures
    - Test storage read failures with corrupted data
    - Test fallback to localStorage when IndexedDB unavailable
    - _Requirements: 5.4_

- [ ] 4. Checkpoint - Ensure core models and storage tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement ActivityManager service
  - [x] 5.1 Create ActivityManager class with CRUD operations
    - Implement `createActivity()` method with validation and storage
    - Implement `getActivity()` method to retrieve by ID
    - Implement `getAllActivities()` method with date sorting (descending)
    - Implement `getActivitiesByType()` method for filtering
    - Implement `getActivitiesByDateRange()` method for date range filtering
    - Implement `updateActivity()` method with validation
    - Implement `deleteActivity()` method
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 6.1, 6.2, 6.3_
  
  - [ ]* 5.2 Write property test for activity retrieval sorting
    - **Property 5: Activity Retrieval Sorted by Date**
    - **Validates: Requirements 2.1**
  
  - [ ]* 5.3 Write property test for activity type filtering
    - **Property 6: Activity Type Filtering**
    - **Validates: Requirements 2.2**
  
  - [ ]* 5.4 Write property test for date range filtering
    - **Property 7: Date Range Filtering**
    - **Validates: Requirements 2.3**
  
  - [ ]* 5.5 Write property test for activity update validation
    - **Property 18: Activity Update Validation**
    - **Validates: Requirements 6.1**
  
  - [ ]* 5.6 Write property test for activity deletion
    - **Property 19: Activity Deletion Removes Record**
    - **Validates: Requirements 6.3**
  
  - [ ]* 5.7 Write unit tests for ActivityManager edge cases
    - Test retrieving non-existent activity
    - Test updating non-existent activity
    - Test empty activity list
    - _Requirements: 2.1, 6.1, 6.3_

- [x] 6. Implement GoalTracker service
  - [x] 6.1 Create GoalTracker class with goal management
    - Implement `createGoal()` method with validation and storage
    - Implement `getGoal()` method to retrieve by ID
    - Implement `getAllGoals()` method
    - Implement `updateGoal()` method with validation
    - Implement `deleteGoal()` method
    - Implement `calculateGoalProgress()` method that aggregates relevant activities
    - Implement `checkGoalStatus()` method that determines completed/missed status
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 6.2 Write property test for goal progress calculation
    - **Property 12: Goal Progress Calculation**
    - **Validates: Requirements 3.4**
  
  - [ ]* 6.3 Write property test for goal status determination
    - **Property 13: Goal Status Determination**
    - **Validates: Requirements 3.5**
  
  - [ ]* 6.4 Write property test for activity deletion updates goal progress
    - **Property 20: Activity Deletion Updates Goal Progress**
    - **Validates: Requirements 6.4**
  
  - [ ]* 6.5 Write unit tests for GoalTracker edge cases
    - Test goal with no matching activities (0% progress)
    - Test goal with activities exceeding target (>100% progress)
    - Test goal exactly at deadline
    - _Requirements: 3.4, 3.5_

- [x] 7. Implement AnalyticsEngine service
  - [x] 7.1 Create AnalyticsEngine class with statistics calculation
    - Implement `getWeeklyStats()` method (past 7 days aggregation)
    - Implement `getMonthlyStats()` method (past 30 days aggregation)
    - Implement `getStatsByPeriod()` method for custom date ranges
    - Implement `getStatsByActivityType()` method for type-specific stats
    - Implement `calculateAverageDuration()` method
    - Create `Statistics` interface with totalDistance, totalDuration, totalCalories, workoutCount, breakdownByType
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 7.2 Write property test for time-based statistics aggregation
    - **Property 15: Time-Based Statistics Aggregation**
    - **Validates: Requirements 4.1, 4.2, 4.5**
  
  - [ ]* 7.3 Write property test for statistics grouped by activity type
    - **Property 16: Statistics Grouped by Activity Type**
    - **Validates: Requirements 4.3**
  
  - [ ]* 7.4 Write property test for average duration calculation
    - **Property 17: Average Duration Calculation**
    - **Validates: Requirements 4.4**
  
  - [ ]* 7.5 Write unit tests for AnalyticsEngine edge cases
    - Test statistics with empty activity list
    - Test statistics with single activity
    - Test average duration with no activities
    - _Requirements: 4.1, 4.2, 4.4_

- [ ] 8. Checkpoint - Ensure all business logic tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create utility functions and formatters
  - [x] 9.1 Implement date and metric formatting utilities
    - Create `formatDate()` function for human-readable dates
    - Create `formatDuration()` function for displaying minutes/hours
    - Create `formatDistance()` function for displaying km with units
    - Create `formatCalories()` function for displaying calories with units
    - _Requirements: 8.4_
  
  - [ ]* 9.2 Write property test for date formatting
    - **Property 22: Date Formatting is Human-Readable**
    - **Validates: Requirements 8.4**
  
  - [ ]* 9.3 Write unit tests for formatting edge cases
    - Test formatting with zero values
    - Test formatting with very large values
    - Test date formatting with various date formats
    - _Requirements: 8.4_

- [x] 10. Implement React UI components - Activity Logging
  - [x] 10.1 Create ActivityForm component
    - Build form with inputs for activity type (select dropdown), duration, distance, calories
    - Add date picker for activity date (HTML5 date input or date picker library)
    - Implement form validation with error display
    - Connect to ActivityManager.createActivity()
    - Show success feedback on successful creation
    - Clear form after successful submission
    - Style with mobile-first responsive CSS
    - _Requirements: 1.1, 1.2, 1.4, 7.5, 8.5_
  
  - [ ]* 10.2 Write unit tests for ActivityForm
    - Test form submission with valid data
    - Test form validation error display
    - Test form clearing after submission
    - _Requirements: 1.1, 1.4, 7.5_

- [ ] 11. Implement React UI components - Activity History
  - [ ] 11.1 Create ActivityList component
    - Display list of activities using responsive grid or list layout
    - Show activity details (type, date, duration, distance, calories) for each item
    - Implement pull-to-refresh functionality (or refresh button)
    - Add filter controls for activity type and date range
    - Connect to ActivityManager methods (getAllActivities, getActivitiesByType, getActivitiesByDateRange)
    - Style with mobile-first responsive CSS
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 11.2 Create ActivityItem component
    - Display individual activity with formatted data
    - Add edit and delete buttons
    - Implement edit functionality (show edit form inline or modal)
    - Implement delete functionality with confirmation dialog
    - Style with touch-friendly buttons for mobile
    - _Requirements: 2.4, 6.2, 6.3_
  
  - [ ]* 11.3 Write property test for activity display contains required fields
    - **Property 8: Activity Display Contains Required Fields**
    - **Validates: Requirements 2.4**
  
  - [ ]* 11.4 Write unit tests for ActivityList
    - Test rendering empty list
    - Test rendering list with activities
    - Test filter functionality
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 12. Implement React UI components - Goals
  - [ ] 12.1 Create GoalForm component
    - Build form with inputs for goal name, target metric (select dropdown), target value, deadline (date picker)
    - Implement form validation with error display
    - Connect to GoalTracker.createGoal()
    - Show success feedback on successful creation
    - Style with mobile-first responsive CSS
    - _Requirements: 3.1, 3.2, 3.3, 7.5_
  
  - [ ] 12.2 Create GoalList component
    - Display list of goals using responsive grid or list layout
    - Show goal details (name, target, deadline, progress percentage)
    - Display progress bar for each goal (HTML5 progress element or CSS)
    - Show goal status (active, completed, missed) with visual indicators
    - Connect to GoalTracker methods
    - Style with mobile-first responsive CSS
    - _Requirements: 3.4, 3.5_
  
  - [ ]* 12.3 Write unit tests for GoalList
    - Test rendering empty goal list
    - Test rendering goals with various progress levels
    - Test goal status display
    - _Requirements: 3.4, 3.5_

- [ ] 13. Implement React UI components - Dashboard
  - [ ] 13.1 Create Dashboard component
    - Display summary of recent activities (last 5-10) in card layout
    - Display current goal progress for all active goals
    - Show quick stats (weekly totals) in summary cards
    - Add navigation links/buttons to other sections
    - Connect to ActivityManager and GoalTracker
    - Style with mobile-first responsive CSS and card-based layout
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ]* 13.2 Write unit tests for Dashboard
    - Test dashboard with no data
    - Test dashboard with activities and goals
    - _Requirements: 8.1, 8.2_

- [ ] 14. Implement React UI components - Analytics
  - [ ] 14.1 Create AnalyticsScreen component
    - Display weekly statistics (total distance, duration, calories, workout count) in stat cards
    - Display monthly statistics
    - Show breakdown by activity type with charts/visualizations (Chart.js or Recharts)
    - Display average workout duration
    - Add date range selector for custom periods
    - Connect to AnalyticsEngine methods
    - Style with mobile-first responsive CSS
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 14.2 Write unit tests for AnalyticsScreen
    - Test analytics with no data
    - Test analytics with various activity data
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 15. Implement routing and app structure
  - [ ] 15.1 Set up React Router
    - Install and configure React Router v6
    - Create route structure with paths: `/` (Dashboard), `/add-activity`, `/history`, `/goals`, `/analytics`
    - Create navigation component (navbar or bottom nav bar)
    - Configure route transitions and styling
    - Make navigation responsive (hamburger menu on mobile, full nav on desktop)
    - _Requirements: 8.3_
  
  - [ ] 15.2 Create App root component
    - Initialize storage on app startup
    - Load activities and goals from storage
    - Set up router provider
    - Add error boundary for crash handling
    - Add loading state during initialization
    - _Requirements: 5.2, 5.4_

- [ ] 16. Implement PWA features
  - [ ] 16.1 Configure PWA manifest and service worker
    - Create `manifest.json` with app metadata (name, short_name, description, theme_color, background_color)
    - Add app icons in multiple sizes (192x192, 512x512) to `public/icons/`
    - Configure `vite-plugin-pwa` in `vite.config.ts` with workbox options
    - Set up service worker with cache-first strategy for static assets
    - Set up network-first strategy for API/data requests
    - Add offline fallback page
    - _Requirements: 5.1, 5.2_
  
  - [ ] 16.2 Implement offline support and sync
    - Add offline detection in app (navigator.onLine)
    - Show offline indicator in UI when disconnected
    - Queue data changes when offline using IndexedDB
    - Implement background sync to push queued changes when online
    - Add service worker update notification
    - _Requirements: 5.1, 5.4_
  
  - [ ] 16.3 Add install prompt
    - Detect PWA install availability (beforeinstallprompt event)
    - Create install button/banner component
    - Handle install prompt user interaction
    - Track install analytics (optional)
    - Hide prompt after installation
    - _Requirements: 8.5_

- [ ] 17. Implement responsive mobile-first CSS
  - [ ] 17.1 Create global styles and theme
    - Set up CSS variables for colors, spacing, typography
    - Create mobile-first base styles (reset, typography, layout)
    - Define breakpoints for responsive design (mobile: <640px, tablet: 640-1024px, desktop: >1024px)
    - Add touch-friendly button sizes (min 44x44px)
    - _Requirements: 8.4, 8.5_
  
  - [ ] 17.2 Style all components responsively
    - Apply responsive styles to all components
    - Test on various screen sizes (mobile, tablet, desktop)
    - Ensure forms are usable on mobile (proper input types, spacing)
    - Add smooth transitions and animations
    - Test touch interactions (tap, swipe)
    - _Requirements: 8.4, 8.5_

- [ ] 18. Implement data initialization and app lifecycle
  - [ ] 16.1 Create app initialization logic
    - Load all activities from storage on app start
    - Load all goals from storage on app start
    - Handle storage errors gracefully with user notification
    - Implement app state persistence (save on background)
    - _Requirements: 5.2, 5.4_
  
  - [ ]* 16.2 Write integration tests for app initialization
    - Test app startup with existing data
    - Test app startup with no data
    - Test app startup with corrupted data
    - _Requirements: 5.2, 5.4_

- [ ] 18. Implement data initialization and app lifecycle
  - [ ] 18.1 Create app initialization logic
    - Load all activities from IndexedDB on app start
    - Load all goals from IndexedDB on app start
    - Handle storage errors gracefully with user notification
    - Implement visibility change handler (save state when tab hidden)
    - Add service worker registration and update handling
    - _Requirements: 5.2, 5.4_
  
  - [ ]* 18.2 Write integration tests for app initialization
    - Test app startup with existing data
    - Test app startup with no data
    - Test app startup with corrupted data
    - Test service worker registration
    - _Requirements: 5.2, 5.4_

- [ ] 19. Final checkpoint - End-to-end testing and polish
  - [ ] 19.1 Run all property-based tests and unit tests
    - Verify all 22 property tests pass with 100 iterations
    - Verify all unit tests pass
    - Fix any failing tests
    - _Requirements: All_
  
  - [ ]* 19.2 Write end-to-end integration tests
    - Test complete user flow: create activity → view history → create goal → check progress
    - Test complete user flow: create multiple activities → view analytics
    - Test complete user flow: edit activity → verify goal progress updates
    - Test offline functionality: go offline → create activity → go online → verify sync
    - _Requirements: 1.1, 2.1, 3.1, 3.4, 4.1, 6.2, 6.4_
  
  - [ ] 19.3 Polish UI and user experience
    - Add loading states for async operations
    - Improve error message display
    - Add confirmation dialogs for destructive actions
    - Test PWA installation on mobile devices (iOS Safari, Android Chrome)
    - Test offline functionality thoroughly
    - Optimize performance (lazy loading, code splitting)
    - _Requirements: 8.5_
  
  - [ ] 19.4 Test PWA features
    - Test app installation on iOS and Android
    - Verify offline functionality works correctly
    - Test service worker caching and updates
    - Verify manifest.json is correct
    - Test on various browsers (Chrome, Firefox, Safari, Edge)
    - _Requirements: 5.1, 5.2, 8.5_

- [ ] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- The implementation uses TypeScript for type safety throughout
- React with Vite provides fast development and optimized production builds
- PWA features enable offline support and native-like installation
- IndexedDB provides efficient storage with query capabilities, localStorage as fallback
- Service workers handle caching and offline functionality
- React Router provides client-side routing
- Mobile-first responsive CSS ensures usability across all devices
- Checkpoints ensure incremental validation at key milestones
