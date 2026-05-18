# Landing polish — testimonials carousel & Ukrainian waitlist overflow

- **Status:** Approved 2026-05-18
- **Working branch:** `feat/landing-testimonials-and-i18n-overflow`
- **PRs:** two — overflow fix ships first, testimonials second

## Why

1. The header waitlist button overflows the viewport on mobile when the UI is in Ukrainian (`Приєднатися до waitlist` ≈ 23 chars vs `Join the waitlist` ≈ 17 chars). The button has `whitespace-nowrap` baked into `buttonVariants`, and the header has no responsive logic — so on a 360–375px viewport the right group pushes past the screen edge.
2. The landing has no social proof. Before launch we have no real testimonials, so we are shipping a curated set of plausible composite quotes attributed to single-initial personas, framed around process and AI feedback (not approval outcomes). The user has explicitly accepted the residual FTC §465 risk — see "Risk acceptance" below.

## Non-goals

- Real-user testimonial collection pipeline (post-launch).
- A general-purpose marketing CMS. Testimonials live in `src/data/testimonials.json` for now; if we ever need editor workflows we will revisit.
- A second pass on header IA. We only address the overflow; the header still has only logo + lang switcher + CTA.

## Scope split (two PRs)

- **PR #1 — header overflow fix.** Header `WaitlistCTA` becomes responsive (icon below `sm`, full text at `sm+`). Hero and FinalCTA CTAs stay full-text always. Adds a Playwright regression covering the UK locale at 320×640.
- **PR #2 — testimonials section.** New data file + i18n namespace + `Carousel` UI primitive (thin wrapper over `embla-carousel-react`) + `TestimonialCard` + `Testimonials` section, wired into `Home.tsx` between `PricingTeaser` and `FAQ`. Adds vitest + Playwright coverage. Adds one runtime dependency.

The two PRs are deliberately independent: the overflow fix is a hot regression and should land within hours; the testimonials PR is larger and reviewable separately.

---

## PR #1 — header overflow fix

### Behaviour

- `WaitlistCTA` gains an optional `responsive?: boolean` prop (default `false`, so all existing call sites keep current behaviour).
- When `responsive` is `true`:
  - Below `sm` (Tailwind default `640px`): renders an icon-only button (`Mail` from `lucide-react`, `size="icon"`) with `aria-label={t('joinWaitlist')}` for SR users. Visually no text.
  - At `sm` and up: renders the existing full-text button.
- Implementation uses a single `<Button>` containing both visually-toggled children — one tab stop, one element in the DOM. The full-text span carries `hidden sm:inline`; the icon carries `inline sm:hidden`. `aria-label` is set on the `<a>` always.
- `Header` switches to `<WaitlistCTA responsive />`. Hero and FinalCTA do not opt in.

### Files

- `apps/landing/src/components/WaitlistCTA.tsx` — extend with the `responsive` branch.
- `apps/landing/src/components/Header.tsx` — pass `responsive`.
- `apps/landing/package.json` — `lucide-react` is already a dep, no change.

### Test

- New `apps/landing/e2e/header.spec.ts`:
  - Loads `/` at viewport 320×640, switches to UK (via `localStorage`), reloads, asserts `document.documentElement.scrollWidth === document.documentElement.clientWidth`. Repeats at 375×667. Repeats for `/disclaimer`.
  - Also asserts that the header `<a>` resolving to `WAITLIST_URL` is present and accessible (`getByRole('link', { name: /приєднатися до waitlist/i })`) at both viewports.

### Risk / alternatives considered

- **Wrap to two lines:** rejected — two-line CTA in a 64px header looks broken.
- **Shorten the UK string:** rejected as the only fix — robust to today's two locales but breaks again when we add ES/HI/ZH per roadmap.
- **Drop the header CTA entirely on mobile:** considered. Hero and FinalCTA already carry the CTA, so this is viable. We chose the icon variant because it keeps a persistent waitlist entry point during scroll, but if the icon ever feels off, removing the header CTA below `sm` is a one-line fallback.

---

## PR #2 — testimonials carousel

### Data model

`apps/landing/src/data/testimonials.json` — array of 10 entries, statically imported (Vite inlines the JSON). The shape:

```json
{
  "id": "andrii-k",
  "name": "Andrii K.",
  "role": "ML researcher",
  "visa": "EB-2 NIW",
  "initialsColor": "blue"
}
```

Field rules:

