import { useTranslation } from 'react-i18next'
import { Button } from '@/ui/button'
import { WAITLIST_URL } from '@/lib/config'

interface WaitlistCTAProps {
  size?: 'default' | 'lg'
  variant?: 'default' | 'outline'
  className?: string
}

export function WaitlistCTA({
  size = 'default',
  variant = 'default',
  className,
}: WaitlistCTAProps) {
  const { t } = useTranslation('common')
  return (
    <Button asChild size={size} variant={variant} className={className}>
      <a href={WAITLIST_URL} target="_blank" rel="noopener noreferrer">
        {t('joinWaitlist')}
      </a>
    </Button>
  )
}
