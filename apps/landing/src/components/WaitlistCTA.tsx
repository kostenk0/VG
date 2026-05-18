import { useTranslation } from 'react-i18next'
import { Mail } from 'lucide-react'
import { Button } from '@/ui/button'
import { WAITLIST_URL } from '@/lib/config'
import { cn } from '@/lib/utils'

interface WaitlistCTAProps {
  size?: 'default' | 'lg'
  variant?: 'default' | 'outline'
  className?: string
  /**
   * When true, renders icon-only below the `sm` breakpoint and full text at `sm+`.
   * The visible label is hidden via Tailwind, but `aria-label` is always set so SR users get the same affordance.
   */
  responsive?: boolean
}

export function WaitlistCTA({
  size = 'default',
  variant = 'default',
  className,
  responsive = false,
}: WaitlistCTAProps) {
  const { t } = useTranslation('common')
  const label = t('joinWaitlist')

  return (
    <Button
      asChild
      size={size}
      variant={variant}
      className={cn(responsive && 'w-10 px-0 sm:w-auto sm:px-4', className)}
    >
      <a href={WAITLIST_URL} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {responsive ? (
          <>
            <Mail className="h-4 w-4 sm:hidden" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </a>
    </Button>
  )
}
