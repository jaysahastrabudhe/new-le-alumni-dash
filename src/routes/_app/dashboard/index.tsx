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
    <div className="rounded-[1.4rem] bg-card/80 le-surface border border-white/[0.07] p-5 sm:p-6 flex flex-col justify-between min-h-36 hover:border-white/[0.12] transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">{label}</p>
        <span className={`h-9 w-9 rounded-xl grid place-items-center ${accent ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p
        className="font-display text-4xl font-extrabold tracking-[-0.04em] text-foreground mt-3"
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
      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-card/75 le-surface p-3.5 hover:border-accent/20 hover:bg-white/[0.045] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
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
    <div className="space-y-5 max-w-[1440px] mx-auto" ref={containerRef}>
      {/* Bento grid — hero (col-span-2, row-span-2) + 2 stats */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2 gap-4 min-h-[280px]">
        <div className="md:col-span-2 xl:row-span-2 relative overflow-hidden rounded-[1.75rem] bg-card/85 le-surface border border-white/[0.08]">
          <div className="absolute -top-24 right-0 w-72 h-72 rounded-full bg-accent/[0.08] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-12 w-56 h-56 rounded-full bg-primary/[0.07] blur-3xl pointer-events-none" />

          <div className="absolute inset-0 le-page-grid opacity-40" />
          <div className="relative h-full min-h-[320px] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="le-kicker">Your community at a glance</p>
              <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-[-0.05em] mt-4 leading-none">
                Hey, <span className="text-accent">{firstName}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed max-w-xs">
                Welcome back to the people, opportunities, and ideas moving your network forward.
              </p>
            </div>

            <div>
              <p
                className="font-display text-6xl sm:text-7xl font-extrabold tracking-[-0.06em] text-foreground leading-none"
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
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-[1.4rem] bg-card/80 le-surface border border-white/[0.07] p-5 sm:p-6 flex flex-col justify-between min-h-40">
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

        <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
          <div className="rounded-[1.4rem] bg-gradient-to-br from-primary/15 to-card border border-primary/15 p-5 sm:p-6 flex flex-col justify-between hover:border-primary/25 transition-colors min-h-48">
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

          <div className="rounded-[1.4rem] bg-gradient-to-br from-accent/[0.10] to-card border border-accent/15 p-5 sm:p-6 flex flex-col justify-between hover:border-accent/25 transition-colors min-h-48">
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
        <div>
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
