import { Link } from 'react-router-dom'
import { LangSwitcher } from './LangSwitcher'
import { WaitlistCTA } from './WaitlistCTA'

export function Header() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          VisaForge
        </Link>
        <div className="flex items-center gap-4">
          <LangSwitcher />
          <WaitlistCTA responsive />
        </div>
      </div>
    </header>
  )
}
