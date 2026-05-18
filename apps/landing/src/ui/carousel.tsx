import * as React from 'react'
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/ui/button'
import { cn } from '@/lib/utils'

type CarouselApi = NonNullable<UseEmblaCarouselType[1]>

interface CarouselContextValue {
  api: CarouselApi | undefined
  selectedIndex: number
  scrollSnaps: number[]
  scrollTo: (index: number) => void
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel(): CarouselContextValue {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) {
    throw new Error('Carousel sub-components must be used inside <Carousel>')
  }
  return ctx
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  loop?: boolean
}

export function Carousel({ loop = false, className, children, ...props }: CarouselProps) {
  const duration = prefersReducedMotion() ? 0 : 25
  const [emblaRef, api] = useEmblaCarousel({ loop, duration })

  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const sync = React.useCallback((a: CarouselApi) => {
    setSelectedIndex(a.selectedScrollSnap())
    setCanScrollPrev(a.canScrollPrev())
    setCanScrollNext(a.canScrollNext())
  }, [])

  React.useEffect(() => {
    if (!api) return
    setScrollSnaps(api.scrollSnapList())
    sync(api)
    const onSelect = () => sync(api)
    const onReInit = () => {
      setScrollSnaps(api.scrollSnapList())
      sync(api)
    }
    api.on('select', onSelect)
    api.on('reInit', onReInit)
    return () => {
      api.off('select', onSelect)
      api.off('reInit', onReInit)
    }
  }, [api, sync])

  const value = React.useMemo<CarouselContextValue>(
    () => ({
      api,
      selectedIndex,
      scrollSnaps,
      scrollTo: (i) => api?.scrollTo(i),
      scrollPrev: () => api?.scrollPrev(),
      scrollNext: () => api?.scrollNext(),
      canScrollPrev,
      canScrollNext,
    }),
    [api, selectedIndex, scrollSnaps, canScrollPrev, canScrollNext],
  )

  return (
    <CarouselContext.Provider value={value}>
      <div className={cn('relative', className)} {...props}>
        <div ref={emblaRef} className="overflow-hidden">
          {children}
        </div>
      </div>
    </CarouselContext.Provider>
  )
}

export function CarouselContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('-ml-4 flex', className)} {...props} />
}

export function CarouselItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn('min-w-0 shrink-0 grow-0 pl-4', className)}
      {...props}
    />
  )
}

interface CarouselNavProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
}

export function CarouselPrevious({ className, ...props }: CarouselNavProps) {
  const { scrollPrev, canScrollPrev } = useCarousel()
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn('h-9 w-9 rounded-full', className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
    </Button>
  )
}

export function CarouselNext({ className, ...props }: CarouselNavProps) {
  const { scrollNext, canScrollNext } = useCarousel()
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn('h-9 w-9 rounded-full', className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="h-4 w-4" aria-hidden="true" />
    </Button>
  )
}

interface CarouselDotsProps {
  getLabel: (index: number, total: number) => string
  className?: string
}

export function CarouselDots({ getLabel, className }: CarouselDotsProps) {
  const { scrollSnaps, selectedIndex, scrollTo } = useCarousel()
  const total = scrollSnaps.length
  return (
    <div role="tablist" className={cn('flex items-center gap-2', className)}>
      {scrollSnaps.map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === selectedIndex}
          aria-label={getLabel(i, total)}
          onClick={() => scrollTo(i)}
          className={cn(
            'h-2 rounded-full transition-all',
            i === selectedIndex
              ? 'bg-primary w-6'
              : 'bg-muted-foreground/40 hover:bg-muted-foreground/60 w-2',
          )}
        />
      ))}
    </div>
  )
}
