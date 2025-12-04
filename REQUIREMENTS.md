# Tick Always - Detailed Requirements Document

## Table of Contents
1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [User Interface Requirements](#user-interface-requirements)
6. [Technical Specifications](#technical-specifications)
7. [Implementation Phases](#implementation-phases)
8. [Non-Functional Requirements](#non-functional-requirements)

---

## Project Overview

**Tick Always** is a productivity web application inspired by TickTick, focusing on task management, recurring tasks, calendar visualization, and habit tracking. The application is built with Next.js 16, MongoDB, and TypeScript.

### Key Objectives
- Provide an intuitive task management system
- Support complex recurring task patterns
- Offer calendar-based task visualization
- Enable daily habit tracking with streak monitoring
- Deliver a responsive, modern user interface

### Target Users
- Individuals seeking better task organization
- Users who need recurring task management
- People tracking daily habits and routines
- Multi-device users (web and mobile-responsive)

---

## Core Features

### 1. Authentication & User Management

#### 1.1 User Registration
- **Description**: Allow new users to create an account
- **Requirements**:
  - Email and password registration
  - Email validation (format check)
  - Password strength requirements (minimum 8 characters)
  - Password hashing using bcryptjs (minimum 10 rounds)
  - Duplicate email prevention
  - User profile creation (name, email)

#### 1.2 User Login
- **Description**: Authenticate existing users
- **Requirements**:
  - Email and password authentication
  - JWT token generation for session management
  - Secure token storage (httpOnly cookies)
  - Session expiration handling
  - Remember me functionality (optional)

#### 1.3 User Logout
- **Description**: End user session
- **Requirements**:
  - Clear authentication tokens
  - Redirect to login page
  - Clear user state

#### 1.4 Protected Routes
- **Description**: Secure dashboard and API routes
- **Requirements**:
  - Middleware to verify JWT tokens
  - Redirect unauthenticated users to login
  - Protect all API endpoints except auth routes

---

### 2. Task Management Module

#### 2.1 Task Creation
- **Description**: Create new tasks with various properties
- **Required Fields**:
  - `title` (string, required, max 200 characters)
  - `userId` (ObjectId, auto-assigned from session)
- **Optional Fields**:
  - `description` (string, max 2000 characters)
  - `dueDate` (Date, ISO 8601 format)
  - `priority` (enum: 'none' | 'low' | 'medium' | 'high', default: 'none')
  - `tags` (array of strings, max 10 tags, each max 30 characters)
  - `completed` (boolean, default: false)
  - `completedAt` (Date, set when task is completed)
- **Validation Rules**:
  - Title cannot be empty or whitespace only
  - Due date must be valid ISO 8601 date
  - Tags must be unique within a task
  - Priority must be one of the allowed values

#### 2.2 Task Reading/Listing
- **Description**: Retrieve tasks with filtering and sorting
- **Features**:
  - List all tasks for authenticated user
  - Filter by:
    - Completion status (all, completed, incomplete)
    - Priority level
    - Tags
    - Due date range
    - Search by title/description
  - Sort by:
    - Due date (ascending/descending)
    - Priority (high to low)
    - Created date (newest/oldest)
    - Title (alphabetical)
  - Pagination support (20 tasks per page)
  - Return task count for pagination

#### 2.3 Task Update
- **Description**: Modify existing task properties
- **Requirements**:
  - Update any task field (except userId)
  - Validate all fields same as creation
  - Update `updatedAt` timestamp
  - Prevent updating tasks belonging to other users
  - Return updated task object

#### 2.4 Task Deletion
- **Description**: Remove tasks from the system
- **Requirements**:
  - Soft delete (add `deletedAt` timestamp) OR hard delete
  - Prevent deletion of tasks belonging to other users
  - Cascade delete recurring task instances (optional)
  - Return success confirmation

#### 2.5 Task Completion
- **Description**: Mark tasks as complete or incomplete
- **Requirements**:
  - Toggle completion status
  - Set `completedAt` timestamp when completing
  - Clear `completedAt` when uncompleting
  - For recurring tasks: generate next occurrence on completion
  - Update task `updatedAt` timestamp

---

### 3. Recurring Tasks System

#### 3.1 Recurrence Rule Definition
- **Description**: Define how tasks repeat over time
- **Recurrence Types**:
  - **Daily**: Repeat every N days
    - `type: 'daily'`
    - `interval: number` (e.g., 1 for every day, 3 for every 3 days)
  - **Weekly**: Repeat on specific days of the week
    - `type: 'weekly'`
    - `interval: number` (e.g., 1 for every week, 2 for every 2 weeks)
    - `daysOfWeek: string[]` (e.g., ['monday', 'friday'])
  - **Monthly**: Repeat on specific day of month
    - `type: 'monthly'`
    - `interval: number` (e.g., 1 for every month, 3 for every 3 months)
    - `dayOfMonth: number` (1-31)
  - **Yearly**: Repeat on specific date each year
    - `type: 'yearly'`
    - `month: number` (1-12)
    - `day: number` (1-31)
  - **Custom**: Advanced interval-based recurrence
    - `type: 'custom'`
    - `interval: number`
    - `unit: 'day' | 'week' | 'month' | 'year'`

#### 3.2 Recurrence Rule Structure
```typescript
interface RecurrenceRule {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number; // How often (e.g., every 2 weeks)
  daysOfWeek?: string[]; // For weekly: ['monday', 'wednesday']
  dayOfMonth?: number; // For monthly: 15
  month?: number; // For yearly: 12 (December)
  day?: number; // For yearly: 25
  unit?: 'day' | 'week' | 'month' | 'year'; // For custom
  endDate?: Date; // Optional end date for recurrence
  count?: number; // Optional: repeat N times then stop
}
```

#### 3.3 Recurring Task Creation
- **Description**: Create a task with recurrence rules
- **Requirements**:
  - Set `isRecurring: true`
  - Store `recurrenceRule` object
  - Set initial `dueDate` as first occurrence
  - Create parent task record
  - Generate first occurrence instance (optional)

#### 3.4 Next Occurrence Generation
- **Description**: Automatically create next task instance
- **Trigger**: When a recurring task is marked complete
- **Requirements**:
  - Calculate next occurrence date based on rule
  - Create new task instance with:
    - Same properties as parent (title, description, priority, tags)
    - New `dueDate` (calculated next occurrence)
    - `parentTaskId` reference to original task
    - `occurrenceDate` set to the calculated date
    - `isRecurring: false` (instance, not parent)
  - Handle edge cases:
    - End date reached → stop generating
    - Count limit reached → stop generating
    - Invalid dates (e.g., Feb 30) → skip to next valid date
  - Prevent duplicate generation (check if next occurrence already exists)

#### 3.5 Recurrence Calculation Logic
- **Daily**: Add `interval` days to current dueDate
- **Weekly**: Find next occurrence of specified days, add `interval` weeks
- **Monthly**: Add `interval` months, handle month-end edge cases
- **Yearly**: Add `interval` years to the date
- **Custom**: Add `interval` units (days/weeks/months/years)

#### 3.6 Recurring Task Management
- **Description**: Manage parent recurring tasks
- **Features**:
  - Edit parent task → update all future instances
  - Delete parent task → delete all future instances (optional: keep completed)
  - View all instances of a recurring task
  - Pause/resume recurrence

---

### 4. Calendar View Module

#### 4.1 Calendar Display Modes
- **Monthly View**:
  - Display full month grid
  - Show tasks on their due dates
  - Highlight today's date
  - Show task count per day
  - Color-code by priority
- **Weekly View**:
  - Display 7-day week grid
  - Show tasks with time slots (if time added later)
  - Scrollable day columns
- **Agenda View**:
  - List view of upcoming tasks
  - Grouped by date
  - Sorted by due date/time
  - Show next 30 days

#### 4.2 Calendar Features
- **Date Navigation**:
  - Previous/Next month/week buttons
  - Jump to today button
  - Jump to specific date (date picker)
- **Task Display**:
  - Show task title on calendar
  - Show priority indicator (color dot)
  - Show completion status (strikethrough or checkmark)
  - Click task to view/edit details
  - Show task count badge on dates with multiple tasks
- **Recurring Tasks**:
  - Display all generated occurrences
  - Show parent task pattern indicator
- **Filtering**:
  - Filter by priority
  - Filter by tags
  - Filter by completion status
  - Show/hide completed tasks

#### 4.3 Calendar Interactions
- **Click Date**: Open task list modal for that date
- **Click Task**: Open task detail/edit modal
- **Drag and Drop** (Future Enhancement):
  - Drag task to different date to reschedule
  - Update task dueDate on drop

---

### 5. Habit Tracking Module

#### 5.1 Habit Creation
- **Description**: Create new habits to track
- **Required Fields**:
  - `name` (string, required, max 100 characters)
  - `userId` (ObjectId, auto-assigned)
- **Optional Fields**:
  - `description` (string, max 500 characters)
  - `color` (string, hex color code, default: '#3B82F6')
  - `icon` (string, icon identifier, optional)
- **Frequency Settings**:
  - `frequency.type`: 'daily' | 'weekly' | 'custom'
  - `frequency.daysOfWeek`: string[] (for weekly/custom)
    - Example: ['monday', 'wednesday', 'friday']
  - Default: daily (every day)

#### 5.2 Habit Completion
- **Description**: Mark habit as done for a specific date
- **Requirements**:
  - Create HabitCompletion record with:
    - `habitId` (reference to Habit)
    - `userId` (reference to User)
    - `date` (Date, stored as YYYY-MM-DD, indexed)
    - `completed: true`
    - `notes` (optional string)
  - Prevent duplicate completions for same date
  - Update habit streak on completion
  - Update best streak if current streak exceeds it

#### 5.3 Streak Calculation
- **Description**: Track consecutive habit completions
- **Current Streak**:
  - Count consecutive days with completions
  - Start from today and count backwards
  - Reset to 0 if a day is missed
  - Handle timezone-aware date comparisons
- **Best Streak**:
  - Track longest consecutive streak ever achieved
  - Update when current streak exceeds best streak
  - Never decrease (only increases)
- **Streak Rules**:
  - For daily habits: must complete every day
  - For weekly habits: must complete on all specified days
  - Missing one day resets streak to 0
  - Streak calculation runs on:
    - Habit completion
    - Daily background job (optional)

#### 5.4 Habit Statistics
- **Description**: Provide insights into habit performance
- **Metrics**:
  - Current streak (number)
  - Best streak (number)
  - Total completions (count)
  - Completion rate (percentage)
  - Days since first completion
  - Completion calendar (heatmap)

#### 5.5 Habit Heatmap
- **Description**: Visualize habit completion history
- **Requirements**:
  - GitHub-style contribution graph
  - Display last 365 days (or since habit creation)
  - Color intensity based on completion:
    - No completion: light gray
    - 1 completion: light green
    - Multiple completions (if allowed): darker green
  - Show date on hover
  - Click date to view/edit completion
  - Responsive grid layout

#### 5.6 Habit Management
- **Edit Habit**: Update name, description, color, frequency
- **Delete Habit**: Remove habit and all completion records
- **Pause Habit**: Temporarily stop tracking (optional feature)
- **Archive Habit**: Hide from active list but keep data (optional)

---

## Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  email: string (unique, required, indexed),
  password: string (hashed, required),
  name: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email` (unique)

### Task Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required, indexed),
  title: string (required),
  description: string,
  dueDate: Date (indexed),
  priority: 'none' | 'low' | 'medium' | 'high' (default: 'none'),
  tags: string[],
  completed: boolean (default: false, indexed),
  completedAt: Date,
  
  // Recurring task fields
  isRecurring: boolean (default: false),
  recurrenceRule: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
    interval: number,
    daysOfWeek: string[],
    dayOfMonth: number,
    month: number,
    day: number,
    unit: 'day' | 'week' | 'month' | 'year',
    endDate: Date,
    count: number
  },
  parentTaskId: ObjectId (ref: 'Task'),
  occurrenceDate: Date,
  
  deletedAt: Date, // For soft deletes
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `userId` + `completed`
- `userId` + `dueDate`
- `userId` + `priority`
- `parentTaskId`
- `userId` + `tags` (text index for search)

### Habit Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required, indexed),
  name: string (required),
  description: string,
  frequency: {
    type: 'daily' | 'weekly' | 'custom',
    daysOfWeek: string[]
  },
  color: string (default: '#3B82F6'),
  icon: string,
  currentStreak: number (default: 0),
  bestStreak: number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `userId`

### HabitCompletion Collection
```typescript
{
  _id: ObjectId,
  habitId: ObjectId (ref: 'Habit', required, indexed),
  userId: ObjectId (ref: 'User', required, indexed),
  date: Date (required, indexed, stored as YYYY-MM-DD),
  completed: boolean (default: true),
  notes: string,
  createdAt: Date
}
```

**Indexes**:
- `habitId` + `date` (unique compound index)
- `userId` + `date`
- `date` (for range queries)

---

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "userId",
        "email": "user@example.com",
        "name": "John Doe"
      },
      "token": "jwt_token_here"
    }
  }
  ```
- **Error Response** (400):
  ```json
  {
    "success": false,
    "error": "Email already exists"
  }
  ```

#### POST `/api/auth/login`
- **Description**: Authenticate user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "userId", "email": "...", "name": "..." },
      "token": "jwt_token_here"
    }
  }
  ```

#### POST `/api/auth/logout`
- **Description**: Logout user
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

#### GET `/api/auth/me`
- **Description**: Get current user info
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "...", "email": "...", "name": "..." }
    }
  }
  ```

### Task Endpoints

#### GET `/api/tasks`
- **Description**: Get all tasks for authenticated user
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `completed`: boolean (filter by completion)
  - `priority`: string (filter by priority)
  - `tags`: string (comma-separated tags)
  - `search`: string (search in title/description)
  - `dueDateFrom`: ISO date string
  - `dueDateTo`: ISO date string
  - `page`: number (default: 1)
  - `limit`: number (default: 20)
  - `sortBy`: string (dueDate, priority, createdAt, title)
  - `sortOrder`: 'asc' | 'desc' (default: 'asc')
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "tasks": [...],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100,
        "totalPages": 5
      }
    }
  }
  ```

#### POST `/api/tasks`
- **Description**: Create a new task
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "title": "Complete project",
    "description": "Finish the Tick Always app",
    "dueDate": "2024-12-31T23:59:59Z",
    "priority": "high",
    "tags": ["work", "urgent"],
    "isRecurring": false,
    "recurrenceRule": null
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "data": { "task": {...} }
  }
  ```

