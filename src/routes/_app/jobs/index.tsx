import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
        <Button asChild size="sm">
          <Link to="/jobs/new"><Plus className="h-4 w-4" />Post a job</Link>
        </Button>
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t ?? 'all'}
            onClick={() => setTypeFilter(t)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              typeFilter === t
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {t ? JOB_TYPE_LABELS[t] : 'All types'}
          </button>
        ))}
      </div>

      {/* Jobs list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : (
        <div ref={listRef as React.RefObject<HTMLDivElement>} className="space-y-3">
          {data?.map((job: { id: string; title: string; company: string; location?: string | null; type: string; applyUrl?: string | null; createdAt: string }) => (
            <div key={job.id} className="opacity-0 rounded-lg border border-border bg-card p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="font-semibold hover:text-primary transition-colors">
                      {job.title}
                    </Link>
                    <Badge variant="teal">{JOB_TYPE_LABELS[job.type]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{job.company}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
                    <span>{formatRelative(job.createdAt)}</span>
                  </div>
                </div>
                {job.applyUrl && (
                  <Button size="sm" variant="outline" asChild>
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
