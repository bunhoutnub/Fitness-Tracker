# Fitness Tracker PWA

A Progressive Web App for tracking workouts, setting fitness goals, and analyzing progress.

## Tech Stack

- React 19 with TypeScript
- Vite for build tooling
- IndexedDB for data persistence
- PWA with offline support
- Vitest + fast-check for testing

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Build for production
npm build
```

## Project Structure

```
src/
├── models/       # Data models and validation
├── services/     # Business logic (ActivityManager, GoalTracker, etc.)
├── components/   # React UI components
├── utils/        # Utility functions and formatters
└── hooks/        # Custom React hooks

tests/
├── properties/   # Property-based tests
└── unit/         # Unit tests
```

## Features

- Log workouts with type, duration, distance, and calories
- View activity history with filtering
- Set and track fitness goals
- View analytics and statistics
- Works offline
- Installable to home screen
