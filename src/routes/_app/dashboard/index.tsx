import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth'
import { Briefcase, CalendarDays, HandshakeIcon, ArrowRight } from 'lucide-react'
import { animate, stagger } from 'animejs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import { useCountUp } from '@/hooks/useAnime'

export const Route = createFileRoute('/_app/dashboard/')({
  component: DashboardPage,
})

type StatTileProps = {
  label: string
  value: number
  icon: React.ElementType
  accent?: boolean
}

function StatTile({ label, value, icon: Icon, accent = false }: StatTileProps) {
  const ref = useCountUp(value)
  return (
    <div className="rounded-2xl bg-card le-surface border border-border/50 p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">{label}</p>
        <Icon className={`h-4 w-4 ${accent ? 'text-accent/50' : 'text-primary/40'}`} />
      </div>
      <p
        className="font-display text-4xl font-extrabold text-foreground mt-3"
        ref={ref as React.RefObject<HTMLParagraphElement>}
      >
        0
      </p>
    </div>
  )
}

type MiniCardProps = {
  id: string
  name: string
  headline?: string | null
  company?: string | null
  batchYear?: number | null
  avatarUrl?: string | null
}

function MiniAlumniCard({ id, name, headline, company, batchYear, avatarUrl }: MiniCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const sub = company ?? headline ?? (batchYear ? `Batch '${String(batchYear).slice(-2)}` : null)
  return (
    <Link to="/directory/$userId" params={{ userId: id }}>
      <div className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card le-surface p-3 hover:border-border hover:bg-secondary/40 transition-all duration-150 cursor-pointer">
        <Avatar className="h-8 w-8 shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{name}</p>
          {sub && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{sub}</p>}
        </div>
      </div>
    </Link>
  )
}

function DashboardPage() {
  const { user } = useAuth()
  const { data: stats } = trpc.user.stats.useQuery()
  const { data: recent } = trpc.user.directory.useQuery({ page: 1, limit: 4 })

  const containerRef = useRef<HTMLDivElement>(null)
  const alumniRef = useCountUp(stats?.alumni ?? 0)
  const mentorsRef = useCountUp(stats?.mentors ?? 0)

  useEffect(() => {
    if (!containerRef.current) return
    animate(Array.from(containerRef.current.children) as HTMLElement[], {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(100),
      duration: 600,
      ease: 'outExpo',
    })
  }, [])

  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-5" ref={containerRef}>
      {/* Bento grid — hero (col-span-2, row-span-2) + 2 stats */}
      <div className="grid grid-cols-3 grid-rows-2 gap-4 min-h-[240px] opacity-0">
        <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl bg-card le-surface border border-border/50">
          <div className="absolute -top-24 right-0 w-72 h-72 rounded-full bg-accent/[0.08] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-12 w-56 h-56 rounded-full bg-primary/[0.07] blur-3xl pointer-events-none" />

          <div className="relative h-full p-7 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-semibold text-accent tracking-[0.2em] uppercase">Let's Enterprise · Pune</p>
              <h1 className="font-display text-4xl font-extrabold mt-2.5 leading-none">
                Hey, <span className="text-accent">{firstName}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed max-w-xs">
                Your network. Your community. Pune's finest BBA alumni, all in one place.
              </p>
            </div>

            <div>
              <p
                className="font-display text-6xl font-extrabold text-foreground leading-none"
                ref={alumniRef as React.RefObject<HTMLParagraphElement>}
              >
                0
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">alumni on platform</p>
            </div>
          </div>
        </div>

        <StatTile label="Open Jobs" value={stats?.jobs ?? 0} icon={Briefcase} />
        <StatTile label="Upcoming Events" value={stats?.events ?? 0} icon={CalendarDays} accent />
      </div>

      {/* Row 2: Mentors + Quick actions */}
      <div className="grid grid-cols-3 gap-4 opacity-0">
        <div className="rounded-2xl bg-card le-surface border border-border/50 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">Active Mentors</p>
            <HandshakeIcon className="h-4 w-4 text-accent/50" />
          </div>
          <p
            className="font-display text-4xl font-extrabold text-foreground mt-3"
            ref={mentorsRef as React.RefObject<HTMLParagraphElement>}
          >
            0
          </p>
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card le-surface border border-border/50 p-5 flex flex-col justify-between hover:border-border transition-colors">
            <div>
              <p className="text-sm font-semibold text-foreground">Find a Mentor</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Connect with alumni who've walked this path. Advice, mock interviews, and more.
              </p>
            </div>
            <Button asChild size="sm" className="mt-4 w-fit gap-1.5">
              <Link to="/mentorship">Browse mentors <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>

          <div className="rounded-2xl bg-card le-surface border border-border/50 p-5 flex flex-col justify-between hover:border-border transition-colors">
            <div>
              <p className="text-sm font-semibold text-foreground">Post a Job</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Share an opening exclusively with LE alumni — your trusted talent pool.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="mt-4 w-fit gap-1.5">
              <Link to="/jobs/new">Post an opening <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Recently joined */}
      {recent && recent.length > 0 && (
        <div className="opacity-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">Recently joined</h2>
            <Link to="/directory" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {recent.slice(0, 4).map((a) => (
              <MiniAlumniCard key={a.id} {...a} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
