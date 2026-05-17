import { expect, test } from '@playwright/test'

test('disclaimer page is reachable and contains required UPL phrases', async ({ page }) => {
  await page.goto('./disclaimer')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Legal Disclaimer')
  await expect(page.getByText(/not a law firm/i).first()).toBeVisible()
  await expect(page.getByText(/attorney-client relationship/i).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /USCIS/i }).first()).toHaveAttribute(
    'href',
    'https://www.uscis.gov',
  )
})
