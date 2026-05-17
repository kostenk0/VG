# VG / VisaForge — Architecture

> Working product name: VisaForge. Final name TBD before public launch.
> This document is the north-star for the entire product. Future sub-projects (auth, payments, AI chat, templates) reference it; deviations require updating this file.

## Tech stack

This table describes the **target architecture for the full product**. Items marked _later_ are not built yet — they are placed as references for future sub-projects. Only landing-related rows are implemented in the MVP Foundation sub-project.

| Layer                  | Choice                                                | Why                                                                                            |
| ---------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Frontend (marketing)   | Vite + React + TS + Tailwind v4 + shadcn/ui           | Fast, static, SEO-friendly; standard 2026 stack for React landings                             |
| Frontend (app, later)  | Next.js 15 (App Router)                               | SSR needed for auth + per-template SEO                                                         |
| Backend (later)        | Nest.js (TS)                                          | DI container, modular by design, enforces SOLID boundaries                                     |
| Database               | PostgreSQL 16 (single instance, JSONB where flexible) | Relational + flexible fields; one moving part instead of two                                   |
| Cache / queues (later) | Redis                                                 | Sessions, rate limiting, BullMQ for AI jobs                                                    |
| ORM (later)            | Prisma                                                | Type-safe queries, migrations, Nest-friendly                                                   |
| AI (later)             | Anthropic Claude (Sonnet chat / Opus deep analysis)   | Best long-form / nuance quality for legal-adjacent text                                        |
| Payments (later)       | Stripe (Checkout + Customer Portal)                   | SaaS standard, sales tax handled                                                               |
| Email (later)          | Resend                                                | Modern API, React Email templates                                                              |
| Auth (later)           | Better Auth                                           | User data stays in our Postgres; magic-link + Google + LinkedIn OAuth; 2FA gated to Pro/Expert |
| Storage (later)        | Cloudflare R2                                         | S3-compatible, cheaper for user-uploaded documents                                             |
| Observability (later)  | Sentry + Better Stack                                 | Errors + structured logs                                                                       |
| Infra (later)          | Docker; Railway or Render                             | No k8s below 10k users                                                                         |
| Frontend deploy (MVP)  | GitHub Pages                                          | Free, sufficient for static landing                                                            |

## Modular monolith (planned backend shape)

Single Nest.js application, partitioned into modules. Each module owns `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, `entities/`. Importing **internal** files from another module is forbidden — only the module's public `index.ts` barrel is allowed. This is where SOLID boundaries are enforced.

Initial modules planned:

- `auth/` — registration, login, magic-link, Better Auth integration, session management
- `users/` — profile, language preference, settings
- `billing/` — Stripe webhooks, subscription tiers (Free / Pro / Expert), entitlements
- `ai-chat/` — Anthropic integration, conversation history, per-tier rate limits, UPL guardrails
- `templates/` — petition templates, tier-gated access, PDF generation
- `quiz/` — questions, recommendation logic, save result to profile
- `lawyer-reviews/` — Expert tier, attorney partner mapping, review statuses
- `notifications/` — Resend wrappers, email templates
- `shared/` — types, guards, utilities (non-domain)

**When to split into services:** only when a concrete reason exists — AI chat saturates CPU and needs its own container, payments need an independent SLA, etc. Not before.

## UPL strategy (critical)

The AI must never give legal advice. Allowed behaviors only:

- Explain general visa requirements (sourced from public USCIS information)
- Help structure what the user has already written
- Document checklists
- Field-completeness checks

Implementation:

- Every AI request includes a hard-guardrail system prompt: "You are NOT a lawyer. Never give legal advice. Recommend consulting a licensed attorney for any specific legal question."
- Every AI response is rendered with an inline "This is not legal advice" banner.
- All AI requests are logged for audit.
- Landing page, product surfaces, and the standalone `/disclaimer` page reinforce this messaging.

## Data model (planned)

Initial Postgres tables: `users`, `sessions`, `subscriptions`, `quiz_results`, `documents` (JSONB for flexible fields), `template_purchases`, `ai_conversations`, `ai_messages`, `lawyer_reviews`. Detailed schemas are owned by each sub-project's spec.

## Deployment path

| Stage                  | Frontend         | Backend                          | DB                               |
| ---------------------- | ---------------- | -------------------------------- | -------------------------------- |
| MVP (now)              | GitHub Pages     | —                                | —                                |
| Beta (auth + payments) | Cloudflare Pages | Railway (single Nest container)  | Railway Postgres                 |
| GA                     | Cloudflare Pages | Railway / Fly.io (2–3 instances) | Railway / Neon                   |
| Scale                  | Same             | k8s if genuinely needed          | Managed Postgres + read replicas |

## Explicit "no" decisions

- Microservices at MVP — complexity without benefit
- MongoDB — adds nothing over Postgres + JSONB
- DIY auth — Better Auth handles this
- GraphQL — REST + tRPC between apps is sufficient
- Kubernetes — overkill below 10k users
- Self-hosted AI models — use provider APIs

## Repository layout

```
vg/
├── apps/
│   └── landing/          # current MVP — Vite+React landing
│   # future:
│   # app/                # Next.js authenticated app
│   # admin/              # internal admin panel
│   # api/                # Nest.js modular monolith
├── packages/
│   # future shared packages:
│   # api-contracts/      # Zod schemas shared between frontend and backend
│   # ui/                 # shared design system
│   # i18n/               # shared translation tooling
├── docs/superpowers/
│   ├── specs/            # design specs per sub-project
│   └── plans/            # implementation plans per sub-project
├── .github/workflows/
├── ARCHITECTURE.md       # this document
└── pnpm-workspace.yaml
```

## Sub-project sequence

1. **MVP Foundation** (current) — this monorepo + landing + ARCHITECTURE.md
2. App scaffold — Next.js app at `apps/app`, shared design system extracted to `packages/ui`
3. Auth service — Nest backend bootstrap, Better Auth integration (magic-link + Google + LinkedIn OAuth)
4. Quiz funnel — questions, recommendation logic, profile save
5. Templates + payments — Stripe Checkout, entitlement gating, PDF generation
6. AI chat — Anthropic integration with UPL guardrails, tier rate limits
7. Lawyer reviews — Expert tier, attorney partner workflow
8. Additional languages — ES, ZH, HI based on waitlist demand