#### GET `/api/tasks/[id]`
- **Description**: Get a specific task
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "data": { "task": {...} }
  }
  ```

#### PUT `/api/tasks/[id]`
- **Description**: Update a task
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Same as POST (all fields optional)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": { "task": {...} }
  }
  ```

#### DELETE `/api/tasks/[id]`
- **Description**: Delete a task
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```

#### PATCH `/api/tasks/[id]/complete`
- **Description**: Toggle task completion
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "completed": true
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "data": { "task": {...} }
  }
  ```

### Habit Endpoints

#### GET `/api/habits`
- **Description**: Get all habits for authenticated user
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "data": { "habits": [...] }
  }
  ```

#### POST `/api/habits`
- **Description**: Create a new habit
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Drink water",
    "description": "Drink 8 glasses daily",
    "frequency": {
      "type": "daily",
      "daysOfWeek": []
    },
    "color": "#3B82F6"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "data": { "habit": {...} }
  }
  ```

#### GET `/api/habits/[id]`
- **Description**: Get a specific habit
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "data": { "habit": {...} }
  }
  ```

#### PUT `/api/habits/[id]`
- **Description**: Update a habit
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200): Same format as GET

#### DELETE `/api/habits/[id]`
- **Description**: Delete a habit
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Habit deleted successfully"
  }
  ```

