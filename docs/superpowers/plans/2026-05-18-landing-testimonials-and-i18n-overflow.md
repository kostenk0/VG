# Landing testimonials carousel & UK header overflow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two landing-page changes — fix the Ukrainian waitlist-button mobile overflow and add a testimonials carousel — in two reviewable PR-sized chunks on a shared working branch.

**Architecture:** PR #1 makes `WaitlistCTA` responsive (icon below `sm`, full text above) and is gated by a Playwright regression for the UK locale at 320px. PR #2 adds a thin `Carousel` UI primitive over `embla-carousel-react`, a `TestimonialCard`, and a `Testimonials` section reading 10 composite-persona records from `apps/landing/src/data/testimonials.json` with localized quotes in a new `testimonials` i18n namespace. The section is inserted between `PricingTeaser` and `FAQ` in `Home.tsx`.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind v4 + shadcn/ui + framer-motion (already present); `embla-carousel-react` (new dep, ~6kB gzipped); `lucide-react` icons (already a dep); Vitest + happy-dom for unit, Playwright + Chromium for E2E.

**Source spec:** `docs/superpowers/specs/2026-05-18-landing-testimonials-and-i18n-overflow-design.md`

---

## Branch & PR strategy

The working branch `feat/landing-testimonials-and-i18n-overflow` already contains the spec and the `.gitignore` update for `.superpowers/`. We continue all implementation work on this branch. At push time, choose either:

- **Default — one combined PR to `main`** containing spec + Phase 1 + Phase 2 commits. Reviewer reads commit-by-commit (commits are deliberately scoped). Faster to land.
- **Split — two PRs** by cherry-picking Phase 1 commits onto a new branch `fix/landing-uk-header-overflow` from `main`, then Phase 2 commits onto a separate branch `feat/landing-testimonials-carousel`. Use this only if a reviewer asks for separation.

Either way, commit boundaries are aligned so the split is possible at any time.

---

## File map

**Created (PR #1):**

- `apps/landing/e2e/header.spec.ts` — regression for UK overflow

**Modified (PR #1):**

- `apps/landing/src/components/WaitlistCTA.tsx` — add `responsive` prop
- `apps/landing/src/components/Header.tsx` — pass `responsive`

**Created (PR #2):**

- `apps/landing/src/data/testimonials.json` — 10 persona records
- `apps/landing/src/ui/carousel.tsx` — embla wrapper primitive
- `apps/landing/src/components/TestimonialCard.tsx` — single-card render
- `apps/landing/src/components/sections/Testimonials.tsx` — full section
- `apps/landing/src/tests/TestimonialCard.test.tsx` — unit
- `apps/landing/src/tests/Carousel.test.tsx` — unit (reduced-motion)
- `apps/landing/e2e/testimonials.spec.ts` — E2E

**Modified (PR #2):**

- `apps/landing/src/i18n/en.json` — add `testimonials` namespace
- `apps/landing/src/i18n/uk.json` — add `testimonials` namespace
- `apps/landing/src/i18n/index.ts` — register namespace + types
- `apps/landing/src/pages/Home.tsx` — insert `<Testimonials />`
- `apps/landing/package.json` — add `embla-carousel-react`

---

# Phase 1 — PR #1: UK header overflow fix

### Task 1: Failing Playwright regression test for header overflow

**Files:**

- Create: `apps/landing/e2e/header.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/landing/e2e/header.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 375, height: 667 },
]

const PATHS = ['/', '/disclaimer']

for (const viewport of VIEWPORTS) {
  for (const path of PATHS) {
    test(`no horizontal overflow at ${viewport.width}x${viewport.height} (UK) on ${path}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.goto(path)
      // switch to UK via the LangSwitcher (matches what real users do)
      await page
        .getByRole('group', { name: /мова|language/i })
        .getByRole('button', { name: 'UK' })
        .click()
      const dims = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(dims.scrollWidth).toBe(dims.clientWidth)
    })
  }
}

