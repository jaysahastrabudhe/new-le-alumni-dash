import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '@/lib/trpc'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { MapPin, Building2, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const Route = createFileRoute('/_app/directory/$userId')({
  component: ProfileDetailPage,
})

function ProfileDetailPage() {
  const { userId } = Route.useParams()
  const { data: user, isLoading } = trpc.user.profile.useQuery({ userId })

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  )

  if (!user) return <p className="text-center py-20 text-muted-foreground">Profile not found.</p>

  const initials = user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-20 w-20 shrink-0">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {user.batchYear && <Badge variant="teal">Batch '{String(user.batchYear).slice(-2)}</Badge>}
              <Badge variant={user.role === 'alumni' ? 'default' : 'secondary'}>{user.role}</Badge>
            </div>
            {user.headline && <p className="text-muted-foreground mt-1">{user.headline}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              {user.company && <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{user.company}</span>}
              {user.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{user.location}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          {user.linkedinUrl && (
            <Button size="sm" variant="outline" asChild>
              <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />LinkedIn
              </a>
            </Button>
          )}
          <Button size="sm" asChild>
            <a href="/mentorship">Request Mentorship</a>
          </Button>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-3">About</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Career timeline */}
      {user.careerEntries && user.careerEntries.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Career</h2>
          <div className="space-y-4">
            {user.careerEntries.map((entry: { id: string; title: string; company: string; startDate: string; endDate?: string | null; isCurrent: boolean }, i: number) => (
              <div key={entry.id}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="flex gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{entry.title}</p>
                    <p className="text-sm text-muted-foreground">{entry.company}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(entry.startDate)} — {entry.isCurrent ? 'Present' : entry.endDate ? formatDate(entry.endDate) : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