- `id` — kebab-case, stable; used as React key, i18n quote key, and Playwright test selector.
- `name` — first name + single-letter surname initial. Plausible but deliberately not searchable to a single real person.
- `role` — short generic professional label. Not translated.
- `visa` — official USCIS category string (`EB-2 NIW`, `O-1A`, `EB-1A`, `H-1B → EB-2 NIW`). Not translated.
- `initialsColor` — one of `blue | amber | green | violet | rose | cyan`. Maps to a static Tailwind class lookup in `TestimonialCard` (full class strings so JIT picks them up — no string interpolation into class names).

Quotes live in `i18n`, not in JSON. New namespace `testimonials` registered in `src/i18n/index.ts`. Keys: `testimonials.quotes.<id>`.

`en.json` adds:

```json
{
  "testimonials": {
    "heading": "Early-access voices",
    "subheading": "Notes from people we built this with.",
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
  }
}
```

`uk.json` adds the matching `testimonials` namespace:

```json
{
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
  }
}
```

The persona records themselves:

| id           | name          | role                 | visa            | initialsColor |
| ------------ | ------------- | -------------------- | --------------- | ------------- |
| andrii-k     | Andrii K.     | ML researcher        | EB-2 NIW        | blue          |
| maria-g      | María G.      | Founder              | O-1A            | amber         |
| olena-p      | Olena P.      | Senior PM            | EB-1A           | violet        |
| raj-s        | Raj S.        | Robotics engineer    | O-1A            | green         |
| dmytro-l     | Dmytro L.     | Backend engineer     | H-1B → EB-2 NIW | cyan          |
| sofia-c      | Sofia C.      | Designer             | O-1A            | rose          |
| volodymyr-b  | Volodymyr B.  | Researcher           | EB-2 NIW        | blue          |
| anastasiia-r | Anastasiia R. | Data scientist       | EB-2 NIW        | green         |
| marcus-t     | Marcus T.     | Climate-tech founder | EB-1A           | amber         |
| yulia-m      | Yulia M.      | UX engineer          | O-1A            | violet        |

### Component layout

```
apps/landing/src/
  data/
    testimonials.json
  ui/
    carousel.tsx              # Carousel, CarouselContent, CarouselItem,
                              # CarouselPrevious, CarouselNext, CarouselDots
                              # — slim wrapper over embla-carousel-react
  components/
    TestimonialCard.tsx
    sections/
      Testimonials.tsx
  tests/
    TestimonialCard.test.tsx
    Carousel.test.tsx
  i18n/
    en.json                   # add `testimonials` namespace
    uk.json                   # add `testimonials` namespace
    index.ts                  # register the namespace
  pages/
    Home.tsx                  # insert <Testimonials /> between PricingTeaser and FAQ
e2e/
  testimonials.spec.ts
package.json                  # + embla-carousel-react
```

### `Carousel` primitive

Thin wrapper around `embla-carousel-react`'s React hook, modelled on the shadcn `carousel` recipe. Exports `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `CarouselDots`. Responsibilities:

- Owns the embla instance via `useEmblaCarousel`.
- Exposes selected index and a `scrollTo(index)` for `CarouselDots`.
- Wires arrow-button `disabled` state to embla's `canScrollPrev` / `canScrollNext` (unless `loop: true` is requested by the consumer).
- When `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, passes `duration: 0` to embla so transitions are instant. This lives in the primitive so every future use inherits it.
- `CarouselDots` renders one `<button role="tab" aria-selected aria-controls>` per page (where "page" = group of slides per `slidesToScroll`). It accepts `getLabel: (index: number, total: number) => string` so the consumer controls localized labels — the primitive itself does not depend on i18n.

This primitive is reusable — we will likely use it again for university logos, case-study cards, etc.

### `TestimonialCard`

Props: a single record from `testimonials.json`. Renders:

- Avatar: `aria-hidden` 40×40 circle. Background colour mapped from `initialsColor` via a static lookup object that returns one of `bg-blue-100 text-blue-900` / `bg-amber-100 text-amber-900` / … — full class strings, no interpolation. Initials derived from `name` (first letter of first word + first letter of last word).
- Header line: `<p className="font-semibold">{name}</p>` + `<p className="text-muted-foreground text-sm">{role} · {visa}</p>`.
- Quote: `<blockquote className="text-muted-foreground mt-4">{t('testimonials.quotes.' + id)}</blockquote>`.
- Card chrome: `Card` + `CardContent` from `src/ui/card.tsx`. `h-full` so cards in the same row are equal height.

### `Testimonials` section

Mirrors the structure of `FAQ.tsx`:

```tsx
const { t } = useTranslation('testimonials')