test('header CTA remains an accessible link in UK at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/')
  await page
    .getByRole('group', { name: /мова|language/i })
    .getByRole('button', { name: 'UK' })
    .click()
  // Header has exactly one CTA; both icon and full-text variants must carry the localized aria-label
  const headerCta = page.locator('header').getByRole('link', { name: /приєднатися до waitlist/i })
  await expect(headerCta).toBeVisible()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @vg/landing exec playwright test e2e/header.spec.ts`

Expected: the four overflow tests FAIL because `scrollWidth > clientWidth` (the UK button currently overflows). The "header CTA accessible link" test may PASS today (button is reachable by name) — that's fine, it's a follow-up assertion that protects the icon variant.

- [ ] **Step 3: Commit**

```bash
git add apps/landing/e2e/header.spec.ts
git commit -m "test(landing): add UK header overflow regression"
```

---

### Task 2: Make `WaitlistCTA` responsive

**Files:**

- Modify: `apps/landing/src/components/WaitlistCTA.tsx`

- [ ] **Step 1: Replace `WaitlistCTA` with the responsive variant**

Replace the entire contents of `apps/landing/src/components/WaitlistCTA.tsx` with:

```tsx
import { useTranslation } from 'react-i18next'
import { Mail } from 'lucide-react'
import { Button } from '@/ui/button'
import { WAITLIST_URL } from '@/lib/config'
import { cn } from '@/lib/utils'

interface WaitlistCTAProps {
  size?: 'default' | 'lg'
  variant?: 'default' | 'outline'
  className?: string
  /**
   * When true, renders icon-only below the `sm` breakpoint and full text at `sm+`.
   * The visible label is hidden via Tailwind, but `aria-label` is always set so SR users get the same affordance.
   */
  responsive?: boolean
}

