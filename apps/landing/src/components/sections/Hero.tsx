import { useTranslation } from 'react-i18next'
import { WaitlistCTA } from '@/components/WaitlistCTA'
import { FadeInOnScroll } from '@/components/FadeInOnScroll'

export function Hero() {
  const { t } = useTranslation('home')
  return (
    <section className="from-muted/30 to-background bg-gradient-to-b py-24">
      <FadeInOnScroll className="mx-auto max-w-4xl px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t('hero.heading')}</h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
          {t('hero.subheading')}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <WaitlistCTA size="lg" />
          <p className="text-muted-foreground text-sm">{t('hero.trustLine')}</p>
        </div>
      </FadeInOnScroll>
    </section>
  )
}