#### POST `/api/habits/[id]/complete`
- **Description**: Mark habit as complete for a date
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "date": "2024-12-04",
    "notes": "Completed successfully"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "completion": {...},
      "habit": {
        "currentStreak": 5,
        "bestStreak": 10
      }
    }
  }
  ```

#### DELETE `/api/habits/[id]/complete`
- **Description**: Remove habit completion for a date
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "date": "2024-12-04"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Completion removed"
  }
  ```

#### GET `/api/habits/[id]/stats`
- **Description**: Get habit statistics
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "currentStreak": 5,
      "bestStreak": 10,
      "totalCompletions": 45,
      "completionRate": 0.75,
      "daysSinceStart": 60
    }
  }
  ```

#### GET `/api/habits/[id]/heatmap`
- **Description**: Get heatmap data for habit
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `startDate`: ISO date string (default: 365 days ago)
  - `endDate`: ISO date string (default: today)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "heatmap": [
        { "date": "2024-12-01", "count": 1 },
        { "date": "2024-12-02", "count": 1 },
        ...
      ]
    }
  }
  ```

### Calendar Endpoints

#### GET `/api/calendar`
- **Description**: Get tasks for a date range
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `startDate`: ISO date string (required)
  - `endDate`: ISO date string (required)
  - `includeCompleted`: boolean (default: true)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "tasks": [
        {
          "id": "...",
          "title": "...",
          "dueDate": "2024-12-04T00:00:00Z",
          "priority": "high",
          "completed": false
        },
        ...
      ]
    }
  }
  ```

#### GET `/api/calendar/month`
- **Description**: Get tasks for a specific month
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `year`: number (required, e.g., 2024)
  - `month`: number (required, 1-12)
- **Response** (200): Same format as `/api/calendar`

#### GET `/api/calendar/week`
- **Description**: Get tasks for a specific week
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `startDate`: ISO date string (required, start of week)
- **Response** (200): Same format as `/api/calendar`

---

## User Interface Requirements

### 1. Layout & Navigation

#### 1.1 Header/Navbar
- **Components**:
  - Logo/Brand name "Tick Always"
  - Navigation menu (Tasks, Calendar, Habits)
  - User profile dropdown
  - Logout button
- **Responsive**: Collapse to hamburger menu on mobile
- **Styling**: Modern, clean design with Tailwind CSS

#### 1.2 Sidebar (Desktop)
- **Components**:
  - Quick navigation links
  - Task filters (All, Today, Upcoming, Completed)
  - Habit quick view
- **Behavior**: Collapsible, hidden on mobile

#### 1.3 Main Content Area
- **Layout**: Flexible grid system
- **Responsive**: Adapts to screen size
- **Loading States**: Skeleton loaders for async content

### 2. Task Management UI

#### 2.1 Task List View
- **Components**:
  - Task item cards
  - Checkbox for completion
  - Priority indicator (color dot)
  - Due date display
  - Tags display
  - Edit/Delete buttons
- **Features**:
  - Inline editing
  - Drag to reorder (optional)
  - Bulk actions (select multiple, complete/delete)
- **Empty State**: Friendly message with "Create Task" button

#### 2.2 Task Form (Create/Edit)
- **Components**:
  - Title input (required)
  - Description textarea
  - Due date picker
  - Priority selector (radio buttons or dropdown)
  - Tags input (autocomplete, chip display)
  - Recurrence toggle and configuration
  - Save/Cancel buttons
- **Validation**: Real-time validation feedback
- **Modal**: Overlay modal for editing

#### 2.3 Task Filters
- **Components**:
  - Completion status filter
  - Priority filter
  - Tag filter (multi-select)
  - Date range filter
  - Search input
- **UI**: Dropdown menus, checkboxes, date pickers

### 3. Calendar View UI

#### 3.1 Monthly Calendar
- **Layout**: 7-column grid (Sunday-Saturday)
- **Features**:
  - Month/year header with navigation
  - Today highlight
  - Task dots/indicators on dates
  - Click date to view tasks
  - Color-coded by priority
- **Responsive**: Stack on mobile, grid on desktop

#### 3.2 Weekly Calendar
- **Layout**: 7-day horizontal layout
- **Features**:
  - Time slots (if time tracking added)
  - Task cards in time slots
  - Scrollable columns
  - Week navigation

#### 3.3 Agenda View
- **Layout**: Vertical list
- **Features**:
  - Grouped by date
  - Task cards with details
  - Expandable date sections
  - Infinite scroll or pagination

### 4. Habit Tracking UI

#### 4.1 Habit List
- **Components**:
  - Habit cards with:
    - Name and description
    - Current streak display
    - Completion button
    - Quick stats
  - "Add Habit" button
- **Layout**: Grid or list view
- **Empty State**: "Start tracking habits" message

#### 4.2 Habit Form
- **Components**:
  - Name input
  - Description textarea
  - Frequency selector
  - Days of week selector (for weekly/custom)
  - Color picker
  - Icon selector (optional)
- **Modal**: Overlay modal

#### 4.3 Habit Detail View
- **Components**:
  - Habit header (name, description)
  - Streak display (current and best)
  - Completion button
  - Heatmap visualization
  - Statistics cards
  - Completion history list

#### 4.4 Habit Heatmap
- **Visualization**: GitHub-style grid
- **Features**:
  - 365-day view (or since creation)
  - Color intensity based on completions
  - Hover tooltip with date and count
  - Click to view/edit completion
  - Responsive scaling

### 5. UI Components Library

#### 5.1 Reusable Components
- **Button**: Primary, secondary, danger variants
- **Input**: Text, textarea, date, select
- **Modal**: Overlay with close button
- **Card**: Container with shadow and padding
- **Badge**: For tags, priorities, status
- **Loading Spinner**: For async operations
- **Toast Notifications**: Success, error, info messages
- **Dropdown Menu**: For filters and actions
- **Checkbox**: Custom styled
- **Radio Button**: Custom styled
- **Date Picker**: Calendar popup
- **Tag Input**: Chip-based tag entry

#### 5.2 Design System
- **Colors**:
  - Primary: Blue (#3B82F6)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Danger: Red (#EF4444)
  - Priority colors: None (gray), Low (blue), Medium (yellow), High (red)
- **Typography**: Clear hierarchy, readable fonts
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle elevation for cards and modals
- **Animations**: Smooth transitions, loading states

---

## Technical Specifications

### 1. Technology Stack

#### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand (for complex state) or React Context
- **Date Library**: date-fns
- **Validation**: Zod
- **Charts**: Recharts

#### Backend
- **Framework**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js v5 or JWT
- **Password Hashing**: bcryptjs (10+ rounds)

#### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript compiler
- **Version Control**: Git

### 2. Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/tick-always
# or
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/tick-always

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### 3. Code Organization

#### File Structure
```
tick-always/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── calendar/
│   │   │   └── page.tsx
│   │   └── habits/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/
│   │   │   │   └── route.ts
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   └── me/
│   │   │       └── route.ts
│   │   ├── tasks/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── complete/
│   │   │           └── route.ts
│   │   ├── habits/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── complete/
│   │   │       │   └── route.ts
│   │   │       ├── stats/
│   │   │       │   └── route.ts
│   │   │       └── heatmap/
│   │   │           └── route.ts
│   │   └── calendar/
│   │       ├── route.ts
│   │       ├── month/
│   │       │   └── route.ts
│   │       └── week/
│   │           └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── mongodb.ts
│   ├── auth.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Task.ts
│   │   ├── Habit.ts
│   │   └── HabitCompletion.ts
│   └── utils/
│       ├── recurrence.ts
│       ├── streak.ts
│       ├── dateHelpers.ts
│       └── validation.ts
├── components/
│   ├── tasks/
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   ├── TaskForm.tsx
│   │   └── TaskFilters.tsx
│   ├── habits/
│   │   ├── HabitList.tsx
│   │   ├── HabitCard.tsx
│   │   ├── HabitForm.tsx
│   │   ├── HabitHeatmap.tsx
│   │   └── StreakDisplay.tsx
│   ├── calendar/
│   │   ├── CalendarView.tsx
│   │   ├── CalendarGrid.tsx
│   │   ├── CalendarEvent.tsx
│   │   └── DatePicker.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Loading.tsx
│       └── Toast.tsx
├── types/
│   └── index.ts
├── .env.local
├── .cursorrules
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

