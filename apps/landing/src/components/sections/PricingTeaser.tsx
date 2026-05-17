import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/card'
import { WaitlistCTA } from '@/components/WaitlistCTA'
import { FadeInOnScroll } from '@/components/FadeInOnScroll'

const TIER_KEYS = ['free', 'pro', 'expert'] as const

interface TierFeatures {
  free: string[]
  pro: string[]
  expert: string[]
}

export function PricingTeaser() {
  const { t } = useTranslation('home')
  const features = t('pricing.tiers', { returnObjects: true }) as Record<
    keyof TierFeatures,
    { name: string; price: string; tagline: string; features: string[] }
  >

  return (
    <section className="bg-muted/30 py-20">
      <FadeInOnScroll className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">{t('pricing.heading')}</h2>
          <p className="text-muted-foreground mt-2">{t('pricing.subheading')}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TIER_KEYS.map((key) => {
            const tier = features[key]
            return (
              <Card key={key}>
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <p className="text-2xl font-semibold">{tier.price}</p>
                  <CardDescription>{tier.tagline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span aria-hidden className="text-primary">
                          ✓
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <div className="mt-10 flex flex-col items-center gap-3">
          <WaitlistCTA size="lg" />
          <p className="text-muted-foreground text-sm">{t('pricing.ctaNote')}</p>
        </div>
      </FadeInOnScroll>
    </section>
  )
}