return (
  <section className="py-20" aria-labelledby="testimonials-heading">
    <FadeInOnScroll className="mx-auto max-w-6xl px-6">
      <h2 id="testimonials-heading" className="text-center text-3xl font-semibold tracking-tight">
        {t('heading')}
      </h2>
      <p className="text-muted-foreground mt-3 text-center">{t('subheading')}</p>

      <Carousel className="mt-10" loop={false}>
        <CarouselContent>
          {testimonials.map((entry) => (
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
```

Breakpoint behaviour is driven entirely by the `basis-*` classes on `CarouselItem` (no separate `slidesPerView` prop on the primitive — embla reads layout from the DOM). With 10 items and embla's default `slidesToScroll: 1`, dot count equals item count minus visible-count + 1 — that's 10 dots on mobile (1 visible), 9 on `md` (2 visible), 8 on `lg` (3 visible). Acceptable.

### `Home.tsx` change

Insert `<Testimonials />` between `<PricingTeaser />` and `<FAQ />`. Add the import.

### Accessibility

- `<section aria-labelledby="testimonials-heading">` with a real `<h2 id="testimonials-heading">`.
- Arrow buttons: `<button aria-label="Previous testimonial">` / `Next` (localized).
- Dots: `<button role="tab" aria-selected={i === current} aria-controls={...} aria-label="Go to testimonial 3 of 10">`.
- Keyboard: embla handles left/right arrows when carousel root is focused; we add `tabIndex={0}` on `CarouselContent` so it can receive focus.
- Reduced motion: see Carousel primitive above. Embla transitions become 0ms.
- `<blockquote>` tag carries semantic weight; SR users hear "quote" / "end of quote".

### Tests

- **Unit (`vitest`):**
  - `TestimonialCard.test.tsx`:
    - Renders name, role, visa, and the quote string (mocking `useTranslation` to return key as value).
    - Initials = `'AK'` for `'Andrii K.'`, `'MG'` for `'María G.'`.
    - `initialsColor: 'blue'` produces `bg-blue-100` on the avatar.
  - `Carousel.test.tsx`:
    - Renders three items; default current is 0.
    - Clicking `CarouselNext` advances `aria-selected` on dots by one.
    - When `matchMedia('(prefers-reduced-motion: reduce)')` returns `matches: true`, embla is constructed with `duration: 0` (assert via the embla constructor spy or by inspecting an exposed `duration` prop on the primitive).
- **E2E (`playwright`):** `e2e/testimonials.spec.ts`:
  - Visits `/`, scrolls section into view, asserts the heading.
  - Asserts the first card's name is visible. Clicks `CarouselNext`. Asserts dot 1 (zero-indexed) has `aria-selected="true"`.
  - Touch swipe: uses `page.mouse.down/move/up` across the slide track to simulate a swipe; asserts current changes.
  - UK locale: sets `localStorage['vg-lang'] = 'uk'`, reloads, asserts the quote text differs from EN.

### Performance

- Embla minified+gzipped is ≈6kB. Lighthouse desktop budget assertions in `apps/landing/lighthouserc.json` keep Performance ≥ 0.90; this should not move the needle since the section is below-fold and embla is lazy in nothing it does.
- JSON is statically imported and tree-shaken; no network request.
- No fonts, no images. Avatars are CSS circles.

---

## Risk acceptance — composite testimonials

The owner has reviewed and explicitly accepted the FTC §465 (16 CFR Part 465, effective Oct 2024) risk of shipping composite testimonials before any real customer relationship exists. Mitigations built into this design (not negotiable, included by default):

- Surname is a single initial — personas are not attributable to a specific identifiable person.
- No outcome claims. No `"approved in N months"`. No `"got my green card thanks to …"`. Quotes describe process insights, AI feedback, and resource savings — claims that are either subjective ("I felt") or about product features (which we can verify).
- No photos. Avatars are colour circles with initials. Stock-photo headshots of nonexistent people compound the deception finding under FTC enforcement; we explicitly avoid them.
- Quotes are not attributed to any external company, university, or publication.

If at any point the team adds (a) a stock-photo avatar, (b) an outcome claim, or (c) a logo of a third-party organisation alongside a persona, that change must re-open this risk review.

---

## Open follow-ups (not in this spec)

- Replacement plan once real users exist: a simple "Was this site helpful?" widget post-launch to gather quote permissions, then swap composite entries one-by-one. Tracked separately.
- Logo-strip section (universities / employers) is a natural next social-proof pattern; it would reuse the `Carousel` primitive built here.
