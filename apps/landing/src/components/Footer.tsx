import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CONTACT_EMAIL } from '@/lib/config'

export function Footer() {
  const { t } = useTranslation('common')
  const year = new Date().getFullYear()

  return (
    <footer className="border-border bg-muted/40 border-t py-10">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-sm sm:flex-row sm:justify-between">
        <p>{t('footer.copyright', { year })}</p>
        <nav className="flex items-center gap-6">
          <Link to="/disclaimer" className="hover:text-foreground">
            {t('footer.disclaimerLink')}
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground">
            {t('footer.contactLink')}
          </a>
        </nav>
      </div>
      <p className="text-muted-foreground mx-auto mt-6 max-w-6xl px-6 text-xs">
        {t('footer.disclaimer')}
      </p>
    </footer>
  )
}
