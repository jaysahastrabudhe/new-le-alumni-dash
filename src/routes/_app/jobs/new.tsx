import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { JOB_TYPE_LABELS } from '@/lib/utils'

export const Route = createFileRoute('/_app/jobs/new')({
  component: NewJobPage,
})

const JOB_TYPES = ['full_time', 'part_time', 'internship', 'contract', 'remote'] as const

function NewJobPage() {
  const nav = useNavigate()
  const postJob = trpc.job.post.useMutation({ onSuccess: () => nav({ to: '/jobs' }) })

  const [form, setForm] = useState({
    title: '', company: '', location: '', type: 'full_time' as typeof JOB_TYPES[number],
    description: '', applyUrl: '',
  })

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="le-headline text-3xl font-extrabold">Post a <span>Job</span></h1>
        <p className="text-muted-foreground mt-1 text-sm">Listings are reviewed before going live.</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); postJob.mutate(form) }}
        className="space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Job title *</Label>
            <Input id="title" required value={form.title} onChange={update('title')} placeholder="Growth Associate" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Company *</Label>
            <Input id="company" required value={form.company} onChange={update('company')} placeholder="Acme Inc." />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={update('location')} placeholder="Pune / Remote" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="type">Type *</Label>
            <select
              id="type"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={form.type}
              onChange={update('type')}
            >
              {JOB_TYPES.map(t => <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="desc">Description *</Label>
          <Textarea id="desc" required rows={5} value={form.description} onChange={update('description')} placeholder="Role overview, responsibilities, requirements..." />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="url">Apply URL</Label>
          <Input id="url" type="url" value={form.applyUrl} onChange={update('applyUrl')} placeholder="https://..." />
        </div>

        <Button type="submit" className="w-full" disabled={postJob.isPending}>
          {postJob.isPending ? 'Submitting...' : 'Submit for review'}
        </Button>
      </form>
    </div>
  )
}
