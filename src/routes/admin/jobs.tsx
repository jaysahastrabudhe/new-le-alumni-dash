import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative, JOB_TYPE_LABELS } from '@/lib/utils'

export const Route = createFileRoute('/admin/jobs')({
  component: AdminJobsPage,
})

const STATUS_FILTERS = ['pending', 'approved', 'closed'] as const

function AdminJobsPage() {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'closed'>('pending')
  const { data, isLoading, refetch } = trpc.job.adminList.useQuery({ status: filter })
  const approveMutation = trpc.job.adminApprove.useMutation({ onSuccess: () => refetch() })

  return (
    <div className="space-y-6">
      <h1 className="le-headline text-3xl font-extrabold">Jobs <span>Moderation</span></h1>

      <div className="flex gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors capitalize ${
              filter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        {data?.map((job: { id: string; title: string; company: string; location?: string | null; type: string; description: string; createdAt: string; status: string }) => (
          <div key={job.id} className="rounded-lg border border-border bg-card p-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{job.title}</p>
                <Badge variant="teal">{JOB_TYPE_LABELS[job.type]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{job.company} {job.location && `· ${job.location}`}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{job.description}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{formatRelative(job.createdAt)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {job.status !== 'approved' && (
                <Button size="sm" onClick={() => approveMutation.mutate({ id: job.id, status: 'approved' })}>Approve</Button>
              )}
              {job.status !== 'closed' && (
                <Button size="sm" variant="ghost" onClick={() => approveMutation.mutate({ id: job.id, status: 'closed' })}>Close</Button>
              )}
            </div>
          </div>
        ))}
        {data?.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No {filter} jobs.</p>
        )}
      </div>
    </div>
  )
}
