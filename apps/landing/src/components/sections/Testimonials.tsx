import { useTranslation } from 'react-i18next'
import { FadeInOnScroll } from '@/components/FadeInOnScroll'
import { TestimonialCard, type TestimonialColor } from '@/components/TestimonialCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from '@/ui/carousel'
import testimonialsData from '@/data/testimonials.json'

interface TestimonialRecord {
  id: string
  name: string
  role: string
  visa: string
  initialsColor: TestimonialColor
}

const TESTIMONIALS = testimonialsData as TestimonialRecord[]

export function Testimonials() {
  const { t } = useTranslation('testimonials')

  return (
    <section className="py-20" aria-labelledby="testimonials-heading">
      <FadeInOnScroll className="mx-auto max-w-6xl px-6">
        <h2 id="testimonials-heading" className="text-center text-3xl font-semibold tracking-tight">
          {t('heading')}
        </h2>
        <p className="text-muted-foreground mt-3 text-center">{t('subheading')}</p>

        <Carousel className="mt-10">
          <CarouselContent>
            {TESTIMONIALS.map((entry) => (
              <CarouselItem key={entry.id} className="basis-full md:basis-1/2 lg:basis-1/3">
                <TestimonialCard {...entry} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-6 flex items-center justify-center gap-4">
            <CarouselPrevious aria-label={t('previousLabel')} />
            <CarouselDots getLabel={(i, total) => t('dotLabel', { number: i + 1, total })} />
            <CarouselNext aria-label={t('nextLabel')} />
          </div>
        </Carousel>
      </FadeInOnScroll>
    </section>
  )
}
