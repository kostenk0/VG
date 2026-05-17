import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const { t } = useTranslation('home')
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold">{t('title')}</h1>
      <p className="text-muted-foreground mt-2">{t('description')}</p>
    </main>
  )
}