### 4. Security Requirements

#### Authentication
- JWT tokens with expiration (24 hours)
- Secure password hashing (bcryptjs, 10+ rounds)
- HTTP-only cookies for token storage
- CSRF protection

#### Data Validation
- Validate all user inputs with Zod schemas
- Sanitize user-generated content
- Prevent XSS attacks
- SQL injection prevention (Mongoose handles this)

#### Authorization
- Verify user ownership of resources
- Middleware for protected routes
- Rate limiting on API endpoints

### 5. Performance Requirements

#### Optimization
- Pagination for large lists (20 items per page)
- Lazy loading for calendar data
- MongoDB indexes on frequently queried fields
- React.memo for expensive components
- Image optimization with Next.js Image

#### Caching
- Cache habit stats (invalidate on completion)
- Cache calendar data for current month
- Use Next.js caching for static data

#### Response Times
- API responses: < 200ms for simple queries
- Page loads: < 1s initial load
- Task toggle: < 100ms feedback

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
1. Set up MongoDB connection
2. Create Mongoose models (User, Task, Habit, HabitCompletion)
3. Set up authentication system
4. Create basic UI layout (header, sidebar, routing)
5. Implement login/register pages

### Phase 2: Basic Tasks (Week 2)
1. Task CRUD API endpoints
2. Task list UI component
3. Task form (create/edit)
4. Task item component
5. Mark complete functionality
6. Basic filtering

