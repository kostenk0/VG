import { expect, test } from '@playwright/test'

test('home page loads with hero and waitlist CTA', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Self-file your US visa with AI guidance',
  )
  const cta = page.getByRole('link', { name: /Join the waitlist/i }).first()
  await expect(cta).toBeVisible()
  await expect(cta).toHaveAttribute('href', /docs\.google\.com\/forms/)
  await expect(cta).toHaveAttribute('target', '_blank')
})
