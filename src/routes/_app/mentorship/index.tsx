import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Building2, GraduationCap, Sparkles, UsersRound } from 'lucide-react'
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

type MentorCategory = 'alumni' | 'industry_expert' | 'lets_enterprise_mentor'

const MENTOR_CATEGORIES: Array<{
  key: MentorCategory
  label: string
  description: string
  icon: React.ElementType
}> = [
  { key: 'alumni', label: 'Alumni', description: 'Guidance from people who began where you did.', icon: GraduationCap },
  { key: 'industry_expert', label: 'Industry Experts', description: 'Practical insight from experienced professionals.', icon: Building2 },
  { key: 'lets_enterprise_mentor', label: "Let's Enterprise Mentors", description: 'Trusted mentors from the LE community.', icon: Sparkles },
]

const CATEGORY_LABELS = Object.fromEntries(MENTOR_CATEGORIES.map((item) => [item.key, item.label])) as Record<MentorCategory, string>

function MentorCard({ user, topics, category, onRequest }: {
  userId: string
  user: { id: string; name: string; headline?: string | null; company?: string | null; avatarUrl?: string | null; batchYear?: number | null }
  topics: string[]
  category: MentorCategory
  onRequest: (mentorId: string) => void
}) {
  const initials = user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="group h-full rounded-[1.35rem] border border-white/[0.08] bg-card/80 p-5 space-y-5 le-surface hover:-translate-y-1 hover:border-accent/30 transition-all duration-200">
      <div className="flex items-start gap-3">
        <Avatar className="h-14 w-14 rounded-2xl">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
          <AvatarFallback className="bg-accent/10 text-accent font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm">{user.name}</p>
            {user.batchYear && <Badge variant="outline" className="text-xs">'{String(user.batchYear).slice(-2)}</Badge>}
          </div>
          {user.headline && <p className="text-xs text-accent mt-1 line-clamp-1">{user.headline}</p>}
          {user.company && <p className="text-xs text-muted-foreground">{user.company}</p>}
        </div>
      </div>
      <Badge variant="outline" className="border-white/10 bg-white/[0.035] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        {CATEGORY_LABELS[category]}
      </Badge>
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topics.map((t) => <Badge key={t} variant="teal" className="text-xs">{t}</Badge>)}
        </div>
      )}
      <Button size="sm" className="w-full" onClick={() => onRequest(user.id)}>
        Ask for guidance
      </Button>
    </div>
  )
}

function MentorshipPage() {
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null)
  const [category, setCategory] = useState<MentorCategory | 'all'>('all')
  const [topic, setTopic] = useState('')
  const [note, setNote] = useState('')

  const { data: mentors, isLoading } = trpc.mentor.list.useQuery(undefined)
  const { data: mine } = trpc.mentor.mine.useQuery(undefined)
  const requestMutation = trpc.mentor.request.useMutation({
    onSuccess: () => { setSelectedMentor(null); setTopic(''); setNote('') },
  })
  const filteredMentors = mentors?.filter((mentor) => category === 'all' || mentor.category === category)
  const gridRef = useEntranceAnimation([category, filteredMentors?.length ?? 0])

  return (
    <div className="space-y-7 max-w-[1440px] mx-auto">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-card/80 p-6 sm:p-8 le-surface">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-accent/[0.09] blur-3xl" />
        <div className="relative">
          <p className="le-kicker">Mentorship network</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-extrabold tracking-[-0.05em] leading-none">
            Need Guidance? <span className="le-gradient-text">Find your mentor.</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-sm max-w-2xl leading-relaxed">
            Connect with alumni, industry experts, and Let's Enterprise mentors for practical, personal guidance.
          </p>
        </div>
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse Mentors</TabsTrigger>
          <TabsTrigger value="mine">My Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          <div className="grid md:grid-cols-3 gap-3 mb-6">
            {MENTOR_CATEGORIES.map(({ key, label, description, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(category === key ? 'all' : key)}
                className={`rounded-2xl border p-4 text-left transition-all ${category === key ? 'border-accent/40 bg-accent/[0.09]' : 'border-white/[0.08] bg-card/60 hover:border-white/15'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-accent"><Icon className="h-4 w-4" /></span>
                  <div>
                    <p className="text-sm font-bold">{label}</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : (
            <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMentors?.map((m: { userId: string; user: { id: string; name: string; headline?: string | null; company?: string | null; avatarUrl?: string | null; batchYear?: number | null }; topics: string[]; category: MentorCategory; isAvailable: boolean; capacity: number }) => (
                <div key={m.userId}>
                  <MentorCard {...m} onRequest={setSelectedMentor} />
                </div>
              ))}
              {filteredMentors?.length === 0 && (
                <div className="col-span-3 flex flex-col items-center py-16 text-center text-muted-foreground">
                  <UsersRound className="h-8 w-8 text-accent/50" />
                  <p className="mt-3 text-sm">No mentors are available in this category yet.</p>
                </div>
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
            <DialogTitle>Ask for guidance</DialogTitle>
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
