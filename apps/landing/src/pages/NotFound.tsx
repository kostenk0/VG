import { Link } from 'react-router-dom'
import { Button } from '@/ui/button'
import { SEO } from '@/lib/seo'

export default function NotFoundPage() {
  return (
    <>
      <SEO title="Page not found — VisaForge" />
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground text-sm font-semibold">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground mt-2">The page you’re looking for doesn’t exist.</p>
        <Button asChild className="mt-6">
          <Link to="/">Back to home</Link>
        </Button>
      </main>
    </>
  )
}