export function WaitlistCTA({
  size = 'default',
  variant = 'default',
  className,
  responsive = false,
}: WaitlistCTAProps) {
  const { t } = useTranslation('common')
  const label = t('joinWaitlist')

  return (
    <Button
      asChild
      size={size}
      variant={variant}
      className={cn(responsive && 'w-10 px-0 sm:w-auto sm:px-4', className)}
    >
      <a href={WAITLIST_URL} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {responsive ? (
          <>
            <Mail className="h-4 w-4 sm:hidden" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </a>
    </Button>
  )
}
```

- [ ] **Step 2: Run the existing unit test**

Run: `pnpm --filter @vg/landing exec vitest run src/tests/WaitlistCTA.test.tsx`

Expected: PASS. The existing tests use `getByRole('link', { name: /waitlist/i })` which matches the `aria-label` regardless of variant — the change is backward-compatible for non-responsive usage (Hero, FinalCTA).

---

### Task 3: Wire `Header` to use the responsive variant

**Files:**

- Modify: `apps/landing/src/components/Header.tsx`

- [ ] **Step 1: Pass `responsive` to the header CTA**

Replace the entire contents of `apps/landing/src/components/Header.tsx` with:

```tsx
import { Link } from 'react-router-dom'
import { LangSwitcher } from './LangSwitcher'
import { WaitlistCTA } from './WaitlistCTA'

export function Header() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          VisaForge
        </Link>
        <div className="flex items-center gap-4">
          <LangSwitcher />
          <WaitlistCTA responsive />
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Run the Playwright regression**

Run: `pnpm --filter @vg/landing exec playwright test e2e/header.spec.ts`

Expected: all five tests PASS. If the overflow tests still fail at 320×640, inspect `page.locator('body')` width — likely culprit is a different element overflowing (e.g., a section content). Fix by narrowing the assertion to header bounds or by tracking down the real offender; do **not** widen the test to allow overflow.

- [ ] **Step 3: Commit**

```bash
git add apps/landing/src/components/WaitlistCTA.tsx apps/landing/src/components/Header.tsx
git commit -m "fix(landing): icon-only waitlist CTA in header below sm breakpoint"
```

---

### Task 4: Phase 1 — full verification & checkpoint

- [ ] **Step 1: Run the landing package quality gates**

Run, in this order:

```bash
pnpm --filter @vg/landing lint
pnpm --filter @vg/landing exec tsc -b
pnpm --filter @vg/landing test
pnpm --filter @vg/landing e2e
```

Expected: all PASS. If a quality gate fails, fix the underlying issue — do not skip hooks or suppress lints to make CI green.

- [ ] **Step 2: Phase 1 checkpoint**

At this point PR #1's commits exist on the working branch:

1. `chore: gitignore .superpowers brainstorm output`
2. `docs: add design spec for landing testimonials + UK header overflow`
3. `test(landing): add UK header overflow regression`
4. `fix(landing): icon-only waitlist CTA in header below sm breakpoint`

Stop and report to the user before continuing to Phase 2. The overflow fix is independently shippable now if priorities change.

---

# Phase 2 — PR #2: Testimonials carousel

### Task 5: Add `embla-carousel-react`

**Files:**

- Modify: `apps/landing/package.json` (via pnpm)
- Modify: `pnpm-lock.yaml` (auto)

- [ ] **Step 1: Install the dep**

Run:

```bash
pnpm --filter @vg/landing add embla-carousel-react@^8
```

Expected: `package.json` gets a new `dependencies` entry like `"embla-carousel-react": "^8.x.y"`, lockfile updates.

- [ ] **Step 2: Verify install**

Run:

```bash
pnpm --filter @vg/landing exec tsc -b
```

Expected: PASS. Confirms the new module resolves under TS.

- [ ] **Step 3: Commit**

```bash
git add apps/landing/package.json pnpm-lock.yaml
git commit -m "chore(landing): add embla-carousel-react dependency"
```

---

### Task 6: Create `testimonials.json` data file

**Files:**

- Create: `apps/landing/src/data/testimonials.json`

- [ ] **Step 1: Create the data file**

Create `apps/landing/src/data/testimonials.json`:

```json
[
  {
    "id": "andrii-k",
    "name": "Andrii K.",
    "role": "ML researcher",
    "visa": "EB-2 NIW",
    "initialsColor": "blue"
  },
  {
    "id": "maria-g",
    "name": "María G.",
    "role": "Founder",
    "visa": "O-1A",
    "initialsColor": "amber"
  },
  {
    "id": "olena-p",
    "name": "Olena P.",
    "role": "Senior PM",
    "visa": "EB-1A",
    "initialsColor": "violet"
  },
  {
    "id": "raj-s",
    "name": "Raj S.",
    "role": "Robotics engineer",
    "visa": "O-1A",
    "initialsColor": "green"
  },
  {
    "id": "dmytro-l",
    "name": "Dmytro L.",
    "role": "Backend engineer",
    "visa": "H-1B → EB-2 NIW",
    "initialsColor": "cyan"
  },
  {
    "id": "sofia-c",
    "name": "Sofia C.",
    "role": "Designer",
    "visa": "O-1A",
    "initialsColor": "rose"
  },
  {
    "id": "volodymyr-b",
    "name": "Volodymyr B.",
    "role": "Researcher",
    "visa": "EB-2 NIW",
    "initialsColor": "blue"
  },
  {
    "id": "anastasiia-r",
    "name": "Anastasiia R.",
    "role": "Data scientist",
    "visa": "EB-2 NIW",
    "initialsColor": "green"
  },
  {
    "id": "marcus-t",
    "name": "Marcus T.",
    "role": "Climate-tech founder",
    "visa": "EB-1A",
    "initialsColor": "amber"
  },
  {
    "id": "yulia-m",
    "name": "Yulia M.",
    "role": "UX engineer",
    "visa": "O-1A",
    "initialsColor": "violet"
  }
]
```

(Prettier will reformat this on commit — that's fine.)

- [ ] **Step 2: Commit**

```bash
git add apps/landing/src/data/testimonials.json
git commit -m "feat(landing): add testimonials persona dataset"
```

---

### Task 7: Add `testimonials` i18n namespace

**Files:**

- Modify: `apps/landing/src/i18n/en.json`
- Modify: `apps/landing/src/i18n/uk.json`

- [ ] **Step 1: Add the EN namespace**

Open `apps/landing/src/i18n/en.json`. Add a new top-level key `"testimonials"` (peer of `"common"`, `"home"`, `"disclaimer"`) — place it after `"home"` and before `"disclaimer"`:

```json
  "testimonials": {
    "heading": "Early-access voices",
    "subheading": "Notes from people we're building this with.",
    "previousLabel": "Previous testimonial",
    "nextLabel": "Next testimonial",
    "dotLabel": "Go to testimonial {{number}} of {{total}}",
    "quotes": {
      "andrii-k": "The petition-letter template was the first time I understood what evidence USCIS actually expects from me.",
      "maria-g": "Five-minute quiz mapped O-1A vs EB-1A side by side, with concrete evidence buckets for each. Huge head-start.",
      "olena-p": "The AI flagged three weak sentences in my NIW letter I'd have shipped without thinking.",
      "raj-s": "Document checklist saved me three weekends of digging through Reddit threads.",
      "dmytro-l": "Found out my H-1B path could pivot to NIW. Hadn't even considered it.",
      "sofia-c": "Recommendation-letter samples were specific to creative work — not just generic engineer templates.",
      "volodymyr-b": "Asked the AI to critique my draft as if it were a USCIS officer. The rewrite suggestions were surgical.",
      "anastasiia-r": "Honest about what AI does and doesn't do — not pretending to be a lawyer. That trust mattered.",
      "marcus-t": "Was paying a $400/hr consultant for the same checklist VisaForge has built in.",
      "yulia-m": "Started out thinking I'd need a lawyer. Finished my draft over two weekends."
    }
  },
```

- [ ] **Step 2: Add the UK namespace**

Open `apps/landing/src/i18n/uk.json`. Add the matching `"testimonials"` key in the same position:

```json
  "testimonials": {
    "heading": "Голоси раннього доступу",
    "subheading": "Нотатки від людей, з якими ми це будуємо.",
    "previousLabel": "Попередній відгук",
    "nextLabel": "Наступний відгук",
    "dotLabel": "Відгук {{number}} з {{total}}",
    "quotes": {
      "andrii-k": "Шаблон петиційного листа вперше показав мені, які саме докази USCIS від мене хоче.",
      "maria-g": "Квіз за п'ять хвилин розклав O-1A проти EB-1A поруч — з конкретними доказовими блоками для кожного. Величезний старт.",
      "olena-p": "AI підкреслив три слабкі речення в моєму NIW-листі, які я б відправив не задумуючись.",
      "raj-s": "Чек-лист документів зекономив мені три вихідні копання по Reddit-тредах.",
      "dmytro-l": "Дізнався, що мій H-1B шлях можна перевести в NIW. Раніше навіть не розглядав.",
      "sofia-c": "Зразки рекомендаційних листів були заточені під креативну роботу, а не типові інженерні шаблони.",
      "volodymyr-b": "Попросив AI розкритикувати мій чорновик ніби це офіцер USCIS. Поради з переписування — точні.",
      "anastasiia-r": "Чесно про те, що AI робить і чого не робить — не вдає юриста. Ця довіра мала значення.",
      "marcus-t": "Платив консультанту $400 за годину за той самий чек-лист, який у VisaForge вбудований.",
      "yulia-m": "Починав з думкою, що потрібен юрист. Закінчив чорновик за два вихідні."
    }
  },
```

- [ ] **Step 3: Verify JSON parses**

Run: `pnpm --filter @vg/landing exec node -e "require('./src/i18n/en.json'); require('./src/i18n/uk.json'); console.log('ok')"`

Expected: prints `ok`. (If `node -e` rejects ESM-only context, the next task's TS build will catch any parse error anyway.)

- [ ] **Step 4: Commit**

```bash
git add apps/landing/src/i18n/en.json apps/landing/src/i18n/uk.json
git commit -m "feat(landing): add testimonials i18n strings (en, uk)"
```

---

### Task 8: Register `testimonials` namespace in i18n init

**Files:**

- Modify: `apps/landing/src/i18n/index.ts`

- [ ] **Step 1: Wire the namespace into i18next**

Replace the entire contents of `apps/landing/src/i18n/index.ts` with:

```ts
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import uk from './uk.json'

export const SUPPORTED_LANGUAGES = ['en', 'uk'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: en.common,
        home: en.home,
        testimonials: en.testimonials,
        disclaimer: en.disclaimer,
      },
      uk: {
        common: uk.common,
        home: uk.home,
        testimonials: uk.testimonials,
        disclaimer: uk.disclaimer,
      },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: 'common',
    ns: ['common', 'home', 'testimonials', 'disclaimer'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'vg-lang',
    },
  })

export default i18n
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @vg/landing exec tsc -b`

Expected: PASS. If TS complains that `en.testimonials` is unknown, ensure Step 1 of Task 7 actually edited the JSON file and that `resolveJsonModule` is set (it is in the default Vite tsconfig — confirm `apps/landing/tsconfig.json` has it if it errors).

- [ ] **Step 3: Commit**

```bash
git add apps/landing/src/i18n/index.ts
git commit -m "feat(landing): register testimonials i18n namespace"
```

---

### Task 9: Failing test for `TestimonialCard`

**Files:**

- Create: `apps/landing/src/tests/TestimonialCard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/landing/src/tests/TestimonialCard.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import { TestimonialCard } from '@/components/TestimonialCard'

function renderCard(overrides: Partial<Parameters<typeof TestimonialCard>[0]> = {}) {
  return render(
    <I18nextProvider i18n={i18n}>
      <TestimonialCard
        id="andrii-k"
        name="Andrii K."
        role="ML researcher"
        visa="EB-2 NIW"
        initialsColor="blue"
        {...overrides}
      />
    </I18nextProvider>,
  )
}

describe('TestimonialCard', () => {
  it('renders name, role and visa', () => {
    renderCard()
    expect(screen.getByText('Andrii K.')).toBeInTheDocument()
    expect(screen.getByText(/ML researcher/)).toBeInTheDocument()
    expect(screen.getByText(/EB-2 NIW/)).toBeInTheDocument()
  })

  it('renders the localized quote from the i18n namespace', () => {
    renderCard()
    expect(screen.getByText(/petition-letter template was the first time/i)).toBeInTheDocument()
  })

  it('derives two-letter initials from the name', () => {
    renderCard({ name: 'María G.' })
    expect(screen.getByText('MG')).toBeInTheDocument()
  })

  it('applies the color class from initialsColor', () => {
    const { container } = renderCard({ initialsColor: 'amber', name: 'María G.' })
    const avatar = container.querySelector('[aria-hidden="true"]')!
    expect(avatar.className).toMatch(/bg-amber-100/)
  })

  it('renders the quote inside a <blockquote>', () => {
    const { container } = renderCard()
    expect(container.querySelector('blockquote')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @vg/landing exec vitest run src/tests/TestimonialCard.test.tsx`

Expected: FAIL with `Cannot find module '@/components/TestimonialCard'` or similar resolution error.

---

### Task 10: Implement `TestimonialCard`

**Files:**

- Create: `apps/landing/src/components/TestimonialCard.tsx`

- [ ] **Step 1: Implement the component**

Create `apps/landing/src/components/TestimonialCard.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/ui/card'

const COLOR_CLASSES = {
  blue: 'bg-blue-100 text-blue-900',
  amber: 'bg-amber-100 text-amber-900',
  green: 'bg-green-100 text-green-900',
  violet: 'bg-violet-100 text-violet-900',
  rose: 'bg-rose-100 text-rose-900',
  cyan: 'bg-cyan-100 text-cyan-900',
} as const

export type TestimonialColor = keyof typeof COLOR_CLASSES

export interface TestimonialCardProps {
  id: string
  name: string
  role: string
  visa: string
  initialsColor: TestimonialColor
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export function TestimonialCard({ id, name, role, visa, initialsColor }: TestimonialCardProps) {
  const { t } = useTranslation('testimonials')
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${COLOR_CLASSES[initialsColor]}`}
          >
            {initialsFrom(name)}
          </div>
          <div>
            <p className="leading-tight font-semibold">{name}</p>
            <p className="text-muted-foreground text-sm">
              {role} · {visa}
            </p>
          </div>
        </div>
        <blockquote className="text-muted-foreground text-sm leading-relaxed">
          {t(`quotes.${id}`)}
        </blockquote>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm --filter @vg/landing exec vitest run src/tests/TestimonialCard.test.tsx`

Expected: all five tests PASS. If the `bg-amber-100` assertion fails because Tailwind v4 doesn't have a default color palette, add the missing color tokens to `apps/landing/src/index.css` under `@theme` — but verify failure first by inspecting the rendered class names in `container.innerHTML`.

- [ ] **Step 3: Commit**

```bash
git add apps/landing/src/components/TestimonialCard.tsx apps/landing/src/tests/TestimonialCard.test.tsx
git commit -m "feat(landing): add TestimonialCard component"
```

---

### Task 11: Failing test for `Carousel` reduced-motion handling

**Files:**

- Create: `apps/landing/src/tests/Carousel.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/landing/src/tests/Carousel.test.tsx`:

```tsx
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

const emblaMock = vi.fn(() => [vi.fn(), undefined as unknown])

vi.mock('embla-carousel-react', () => ({
  default: (...args: unknown[]) => emblaMock(...args),
}))

// Import AFTER vi.mock so the wrapper picks up the mocked module.
import { Carousel, CarouselContent, CarouselItem } from '@/ui/carousel'

function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  })
}

