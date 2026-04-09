# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WhatsApp Broadcast SaaS — a web platform for Israeli organizations to send bulk WhatsApp messages via Meta's official Cloud API. Users upload Excel recipient lists, compose personalized message templates, get Meta approval, and send. Prepaid credit model (no subscription). Hebrew RTL interface.

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Next.js 14 (App Router) — `apps/web/`
- **Backend**: Fastify + TypeScript — `apps/api/`
- **Database**: PostgreSQL (Supabase-hosted) + Drizzle ORM — `packages/db/`
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Jobs**: BullMQ with Redis
- **Payments**: Stripe (hosted checkout)
- **Email**: Resend + React Email
- **WhatsApp**: Meta Cloud API (direct, no BSP)
- **UI**: Tailwind CSS + shadcn/ui, RTL-first

## Commands

```bash
# Install dependencies
pnpm install

# Run all dev servers (frontend :3000, backend :3001)
pnpm dev

# Run individual apps
pnpm --filter @repo/web dev
pnpm --filter @repo/api dev

# Build all packages
pnpm build

# Database
pnpm db:generate    # Generate Drizzle migrations
pnpm db:push        # Push schema to Supabase

# Lint
pnpm lint
```

## Architecture

```
packages/shared/    → Shared types, validation (phone, campaign, auth), constants (credit packs, limits)
packages/db/        → Drizzle ORM schema + migrations (users, campaigns, recipients, message_logs, credit_transactions, payments)
apps/api/           → Fastify REST API with BullMQ workers
apps/web/           → Next.js SPA with Supabase Auth, Zustand stores
```

### Key Data Flow

1. **Campaign creation**: 5-step wizard (name → Excel upload → template compose → review → send)
2. **Excel processing**: Upload → server-side parse (SheetJS) → phone normalization (Israeli 05X→+972) → validation summary → bulk insert recipients
3. **Template approval**: Compose → submit to Meta API → webhook listener for approval/rejection → SSE to frontend
4. **Sending**: BullMQ rate-limited worker → Meta send API → per-message status tracked → SSE progress to frontend
5. **Webhooks**: Meta delivery/read webhooks → immediate 200 response → async BullMQ processing → update message_logs

### Campaign State Machine

`draft → pending_template_approval → ready_to_send → sending → sent/partially_failed/failed`

Also: `template_rejected` (from pending), `scheduled` (from ready_to_send), `canceled` (from scheduled)

All transitions enforced server-side via `isValidTransition()` in `@repo/shared`.

### Auth Flow

Supabase Auth manages signup, login, Google OAuth, email verification, password reset, JWT. Backend validates Supabase JWT via `requireAuth` middleware. Our `users` table syncs with Supabase `auth.users`.

## Conventions

- **Hebrew RTL**: All UI is `dir="rtl"`. Use Tailwind `rtl:` variants where needed. Design uses teal (#0F766E) as primary color.
- **Credits**: 1 credit = 1 message. Deducted per-message on successful send (not upfront). Atomic balance updates with `SELECT FOR UPDATE`.
- **File handling**: Temp storage only. Excel files deleted after campaign completion or 24 hours.
- **Environment**: Copy `.env.example` to `.env`. Supabase for Postgres + Auth, local Redis via `docker-compose up redis`.
- **Never delete user data** without explicit user instruction (per ImpactMakery standards).
