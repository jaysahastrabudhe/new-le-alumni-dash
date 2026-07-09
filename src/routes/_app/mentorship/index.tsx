import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEntranceAnimation } from '@/hooks/useAnime'

export const Route = createFileRoute('/_app/mentorship/')({
  component: MentorshipPage,
})

function MentorCard({ user, topics, onRequest }: {
  userId: string
  user: { id: string; name: string; headline?: string | null; company?: string | null; avatarUrl?: string | null; batchYear?: number | null }
  topics: string[]
  onRequest: (mentorId: string) => void
}) {
  const initials = user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 hover:border-primary/40 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
          <AvatarFallback className="bg-accent/10 text-accent font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">{user.name}</p>
            {user.batchYear && <Badge variant="outline" className="text-xs">'{String(user.batchYear).slice(-2)}</Badge>}
          </div>
          {user.headline && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{user.headline}</p>}
          {user.company && <p className="text-xs text-muted-foreground">{user.company}</p>}
        </div>
      </div>
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topics.map((t) => <Badge key={t} variant="teal" className="text-xs">{t}</Badge>)}
        </div>
      )}
      <Button size="sm" className="w-full" onClick={() => onRequest(user.id)}>
        Request mentorship
      </Button>
    </div>
  )
}

function MentorshipPage() {
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null)
  const [topic, setTopic] = useState('')
  const [note, setNote] = useState('')
  const gridRef = useEntranceAnimation([])

  const { data: mentors, isLoading } = trpc.mentor.list.useQuery(undefined)
  const { data: mine } = trpc.mentor.mine.useQuery(undefined)
  const requestMutation = trpc.mentor.request.useMutation({
    onSuccess: () => { setSelectedMentor(null); setTopic(''); setNote('') },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="le-headline text-3xl font-extrabold">
          Mentorship <span>Network</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Learn from those who have walked the path before you.</p>
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse Mentors</TabsTrigger>
          <TabsTrigger value="mine">My Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : (
            <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentors?.map((m: { userId: string; user: { id: string; name: string; headline?: string | null; company?: string | null; avatarUrl?: string | null; batchYear?: number | null }; topics: string[]; isAvailable: boolean; capacity: number }) => (
                <div key={m.userId} className="opacity-0">
                  <MentorCard {...m} onRequest={setSelectedMentor} />
                </div>
              ))}
              {mentors?.length === 0 && (
                <p className="col-span-3 text-center text-muted-foreground py-16">No mentors available yet.</p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="mt-6 space-y-6">
          {mine?.asMentee?.length === 0 && mine?.asMentor?.length === 0 && (
            <p className="text-center text-muted-foreground py-16">No mentorship connections yet. Browse mentors and send a request!</p>
          )}
          {mine?.asMentee?.map((m: { id: string; topic: string; status: string; mentor?: { name: string } | null }) => (
            <div key={m.id} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">Mentorship with {m.mentor?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.topic}</p>
              </div>
              <Badge variant={m.status === 'active' ? 'teal' : m.status === 'declined' ? 'destructive' : 'secondary'}>
                {m.status}
              </Badge>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Request dialog */}
      <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>Describe what you're looking to learn or achieve.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic *</Label>
              <input
                id="topic"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                placeholder="Career transition, product management, fundraising..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea id="note" rows={3} placeholder="A bit about yourself and what you'd like to discuss..." value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button
              className="w-full"
              disabled={!topic || !selectedMentor || requestMutation.isPending}
              onClick={() => selectedMentor && requestMutation.mutate({ mentorId: selectedMentor, topic, note: note || undefined })}
            >
              {requestMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
