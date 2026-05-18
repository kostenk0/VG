import { expect, test } from '@playwright/test'

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
