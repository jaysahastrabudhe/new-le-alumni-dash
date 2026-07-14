import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/context/auth'
import { trpc } from '@/lib/trpc'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_app/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { user: authUser } = useAuth()
  const { data: me, isLoading, refetch } = trpc.user.me.useQuery()
  const updateMutation = trpc.user.update.useMutation({ onSuccess: () => refetch() })
  const addCareerMutation = trpc.user.addCareerEntry.useMutation({ onSuccess: () => refetch() })

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', headline: '', bio: '', location: '', company: '', linkedinUrl: '', visibility: 'members' as 'public' | 'members' | 'hidden' })

  const startEdit = () => {
    if (!me) return
    setForm({
      name: me.name,
      headline: me.headline ?? '',
      bio: me.bio ?? '',
      location: me.location ?? '',
      company: me.company ?? '',
      linkedinUrl: me.linkedinUrl ?? '',
      visibility: me.visibility,
    })
    setEditing(true)
  }

  const [newEntry, setNewEntry] = useState({ company: '', title: '', startDate: '', isCurrent: false })

  if (isLoading) return <div className="space-y-4 max-w-xl mx-auto"><Skeleton className="h-48 rounded-xl" /><Skeleton className="h-32 rounded-xl" /></div>

  const initials = (me?.name ?? authUser?.name ?? '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Profile card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            {(me?.avatarUrl ?? authUser?.avatarUrl) && <AvatarImage src={(me?.avatarUrl ?? authUser?.avatarUrl)!} alt={me?.name} />}
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-bold text-xl">{me?.name}</p>
            {me?.headline && <p className="text-muted-foreground text-sm">{me.headline}</p>}
            <div className="flex gap-2 mt-2">
              <Badge variant={me?.role === 'alumni' ? 'default' : 'secondary'}>{me?.role ?? 'student'}</Badge>
              {me?.batchYear && <Badge variant="outline">Batch {me.batchYear}</Badge>}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={startEdit}>Edit</Button>
        </div>

        {editing && (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              updateMutation.mutate(form)
              setEditing(false)
            }}
          >
            <Separator />
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="p-name">Name</Label>
                <Input id="p-name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="p-company">Company</Label>
                <Input id="p-company" value={form.company} onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-headline">Headline</Label>
              <Input id="p-headline" value={form.headline} onChange={(e) => setForm(f => ({ ...f, headline: e.target.value }))} placeholder="e.g. Founder @ Acme | LE Batch '22" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-bio">Bio</Label>
              <Textarea id="p-bio" rows={3} value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="p-location">Location</Label>
                <Input id="p-location" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Pune, MH" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="p-linkedin">LinkedIn URL</Label>
                <Input id="p-linkedin" type="url" value={form.linkedinUrl} onChange={(e) => setForm(f => ({ ...f, linkedinUrl: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" size="sm" disabled={updateMutation.isPending}>Save changes</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </div>

      {/* Career */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-4">Career Timeline</h2>
        <div className="space-y-3">
          {me?.careerEntries?.map((e: { id: string; title: string; company: string; startDate: string; isCurrent: boolean }) => (
            <div key={e.id} className="flex gap-3 items-start">
              <div className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" />
              <div>
                <p className="text-sm font-medium">{e.title} <span className="text-muted-foreground">at {e.company}</span></p>
                <p className="text-xs text-muted-foreground">{e.startDate} {e.isCurrent && '— Present'}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Add entry</p>
        <form
          className="grid sm:grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            addCareerMutation.mutate(newEntry)
            setNewEntry({ company: '', title: '', startDate: '', isCurrent: false })
          }}
        >
          <Input placeholder="Title" value={newEntry.title} onChange={(e) => setNewEntry(n => ({ ...n, title: e.target.value }))} required />
          <Input placeholder="Company" value={newEntry.company} onChange={(e) => setNewEntry(n => ({ ...n, company: e.target.value }))} required />
          <Input type="date" value={newEntry.startDate} onChange={(e) => setNewEntry(n => ({ ...n, startDate: e.target.value }))} required />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="current" checked={newEntry.isCurrent} onChange={(e) => setNewEntry(n => ({ ...n, isCurrent: e.target.checked }))} />
            <Label htmlFor="current">Current role</Label>
          </div>
          <Button type="submit" size="sm" className="sm:col-span-2" disabled={addCareerMutation.isPending}>Add to timeline</Button>
        </form>
      </div>
    </div>
  )
}
