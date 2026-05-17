import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n'
import { cn } from '@/lib/utils'

export function LangSwitcher() {
  const { i18n, t } = useTranslation('common')
  const current = i18n.language.split('-')[0] as SupportedLanguage

  return (
    <div role="group" aria-label={t('langSwitch.label')} className="inline-flex gap-1">
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => void i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          className={cn(
            'rounded-md px-2 py-1 text-sm font-medium transition-colors',
            current === lng
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {t(`langSwitch.${lng}`)}
        </button>
      ))}
    </div>
  )
}
