import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, ExternalLink, Plus } from 'lucide-react'
import { formatRelative, JOB_TYPE_LABELS } from '@/lib/utils'
import { useEntranceAnimation } from '@/hooks/useAnime'

export const Route = createFileRoute('/_app/jobs/')({
  component: JobsPage,
})

const TYPE_FILTERS = [undefined, 'full_time', 'part_time', 'internship', 'contract', 'remote'] as const

function JobsPage() {
  const [typeFilter, setTypeFilter] = useState<typeof TYPE_FILTERS[number]>(undefined)
  const listRef = useEntranceAnimation([typeFilter])

  const { data, isLoading } = trpc.job.list.useQuery({ type: typeFilter, page: 1 })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="le-headline text-3xl font-extrabold">
            Job <span>Board</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Exclusive opportunities from and for the LE community.</p>
        </div>
        <Button asChild size="sm" className="gap-1.5 shrink-0">
          <Link to="/jobs/new"><Plus className="h-4 w-4" />Post a job</Link>
        </Button>
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t ?? 'all'}
            onClick={() => setTypeFilter(t)}
            className={`rounded-full px-3.5 py-1 text-xs font-medium border transition-colors ${
              typeFilter === t
                ? 'bg-accent/20 text-accent border-accent/40'
                : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
            }`}
          >
            {t ? JOB_TYPE_LABELS[t] : 'All types'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div ref={listRef as React.RefObject<HTMLDivElement>} className="space-y-3">
          {data?.map((job) => (
            <div
              key={job.id}
              className="opacity-0 rounded-xl border border-border/50 bg-card le-surface p-5 hover:border-border transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to="/jobs/$jobId"
                      params={{ jobId: job.id }}
                      className="font-semibold text-sm hover:text-accent transition-colors"
                    >
                      {job.title}
                    </Link>
                    <Badge variant="teal">{JOB_TYPE_LABELS[job.type]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">{job.company}</p>

                  <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                    {job.location && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                        <MapPin className="h-3 w-3" />{job.location}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground/60">{formatRelative(job.createdAt)}</span>
                  </div>

                  {job.postedByUser && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <Avatar className="h-5 w-5 shrink-0">
                        {job.postedByUser.avatarUrl && (
                          <AvatarImage src={job.postedByUser.avatarUrl} alt={job.postedByUser.name} />
                        )}
                        <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                          {job.postedByUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] text-muted-foreground/60">
                        Posted by <span className="text-muted-foreground">{job.postedByUser.name}</span>
                      </span>
                    </div>
                  )}
                </div>

                {job.applyUrl && (
                  <Button size="sm" variant="outline" asChild className="shrink-0">
                    <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />Apply
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
          {data?.length === 0 && (
            <p className="text-center text-muted-foreground py-16">No jobs posted yet. Be the first!</p>
          )}
        </div>
      )}
    </div>
  )
}
