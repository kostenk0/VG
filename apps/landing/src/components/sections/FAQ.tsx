import { useTranslation } from 'react-i18next'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/ui/accordion'
import { FadeInOnScroll } from '@/components/FadeInOnScroll'

const FAQ_KEYS = [
  'legalAdvice',
  'lawyerReview',
  'supportedVisas',
  'policyChanges',
  'launch',
  'languages',
] as const

export function FAQ() {
  const { t } = useTranslation('home')
  return (
    <section className="py-20">
      <FadeInOnScroll className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">{t('faq.heading')}</h2>
        <Accordion type="single" collapsible className="mt-10 w-full">
          {FAQ_KEYS.map((key) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger>{t(`faq.items.${key}.q`)}</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{t(`faq.items.${key}.a`)}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </FadeInOnScroll>
    </section>
  )
}
