import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import { Footer } from '@/components/Footer'
import { CONTACT_EMAIL } from '@/lib/config'

function renderFooter() {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    </I18nextProvider>,
  )
}

describe('Footer', () => {
  it('renders the UPL disclaimer line', () => {
    renderFooter()
    expect(screen.getByText(/not a law firm/i)).toBeInTheDocument()
  })

  it('links to /disclaimer', () => {
    renderFooter()
    const link = screen.getByRole('link', { name: /disclaimer/i })
    expect(link).toHaveAttribute('href', '/disclaimer')
  })

  it('shows a mailto link for contact', () => {
    renderFooter()
    const link = screen.getByRole('link', { name: /contact/i })
    expect(link).toHaveAttribute('href', `mailto:${CONTACT_EMAIL}`)
  })
})
