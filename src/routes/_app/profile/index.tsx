import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { useAuth } from '@/context/auth'
import { trpc } from '@/lib/trpc'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Camera, KeyRound } from 'lucide-react'

export const Route = createFileRoute('/_app/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { user: authUser, logout } = useAuth()
  const navigate = useNavigate()
  const { data: me, isLoading, refetch } = trpc.user.me.useQuery()
  const updateMutation = trpc.user.update.useMutation({ onSuccess: () => refetch() })
  const addCareerMutation = trpc.user.addCareerEntry.useMutation({ onSuccess: () => refetch() })
  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      logout()
      void navigate({ to: '/login', replace: true })
    },
  })

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', headline: '', bio: '', location: '', company: '', linkedinUrl: '', visibility: 'members' as 'public' | 'members' | 'hidden' })

  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return
    setUploadingPhoto(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 512
        let w = img.width
        let h = img.height
        if (w > h) {
          if (w > MAX) { h = Math.round(h * MAX / w); w = MAX }
        } else {
          if (h > MAX) { w = Math.round(w * MAX / h); h = MAX }
        }
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        const base64 = canvas.toDataURL('image/jpeg', 0.82)
        updateMutation.mutate({ avatarUrl: base64 }, {
          onSuccess: () => { refetch(); setUploadingPhoto(false) },
          onError: () => setUploadingPhoto(false),
        })
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
    // Reset so the same file can be re-selected if needed
    e.target.value = ''
  }

  const [newEntry, setNewEntry] = useState({ company: '', title: '', startDate: '', isCurrent: false })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  if (isLoading) return <div className="space-y-4 max-w-xl mx-auto"><Skeleton className="h-48 rounded-xl" /><Skeleton className="h-32 rounded-xl" /></div>

  const avatarSrc = me?.avatarUrl ?? authUser?.avatarUrl
  const initials = (me?.name ?? authUser?.name ?? '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Profile card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-5">
          {/* Avatar with photo upload */}
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            <div className="relative">
              <div
                className="relative h-[112px] w-[112px] rounded-2xl overflow-hidden"
                style={{ background: 'oklch(0.47 0.22 257 / 0.15)' }}
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={me?.name}
                    className={`h-full w-full object-cover transition-opacity duration-150 ${uploadingPhoto ? 'opacity-40' : 'opacity-100'}`}
                  />
                ) : (
                  <div className={`h-full w-full flex items-center justify-center transition-opacity duration-150 ${uploadingPhoto ? 'opacity-40' : 'opacity-100'}`}>
                    <span className="text-3xl font-bold text-primary">{initials}</span>
                  </div>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 disabled:opacity-60"
                style={{
                  background: 'oklch(0.47 0.22 257)',
                  border: '2px solid var(--background, #0a0a0f)',
                  boxShadow: '0 2px 8px oklch(0 0 0 / 0.4)',
                }}
                aria-label="Upload profile photo"
              >
                <Camera className="h-3.5 w-3.5 text-white" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handlePhotoFile}
              />
            </div>
            <p className="text-[10px] text-muted-foreground/40 text-center">JPG or PNG, max 5MB</p>
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0 pt-1">
            <p className="font-bold text-xl">{me?.name}</p>
            {me?.headline && <p className="text-muted-foreground text-sm mt-0.5">{me.headline}</p>}
            <div className="flex gap-2 mt-3">
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

      {/* Security */}
      <div className="rounded-[1.4rem] border border-white/[0.08] bg-card/80 p-6 le-surface">
        <div className="flex items-start gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-bold">Password and security</h2>
            <p className="text-xs text-muted-foreground mt-1">Changing your password signs out every active session.</p>
          </div>
        </div>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (passwordForm.newPassword !== passwordForm.confirmPassword) return
            changePasswordMutation.mutate({
              currentPassword: passwordForm.currentPassword,
              newPassword: passwordForm.newPassword,
            })
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((form) => ({ ...form, currentPassword: event.target.value }))}
              required
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((form) => ({ ...form, newPassword: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((form) => ({ ...form, confirmPassword: event.target.value }))}
                required
              />
            </div>
          </div>
          {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
            <p role="alert" className="text-xs text-red-300">New passwords do not match.</p>
          )}
          {changePasswordMutation.error && (
            <p role="alert" className="text-xs text-red-300">{changePasswordMutation.error.message}</p>
          )}
          <Button
            type="submit"
            variant="outline"
            disabled={
              changePasswordMutation.isPending ||
              passwordForm.newPassword.length < 8 ||
              passwordForm.newPassword !== passwordForm.confirmPassword
            }
          >
            {changePasswordMutation.isPending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
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
                <p className="text-xs text-muted-foreground">{e.startDate} {e.isCurrent && '- Present'}</p>
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
