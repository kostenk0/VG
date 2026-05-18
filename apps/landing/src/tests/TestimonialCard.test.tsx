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
