import { useTranslation } from 'react-i18next'
import { Badge } from '@/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { FadeInOnScroll } from '@/components/FadeInOnScroll'

const PRIMARY_KEYS = ['eb2niw', 'o1a', 'eb1a'] as const

export function VisaTypes() {
  const { t } = useTranslation('home')
  return (
    <section className="py-20">
      <FadeInOnScroll className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-start gap-2">
          <Badge variant="outline">{t('visaTypes.primaryLabel')}</Badge>
          <h2 className="text-3xl font-semibold tracking-tight">{t('visaTypes.heading')}</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PRIMARY_KEYS.map((key) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{t(`visaTypes.primary.${key}.name`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {t(`visaTypes.primary.${key}.desc`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="border-border bg-muted/40 mt-10 rounded-lg border p-6">
          <p className="text-sm font-medium">{t('visaTypes.alsoSupportedLabel')}</p>
          <p className="text-muted-foreground mt-1 text-sm">{t('visaTypes.alsoSupported')}</p>
          <p className="text-muted-foreground mt-4 text-xs">{t('visaTypes.asylumNote')}</p>
        </div>
      </FadeInOnScroll>
    </section>
  )
}
