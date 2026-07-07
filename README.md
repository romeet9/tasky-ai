# TaskyAI — AI Task Planner

Turn a plain-English morning brief into structured, prioritized tasks with subtasks, categories, and team assignments — automatically. TaskyAI is a full-stack Next.js app with Firebase auth, real-time Firestore data, role-based team workspaces, and an AI planning assistant.

**🔗 Live app:** https://task-planner-seven-zeta.vercel.app
**🎮 Guided live demo (no signup):** https://task-planner-seven-zeta.vercel.app/demo

---

## Screenshots

### Landing
![Landing page](docs/screenshots/landing.png)

### Guided live demo
An interactive, no-login demo. The first column is a "Getting Started" checklist that walks a first-time visitor through the whole product; the rest of the board shows a realistic team.
![Guided demo board](docs/screenshots/demo-guided.png)

### Interactive tasks
Every task expands into checkable subtasks with live progress.
![Task with subtasks](docs/screenshots/demo-subtasks.png)

### Authentication
Email/password and Google sign-in, with signup, email verification, and password reset.
![Login](docs/screenshots/login.png)

---

## Features

- **AI task planning** — describe your day in the chat; the assistant breaks it into tasks with descriptions, categories, priorities, due dates, and subtasks.
- **Team workspaces + RBAC** — owner / admin / member / viewer roles, member invites, and manager-only AI task assignment across the team.
- **Manager team board** — a Kanban view grouped by assignee, filterable by member, category, and date.
- **Authentication** — email/password and Google OAuth, email verification, password reset, and httpOnly session cookies.
- **Settings** — editable profile, workspace overview, plan, model, Google Calendar connect, and sign out, all in one place.
- **Guided live demo** — a public `/demo` route that teaches the product through interactive demo tasks.
- **Google Calendar** — pull meetings and events into the workspace.

## Tech stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4, Framer Motion
- **Auth & data:** Firebase Authentication, Cloud Firestore, Firebase Admin SDK
- **AI:** Gemma 4 (via Ollama Cloud); provider abstraction in `lib/llm-providers.ts`
- **Hosting:** Vercel

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Create a `.env.local` with your Firebase and model credentials:

```bash
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase (admin)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# AI model (Gemma 4 via Ollama Cloud)
OLLAMA_API_KEY=
OLLAMA_BASE_URL=https://ollama.com
```

## Scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # serve the production build
```

## Project structure

```
app/            Next.js App Router pages + API routes
  api/chat/     AI planning endpoint
  demo/         public guided demo
  settings/     account & preferences
components/     UI (chat, task board, auth, landing)
lib/            auth, LLM providers, RBAC, workspace, demo data
hooks/          client hooks (user profile, admin auth)
types/          shared TypeScript types
```
