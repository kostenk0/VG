import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { FadeInOnScroll } from '@/components/FadeInOnScroll'

const STEP_KEYS = ['quiz', 'templates', 'ai'] as const

export function HowItWorks() {
  const { t } = useTranslation('home')
  return (
    <section className="bg-muted/30 py-20">
      <FadeInOnScroll className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          {t('howItWorks.heading')}
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEP_KEYS.map((key) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{t(`howItWorks.steps.${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{t(`howItWorks.steps.${key}.body`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="border-border bg-card text-muted-foreground mt-8 rounded-md border px-4 py-3 text-center text-sm">
          {t('howItWorks.disclaimerBanner')}
        </p>
      </FadeInOnScroll>
    </section>
  )
}
