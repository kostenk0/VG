import { useTranslation } from 'react-i18next'
import { WaitlistCTA } from '@/components/WaitlistCTA'
import { FadeInOnScroll } from '@/components/FadeInOnScroll'

export function FinalCTA() {
  const { t } = useTranslation('home')
  return (
    <section className="bg-primary text-primary-foreground py-20">
      <FadeInOnScroll className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">{t('finalCta.heading')}</h2>
        <p className="text-primary-foreground/80 mt-4 text-lg">{t('finalCta.subheading')}</p>
        <div className="mt-8">
          <WaitlistCTA size="lg" variant="outline" className="bg-background text-foreground" />
        </div>
      </FadeInOnScroll>
    </section>
  )
}