function renderOne() {
  return render(
    <Carousel>
      <CarouselContent>
        <CarouselItem>one</CarouselItem>
      </CarouselContent>
    </Carousel>,
  )
}

describe('Carousel embla wiring', () => {
  beforeEach(() => emblaMock.mockClear())

  it('passes duration=0 to embla when prefers-reduced-motion matches', () => {
    setMatchMedia(true)
    renderOne()
    expect(emblaMock).toHaveBeenCalled()
    const [opts] = emblaMock.mock.calls[0] as [{ duration: number }]
    expect(opts.duration).toBe(0)
  })

  it('passes a non-zero duration when reduced-motion does not match', () => {
    setMatchMedia(false)
    renderOne()
    const [opts] = emblaMock.mock.calls[0] as [{ duration: number }]
    expect(opts.duration).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @vg/landing exec vitest run src/tests/Carousel.test.tsx`

Expected: FAIL with `Cannot find module '@/ui/carousel'`.

---

### Task 12: Implement the `Carousel` primitive

**Files:**

- Create: `apps/landing/src/ui/carousel.tsx`

- [ ] **Step 1: Implement the primitive**

Create `apps/landing/src/ui/carousel.tsx`:

```tsx
import * as React from 'react'
import useEmblaCarousel, { type EmblaCarouselType } from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/ui/button'
import { cn } from '@/lib/utils'

type CarouselApi = EmblaCarouselType

interface CarouselContextValue {
  api: CarouselApi | undefined
  selectedIndex: number
  scrollSnaps: number[]
  scrollTo: (index: number) => void
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel(): CarouselContextValue {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) {
    throw new Error('Carousel sub-components must be used inside <Carousel>')
  }
  return ctx
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  loop?: boolean
}

export function Carousel({ loop = false, className, children, ...props }: CarouselProps) {
  const duration = prefersReducedMotion() ? 0 : 25
  const [emblaRef, api] = useEmblaCarousel({ loop, duration })

  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const sync = React.useCallback((a: CarouselApi) => {
    setSelectedIndex(a.selectedScrollSnap())
    setCanScrollPrev(a.canScrollPrev())
    setCanScrollNext(a.canScrollNext())
  }, [])

  React.useEffect(() => {
    if (!api) return
    setScrollSnaps(api.scrollSnapList())
    sync(api)
    const onSelect = () => sync(api)
    const onReInit = () => {
      setScrollSnaps(api.scrollSnapList())
      sync(api)
    }
    api.on('select', onSelect)
    api.on('reInit', onReInit)
    return () => {
      api.off('select', onSelect)
      api.off('reInit', onReInit)
    }
  }, [api, sync])

  const value = React.useMemo<CarouselContextValue>(
    () => ({
      api,
      selectedIndex,
      scrollSnaps,
      scrollTo: (i) => api?.scrollTo(i),
      scrollPrev: () => api?.scrollPrev(),
      scrollNext: () => api?.scrollNext(),
      canScrollPrev,
      canScrollNext,
    }),
    [api, selectedIndex, scrollSnaps, canScrollPrev, canScrollNext],
  )

  return (
    <CarouselContext.Provider value={value}>
      <div className={cn('relative', className)} {...props}>
        <div ref={emblaRef} className="overflow-hidden">
          {children}
        </div>
      </div>
    </CarouselContext.Provider>
  )
}

export function CarouselContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('-ml-4 flex', className)} {...props} />
}

export function CarouselItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn('min-w-0 shrink-0 grow-0 pl-4', className)}
      {...props}
    />
  )
}

