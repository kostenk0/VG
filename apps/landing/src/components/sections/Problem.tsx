import { useTranslation } from 'react-i18next'
import { FadeInOnScroll } from '@/components/FadeInOnScroll'

export function Problem() {
  const { t } = useTranslation('home')
  const bullets = ['cost', 'tools', 'diy'] as const

  return (
    <section className="py-20">
      <FadeInOnScroll className="mx-auto max-w-4xl px-6">
        <h2 className="text-3xl font-semibold tracking-tight">{t('problem.heading')}</h2>
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg">{t('problem.intro')}</p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {bullets.map((key) => (
            <li key={key} className="border-border bg-card rounded-lg border p-6 shadow-sm">
              <p className="text-sm">{t(`problem.bullets.${key}`)}</p>
            </li>
          ))}
        </ul>
      </FadeInOnScroll>
    </section>
  )
}
