<div align="center">

![TaskyAI](docs/screenshots/banner.png)

# TaskyAI — AI Task Planner

Turn a plain-English brief into structured, prioritized tasks — with subtasks, categories, team workspaces, and role-based assignment. A full-stack Next.js app with Firebase auth, real-time Firestore, RBAC team workspaces, and an AI planning assistant.

<br>

[![Live App](https://img.shields.io/badge/Live_App-task--planner-FF6363?style=for-the-badge&logo=vercel&logoColor=white)](https://task-planner-seven-zeta.vercel.app)
&nbsp;
[![Guided Demo](https://img.shields.io/badge/Guided_Demo-no_signup-55b3ff?style=for-the-badge&logo=googlechrome&logoColor=white)](https://task-planner-seven-zeta.vercel.app/demo)

<br>

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-DD2C00?style=flat-square&logo=firebase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## 📊 At a glance

![TaskyAI at a glance](docs/screenshots/kpi-cards.png)

---

## ✨ Highlights

- **AI task planning** — describe your day in the chat; the assistant returns tasks with descriptions, categories, priorities, due dates, and subtasks.
- **Team workspaces + RBAC** — owner / admin / member / viewer roles, member invites, and manager-only AI task assignment across a team.
- **Manager team board** — a Kanban view grouped by assignee, filterable by member, category, and date.
- **Full auth** — email/password and Google OAuth, signup, email verification, password reset, and httpOnly session cookies.
- **Unified settings** — editable profile, workspaces, plan, model, Google Calendar connect, and sign out on one page.
- **Guided live demo** — a public `/demo` route that teaches the product through interactive demo tasks.

---

## 📸 Screenshots

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/landing.png" alt="Landing page"><br><sub><b>Landing</b> — marketing home with live-demo CTA</sub></td>
    <td width="50%"><img src="docs/screenshots/demo-guided.png" alt="Guided demo board"><br><sub><b>Guided demo</b> — a getting-started checklist beside a real team board</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/demo-subtasks.png" alt="Task with subtasks"><br><sub><b>Interactive tasks</b> — expandable, checkable subtasks with live progress</sub></td>
    <td width="50%"><img src="docs/screenshots/login.png" alt="Login"><br><sub><b>Auth</b> — email/password + Google, verification & reset</sub></td>
  </tr>
</table>

---

## 🧱 Tech stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Framer Motion |
| Auth & data | Firebase Authentication, Cloud Firestore, Firebase Admin SDK |
| AI | Gemma 4 via Ollama Cloud (provider abstraction in `lib/llm-providers.ts`) |
| Hosting | Vercel |

---

## 🚀 Getting started

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

### Scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # serve the production build
```

---

## 🗂️ Project structure

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

<div align="center"><sub>Built with Next.js, Firebase, and Gemma 4 · <a href="https://task-planner-seven-zeta.vercel.app">Live app</a> · <a href="https://task-planner-seven-zeta.vercel.app/demo">Try the demo</a></sub></div>
