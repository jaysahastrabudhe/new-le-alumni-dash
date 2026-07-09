import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Users, Briefcase, CalendarDays, HandshakeIcon } from 'lucide-react'
import { animate, stagger } from 'animejs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCountUp } from '@/hooks/useAnime'

export const Route = createFileRoute('/_app/dashboard/')({
  component: DashboardPage,
})

const STATS = [
  { label: 'Alumni on platform', value: 247, icon: Users, color: 'text-primary' },
  { label: 'Open jobs', value: 34, icon: Briefcase, color: 'text-accent' },
  { label: 'Upcoming events', value: 6, icon: CalendarDays, color: 'text-primary' },
  { label: 'Active mentors', value: 18, icon: HandshakeIcon, color: 'text-accent' },
]

function StatCard({ label, value, icon: Icon, color }: typeof STATS[0]) {
  const numRef = useCountUp(value)
  return (
    <Card>
      <CardContent className="pt-6 flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-secondary">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold font-display" ref={numRef as React.RefObject<HTMLParagraphElement>}>0</p>
          <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardPage() {
  const { user } = useUser()
  const heroRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (heroRef.current) {
      animate(heroRef.current, { opacity: [0, 1], translateY: [20, 0], duration: 600, ease: 'outExpo' })
    }
    if (cardsRef.current) {
      animate(Array.from(cardsRef.current.children) as HTMLElement[], {
        opacity: [0, 1],
        translateY: [32, 0],
        delay: stagger(80, { start: 200 }),
        duration: 500,
        ease: 'outCubic',
      })
    }
  }, [])

  const firstName = user?.firstName ?? 'there'

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <div ref={heroRef} className="opacity-0">
        <h1 className="le-headline text-4xl font-extrabold">
          Hey, <span>{firstName}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the Let's Enterprise Alumni Network — Pune's finest BBA community.
        </p>
      </div>

      {/* Stats grid */}
      <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="opacity-0">
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Find a Mentor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect with alumni who've been in your shoes. Get career guidance, mock interviews, or just a chat.
            </p>
            <Button asChild size="sm">
              <a href="/mentorship">Browse mentors →</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Post a Job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Hiring? Share the opportunity exclusively with LE alumni — your own trusted talent pool.
            </p>
            <Button asChild size="sm" variant="outline">
              <a href="/jobs/new">Post an opening →</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
