import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

const emblaMock = vi.fn((...args: unknown[]) => {
  void args
  return [vi.fn(), undefined] as [unknown, unknown]
})

vi.mock('embla-carousel-react', () => ({
  default: (...args: unknown[]) => emblaMock(...args),
}))

// Import AFTER vi.mock so the wrapper picks up the mocked module.
import { Carousel, CarouselContent, CarouselItem } from '@/ui/carousel'

function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  })
}

function renderOne() {
  return render(
    <Carousel>
      <CarouselContent>
        <CarouselItem>one</CarouselItem>
      </CarouselContent>
    </Carousel>,
  )
}

describe('Carousel embla wiring', () => {
  beforeEach(() => emblaMock.mockClear())

  it('passes duration=0 to embla when prefers-reduced-motion matches', () => {
    setMatchMedia(true)
    renderOne()
    expect(emblaMock).toHaveBeenCalled()
    const [opts] = emblaMock.mock.calls[0] as [{ duration: number }]
    expect(opts.duration).toBe(0)
  })

  it('passes a non-zero duration when reduced-motion does not match', () => {
    setMatchMedia(false)
    renderOne()
    const [opts] = emblaMock.mock.calls[0] as [{ duration: number }]
    expect(opts.duration).toBeGreaterThan(0)
  })
})