### Phase 3: Recurring Tasks (Week 3)
1. Recurrence rule UI component
2. Recurrence calculation logic
3. Next occurrence generation
4. Recurring task display
5. Test all recurrence patterns

### Phase 4: Calendar View (Week 4)
1. Calendar UI components
2. Calendar API endpoints
3. Task display on calendar
4. Date navigation
5. Month/week/agenda views

### Phase 5: Habit Tracking (Week 5)
1. Habit CRUD API
2. Habit list UI
3. Habit form
4. Mark habit complete
5. Streak calculation logic

### Phase 6: Habit Visualization (Week 6)
1. Heatmap component
2. Streak display
3. Statistics dashboard
4. Completion history
5. Charts and graphs

### Phase 7: Polish & Optimization (Week 7)
1. Mobile responsiveness
2. Loading states and error handling
3. Performance optimization
4. UI/UX improvements
5. Testing and bug fixes

---

## Non-Functional Requirements

### 1. Usability
- Intuitive user interface
- Clear navigation
- Helpful error messages
- Accessible (WCAG 2.1 AA compliance)
- Keyboard navigation support

### 2. Reliability
- 99% uptime target
- Graceful error handling
- Data backup strategy
- Transaction support for critical operations

### 3. Scalability
- Support 1000+ concurrent users
- Efficient database queries
- Pagination for large datasets
- Optimized API responses

