import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'

export default function App() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <Card>
        <CardHeader>
          <CardTitle>VisaForge — shadcn OK</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Badge>Beta</Badge>
        </CardContent>
      </Card>
    </main>
  )
}
