import { expect, test } from '@playwright/test'

test('switching EN → UK updates page copy', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Self-file your US visa')
  await page.getByRole('button', { name: 'UK' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Подавайте на US-візу самостійно',
  )
})