### 4. Maintainability
- Clean, documented code
- TypeScript for type safety
- Consistent code style
- Modular architecture

### 5. Security
- Secure authentication
- Data encryption in transit (HTTPS)
- Input validation and sanitization
- Regular security audits

### 6. Performance
- Fast page loads (< 1s)
- Responsive interactions (< 100ms)
- Efficient database queries
- Optimized assets

---

## Future Enhancements (Optional)

### Phase 8+ (Future)
1. **Pomodoro Timer**: Focus timer for tasks
2. **Eisenhower Matrix**: Task prioritization view
3. **AI Task Suggestions**: Smart task recommendations
4. **Push Notifications**: Browser notifications for due tasks
5. **Collaboration**: Share tasks/lists with others
6. **Time Tracking**: Track time spent on tasks
7. **Task Templates**: Pre-defined task templates
8. **Export/Import**: Export data as JSON/CSV
9. **Dark Mode**: Theme switching
10. **Mobile App**: Native mobile applications

---

## Success Criteria

### Functional
- ✅ Users can create, edit, and delete tasks
- ✅ Recurring tasks generate correctly
- ✅ Calendar displays tasks accurately
- ✅ Habits track completions and streaks
- ✅ All API endpoints work as specified

### Technical
- ✅ All TypeScript errors resolved
- ✅ No console errors in production
- ✅ API response times < 200ms
- ✅ Mobile responsive design
- ✅ Accessible UI components

### User Experience
- ✅ Intuitive navigation
- ✅ Clear feedback for actions
- ✅ Helpful error messages
- ✅ Fast, responsive interface
- ✅ Modern, clean design

---

## Notes

- This document is a living document and should be updated as requirements evolve
- Prioritize core features (tasks, habits, calendar) before optional enhancements
- Test thoroughly, especially recurrence logic and streak calculations
- Consider user feedback for UI/UX improvements
- Maintain code quality and documentation throughout development

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Active Development

