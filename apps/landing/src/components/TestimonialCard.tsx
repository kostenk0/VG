import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/ui/card'

const COLOR_CLASSES = {
  blue: 'bg-blue-100 text-blue-900',
  amber: 'bg-amber-100 text-amber-900',
  green: 'bg-green-100 text-green-900',
  violet: 'bg-violet-100 text-violet-900',
  rose: 'bg-rose-100 text-rose-900',
  cyan: 'bg-cyan-100 text-cyan-900',
} as const

export type TestimonialColor = keyof typeof COLOR_CLASSES

export interface TestimonialCardProps {
  id: string
  name: string
  role: string
  visa: string
  initialsColor: TestimonialColor
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export function TestimonialCard({ id, name, role, visa, initialsColor }: TestimonialCardProps) {
  const { t } = useTranslation('testimonials')
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${COLOR_CLASSES[initialsColor]}`}
          >
            {initialsFrom(name)}
          </div>
          <div>
            <p className="leading-tight font-semibold">{name}</p>
            <p className="text-muted-foreground text-sm">
              {role} · {visa}
            </p>
          </div>
        </div>
        <blockquote className="text-muted-foreground text-sm leading-relaxed">
          {t(`quotes.${id}`)}
        </blockquote>
      </CardContent>
    </Card>
  )
}
