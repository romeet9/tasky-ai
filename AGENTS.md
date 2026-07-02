<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Task Planner — Project Guide

Next.js 15 App Router + TypeScript + Tailwind CSS (v4) + localStorage.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run start      # Start production server
```

## Architecture

- `app/` — Next.js App Router pages and API routes
- `app/api/tasks/route.ts` — API endpoint for task creation (POST)
- `components/` — React components (Navigation, TaskList, TaskCard, EmptyState)
- `lib/tasks.ts` — localStorage CRUD utilities
- `types/task.ts` — Task and SubTask TypeScript interfaces

## Data Model

```typescript
interface SubTask {
  id: string;
  label: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  subtasks: SubTask[];
  createdAt: string;
  status: "pending" | "in-progress" | "completed";
}
```

## How to Insert Tasks via API

When a user gives you a morning brief, break it into structured tasks and POST to `/api/tasks`:

```json
{
  "brief": "Today I need to finish the auth module, review 3 PRs, write docs"
}
```

Or send pre-structured tasks directly:

```json
{
  "tasks": [
    {
      "id": "unique-id",
      "title": "Finish the auth module",
      "description": "Complete authentication module implementation",
      "category": "Work",
      "subtasks": [
        { "id": "sub-1", "label": "Review auth requirements and token flow", "completed": false },
        { "id": "sub-2", "label": "Implement login and session management", "completed": false },
        { "id": "sub-3", "label": "Write unit tests for auth functions", "completed: false }
      ],
      "createdAt": "2025-01-15T09:00:00.000Z",
      "status": "pending"
    }
  ]
}
```

## Subtask Labeling Rules

Every subtask `label` must clearly describe what that subtask is about. Good examples:
- "Review requirements and understand scope"
- "Write the code and run local tests"
- "Prepare agenda and key discussion points"

Bad examples (too vague):
- "Do it", "Step 1", "Part A"

## Design System

This app uses the Apple design system. Read `~/awesome-design-md/design-md/apple/DESIGN.md` for the full design system before making any UI changes.

Key rules:
- Font: Inter with Apple's exact sizing, weights, and negative letter-spacing
- Colors: Apple Blue (#0071e3) as sole accent, black (#000000) and light gray (#f5f5f7) backgrounds
- Components: pill CTAs (980px radius), glass nav, soft shadows
- No extra accent colors, no gradients on backgrounds, no borders on cards
