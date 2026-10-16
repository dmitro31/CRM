# CRM Platform

A full-stack CRM with workspaces, a Kanban task board, workflow automation and an AI assistant. The backend is built with NestJS and Prisma, the frontend with Next.js.

**Live demo:** https://crm-platform.site

## Features

- **Workspaces** - each workspace has its own records, tasks, members and settings
- **Kanban task board** - tasks grouped by status, native HTML5 drag-and-drop, optimistic updates with rollback on error
- **Workflow automation builder** - conditions and actions with inline validation, drag-and-drop reordering and a human-readable preview of the workflow
- **AI assistant** - persistent conversations and message history, a conversation sidebar, optimistic message rendering, keyboard shortcuts
- **Activity timeline** - a history of changes for every record
- **Comments** - with `@mentions` and notifications for mentioned users
- **Analytics** - a workspace statistics endpoint built on Prisma `groupBy`

## Tech Stack

| Layer    | Technologies                                                   |
| -------- | -------------------------------------------------------------- |
| Backend  | NestJS, Prisma, PostgreSQL                                     |
| Frontend | Next.js (App Router), React, React Query, Axios, Recharts      |
| Language | TypeScript                                                     |

## Project Structure

```
backend/    NestJS API (modules, Prisma schema and migrations)
frontend/   Next.js app (app/workspace/[id]/..., lib/*-api.ts)
```

## Getting Started

### Requirements

- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
npm install
cp .env.example .env        # set DATABASE_URL and other variables
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # set the API URL
npm run dev
```

## Architecture Notes

- The frontend keeps one API client per domain in `lib/*-api.ts`
- Data is fetched with React Query, and queries are invalidated by `queryKey` after every mutation
- Heavy aggregations (statistics) are done on the backend instead of in the browser
- Backend modules are small and explicit: a provider module exports its service, and the consuming module imports it

## Author

Dmytro Abramiak - https://github.com/dmitro31
