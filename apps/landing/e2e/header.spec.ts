import { test, expect } from '@playwright/test'

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 375, height: 667 },
]

const PATHS = ['/', './disclaimer']

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