interface CarouselNavProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
}

export function CarouselPrevious({ className, ...props }: CarouselNavProps) {
  const { scrollPrev, canScrollPrev } = useCarousel()
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn('h-9 w-9 rounded-full', className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
    </Button>
  )
}

export function CarouselNext({ className, ...props }: CarouselNavProps) {
  const { scrollNext, canScrollNext } = useCarousel()
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn('h-9 w-9 rounded-full', className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="h-4 w-4" aria-hidden="true" />
    </Button>
  )
}

interface CarouselDotsProps {
  getLabel: (index: number, total: number) => string
  className?: string
}

export function CarouselDots({ getLabel, className }: CarouselDotsProps) {
  const { scrollSnaps, selectedIndex, scrollTo } = useCarousel()
  const total = scrollSnaps.length
  return (
    <div role="tablist" className={cn('flex items-center gap-2', className)}>
      {scrollSnaps.map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === selectedIndex}
          aria-label={getLabel(i, total)}
          onClick={() => scrollTo(i)}
          className={cn(
            'h-2 rounded-full transition-all',
            i === selectedIndex
              ? 'bg-primary w-6'
              : 'bg-muted-foreground/40 hover:bg-muted-foreground/60 w-2',
          )}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm --filter @vg/landing exec vitest run src/tests/Carousel.test.tsx`

Expected: both tests PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/landing/src/ui/carousel.tsx apps/landing/src/tests/Carousel.test.tsx
git commit -m "feat(landing): add Carousel UI primitive over embla"
```

---

### Task 13: Implement the `Testimonials` section

**Files:**

- Create: `apps/landing/src/components/sections/Testimonials.tsx`

- [ ] **Step 1: Implement the section**

Create `apps/landing/src/components/sections/Testimonials.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { FadeInOnScroll } from '@/components/FadeInOnScroll'
import { TestimonialCard, type TestimonialColor } from '@/components/TestimonialCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from '@/ui/carousel'
import testimonialsData from '@/data/testimonials.json'

interface TestimonialRecord {
  id: string
  name: string
  role: string
  visa: string
  initialsColor: TestimonialColor
}

const TESTIMONIALS = testimonialsData as TestimonialRecord[]

export function Testimonials() {
  const { t } = useTranslation('testimonials')

  return (
    <section className="py-20" aria-labelledby="testimonials-heading">
      <FadeInOnScroll className="mx-auto max-w-6xl px-6">
        <h2 id="testimonials-heading" className="text-center text-3xl font-semibold tracking-tight">
          {t('heading')}
        </h2>
        <p className="text-muted-foreground mt-3 text-center">{t('subheading')}</p>

        <Carousel className="mt-10">
          <CarouselContent>
            {TESTIMONIALS.map((entry) => (
              <CarouselItem key={entry.id} className="basis-full md:basis-1/2 lg:basis-1/3">
                <TestimonialCard {...entry} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-6 flex items-center justify-center gap-4">
            <CarouselPrevious aria-label={t('previousLabel')} />
            <CarouselDots getLabel={(i, total) => t('dotLabel', { number: i + 1, total })} />
            <CarouselNext aria-label={t('nextLabel')} />
          </div>
        </Carousel>
      </FadeInOnScroll>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @vg/landing exec tsc -b`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/landing/src/components/sections/Testimonials.tsx
git commit -m "feat(landing): add Testimonials carousel section"
```

---

### Task 14: Wire `Testimonials` into `Home`

**Files:**

- Modify: `apps/landing/src/pages/Home.tsx`

- [ ] **Step 1: Insert the section between PricingTeaser and FAQ**

Replace the entire contents of `apps/landing/src/pages/Home.tsx` with:

```tsx
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/sections/Hero'
import { Problem } from '@/components/sections/Problem'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { VisaTypes } from '@/components/sections/VisaTypes'
import { PricingTeaser } from '@/components/sections/PricingTeaser'
import { Testimonials } from '@/components/sections/Testimonials'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { SEO } from '@/lib/seo'

export default function HomePage() {
  const { t } = useTranslation('home')
  return (
    <>
      <SEO title={t('title')} description={t('description')} />
      <Header />
      <Hero />
      <Problem />
      <HowItWorks />
      <VisaTypes />
      <PricingTeaser />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Manual smoke**

Run: `pnpm --filter @vg/landing dev`

Open `http://localhost:5173/vg/`. Scroll to the section between Pricing and FAQ. Verify:

- Heading "Early-access voices" visible.
- Three cards visible on desktop (≥1024px); two on `md`; one on mobile.
- Prev/Next buttons toggle disabled state at the ends.
- Dots reflect the selected index.
- Switch to UK via the LangSwitcher; the section heading and the visible quote change to Ukrainian.

Kill the dev server when verified.

- [ ] **Step 3: Commit**

```bash
git add apps/landing/src/pages/Home.tsx
git commit -m "feat(landing): place Testimonials between Pricing and FAQ on Home"
```

---

### Task 15: Playwright E2E for testimonials

**Files:**

- Create: `apps/landing/e2e/testimonials.spec.ts`

- [ ] **Step 1: Write the E2E test**

Create `apps/landing/e2e/testimonials.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('Testimonials section', () => {
  test('heading is visible and Next advances selected dot', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await page.goto('/')

    const heading = page.getByRole('heading', { name: /early-access voices/i })
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeVisible()

    const dots = page.getByRole('tab')
    await expect(dots.first()).toHaveAttribute('aria-selected', 'true')

    await page.getByRole('button', { name: /next testimonial/i }).click()
    await expect(dots.nth(1)).toHaveAttribute('aria-selected', 'true')
  })

  test('UK locale shows the Ukrainian heading', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('group', { name: /мова|language/i })
      .getByRole('button', { name: 'UK' })
      .click()

    const heading = page.getByRole('heading', { name: /голоси раннього доступу/i })
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeVisible()
  })
})
```

- [ ] **Step 2: Run the E2E test**

Run: `pnpm --filter @vg/landing exec playwright test e2e/testimonials.spec.ts`

Expected: both tests PASS. If the "next dot" assertion is flaky, suspect embla initialization timing — add `await page.waitForLoadState('networkidle')` before locating dots. Do not weaken the assertion.

- [ ] **Step 3: Commit**

```bash
git add apps/landing/e2e/testimonials.spec.ts
git commit -m "test(landing): E2E coverage for testimonials carousel"
```

---

### Task 16: Phase 2 — full verification & Lighthouse budget

- [ ] **Step 1: Run the full landing quality gate**

Run, in this order:

```bash
pnpm --filter @vg/landing lint
pnpm --filter @vg/landing exec tsc -b
pnpm --filter @vg/landing test
pnpm --filter @vg/landing build
pnpm --filter @vg/landing e2e
pnpm --filter @vg/landing lighthouse
```

Expected:

- lint/tsc/test/e2e PASS.
- Lighthouse asserts `categories:performance ≥ 0.90` and `categories:accessibility ≥ 0.95` — both must PASS. If Performance regresses below 0.90, investigate bundle delta (the testimonials section + embla should add ≤8kB gzipped — much more means an accidental import).

- [ ] **Step 2: Branch and PR**

The branch already exists and contains all commits. Push and decide PR strategy:

```bash
git push -u origin feat/landing-testimonials-and-i18n-overflow
```

Then either:

- **Combined PR (default):** `gh pr create --base main --title "feat(landing): UK header overflow fix + testimonials carousel" --body "..."` with a body that references the spec and lists the two phases.
- **Split (only if reviewer asks):** create two sibling branches from `main` and cherry-pick commits from Phase 1 vs Phase 2 onto each. The commit boundaries above make this mechanical.

Stop and report PR URL(s) to the user.

---

## Self-review (against the spec)

- [x] **Spec coverage:**
  - "Header overflow fix" → Tasks 1–3.
  - "Playwright regression covering UK locale at 320×640" → Task 1.
  - "Testimonials data model JSON shape" → Task 6.
  - "Testimonials i18n in dedicated namespace" → Tasks 7–8.
  - "Carousel UI primitive thin wrapper over embla" → Tasks 11–12.
  - "TestimonialCard with initials avatar" → Tasks 9–10.
  - "Testimonials section between PricingTeaser and FAQ" → Tasks 13–14.
  - "prefers-reduced-motion → duration=0 in primitive" → Tasks 11–12.
  - "Unit tests for TestimonialCard + Carousel" → Tasks 9–12.
  - "Playwright E2E for testimonials" → Task 15.
  - "Lighthouse budget unaffected" → Task 16 step 1.
  - "Risk acceptance section" → captured in spec; implementation mitigations (no photos, single-initial surnames, no outcome claims) are baked into the data and component design.

- [x] **Placeholder scan:** No TBD/TODO; every step has runnable commands or complete code.

- [x] **Type consistency:** `TestimonialColor`, `TestimonialCardProps`, `TestimonialRecord`, `CarouselApi`, `CarouselContextValue`, `CarouselNavProps`, `CarouselDotsProps` are each defined once and reused; `getLabel(index, total)` signature matches between the primitive and the consumer in `Testimonials.tsx`; `initialsColor` keys (`blue|amber|green|violet|rose|cyan`) match the JSON dataset, the `COLOR_CLASSES` lookup, and the spec table.
