# VG / VisaForge

AI-assisted self-filing platform for US immigration visas. Working product name: **VisaForge**.

> Architecture and product roadmap live in [`ARCHITECTURE.md`](./ARCHITECTURE.md).
> Design specs and implementation plans live under [`docs/superpowers/`](./docs/superpowers/).

## Repository

This is a pnpm-workspace monorepo. Current contents:

- `apps/landing/` — Vite + React landing page deployed to GitHub Pages
- `packages/` — empty placeholder for future shared packages
- `docs/` — specs and plans
- `ARCHITECTURE.md` — north-star architectural document

## Prerequisites

- Node.js 20.18.0 (use `nvm use` to pick it up from `.nvmrc`)
- pnpm 9.12.0 (`corepack enable && corepack prepare pnpm@9.12.0 --activate`)

## Setup

```bash
pnpm install
```

## Landing page

```bash
pnpm landing:dev         # dev server at http://localhost:5173/vg/
pnpm landing:build       # production build → apps/landing/dist
pnpm landing:preview     # preview the production build at :4173
pnpm landing:test        # Vitest unit/component tests (smoke)
pnpm landing:e2e         # Playwright e2e (boots a preview server)
```

### Configuring the waitlist Google Form

The waitlist CTA points to a placeholder. Replace `PLACEHOLDER_FORM_ID` in `apps/landing/src/lib/config.ts` with the live Google Form URL before deploying to production.

### Replacing the placeholder OG image

`apps/landing/public/og-image.png` is a placeholder. Replace it with a 1200×630 PNG export from Figma before launch.

## Quality gates

Pre-commit hook runs Prettier and ESLint on staged files. Commit-msg hook enforces Conventional Commits. CI runs lint, type-check, unit tests, Playwright, Lighthouse (Performance ≥ 90, Accessibility ≥ 95), then deploys to GitHub Pages on push to `main`.

## Deployment

GitHub Pages is configured to deploy from GitHub Actions. Enable in repo Settings → Pages → Source: **GitHub Actions**. Each push to `main` that touches `apps/landing/**` triggers `.github/workflows/deploy-landing.yml`.

The site is served from `https://<github-user>.github.io/vg/`. To switch to a custom domain, add a `CNAME` file under `apps/landing/public/` and update `base` in `apps/landing/vite.config.ts` to `'/'`.
