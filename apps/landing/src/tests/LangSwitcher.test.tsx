import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import { LangSwitcher } from '@/components/LangSwitcher'

function renderWithI18n() {
  return render(
    <I18nextProvider i18n={i18n}>
      <LangSwitcher />
    </I18nextProvider>,
  )
}

describe('LangSwitcher', () => {
  it('renders both language buttons', () => {
    renderWithI18n()
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'UK' })).toBeInTheDocument()
  })

  it('switching to UK updates i18n language and persists to localStorage', async () => {
    const user = userEvent.setup()
    renderWithI18n()
    await user.click(screen.getByRole('button', { name: 'UK' }))
    expect(i18n.language).toBe('uk')
    expect(localStorage.getItem('vg-lang')).toBe('uk')
  })
})
