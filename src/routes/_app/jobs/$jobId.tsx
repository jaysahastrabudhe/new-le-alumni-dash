import { createFileRoute, Link } from '@tanstack/react-router'
import { trpc } from '@/lib/trpc'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, MapPin, ExternalLink } from 'lucide-react'
import { formatRelative, JOB_TYPE_LABELS } from '@/lib/utils'

export const Route = createFileRoute('/_app/jobs/$jobId')({
  component: JobDetailPage,
})

function JobDetailPage() {
  const { jobId } = Route.useParams()
  const { data: job, isLoading } = trpc.job.get.useQuery({ id: jobId })

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (!job) {
    return <div className="text-center py-16 text-muted-foreground">Job not found.</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to Jobs
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <Badge variant="teal">{JOB_TYPE_LABELS[job.type]}</Badge>
          <h1 className="le-headline text-2xl font-extrabold">{job.title}</h1>
          <p className="text-muted-foreground font-medium">{job.company}</p>
          {job.location && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />{job.location}
            </p>
          )}
          <p className="text-xs text-muted-foreground/60">{formatRelative(job.createdAt)}</p>
        </div>

        {job.description && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>
        )}

        {job.applyUrl && (
          <Button asChild className="w-full sm:w-auto">
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />Apply Now
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
