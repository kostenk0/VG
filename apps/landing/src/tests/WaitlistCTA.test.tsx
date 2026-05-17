import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import { WaitlistCTA } from '@/components/WaitlistCTA'
import { WAITLIST_URL } from '@/lib/config'

function renderCta() {
  return render(
    <I18nextProvider i18n={i18n}>
      <WaitlistCTA />
    </I18nextProvider>,
  )
}

describe('WaitlistCTA', () => {
  it('links to the Google Form URL', () => {
    renderCta()
    const link = screen.getByRole('link', { name: /waitlist/i })
    expect(link).toHaveAttribute('href', WAITLIST_URL)
  })

  it('opens in a new tab safely', () => {
    renderCta()
    const link = screen.getByRole('link', { name: /waitlist/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
