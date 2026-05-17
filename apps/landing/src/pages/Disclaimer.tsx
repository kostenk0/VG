import { useTranslation } from 'react-i18next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const SECTION_KEYS = [
  'notLawFirm',
  'aiOutputs',
  'uscisRules',
  'recommendation',
  'liability',
] as const

export default function DisclaimerPage() {
  const { t } = useTranslation('disclaimer')

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">{t('heading')}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{t('lastUpdated')}</p>

        <div className="mt-10 space-y-10 text-base leading-relaxed">
          {SECTION_KEYS.map((key) => (
            <section key={key}>
              <h2 className="text-xl font-semibold">{t(`sections.${key}.heading`)}</h2>
              <p className="text-muted-foreground mt-2">{t(`sections.${key}.body`)}</p>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-semibold">{t('sections.resources.heading')}</h2>
            <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-5">
              <li>
                <a
                  className="text-primary underline-offset-4 hover:underline"
                  href="https://www.uscis.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('sections.resources.uscis')}
                </a>
              </li>
              <li>
                <a
                  className="text-primary underline-offset-4 hover:underline"
                  href="https://www.ailalawyer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('sections.resources.aila')}
                </a>
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
